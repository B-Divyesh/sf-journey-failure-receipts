# Journey Failure Receipts

Capture each failed Playwright assertion as a local HTML receipt.

For test teams, the receipt keeps the page evidence from a soft assertion before later steps change the flow. The wrapped assertion saves a receipt and the test flow continues. See every tested claim in [`.factory/claims.json`](.factory/claims.json).

## Try the sample

Open `https://journey-failure-receipts.sociobot.in/demo/?demo=1`. Change the bundled checkout sample and create an editable receipt. The demo state uses a `demo:` browser-storage key. **Reset demo** restores the bundled values.

## Install

```sh
npm install --save-dev journey-failure-receipts @playwright/test
```

Create a receipt test fixture:

```ts
// fixtures.ts
import { createReceiptTest, expect } from 'journey-failure-receipts/playwright';

export const test = createReceiptTest({
  outputDir: 'test-results/journey-receipts',
  maskSelectors: ['[data-private]', '.account-number'],
  domSelector: 'main',
  maxReceipts: 5,
});
export { expect };
```

Wrap the soft assertion that needs a receipt:

```ts
import { test, expect } from './fixtures';

test('customer can add an item', async ({ page, receipt }) => {
  await page.goto('/products/field-notes');
  await page.getByRole('button', { name: 'Add to cart' }).click();

  await receipt.soft('Cart count increments', async () => {
    await expect(page.getByTestId('cart-count')).toHaveText('1');
  });

  await page.getByRole('link', { name: 'Checkout' }).click();
});
```

Use `expect`, not `expect.soft`, inside the callback. Optional CI output:

```ts
// playwright.config.ts
export default {
  reporter: [['list'], ['journey-failure-receipts/reporter']],
};
```

## Privacy controls

Use `maskSelectors` for private content outside form fields. Screenshots mask form fields, their visible labels, and configured selectors before capture. DOM and accessibility evidence replace their values and names with `[redacted]`.

Network rows contain only the method, status, resource type, redacted URL shape, and duration. Request bodies, response bodies, headers, query strings, fragments, credentials, and path values are excluded.

Each receipt identifies the test, project, capture time, redacted page URL, and assertion failure. Receipt creation does not upload the file or send telemetry.

Review generated CI artifacts and set your own retention policy.

## API

`createReceiptTest(options?)` returns a Playwright `test` extended with a worker-safe `receipt` fixture.

| Option | Default | Purpose |
| --- | --- | --- |
| `outputDir` | `test-results/journey-receipts` | Receipt directory, relative to `process.cwd()` |
| `maskSelectors` | `[]` | Additional selectors to redact and screenshot-mask |
| `domSelector` | `body` | Subtree used for DOM and ARIA capture |
| `maxReceipts` | `5` | Maximum receipts generated per test |
| `maxNetworkEntries` | `40` | Most recent request entries |
| `maxConsoleEntries` | `20` | Most recent errors and warnings |
| `maxDomBytes` | `81920` | UTF-8 cap for scrubbed DOM |
| `maxAriaBytes` | `40960` | UTF-8 cap for ARIA snapshot |
| `maxScreenshotBytes` | `1500000` | Omit screenshots above this byte cap |
| `screenshot` | `{ type: 'jpeg', quality: 72 }` | Screenshot format and quality |

## Develop and verify

Requires Node 20 or later.

```sh
npm ci
npm run typecheck
npm test
npm run build
npm pack --dry-run
```

Run every listed visitor claim from a clean checkout:

```sh
node -e "for (const c of require('./.factory/claims.json')) console.log(c.test)"
```

The static documentation and demo build to `dist/site`. Run `npm run dev` to preview the site.

## Scope

Use this package inside Playwright tests you already run.

## License

MIT © 2026 Sociobot (Param Factory)
