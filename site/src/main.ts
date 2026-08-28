import { createSampleReceipt, type SampleReceiptInput } from '../../src/playground';
import './style.css';

const demoKey = 'demo:journey-failure-receipts:sample';
const defaults: SampleReceiptInput = { label: 'Cart count increments', page: '/checkout/field-notes', privateValue: 'Mira Chen · order 7284', note: 'Cart summary stayed at 0 after adding Field Notes.', kind: 'cart' };

function updateConnection(): void { const offline = document.getElementById('offline'); if (offline) offline.hidden = navigator.onLine; }
function text(id: string, value: string): void { const node = document.getElementById(id); if (node) node.textContent = value; }

function setupCopy(): void {
  const button = document.getElementById('copy-code') as HTMLButtonElement | null;
  button?.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(document.getElementById('install-code')?.textContent ?? ''); button.textContent = 'Copied'; text('copy-status', 'Code copied to the clipboard.'); }
    catch { button.textContent = 'Select code'; text('copy-status', 'Clipboard access was blocked. Select the code block to copy it.'); }
    window.setTimeout(() => { button.textContent = 'Copy code'; }, 2200);
  });
}

function getStoredDemo(): SampleReceiptInput {
  try { const value = localStorage.getItem(demoKey); return value ? { ...defaults, ...JSON.parse(value) } : { ...defaults }; } catch { return { ...defaults }; }
}
function saveDemo(value: SampleReceiptInput): void { try { localStorage.setItem(demoKey, JSON.stringify(value)); } catch { /* The in-memory demo still works when storage is unavailable. */ } }
function clearDemo(): void { try { localStorage.removeItem(demoKey); } catch { /* nothing to clear */ } }

function setupDemo(): void {
  const form = document.getElementById('sample-form') as HTMLFormElement | null;
  if (!form) return;
  const render = (input: SampleReceiptInput) => { const receipt = createSampleReceipt(input); text('receipt-title', receipt.label); text('receipt-page', receipt.page); text('receipt-private', receipt.privateValue); text('receipt-note', receipt.note); text('receipt-network', receipt.network); text('receipt-dom', receipt.dom); };
  const fill = (input: SampleReceiptInput) => { for (const [key, value] of Object.entries(input)) { const node = form.elements.namedItem(key) as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null; if (node) node.value = value; } render(input); };
  const read = (): SampleReceiptInput => { const data = new FormData(form); return { label: String(data.get('label') ?? ''), page: String(data.get('page') ?? ''), privateValue: String(data.get('private') ?? ''), note: String(data.get('note') ?? ''), kind: String(data.get('kind') ?? 'cart') as SampleReceiptInput['kind'] }; };
  fill(getStoredDemo());
  form.addEventListener('input', () => { const input = read(); saveDemo(input); render(input); });
  form.addEventListener('submit', (event) => { event.preventDefault(); const input = read(); saveDemo(input); render(input); text('form-status', 'Sample receipt updated. Your private sample field remains redacted.'); });
  document.getElementById('reset-demo')?.addEventListener('click', () => { clearDemo(); fill({ ...defaults }); text('form-status', 'Demo reset to the bundled sample.'); });
  document.getElementById('start-real')?.addEventListener('click', clearDemo);
}

function setupRoute(): void {
  if (document.body.dataset.page === 'home' && new URLSearchParams(location.search).get('demo') === '1') { location.replace('/demo/?demo=1'); return; }
  if (document.body.dataset.page !== 'home') { document.querySelector<HTMLElement>('h1[tabindex="-1"]')?.focus({ preventScroll: true }); text('route-status', `${document.title} loaded.`); }
}

setupRoute(); setupCopy(); setupDemo(); window.addEventListener('online', updateConnection); window.addEventListener('offline', updateConnection); updateConnection();
if ('serviceWorker' in navigator && import.meta.env.PROD) window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => undefined));
