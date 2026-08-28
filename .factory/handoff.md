# Journey Failure Receipts v0.1.0 handoff

## What was built

- A typed Playwright fixture with `receipt.soft(label, assertion)` that captures evidence at the assertion catch point, registers a real Playwright soft failure, and allows the journey to continue.
- One self-contained static HTML receipt per failure: bounded JPEG viewport, scrubbed selected DOM, ARIA snapshot, recent console errors/warnings, and metadata-only network activity.
- Privacy controls applied before persistence: all form controls and configured selectors are screenshot-masked; values and configured content are removed from DOM/ARIA/error text; URL credentials, queries, fragments, common tokens, emails, and card-like values are redacted; network bodies and headers are never collected.
- Configurable caps for receipt count, screenshots, DOM, ARIA, console, and network evidence. Invalid selectors and closed pages produce capture notes without hiding the test failure.
- An optional Playwright reporter that prints receipt artifact paths in CI.
- ESM, CommonJS, and TypeScript declarations in `dist/package`; dry-run npm package is ready for the factory to publish as `journey-failure-receipts@0.1.0`.
- A responsive blueprint-drafting documentation site with an accessible keyboard-operated receipt demo, copy feedback, explicit offline state/service worker, self-hosted fonts, privacy and terms pages, sitemap, and original generated hero art.

## Run and verify

```sh
npm ci
npm test
npm run typecheck
npm run build
npm pack --dry-run
```

`npm test` includes 4 unit tests, an intentionally failing nested Playwright test whose wrapper verifies that the journey continues and the receipt contains none of the seeded secrets, plus 5 production-site browser tests (axe, keyboard behavior, legal pages, mobile overflow, offline behavior, and asset budgets). The outer test command passes.

Final verification on 2026-08-28:

- `npm test`: pass
- `npm run typecheck`: pass
- `npm run build`: pass; `dist/package` and `dist/site`, with `dist/site/index.html` at the deploy root
- `npm pack --dry-run`: pass; 22 files, 20.3 KB tarball / 220.9 KB unpacked
- Factory `verify-url.sh`: HTTP 200, no console errors, title/lang/main present, exactly one h1, zero missing image alts, zero unlabeled buttons
- Axe: zero serious or critical violations on `/`, `/privacy/`, and `/terms/`
- Lighthouse mobile: Performance 99, Accessibility 100, Best Practices 100, SEO 100; FCP 1.2 s, LCP 1.8 s, TBT 0 ms, CLS 0
- Static payload: initial JS 3.28 KB, CSS 16.15 KB, fonts 64,936 bytes total, hero WebP 58,108 bytes
- Manual screenshots reviewed at 1440 px and 390 px; automated 390 px check reports no horizontal overflow

## Asset provenance

`site/public/blueprint-journey.webp` was generated specifically for this product with `/opt/fleet/lib/gen-image.sh` using the full prompt recorded in `.factory/design.md`, then resized to 1280×853, stripped, and encoded as WebP. No third-party stock imagery or logos are used. Instrument Sans and IBM Plex Mono WOFF2 subsets come from the corresponding open-source Fontsource packages and are self-hosted.

## Known limits and next steps

- Playwright does not expose a public reporter hook with the live `Page` at each raw `expect.soft()` failure. Version 0.1 therefore requires wrapping selected assertions with `receipt.soft`; this is documented and deliberate.
- Screenshots capture the current viewport, not full-page content, to bound size and exposure.
- The helper does not collect network bodies by design. A future body-capture option should only ship with per-route allowlists, content-type checks, and strict byte caps.
- The service worker caches visited same-origin assets; factory/CDN cache headers remain deployment-owned.
