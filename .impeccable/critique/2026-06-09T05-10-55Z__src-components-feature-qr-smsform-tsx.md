---
target: SMS content type
total_score: 34
p0_count: 0
p1_count: 2
timestamp: 2026-06-09T05-10-55Z
slug: src-components-feature-qr-smsform-tsx
---
# Critique: SMS content type (round 2, post-fix)

Prior run: 28/40. This run re-reviews after three fixes (phone normalization, dynamic reliability hint, centered equal-width pill grid).

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Hint/warning/error all announce; the auto-jump to Highest on entering SMS is still silent (only speaks once the user lowers it) |
| 2 | Match System / Real World | 4 | "Phone number", "Message", the mode hint are plain and accurate |
| 3 | User Control and Freedom | 3 | User can lower reliability, but the active "Low" pill wears the brand approval color while the caption warns against it |
| 4 | Consistency and Standards | 4 | Faithfully mirrors EmailForm; pill/disclosure/warning patterns reused |
| 5 | Error Prevention | 3 | Permissive regex catches garbage but only on blur; multi-+/parens handled; SMSTO message not escaped (low-risk colon edge) |
| 6 | Recognition Rather Than Recall | 4 | Icons + labels on every pill; collapsed Message discoverable via chevron |
| 7 | Flexibility and Efficiency | 3 | Optional Message one click away; no formatting help on the number |
| 8 | Aesthetic and Minimalist Design | 3 | Accent budget tight: eyebrow + active content pill + active reliability pill = 3+ terracotta in one column |
| 9 | Error Recovery | 4 | Error is role=alert, red, aria-invalid + aria-describedby, clears on edit |
| 10 | Help and Documentation | 3 | Reliability tooltip good; nothing explains the forced Highest or the "concise" length |
| **Total** | | **34/40** | **Upper band, up from 28; a few specific defects remain** |

## Anti-Patterns Verdict

Not slop, competent and trustworthy in structure (real aria, honest copy, normalized payload). Two details still make a fluent user pause: the terracotta "approval" color painted on the warned-against "Low" reliability choice (color contradicts copy), and the 20px Message disclosure target (sub-standard within the same screen).

Deterministic scan: UNAVAILABLE (detect.mjs failed to load its bundle, "bundled detector not found", after a real attempt). Browser evidence used instead.

## What's Working (verified)

1. Honest, scan-focused copy and warnings (SmsForm.tsx:38,89): mode hint sets expectations, payload warning is specific.
2. Real error semantics (SmsForm.tsx:44-45): role=alert, aria-invalid, aria-describedby; clears on edit.
3. Payload normalization with intent (sms.ts:22): strips spaces/parens/dashes from the encoded number while preserving display formatting, preventing silent scan failures. The round-1 fix landed.
4. Dynamic reliability hint (QRControls.tsx): below Highest in a forced mode, the hint switches to an amber caution in an aria-live region instead of the old contradictory "Highest recommended" line. Verified live. The round-1 fix landed.
5. Pill grid (verified): 5 equal-width pills, 3+2 centered at desktop, 2+2+1 centered at mobile, no full-row stretch, no empty cell, no clipping. The round-1 fix landed.

## Priority Issues

[P1] Active "Low" reliability pill uses the brand approval/terracotta color while being the warned-against choice. Verified live: active-Low background = #D4916E (exactly --color-action) while the amber caption (#D4A850) shows simultaneously. Terracotta is the app's "good/primary" signal; painting it on a choice the system disapproves of is a direct color-meaning conflict, the strongest "subtly off" tell here. This is a side effect of the round-1 dynamic-hint fix: the hint was recolored, the pill was not. Fix: when contentMode !== 'text' && ecLevel !== 'H', give the active reliability pill a warning/neutral treatment (amber ring or fill) so color agrees with the caption.

[P1] Message disclosure toggle is a 20px hit target. Measured 20px (SmsForm.tsx:54-68) vs the 44px minimum the rest of the app honors (Appearance/Frame/Logo toggles use min-h-[44px]). An inconsistency within the same screen. Inherited from EmailForm; consciously deferred in round 1 as shared-pattern debt. Fix: add min-h-[44px] + vertical padding to the message toggle (touches EmailForm too).

[P2] The forced jump to "Highest" is silent and unexplained. Selecting SMS changes the user's reliability via the effect at QRGenerator.tsx:65 with no notice; the aria-live region only speaks once they re-lower it. Fix: announce the auto-set ("Set to Highest for SMS codes") or show a one-line rationale near the pills, not only on deviation.

[P2] Validation fires only on blur. Typing "call me" gives no feedback until focus leaves; on mobile the keyboard may hide the field. Fix: re-validate on change once the field has been touched (debounced), keeping blur as the first trigger.

[P3] SMSTO message not escaped; warn threshold is a mystery number. sms.ts interpolates the raw message into the colon-delimited payload ("Call me at 3:00" works since parsers take the rest; low risk). The 200-char threshold (SmsForm.tsx:8) is invisible. Fix: leave encoding, but surface the limit or a character count like the Frame caption does.

## Persona Red Flags

Non-technical first-timer (restaurant owner): lands on Phone + a dimmed wall of Scan Reliability/Appearance/Frame/Logo. The "Low (7%)/Medium (15%)" percentages are jargon; and if they touch "Low," the brand-colored active state says it's fine while the amber line says it isn't. They cannot resolve the conflict.

Burmese-locale user: copy coherent and consistent (my.json:125-132); placeholder correctly localized to +95 9 123 456 789. But neither locale's error hints at country-code expectations; a local 09... number passes the loose regex but may dial wrong if scanned abroad.

Keyboard / touch user: focus-visible rings are correct everywhere, so the 20px Message toggle stands out as the one sub-standard control.

## Minor Observations

- Eyebrow + active content pill are both terracotta before reliability; the ~3-accent budget is already tight. Fixing the Low-pill color also relieves this.
- Payload warning placement (between textarea and separator) reads as belonging to the message. Good.
- Phone field has type=tel inputMode=tel autoComplete=tel: correct mobile keyboard + autofill.
- Pre-filled long messages auto-expand on mode re-entry (acceptable, never hides data).

## Questions to Consider

1. If "Highest" is mandatory for SMS (the app forces it), why show the Low/Medium/High pills here at all? Offering a choice you then warn against may be less honest than hiding it.
2. What is terracotta supposed to MEAN in this product? Should the active pill wear the approval color when the system disapproves of that choice?
3. For a non-technical user making one SMS code, does "Scan Reliability" with 7/15/25/30% percentages earn its prominence, or should it collapse like Appearance/Frame/Logo until asked for?
