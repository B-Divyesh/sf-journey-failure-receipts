import { defineConfig } from '@playwright/test';
import { resolve } from 'node:path';

export default defineConfig({
  testDir: '.',
  testMatch: 'site.spec.ts',
  workers: 1,
  retries: 0,
  timeout: 30_000,
  reporter: 'line',
  use: {
    browserName: 'chromium',
    baseURL: 'http://127.0.0.1:4173',
  },
  webServer: {
    command: 'npm run build:site && npx vite preview --host 127.0.0.1 --port 4173',
    cwd: resolve(import.meta.dirname, '../..'),
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: false,
    timeout: 60_000,
  },
});
