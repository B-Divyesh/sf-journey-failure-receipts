import { expect, test as base } from '@playwright/test';
import type { ConsoleMessage, Request, TestInfo } from '@playwright/test';
import { captureEvidence } from './capture.js';
import { writeReceipt } from './receipt.js';
import { redactText } from './sanitize.js';
import type { ConsoleEvidence, NetworkEvidence, ReceiptController, ReceiptOptions, ResolvedReceiptOptions } from './types.js';

function positive(value: number | undefined, fallback: number): number {
  return Number.isFinite(value) && value! > 0 ? Math.floor(value!) : fallback;
}

export function resolveOptions(options: ReceiptOptions = {}): ResolvedReceiptOptions {
  return {
    outputDir: options.outputDir ?? 'test-results/journey-receipts',
    maskSelectors: [...new Set(options.maskSelectors ?? [])],
    domSelector: options.domSelector ?? 'body',
    maxReceipts: positive(options.maxReceipts, 5),
    maxNetworkEntries: positive(options.maxNetworkEntries, 40),
    maxConsoleEntries: positive(options.maxConsoleEntries, 20),
    maxDomBytes: positive(options.maxDomBytes, 80 * 1024),
    maxAriaBytes: positive(options.maxAriaBytes, 40 * 1024),
    maxScreenshotBytes: positive(options.maxScreenshotBytes, 1_500_000),
    screenshot: {
      type: options.screenshot?.type ?? 'jpeg',
      quality: Math.min(100, Math.max(1, options.screenshot?.quality ?? 72)),
    },
  };
}

function consoleEntry(message: ConsoleMessage): ConsoleEvidence {
  const location = message.location();
  return {
    type: message.type(),
    text: message.text(),
    location: location.url || undefined,
  };
}

function createController(
  page: Parameters<typeof captureEvidence>[0]['page'],
  testInfo: TestInfo,
  options: ResolvedReceiptOptions,
  consoleEntries: ConsoleEvidence[],
  networkEntries: NetworkEvidence[],
): ReceiptController {
  let count = 0;
  return {
    async soft<T>(label: string, assertion: () => T | Promise<T>): Promise<T | undefined> {
      try {
        return await assertion();
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        let failureMessage = redactText(message);
        if (count < options.maxReceipts) {
          count += 1;
          const id = `${Date.now().toString(36)}-${process.pid.toString(36)}-${testInfo.retry}-${count}`;
          try {
            const evidence = await captureEvidence({
              page,
              label,
              error,
              testTitle: testInfo.titlePath.join(' › '),
              projectName: testInfo.project.name,
              id,
              console: consoleEntries,
              network: networkEntries,
              options,
            });
            failureMessage = evidence.error;
            const receipt = await writeReceipt(evidence, options);
            await testInfo.attach(`journey-receipt: ${label}`, { path: receipt.path, contentType: 'text/html' });
          } catch (captureError) {
            await testInfo.attach(`journey-receipt capture error: ${label}`, {
              body: Buffer.from(captureError instanceof Error ? captureError.stack ?? captureError.message : String(captureError)),
              contentType: 'text/plain',
            });
          }
        }
        expect.soft(false, `${label}\n${failureMessage}`).toBe(true);
        return undefined;
      }
    },
  };
}

export function createReceiptTest(options: ReceiptOptions = {}) {
  const resolved = resolveOptions(options);
  return base.extend<{ receipt: ReceiptController }>({
    receipt: async ({ page }, use, testInfo) => {
      const consoleEntries: ConsoleEvidence[] = [];
      const networkEntries: NetworkEvidence[] = [];
      const starts = new WeakMap<Request, number>();
      const onConsole = (message: ConsoleMessage) => {
        if (message.type() === 'error' || message.type() === 'warning') {
          consoleEntries.push(consoleEntry(message));
          if (consoleEntries.length > resolved.maxConsoleEntries * 2) consoleEntries.shift();
        }
      };
      const onRequest = (request: Request) => starts.set(request, Date.now());
      const onResponse = (response: Awaited<ReturnType<Request['response']>> & {}) => {
        if (!response) return;
        const request = response.request();
        networkEntries.push({
          method: request.method(),
          resourceType: request.resourceType(),
          url: request.url(),
          status: response.status(),
          durationMs: starts.has(request) ? Date.now() - starts.get(request)! : undefined,
        });
        if (networkEntries.length > resolved.maxNetworkEntries * 2) networkEntries.shift();
      };
      const onRequestFailed = (request: Request) => {
        networkEntries.push({
          method: request.method(), resourceType: request.resourceType(), url: request.url(), status: 'failed',
          durationMs: starts.has(request) ? Date.now() - starts.get(request)! : undefined,
        });
      };
      page.on('console', onConsole);
      page.on('request', onRequest);
      page.on('response', onResponse);
      page.on('requestfailed', onRequestFailed);
      await use(createController(page, testInfo, resolved, consoleEntries, networkEntries));
      page.off('console', onConsole);
      page.off('request', onRequest);
      page.off('response', onResponse);
      page.off('requestfailed', onRequestFailed);
    },
  });
}

export const test = createReceiptTest();
export { expect };
export type { ReceiptController, ReceiptOptions } from './types.js';
