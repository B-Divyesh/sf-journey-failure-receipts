import type { Page } from '@playwright/test';

export interface ReceiptScreenshotOptions {
  type?: 'png' | 'jpeg';
  quality?: number;
}

export interface ReceiptOptions {
  /** Directory for HTML receipts. Relative paths resolve from process.cwd(). */
  outputDir?: string;
  /** Additional Playwright selectors whose matching content must be redacted. */
  maskSelectors?: string[];
  /** Subtree captured as scrubbed DOM and ARIA text. */
  domSelector?: string;
  maxReceipts?: number;
  maxNetworkEntries?: number;
  maxConsoleEntries?: number;
  maxDomBytes?: number;
  maxAriaBytes?: number;
  maxScreenshotBytes?: number;
  screenshot?: ReceiptScreenshotOptions;
}

export interface ResolvedReceiptOptions {
  outputDir: string;
  maskSelectors: string[];
  domSelector: string;
  maxReceipts: number;
  maxNetworkEntries: number;
  maxConsoleEntries: number;
  maxDomBytes: number;
  maxAriaBytes: number;
  maxScreenshotBytes: number;
  screenshot: Required<ReceiptScreenshotOptions>;
}

export interface NetworkEvidence {
  method: string;
  resourceType: string;
  url: string;
  status: number | 'failed';
  durationMs?: number;
}

export interface ConsoleEvidence {
  type: string;
  text: string;
  location?: string;
}

export interface ReceiptEvidence {
  id: string;
  label: string;
  testTitle: string;
  projectName: string;
  capturedAt: string;
  pageUrl: string;
  error: string;
  screenshot?: { mime: string; base64: string; bytes: number };
  dom?: string;
  aria?: string;
  console: ConsoleEvidence[];
  network: NetworkEvidence[];
  captureErrors: string[];
  truncated: string[];
}

export interface ReceiptController {
  /** Capture evidence on failure, register a Playwright soft failure, and continue. */
  soft<T>(label: string, assertion: () => T | Promise<T>): Promise<T | undefined>;
}

export interface CaptureContext {
  page: Page;
  label: string;
  error: unknown;
  testTitle: string;
  projectName: string;
  id: string;
  console: ConsoleEvidence[];
  network: NetworkEvidence[];
  options: ResolvedReceiptOptions;
}
