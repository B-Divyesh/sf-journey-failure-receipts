# Adversarial first-read review 2 — Journey Failure Receipts

**URL checked:** `https://journey-failure-receipts.sociobot.in/`  
**Review date:** 2026-08-28  
**Verdict: FAIL**

The cold first screen, live demo, core claim commands, visual identity, and route behaviour are now substantially repaired. This review still fails because the documented clean-install command is broken, route metadata is incomplete, the claims register does not cover every visitor-facing promise, and two remaining copy details either misstate the action result or use inconsistent terminology.

## Cold first read

Fresh Chromium contexts were opened at 390×844 and 1440×900. No page was scrolled before recording the result. The live page produced no console errors and had no horizontal overflow at 390 px.

| Question | First-screen answer | Result |
| --- | --- | --- |
| What does this do? | It captures a receipt when a Playwright assertion fails. | Confirmed by “Capture each failed Playwright assertion.” |
| For whom? | Test teams whose later test steps would replace the failed page state. | Confirmed by “For test teams who need the page state before a soft failure changes the flow.” |
| What should I click first? | “Try it with sample data.” | Confirmed; it opens `/demo/?demo=1`. |

The first screen therefore clears the basic cold-read gate. The mobile hero is distinctive, legible, and does not resemble a generic SaaS template.

## Findings

### F-2-1 — BLOCKING — the documented clean-install command cannot run

- **Location / quote:** README, **Develop and verify**: `npm ci`.
- **Evidence:** in a fresh clone, `npm ci` exits with `EUSAGE`: “The \`npm ci\` command can only install with an existing package-lock.json or npm-shrinkwrap.json.” The repository contains neither lockfile. `npm install` succeeds, but that is not the command the README and existing handoff tell a visitor to use.
- **Why this fails:** a first-time developer following the documented verification path cannot install the project. This also makes dependency resolution non-reproducible.
- **Concrete fix:** commit the generated `package-lock.json`, keep `npm ci` in the README, and add a clean-checkout CI/test step that runs `npm ci && npm test && npm run build`. Alternatively, change every documented `npm ci` instruction to `npm install` and explicitly accept the loss of a locked install; the former is the appropriate fix.

### F-2-2 — BLOCKING — Privacy, Terms, and 404 omit required social metadata

- **Location / quote:** live `/privacy/`, `/terms/`, and `/missing-route` document heads.
- **Evidence:** home and demo have `og:type`, `og:title`, `og:description`, `og:image`, `og:url`, and the four Twitter properties. Privacy and Terms omit `og:url`, `twitter:title`, `twitter:description`, and `twitter:image`; the designed 404 omits all Open Graph and Twitter properties. This is also visible in `site/privacy/index.html`, `site/terms/index.html`, and `site/404.html`.
- **Why this fails:** the previous review required complete canonical, Open Graph, Twitter, share-image, and apple-touch metadata on every route. Legal and error-route shares now lose the title, description, or image, so that repair is only partial.
- **Concrete fix:** add the full route-specific OG and Twitter set, including absolute `og:url` and the existing project `share-card.svg`, to Privacy, Terms, and 404. Add a browser test that enumerates every shipped route and requires all fields.

### F-2-3 — BLOCKING — the screenshot-masking promise is not a registered claim

- **Location / quote:** landing, **Masked screenshot**: “A screenshot with form fields and selected elements masked.”
- **Evidence:** no `.factory/claims.json` entry states this promise. `package-redaction` promises only removal of form/configured-selector values from packaged “receipt evidence”; it does not name screenshots, and its consumer test does not prove that screenshot pixels are masked.
- **Why this fails:** this is a privacy promise a team can rely on when publishing CI artifacts. The claims contract requires a specifically listed, observable test.
- **Concrete fix:** add a `screenshot-redaction` claim whose packed-fixture test uses a distinctive visible value, reads or OCRs/compares the receipt screenshot evidence, and proves the value cannot appear. Add its precise landing and README locations to `where`.

### F-2-4 — BLOCKING — the network-summary promise is not a registered claim

- **Location / quote:** landing, **Request summary**: “Method, status, type, and duration without request bodies.”
- **Evidence:** no claim entry says that request bodies are excluded or that these are the only retained fields. The packed-consumer test proves selected secret/path redaction, not absence of non-secret request or response body content.
- **Why this fails:** this is a specific artifact-data boundary; a visitor can reasonably depend on it before exposing a production test suite.
- **Concrete fix:** add a `network-metadata-only` claim and fixture test containing unique harmless request and response body markers. Assert neither marker nor headers/query/fragment reaches the generated receipt, while the documented method/type/status/duration fields do.

### F-2-5 — BLOCKING — the stated receipt contents are not a registered claim

- **Location / quote:** landing, **Failure context**: “The test, page, time, and failure message in one HTML receipt.”
- **Evidence:** no claim entry or tagged test asserts all four named fields. `receipt-capture` proves an HTML receipt is created and the test continues, but it does not assert those fields.
- **Why this fails:** this is an observable product promise and the current registry gives a reviewer no way to prove it.
- **Concrete fix:** add a `receipt-context-fields` claim, or extend and rename `receipt-capture` to state and assert each field from an intentional failure. Record the landing location in `where`.

### F-2-6 — BLOCKING — the Node compatibility promise is unlisted and untested

- **Location / quote:** README, **Develop and verify**: “Requires Node 20 or later.”
- **Evidence:** this sentence has no claims entry or tagged compatibility test. `package.json` has `engines.node: >=20`, but that is metadata, not a clean Node 20 verification.
- **Why this fails:** a library consumer relies on the supported runtime before choosing the package. The claims rule explicitly includes quantitative/compatibility promises that require a test.
- **Concrete fix:** add a `node-20` claim and CI matrix/test evidence that installs, typechecks, tests, and builds under Node 20. If that environment is not supported, remove the sentence and correct `engines`.

### F-2-7 — BLOCKING — the no-upload scope promise is unlisted for the package

- **Location / quote:** README, **Scope**: “It does not run tests, monitor sites, compare screenshots, or upload receipts.”
- **Evidence:** `demo-no-upload` tests browser requests from the demo only. No registry entry covers the npm package generating a receipt, and no test records network traffic during the fixture/packed-consumer flow.
- **Why this fails:** “does not … upload receipts” is a privacy promise about the package, not merely the demo. The current test leaves the actual promise unproved.
- **Concrete fix:** split this into testable scope statements. Add a `package-no-upload` claim whose clean fixture/consumer test records all requests during capture and permits only the fixture server; remove the other scope assertions unless each gains an observable test.

### F-2-8 — BLOCKING — the primary-action result says “this page” but navigates away

- **Location / quote:** landing hero, beneath the primary action: “Open an editable failure receipt in this page.”
- **Evidence:** the `Try it with sample data` link navigates from `/` to `/demo/?demo=1`.
- **Why this fails:** the copy beside the mandatory first action is meant to state what happens next. “This page” promises an in-place result, while the actual result is a new demo route. This is a residual plain-words/action-label defect from the prior review.
- **Concrete fix:** replace it with **“Open the editable failure receipt in the demo.”** If in-place behaviour is intended instead, keep the URL on `/` and render the playground there.

### F-2-9 — BLOCKING — “soft failure” and “soft assertion” are inconsistent terms

- **Location / quote:** landing lede and README introduction: “before a **soft failure** changes the flow”; nearby headline/install copy: “failed Playwright **assertion**” and “Wrap a **soft assertion**”.
- **Evidence:** the terminology table says the product uses “test flow” for continuation but has no entry for this core concept. The brief names “soft assertion”; the implementation API is `receipt.soft` around an assertion.
- **Why this fails:** the plain-words contract requires one term for one concept. On the first screen, “soft failure” can be read as a different mechanism from Playwright’s soft assertion.
- **Concrete fix:** use **“soft assertion”** consistently, or avoid the specialised term in the lede: **“For test teams who need the page state before later test steps change it.”** Update the terminology table.

## Copy audit

Word counts use visible prose and actionable labels. Repeated navigation/footer labels, visual-only sample values, and code blocks are excluded; headings and actions are included because they must make sense in a screen-reader heading/action list. No unit exceeds 22 words. `F-2-3` through `F-2-9` identify the flagged copy/claim items.

### Landing page

| ID | Copy unit | Words | Flag |
| --- | --- | ---: | --- |
| L01 | Capture each failed Playwright assertion. | 5 | — |
| L02 | For test teams who need the page state before a soft failure changes the flow. | 15 | F-2-9 inconsistent term |
| L03 | Try it with sample data | 5 | — |
| L04 | Install the Playwright fixture | 4 | — |
| L05 | Open an editable failure receipt in this page. | 8 | F-2-8 action result is inaccurate |
| L06 | Sample data is isolated. | 4 | Covered by `demo-reset-isolation` |
| L07 | Reset it at any time. | 5 | Covered by `demo-reset-isolation` |
| L08 | MIT licensed. | 2 | Covered by `mit-license` |
| L09 | A receipt saves the state at the failed step. | 9 | Covered by `receipt-capture` |
| L10 | Why final reports miss the failed state | 7 | — |
| L11 | Save the page state when the assertion fails. | 8 | Covered by `receipt-capture` |
| L12 | Later test steps can hide the broken cart or stale price. | 11 | — |
| L13 | A receipt keeps the evidence from the failed step. | 9 | Covered by `receipt-capture` |
| L14 | Run the Playwright assertion you already use. | 7 | — |
| L15 | Mask selected data and save evidence when it fails. | 9 | Covered generally by `package-redaction` |
| L16 | Record the soft failure and keep the test flow running. | 10 | Covered by `receipt-capture` |
| L17 | Sample receipt preview | 3 | — |
| L18 | View the evidence saved for one failure. | 7 | — |
| L19 | The demo lets you edit this receipt with bundled sample data. | 11 | Covered by `sample-receipt` |
| L20 | Private values are masked. | 4 | Covered by `sample-redaction` |
| L21 | The sample receipt keeps the failure label and removes the private field. | 12 | Covered by `sample-redaction` |
| L22 | Assertion failed · receipt saved | 4 | — |
| L23 | Open the demo to edit this receipt. | 7 | — |
| L24 | What each failure receipt contains | 5 | — |
| L25 | The details needed to find the test failure. | 8 | — |
| L26 | Masked screenshot | 2 | — |
| L27 | A screenshot with form fields and selected elements masked. | 9 | F-2-3 unlisted claim |
| L28 | Page structure | 2 | — |
| L29 | A selected page section with private values removed. | 8 | Covered generally by `package-redaction` |
| L30 | Recent messages | 2 | — |
| L31 | Recent warnings and errors that help explain the failure. | 9 | — |
| L32 | Request summary | 2 | — |
| L33 | Method, status, type, and duration without request bodies. | 8 | F-2-4 unlisted claim |
| L34 | Failure context | 2 | — |
| L35 | The test, page, time, and failure message in one HTML receipt. | 11 | F-2-5 unlisted claim |
| L36 | Install the Playwright fixture | 4 | — |
| L37 | Wrap a soft assertion that needs a receipt. | 8 | — |
| L38 | Use expect inside receipt.soft. | 4 | — |
| L39 | It saves evidence, records the soft failure, and lets the test continue. | 12 | Covered by `receipt-capture` |
| L40 | Create a sample receipt before changing your tests. | 8 | — |
| L41 | Try it with sample data | 5 | — |
| L42 | Bundled sample data. | 3 | — |
| L43 | Resettable demo workspace. | 3 | Covered by `demo-reset-isolation` |
| L44 | Failure receipts for Playwright test flows. | 6 | — |

### README

| ID | Copy unit | Words | Flag |
| --- | --- | ---: | --- |
| R01 | Capture each failed Playwright assertion as a local HTML receipt. | 10 | Covered by `receipt-capture` |
| R02 | For test teams, the receipt keeps the page evidence from a soft failure before later steps change the flow. | 19 | F-2-9 inconsistent term |
| R03 | The wrapped assertion saves a receipt and the test flow continues. | 11 | Covered by `receipt-capture` |
| R04 | See the tested claim in `.factory/claims.json`. | 6 | — |
| R05 | Try the sample | 3 | — |
| R06 | Open `https://journey-failure-receipts.sociobot.in/demo/?demo=1`. | 5 | — |
| R07 | Change the bundled checkout sample and create an editable receipt. | 10 | Covered by `sample-receipt` |
| R08 | The demo state uses a `demo:` browser-storage key. | 8 | Covered by `demo-reset-isolation` |
| R09 | Reset demo restores the bundled values. | 6 | Covered by `demo-reset-isolation` |
| R10 | Install | 1 | — |
| R11 | Create a receipt test fixture: | 5 | — |
| R12 | Wrap the soft assertion that needs a receipt: | 8 | — |
| R13 | Use `expect`, not `expect.soft`, inside the callback. | 7 | — |
| R14 | Optional CI output: | 3 | — |
| R15 | Privacy controls | 2 | — |
| R16 | Use `maskSelectors` for private content outside form fields. | 8 | — |
| R17 | The packaged receipt removes form and configured-selector values from DOM and accessibility evidence. | 13 | Covered by `package-redaction` |
| R18 | The packed-consumer claim test covers labels, ARIA text, and selector text. | 11 | — |
| R19 | Review generated CI artifacts and set your own retention policy. | 10 | — |
| R20 | API | 1 | — |
| R21 | Develop and verify | 3 | — |
| R22 | Requires Node 20 or later. | 5 | F-2-6 unlisted claim |
| R23 | Run every listed visitor claim from a clean checkout: | 9 | F-2-1 documented command fails |
| R24 | The static documentation and demo build to `dist/site`. | 8 | Verified by build; not visitor-facing product claim |
| R25 | Run `npm run dev` to preview the documentation site. | 9 | — |
| R26 | The factory handles npm publishing and static deployment. | 8 | Internal process note; remove from visitor README |
| R27 | Scope | 1 | — |
| R28 | Use this with Playwright tests you already run. | 8 | — |
| R29 | It does not run tests, monitor sites, compare screenshots, or upload receipts. | 12 | F-2-7 unlisted package privacy claim |
| R30 | License | 1 | — |
| R31 | MIT © 2026 Sociobot (Param Factory) | 5 | — |

## Demo and sandbox verification

- The hero link reaches `/demo/?demo=1` in one click. Its first screen already shows a realistic checkout assertion, editable label/path/customer-reference/console fields, and the receipt with `[redacted]` private data.
- The persistent banner reads **“Demo — sample data, nothing is saved”** and supplies visible **Reset demo** and **Start for real** controls.
- The direct demo starts with no stored value. The tagged isolation test mutates `demo:journey-failure-receipts:sample`, verifies the real key remains unchanged, confirms demo code reads only the `demo:` key, and confirms Reset restores defaults and removes the demo key.
- A request log across landing → demo → edited receipt showed only `journey-failure-receipts.sociobot.in` requests. `@claim:demo-no-upload` independently passed against a fresh browser context.
- `@claim:offline-demo` passed: after worker activation and first visit, the demo reloads offline and shows its offline status.

## Claims and clean-clone verification

Fresh clone used: `/tmp/jfr-review-2.ry1mcc/repo`. `npm ci` failed as recorded in F-2-1; `npm install` was then used solely to run the registered checks. All eight listed claim commands passed (the fixture/consumer wrappers intentionally run an assertion that Playwright reports as failed, then prove the wrapper command completed successfully with a receipt).

| Claim | Result | Evidence |
| --- | --- | --- |
| `receipt-capture` | Pass | `npm run test:e2e`; receipt generated and continuation marker observed. |
| `package-redaction` | Pass | `npm run test:consumer`; packed consumer receipt kept short form/ARIA/selector/path markers redacted. |
| `sample-receipt` | Pass | Tagged Playwright claim test. |
| `sample-redaction` | Pass | Tagged Playwright claim test. |
| `demo-reset-isolation` | Pass | Tagged Playwright claim test. |
| `demo-no-upload` | Pass | Tagged Playwright claim test. |
| `offline-demo` | Pass | Tagged Playwright claim test. |
| `mit-license` | Pass | Tagged Vitest claim test. |

After installation, `npm test`, `npm run build`, and `npm run typecheck` also passed from the fresh clone. `npm run build` produced `dist/site`.

## Structure, routing, and presentation checks

| Check | Result | Evidence |
| --- | --- | --- |
| Distinct identity | Pass | Blueprint paper, cyan construction grid, navy drafting ink, and vermilion failure mark match `.factory/design.md`; no generic card/gradient SaaS treatment observed. |
| Mobile and keyboard baseline | Pass | 390 px has no horizontal overflow; local browser suite passed serious/critical Axe checks and installation-code keyboard focus. |
| Page basics | Pass | Live home has `lang=en`, exactly one `h1`, one `main`, title, description, favicon, canonical, and meaningful hero alt. |
| Demo / legal titles and focus | Pass | `/demo/`, `/privacy/`, `/terms/`, and designed 404 each have one h1, a route title, real URL, focus on the h1 after load, and a live route announcement. Browser back uses normal document history. |
| 404 and deep links | Pass | `/missing-route` returns the designed 404 with status 404 and return actions; `/?demo=1` redirects to the demo. |
| Links and shell | Pass | All unique internal links, `https://github.com/B-Divyesh/sf-journey-failure-receipts`, and all footer legal links returned 200 (apart from the intentional 404); header/footer structure is consistent. |
| Metadata on every route | Fail | F-2-2. |
| Self-hosting / privacy | Pass for observed demo | Local fonts/assets only; CSP permits same-origin connections; request log contained no third-party analytics or uploads. |

## Earlier-review verification

Read: `.factory/review-1.md` and `.factory/handoff.md`. No `.factory/polish-*.md` files exist.

| Earlier finding | Live and code check | Result |
| --- | --- | --- |
| Cold first screen failed | Plain headline, audience, one sample-data action, and result text are present at 390 px. | Fixed, except F-2-8/F-2-9 wording details. |
| No playground / isolated demo | Direct `/demo/?demo=1`, editable receipt, banner, reset, start-for-real, and `demo:` namespace are present and tested. | Fixed. |
| Claims registry absent | Registry and all listed commands exist and pass. The unlisted promises in F-2-3 through F-2-7 mean the repair is incomplete. | Half-fixed; blocking. |
| Demo route / designed 404 absent | Live demo and designed 404 work, including deep-link and focus checks. | Fixed. |
| Offline and privacy sandbox unverifiable | Same-origin and offline claim tests pass; live request log agrees. | Fixed. |
| Metadata and shell incomplete | Header/footer, canonical, favicon, share art, and most metadata are repaired. Legal and 404 social metadata remain absent (F-2-2). | Half-fixed; blocking. |
| Plain-words copy failed | All audited units are ≤22 words and actions largely name outcomes. F-2-8 and F-2-9 remain. | Half-fixed; blocking. |

## Missed leverage

No additional AI, sync, or import/export feature is required by the brief. This library’s useful core is local capture of browser evidence; adding an AI feature would be decorative and would weaken the local-first/privacy model. The in-page package playground is the appropriate library demo.

## What would make this perfect

Ship a lockfile and verify the documented `npm ci` path, complete the social metadata on all routes, and either test/register or remove every remaining artifact/privacy/runtime promise. Then replace the two residual first-read phrases so the demo action and soft-assertion terminology are exact.
