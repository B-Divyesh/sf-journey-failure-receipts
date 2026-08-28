# Journey Failure Receipts — adversarial review 2 handoff

## Review completed

No product source files were modified. The complete evidence and findings are in `.factory/review-2.md`.

The live deployment was checked fresh at desktop and 390 px. It now has a clear first screen, direct editable `/demo/?demo=1` playground, visible isolated-demo controls, designed 404, working links, and the intended blueprint drafting-sheet identity.

## Verification run

Fresh clone used: `/tmp/jfr-review-2.ry1mcc/repo`.

- `npm ci` **failed** because there is no `package-lock.json` or shrinkwrap. This is finding F-2-1.
- After `npm install`, all eight commands listed by `.factory/claims.json` passed.
- `npm test`, `npm run build`, and `npm run typecheck` passed after installation; build produced `dist/site`.
- Live request logging found only same-origin demo requests. Tagged tests passed for reset/storage isolation and offline-after-first-visit behaviour.
- Live crawl confirmed `/`, `/demo/`, `/privacy/`, `/terms/`, `/demo/?demo=1`, `/404.html`, and Source links; an unknown route returns the designed 404.

## Known gaps / next steps

The review verdict is **FAIL**. Address F-2-1 through F-2-9 in `.factory/review-2.md` before another acceptance round:

1. Commit a lockfile so the documented `npm ci` path works.
2. Complete OG/Twitter metadata for Privacy, Terms, and 404.
3. Register and test the screenshot, network-body, receipt-context, Node-version, and package-no-upload promises, or remove the promises.
4. Correct “in this page” beside the demo action and standardize “soft assertion” terminology.
