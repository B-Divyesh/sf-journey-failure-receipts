import { expect, createReceiptTest } from 'journey-failure-receipts/playwright';
import { writeFileSync } from 'node:fs';
import http from 'node:http';
import https from 'node:https';
import net from 'node:net';
import tls from 'node:tls';

const test = createReceiptTest({
  outputDir: 'receipts',
  maskSelectors: ['[data-private]'],
  domSelector: 'main',
  screenshot: { type: 'png' },
});

test('@claim:package-redaction @claim:screenshot-redaction @claim:console-messages @claim:network-metadata-only @claim:receipt-context-fields @claim:package-no-upload produces a private local receipt from the packed library', async ({ page, receipt }) => {
  await page.route('https://shop.test/**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'text/html',
      body: `<!doctype html><html><head><style>
        html,body{margin:0;background:#fff;color:#000;font:20px sans-serif}
        main{position:relative;width:900px;height:700px}
        #account-label{position:absolute;left:40px;top:34px;width:320px;height:38px;background:#ffdf00}
        #account{position:absolute;left:40px;top:80px;width:320px;height:60px;background:#00ff66}
        #account-description{position:absolute;left:40px;top:150px;width:320px;height:38px;background:#ff00cc}
        [data-private]{position:absolute;left:40px;top:210px;width:320px;height:60px;margin:0;background:#00ddff}
        [data-testid=status]{position:absolute;left:40px;top:300px}
      </style></head><body><main>
        <label id="account-label" for="account">Li</label>
        <input id="account" aria-label="Li" aria-describedby="account-description"
          placeholder="NY" title="CA" value="XY">
        <p id="account-description">OK</p>
        <p data-private aria-label="ID">NO</p>
        <output data-testid="status">before receipt</output>
      </main></body></html>`,
    });
  });
  await page.route('https://api.example.test/**', async (route) => {
    await route.fulfill({
      status: 207,
      body: 'RESPONSE_BODY_MARKER_9247',
      headers: {
        'access-control-allow-origin': '*',
        'access-control-allow-methods': 'POST',
        'access-control-allow-headers': 'content-type,x-receipt-marker',
        'x-response-marker': 'RESPONSE_HEADER_MARKER_9247',
      },
    });
  });
  await page.goto('https://shop.test/checkout/field-notes');
  await page.evaluate(async () => {
    await Promise.all([
      fetch('https://api.example.test/customers/ALICE_UNIQUE?token=QUERY_SECRET#FRAGMENT_MARKER', {
        method: 'POST',
        headers: { 'content-type': 'text/plain', 'x-receipt-marker': 'REQUEST_HEADER_MARKER_9247' },
        body: 'REQUEST_BODY_MARKER_9247',
      }),
      fetch('https://api.example.test/accounts/customer-slug'),
      fetch('https://api.example.test/orders/abc123'),
    ]);
    console.warn('Cart response did not update the total.');
  });

  const pageRequestsDuringCapture: string[] = [];
  page.on('request', (request) => pageRequestsDuringCapture.push(request.url()));
  const nodeNetworkCalls: string[] = [];
  const guard = (owner: Record<string, unknown>, key: string, label: string) => {
    const original = owner[key] as (...args: unknown[]) => unknown;
    owner[key] = function guarded(this: unknown, ...args: unknown[]) {
      nodeNetworkCalls.push(label);
      throw new Error(`Unexpected ${label} call during receipt capture.`);
    };
    return () => { owner[key] = original; };
  };
  const restoreNetwork = [
    guard(http as unknown as Record<string, unknown>, 'request', 'http.request'),
    guard(http as unknown as Record<string, unknown>, 'get', 'http.get'),
    guard(https as unknown as Record<string, unknown>, 'request', 'https.request'),
    guard(https as unknown as Record<string, unknown>, 'get', 'https.get'),
    guard(net as unknown as Record<string, unknown>, 'connect', 'net.connect'),
    guard(net as unknown as Record<string, unknown>, 'createConnection', 'net.createConnection'),
    guard(tls as unknown as Record<string, unknown>, 'connect', 'tls.connect'),
  ];
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (...args) => {
    nodeNetworkCalls.push(`fetch:${String(args[0])}`);
    throw new Error('Unexpected Node network request during receipt capture.');
  };

  let result: unknown;
  try {
    result = await receipt.soft('Cart count increments', async () => {
      await expect(page.getByTestId('status')).toHaveText('expected value', { timeout: 200 });
    });
  } finally {
    globalThis.fetch = originalFetch;
    restoreNetwork.reverse().forEach((restore) => restore());
  }
  writeFileSync('network-observation.json', JSON.stringify({ pageRequestsDuringCapture, nodeNetworkCalls }));

  expect(result).toBeUndefined();
  await page.getByTestId('status').evaluate((element) => { element.textContent = 'continued after receipt'; });
  await expect(page.getByTestId('status')).toHaveText('continued after receipt');
});
