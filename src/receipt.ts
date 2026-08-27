import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { ReceiptEvidence, ResolvedReceiptOptions } from './types.js';
import { escapeHtml, slug } from './sanitize.js';

function rows(items: Array<[string, string]>): string {
  return items.map(([key, value]) => `<dt>${escapeHtml(key)}</dt><dd>${escapeHtml(value)}</dd>`).join('');
}

function codeBlock(value: string | undefined, empty: string): string {
  return value ? `<pre><code>${escapeHtml(value)}</code></pre>` : `<p class="empty">${escapeHtml(empty)}</p>`;
}

export function renderReceipt(evidence: ReceiptEvidence): string {
  const consoleRows = evidence.console.length
    ? evidence.console.map((item) => `<tr><td><span class="kind">${escapeHtml(item.type)}</span></td><td>${escapeHtml(item.text)}</td><td>${escapeHtml(item.location ?? '—')}</td></tr>`).join('')
    : '<tr><td colspan="3" class="empty">No console warnings or errors before this assertion.</td></tr>';
  const networkRows = evidence.network.length
    ? evidence.network.map((item) => `<tr><td>${escapeHtml(item.method)}</td><td>${escapeHtml(String(item.status))}</td><td>${escapeHtml(item.resourceType)}</td><td>${escapeHtml(item.url)}</td><td>${item.durationMs == null ? '—' : `${item.durationMs} ms`}</td></tr>`).join('')
    : '<tr><td colspan="5" class="empty">No completed network activity was recorded.</td></tr>';
  const alerts = [...evidence.captureErrors.map((message) => `Capture note: ${message}`), ...evidence.truncated.map((name) => `Capped: ${name}`)];

  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(evidence.label)} — Journey failure receipt</title>
<style>
:root{color-scheme:light;--paper:#f3eedb;--sheet:#fcf9ec;--ink:#102a43;--muted:#48637a;--grid:#b7d7d5;--cyan:#087e8b;--red:#b9382e;--green:#216e4e}*{box-sizing:border-box}body{margin:0;background-color:var(--paper);background-image:linear-gradient(rgba(8,126,139,.11) 1px,transparent 1px),linear-gradient(90deg,rgba(8,126,139,.11) 1px,transparent 1px);background-size:24px 24px;color:var(--ink);font:16px/1.55 ui-sans-serif,system-ui,sans-serif}main{width:min(1180px,calc(100% - 32px));margin:32px auto 72px}header{border:1px solid var(--ink);border-top:8px solid var(--red);background:var(--sheet);padding:clamp(20px,4vw,48px);box-shadow:6px 6px 0 rgba(16,42,67,.14)}.eyebrow,.stamp{font:700 12px/1.3 ui-monospace,monospace;letter-spacing:.12em;text-transform:uppercase}.stamp{display:inline-block;color:var(--red);border:2px solid;padding:6px 9px;transform:rotate(-2deg)}h1{font-size:clamp(30px,5vw,58px);line-height:1.02;max-width:18ch;margin:20px 0 12px}h2{font-size:22px;margin:0}p{max-width:72ch}.error{font:600 15px/1.55 ui-monospace,monospace;color:var(--red)}dl{display:grid;grid-template-columns:max-content 1fr;gap:5px 20px}dt{color:var(--muted)}dd{margin:0;font-family:ui-monospace,monospace;overflow-wrap:anywhere}.sheet{margin-top:24px;background:var(--sheet);border:1px solid var(--ink);padding:24px}.screen{display:block;width:100%;height:auto;max-height:720px;object-fit:contain;background:var(--ink);border:8px solid var(--ink)}details{margin-top:16px;border-top:1px solid var(--grid);padding-top:16px}summary{cursor:pointer;font-weight:700;min-height:44px;display:flex;align-items:center}pre{overflow:auto;max-height:480px;background:#102a43;color:#f7f2de;padding:20px;font:13px/1.55 ui-monospace,monospace;white-space:pre-wrap}.notes{border-left:5px solid #8a5700;padding:4px 16px;margin:20px 0}.empty{color:var(--muted);font-style:italic}table{width:100%;border-collapse:collapse;font:13px/1.5 ui-monospace,monospace}th,td{text-align:left;vertical-align:top;border-bottom:1px solid var(--grid);padding:10px;overflow-wrap:anywhere}.kind{font-weight:700;color:var(--red)}.privacy{color:var(--green);font-weight:700}footer{margin-top:28px;color:var(--muted);font-size:13px}@media(max-width:640px){main{width:min(100% - 16px,1180px);margin-top:8px}.sheet,header{padding:16px}dl{grid-template-columns:1fr;gap:0}dd{margin-bottom:8px}.table-wrap{overflow-x:auto}}@media(prefers-reduced-motion:reduce){*,*::before,*::after{scroll-behavior:auto!important}}
</style></head><body><main>
<header><span class="stamp">Assertion failed · evidence frozen</span><h1>${escapeHtml(evidence.label)}</h1><p class="error">${escapeHtml(evidence.error)}</p><dl>${rows([['Test', evidence.testTitle], ['Project', evidence.projectName || 'default'], ['Captured', evidence.capturedAt], ['Page', evidence.pageUrl], ['Receipt', evidence.id]])}</dl></header>
${alerts.length ? `<aside class="notes" aria-label="Capture notes"><strong>Capture notes</strong><ul>${alerts.map((note) => `<li>${escapeHtml(note)}</li>`).join('')}</ul></aside>` : ''}
<section class="sheet" aria-labelledby="screen-title"><h2 id="screen-title">01 · Visual state</h2>${evidence.screenshot ? `<p>${evidence.screenshot.bytes.toLocaleString()} bytes · form fields and configured selectors masked before capture</p><img class="screen" src="data:${evidence.screenshot.mime};base64,${evidence.screenshot.base64}" alt="Browser viewport at the failed assertion, with private fields masked">` : '<p class="empty">No screenshot was available. See capture notes.</p>'}</section>
<section class="sheet" aria-labelledby="structure-title"><h2 id="structure-title">02 · Structure</h2><details open><summary>Scrubbed DOM</summary>${codeBlock(evidence.dom, 'No DOM snapshot was available.')}</details><details><summary>ARIA snapshot</summary>${codeBlock(evidence.aria, 'No ARIA snapshot was available.')}</details></section>
<section class="sheet" aria-labelledby="runtime-title"><h2 id="runtime-title">03 · Runtime signals</h2><details open><summary>Console (${evidence.console.length})</summary><div class="table-wrap"><table><thead><tr><th>Type</th><th>Message</th><th>Location</th></tr></thead><tbody>${consoleRows}</tbody></table></div></details><details open><summary>Network (${evidence.network.length})</summary><div class="table-wrap"><table><thead><tr><th>Method</th><th>Status</th><th>Type</th><th>Redacted URL</th><th>Time</th></tr></thead><tbody>${networkRows}</tbody></table></div></details></section>
<footer><p class="privacy">Local receipt · no request/response bodies · query strings discarded</p><p>Generated by Journey Failure Receipts 0.1.0.</p></footer>
</main></body></html>`;
}

export async function writeReceipt(evidence: ReceiptEvidence, options: ResolvedReceiptOptions): Promise<{ path: string; html: string }> {
  const directory = path.resolve(options.outputDir);
  await mkdir(directory, { recursive: true });
  const outputPath = path.join(directory, `${slug(evidence.testTitle)}-${slug(evidence.label)}-${evidence.id}.html`);
  const html = renderReceipt(evidence);
  await writeFile(outputPath, html, { encoding: 'utf8', flag: 'wx' });
  return { path: outputPath, html };
}
