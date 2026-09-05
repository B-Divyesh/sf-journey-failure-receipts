# Journey Failure Receipts verification 4 handoff

## Result

**FAIL — 2 findings, 0 untested claims.**

Independent QA reviewed implementation `97004315796ec2f902fd9daa661de95a50030395` against documentation baseline `5f4f04fa453bafb586d11b5b518c27b1cbe65534` and the live site at https://journey-failure-receipts.sociobot.in/.

No product code was changed. The full report is `.factory/verification-4.md`.

## Open findings

1. Medium: an unbroken 32-character assertion label expands the 390 px demo to 872 px; longer labels expand it further. Add wrapping/constraining and a mobile boundary regression.
2. Low: header/footer wordmarks and the short Terms link have mobile hit boxes below the required 44×44 px. Add minimum target dimensions and a route-wide mobile assertion.

## Verified

- All 15 declared claim commands passed individually from a clean checkout.
- `npm ci`, `npm run typecheck`, `npm test`, `npm run build`, and `npm pack --dry-run` passed.
- The real packed tarball loaded through ESM and CommonJS and passed receipt creation, continuation, screenshot/DOM/ARIA redaction, network-boundary, context, no-upload, invalid-selector, and receipt-cap checks.
- Fresh desktop and phone sessions passed the first-read test and the normal demo, reset, exit, isolation, privacy, route, keyboard, reduced-motion, and offline flows.
- The previous short-secret, ARIA, and customer-path leaks remain fixed.
- Home, Demo, Privacy, Terms, and designed 404 metadata and structure passed. The deliberate unknown-route HTTP 404 is expected.
- Axe CLI and Playwright Axe found zero violations on tested routes. Mobile Lighthouse scored 100 in all four categories.
- The live site byte-matches the implementation build for all checked pages and key assets.
- Production dependencies have zero known vulnerabilities. One low Windows-only build-time `esbuild` advisory remains in development dependencies.

## Evidence and commands

Primary evidence is under `/work/.evidence/jfr-verification-4/`. The required copies are `/work/.evidence/qa-report.md` and `/work/.evidence/qa-result.json`.

Retest from a clean checkout:

```sh
npm ci
npm run typecheck
npm test
npm run build
npm pack --dry-run
node -e "for (const c of require('./.factory/claims.json')) console.log(c.test)"
```

Run each printed claim command as a separate entry. Then retest the live demo at 390×844 with a 32-character unbroken assertion label and measure every interactive target.

## Scope notes

The product has no backend, database, tenant, payment, authentication, or rate-limited endpoint, so backend persistence, isolation, health, and 429 checks do not apply. Npm publication remains for the registry owner after the findings are repaired.
