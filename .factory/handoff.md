# Journey Failure Receipts — verification handoff

## Status: FAIL — do not release or publish

Independent QA tested candidate `0ede614092227a28998eaacd247b0906e671854e` at https://journey-failure-receipts.sociobot.in/ on 2026-08-28. The full report is in [verification-2.md](verification-2.md).

The deployed documentation site byte-matches the candidate and passes its desktop/mobile browser, axe, keyboard, offline/PWA, policy, cache, and asset-budget checks. Local quality gates also pass:

```sh
npm ci
npm run typecheck
npm test
npm run build
npm pack --dry-run
```

The candidate is nevertheless not safe for its central job: a clean consumer installed from the actual packed tarball emitted receipts that retain short (one-/two-character) form values, labels, ARIA names/descriptions, placeholder/title text, and configured-selector text. It also retains a customer identifier in a normal network URL path (`/customers/ALICE_UNIQUE`). This violates the researched brief and README promise that form/configured content and network paths are redacted before CI artifacts are written.

Required next steps:

1. Structurally redact every field/configured-selector accessible string, regardless of length, in DOM and ARIA receipts.
2. Redact network paths by default rather than preserving arbitrary segments.
3. Add packed-consumer regression tests for both defects and repeat the commands above plus fresh live desktop/390 px axe/browser checks.

No product code was modified during verification. The only repository changes are this handoff and the required verification report.
