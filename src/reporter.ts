import type { Reporter, TestCase, TestResult } from '@playwright/test/reporter';

export default class JourneyReceiptReporter implements Reporter {
  onTestEnd(test: TestCase, result: TestResult): void {
    for (const attachment of result.attachments) {
      if (attachment.name.startsWith('journey-receipt:') && attachment.path) {
        process.stdout.write(`\n[journey receipt] ${test.title}: ${attachment.path}\n`);
      }
    }
  }
}
