import { createReceiptTest, expect } from 'journey-failure-receipts/playwright';

const test = createReceiptTest({
  outputDir: 'test-results/smoke-receipts',
  maskSelectors: ['[data-private]'],
  domSelector: 'main',
  maxReceipts: 2,
});

test('continues after freezing a failed assertion', async ({ page, receipt }) => {
  await page.route('https://api.example.test/**', (route) => route.fulfill({ status: 200, body: '{}' }));
  await page.setContent(`
    <main>
      <label for="account">ASSOCIATED_LABEL_UNIQUE_SECRET</label>
      <input id="account" aria-label="ARIALABEL_UNIQUE_SECRET" aria-describedby="account-description" value="secret@example.com">
      <p id="account-description">ARIA_DESCRIPTION_UNIQUE_SECRET</p>
      <p data-private aria-label="MASKARIA_UNIQUE_SECRET">MASKED_VISIBLE_TEXT</p>
      <output data-testid="cart-count">0</output>
    </main>
  `);
  await page.evaluate(() => {
    console.error('checkout failed for secret@example.com password=hunter2');
    return fetch('https://api.example.test/cart/99887766?token=hunter2');
  });

  await receipt.soft('Cart count increments', async () => {
    await expect(page.getByTestId('cart-count')).toHaveText('1', { timeout: 200 });
  });

  await page.getByTestId('cart-count').evaluate((node) => { node.textContent = 'journey-continued'; });
  expect(await page.getByTestId('cart-count').textContent()).toBe('journey-continued');
  process.stdout.write('SMOKE_CONTINUED_AFTER_RECEIPT\n');
});
