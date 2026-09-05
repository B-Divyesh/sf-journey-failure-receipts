# Copy audit — 2026-09-05

The 390 px first screen states the job, audience, first action, action result, privacy, offline behavior, and price in one breath. No visible sentence exceeds 22 words. No banned term appears outside the product name, package name, URL, or code.

Navigation labels, repeated footer links, code samples, and sample values are excluded. All distinct landing headings, actions, facts, captions, and prose are included below.

| ID | Landing copy unit | Words | Claim coverage |
| --- | --- | ---: | --- |
| L01 | Playwright failure evidence | 3 | — |
| L02 | Capture each failed Playwright assertion. | 5 | `receipt-capture` |
| L03 | For test teams who need the page state before later test steps change it. | 14 | — |
| L04 | Try it with sample data | 5 | `sample-receipt` |
| L05 | Install the Playwright fixture | 4 | — |
| L06 | Open the editable failure receipt in the demo. | 8 | `sample-receipt` |
| L07 | Sample data stays separate. | 4 | `demo-reset-isolation` |
| L08 | Demo works offline after one visit. | 6 | `offline-demo` |
| L09 | Free under the MIT License. | 5 | `mit-license` |
| L10 | A receipt saves the state at the failed step. | 9 | `receipt-capture` |
| L11 | Why final reports miss the failed state | 7 | — |
| L12 | Save the page state when the assertion fails. | 8 | `receipt-capture` |
| L13 | Later test steps can hide the broken cart or stale price. | 11 | — |
| L14 | A receipt keeps the evidence from the failed step. | 9 | `receipt-capture` |
| L15 | Run the Playwright assertion you already use. | 7 | — |
| L16 | Mask selected data and save evidence when it fails. | 9 | `package-redaction`, `screenshot-redaction` |
| L17 | Record the soft assertion failure and keep the test flow running. | 11 | `receipt-capture` |
| L18 | Sample receipt preview | 3 | — |
| L19 | View the evidence saved for one failure. | 7 | — |
| L20 | The demo lets you edit this receipt with bundled sample data. | 11 | `sample-receipt` |
| L21 | Private values are masked | 4 | `sample-redaction` |
| L22 | The sample receipt keeps the failure label and removes the private value. | 12 | `sample-receipt`, `sample-redaction` |
| L23 | Assertion failed · receipt saved | 4 | — |
| L24 | Open the demo to edit this receipt. | 7 | `sample-receipt` |
| L25 | What each failure receipt contains | 5 | — |
| L26 | The details needed to find the test failure. | 8 | — |
| L27 | Masked screenshot | 2 | `screenshot-redaction` |
| L28 | A screenshot with form fields and elements matched by configured selectors masked. | 12 | `screenshot-redaction` |
| L29 | Page structure | 2 | `package-redaction` |
| L30 | A selected page section with private values removed. | 8 | `package-redaction` |
| L31 | Recent messages | 2 | `console-messages` |
| L32 | Recent warnings and errors that help explain the failure. | 9 | `console-messages` |
| L33 | Request summary | 2 | `network-metadata-only` |
| L34 | Method, status, type, and duration without request bodies. | 8 | `network-metadata-only` |
| L35 | Failure context | 2 | `receipt-context-fields` |
| L36 | The test, page, time, and failure message in one HTML receipt. | 11 | `receipt-context-fields` |
| L37 | Install the Playwright fixture | 4 | — |
| L38 | Wrap a soft assertion that needs a receipt. | 8 | — |
| L39 | Use expect inside receipt.soft. | 4 | — |
| L40 | It saves evidence, records the soft assertion failure, and lets the test continue. | 13 | `receipt-capture` |
| L41 | Try the sample first | 4 | — |
| L42 | Create a sample receipt before changing your tests. | 8 | `sample-receipt` |
| L43 | Try it with sample data | 5 | `sample-receipt` |
| L44 | Bundled sample data. | 3 | `sample-receipt` |
| L45 | Resettable demo workspace. | 3 | `demo-reset-isolation` |
| L46 | Failure receipts for Playwright test flows. | 6 | — |

README prose was checked separately. Its longest sentence is 19 words. Its privacy, runtime, Node, demo, license, and configuration promises map to `.factory/claims.json`.

## Terminology

| Concept | One term |
| --- | --- |
| Saved HTML artifact | receipt |
| Playwright failure mechanism | soft assertion |
| Test continuation | test flow |
| Practice input | sample data |
| Sensitive test content | private value |
| Extra mask target | configured selector |
| Playwright wrapper | fixture |
