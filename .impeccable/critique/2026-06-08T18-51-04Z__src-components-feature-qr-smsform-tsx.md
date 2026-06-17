---
target: SMS content type
total_score: 28
p0_count: 0
p1_count: 2
timestamp: 2026-06-08T18-51-04Z
slug: src-components-feature-qr-smsform-tsx
---
# Critique: SMS content type

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 2 | EC silently forced to "Highest" on mode switch; no acknowledgement the app changed a setting |
| 2 | Match System / Real World | 3 | "Phone number" is right; no echo of the resulting SMS intent the recipient sees |
| 3 | User Control and Freedom | 3 | Forced EC is overridable (good), but advisory warning not dismissible; silent change not undoable as an explicit action |
| 4 | Consistency and Standards | 3 | Strong consistency with EmailForm; advisory warning reuses role="alert" (assertive) at the same severity as a real error |
| 5 | Error Prevention | 2 | Number injected verbatim into SMSTO: (spaces/parens/dots survive); permissive regex; real scanner-breakage risk on the one field that must work |
| 6 | Recognition Rather Than Recall | 3 | Collapsed optional Message reads well; nothing tells a non-technical user what the code will do |
| 7 | Flexibility and Efficiency | 3 | Fine for the task; no country-code or formatting assist for a phone-first feature |
| 8 | Aesthetic and Minimalist Design | 3 | Clean; >3 terracotta elements can be visible at once, drifting from the sparing-accent rule |
| 9 | Error Recovery | 3 | "Enter a valid phone number" is clear and announced; does not teach what is wrong or show an example |
| 10 | Help and Documentation | 3 | Good hint copy + EC tooltip; no explanation of why SMS recommends Highest |
| **Total** | | **28/40** | **Solid, above-average product UI with one correctness gap** |

## Anti-Patterns Verdict

Not slop. A category-fluent user broadly trusts it. Two things make a careful user pause: the lone half-width SMS pill stranded on its own grid row, and Scan Reliability silently jumping to "Highest" with no acknowledgement. It reads as a faithful clone of EmailForm rather than a feature designed for SMS (only the 200-vs-300 char threshold differentiates them).

Deterministic scan: UNAVAILABLE. detect.mjs failed to load its bundle ("bundled detector not found") after a real attempt. Browser evidence used instead.

## What's Working

1. Accessible error handling: invalid-number error renders as role="alert" with aria-invalid/aria-describedby via the shared Input, and clears on the next keystroke. Verified live.
2. Correct collapsible Message: aria-expanded + aria-controls + textarea aria-labelledby pointing at the toggle; auto-opens when a message already exists so re-entry never hides data. Verified in the live a11y tree.
3. First-class keyboard focus: 2px terracotta focus-visible ring with offset on every pill/toggle; tab order follows reading order.

## Priority Issues

[P1] Phone number injected verbatim into the SMSTO payload. buildSmsString trims but does not strip spaces/parens/dots, and the regex accepts "+1 (555) 123.4567". Many scanner apps and SMS intents choke on non-digit characters, so a code that previews fine can fail to pre-fill. Fix: normalize to "+" plus digits before building the payload; keep the spaced placeholder for readability and the loose regex for validation only.

[P1] Silent forced "Highest" reliability, contradicted without warning. Selecting SMS fires setInputEcLevel('H') with no acknowledgement; the user can then click "Low" while the hint still reads "Highest reliability recommended for SMS codes" (verified live: Low pressed + stale hint). Fix: announce the auto-change via aria-live, and replace the static recommendation with a contextual warning when the chosen EC is below the SMS recommendation.

[P2] Message toggle is a 20px touch target. Measured live at 20px tall, below the 44px WCAG 2.5.5 minimum. Inherited from EmailForm. Fix: pad to min-h-11 with the chevron right-aligned.

[P2] Advisory payload warning uses role="alert". Assertive, interrupting screen readers at the same urgency as the real validation error. Fix: role="status" + aria-live="polite", and visually differentiate advisory (warning/amber) from blocking error (red).

[P3] 5-pill grid strands SMS as a lone cell. At desktop (lg:grid-cols-3) and mobile (grid-cols-2) the fifth option sits with an empty cell beside it, reading as unfinished. Fix: span SMS across the trailing empty cell, or rebalance the split.

## Persona Red Flags

Non-technical first-timer (restaurant owner): "Scan Reliability / Highest (30%)" is unevaluable jargon; the silent jump gives no mental model. They will type "(09) 123 4567" (the placeholder even models spaces), it previews fine, and may not pre-fill on a customer's phone (the P1 failure) with no warning and no confirmation of what the code does.

Burmese-locale user: copy is coherent and consistent (verified my.json); placeholder correctly localizes to a +95 example. "SMS" pill label left untranslated (acceptable borrowed term, but the only un-localized sibling).

Screen-reader user on mobile: 20px Message toggle plus assertive role="alert" on a non-urgent advisory means interruption for advice, then a tiny target to reach the optional field.

## Minor Observations

- messageId is generated via useId but the textarea labels itself via aria-labelledby (the toggle), so messageId is effectively dead wiring carried over from Email.
- Warning uses a hand-rolled inline SVG, bypassing the lucide-react set the redesign standardized on. Use AlertTriangle.
- 200-vs-300 payload threshold difference from Email is reasonable but undocumented.
- Most of the a11y findings (20px toggle, role="alert", inline SVG, dead id) are inherited from EmailForm: they are shared-pattern debt, and fixing them improves Email too.

## Questions to Consider

1. If "Highest" is genuinely required for SMS to scan, why is it a freely-overridable pill rather than a default with an explicit "lower it" escape; and if it is only a recommendation, why change the user's setting silently?
2. The most failure-prone field is the phone number, yet there is zero normalization and no echo of the resulting SMS intent. Should a phone-first feature ship without "Opens a text to +95 9 123 456 789" so the user can verify before downloading?
3. SmsForm is a near-verbatim fork of EmailForm with two constants changed. Did SMS get designed, or just cloned?
