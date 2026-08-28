import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: '.',
  testMatch: 'failure.spec.ts',
  workers: 1,
  retries: 0,
  timeout: 15_000,
  reporter: 'line',
  use: { browserName: 'chromium', viewport: { width: 900, height: 700 } },
});
