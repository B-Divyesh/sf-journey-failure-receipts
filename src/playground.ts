/** Browser-safe sample formatter used by the documentation playground. */
export type SampleReceiptInput = { label: string; page: string; privateValue: string; note: string; kind: 'cart' | 'price' | 'address' };
export type SampleReceipt = { label: string; page: string; privateValue: '[redacted]'; note: string; network: string; dom: string };

export function createSampleReceipt(input: SampleReceiptInput): SampleReceipt {
  const network = input.kind === 'price' ? 'GET /:redacted · 200' : input.kind === 'address' ? 'POST /:redacted · 422' : 'POST /:redacted · 200';
  return { label: input.label.trim() || 'Untitled assertion', page: 'https://shop.test/:redacted/:redacted', privateValue: '[redacted]', note: input.note.trim() || 'No console message was supplied.', network, dom: '<input value="[redacted]">' };
}
