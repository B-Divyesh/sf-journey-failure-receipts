import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { renderReceipt } from '../../src/receipt.js';

describe('static receipt', () => {
  it('renders portable evidence without executable script', () => {
    const html = renderReceipt({
      id: 'receipt-1', label: '<Cart count>', testTitle: 'journey', projectName: 'chromium', capturedAt: '2026-08-27T00:00:00.000Z',
      pageUrl: 'https://shop.test/cart', error: 'Expected 1; received 0', screenshot: { mime: 'image/jpeg', base64: 'AQID', bytes: 3 },
      dom: '<main data-count="0">Cart</main>', aria: '- main: Cart', console: [], network: [], captureErrors: [], truncated: [],
    });
    expect(html).toContain('data:image/jpeg;base64,AQID');
    expect(html).toContain('&lt;Cart count&gt;');
    expect(html).toContain('No console warnings or errors');
    expect(html).not.toContain('<script');
  });

  it('@claim:mit-license ships under the MIT License', () => {
    expect(readFileSync(resolve(import.meta.dirname, '../../LICENSE'), 'utf8')).toContain('MIT License');
  });
});
