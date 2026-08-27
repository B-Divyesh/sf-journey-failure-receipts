import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: '.',
  testMatch: 'failure.spec.ts',
  workers: 1,
  retries: 0,
  timeout: 15_000,
  outputDir: '../../test-results/smoke-output',
  reporter: [['line'], ['../../dist/package/reporter.cjs']],
  use: { browserName: 'chromium', viewport: { width: 900, height: 700 } },
});
