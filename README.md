# Journey Failure Receipts

Capture the exact visual and DOM state when a critical Playwright journey assertion fails—not whatever state remains when the test finally ends.

Journey Failure Receipts is a small, local-first Playwright fixture and reporter for teams diagnosing `expect.soft()`-style failures in checkout, sign-in, and other multi-step flows. Each failed wrapped assertion produces one scrubbed, self-contained HTML receipt with a screenshot, selected DOM and ARIA snapshot, console errors, and a metadata-only network summary. It has no telemetry, service, or runtime dependency beyond Playwright.

## Install

```sh
npm install --save-dev journey-failure-receipts @playwright/test
```

## Usage

Create a project fixture:

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

Wrap assertions that may fail softly. Use regular `expect`, not `expect.soft`, inside the callback; `receipt.soft` catches the failure only after freezing its evidence and then records it as a Playwright soft failure.

```ts
import { test, expect } from './fixtures';

test('customer can add an item', async ({ page, receipt }) => {
  await page.goto('/products/field-notes');
  await page.getByRole('button', { name: 'Add to cart' }).click();

  await receipt.soft('Cart count increments', async () => {
    await expect(page.getByTestId('cart-count')).toHaveText('1');
  });

  // The journey continues and another failure receives its own receipt.
  await page.getByRole('link', { name: 'Checkout' }).click();
});
```

Add the optional reporter to print receipt locations in CI:

```ts
// playwright.config.ts
export default {
  reporter: [['list'], ['journey-failure-receipts/reporter']],
};
```

Receipts are ordinary self-contained `.html` files with an embedded, bounded screenshot. Open them directly; no server, account, or network connection is required.

## Privacy defaults

- Every `input`, `textarea`, `select`, and `[contenteditable]` is masked in screenshots and redacted in DOM captures.
- Add `maskSelectors` for customer data rendered outside form controls.
- Request and response bodies are never captured. Network entries contain only method, resource type, redacted origin/path, status, and duration.
- Authorization, cookies, query strings, URL credentials, and fragment values are discarded.
- Limits default to 5 receipts/test, 40 network entries, 20 console errors, 80 KB DOM, and 40 KB ARIA text. Configure lower caps for sensitive suites.
- Files remain local in your configured output directory. There is no telemetry.

## API

`createReceiptTest(options?)` returns a Playwright `test` extended with a worker-safe `receipt` fixture.

`receipt.soft(label, assertion)` runs the assertion, returns its value on success, or captures a receipt and records a soft test error on failure. The test continues. It returns `undefined` after a failure.

| Option | Default | Purpose |
| --- | --- | --- |
| `outputDir` | `test-results/journey-receipts` | Receipt directory, relative to `process.cwd()` |
| `maskSelectors` | `[]` | Additional selectors to redact and screenshot-mask |
| `domSelector` | `body` | Subtree used for DOM and ARIA capture |
| `maxReceipts` | `5` | Maximum receipts generated per test |
| `maxNetworkEntries` | `40` | Most recent metadata-only request entries |
| `maxConsoleEntries` | `20` | Most recent errors and warnings |
| `maxDomBytes` | `81920` | UTF-8 cap for scrubbed DOM |
| `maxAriaBytes` | `40960` | UTF-8 cap for ARIA snapshot |
| `screenshot` | `{ type: 'jpeg', quality: 72 }` | Screenshot format and quality |

Invalid selectors and unavailable pages do not hide the assertion: the receipt records the capture error and the soft failure still reaches Playwright.

## Develop and verify

Requires Node 20+.

```sh
npm ci
npm test
npm run build
npm pack --dry-run
```

`npm run build` produces ESM, CommonJS, and `.d.ts` package files in `dist/package`, then builds the documentation/demo site into `dist/site` with `index.html` at its root. Use `npm run dev` for the site.

## Scope

This is assertion-level evidence for suites you already run. It is not hosted monitoring, test orchestration, trace replacement, visual regression, or an uploader.

## License

MIT © 2026 Sociobot (Param Factory)
