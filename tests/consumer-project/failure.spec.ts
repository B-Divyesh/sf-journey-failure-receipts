import { expect, createReceiptTest } from 'journey-failure-receipts/playwright';

const test = createReceiptTest({
  outputDir: 'receipts',
  maskSelectors: ['[data-private]'],
  domSelector: 'main',
});

test('redacts accessibility names from a packed consumer receipt', async ({ page, receipt }) => {
  await page.setContent(`
    <main>
      <label for="account">ASSOCIATED_LABEL_UNIQUE_SECRET</label>
      <input id="account" aria-label="ARIALABEL_UNIQUE_SECRET" aria-describedby="account-description" value="FORMVALUE_UNIQUE_SECRET">
      <p id="account-description">ARIA_DESCRIPTION_UNIQUE_SECRET</p>
      <p data-private aria-label="MASKARIA_UNIQUE_SECRET">MASKED_VISIBLE_TEXT</p>
      <output data-testid="status">before receipt</output>
    </main>
  `);

  const result = await receipt.soft('privacy boundary', async () => {
    await expect(page.getByTestId('status')).toHaveText('expected value', { timeout: 200 });
  });

  expect(result).toBeUndefined();
  await page.getByTestId('status').evaluate((element) => { element.textContent = 'continued after receipt'; });
  await expect(page.getByTestId('status')).toHaveText('continued after receipt');
});
