import { describe, expect, it } from 'vitest';
import { escapeHtml, redactText, safeUrl, truncateUtf8 } from '../../src/sanitize.js';

describe('privacy scrubbing', () => {
  it('redacts common credentials, personal fields, and page secrets', () => {
    const input = 'email dev@example.com password=hunter2 Authorization: Bearer abc.DEF-123 card 4111 1111 1111 1111 private-value';
    const output = redactText(input, ['private-value', 'hunter2']);
    expect(output).not.toContain('dev@example.com');
    expect(output).not.toContain('hunter2');
    expect(output).not.toContain('4111');
    expect(output).not.toContain('abc.DEF-123');
    expect(output).not.toContain('private-value');
  });

  it('keeps only the URL origin and redacted path shape', () => {
    expect(safeUrl('https://user:pass@example.test/customers/ALICE_UNIQUE?token=secret#private'))
      .toBe('https://example.test/:redacted/:redacted');
    expect(safeUrl('https://example.test/accounts/customer-slug'))
      .toBe('https://example.test/:redacted/:redacted');
    expect(safeUrl('https://example.test/orders/abc123'))
      .toBe('https://example.test/:redacted/:redacted');
  });

  it('truncates by UTF-8 bytes and escapes receipt markup', () => {
    expect(truncateUtf8('hello world', 5)).toEqual({ value: 'hello\n… [truncated]', truncated: true });
    expect(escapeHtml('<script>"x"</script>')).toBe('&lt;script&gt;&quot;x&quot;&lt;/script&gt;');
  });
});
