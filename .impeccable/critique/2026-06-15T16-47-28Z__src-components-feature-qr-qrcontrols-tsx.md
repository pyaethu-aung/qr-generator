---
target: foreground gradient feature
total_score: 36
p0_count: 0
p1_count: 0
timestamp: 2026-06-15T16-47-28Z
slug: src-components-feature-qr-qrcontrols-tsx
---
# Critique — Foreground Gradient (linear/radial)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 4 | Live preview + "customized" dot + live contrast warning |
| 2 | Match System / Real World | 4 | Plain labels; arrow glyphs for direction |
| 3 | User Control and Freedom | 3 | Switching to Solid and back loses custom stops |
| 4 | Consistency and Standards | 4 | Reuses pill + swatch-grid vocabulary exactly |
| 5 | Error Prevention | 4 | Contrast guard checks both gradient stops |
| 6 | Recognition Rather Than Recall | 4 | All options visible; no memorization |
| 7 | Flexibility and Efficiency | 3 | 8 fast presets; no swap-stops shortcut |
| 8 | Aesthetic and Minimalist | 4 | Gradient controls appear only when active (progressive disclosure) |
| 9 | Error Recovery | 3 | Contrast copy is fg/bg-centric, not stop-aware |
| 10 | Help and Documentation | 3 | No tooltip for gradient (self-evident, acceptable) |
| **Total** | | **36/40** | **Excellent (minor polish)** |

## Anti-Patterns Verdict
PASS. This is QR output color (the feature's purpose), not banned gradient text or decorative UI chrome. Deterministic detector: 0 findings on QRControls.tsx + QRPreview.tsx. Control UI is flat, token-driven, consistent with siblings.

## What's Working
- Contrast guard extended to both stops (worst-case) — a real scannability safeguard.
- Controls match the existing component vocabulary perfectly (pills, 44px swatch grids, border-action active).
- Single source of truth (composeQrSvg) flows the gradient to preview/PNG/SVG/PDF and the shareable URL, fully sanitized.

## Priority Issues
- [P2] Toggling Solid then back re-seeds and discards custom stops. Fix: remember the last gradient in component state and restore on re-enable.
- [P3] Direction grid order (↖ ↑ ↗ → / ↘ ↓ ↙ ←) isn't an intuitive compass flow. Fix: clockwise order.
- [P3] Contrast warning copy is fg/bg-centric, not gradient-stop aware.
- [P3] Eye "Match foreground" swatch shows solid color while a gradient is active.

## Persona Red Flags
- Sam (a11y): none material — keyboard reachable, aria-pressed, focus rings, direction by glyph+label not color alone, contrast guard.
- Jordan (first-timer): "Radial" mildly technical but the live preview teaches instantly; controls discoverable in the Appearance panel.
- Casey (mobile): 44px targets, controls wrap, 4-col direction grid fits.

## Questions to Consider
- Should switching back to Solid keep the gradient "remembered" so it's one tap to restore?
- Is a "swap stops" affordance worth a small reverse button?
