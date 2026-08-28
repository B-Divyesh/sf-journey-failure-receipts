import { cpSync, mkdtempSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import { execFileSync, spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const consumer = mkdtempSync(resolve(tmpdir(), 'journey-failure-receipts-consumer-'));
let tarball;

try {
  execFileSync('npm', ['run', 'build:package'], { cwd: root, stdio: 'inherit' });
  const packed = JSON.parse(execFileSync('npm', ['pack', '--json'], { cwd: root, encoding: 'utf8' }));
  tarball = resolve(root, packed[0].filename);
  cpSync(resolve(root, 'tests/consumer-project'), consumer, { recursive: true });
  execFileSync('npm', ['install', '--no-save', '--ignore-scripts', '--no-audit', '--no-fund', '@playwright/test@1.58.2', tarball], {
    cwd: consumer,
    stdio: 'inherit',
  });

  const run = spawnSync(resolve(consumer, 'node_modules/.bin/playwright'), ['test', '--config', 'playwright.config.ts'], {
    cwd: consumer,
    encoding: 'utf8',
    env: process.env,
  });
  process.stdout.write(run.stdout ?? '');
  process.stderr.write(run.stderr ?? '');
  if (run.status !== 1) throw new Error(`Expected the intentional packed-consumer soft assertion to fail with exit 1; received ${run.status}`);

  const files = readdirSync(resolve(consumer, 'receipts')).filter((file) => file.endsWith('.html'));
  if (files.length !== 1) throw new Error(`Expected one packed-consumer receipt; found ${files.length}.`);
  const receipt = readFileSync(resolve(consumer, 'receipts', files[0]), 'utf8');
  const decodeHtml = (value) => value
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'").replace(/&amp;/g, '&');
  const captures = [...receipt.matchAll(/<pre[^>]*><code>([\s\S]*?)<\/code><\/pre>/g)]
    .map((match) => decodeHtml(match[1]));
  const structure = captures.join('\n');
  const network = decodeHtml(receipt.match(/<summary>Network \(\d+\)<\/summary>[\s\S]*?<tbody>([\s\S]*?)<\/tbody>/)?.[1] ?? '');
  if (captures.length !== 2) throw new Error(`Packed consumer receipt must include both scrubbed DOM and structural ARIA evidence; found ${captures.length} code blocks.`);
  if (!network) throw new Error('Packed consumer receipt did not include network evidence.');
  for (const secret of [
    // Exact one- and two-character values from the independent verifier's
    // reproducer: label, aria-label, placeholder, title, field value,
    // ARIA description, configured-selector name, and selector text.
    'Li', 'NY', 'CA', 'XY', 'OK', 'ID', 'NO',
  ]) {
    if (structure.includes(secret)) throw new Error(`Packed consumer structure evidence leaked ${secret}.`);
  }
  for (const secret of ['ALICE_UNIQUE', 'customer-slug', 'abc123', 'QUERY_SECRET']) {
    if (network.includes(secret)) throw new Error(`Packed consumer network evidence leaked ${secret}.`);
  }
  for (const safeUrl of [
    'https://api.example.test/:redacted/:redacted',
  ]) {
    if (!receipt.includes(safeUrl)) throw new Error(`Packed consumer receipt did not preserve the documented URL template: ${safeUrl}.`);
  }
  if (!structure.includes('[redacted]')) throw new Error('Packed consumer receipt did not retain redaction evidence.');
  if (!captures[1].includes('textbox "[redacted]"')) throw new Error('Packed consumer ARIA evidence was not generated from the structurally redacted clone.');
  process.stdout.write(`Verified packed-consumer short-form, ARIA, selector, and path redaction: ${files[0]}\n`);
} finally {
  if (tarball) rmSync(tarball, { force: true });
  rmSync(consumer, { recursive: true, force: true });
}
