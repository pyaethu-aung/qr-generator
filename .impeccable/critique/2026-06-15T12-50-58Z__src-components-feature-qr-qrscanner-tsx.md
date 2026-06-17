---
target: current impl of QR scan
total_score: 30
p0_count: 0
p1_count: 1
timestamp: 2026-06-15T12-50-58Z
slug: src-components-feature-qr-qrscanner-tsx
---
# Critique: QR Scan view (`QRScanner.tsx`)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Decoding/scanning states announced; no progress for slow HEIC/WASM decode |
| 2 | Match System / Real World | 4 | Plain language throughout, good icons |
| 3 | User Control and Freedom | 3 | "Scan another" resets; no way to cancel an in-flight decode |
| 4 | Consistency and Standards | 2 | Card uses `shadow-lg` not the system `card-ambient`; segmented pills balloon full-width unlike the compact top toggle |
| 5 | Error Prevention | 3 | `accept="image/*"` but HEIC/TIFF not hinted; no client size guard |
| 6 | Recognition Rather Than Recall | 4 | Both inputs visible, labelled icons, content-type badge |
| 7 | Flexibility and Efficiency | 3 | No paste-from-clipboard; no drag onto camera; keyboard fine |
| 8 | Aesthetic and Minimalist Design | 2 | Desktop layout balloons: full-width terracotta pills + 700px aspect-square camera dominate; large terracotta blocks undercut the "rarity" economy |
| 9 | Error Recovery | 3 | Messages are plain and actionable; errors use polite `status` where `alert` fits better |
| 10 | Help and Documentation | 3 | Subtitle + hints carry it; no format guidance (HEIC support invisible) |
| **Total** | | **30/40** | **Good — solid foundation, layout + consistency are the weak axes** |

## Anti-Patterns Verdict

**Does this look AI-generated? Mostly no.** The terracotta-on-sand palette, pill controls, and editorial header are clearly the project's committed system, not a generic SaaS kit. It reads on-brand.

**Deterministic scan:** `detect.mjs` on `QRScanner.tsx` returned `[]` (exit 0) — zero anti-patterns. No side-stripe borders, no gradient text, no glass.

**Visual overlays:** inspected live at :5173 in upload, camera, desktop (1280) and mobile (390) states. The detector is clean; the real problems are spatial and only visible in the browser at desktop width.

## Overall Impression

The scan view is clean, on-brand, and functionally complete. The single biggest problem is that it was composed as a mobile column and stretched to a 768px card without adapting: at desktop width the two segmented pills become giant full-width slabs and the camera preview becomes a ~700x700 square that pushes the "Start camera" button below the fold. The same terracotta that the design system rations to "at most three elements, rarity is the point" is rendered as a full-width solid block when a method is active, which cheapens the accent.

## What's Working

- **On-brand control vocabulary.** PillGroup, the dashed dropzone, and the icon+label buttons all reuse the system primitives; nothing is ad-hoc. The content-type badge on the result is a genuinely nice touch.
- **Honest, plain-language errors.** Five distinct error states, each actionable ("Allow it in your browser settings, or upload an image instead") rather than a generic failure. Burmese parity is present.
- **Accessible scaffolding.** Dropzone is a real focusable `<button>`, the file input is correctly `sr-only`/`aria-hidden`, live regions announce decoding/scanning, decoded value has an `sr-only` label.

## Priority Issues

- **[P1] Desktop layout balloons — no width adaptation.** The interactive area (`max-w-3xl` card, full-width pills, `aspect-square w-full` video) makes a ~700px camera square and oversized pill slabs on desktop; "Start camera" lands below the fold and the placeholder text floats lost in dead space. **Fix:** cap the actionable column (e.g. `max-w-md mx-auto`) and constrain the camera with `max-h` / a 4:3 or contained aspect rather than a full-width square. **Command:** `/impeccable adapt`
- **[P2] Terracotta over-weight on the active segmented pill.** A full-width solid terracotta slab for the active Upload/Camera method violates the "rarity is the point" economy — the accent should mark, not fill. **Fix:** make the segmented control compact (inline, content-width like the top Generate|Scan toggle) so the active fill is a chip, not a banner. **Command:** `/impeccable layout`
- **[P2] Content-type badge fails WCAG AA.** `text-text-secondary` (#6B6B6B) on `surface-inset` (#E8DDD2) is ~3.98:1; the 12px badge needs 4.5:1. **Fix:** use `text-text-primary` for the badge label, or darken to an ink-end token. **Command:** `/impeccable colorize`
- **[P3] Card shadow off-system.** The scanner card uses Tailwind `shadow-lg`; every other card uses the custom `card-ambient` (0 2px 4 + 0 12px 32). **Fix:** swap to the `card-ambient` class for consistency. **Command:** `/impeccable polish`
- **[P3] No camera aiming guidance.** The live preview is a bare square with centered text; there is no reticle/frame to tell the user where to hold the code. **Fix:** add a subtle inset frame overlay. **Command:** `/impeccable delight`

## Persona Red Flags

**Casey (Distracted Mobile User):** Mobile column is actually fine — pills and dropzone are thumb-reachable and 44px+. But in camera mode the "Stop/Start camera" control sits below a tall square preview; on a short viewport it requires a scroll to reach. No state persistence if interrupted mid-scan (acceptable for a stateless tool).

**Sam (Accessibility-Dependent):** Mostly strong — keyboard path works, live regions fire. Two gaps: the content-type badge contrast (~3.98:1) fails AA, and errors are announced via `role="status"` (polite) so a blocked-camera message may not interrupt promptly; `role="alert"` fits a hard error better.

**Riley (Stress Tester):** `accept="image/*"` invites a HEIC drop that the code now handles via lazy codecs — good — but there is no visible size ceiling, so a 50MB TIFF will spin the "Reading code…" message with no cancel and no progress. The decode is also un-cancelable once started.

## Minor Observations

- "Open link" only appears for URL results — correct, but the action grid reflows from 3 to 2 columns when it is absent, which is fine.
- Result container uses `aria-labelledby` on a plain `<div>`; promoting it to `role="region"` (or a heading-led group) would make the label meaningful to AT.
- No paste-image-from-clipboard affordance, which is the fastest desktop path for a screenshot of a QR.

## Questions to Consider

- Should the scan surface have a genuine desktop layout (two-up: input on one side, instructions/result on the other) instead of a stretched mobile column?
- Does the active segmented pill need to be filled terracotta at all, or would an underline/ring keep the accent economy intact?
- For slow HEIC/WASM decodes, should there be a determinate or at least cancelable progress state?
