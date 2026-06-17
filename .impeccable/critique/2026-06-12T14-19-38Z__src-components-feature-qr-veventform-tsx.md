---
target: Calendar/vEvent content type
total_score: 33
p0_count: 0
p1_count: 2
timestamp: 2026-06-12T14-19-38Z
slug: src-components-feature-qr-veventform-tsx
---
# Critique: Calendar/vEvent content type (run 3)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Description-only or location-only drafts still get the wordless generic placeholder |
| 2 | Match System / Real World | 4 | Calendar-app vocabulary, teaching placeholders, plain timezone sentence |
| 3 | User Control and Freedom | 3 | Lossless all-day round trip; but no clear-form and a refresh destroys the draft |
| 4 | Consistency and Standards | 3 | "Scan Reliability" (control label) vs "Error correction" (hint copy): two names for one concept |
| 5 | Error Prevention | 3 | Strong layered prevention; a past start date (the year-typo on a poster) is accepted silently |
| 6 | Recognition Rather Than Recall | 4 | Preview hint repeats the field hint verbatim; cause and effect co-located |
| 7 | Flexibility and Efficiency | 2 | No recents, duplicate-event, or recurrence; one rigid path |
| 8 | Aesthetic and Minimalist Design | 4 | Terracotta economy respected; Callout appears only when earned |
| 9 | Error Recovery | 4 | End error is plain, field-level, mirrored in the preview, work-preserving (all verified live) |
| 10 | Help and Documentation | 3 | Mode hint explains scan consequence and floating time up front; nothing deeper |
| **Total** | | **33/40** | **Good** (29 → 32 → 33) |

## Anti-Patterns Verdict

**LLM assessment: pass.** No banned patterns, no em dashes, committed atelier palette in both themes, copy with a human voice. The only borderline reflex is the 8-pill mode bar itself.

**Deterministic scan: clean.** CLI detector (disclosed fallback from the sibling sudoku repo; this repo's engine bundle is still missing) scanned VEventForm, QRControls, and QRPreview: exit 0, zero findings, with a canary test proving the engine works. The in-page detector reported the same 5 page-level patterns as run 2 (clipped-overflow shell, cramped-padding x2, nested-cards, single-font pair, section kickers, cream palette); none trace to the vEvent files, and the false-positive analysis from run 2 stands. The recurring real item remains the app shell's `nested-cards`.

## Overall Impression

The vEvent form itself has stopped being the problem. Run 1's bugs and run 2's feedback gaps are fixed and verified live; what remains is app-level: drafts don't survive a refresh, the mobile column order buries the payoff, and the empty-state guidance has one uncovered case (optional-fields-first). Scores are now moving by single points: diminishing returns on this surface.

## What's Working

1. The all-day toggle round trip, verified live again (19:00/21:00 stash and exact restore), with the stakes named in the code.
2. Empty states that explain themselves: the preview mirrors the exact missing-field or end-error message, and the long-description warning now fires even before the title exists (verified at a 287-char description with no title).
3. Encoding craft serving non-experts invisibly: RFC escaping, exclusive DTEND from an inclusive "Ends", sparse matrix, draft-length warning.

## Priority Issues

- **[P1] No draft persistence**: a refresh or mobile tab-discard destroys a half-written event; theme and locale persist, content doesn't. Fix: debounced per-mode draft serialization to localStorage, restored on mount.
- **[P1] Optional-fields-first drafts get no guidance**: previewPlaceholderHint covers only the summary/start pair; typing a description or location first leaves the wordless box and disabled buttons. Fix: when any vevent field has content but both required ones are empty, show "Add an event title and start date to finish your QR code."
- **[P2] Mobile flow inversion**: at 375px the preview and actions sit above the form; finishing the last field gives no visible payoff without scrolling back up. Fix: compact sticky preview or a repeated action row below the form on small screens.
- **[P2] Past dates accepted silently**: printing last year's date is the costliest failure after a wrong time. Fix: non-blocking `role="status"` Callout when start < today; never block (retro events exist).
- **[P2] Untranslated sr-only "required"**: Input.tsx hardcodes the English word; Burmese screen-reader users hear English on every required field. Fix: thread a translated label through Input.

## Persona Red Flags

**Jordan (first-timer)**: "Ends" optionality is only signaled by the absence of an asterisk, too implicit; "All-day" above empty pickers momentarily reads as "all day of what?"; otherwise Jordan now succeeds end-to-end.

**Casey (distracted mobile user)**: tab discard or pull-to-refresh loses everything (their defining failure mode); the payoff lives at the top while the form ends at the bottom. Native pickers, 44px targets, single-column stacking all pass.

**Riley (stress tester)**: zero-duration events accepted but never explained; past dates pass silently; floating time disclosed in the hint but an international webinar QR would be silently wrong (deliberate, defensible, at least disclosed); escaping and error recovery hold.

## Minor Observations

- The Description textarea is fixed at 3 rows with resize disabled; long descriptions (the case this mode warns about) clip with no way to see them. Auto-grow would fit.
- Required asterisks use the error token; DESIGN.md reserves Clay Red for errors. Marginal drift, shared app-wide.
- "Scan Reliability" vs "Error correction" noun mismatch in the hint copy.
- No language toggle in the navbar (DESIGN.md specifies one), gating Burmese users out of these translations.
- CLAUDE.md still describes the old Generate-button snapshot model; the build is live-preview. Docs lag the code.

## Questions to Consider

1. The preview shows the QR but never the event as a calendar will render it. Would a one-line readback ("Team dinner · Tue, Jul 1 · 7:00–9:00 PM · City Hall") under the preview do more for trust than any scan-reliability copy?
2. At 8 pills with Event in position 8, when does the mode bar admit it's a category picker rather than a segmented control?
3. All-day is the only bare checkbox in a pill-based system; would a two-pill "Timed / All-day" segment be more native to the design language and more legible in Burmese?
