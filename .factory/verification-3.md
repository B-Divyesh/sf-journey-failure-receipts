# Independent product QA verification 3 — PASS

**Candidate:** `6e762524b43e58081d107783251f6e7b552e2d57` (`main`)

**Live URL:** https://journey-failure-receipts.sociobot.in/

**Verdict:** **PASS — candidate is releasable.** This clean-checkout retest independently reproduces the library's real assertion-level receipt workflow and verifies that the two prior privacy blockers are repaired in the actual packed package. No Critical, High, Medium, or Low product defects were found.

## Environment, identity, and scope

- Verification began from a clean checkout at the exact candidate SHA on 2026-08-28, using Node `v22.23.2`, npm `10.9.8`, and the preinstalled Playwright Chromium for `@playwright/test` `1.58.2`.
- `npm ci` installed 93 packages. npm reported one pre-existing **low** audit advisory; it is not a runtime dependency defect in this package.
- Freshly built `dist/site` SHA-256 matched the live `/`, `/privacy/`, `/terms/`, `/sw.js`, hashed JS/CSS, hero WebP, and both fonts requested by the live home page. The live deployment is therefore this candidate's site build.
- This is a local-first static documentation site plus npm library. It exposes no server-side API, sign-in, billing/unlock, persistence, or backend endpoint; rate-limit and Entra checks are not applicable.

## Local quality gates

| Check | Result | Evidence |
| --- | --- | --- |
| `npm ci` | PASS | Clean install completed. |
| `npm run typecheck` | PASS | `tsc --noEmit` had no diagnostics. |
| `npm test` | PASS | Exit 0: 4 Vitest tests, fixture smoke, actual-packed-consumer test, and 5 production-site Playwright tests. The fixture/consumer intentionally cause a Playwright soft failure; their wrappers require receipt creation and continued execution before returning success. |
| `npm run build` | PASS | tsup emitted ESM, CJS, and declarations; Vite emitted `dist/site`. |
| `npm pack --dry-run` | PASS | 22 files; `journey-failure-receipts-0.1.3.tgz`, 61.5 kB compressed / 273.8 kB unpacked. |
| Lint | N/A | No lint script is supplied by the repository. |
| Clean packed consumer | PASS | Installed the actual tarball into a new `/tmp` consumer with Playwright 1.58.2. CJS root/subpath, ESM root, and reporter exports loaded: `createReceiptTest`, `expect`, `test`, and `JourneyReceiptReporter`. |

## End-to-end, boundary, and privacy evidence

- The public `receipt.soft()` API froze evidence on a normal intentional assertion failure, created one self-contained receipt, returned `undefined`, recorded the Playwright soft error, and allowed the journey to update state afterwards.
- The actual packed-consumer run used the original adversarial short values `Li`, `NY`, `CA`, `XY`, `OK`, `ID`, and `NO`, plus associated labels/descriptions and a configured selector. Neither its scrubbed DOM nor ARIA evidence contained any marker; ARIA retained the structural `textbox "[redacted]"` evidence.
- The same packed run requested paths containing `ALICE_UNIQUE`, `customer-slug`, `abc123`, and `QUERY_SECRET`. The receipt contained none of them and retained the safe documented template `https://api.example.test/:redacted/:redacted`.
- An independent temporary verifier fixture exercised recovery and boundaries: two failed wrapped assertions with `maxReceipts: 1` both continued, exactly one receipt was written, invalid `##invalid` was recorded as a capture note, a 1-byte screenshot cap omitted the image with a note, and 8-byte DOM/ARIA caps recorded truncation instead of suppressing the assertion. The receipt contained neither `secret` nor `Sensitive`. The temporary fixture was removed before handoff.
- Source and packaged behavior have no telemetry, no request/response body capture, metadata-only network summaries, bounded default artifacts, structural masking for all form controls and configured selectors, URL path templating, and local output only. README, MIT license, CHANGELOG, privacy, and terms are present.

## Live browser, accessibility, privacy, PWA, and policy evidence

- Fresh live Chromium at desktop found title `Journey Failure Receipts — freeze the failed state`, `lang="en"`, exactly one `<h1>` and `<main>`, no console errors or page errors, and only `https://journey-failure-receipts.sociobot.in` requests. Keyboard `ArrowDown` advanced the checkpoint demo to checkpoint 3.
- At 390×844, document `scrollWidth` equalled `clientWidth` (390), installation code received keyboard focus with a visible `rgb(185, 56, 46) solid 3px` outline, and reduced motion reduced the entry animation to `1e-05s`.
- Fresh axe scans at desktop and 390 px found **0 serious** and **0 critical** violations. Local site tests also cover both legal pages.
- After service-worker activation and reload, the live worker controlled the page. Offline reload returned 200, retained the H1, showed the offline banner, and emitted no errors. The deployed worker uses `journey-receipts-v2`, `skipWaiting()`, client claiming, and stale-cache deletion. A two-revision update transition could not be simulated against a single live revision.
- Live response headers include CSP restricted to `'self'`, HSTS, `nosniff`, strict-origin referrer policy, Permissions-Policy, and `X-Frame-Options: DENY`. Hashed JS/CSS, WebP, and fonts are `public, max-age=31536000, immutable`; `/sw.js` is `no-cache, no-store, must-revalidate`.
- Built initial JS is 3,281 B, CSS 16,154 B, all self-hosted fonts total 64,936 B, and hero WebP is 58,108 B: all within the applicable budgets. Lighthouse 13.4.1 was attempted twice against the live URL using the installed Chromium and exited because the browser tab crashed; this environment limitation did not prevent the independent browser, axe, asset-budget, cache, or error checks above.

## Defects by severity

- **Critical:** none.
- **High:** none.
- **Medium:** none.
- **Low:** none.

## Retest commands

```sh
npm ci
npm run typecheck
npm test
npm run build
npm pack --dry-run
```
