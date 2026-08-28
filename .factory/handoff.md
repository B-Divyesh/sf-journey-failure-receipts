# Journey Failure Receipts v0.1.3 repair handoff — READY

This repair addresses the independent verifier's **FAIL** for candidate
`0ede614092227a28998eaacd247b0906e671854e` recorded in
[verification-2.md](verification-2.md). It keeps the product as a local-first
Playwright npm library with a static documentation site.

## Release blockers repaired

- **Short form and accessibility strings:** ARIA evidence is now produced from
  a temporary, structurally scrubbed clone of the selected DOM subtree, rather
  than from the live customer page followed by text substitution. Every form
  control and configured selector receives a redacted accessible name before
  the snapshot is generated; associated labels and `aria-labelledby` /
  `aria-describedby` targets are scrubbed too. This protects one- and
  two-character values as well as longer values, without mutating the page.
- **Customer identifiers in network URLs:** network evidence retains the
  origin and path shape only. Every nonempty path segment is `:redacted`; URL
  credentials, query strings, and fragments are discarded.

## Exact regression coverage

`tests/run-packed-consumer.mjs` builds the package, installs the actual
`npm pack` tarball in a clean temporary consumer, and runs an intentional soft
failure. Its page uses the verifier's exact values: `Li` label/ARIA name, `NY`
placeholder, `CA` title, `XY` value, `OK` description, and `ID`/`NO`
configured-selector content. It requires both DOM and ARIA blocks, verifies
the ARIA block contains `textbox "[redacted]"`, and rejects every marker.
It also fetches name-, slug-, and opaque-ID paths and rejects
`ALICE_UNIQUE`, `customer-slug`, `abc123`, and the query secret while requiring
the documented `https://api.example.test/:redacted/:redacted` template.

## Verification — 2026-08-28

Clean install used Node `v22.23.2` and npm `10.9.8`:

```sh
npm ci
npm run typecheck
npm test
npm run build
npm pack --dry-run
```

All pass. `npm test` runs 4 Vitest tests, the intentional local fixture soft
failure wrapper, the actual-packed-consumer privacy regression, and 5 static
site Playwright tests. The two expected Playwright soft failures are asserted
by their wrappers: they prove receipt creation and continued journeys before
returning success. `npm pack --dry-run` reports a ready-to-publish
`journey-failure-receipts@0.1.3` tarball with 22 files, 61.5 kB compressed and
273.8 kB unpacked. The package owner can publish with `npm pack` (or
`npm publish`); no registry credentials were used here.

The built site remains within its static budgets: 3.28 kB initial JS, 16.15 kB
CSS, 64,936 B self-hosted fonts, and 58,108 B hero WebP. The local Playwright
site suite verifies desktop and 390×844 layouts, keyboard operation,
serious/critical axe violations = 0, legal pages, service-worker offline
reload, static policy artifacts, and asset budgets.

## Deployment and live verification

Deployed `dist/site` using the factory static deployment configuration on
2026-08-28. Azure Static Apps deployment ID:
`293024ec-1783-4c51-9ada-4d944d4bb3ae`; default host:
`https://kind-flower-010ec480f.7.azurestaticapps.net`; custom domain:
`https://journey-failure-receipts.sociobot.in/` (HTTPS 200).

Fresh post-deploy Chromium checks found one `h1`, one `main`, `lang="en"`, the
expected title, no console/page errors, and same-origin-only requests. Desktop
and 390×844 axe scans had zero serious/critical violations. At 390 px there is
no document horizontal overflow; the labelled installation example receives
keyboard focus, its focus outline is `rgb(185, 56, 46) solid 3px`, and
ArrowDown advances the demo to checkpoint 3. After service-worker control,
offline reload retained the heading and showed the offline banner without
errors. Live HTML, legal pages, worker, hashed JS/CSS, hero WebP, and a
self-hosted font byte-match `dist/site`. Live headers include CSP,
Permissions-Policy, HSTS, `nosniff`, strict-origin referrer policy, and frame
protection; hashed JS is immutable for one year and `/sw.js` is no-cache.

Lighthouse was attempted against the live URL with the installed Playwright
Chromium, but the Lighthouse browser tab crashed during capture in this
container. The independent page-load, axe, keyboard, offline, console,
same-origin, response-policy, byte-identity, and asset-budget checks above
completed successfully.

`npm ci` reports one pre-existing low-severity audit advisory. No production
dependency or telemetry was added.

## Known limits

- Use the documented `receipt.soft()` wrapper; raw `expect.soft()` has no
  public hook with the live `Page` at assertion time.
- Screenshot evidence is intentionally viewport-bounded and capped.
- Request and response bodies remain intentionally unsupported for privacy.
