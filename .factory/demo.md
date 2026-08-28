# Demo sandbox

Open [the demo](/demo/?demo=1), or open `/?demo=1` to be redirected there. The page starts with a bundled checkout assertion, page path, private customer reference, and console message.

The editable demo keeps state only at `localStorage["demo:journey-failure-receipts:sample"]`. It never reads or writes real product keys. **Reset demo** removes that key and restores the bundled values. **Start for real** removes that key and returns to the landing page.

The receipt preview is produced by the browser-safe `createSampleReceipt` formatter exported by this package. It intentionally renders the private sample field as `[redacted]`.
