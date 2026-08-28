# Journey Failure Receipts — perfection-loop round 1 handoff

## Delivered

- Repaired candidate `6e762524b43e58081d107783251f6e7b552e2d57` in `07333aac4d82343cd1e3c96bdda7a292f8c106c2`, with test typing follow-up `50ff47ea6fe107b47c1ed160616b4376f3efe78b`.
- Replaced the ambiguous first screen with a plain job headline, audience sentence, and one primary **Try it with sample data** action.
- Added `/demo/?demo=1`, `/?demo=1` redirect support, editable bundled sample input, a persistent demo banner, Reset demo, Start for real, and isolated `demo:journey-failure-receipts:sample` storage.
- Added a browser-safe `createSampleReceipt` package export used by the playground.
- Added `.factory/claims.json`, one tagged test per claim, `.factory/demo.md`, catalog description, and copy audit.
- Added route metadata, canonical/OG/Twitter tags, hand-drawn 1200×630 share art, apple-touch icon, consistent legal links, `/404.html`, a static-host 404 response override, sitemap demo route, focus announcement, and mobile code-region keyboard access.
- Preserved the blueprint drafting-sheet visual system; the new art provenance is in `.factory/design.md`.

## Verification evidence

Final clean clone: `/tmp/tmp.b7EnJZqNH0/repo` at `50ff47ea6fe107b47c1ed160616b4376f3efe78b`.

```sh
npm ci
npm run typecheck
npm test
npm run build
npm pack --dry-run
npm run test:e2e
npm run test:consumer
npm run test:claims -- --grep @claim:sample-receipt
npm run test:claims -- --grep @claim:sample-redaction
npm run test:claims -- --grep @claim:demo-reset-isolation
npm run test:claims -- --grep @claim:demo-no-upload
npm run test:claims -- --grep @claim:offline-demo
npm run test:unit -- --testNamePattern @claim:mit-license
```

All commands passed. `npm test` ran 5 unit tests, fixture receipt flow, packed-consumer privacy flow, and 8 site Playwright tests. The intentional assertion failures in fixture/consumer tests are expected; their wrappers prove receipt generation, redaction, and continued test flow before success.

The browser suite runs Axe at desktop and 390×844, finds no serious/critical violations, verifies no mobile overflow, the worker-backed offline demo, same-origin demo traffic, metadata, route focus, legal pages, and static budgets. Built output: JavaScript 3.63 kB, CSS 18.90 kB, hero WebP below 300 kB. `/opt/fleet/lib/verify-url.sh` passed locally for `/` and `/demo/`, with no console errors, one `h1`, `lang=en`, a main landmark, and no missing image alt text.

## Run and deploy

```sh
npm ci
npm test
npm run build
```

Deploy `dist/site` as the static work-order artifact. The factory owns npm publishing; use `npm pack` to prepare the tarball.

## Known gaps

No known product or review blocking finding remains. `main` was pushed to `origin` at `b0e01dc`; at the final external check on 2026-08-28, `https://journey-failure-receipts.sociobot.in/` still served the prior title and `/demo/` returned the prior 404. The factory static deployment has not yet consumed the pushed revision, so final live HTTP-status confirmation remains pending external deployment.
