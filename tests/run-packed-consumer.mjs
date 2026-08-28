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
  for (const secret of [
    'FORMVALUE_UNIQUE_SECRET', 'ARIALABEL_UNIQUE_SECRET', 'ASSOCIATED_LABEL_UNIQUE_SECRET',
    'ARIA_DESCRIPTION_UNIQUE_SECRET', 'MASKARIA_UNIQUE_SECRET', 'MASKED_VISIBLE_TEXT',
  ]) {
    if (receipt.includes(secret)) throw new Error(`Packed consumer receipt leaked ${secret}.`);
  }
  if (!receipt.includes('[redacted]')) throw new Error('Packed consumer receipt did not retain redaction evidence.');
  process.stdout.write(`Verified packed-consumer ARIA redaction: ${files[0]}\n`);
} finally {
  if (tarball) rmSync(tarball, { force: true });
  rmSync(consumer, { recursive: true, force: true });
}
