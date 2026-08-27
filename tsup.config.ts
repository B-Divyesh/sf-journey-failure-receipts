import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/playwright.ts', 'src/reporter.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  splitting: false,
  sourcemap: true,
  target: 'node20',
  outDir: 'dist/package',
  external: ['@playwright/test', '@playwright/test/reporter'],
});
