import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readdirSync, statSync } from 'node:fs';
import { resolve } from 'node:path';

test('landing page is accessible and the keyboard demo works', async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); });
  await page.goto('/');
  await expect(page).toHaveTitle(/Journey Failure Receipts/);
  await expect(page.locator('main')).toHaveCount(1);
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.locator('img:not([alt])')).toHaveCount(0);

  const selected = page.getByRole('tab', { selected: true });
  await selected.focus();
  await page.keyboard.press('ArrowDown');
  await expect(page.getByRole('tab', { name: /Journey continued/ })).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByRole('status').last()).toContainText('Checkpoint 3 of 3');

  const results = await new AxeBuilder({ page }).analyze();
  const serious = results.violations.filter((violation) => violation.impact === 'serious' || violation.impact === 'critical');
  expect(serious, serious.map((item) => `${item.id}: ${item.help}`).join('\n')).toEqual([]);
  expect(consoleErrors).toEqual([]);
});

test('390px layout has no horizontal clipping', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const dimensions = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth }));
  expect(dimensions.scroll).toBeLessThanOrEqual(dimensions.client);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.getByRole('link', { name: /Add to Playwright/ })).toBeVisible();
});

test('legal pages have a single main heading', async ({ page }) => {
  for (const path of ['/privacy/', '/terms/']) {
    await page.goto(path);
    await expect(page.locator('main')).toHaveCount(1);
    await expect(page.locator('h1')).toHaveCount(1);
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact ?? ''))).toEqual([]);
  }
});

test('built assets stay inside the static performance budget', () => {
  const root = resolve(import.meta.dirname, '../../dist/site');
  const assets = readdirSync(resolve(root, 'assets'));
  const jsBytes = assets.filter((file) => file.endsWith('.js')).reduce((sum, file) => sum + statSync(resolve(root, 'assets', file)).size, 0);
  const cssBytes = assets.filter((file) => file.endsWith('.css')).reduce((sum, file) => sum + statSync(resolve(root, 'assets', file)).size, 0);
  const heroBytes = statSync(resolve(root, 'blueprint-journey.webp')).size;
  expect(jsBytes).toBeLessThanOrEqual(200 * 1024);
  expect(cssBytes).toBeLessThanOrEqual(50 * 1024);
  expect(heroBytes).toBeLessThanOrEqual(300 * 1024);
});
