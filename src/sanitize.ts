const SECRET_ASSIGNMENT = /\b(password|passwd|secret|token|api[-_]?key|authorization)\s*[:=]\s*([^\s,;]+)/gi;
const BEARER = /\bBearer\s+[A-Za-z0-9._~+/=-]+/gi;
const JWT = /\beyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\b/g;
const EMAIL = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;
const CARDISH = /\b(?:\d[ -]*?){13,19}\b/g;

export function redactText(input: string, secrets: string[] = []): string {
  let result = input;
  // Values come from fields and explicitly configured private selectors. Even
  // one-character values can be customer data, so never discard them based on
  // length before evidence is persisted.
  for (const secret of secrets.filter((value) => value.length > 0).sort((a, b) => b.length - a.length)) {
    result = result.split(secret).join('[redacted]');
  }
  return result
    .replace(BEARER, 'Bearer [redacted]')
    .replace(JWT, '[redacted-token]')
    .replace(SECRET_ASSIGNMENT, '$1=[redacted]')
    .replace(EMAIL, '[redacted-email]')
    .replace(CARDISH, '[redacted-number]');
}

export function safeUrl(raw: string): string {
  try {
    const url = new URL(raw);
    // A URL path is application data, not trustworthy route metadata: account
    // names, slugs, and short opaque IDs commonly appear in ordinary-looking
    // segments. Preserve only the origin and path shape.
    const pathTemplate = url.pathname.split('/').map((segment) => segment ? ':redacted' : '').join('/');
    return `${url.protocol}//${url.host}${pathTemplate}`;
  } catch {
    return '[invalid URL]';
  }
}

export function truncateUtf8(input: string, maxBytes: number): { value: string; truncated: boolean } {
  const data = Buffer.from(input);
  if (data.byteLength <= maxBytes) return { value: input, truncated: false };
  return { value: data.subarray(0, maxBytes).toString('utf8') + '\n… [truncated]', truncated: true };
}

export function escapeHtml(input: string): string {
  return input.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;',
  })[character]!);
}

export function slug(input: string): string {
  return input.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 64) || 'journey';
}
