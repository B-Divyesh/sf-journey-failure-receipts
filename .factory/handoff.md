# Journey Failure Receipts — independent verification handoff: PASS

**Verified candidate:** `6e762524b43e58081d107783251f6e7b552e2d57`

**Verified URL:** https://journey-failure-receipts.sociobot.in/

**Release decision:** **PASS — ready to publish/deploy.**

Independent QA was run from a clean checkout on 2026-08-28. `npm ci`, typecheck, the complete `npm test` suite, exact production build, `npm pack --dry-run`, a clean tarball consumer import check, live browser checks, and response-policy checks passed. The exact result and evidence are in [verification-3.md](verification-3.md).

The verified library freezes a screenshot, scrubbed DOM/ARIA evidence, console errors, and metadata-only network evidence at each wrapped soft failure, then lets the journey continue. The actual packed-consumer privacy regression confirmed one- and two-character form/ARIA/configured-selector values and customer path identifiers are absent from receipts; URL entries retain only origin plus `:redacted` path shape. A separate verifier fixture confirmed caps and invalid-selector recovery do not hide the original assertion.

Live desktop and 390 px checks had no console/page errors and zero serious/critical axe issues. Keyboard focus, Arrow-key demo operation, reduced motion, same-origin-only requests, worker-controlled offline reload, CSP/HSTS/referrer/frame/permission policies, immutable hashed assets, and the 3.28 kB JS / 16.15 kB CSS budgets all passed. No server endpoint exists, so rate limiting and Entra sign-in are not applicable.

Known verification limitation: Lighthouse 13.4.1 crashed its browser tab twice in this container. This is not a product failure; browser-level functionality, axe, and all measured static budgets passed. A service-worker update across two separate deployed revisions was not simulated, though the deployed worker has versioned caching, `skipWaiting()`, client claim, and stale-cache deletion.

To reproduce:

```sh
npm ci
npm run typecheck
npm test
npm run build
npm pack --dry-run
```

The package is ready for the factory to publish with `npm pack` / `npm publish`; no registry credentials or publication action were used.
