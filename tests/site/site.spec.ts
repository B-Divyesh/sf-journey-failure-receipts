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
  await expect(page).toHaveTitle('Journey Failure Receipts — capture failed assertions');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.locator('main')).toHaveCount(1); await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.getByRole('link', { name: 'Try it with sample data' }).first()).toHaveAttribute('href', '/demo/?demo=1');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /journey-failure-receipts/);
  await expect(page.locator('meta[property="og:image"]')).toHaveCount(1); await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveCount(1);
  await expect(page.locator('img:not([alt])')).toHaveCount(0); await expectNoSeriousAxe(page); expect(errors).toEqual([]);
});

test('every route exposes complete route-specific social metadata', async ({ page }) => {
  const routes = [
    ['/', 'Journey Failure Receipts — capture failed assertions', 'https://journey-failure-receipts.sociobot.in/'],
    ['/demo/', 'Demo — Journey Failure Receipts', 'https://journey-failure-receipts.sociobot.in/demo/'],
    ['/privacy/', 'Privacy — Journey Failure Receipts', 'https://journey-failure-receipts.sociobot.in/privacy/'],
    ['/terms/', 'Terms — Journey Failure Receipts', 'https://journey-failure-receipts.sociobot.in/terms/'],
    ['/404.html', 'Page not found — Journey Failure Receipts', 'https://journey-failure-receipts.sociobot.in/404.html'],
  ];
  for (const [path, title, canonical] of routes) {
    await page.goto(path);
    await expect(page).toHaveTitle(title);
    expect((await page.title()).length).toBeLessThanOrEqual(60);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /\S/);
    expect((await page.locator('meta[name="description"]').getAttribute('content'))!.length).toBeLessThanOrEqual(155);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', canonical);
    await expect(page.locator('meta[property="og:type"]')).toHaveAttribute('content', 'website');
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', title);
    await expect(page.locator('meta[property="og:description"]')).toHaveAttribute('content', /\S/);
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', 'https://journey-failure-receipts.sociobot.in/share-card.svg');
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content', canonical);
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute('content', 'summary_large_image');
    await expect(page.locator('meta[name="twitter:title"]')).toHaveAttribute('content', title);
    await expect(page.locator('meta[name="twitter:description"]')).toHaveAttribute('content', /\S/);
    await expect(page.locator('meta[name="twitter:image"]')).toHaveAttribute('content', 'https://journey-failure-receipts.sociobot.in/share-card.svg');
    await expect(page.locator('link[rel="icon"]')).toHaveCount(1);
    await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveCount(1);
    await expect(page.locator('main')).toHaveCount(1);
    await expect(page.locator('h1')).toHaveCount(1);
    await expectNoSeriousAxe(page);
  }
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
  await page.getByLabel('Assertion label').fill('Discard this sample');
  await page.getByRole('link', { name: 'Start for real' }).click();
  await expect(page).toHaveURL('http://127.0.0.1:4173/');
  expect(await page.evaluate(() => localStorage.getItem('demo:journey-failure-receipts:sample'))).toBeNull();
  expect(await page.evaluate(() => localStorage.getItem('journey-failure-receipts:real'))).toBe('REAL_DATA_MUST_NOT_CHANGE');
});

test('@claim:demo-no-upload keeps the documentation and demo free of tracking requests and cookies', async ({ page, context }) => {
  const requests: Array<{ url: string; method: string }> = [];
  page.on('request', (request) => requests.push({ url: request.url(), method: request.method() }));
  await page.goto('/');
  await page.getByRole('link', { name: 'Try it with sample data' }).first().click();
  await page.getByLabel('Console message').fill('A local sample message');
  await page.getByRole('button', { name: 'Create sample receipt' }).click();
  expect(requests.length).toBeGreaterThan(0);
  expect(requests.every(({ url, method }) => new URL(url).origin === 'http://127.0.0.1:4173' && method === 'GET')).toBe(true);
  expect(await context.cookies()).toEqual([]);
  const scripts = await page.locator('script[src]').evaluateAll((nodes) => nodes.map((node) => (node as HTMLScriptElement).src));
  const origin = new URL(page.url()).origin;
  expect(scripts.every((url) => new URL(url).origin === origin)).toBe(true);
});

test('@claim:offline-demo works offline after the first visit', async ({ browser }) => {
  const context = await browser.newContext();
  const page = await context.newPage();
  try {
    await page.goto('/demo/?demo=1'); await page.evaluate(() => navigator.serviceWorker.ready); await page.reload();
    await context.setOffline(true); await page.reload();
    await expect(page.getByRole('heading', { name: 'Create a sample failure receipt.' })).toBeVisible();
    await page.getByLabel('Assertion label').fill('Offline address check');
    await page.getByRole('button', { name: 'Create sample receipt' }).click();
    await expect(page.getByRole('heading', { name: 'Offline address check' })).toBeVisible();
    await expect(page.locator('#offline')).toBeVisible();
  } finally {
    await context.setOffline(false);
    await context.close();
  }
});

test('demo routing, focus, 404, legal pages, and mobile keyboard access work', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Try it with sample data' }).first().click();
  await expect(page).toHaveURL(/\/demo\/\?demo=1/); await expect(page.getByText('Demo — sample data, nothing is saved')).toBeVisible();
  await expect(page.getByRole('heading', { level: 1 })).toBeFocused();
  await page.goBack(); await expect(page).toHaveURL('http://127.0.0.1:4173/');
  await page.goForward(); await expect(page).toHaveURL(/\/demo\/\?demo=1/);
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
