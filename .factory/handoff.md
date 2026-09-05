# Journey Failure Receipts repair 4 handoff

## Outcome

Strict review findings F-2-1 through F-2-9 are resolved. The npm library, clean consumer, documentation site, isolated demo, offline path, legal routes, and designed 404 pass locally and on the custom HTTPS domain.

Deployed implementation commit: `97004315796ec2f902fd9daa661de95a50030395`.

Static deployment ID: `1ac79cb6-6cc8-49f1-9479-1f06a72f6bf4`. The deployed home, demo, privacy, terms, service worker, and hashed JavaScript byte-match that commit's `dist/site` output.

This handoff is a later report-only change. It does not require another static deployment.

## Review finding disposition

| Finding | Disposition |
| --- | --- |
| F-2-1 clean install | `package-lock.json` is tracked. A fresh clone at the implementation SHA completed `npm ci`; CI now repeats clean install, test, build, and pack on Node 20 and 22. |
| F-2-2 route metadata | Privacy, Terms, and 404 now include route-specific canonical, Open Graph, Twitter-card, share-image, favicon, and apple-touch metadata. A browser test enumerates every route and validates the complete rendered metadata set. |
| F-2-3 screenshot masking | `screenshot-redaction` decodes the PNG from an actual packed-consumer receipt and verifies form and configured-selector regions are opaque mask pixels. |
| F-2-4 network data boundary | `network-metadata-only` sends unique request/response body, header, path, query, fragment, and credential markers. None enters the receipt; method, status, type, URL shape, and duration remain. |
| F-2-5 receipt context | `receipt-context-fields` parses the packed receipt and validates test, project, ISO capture time, redacted page URL, and assertion failure. |
| F-2-6 Node 20 | `test:node20` uses bundled Node 20.19.5 to typecheck, run unit tests, build the library/site, and load ESM and CommonJS exports. CI includes Node 20 and 22. |
| F-2-7 package upload | `package-no-upload` blocks and records page, fetch, HTTP, HTTPS, TCP, and TLS calls during packed receipt creation. No call occurs. |
| F-2-8 demo action copy | The first action now says its result accurately: “Open the editable failure receipt in the demo.” |
| F-2-9 terminology | Visitor copy consistently says “soft assertion”; `.factory/copy-audit.md` records the terminology. |

Earlier review and verification findings remain fixed: structural DOM/ARIA redaction, short-value redaction, URL-path masking, mobile code-region focus, same-origin demo traffic, isolated `demo:` storage, reset and Start for real behavior, service-worker activation/update cleanup, security headers, immutable asset caching, direct demo routing, and the designed 404.

## Clean-checkout verification

Fresh clone: `/tmp/jfr-repair-4-clean.NC5L1T/repo` at `97004315796ec2f902fd9daa661de95a50030395`.

All documented commands passed:

```sh
npm ci
npm run typecheck
npm test
npm run build
npm pack --dry-run
```

`npm test` passed 6 unit checks, the intentional failing-assertion fixture wrapper, the actual-tarball consumer wrapper, and 9 browser checks. The two wrappers expect Playwright exit 1 internally, then return success only after validating receipts and continued execution.

All 15 `.factory/claims.json` entries were run individually from that clean clone and passed. The package dry-run contains 24 files and is 62.8 kB compressed / 277.7 kB unpacked. The consumer installed the tarball in a new temporary project and loaded root, Playwright, and reporter exports through both ESM and CommonJS.

The fixture also checks recovery and boundaries: an invalid selector becomes a capture note, two failed assertions continue, and `maxReceipts: 1` writes exactly one receipt.

## Browser, accessibility, privacy, and performance

- Fresh 1440×900 and 390×844 live contexts showed the job, audience, primary action, and action result before scrolling. There was no horizontal overflow or unexpected console/page error.
- One click opened the realistic checkout sample. The sample label remained present; editing updated the receipt; the private marker stayed absent; Reset restored defaults; Start for real cleared demo state; a seeded real-data key remained unchanged.
- Fresh live Axe scans had 0 serious and 0 critical violations. Route tests also scan home, demo, Privacy, Terms, and 404. Keyboard focus, back/forward navigation, one `h1`, one `main`, labels, alt text, and reduced motion passed.
- The live offline demo reloaded after worker activation and still created an edited receipt. Cache version `journey-receipts-v4` forces this deployment to replace the prior cached pages.
- The documentation/demo flow made same-origin GET requests only, set no cookies, and loaded no third-party scripts. Package capture initiated no browser or Node network call.
- An unknown live route intentionally returns HTTP 404 with the designed page, correct title, complete metadata, and return actions. Its browser resource error is expected evidence of the deliberate HTTP 404, not a product failure.
- Live response headers include CSP, HSTS, Permissions-Policy, `nosniff`, strict-origin referrer policy, and frame denial. Hashed assets are immutable; `sw.js` is `no-cache, no-store, must-revalidate`.
- Live mobile Lighthouse: Performance 100, Accessibility 100, Best Practices 100, SEO 100; FCP 1.1 s, LCP 1.5 s, TBT 0 ms, CLS 0, interactive 1.5 s.
- Built assets: 3,631 B initial JavaScript, 18,903 B CSS, 64,936 B fonts, and 58,108 B hero WebP.
- `/opt/fleet/lib/verify-url.sh` passed live for home, demo, Privacy, and Terms. Screenshots, Lighthouse JSON, browser report, and response copies are under `/work/.evidence/jfr-repair-4-live/`.

## Product files and operation

- Claims: `.factory/claims.json`
- Demo contract: `.factory/demo.md`
- Complete landing copy audit: `.factory/copy-audit.md`
- Visual system and asset provenance: `.factory/design.md`
- Catalog copy: `.factory/catalog-description.txt`, copied to `/work/.evidence/catalog-description.txt`
- Build output: `dist/package` and `dist/site`

Deploy `dist/site` with the existing `sf-journey-failure-receipts` static configuration. The product has no backend, database, tenant, payment, or external model integration, so restart persistence, 429, SQLite, billing, and AI checks do not apply.

## Known gaps

- The factory registry owner must publish the npm package; this repair did not use registry credentials or publish it.
- `npm audit --omit=dev` reports zero vulnerabilities. Full `npm audit` reports one low-severity Windows development-server advisory in the build-only `esbuild` version allowed by current `tsup`; it is not shipped as a package runtime dependency or used by the deployed static site.
