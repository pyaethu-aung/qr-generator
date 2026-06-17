---
target: Batch generation tab
total_score: 35
p0_count: 0
p1_count: 0
timestamp: 2026-06-16T11-09-55Z
slug: src-components-feature-qr-batchgenerator-tsx
---
## Critique: Batch generation tab

### Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 4 | Live count, role=progressbar + aria-live progress, success confirmation. |
| 2 | Match System / Real World | 4 | Plain language ("Your list", "Generate ZIP"); universal format names. |
| 3 | User Control and Freedom | 3 | No way to cancel an in-flight batch run. |
| 4 | Consistency and Standards | 4 | Reuses PillGroup, Callout, eyebrow/title/card vocabulary verbatim. |
| 5 | Error Prevention | 3 | Cap + truncation warning, dedup, disabled Generate when empty. |
| 6 | Recognition Rather Than Recall | 4 | Everything visible; design-inheritance note removes guesswork. |
| 7 | Flexibility and Efficiency | 3 | This IS the bulk accelerator, but no file import or Cmd+Enter submit. |
| 8 | Aesthetic and Minimalist Design | 4 | One card, no clutter, terracotta economy held (3 accents at rest). |
| 9 | Error Recovery | 3 | Render error is clear but generic (doesn't name the failing code). |
| 10 | Help and Documentation | 3 | Subtitle + example placeholder + inline design note; no separate docs. |
| **Total** | | **35/40** | **Good (top of band)** |

### Anti-Patterns Verdict

**LLM assessment**: Does not look AI-generated. It inherits the established "Potter's Atelier" system rather than reaching for generic SaaS scaffolding: warm neutral surfaces, a single terracotta accent used sparingly, pill controls, the same eyebrow/title/card rhythm as the Generate and Scan tabs. No gradient text, no side-stripe borders, no glass, no hero-metric template. The "BATCH" eyebrow is consistent voice (every tab uses one), not reflexive scaffolding.

**Deterministic scan**: `detect.mjs` over `BatchGenerator.tsx` returned `[]` (exit 0). Clean.

**Visual evidence**: Inspected at desktop (1200w, dark) and mobile (390w, light) across empty, filled, generating, and success states. Real end-to-end output verified: a 4-line list produced a valid ZIP of four 1000×1000 PNGs with ordered, slugified names.

### Overall Impression

Ships as-is. It reads as a native third mode, not a bolted-on power feature. The single biggest opportunity is resilience around the run itself: there is no cancel, and the pasted list is lost if the user switches tabs mid-thought.

### What's Working

- **Consistency**: indistinguishable in vocabulary from the Scan tab. A returning user already knows how to read it.
- **Status visibility**: count, progress bar, and success state each have a real ARIA story, not just visuals.
- **Restraint**: no duplicate design controls; the inherited-design note does the reassurance job in one line.

### Priority Issues

- **[P2] Pasted list is lost on tab switch.** The tab mounts conditionally, so switching to Generate and back clears the textarea. A user who pasted 150 lines and bumped the wrong tab loses everything. *Fix*: persist the input string to localStorage like the Generate text draft. *Command*: /impeccable harden
- **[P2] No cancel during a run.** A 200-item PDF batch runs sequentially with no abort. *Fix*: an AbortSignal-style flag the loop checks between items, surfaced as a Cancel button. *Command*: /impeccable harden
- **[P3] Generate button width jumps** when its label becomes "Generating code N of M...". *Fix*: keep the button label stable ("Generating...") and let the progress text below carry the count. *Command*: /impeccable polish
- **[P3] PNG dimension differs from single download** (batch 1000px vs single 1024px). *Fix*: harmonize to one constant. *Command*: /impeccable polish

### Persona Red Flags

**Alex (Power User)**: No Cmd/Ctrl+Enter to submit from the textarea; no cancel; no .txt/.csv import. Will want all three but none block the core bulk task.

**Sam (Accessibility)**: Strong. Keyboard-complete, focus-visible rings throughout, progress exposed via role=progressbar + aria-live, and no state conveyed by color alone (success pairs a check icon with text; errors use the Callout's icon + text). No red flags found.

**Riley (Stress Tester)**: Cap (200) and dedup handled with a visible truncation warning. The one real gap is data loss on tab switch (see P2).

### Minor Observations

- The pulsing Layers icon during generation is a nice touch and respects `motion-safe`.
- Success message is a polite-live status, correctly not assertive.

### Questions to Consider

- Should a long PDF batch warn about expected time before it starts?
- Is per-line filename control (label,value) worth the parsing cost later, or is ordinal+slug enough?
