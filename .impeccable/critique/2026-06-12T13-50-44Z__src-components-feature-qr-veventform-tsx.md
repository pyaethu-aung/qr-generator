---
target: Calendar/vEvent content type
total_score: 32
p0_count: 0
p1_count: 2
timestamp: 2026-06-12T13-50-44Z
slug: src-components-feature-qr-veventform-tsx
---
# Critique: Calendar/vEvent content type (run 2)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | End-before-start makes the preview revert to a wordless dashed placeholder |
| 2 | Match System / Real World | 3 | "Times are saved in the scanner's own local time" is an abstraction a restaurant owner cannot parse |
| 3 | User Control and Freedom | 3 | All-day round trip now restores times (fixed); still no clear-form affordance, full state loss on reload |
| 4 | Consistency and Standards | 3 | Optional marking inconsistent: Description "(optional)", but Location and Ends unmarked |
| 5 | Error Prevention | 4 | min= picker floor, native pickers, EC auto-forced, all-day conversion preserves day and times |
| 6 | Recognition Rather Than Recall | 3 | On mobile, the date error (below fold) and the vanished QR (above fold) are never co-visible |
| 7 | Flexibility and Efficiency | 2 | No templates, recents, or paste-an-event; single rigid path |
| 8 | Aesthetic and Minimalist Design | 4 | Six controls, collapsed optional block, terracotta economy now respected in this view |
| 9 | Error Recovery | 3 | End error is plain and work-preserving but doesn't offer the fix (swap/clear) |
| 10 | Help and Documentation | 3 | Contextual hints exist; nothing explains what scanning does on the guest's phone |
| **Total** | | **32/40** | **Good** (up from 29) |

## Anti-Patterns Verdict

**LLM assessment: pass.** No banned patterns; no em dashes in vevent copy (the vCard one was fixed); the form reads hand-built, and the copy now explains the why without scolding. Burmese strings are idiomatic.

**Deterministic scan: ran this time via a disclosed fallback.** The repo's bundled detector engine is still missing (exit 1, "bundled detector not found"), but an intact copy of the same skill in a sibling repo scanned both files: exit 0, zero findings, with a seeded-file validity check confirming the detector works. The in-page detector (also via fallback) reported 5 page-level patterns; none attributable to the vEvent files. Notable for the app shell, not this feature: one `nested-cards` hit (Card inside card) and `cramped-padding` x2. The `single-font`/`overused-font` pair double-counts the deliberate Inter-only convention, `repeated-section-kickers` fires on the app's consistent card-header pattern, and `cream-palette` flags the design system's own token; treat those as false positives.

## Overall Impression

The two trust-eroding state bugs from run 1 are gone, and the score reflects it. What the fixes revealed is the next layer down: the new partial-fill hints are invisible to screen readers because the shared Input primitive never associates helper text, and the preview's wordless dashed placeholder is now the weakest moment in the flow, especially on mobile where cause and effect are a screenful apart.

## What's Working

1. The all-day round trip restores exact chosen times (verified live: 18:30/20:30 survived), with the stake named in a code comment. Craft most mature products lack.
2. Partial-fill guidance that names the missing field, fully idiomatic in Burmese too, converts the dead-preview stall into forward motion.
3. The payload pipeline serves the design goal at byte level: floating local times, no PRODID/UID/folding, exclusive all-day DTEND honoring the user's inclusive mental model.

## Priority Issues

- **[P1] helperText is not announced to assistive tech**: `Input.tsx:54` renders helper text as a bare span with no id, never merged into `aria-describedby` (only errors are), no live region. The form's signature anti-stall mechanism is invisible to screen reader users. Fix: give the helper span an id, merge it into describedBy, announce via `aria-live="polite"`.
- **[P1] Wordless dead preview on blocking error**: when end < start the payload is '' and the preview reverts to a dashed "QR preview" placeholder with zero explanation; at 375px the error and the vanished QR are never co-visible. Fix: pass a blocked-reason into the preview empty state or keep the last valid QR dimmed with a caution badge.
- **[P2] All-day checkbox sits below the fields it transforms**: a user wanting an all-day event fills two datetime pickers (times included) before discovering the toggle. Fix: move All-day above or beside the Starts/Ends row.
- **[P2] Inconsistent optional marking**: Description says "(optional)" but Location and Ends, equally optional, are unmarked while required fields carry asterisks. Fix: one convention, asterisks only or "(optional)" on all three.
- **[P2] Order-dependent payload warning**: payload length derives from `buildVEventString`, which returns '' until the payload is coherent; a 500-char description typed before the title produces no warning until the title lands, then warning and dense QR pop simultaneously. Fix: compute warn length from a draft concatenation independent of coherence.

## Persona Red Flags

**Jordan (first-timer)**: reads "Times are saved in the scanner's own local time" first and now distrusts the times ("scanner" = a person? a machine?); treats Location as required because Description alone says "(optional)"; gets no affirmative "your code is ready" moment in the form column.

**Casey (distracted mobile user)**: the QR's disappearance on a date error happens off-screen; a killed tab loses the half-typed event (design/frame configs persist to localStorage, content doesn't); must pass two datetime pickers before finding All-day. Native pickers, 44px targets, and clean stacking all pass.

**Sam (assistive-tech user)**: the partial-fill hints are never announced (the Input helper span); the timezone note is `aria-describedby` on the title input only, not on Starts/Ends which it actually concerns. Passes: end error role="alert" + aria-invalid, real button with aria-expanded for Description, real label on the checkbox, payload Callout role="status", "QR code updated" live announcement.

## Minor Observations

- Burmese locale: native picker placeholders stay English-formatted ("mm/dd/yyyy, --:--"), with no compensating format hint; "Appearance"/"Logo" section headers remain English.
- No language toggle in the navbar (DESIGN.md specifies one); locale reachable only via localStorage.
- Event data survives mode switches (hooks live at QRGenerator level); min= carries through the all-day type swap; the payload warning sits outside the collapse so it can't be hidden with its cause; equal start/end is allowed as a zero-duration reminder. All quietly good.
- Event is the 8th of 8 pills; for a flyer-printing audience it arguably deserves a better slot.

## Questions to Consider

1. If "the result is the product," why is the preview ever a wordless dashed box when the form knows exactly which blocker is active?
2. A 450-character event produces a QR that visibly won't scan from a flyer: at what point does the polite Callout become dishonest, and should description length be capped?
3. The real high-stakes moment is the print run, not the download. Should an Event QR offer a "verify it yourself" path (.ics download or scan-it-yourself prompt) before someone prints 200 posters?
