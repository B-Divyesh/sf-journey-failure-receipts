import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const run = (entry, args = []) => execFileSync(process.execPath, [resolve(root, entry), ...args], {
  cwd: root,
  env: process.env,
  stdio: 'inherit',
});

if (process.versions.node.split('.')[0] !== '20') {
  throw new Error(`Expected the compatibility check to use Node 20; received ${process.version}.`);
}

run('node_modules/typescript/bin/tsc', ['--noEmit']);
run('node_modules/vitest/vitest.mjs', ['run']);
run('node_modules/tsup/dist/cli-default.js');
run('node_modules/vite/bin/vite.js', ['build']);

const esm = await import(pathToFileURL(resolve(root, 'dist/package/index.js')).href);
const require = createRequire(import.meta.url);
const cjs = require(resolve(root, 'dist/package/index.cjs'));
for (const [format, exports] of [['ESM', esm], ['CommonJS', cjs]]) {
  if (typeof exports.createReceiptTest !== 'function' || typeof exports.createSampleReceipt !== 'function') {
    throw new Error(`${format} package entry point did not expose the documented API on Node 20.`);
  }
}

process.stdout.write(`@claim:node-20-compatible built, typechecked, tested, and loaded ESM/CommonJS with ${process.version}.\n`);
