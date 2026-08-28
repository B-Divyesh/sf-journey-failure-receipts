import type { CaptureContext, ReceiptEvidence } from './types.js';
import { redactText, safeUrl, truncateUtf8 } from './sanitize.js';

const FORM_SELECTOR = 'input, textarea, select, [contenteditable]';

async function validMaskSelectors(page: CaptureContext['page'], selectors: string[], errors: string[]): Promise<string[]> {
  const valid = [FORM_SELECTOR];
  for (const selector of selectors) {
    try {
      await page.locator(selector).count();
      valid.push(selector);
    } catch {
      errors.push(`Mask selector was skipped because it is invalid: ${selector}`);
    }
  }
  return valid;
}

/**
 * Collect every string that can become an accessible name or description for
 * private content. Playwright's ariaSnapshot() is taken from the live page,
 * rather than the scrubbed DOM clone, so form values alone are not enough:
 * labels and ARIA attributes can contain customer data too.
 */
async function sensitiveValues(page: CaptureContext['page'], selectors: string[]): Promise<string[]> {
  return page.evaluate(({ form, extra }) => {
    const values = new Set<string>();
    const add = (value: unknown) => {
      if (typeof value !== 'string') return;
      const trimmed = value.trim();
      if (!trimmed) return;
      values.add(trimmed);
      values.add(trimmed.replace(/\s+/g, ' '));
    };

    const addReferencedText = (element: Element, attribute: 'aria-labelledby' | 'aria-describedby') => {
      for (const id of (element.getAttribute(attribute) ?? '').split(/\s+/)) {
        if (id) add(document.getElementById(id)?.textContent);
      }
    };

    const addAccessibleText = (element: Element) => {
      // These are the attributes browsers use directly or indirectly when
      // calculating the name/description exposed by ariaSnapshot().
      for (const attribute of ['aria-label', 'aria-description', 'title', 'placeholder', 'alt']) add(element.getAttribute(attribute));
      addReferencedText(element, 'aria-labelledby');
      addReferencedText(element, 'aria-describedby');
      if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement || element instanceof HTMLSelectElement) {
        add(element.value);
        for (const label of element.labels ?? []) add(label.textContent);
      } else {
        add(element.textContent);
      }
    };

    for (const element of document.querySelectorAll(form)) {
      addAccessibleText(element);
    }
    for (const selector of extra) {
      for (const element of document.querySelectorAll(selector)) addAccessibleText(element);
    }
    return [...values];
  }, { form: FORM_SELECTOR, extra: selectors });
}

async function screenshotMasks(page: CaptureContext['page'], selectors: string[]): Promise<ReturnType<CaptureContext['page']['locator']>[]> {
  const referencedIds = await page.evaluate(({ form, extra }) => {
    const ids = new Set<string>();
    const sensitive = new Set<Element>(document.querySelectorAll(form));
    for (const selector of extra) document.querySelectorAll(selector).forEach((element) => sensitive.add(element));
    for (const element of sensitive) {
      for (const attribute of ['aria-labelledby', 'aria-describedby']) {
        for (const id of (element.getAttribute(attribute) ?? '').split(/\s+/)) if (id) ids.add(id);
      }
    }
    return [...ids];
  }, { form: FORM_SELECTOR, extra: selectors });

  // Labels and ID-referenced descriptions can be visible customer data even
  // though the form control itself is masked. Mask them in pixels as well as
  // redacting them from textual evidence.
  return [
    page.locator(FORM_SELECTOR),
    page.locator('label'),
    ...selectors.map((selector) => page.locator(selector)),
    ...referencedIds.map((id) => page.locator(`[id=${JSON.stringify(id)}]`)),
  ];
}

type CloneOperation = {
  form: string;
  extra: string[];
  mode: 'serialize' | 'mount';
  snapshotId?: string;
};

/**
 * This function is deliberately self-contained because Playwright serializes it
 * into the inspected browser. It builds evidence from a clone, never by
 * mutating the customer's page. In particular, it assigns a redacted ARIA
 * name to each sensitive node: that prevents a live accessible-name lookup
 * from following an original label or description outside the captured root.
 */
function scrubClone(root: Element, { form, extra, mode, snapshotId }: CloneOperation): string {
  let clone = root.cloneNode(true) as Element;
  if (mode === 'mount' && clone instanceof HTMLBodyElement) {
    const wrapper = document.createElement('div');
    for (const child of [...clone.childNodes]) wrapper.append(child);
    clone = wrapper;
  }

  clone.querySelectorAll('script, style, template, noscript').forEach((element) => element.remove());
  for (const element of [clone, ...clone.querySelectorAll('*')]) {
    for (const attribute of [...element.attributes]) {
      if (/^(href|src|action|formaction|poster)$/i.test(attribute.name)) element.setAttribute(attribute.name, '[redacted-url]');
    }
  }

  const redact = (element: Element) => {
    for (const attribute of [...element.attributes]) {
      if (/^(value|srcdoc|placeholder|title|alt|aria-label|aria-description|aria-labelledby|aria-describedby)$/i.test(attribute.name) || /^(data-.+)$/i.test(attribute.name)) {
        element.setAttribute(attribute.name, '[redacted]');
      }
    }
    // Do not let an accessibility snapshot resolve the original associated
    // label or an ID target. A direct replacement name is both safe and makes
    // the redaction visible to receipt readers.
    element.setAttribute('aria-label', '[redacted]');
    element.removeAttribute('aria-labelledby');
    element.removeAttribute('aria-describedby');
    if (element.matches('input, textarea, select, [contenteditable]')) element.setAttribute('value', '[redacted]');
    if (!element.matches('input')) element.textContent = '[redacted]';
  };

  const nodes = [clone, ...clone.querySelectorAll('*')];
  const sensitive = new Set<Element>();
  for (const element of nodes) if (element.matches(form)) sensitive.add(element);
  for (const selector of extra) {
    for (const element of nodes) if (element.matches(selector)) sensitive.add(element);
  }
  // A form control's visible label and ID-referenced name/description are
  // part of the same private field. Redact these nodes in the clone before
  // serializing, instead of relying solely on post-serialization matching.
  for (const element of sensitive) {
    for (const attribute of ['aria-labelledby', 'aria-describedby']) {
      for (const id of (element.getAttribute(attribute) ?? '').split(/\s+/)) {
        if (!id) continue;
        for (const candidate of nodes) if (candidate.getAttribute('id') === id) sensitive.add(candidate);
      }
    }
    if (element.matches('input, textarea, select')) {
      const id = element.getAttribute('id');
      for (const label of nodes) {
        if (label.matches('label') && ((id !== null && label.getAttribute('for') === id) || label.contains(element))) sensitive.add(label);
      }
    }
  }
  sensitive.forEach(redact);

  if (mode === 'serialize') return clone.outerHTML;

  const host = document.createElement('div');
  host.setAttribute('data-journey-receipt-snapshot', snapshotId!);
  // The clone must participate in the accessibility tree for ariaSnapshot(),
  // but is outside the visual viewport and exists only for this one call.
  Object.assign(host.style, { position: 'fixed', left: '-100000px', top: '0', width: '1px', height: '1px', overflow: 'hidden' });
  host.append(clone);
  document.body.append(host);
  return snapshotId!;
}

async function scrubbedDom(page: CaptureContext['page'], rootSelector: string, maskSelectors: string[]): Promise<string> {
  const operation: CloneOperation = {
    form: FORM_SELECTOR,
    extra: maskSelectors,
    mode: 'serialize',
  };
  return page.locator(rootSelector).first().evaluate(scrubClone, operation);
}

async function scrubbedAria(page: CaptureContext['page'], rootSelector: string, maskSelectors: string[]): Promise<string> {
  const snapshotId = `journey-receipt-snapshot-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
  const operation: CloneOperation = {
    form: FORM_SELECTOR,
    extra: maskSelectors,
    mode: 'mount',
    snapshotId,
  };
  await page.locator(rootSelector).first().evaluate(scrubClone, operation);
  const host = page.locator(`[data-journey-receipt-snapshot=${JSON.stringify(snapshotId)}]`);
  try {
    return await host.locator(':scope > *').ariaSnapshot();
  } finally {
    await host.evaluate((element) => element.remove()).catch(() => undefined);
  }
}

export async function captureEvidence(context: CaptureContext): Promise<ReceiptEvidence> {
  const { page, options } = context;
  const captureErrors: string[] = [];
  const truncated: string[] = [];
  const evidence: ReceiptEvidence = {
    id: context.id,
    label: context.label,
    testTitle: context.testTitle,
    projectName: context.projectName,
    capturedAt: new Date().toISOString(),
    pageUrl: page.isClosed() ? '[page closed]' : safeUrl(page.url()),
    error: context.error instanceof Error ? `${context.error.name}: ${context.error.message}` : String(context.error),
    console: [],
    network: [],
    captureErrors,
    truncated,
  };

  if (page.isClosed()) {
    captureErrors.push('The page was already closed; visual and DOM evidence could not be captured.');
    evidence.error = redactText(evidence.error);
    return evidence;
  }

  const validSelectors = await validMaskSelectors(page, options.maskSelectors, captureErrors);
  let secrets: string[] = [];
  try {
    secrets = await sensitiveValues(page, validSelectors.slice(1));
  } catch (error) {
    captureErrors.push(`Sensitive-value scan failed: ${error instanceof Error ? error.message : String(error)}`);
  }

  evidence.error = redactText(evidence.error, secrets);
  evidence.console = context.console.slice(-options.maxConsoleEntries).map((entry) => ({
    ...entry,
    text: redactText(entry.text, secrets),
    location: entry.location ? safeUrl(entry.location) : undefined,
  }));
  evidence.network = context.network.slice(-options.maxNetworkEntries).map((entry) => ({ ...entry, url: safeUrl(entry.url) }));

  try {
    const masks = await screenshotMasks(page, validSelectors.slice(1));
    const buffer = await page.screenshot({
      type: options.screenshot.type,
      quality: options.screenshot.type === 'png' ? undefined : options.screenshot.quality,
      fullPage: false,
      animations: 'disabled',
      caret: 'hide',
      mask: masks,
      maskColor: '#102A43',
    });
    if (buffer.byteLength <= options.maxScreenshotBytes) {
      evidence.screenshot = {
        mime: `image/${options.screenshot.type}`,
        base64: buffer.toString('base64'),
        bytes: buffer.byteLength,
      };
    } else {
      truncated.push(`screenshot (${buffer.byteLength} bytes exceeded ${options.maxScreenshotBytes})`);
    }
  } catch (error) {
    captureErrors.push(`Screenshot failed: ${error instanceof Error ? error.message : String(error)}`);
  }

  try {
    const raw = await scrubbedDom(page, options.domSelector, validSelectors.slice(1));
    const dom = truncateUtf8(redactText(raw, secrets), options.maxDomBytes);
    evidence.dom = dom.value;
    if (dom.truncated) truncated.push('DOM');
  } catch (error) {
    captureErrors.push(`DOM snapshot failed for “${options.domSelector}”: ${error instanceof Error ? error.message : String(error)}`);
  }

  try {
    const raw = await scrubbedAria(page, options.domSelector, validSelectors.slice(1));
    const aria = truncateUtf8(redactText(raw, secrets), options.maxAriaBytes);
    evidence.aria = aria.value;
    if (aria.truncated) truncated.push('ARIA');
  } catch (error) {
    captureErrors.push(`ARIA snapshot failed for “${options.domSelector}”: ${error instanceof Error ? error.message : String(error)}`);
  }

  return evidence;
}
