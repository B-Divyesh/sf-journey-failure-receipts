# Adversarial first-read review 1 — Journey Failure Receipts

**URL checked:** `https://journey-failure-receipts.sociobot.in/`  
**Review date:** 2026-08-28  
**Verdict: FAIL**

The product is visually distinct and the live landing page has no browser-console errors, but it does not meet the first-read, try-it-now, claims, or routing contract. There are four BLOCKING findings; this cannot pass regardless of the minor count.

## Cold first read

I opened fresh Chromium contexts at 390×844 and 1440×900, before scrolling.

| Question | What a visitor can infer | Result |
| --- | --- | --- |
| What does this do? | Probably a Playwright add-on that captures failure evidence. The lede says it captures “visual, DOM, console, and network state” at a failed soft assertion. | Partly clear, but the headline itself is metaphorical. |
| For whom? | Not stated on the first screen. “A tiny Playwright fixture” names a technical implementation, not the teams or situation it is for. | **Not clear.** |
| What should I click first? | There are two competing actions: “Add to Playwright” and “Open a receipt.” Neither says what result appears, and neither is a sample-data try-out. | **Not clear.** |

**BLOCKING — first screen fails the cold-read test.**

- **Quote:** “Freeze the failure. Keep the journey moving.” / “A tiny Playwright fixture …” / “Add to Playwright” / “Open a receipt”.
- **Why this loses a first-time visitor:** the headline names neither the artefact nor the user’s job; the lede omits the audience; the two actions compete and do not state their outcomes. On mobile the nav also hides “Inspect demo” and “Install,” leaving the two ambiguous hero actions.
- **Concrete fix:** use a job headline and an audience sentence, for example: **“Capture each failed Playwright assertion”** and **“For test teams who need the exact page state before a soft failure changes the flow.”** Make the sole primary action **“Try it with sample data”** with adjacent text **“Open an editable failure receipt in this page.”** Keep **“Install the Playwright fixture”** as the secondary action.

## Findings, ordered by severity

### BLOCKING — no one-click library playground or isolated demo

- **Evidence:** no landing control is named “Try it with sample data.” `https://journey-failure-receipts.sociobot.in/demo` returns HTTP 404. `?demo=1` returns the normal landing page. After selecting a checkpoint in that fresh `?demo=1` context: banner matches = 0; “Reset demo” = 0; “Start for real” = 0; editable `input`/`textarea`/`select`/`contenteditable` controls = 0. The only browser storage observed was the public service-worker cache `journey-receipts-v2`; no `demo:` namespace exists.
- **Quote:** “02 / Live receipt specimen” and “Choose a checkpoint to inspect the evidence an engineer receives.”
- **Why this loses or misleads:** this is a hard-coded three-tab illustration, not an in-page playground using the published library. It cannot create a receipt from realistic sample input, cannot demonstrate the actual npm package, and cannot establish that demo data is isolated from real storage.
- **Concrete fix:** add `/demo` (or `?demo=1`) with an editable, bundled sample Playwright failure and observable receipt output produced by the packed/published package. Place **“Try it with sample data”** in the hero. Show a persistent **“Demo — sample data, nothing is saved”** banner with working **“Reset demo”** and **“Start for real”** controls. Document the URL, sample, reset behavior, and `demo:` storage namespace in `.factory/demo.md`. Add browser tests that mutate demo input, reset it, and prove real keys are neither read nor written.

### BLOCKING — claims registry and claim tests are absent

- **Evidence:** `.factory/claims.json` is absent (`test -f .factory/claims.json` exited 1). `rg '@claim:'` found no claim tag. Therefore there were zero listed claim commands to run from the clean clone, rather than a verified claim suite.
- **Why this loses or misleads:** visitors are asked to rely on privacy, locality, offline, masking, and dependency statements without a machine-readable claim or an isolated observable test. The required proof chain does not exist.
- **Concrete fix:** create `.factory/claims.json`; give every claim below a distinct `@claim:<id>` test that enters `/demo` from a fresh context. In particular test receipt creation from the editable sample, structural redaction, same-origin-only traffic throughout the demo, offline reload after the first visit, reset/namespace isolation, and the stated package/runtime facts where observable. Delete statements that cannot be tested.

#### Unlisted-claim inventory

Each row is an individual **unlisted claim** because the required registry does not exist. The quoted wording is from the live landing page or README; none has a corresponding claim entry/test.

| Surface | Unlisted claim |
| --- | --- |
| Landing | “A tiny Playwright fixture that captures the visual, DOM, console, and network state at each failed soft assertion—not at the end of the test.” |
| Landing | “Local only” |
| Landing | “Scrubbed first” |
| Landing | “Zero runtime dependencies” |
| Landing | “Evidence is captured at the failure coordinate while the route continues.” |
| Landing | “Fields, selectors, query strings, and credentials stay out.” |
| Landing | “Current viewport, with every form control and configured selector covered before pixels are captured.” |
| Landing | “A selected subtree with values removed, capped by bytes, paired with its accessibility shape.” |
| Landing | “The bounded warnings and errors that led up to the assertion, with detected secrets redacted.” |
| Landing | “Method, origin plus a fully redacted path shape, type, status, and duration.” |
| Landing | “Bodies, headers, queries, and fragments never enter the file.” |
| Landing | “Test, project, page, timestamp, and the failure message, frozen into one portable HTML receipt.” |
| Landing | “The helper freezes evidence, then records a real Playwright soft failure so your test can continue.” |
| Landing | “Free, MIT licensed, and local by default.” |
| Landing | “No account. No upload. No lock-in.” |
| README | “Each failed wrapped assertion produces one scrubbed, self-contained HTML receipt with a screenshot, selected DOM and ARIA snapshot, console errors, and a metadata-only network summary.” |
| README | “It has no telemetry, service, or runtime dependency beyond Playwright.” |
| README | “Receipts are ordinary self-contained `.html` files with an embedded, bounded screenshot.” |
| README | “Open them directly; no server, account, or network connection is required.” |
| README | “Every `input`, `textarea`, `select`, and `[contenteditable]` is masked in screenshots and redacted in DOM and ARIA captures.” |
| README | “ARIA evidence is generated from a temporary scrubbed clone—not the live page …” |
| README | “Add `maskSelectors` for customer data rendered outside form controls; their text and accessible names/descriptions are structurally redacted in every capture.” |
| README | “Request and response bodies are never captured.” |
| README | “Network entries contain only method, resource type, status, duration, and a URL template …” |
| README | “Authorization, cookies, query strings, URL credentials, and fragment values are discarded.” |
| README | “Limits default to 5 receipts/test, 40 network entries, 20 console errors, 80 KB DOM, and 40 KB ARIA text.” |
| README | “Files remain local in your configured output directory.” |
| README | “There is no telemetry.” |
| README | “Invalid selectors and unavailable pages do not hide the assertion …” |
| README | “`receipt.soft` … captures a receipt and records a soft test error on failure.” |
| README | “The test continues.” |
| README | “`npm run build` produces ESM, CommonJS, and `.d.ts` package files in `dist/package`, then builds the documentation/demo site into `dist/site` …” |

### BLOCKING — `/demo` is broken and the 404 is provider-default

- **Evidence:** `GET /demo` and `GET /missing-route` each returned HTTP 404 with title **“Azure Static Web Apps - 404: Not found.”** The source `staticwebapp.config.json` has no navigation fallback or 404 route. The supplied sitemap also has no demo URL.
- **Why this loses or misleads:** a library’s required playground deep link is unavailable, and a visitor who follows it sees generic host branding rather than an explanation and a way back. This also prevents route-specific title, focus, and back-button behavior from being verified.
- **Concrete fix:** publish a real `/demo` route, include it in the sitemap, and add a product-styled `/404` route with an `h1`, clear return link, correct title, focus transfer, and live announcement. Configure the static host for those routes and add deep-link/reload/back-button tests.

### BLOCKING — offline and privacy sandbox behavior is not verifiable

- **Quote:** “You’re offline. The docs and demo still work; generated receipts never need a network.”
- **Why this loses or misleads:** a fresh intercepted `?demo=1` session requested only same-origin static assets, but it was not a demo. There is no package playground, no sample receipt flow, no demo storage namespace, and no registry test. It is therefore not possible to verify the online/offline or privacy promise under the required demo-only conditions.
- **Concrete fix:** after implementing `/demo`, intercept every request from demo entry through receipt generation and assert only documented same-origin requests; activate the worker, set the context offline, reload `/demo`, and create/reset a sample receipt. Register both claims and their tests.

### Major — required metadata and consistent shell are incomplete

- **Evidence:** the home page has `lang="en"`, one `h1`, one `main`, a 128-character description, and an SVG favicon. It has **no canonical link, Open Graph tags, Twitter-card tags, 1200×630 share image, or apple-touch icon.** The home title is `Journey Failure Receipts — freeze the failed state`; it follows the separator pattern but “freeze the failed state” is not plain-language functionality. Legal-route headers do not include Demo or Privacy consistently, and legal footers omit Source and a version/build id.
- **Why this matters:** social previews and canonical indexing are incomplete. Visitors cannot rely on the same navigation on each route, which makes the missing demo route harder to discover.
- **Concrete fix:** add canonical, OG, Twitter, and apple-touch metadata to every route; use **“Journey Failure Receipts — capture failed Playwright assertions”** for home. Use one shared header/footer with Home, Demo, Install, Privacy; retain Terms and Source in every footer and include a build/version identifier.

### Major — copy does not meet plain-words rules

- **Evidence:** the audit below records seven sentences over 22 words, repeated implementation jargon, ambiguous headings, and controls that do not name their result. The banned/unclear term “journey” appears in general copy and calls to action, not only the product name.
- **Why this loses a first-time visitor:** a user must decode “soft assertion,” “fixture,” “DOM,” “ARIA,” “metadata-only,” and “failure coordinate” before learning the simple outcome. “Inspect demo” describes an action that only scrolls to a static specimen.
- **Concrete fixes:** replace the headline and hero as specified in the first finding; expand abbreviations once or move them after the outcome; rename **“Inspect demo”** to **“View sample receipt”** only if it remains a static preview, otherwise make it **“Try sample receipt.”** Rename **“Add to Playwright”** to **“Install the Playwright fixture.”** Rename **“Open a receipt”** to **“View sample receipt.”** Replace isolated headings such as **“One failure. Five useful clues.”** with **“Sample receipt evidence.”**

## Copy audit

Word counts use visible prose words (letters/numbers, with code identifiers counted as one word). Code samples, decorative measurements, tab values, and duplicate navigation labels are excluded because they are not sentences. Headings and actionable labels are listed where they need a first-read check. `>22`, `J`, `M`, `H`, and `B` mean over 22 words, jargon, marketing/ambiguous adjective, heading out of context, and button/action mismatch.

### Landing page

| ID | Sentence or copy unit | Words | Flag / proposed rewrite |
| --- | --- | ---: | --- |
| L01 | Freeze the failure. | 3 | H, M. “Capture each failed Playwright assertion.” |
| L02 | Keep the journey moving. | 4 | J. “Keep the test flow running.” |
| L03 | A tiny Playwright fixture that captures the visual, DOM, console, and network state at each failed soft assertion—not at the end of the test. | 24 | >22, J, M (“tiny”). “For test teams, capture the page state when a soft assertion fails.” |
| L04 | Add to Playwright | 3 | B. “Install the Playwright fixture.” |
| L05 | Open a receipt | 3 | B: it scrolls, not opens. “View sample receipt.” |
| L06 | Local only | 2 | Unlisted claim. “Files stay in your test output folder.” (add test) |
| L07 | Scrubbed first | 2 | J, unlisted claim. “Masks selected data before capture.” (add test) |
| L08 | Zero runtime dependencies | 3 | J, unlisted claim. “Uses your existing Playwright install.” (add test) |
| L09 | Evidence is captured at the failure coordinate while the route continues. | 11 | J. “It saves evidence when the assertion fails, then the test continues.” |
| L10 | The evidence gap | 3 | H. “Why final test reports miss the failed state.” |
| L11 | The report shows where the test ended. | 7 | — |
| L12 | You need where it broke. | 5 | — |
| L13 | A soft assertion lets a critical journey continue. | 8 | J. “A soft assertion lets a test flow continue.” |
| L14 | That is useful—until the page changes three more times and the final trace no longer shows the broken cart, stale price, or silent JavaScript error. | 24 | >22, J. “Later steps can hide the broken cart or stale price. Capture evidence before they do.” |
| L15 | Run your normal Playwright assertion. | 5 | J for a newcomer. “Run the assertion you already use in Playwright.” |
| L16 | On failure, scrub and capture immediately. | 6 | J. “When it fails, mask selected data and save evidence.” |
| L17 | Register a soft failure; keep the journey running. | 8 | J. “Record a soft failure and keep the test flow running.” |
| L18 | Live receipt specimen | 3 | H, M: this is static. “Sample receipt preview.” |
| L19 | One failure. | 2 | H: does not identify the section. “Sample receipt from one failure.” |
| L20 | Five useful clues. | 3 | H, M. “Five evidence types in the sample receipt.” |
| L21 | Choose a checkpoint to inspect the evidence an engineer receives. | 10 | J. “Choose a sample step to view its saved evidence.” |
| L22 | Arrow keys move between checkpoints. | 5 | — |
| L23 | Fields, selectors, query strings, and credentials stay out. | 7 | J, unlisted claim. “The sample masks fields and removes query strings.” (add test) |
| L24 | Assertion failed · evidence frozen | 4 | J. “Assertion failed · receipt saved.” |
| L25 | Checkpoint 2 of 3: failed assertion evidence selected. | 8 | J. “Sample 2 of 3: failed assertion selected.” |
| L26 | Every receipt includes | 3 | H. “What each failure receipt contains.” |
| L27 | Enough state to diagnose. | 5 | M/jargon. “The details needed to find the test failure.” |
| L28 | Not enough to become a data leak. | 7 | M. “It removes selected private data before saving.” |
| L29 | Current viewport, with every form control and configured selector covered before pixels are captured. | 13 | J, unlisted claim. “A screenshot with form fields and selected elements masked.” (add test) |
| L30 | A selected subtree with values removed, capped by bytes, paired with its accessibility shape. | 14 | J. “A selected page section with values removed and a size limit.” |
| L31 | The bounded warnings and errors that led up to the assertion, with detected secrets redacted. | 14 | J, unlisted claim. “Recent warnings and errors, with detected secrets removed.” (add test) |
| L32 | Method, origin plus a fully redacted path shape, type, status, and duration. | 11 | J, unlisted claim. “Request method, site, status, type, and duration; path values are removed.” (add test) |
| L33 | Bodies, headers, queries, and fragments never enter the file. | 9 | J, unlisted claim. “It does not save request bodies, headers, query strings, or fragments.” (add test) |
| L34 | Test, project, page, timestamp, and the failure message, frozen into one portable HTML receipt. | 13 | J. “Each HTML receipt includes the test, page, time, and failure message.” |
| L35 | Field installation | 2 | H. “Install the Playwright fixture.” |
| L36 | Wrap only the assertions that matter. | 6 | M. “Wrap the soft assertions that need a receipt.” |
| L37 | Use regular expect inside receipt.soft. | 5 | J. “Use `expect` inside `receipt.soft`.” |
| L38 | The helper freezes evidence, then records a real Playwright soft failure so your test can continue. | 15 | J, unlisted claim. “It saves a receipt, records the soft failure, and lets the test continue.” (add test) |
| L39 | Ready for CI | 3 | H, J. “Use receipts in CI test output.” |
| L40 | Stop rerunning journeys just to see what already happened. | 9 | J, M. “See the failed state without rerunning the test.” |
| L41 | Install the fixture | 3 | B: action is acceptable but not result-specific. “Install the Playwright fixture.” |
| L42 | Free, MIT licensed, and local by default. | 7 | Unlisted claims. “Free under the MIT License; files stay local.” (add tests) |
| L43 | No account. | 2 | Unlisted claim. “No account is required.” (add test) |
| L44 | No upload. | 2 | Unlisted claim. “It does not upload receipts.” (add intercepted-flow test) |
| L45 | No lock-in. | 3 | M, untestable marketing. Delete. |
| L46 | Assertion-level evidence for Playwright journeys. | 5 | J. “Failure receipts for Playwright test flows.” |

### README

| ID | Sentence or copy unit | Words | Flag / proposed rewrite |
| --- | --- | ---: | --- |
| R01 | Capture the exact visual and DOM state when a critical Playwright journey assertion fails—not whatever state remains when the test finally ends. | 22 | J. “Capture the page state when a critical Playwright assertion fails.” |
| R02 | Journey Failure Receipts is a small, local-first Playwright fixture and reporter for teams diagnosing expect.soft()-style failures in checkout, sign-in, and other multi-step flows. | 23 | >22, J, M (“small”). “For Playwright teams, this saves a receipt when a soft assertion fails.” |
| R03 | Each failed wrapped assertion produces one scrubbed, self-contained HTML receipt with a screenshot, selected DOM and ARIA snapshot, console errors, and a metadata-only network summary. | 23 | >22, J, unlisted claim. Split into two short tested statements. |
| R04 | It has no telemetry, service, or runtime dependency beyond Playwright. | 10 | J, unlisted claim. “It sends no telemetry and uses your Playwright install.” (add test) |
| R05 | Create a project fixture. | 4 | J. “Create a receipt test fixture.” |
| R06 | Wrap assertions that may fail softly. | 6 | J. “Wrap a soft assertion that needs a receipt.” |
| R07 | Use regular expect, not expect.soft, inside the callback; receipt.soft catches the failure only after freezing its evidence and then records it as a Playwright soft failure. | 24 | >22, J. “Use `expect` inside the callback. `receipt.soft` saves evidence, then records a soft failure.” |
| R08 | The journey continues and another failure receives its own receipt. | 10 | J. “The test flow continues, and later failures get their own receipts.” |
| R09 | Add the optional reporter to print receipt locations in CI. | 10 | J. “Optional: print receipt paths in CI.” |
| R10 | Receipts are ordinary self-contained .html files with an embedded, bounded screenshot. | 10 | J, unlisted claim. “Receipts are HTML files with a size-limited embedded screenshot.” (add test) |
| R11 | Open them directly; no server, account, or network connection is required. | 10 | Unlisted claim. “Open the saved HTML file directly.” (add offline test) |
| R12 | Every input, textarea, select, and [contenteditable] is masked in screenshots and redacted in DOM and ARIA captures. | 14 | J, unlisted privacy claim. Add packed-playground test. |
| R13 | ARIA evidence is generated from a temporary scrubbed clone—not the live page—so accessible names, descriptions, and associated label text are structurally redacted even when they are one or two characters long. | 28 | >22, J, unlisted privacy claim. Split and test structural redaction. |
| R14 | Add maskSelectors for customer data rendered outside form controls; their text and accessible names/descriptions are structurally redacted in every capture. | 20 | J, unlisted privacy claim. “Use `maskSelectors` for private content outside form fields. The receipt removes that text and accessible name.” (add test) |
| R15 | Request and response bodies are never captured. | 7 | Unlisted claim. Add intercepted-flow test. |
| R16 | Network entries contain only method, resource type, status, duration, and a URL template: the origin is retained while every nonempty path segment becomes :redacted. | 22 | J, unlisted claim. Split and add path-template test. |
| R17 | Query strings, fragments, and URL credentials are discarded. | 8 | Unlisted privacy claim. Add test. |
| R18 | Authorization, cookies, query strings, URL credentials, and fragment values are discarded. | 10 | Unlisted privacy claim. Add test or merge with R17 to one tested claim. |
| R19 | Limits default to 5 receipts/test, 40 network entries, 20 console errors, 80 KB DOM, and 40 KB ARIA text. | 17 | J, quantitative unlisted claim. Add observable cap tests. |
| R20 | Configure lower caps for sensitive suites. | 6 | J. “Set smaller limits for tests with sensitive data.” |
| R21 | Files remain local in your configured output directory. | 8 | Unlisted claim. Add demo network/storage test. |
| R22 | There is no telemetry. | 5 | Unlisted claim. Add intercepted-flow test. |
| R23 | receipt.soft runs the assertion, returns its value on success, or captures a receipt and records a soft test error on failure. | 18 | J, unlisted behavior claim. Split and add playground test. |
| R24 | The test continues. | 3 | Unlisted behavior claim. “The test flow continues after the saved failure.” (add test) |
| R25 | It returns undefined after a failure. | 6 | J, unlisted behavior claim. Add test. |
| R26 | Invalid selectors and unavailable pages do not hide the assertion: the receipt records the capture error and the soft failure still reaches Playwright. | 21 | J, unlisted behavior claim. Split and add recovery test. |
| R27 | Requires Node 20+. | 3 | Quantitative compatibility claim; add CI matrix test or state in package metadata only. |
| R28 | npm run build produces ESM, CommonJS, and .d.ts package files in dist/package, then builds the documentation/demo site into dist/site with index.html at its root. | 25 | >22, J, unlisted build claim. Split or link to a tested build script. |
| R29 | Use npm run dev for the site. | 6 | J. “Run `npm run dev` to preview the documentation site.” |
| R30 | Deploy the contents of dist/site to any static host. | 10 | J, unlisted compatibility claim. “Deploy `dist/site` to your static host.” |
| R31 | The factory deployment target is https://journey-failure-receipts.sociobot.in; registry publishing is handled separately by the factory. | 14 | Internal deployment wording; remove from visitor-facing README. |
| R32 | This is assertion-level evidence for suites you already run. | 9 | J. “Use this with Playwright tests you already run.” |
| R33 | It is not hosted monitoring, test orchestration, trace replacement, visual regression, or an uploader. | 13 | J. “It does not run tests, monitor sites, replace traces, compare screenshots, or upload receipts.” |
| R34 | MIT © 2026 Sociobot (Param Factory) | 5 | License attribution; no plain-words flag. |

## Structure, browser, and quality checks

| Check | Result | Evidence |
| --- | --- | --- |
| Cold mobile and desktop | Fail | First-read and demo findings above. Both fresh contexts had no console/page errors. |
| Product visual identity | Pass | The live blueprint-paper, cyan construction lines, navy ink, and vermilion failure mark match `.factory/design.md`; this does not look like a generic SaaS hero. |
| Page basics | Pass | Live home: `lang=en`, exactly one `h1`, one `main`, 128-character description, meaningful hero-image alt, favicon, no 390 px horizontal overflow. |
| Titles | Partial fail | Home title uses the required separator but its suffix is metaphorical. Privacy and Terms titles are route-specific. `/demo` has only the Azure default 404 title. |
| Metadata | Fail | No canonical, Open Graph, Twitter-card, share image, or apple-touch metadata found on home. |
| Links | Pass | Home, Privacy, Terms, and GitHub all returned HTTP 200. Same-page anchors resolve. |
| Header/footer consistency | Fail | Privacy is absent from home header; legal headers and footers omit links present elsewhere; legal footers omit Source and a build/version id. |
| Routing/404 | Fail | `/demo` and unknown routes return Azure’s default 404; no designed return path. |
| Claims tests | Fail | No `.factory/claims.json`, no `@claim:` tests, and no runnable claim commands. |
| Demo sandbox | Fail | No direct demo, playground, banner, reset, start-for-real control, or demo namespace. |
| Privacy/offline interception | Not verifiable | Only the static landing page could be intercepted. It made same-origin requests only, but no demo flow exists to exercise. |
| Clean-clone quality gates | Pass | In `/tmp/jfr-review-clean.1dWYS6`, `npm ci`, `npm test`, and `npm run build` completed successfully; `dist/site` was produced. The intentional soft failures printed by the fixture/consumer wrappers were verified by those wrappers. This is not a substitute for the missing claim suite. |

## Required retest order

1. Implement the direct isolated `/demo` playground and its persistent controls.
2. Add `.factory/demo.md` and `.factory/claims.json` with one tagged sandbox test per claim.
3. Run every registry test from a new clone, including offline interception, privacy interception, and demo/reset namespace isolation.
4. Add real route metadata, a styled 404, consistent shell, and deep-link/back/focus tests.
5. Re-run this first-screen and copy audit at 390 px before claiming PASS.
