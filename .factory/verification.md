# Independent QA verification — FAIL

**Candidate:** `82184b9d032304699f4a4b4c1bb6356b678f74e1` (`main`)

**Live URL:** https://journey-failure-receipts.sociobot.in/

**Verdict:** **FAIL — do not release/publish this candidate.** The packaged library can persist sensitive form data from accessibility names in failure receipts, which violates the researched brief's privacy constraint and the product's documented masking guarantee. The live 390 px site also has an axe **serious** keyboard-accessibility violation.

## Environment and candidate identity

- Started from a clean worktree at the exact candidate SHA; `npm ci` installed 93 packages successfully (Node `v22.23.2`, npm `10.9.8`).
- Built output and live output match byte-for-byte for `/`, `/privacy/`, `/terms/`, `/sw.js`, `/assets/index-ucOjkXXC.js`, and `/assets/style-CSochcKP.css` (including the live 11,071-byte homepage and 3,281-byte JS asset). The live deployment therefore represents this candidate's site build.
- No product code was changed during verification. Temporary consumer and QA fixtures were outside the repository.

## Local quality gates

| Check | Result | Evidence |
| --- | --- | --- |
| `npm ci` | PASS | Clean install completed. npm reported one low-severity audit advisory. |
| `npm test` | PASS | 4 Vitest tests; intentional failing Playwright fixture correctly returned failure to its wrapper while proving continuation/receipt creation; 5 site Playwright tests passed. |
| `npm run typecheck` | PASS | `tsc --noEmit` completed with no errors. |
| `npm run build` | PASS | Package ESM/CJS/declarations and `dist/site` produced. |
| `npm pack --dry-run` | PASS | 22 files; 20.5 KB tarball / 221.2 KB unpacked. |
| Packed clean consumer | PASS with defects below | Installed the actual tarball with `@playwright/test@1.58.2`; ESM and CJS package entry points load; public fixture produced receipts. |

## Functional and boundary evidence

- Normal soft-failure smoke: captures a JPEG screenshot, scrubbed DOM, ARIA, console and metadata-only network evidence; the journey continues after the soft failure.
- Boundary/recovery consumer run: with `maxReceipts: 1`, two failing wrapped assertions both returned `undefined` and continued; exactly one receipt was emitted. An invalid mask selector was recorded as a capture note; `maxScreenshotBytes: 1` recorded a capped screenshot rather than failing the assertion. The seeded form value `BOUNDARY_VALUE` was absent from that receipt.
- Invalid input recovery is therefore functional, but the privacy failure below means this cannot satisfy the real job safely.

## Release-blocking defects

### HIGH — ARIA snapshot leaks sensitive form/accessibility data

The library says every form control and configured selector is masked/redacted before capture. In a clean packed consumer, the following failing journey generated a receipt:

```html
<label>Account <input aria-label="ARIALABEL_UNIQUE_SECRET" value="FORMVALUE_UNIQUE_SECRET"></label>
<p data-private aria-label="MASKARIA_UNIQUE_SECRET">MASKED_VISIBLE_TEXT</p>
```

The emitted receipt contains:

```text
- textbox "ARIALABEL_UNIQUE_SECRET": [redacted]
```

The form value was redacted, but its accessible name was persisted in the ARIA snapshot. The implementation takes `ariaSnapshot()` from the live page and only runs generic/string-value redaction, so `aria-label`/associated-label content that is not otherwise a scanned form value leaks. This is a direct breach of the brief's requirement to mask form state before capture and can expose customer data in CI artifacts.

**Required fix:** sanitize the accessibility snapshot using the same form and configured-selector policy before writing it (including accessible names/descriptions and label text), add regression coverage for form `aria-label`, associated `<label>`, and configured-selector accessible text, then repeat the packed-consumer privacy test.

### HIGH — 390 px mobile has a serious axe keyboard-accessibility failure

Fresh live Chromium + axe scan at a 390×844 viewport found:

- `scrollable-region-focusable` (serious)
- Target: the installation-code `<pre>` element
- axe result: “Scrollable region must have keyboard access”; it has horizontal overflow on mobile but is not focusable and has no focusable descendant.

This fails the acceptance requirement for keyboard-only mobile operation and the attached accessibility skill's no-serious/critical baseline. Desktop axe has zero serious/critical findings; the existing repository axe test only exercises desktop, so it misses this mobile regression.

**Required fix:** make the overflowing code region keyboard reachable (for example, a correctly labelled `tabindex="0"` scroll container) or eliminate the overflow, and add a 390 px axe regression test.

## Site, browser, privacy, and deployment checks

- **Desktop 1440 px:** loaded with no console errors or `pageerror`; title, `lang`, one `h1`, `main`, skip link, visible solid focus outline, tab demo ArrowDown behavior, and reduced-motion override all worked.
- **Mobile 390 px:** no document horizontal overflow (`scrollWidth === clientWidth === 390`); the serious axe issue above remains.
- **Axe:** desktop zero serious/critical; mobile one serious, zero critical. `/privacy/` and `/terms/` passed the repository axe checks.
- **Outbound/privacy:** observed browser requests were limited to same-origin HTML, assets, fonts, and hero image. No analytics, third-party scripts, or external font requests. The static inspection also found no application `fetch`/telemetry endpoint.
- **PWA:** live service worker became controller after reload; offline reload returned 200, showed the homepage and the offline banner, with no console errors. Update behavior could not be exercised against a second deployed revision; the worker uses fixed cache key `journey-receipts-v1` and has no `skipWaiting`, so verify upgrade/cache invalidation on the first post-fix deployment.
- **Response policies:** HSTS, `nosniff`, and `strict-origin-when-cross-origin` are present. No CSP, Permissions-Policy, or frame-ancestors/X-Frame-Options header was served. Hashed JS, font, image, and service-worker assets all use `cache-control: public, must-revalidate, max-age=30`, not long-lived immutable caching.
- **Performance budget:** built initial JS 3,281 B, CSS 16,154 B, fonts 64,936 B total, hero 58,108 B — all under stated artifact budgets. The short live caching policy is a deployment performance gap but not the reason for the FAIL.

## Retest command set

```sh
npm ci
npm test
npm run typecheck
npm run build
npm pack --dry-run
```

Then install the produced tarball into a new consumer with `@playwright/test@1.58.2`, run a failing `receipt.soft` case containing form and configured-selector `aria-label`/label secrets, and assert none of those marker strings occur in the generated receipt. Run axe at both desktop and 390 px against the deployed URL before changing this verdict.
