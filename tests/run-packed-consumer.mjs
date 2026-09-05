import { cpSync, mkdtempSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import { execFileSync, spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { chromium } from '@playwright/test';

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
  execFileSync(process.execPath, ['--input-type=module', '--eval', `
    const root = await import('journey-failure-receipts');
    const playwright = await import('journey-failure-receipts/playwright');
    const reporter = await import('journey-failure-receipts/reporter');
    if (typeof root.createReceiptTest !== 'function' || typeof root.createSampleReceipt !== 'function') throw new Error('ESM root exports are incomplete');
    if (typeof playwright.test !== 'function' || typeof playwright.expect !== 'function') throw new Error('ESM Playwright exports are incomplete');
    if (typeof reporter.default !== 'function') throw new Error('ESM reporter export is incomplete');
  `], { cwd: consumer, stdio: 'inherit' });
  execFileSync(process.execPath, ['--eval', `
    const root = require('journey-failure-receipts');
    const playwright = require('journey-failure-receipts/playwright');
    const reporter = require('journey-failure-receipts/reporter');
    if (typeof root.createReceiptTest !== 'function' || typeof root.createSampleReceipt !== 'function') throw new Error('CommonJS root exports are incomplete');
    if (typeof playwright.test !== 'function' || typeof playwright.expect !== 'function') throw new Error('CommonJS Playwright exports are incomplete');
    if (typeof reporter.default !== 'function') throw new Error('CommonJS reporter export is incomplete');
  `], { cwd: consumer, stdio: 'inherit' });

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
  for (const excluded of [
    'REQUEST_BODY_MARKER_9247', 'RESPONSE_BODY_MARKER_9247',
    'REQUEST_HEADER_MARKER_9247', 'RESPONSE_HEADER_MARKER_9247', 'FRAGMENT_MARKER',
  ]) {
    if (receipt.includes(excluded)) throw new Error(`Packed consumer receipt retained excluded request data: ${excluded}.`);
  }
  for (const safeUrl of [
    'https://api.example.test/:redacted/:redacted',
  ]) {
    if (!receipt.includes(safeUrl)) throw new Error(`Packed consumer receipt did not preserve the documented URL template: ${safeUrl}.`);
  }
  if (!structure.includes('[redacted]')) throw new Error('Packed consumer receipt did not retain redaction evidence.');
  if (!captures[1].includes('textbox "[redacted]"')) throw new Error('Packed consumer ARIA evidence was not generated from the structurally redacted clone.');
  for (const value of ['POST', '207', 'fetch', 'https://api.example.test/:redacted/:redacted']) {
    if (!network.includes(value)) throw new Error(`Packed consumer network summary omitted ${value}.`);
  }
  if (!receipt.includes('Cart response did not update the total.')) throw new Error('Packed consumer receipt omitted the recent console warning.');
  if (!/\d+ ms/.test(network)) throw new Error('Packed consumer network summary omitted request duration.');

  for (const value of [
    'Cart count increments',
    'packed library',
    'default',
    'https://shop.test/:redacted/:redacted',
    'expected value',
  ]) {
    if (!receipt.includes(value)) throw new Error(`Packed consumer receipt context omitted ${value}.`);
  }
  const captured = receipt.match(/<dt>Captured<\/dt><dd>([^<]+)<\/dd>/)?.[1];
  if (!captured || Number.isNaN(Date.parse(captured))) throw new Error('Packed consumer receipt did not include a valid capture time.');

  const observation = JSON.parse(readFileSync(resolve(consumer, 'network-observation.json'), 'utf8'));
  if (observation.pageRequestsDuringCapture.length || observation.nodeNetworkCalls.length) {
    throw new Error(`Receipt creation initiated a network request: ${JSON.stringify(observation)}`);
  }

  const screenshot = receipt.match(/<img class="screen" src="data:image\/png;base64,([^"]+)"/)?.[1];
  if (!screenshot) throw new Error('Packed consumer receipt did not include its PNG screenshot evidence.');
  const browser = await chromium.launch();
  try {
    const imagePage = await browser.newPage();
    await imagePage.setContent(`<img id="receipt-shot" src="data:image/png;base64,${screenshot}">`);
    const pixels = await imagePage.evaluate(async () => {
      const image = document.querySelector('#receipt-shot');
      await image.decode();
      const canvas = document.createElement('canvas');
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      const context = canvas.getContext('2d');
      context.drawImage(image, 0, 0);
      return [[200, 110], [200, 240]].map(([x, y]) => [...context.getImageData(x, y, 1, 1).data]);
    });
    for (const pixel of pixels) {
      if (pixel.join(',') !== '16,42,67,255') throw new Error(`Screenshot mask pixel was ${pixel.join(',')} instead of the configured opaque mask color.`);
    }
  } finally {
    await browser.close();
  }

  process.stdout.write(`Verified packed-consumer screenshot, context, network, no-upload, DOM, ARIA, and path privacy: ${files[0]}\n`);
} finally {
  if (tarball) rmSync(tarball, { force: true });
  rmSync(consumer, { recursive: true, force: true });
}
