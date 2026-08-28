# Journey Failure Receipts v0.1.1 repair handoff — READY

This repair replaces the independent verifier's **FAIL** for candidate
`82184b9d032304699f4a4b4c1bb6356b678f74e1` (report recorded in
[`verification.md`](verification.md)). It preserves the assertion-level,
local-only receipt workflow and documentation site.

## Release blockers repaired

- **ARIA privacy leak:** evidence capture now collects sensitive strings from
  every form control and configured mask selector before any evidence is
  persisted. This includes `aria-label`, `aria-description`, accessible-text
  attributes, `aria-labelledby`/`aria-describedby` targets, and associated
  `<label>` text. Those strings are redacted from ARIA, DOM, assertion errors,
  and console evidence. Screenshot masks now also cover labels and referenced
  descriptions, so visible accessible text is not left in the image.
- **Mobile keyboard accessibility:** the horizontally scrollable installation
  example is now a labelled `tabindex="0"` region. Generated receipt DOM/ARIA
  code panels receive the same treatment.
- **Static-host hardening:** Azure Static Apps configuration and a portable
  `_headers` policy add CSP, Permissions-Policy, frame protection, `nosniff`,
  immutable caching for hashed/static assets, and no-cache service-worker
  delivery. The service worker is now cache version `v2`, calls
  `skipWaiting()`, claims clients on activation, and clears old caches.

## Regression coverage

- `tests/fixture-project/failure.spec.ts` seeds form value, `aria-label`,
  associated label, ARIA description, configured-selector `aria-label`, and
  configured-selector text secrets; `run-fixture-smoke.mjs` rejects any of
  them in the emitted receipt while proving the journey continued.
- `tests/consumer-project` is installed from the actual `npm pack` tarball by
  `tests/run-packed-consumer.mjs`. It repeats the ARIA privacy case in a clean
  temporary consumer and asserts all six unique markers are absent.
- The 390 px browser test runs axe, verifies no serious/critical violations,
  and verifies the installation code region is keyboard-focusable. It also
  verifies the deployed static policy artifacts and service-worker update
  hooks are present in `dist/site`.

## Verification (2026-08-28)

Executed from a clean dependency install on Node `v22.23.2` / npm `10.9.8`:

```sh
npm ci
npm run typecheck
npm test
npm run build
npm pack --dry-run
```

All commands pass. `npm test` includes 4 Vitest unit tests, the intentional
local fixture failure wrapper, the intentionally failing packed-consumer
wrapper, and 5 production-site Playwright tests. The two wrappers deliberately
receive Playwright exit status 1 internally, then assert receipt creation,
continued journey execution, and redaction before returning success.

- `npm pack --dry-run`: `journey-failure-receipts@0.1.1`, 22 files, 53.2 kB
  tarball / 244.2 kB unpacked.
- Production browser checks: desktop and 390×844 mobile, keyboard focus and
  tab-arrow demo operation, axe serious/critical = 0 on `/`, `/privacy/`, and
  `/terms/`; no console errors; one `h1`, `main`, title, language, image alt
  text, legal pages, offline reload, and service worker all pass.
- Lighthouse desktop against the production build: Performance 100,
  Accessibility 100, Best Practices 100, SEO 100; FCP 0.4 s, LCP 0.4 s,
  TBT 0 ms, CLS 0.
- Asset sizes: initial JS 3.28 kB, CSS 16.15 kB, self-hosted fonts 64,936 B,
  hero WebP 58,108 B; all remain within the product budgets.
- Privacy/network inspection remains same-origin only; no telemetry or
  third-party fonts/scripts are added.

`npm ci` reports one existing low-severity npm audit advisory; no production
dependency change was made by this repair.

## Deploy and publish

Build with `npm run build`; deploy `dist/site` to the existing Azure Static
Apps target. `site/public/staticwebapp.config.json` is copied to the deploy
root and is the host-specific policy source of truth. Validate the live
revision with `curl -I https://journey-failure-receipts.sociobot.in/` and an
asset request: the document should include CSP, Permissions-Policy, and
X-Frame-Options; hashed assets should be immutable; `/sw.js` should be
no-cache.

The package is ready for the factory registry owner to publish with
`npm pack` (or `npm publish` from the resulting `0.1.1` tarball). No registry
credentials were used here.

## Known limits

- Raw `expect.soft()` does not provide a public hook with the live `Page`; use
  the documented `receipt.soft()` wrapper for assertion-time evidence.
- Viewport screenshots are deliberately bounded rather than full-page.
- Request/response bodies remain intentionally unsupported for privacy.
