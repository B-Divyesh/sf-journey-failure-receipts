# Verify failed Playwright assertion receipts — QA 4

**Verdict: FAIL**

**Finding count:** 2 (1 Medium, 1 Low)

**Untested claim count:** 0

**Implementation reviewed:** `97004315796ec2f902fd9daa661de95a50030395`

**Documentation baseline:** `5f4f04fa453bafb586d11b5b518c27b1cbe65534`

**Live URL:** https://journey-failure-receipts.sociobot.in/

The npm library, live sample flow, all 15 declared claims, offline path, privacy controls, routes, and packed consumer pass. The product does not receive a PASS because the editable sample can break the mobile layout and repeated mobile links miss the required touch-target size.

## First screen before scrolling

Fresh Chromium contexts at 1440×900 and 390×844 showed the same plain answer:

- Job: capture the page evidence at each failed Playwright assertion.
- Audience: test teams that need the failed state before later test steps change it.
- First action: **Try it with sample data**. Its adjacent text says it opens an editable failure receipt in the demo.

Both first screens also showed the three facts about sample isolation, offline use after one visit, and the MIT License. The page remained at scroll position 0, used one `h1` and one `main`, and had no initial horizontal overflow. Screenshots are in `/work/.evidence/jfr-verification-4/desktop-first-screen.png` and `phone-first-screen.png`.

## Findings

### F-V4-1 — Medium — a short unbroken sample label breaks the mobile layout

The demo accepts an assertion label without a length limit or wrapping boundary. In a fresh 390×844 phone context, 32 `A` characters expanded the document from 390 px to 872 px. At 64 characters it expanded to 1,695 px. A 10,000-character boundary input expanded it to 217,448 px. The failure receipt and page become horizontally scrollable, so the populated output no longer fits the phone screen.

This is an accepted input path, not a provider error. Empty input recovers honestly as “Untitled assertion,” corrupt demo storage recovers to bundled values, and Reset demo remains available, but those recovery paths do not prevent the layout failure.

Evidence: `/work/.evidence/jfr-verification-4/boundary-widths.json` and `live-edge-report.json`.

Required repair: constrain or wrap user-supplied receipt labels (`overflow-wrap: anywhere` and a shrinkable container), and add a 390 px regression using an unbroken 32-character label.

### F-V4-2 — Low — repeated mobile links are smaller than 44×44 px

The product contract requires touch targets of at least 44×44 CSS px. At 390 px, the header wordmark measured 195×34 px on home/demo and 150×26.4 px on legal/404 pages. Footer wordmarks measured 190–229×33.6 px. The Terms link measured 40×44 px on every route. Other measured controls met the size requirement, and spacing prevented overlap.

Evidence: `/work/.evidence/jfr-verification-4/touch-targets.json`.

Required repair: give wordmark links a 44 px minimum height and short navigation links a 44 px minimum width, then add a mobile target-size assertion for every interactive element.

## Sample flow and privacy

- One click from home opened `/demo/?demo=1` with the persistent **Demo — sample data, nothing is saved** banner, realistic checkout values, Reset demo, and Start for real.
- Editing the label to “Shipping address accepts suite 4B” immediately produced populated page, console, network, DOM, and failure context. The bundled-sample caption remained present.
- `PRIVATE_V4_883190` was absent from the receipt output and the private row remained `[redacted]`.
- A seeded real key, `journey-failure-receipts:real`, remained unchanged through edit, Reset demo, and Start for real. Reset removed `demo:journey-failure-receipts:sample` and restored “Cart count increments.” Start for real discarded demo state and returned home.
- All observed documentation/demo requests were same-origin GETs. No cookies, analytics, third-party scripts, page errors, or normal-route console errors were present.
- A deliberately corrupt demo-storage value recovered to bundled data. Empty fields produced an “Untitled assertion” receipt with private data still redacted. Clipboard denial changed the action to “Select code” and explained how to recover.
- After service-worker activation, an offline reload returned the demo, showed the offline status, and created an “Offline suite check” receipt. The live worker uses `journey-receipts-v4`, calls `skipWaiting()` and `clients.claim()`, and deletes stale caches.

## Claims

Every `test` value in `.factory/claims.json` was executed as its own declared entry from a clean checkout at the implementation SHA. All 15 returned exit 0.

| Claim | Result | Evidence checked |
| --- | --- | --- |
| `receipt-capture` | Pass | Failed wrapped assertion wrote one receipt; flow continued; cap and invalid-selector recovery passed. |
| `package-redaction` | Pass | Packed consumer removed short form, label, ARIA, description, and configured-selector values. |
| `screenshot-redaction` | Pass | Decoded PNG mask pixels matched the opaque mask color. |
| `console-messages` | Pass | Receipt contained the unique browser warning. |
| `network-metadata-only` | Pass | Method/status/type/duration remained; bodies, headers, credentials, paths, query, and fragment markers did not. |
| `receipt-context-fields` | Pass | Test, project, ISO time, redacted page URL, and assertion failure were present. |
| `package-no-upload` | Pass | Browser plus Node fetch/HTTP/HTTPS/TCP/TLS observations stayed empty during capture. |
| `node-20-compatible` | Pass | Node 20.19.5 typechecked, tested, built, and loaded ESM/CommonJS exports. |
| `configuration-defaults` | Pass | Every documented API default matched the resolver. |
| `sample-receipt` | Pass | Editable bundled input created the named receipt. |
| `sample-redaction` | Pass | Unique private input was absent from output. |
| `demo-reset-isolation` | Pass | Only the `demo:` namespace changed; reset and exit preserved the seeded real key. |
| `demo-no-upload` | Pass | Same-origin GET requests only, no cookies or third-party scripts. |
| `offline-demo` | Pass | Dedicated context reloaded and created a receipt offline. |
| `mit-license` | Pass | Shipped `LICENSE` contains the MIT License. |

The live landing, demo, Privacy, Terms, generated-receipt copy, and README were cross-checked against the register. No unlisted or untested public product claim was found. Full command output is in `/work/.evidence/jfr-verification-4/individual-claims.log`.

## Clean package and quality gates

The clean checkout was `/tmp/jfr-v4-clean.Ru6t8c/repo` at the implementation SHA, with Node v22.23.2 and npm 10.9.8.

| Command | Result |
| --- | --- |
| `npm ci` | Pass; lockfile installed 95 packages. |
| `npm run typecheck` | Pass. |
| `npm test` | Pass: 6 unit tests, expected-failure fixture wrapper, expected-failure packed-consumer wrapper, and 9 site tests. |
| `npm run build` | Pass; ESM, CommonJS, declarations, and `dist/site` produced. |
| `npm pack --dry-run` | Pass; 24 files, 62.8 kB compressed, 277.7 kB unpacked. |

The packed-consumer command installed the actual tarball in a fresh temporary project and loaded root, Playwright, and reporter exports through ESM and CommonJS. The intentional Playwright assertion failures inside the fixture and consumer are expected test input; each wrapper returned success only after checking the receipt and continuation.

`npm audit --omit=dev` reports zero vulnerabilities. Full `npm audit` reports the documented low-severity Windows development-server advisory in build-only `esbuild`.

## Live routes, accessibility, and performance

- Home, Demo, Privacy, and Terms returned 200. An unknown route deliberately returned HTTP 404 with the designed page, return actions, route title, metadata, one `h1`, and one `main`. Its 404 resource console message is expected and is not counted as a defect.
- Every unique internal link and the GitHub source link returned 200; only the deliberate unknown-route link returned 404.
- Each route has its own title, canonical URL, description, Open Graph and Twitter fields, favicon, apple-touch icon, header, navigation, footer, `lang="en"`, and one `h1`/`main`.
- Route entry and browser back/forward focused the demo `h1`. Desktop keyboard traversal reached controls with a 3 px vermilion focus ring and no trap. Reduced motion changed animation and transition durations to 0.01 ms.
- `/opt/fleet/lib/verify-url.sh` passed home, Demo, Privacy, and Terms with no errors. Axe CLI 4.10.3 reported 0 violations on all four pages; Playwright Axe also reported 0 violations on home, Demo, Privacy, Terms, and 404 at desktop, plus home and Demo at 390 px.
- Mobile Lighthouse scored 100 for Performance, Accessibility, Best Practices, and SEO. FCP was 1.1 s, LCP 1.5 s, TBT 0 ms, and CLS 0.
- Built initial assets remain within contract: JavaScript 3,631 B, CSS 18,903 B, self-hosted fonts 64,936 B total, and hero WebP 58,108 B.
- CSP, HSTS, Permissions-Policy, `nosniff`, strict-origin referrer policy, and frame denial are live. Hashed assets/fonts/images are immutable; `sw.js` is no-store.

## Candidate and deployment identity

A fresh build of implementation `97004315796ec2f902fd9daa661de95a50030395` byte-matched the live home, Demo, Privacy, Terms, 404, service worker, JavaScript, CSS, hero image, and share card. Commit `5f4f04fa453bafb586d11b5b518c27b1cbe65534` changes only `.factory/handoff.md`, so it is documentation-only and does not require a newer product image.

This product has no backend, tenant store, SQLite state, authentication, payment, or rate-limited API. Tenant isolation, restart persistence, health, and 429/Retry-After checks do not apply. AI would not improve the brief's local capture job and would weaken its privacy boundary.

## Earlier finding disposition

| Earlier finding | Current evidence | Disposition |
| --- | --- | --- |
| Review 1: first screen did not state job, audience, or first action | Both fresh viewports show all three before scrolling. | Fixed. |
| Review 1: no editable, isolated, one-click demo | Live demo, persistent banner, realistic values, `demo:` storage, Reset, and Start for real passed. | Fixed. |
| Review 1: claims register absent | 15 entries exist and all 15 commands passed independently. | Fixed. |
| Review 1: `/demo` absent and provider 404 shown | Direct demo is 200; unknown route is a designed HTTP 404 with return actions. | Fixed. |
| Review 1: offline/privacy behavior unproved | Dedicated offline context and complete request/cookie log passed. | Fixed. |
| Review 1: metadata and shared shell incomplete | Complete route metadata and consistent shell passed on all five routes. | Fixed. |
| Review 1: unclear and overlong copy | Current audit and first-read check use plain, consistent terms with no sentence over 22 words. | Fixed. |
| Verification 1: ARIA evidence leaked private names/descriptions | Exact packed short-string regression excludes all prior markers and keeps structural `[redacted]` evidence. | Fixed. |
| Verification 1: mobile scrollable code was not keyboard accessible | Code regions are focusable; desktop keyboard traversal and Axe pass. | Fixed. |
| Verification 2: one- and two-character secrets leaked | Exact `Li`, `NY`, `CA`, `XY`, `OK`, `ID`, and `NO` regression passes from the tarball. | Fixed. |
| Verification 2: customer identifiers remained in URL paths | `ALICE_UNIQUE`, `customer-slug`, `abc123`, and query markers are absent; safe redacted shape remains. | Fixed. |
| Review 2 F-2-1: `npm ci` lacked a lockfile | Clean `npm ci` passed. | Fixed. |
| Review 2 F-2-2: legal/404 social metadata incomplete | Route enumeration confirms complete route-specific metadata. | Fixed. |
| Review 2 F-2-3 through F-2-7: screenshot, network, context, Node 20, and package no-upload claims missing | Five dedicated claim entries and packed/runtime tests pass. | Fixed. |
| Review 2 F-2-8: action-result copy said “this page” | It now accurately says “in the demo.” | Fixed. |
| Review 2 F-2-9: soft-failure terminology inconsistent | Visitor copy consistently uses “soft assertion.” | Fixed. |
| Verification 3 | It reported no defects; its package/privacy assertions were reproduced against the current candidate. | Remains fixed. |

## Release decision

**FAIL.** There are two open findings and no untested claims. Npm publication remains an authorized registry-owner action, but publication should wait until F-V4-1 and F-V4-2 are repaired and retested.
