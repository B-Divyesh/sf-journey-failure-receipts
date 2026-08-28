# Independent product QA verification 2 — FAIL

**Candidate:** `0ede614092227a28998eaacd247b0906e671854e` (`main`)

**Live URL:** https://journey-failure-receipts.sociobot.in/

**Verdict:** **FAIL — do not publish or release this candidate.** The library still writes customer data into local CI receipt artifacts, violating the brief's privacy constraint and its documented privacy guarantees.

## Method and identity

- Verification began with a clean worktree at the exact candidate SHA (`git status` clean), on Node `v22.23.2` and npm `10.9.8`; `npm ci` installed 93 packages. npm reported one existing low-severity audit advisory.
- The live `/`, `/privacy/`, `/terms/`, `/sw.js`, hashed JS/CSS, hero WebP, and a self-hosted font were byte-for-byte identical to this candidate's freshly built `dist/site` output. The deployed documentation site is therefore this candidate's site build.
- No product source code was changed. The independent adversarial consumer project was created under `/tmp` and installed the actual `npm pack` tarball (`journey-failure-receipts-0.1.1.tgz`, 22 files, 53.2 kB compressed / 244.2 kB unpacked).

## Quality gates

| Check | Result | Evidence |
| --- | --- | --- |
| `npm ci` | PASS | Clean dependency install completed. |
| `npm run typecheck` | PASS | `tsc --noEmit` completed without diagnostics. |
| `npm test` | PASS | 4 Vitest tests; intentional fixture and packed-consumer soft failures were correctly asserted by their wrappers; all 5 production-site browser tests passed. |
| `npm run build` | PASS | tsup emitted ESM, CJS and declarations; Vite emitted `dist/site`. |
| `npm pack --dry-run` / packed install | PASS | Actual tarball installed into a clean consumer; ESM fixture and direct CJS entry-point loading worked. |
| Lint | N/A | The repository provides no lint script. |

## Functional, boundary, and recovery evidence

- The documented normal `receipt.soft()` flow captured its screenshot, scrubbed DOM/ARIA, console, and metadata-only network evidence, returned `undefined` after failure, and the test continued.
- In an independent packed-consumer boundary test, `maxReceipts: 1` let two failed wrapped assertions continue while writing exactly one receipt. An invalid selector (`##invalid`) was recorded as a capture note, and `maxScreenshotBytes: 1` omitted the screenshot with a cap note instead of hiding the assertion.
- The official packed-consumer test passed for its longer seeded privacy strings, but the boundary cases below expose untested privacy holes.

## Release-blocking defects

### HIGH — short form and accessibility strings are persisted in receipts

The README promises that every form control and configured selector is masked/redacted, including their accessible names, descriptions, and associated label text. In a clean consumer installed from the actual packed tarball, I generated a receipt from:

```html
<label for="account">Li</label>
<input id="account" aria-label="Li" aria-describedby="account-description"
  placeholder="NY" title="CA" value="XY">
<p id="account-description">OK</p>
<p data-private aria-label="ID">NO</p>
```

The receipt persisted `Li`, `NY`, `CA`, `OK`, `ID`, `NO`, and the form value `XY`; its ARIA section includes `textbox "Li"`, `/placeholder: NY`, and `text: XY`. The implementation deliberately excludes sensitive strings shorter than three characters before redaction. That threshold contradicts “every” control/selector and can disclose short customer state (for example names, initials, region codes, short answers, or account fragments) in CI artifacts.

**Required fix:** remove the minimum-length exception for values originating from form controls, associated labels/descriptions, and configured selectors; redact their relevant attributes and ARIA output structurally, rather than depending only on substring replacement. Add packed-consumer regressions for one- and two-character field values, labels, placeholders, titles, ARIA labels/descriptions, and configured-selector text.

### HIGH — network receipt preserves customer identifiers in URL paths

The README says network entries contain a “redacted origin/path,” while the brief requires CI artifacts not expose customer data. A packed consumer routed and fetched:

```text
https://api.example.test/customers/ALICE_UNIQUE?token=QUERY_SECRET
```

The produced receipt correctly omitted the query secret but rendered this network row:

```text
https://api.example.test/customers/ALICE_UNIQUE
```

The library's URL sanitizer leaves ordinary, short path segments unchanged. Customer IDs and names frequently use such paths, so the metadata-only capture still exposes customer data.

**Required fix:** store only a redacted origin plus a consistently redacted/path-template representation by default (or otherwise redact every path segment unless explicitly allowlisted), document the exact policy, and add a packed-consumer regression for name-, slug-, and nonnumeric-ID paths.

## Live site, accessibility, privacy, and performance evidence

- **Desktop and 390×844 mobile:** fresh Chromium checks found one `h1`, one `main`, `lang="en"`, expected title, no horizontal document overflow at 390 px, and no console or page errors. The labelled installation code region receives keyboard focus; ArrowDown advances the demo to checkpoint 3; the focused tab has a visible `rgb(185, 56, 46)` 3 px solid outline. Reduced-motion evaluates true and reduces animation/transition durations to `0.00001s`.
- **Axe:** fresh desktop and 390 px scans found zero serious or critical violations. The prior mobile scrollable-code violation is repaired.
- **Privacy/outbound requests:** a fresh page load made requests only to `https://journey-failure-receipts.sociobot.in`; no analytics, telemetry, third-party script, or CDN font request was observed.
- **PWA:** after the worker became ready and the page reloaded, it controlled the client. With the browser offline, reload returned 200, retained the `h1`, displayed the offline banner, and produced no errors. The worker contains version `journey-receipts-v2`, `skipWaiting()`, client claiming, and stale-cache deletion. A cross-deployment update could not be simulated with only one live revision.
- **Headers/caching:** live HTML has CSP, Permissions-Policy, HSTS, `nosniff`, strict-origin referrer policy, and `X-Frame-Options: DENY`; hashed JS/CSS, font, and hero are `public, max-age=31536000, immutable`; `/sw.js` is `no-cache, no-store, must-revalidate`.
- **Budgets:** initial JS 3,281 B, CSS 16,154 B, self-hosted fonts 64,936 B total, and hero WebP 58,108 B: all below the stated budgets. A Lighthouse CLI run could not yield scores because its headless Chrome target crashed during full-page screenshot capture (`TARGET_CRASHED`); the separate live axe, browser, asset-budget, and error checks above completed successfully.

## Retest requirements

```sh
npm ci
npm run typecheck
npm test
npm run build
npm pack --dry-run
```

Then install the newly packed tarball in a fresh consumer. Verify a receipt contains none of the one-/two-character form and configured-selector strings above, and contains neither `ALICE_UNIQUE` nor a comparable customer path identifier. Re-run desktop and 390 px axe/browser checks against the updated live deployment before changing this verdict.
