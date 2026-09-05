import { execFileSync, spawnSync } from 'node:child_process';
import { readdirSync, readFileSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const receiptDir = resolve(root, 'test-results/smoke-receipts');
const outputDir = resolve(root, 'test-results/smoke-output');
rmSync(receiptDir, { recursive: true, force: true });
rmSync(outputDir, { recursive: true, force: true });

execFileSync('npm', ['run', 'build:package'], { cwd: root, stdio: 'inherit' });
const run = spawnSync(resolve(root, 'node_modules/.bin/playwright'), ['test', '--config', 'tests/fixture-project/playwright.config.ts'], {
  cwd: root,
  encoding: 'utf8',
  env: process.env,
});
process.stdout.write(run.stdout ?? '');
process.stderr.write(run.stderr ?? '');

if (run.status !== 1) throw new Error(`Expected the intentional soft assertion to fail with exit 1; received ${run.status}`);
if (!run.stdout.includes('[journey receipt]')) throw new Error('The receipt reporter did not surface the receipt path.');
if (!run.stdout.includes('SMOKE_CONTINUED_AFTER_RECEIPT')) throw new Error('The journey did not continue after the captured soft failure.');

const receipts = readdirSync(receiptDir).filter((file) => file.endsWith('.html'));
if (receipts.length !== 1) throw new Error(`Expected exactly one receipt; found ${receipts.length}.`);
const html = readFileSync(resolve(receiptDir, receipts[0]), 'utf8');
for (const leaked of [
  'secret@example.com', 'hunter2', '99887766', '?token=', 'journey-continued',
  'ARIALABEL_UNIQUE_SECRET', 'ASSOCIATED_LABEL_UNIQUE_SECRET',
  'ARIA_DESCRIPTION_UNIQUE_SECRET', 'MASKARIA_UNIQUE_SECRET', 'MASKED_VISIBLE_TEXT',
]) {
  if (html.includes(leaked)) throw new Error(`Sensitive fixture value leaked into receipt: ${leaked}`);
}
for (const expected of ['Cart count increments', 'data:image/jpeg;base64', '[redacted]', 'Mask selector was skipped because it is invalid']) {
  if (!html.includes(expected)) throw new Error(`Receipt is missing expected evidence: ${expected}`);
}
if (html.includes('Second capped failure')) throw new Error('The maxReceipts boundary wrote a second receipt into the first artifact.');
process.stdout.write(`Verified scrubbed failure receipt: ${receipts[0]}\n`);
