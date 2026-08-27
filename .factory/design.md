# Visual thesis: blueprint drafting sheet

Journey Failure Receipts should feel like a forensic drawing pinned to an engineer's wall: precise, inspectable, and annotated at the instant a journey went off plan. The site is intentionally single-mode. A warm drafting-paper field, cyan construction lines, navy ink, and a vermilion failure mark create a product-specific bridge between browser evidence and technical plans. It does not imitate an IDE or a monitoring dashboard.

## Palette

- `paper #F3EEDB`: warm blueprint stock; explicit page background.
- `sheet #FCF9EC`: raised evidence sheets.
- `ink #102A43`: primary navy drawing ink (12.4:1 on paper).
- `muted #48637A`: secondary annotations (5.4:1 on paper).
- `grid #B7D7D5`: construction rules; never carries meaning alone.
- `cyan #087E8B`: active controls and measured highlights (4.7:1 on paper).
- `vermilion #B9382E`: failed assertion stamps and error cues (5.1:1 on paper).
- `green #216E4E`: captured/safe state (5.4:1 on paper).
- `amber #8A5700`: warnings (5.8:1 on paper).

The receipt preview uses an inverse navy inspection surface, but this is depth inside the single drafting-sheet treatment rather than a separate theme.

## Type and spacing

- Headings: locally self-hosted **Instrument Sans**, 600–700. Its wide, engineered shapes read like contemporary technical signage.
- Body and code: system sans for prose and locally self-hosted **IBM Plex Mono**, 400–600, for measurements, assertions, and receipt metadata.
- Scale: 14, 16, 20, 26, 42, and clamp(48–76) px. Body never falls below 16 px.
- Space follows a 4/8 px drafting rhythm: 4, 8, 12, 16, 24, 32, 48, 72, 96.
- Text measures stay between 45–72 characters. Major sections align to numbered sheet coordinates.

## Interaction grammar and depth

Links and buttons behave like drawing instruments: square-ended, 1 px ink outlines, a 3 px offset shadow, and a one-pixel pressed translation. Focus is a high-contrast double rule. Sections use proximity first; outlined sheets appear only for genuinely separable artifacts such as the live receipt.

The demo has a single meaningful interaction: selecting a failure marker updates the evidence panes and annotation state. Arrow keys move between markers. Status copy is announced in a live region. Offline state is explicit and explains that the library and generated receipts work without a network.

## Motion policy

On entry, drafting annotations settle upward over 220 ms and the failure route draws once over 700 ms. Evidence-pane changes cross-fade over 160 ms. Only opacity and transform animate. With `prefers-reduced-motion: reduce`, drawing and movement are removed; content appears immediately. Nothing loops.

## Asset plan and provenance

- `site/public/blueprint-journey.webp`: original generated hero illustration, a top-down technical journey plan with a single failed checkout node and evidence callouts. Generated for this product with the factory image generator on 2026-08-27, then resized/optimized locally to WebP. Prompt: “Editorial technical blueprint drafting sheet for a browser checkout journey, top-down orthographic drawing, warm ivory paper, precise navy ink lines and cyan construction marks, one vermilion failed assertion circled in grease pencil, small evidence fragments for screenshot, DOM, console, and network arranged as architectural callouts, tactile graphite and paper texture, no people, no logos, no legible words, wide landscape composition, clean negative space.” Generator output is an original project asset; no third-party stock or logos.
- Interface icons are original inline geometric SVGs using the same stroke rules. They are decorative where adjacent text supplies the label.

The generated illustration clarifies the core mental model: one journey, multiple checkpoints, evidence frozen at the failure coordinate.
