import { expect, test } from '@playwright/test';
import { AxeBuilder } from '@axe-core/playwright';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { resolve } from 'node:path';

async function expectNoSeriousAxe(page: import('@playwright/test').Page): Promise<void> {
  const results = await new AxeBuilder({ page }).analyze();
  const serious = results.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact ?? ''));
  expect(serious, serious.map((item) => `${item.id}: ${item.help}`).join('\n')).toEqual([]);
}

test('landing page has a plain first screen and complete metadata', async ({ page }) => {
  const errors: string[] = []; page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  await page.goto('/');
  await expect(page).toHaveTitle('Journey Failure Receipts — capture failed Playwright assertions');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.locator('main')).toHaveCount(1); await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.getByRole('link', { name: 'Try it with sample data' }).first()).toHaveAttribute('href', '/demo/?demo=1');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /journey-failure-receipts/);
  await expect(page.locator('meta[property="og:image"]')).toHaveCount(1); await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveCount(1);
  await expect(page.locator('img:not([alt])')).toHaveCount(0); await expectNoSeriousAxe(page); expect(errors).toEqual([]);
});

test('@claim:sample-receipt creates an editable sample receipt', async ({ page }) => {
  await page.goto('/demo/?demo=1');
  await page.getByLabel('Assertion label').fill('Address accepts suite number');
  await page.getByRole('button', { name: 'Create sample receipt' }).click();
  await expect(page.getByRole('heading', { name: 'Address accepts suite number' })).toBeVisible();
  await expect(page.getByRole('status')).toContainText('Sample receipt updated');
});

test('@claim:sample-redaction masks the private sample field', async ({ page }) => {
  await page.goto('/demo/?demo=1');
  await page.getByLabel('Customer reference').fill('DEMO_SECRET_7284');
  await page.getByRole('button', { name: 'Create sample receipt' }).click();
  await expect(page.locator('#receipt-private')).toHaveText('[redacted]');
  await expect(page.locator('.demo-receipt')).not.toContainText('DEMO_SECRET_7284');
});

test('@claim:demo-reset-isolation keeps sample state in demo storage and resets it', async ({ page }) => {
  await page.addInitScript(() => { const current = window as typeof window & { demoReads?: string[] }; const original = Storage.prototype.getItem; current.demoReads = []; Storage.prototype.getItem = function(key: string) { current.demoReads!.push(key); return original.call(this, key); }; });
  await page.goto('/demo/?demo=1');
  await page.evaluate(() => localStorage.setItem('journey-failure-receipts:real', 'REAL_DATA_MUST_NOT_CHANGE'));
  await page.getByLabel('Assertion label').fill('Changed demo value');
  await expect.poll(() => page.evaluate(() => localStorage.getItem('demo:journey-failure-receipts:sample'))).toContain('Changed demo value');
  await page.getByRole('button', { name: 'Reset demo' }).click();
  await expect(page.getByLabel('Assertion label')).toHaveValue('Cart count increments');
  await expect(page.locator('.demo-banner')).toContainText('Demo — sample data, nothing is saved');
  expect(await page.evaluate(() => { const current = window as typeof window & { demoReads?: string[] }; return current.demoReads?.every((key: string) => key === 'demo:journey-failure-receipts:sample'); })).toBe(true);
  expect(await page.evaluate(() => localStorage.getItem('journey-failure-receipts:real'))).toBe('REAL_DATA_MUST_NOT_CHANGE');
  expect(await page.evaluate(() => localStorage.getItem('demo:journey-failure-receipts:sample'))).toBeNull();
});

test('@claim:demo-no-upload makes only same-origin requests', async ({ page }) => {
  const requests: string[] = []; page.on('request', (request) => requests.push(request.url()));
  await page.goto('/demo/?demo=1'); await page.getByLabel('Console message').fill('A local sample message'); await page.getByRole('button', { name: 'Create sample receipt' }).click();
  expect(requests.every((url) => new URL(url).origin === 'http://127.0.0.1:4173')).toBe(true);
});

test('@claim:offline-demo works offline after the first visit', async ({ page, context }) => {
  await page.goto('/demo/?demo=1'); await page.evaluate(() => navigator.serviceWorker.ready); await page.reload();
  await context.setOffline(true); await page.reload();
  await expect(page.getByRole('heading', { name: 'Create a sample failure receipt.' })).toBeVisible();
  await expect(page.locator('#offline')).toBeVisible(); await context.setOffline(false);
});

test('demo routing, focus, 404, legal pages, and mobile keyboard access work', async ({ page }) => {
  await page.goto('/?demo=1'); await expect(page).toHaveURL(/\/demo\/\?demo=1/); await expect(page.getByText('Demo — sample data, nothing is saved')).toBeVisible();
  await expect(page.getByRole('heading', { level: 1 })).toBeFocused();
  for (const path of ['/privacy/', '/terms/', '/404.html']) { await page.goto(path); await expect(page.locator('main')).toHaveCount(1); await expect(page.locator('h1')).toHaveCount(1); await expect(page.getByRole('link', { name: 'Demo' })).toBeVisible(); }
  await page.setViewportSize({ width: 390, height: 844 }); await page.goto('/');
  const dimensions = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth })); expect(dimensions.scroll).toBeLessThanOrEqual(dimensions.client);
  const installation = page.getByLabel(/Installation example/); await installation.focus(); await expect(installation).toBeFocused(); await expectNoSeriousAxe(page);
});

test('built assets, cache policy, routes, and service worker stay within the static budget', () => {
  const root = resolve(import.meta.dirname, '../../dist/site'); const assets = readdirSync(resolve(root, 'assets'));
  const size = (suffix: string) => assets.filter((file) => file.endsWith(suffix)).reduce((sum, file) => sum + statSync(resolve(root, 'assets', file)).size, 0);
  expect(size('.js')).toBeLessThanOrEqual(200 * 1024); expect(size('.css')).toBeLessThanOrEqual(50 * 1024); expect(statSync(resolve(root, 'blueprint-journey.webp')).size).toBeLessThanOrEqual(300 * 1024);
  expect(readFileSync(resolve(root, 'sitemap.xml'), 'utf8')).toContain('/demo/');
  expect(readFileSync(resolve(root, 'staticwebapp.config.json'), 'utf8')).toContain('responseOverrides');
  const worker = readFileSync(resolve(root, 'sw.js'), 'utf8'); expect(worker).toContain("'/demo/'"); expect(worker).toContain('self.skipWaiting()'); expect(worker).toContain('self.clients.claim()');
});
