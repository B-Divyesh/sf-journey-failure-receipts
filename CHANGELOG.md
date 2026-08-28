# Changelog

## 0.1.3 — 2026-08-28

- Generate ARIA evidence from a temporary structurally scrubbed DOM clone instead of post-processing a snapshot of the live customer page.
- Add an actual-packed-consumer regression using the verifier's exact one-/two-character form, label, description, and configured-selector values, plus customer-name/slug/opaque-ID paths.

## 0.1.2 — 2026-08-28

- Redact one- and two-character field, label, accessible-name, accessible-description, and configured-selector values in receipts.
- Redact every network URL path segment by default, retaining only the origin and path shape.
- Add packed-consumer privacy regressions for short accessibility content and name-, slug-, and nonnumeric-ID URL paths.

## 0.1.1 — 2026-08-28

- Redact form and configured-selector accessible names, descriptions, and associated labels before ARIA evidence is persisted.
- Make scrollable documentation and generated receipt code regions keyboard reachable.
- Add static-host security/cache policy artifacts and activate service-worker updates immediately.

## 0.1.0 — 2026-08-27

- Initial Playwright receipt fixture and CI reporter.
- Scrubbed screenshot, DOM, ARIA, console, and network evidence capture.
- Static documentation and interactive receipt preview.
