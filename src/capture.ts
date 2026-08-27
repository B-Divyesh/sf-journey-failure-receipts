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

async function sensitiveValues(page: CaptureContext['page'], selectors: string[]): Promise<string[]> {
  return page.evaluate(({ form, extra }) => {
    const values = new Set<string>();
    const add = (value: unknown) => {
      if (typeof value === 'string' && value.trim().length >= 3) values.add(value.trim());
    };
    for (const element of document.querySelectorAll(form)) {
      if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement || element instanceof HTMLSelectElement) add(element.value);
      else add(element.textContent);
    }
    for (const selector of extra) {
      for (const element of document.querySelectorAll(selector)) add(element.textContent);
    }
    return [...values].slice(0, 100);
  }, { form: FORM_SELECTOR, extra: selectors });
}

async function scrubbedDom(page: CaptureContext['page'], rootSelector: string, maskSelectors: string[]): Promise<string> {
  return page.locator(rootSelector).first().evaluate((root, { form, extra }) => {
    const clone = root.cloneNode(true) as Element;
    clone.querySelectorAll('script, style, template, noscript').forEach((element) => element.remove());
    for (const element of [clone, ...clone.querySelectorAll('*')]) {
      for (const attribute of [...element.attributes]) {
        if (/^(href|src|action|formaction|poster)$/i.test(attribute.name)) element.setAttribute(attribute.name, '[redacted-url]');
      }
    }
    const redact = (element: Element) => {
      for (const attribute of [...element.attributes]) {
        if (/^(value|srcdoc)$/i.test(attribute.name) || /^(data-.+|aria-label)$/i.test(attribute.name)) element.setAttribute(attribute.name, '[redacted]');
      }
      if (element.matches('input, textarea, select')) element.setAttribute('value', '[redacted]');
      if (!element.matches('input')) element.textContent = '[redacted]';
    };
    clone.querySelectorAll(form).forEach(redact);
    for (const selector of extra) {
      if (clone.matches(selector)) redact(clone);
      clone.querySelectorAll(selector).forEach(redact);
    }
    return clone.outerHTML;
  }, { form: FORM_SELECTOR, extra: maskSelectors });
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
    const buffer = await page.screenshot({
      type: options.screenshot.type,
      quality: options.screenshot.type === 'png' ? undefined : options.screenshot.quality,
      fullPage: false,
      animations: 'disabled',
      caret: 'hide',
      mask: validSelectors.map((selector) => page.locator(selector)),
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
    const raw = await page.locator(options.domSelector).first().ariaSnapshot();
    const aria = truncateUtf8(redactText(raw, secrets), options.maxAriaBytes);
    evidence.aria = aria.value;
    if (aria.truncated) truncated.push('ARIA');
  } catch (error) {
    captureErrors.push(`ARIA snapshot failed for “${options.domSelector}”: ${error instanceof Error ? error.message : String(error)}`);
  }

  return evidence;
}
