import { expect, createReceiptTest } from 'journey-failure-receipts/playwright';

const test = createReceiptTest({
  outputDir: 'receipts',
  maskSelectors: ['[data-private]'],
  domSelector: 'main',
  maxScreenshotBytes: 1,
});

test('redacts short form and configured-selector accessibility content from a packed consumer receipt', async ({ page, receipt }) => {
  await page.route('https://api.example.test/**', async (route) => {
    await route.fulfill({
      status: 200,
      body: '{}',
      headers: { 'access-control-allow-origin': '*' },
    });
  });
  await page.setContent(`
    <main>
      <label for="account">A</label>
      <input id="account" aria-label="Li" aria-description="D" aria-describedby="account-description"
        placeholder="NY" title="CA" value="XY">
      <p id="account-description">OK</p>
      <p data-private aria-label="ID">NO</p>
      <output data-testid="status">before receipt</output>
    </main>
  `);
  await page.evaluate(async () => {
    await Promise.all([
      fetch('https://api.example.test/customers/ALICE_UNIQUE?token=QUERY_SECRET'),
      fetch('https://api.example.test/accounts/customer-slug'),
      fetch('https://api.example.test/orders/abc123'),
    ]);
  });

  const result = await receipt.soft('privacy boundary', async () => {
    await expect(page.getByTestId('status')).toHaveText('expected value', { timeout: 200 });
  });

  expect(result).toBeUndefined();
  await page.getByTestId('status').evaluate((element) => { element.textContent = 'continued after receipt'; });
  await expect(page.getByTestId('status')).toHaveText('continued after receipt');
});
