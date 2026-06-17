---
target: "added tel: content type"
total_score: 33
p0_count: 0
p1_count: 2
timestamp: 2026-06-10T17-54-14Z
slug: src-components-feature-qr-telform-tsx
---
## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 4 | "Will dial:" preview now confirms the encoded number live; EC auto-set announced via aria-live. Lifted from 3. |
| 2 | Match System / Real World | 4 | Plain-language "start a call"; EN placeholder now `+95` matches the audience. Lifted from 3. |
| 3 | User Control and Freedom | 3 | Caution is soft/non-blocking; no dismiss, acceptable for advisory text |
| 4 | Consistency and Standards | 3 | Regression: SMS sibling (same phone semantics) still lacks preview/caution and keeps a US placeholder. Was 4. |
| 5 | Error Prevention | 3 | Country-code caution helps, but the loose regex lets `123` validate and preview confidently |
| 6 | Recognition Rather Than Recall | 4 | Preview removes the need to recall what normalization did to the typed value. Lifted from 3. |
| 7 | Flexibility and Efficiency | 3 | `inputMode`/`autoComplete=tel` correct; no paste-cleanup feedback beyond the preview |
| 8 | Aesthetic and Minimalist Design | 3 | Regression: worst case now stacks hint + preview + caution with redundant country-code copy. Was 4. |
| 9 | Error Recovery | 3 | Error copy generic ("Enter a valid phone number"); says what to do, not what failed |
| 10 | Help and Documentation | 3 | Hint + caution cover the country-code concept; now slightly over-documented. Lifted from 2. |
| **Total** | | **33/40** | **Good (net +2 vs prior 31; four dimensions up, two introduced regressions)** |

## Anti-Patterns Verdict

**LLM assessment: PASS.** Still not slop. Comments explain *why* the encoded string differs from the typed string; the dial preview is derived (`useMemo` on `normalizePhone`) so it cannot drift from the payload; the caution is reactive and conditional on a real failure mode (bare local numbers not dialing cross-region), correctly toned amber and inline rather than a boxed `Callout`. The one slop-adjacent smell is the hint/caution copy redundancy (below).

**Deterministic scan: UNAVAILABLE.** `detect.mjs` still loads but its bundled core is missing ("bundled detector not found"), crashing after a real attempt. No CLI findings, no injectable overlay, nothing visible in the browser. No false positives.

**Browser evidence (manual fallback):** Confirmed two new findings deterministically. Typing `123` renders "Will dial: 123" plus the country-code caution (false confidence). The input's `aria-describedby` resolves only to the hint, not the dial preview, so screen-reader users never hear the confirmation that sighted users get.

## Overall Impression

The fixes worked where they were aimed: the prior "I can't see what this will dial" valley is closed, and Myanmar-first copy landed. But the score held flat-ish (31 → 33) because the additions cost minimalism and broke sibling consistency. This is the honest result: the changes were a net positive, not a clean win. The biggest opportunity now is to recover the lost minimalism (cut redundant copy) and propagate the safety net to SMS so the product stays consistent.

## What's Working

1. **Dial preview is the right feature, well-scoped.** It surfaces the typed-vs-encoded gap that previously caused silent dial failures, and it is derived so it can't drift from the actual payload.
2. **Caution tone is calibrated.** Amber `text-warning`, `aria-live="polite"`, no box, no dismiss-guilt: correct severity for "works but might not travel," distinct from the boxed `Callout` reserved for genuine scan/contrast risks.
3. **Accessibility plumbing is careful** (where it reaches): `Input` merges the caller hint id with its internal error id rather than clobbering, and the caution announces politely only when it appears.

## Priority Issues

**[P1] Hint and caution say the same thing.** `telModeHint` ("Include the country code, e.g. +95.") pre-warns about exactly what `telNoCountryCodeCaution` ("No country code yet. Add one (like +95)...") then re-warns, with the same `+95` example twice within ~80px. The repetition makes the caution feel like nagging and inflates the per-field text-row count that hurt minimalism. Fix: shorten the hint to "Scan to start a call." and let the reactive caution own the country-code guidance (it only fires when relevant). Copy-only, `en.json`/`my.json`.

**[P1] Consistency regression against the SMS sibling.** SMS uses the identical regex and `normalizePhone` but has no dial preview, no country-code caution, and still a US placeholder (`+1 555 123 4567`), while Tel now has all three. A user who builds a Phone code then an SMS code watches the safety net vanish for the same input type. Fix: extract the ~8-line `dialNumber`/`missingCountryCode` block into a shared helper used by both `TelForm` and `SmsForm`, and align the SMS placeholder.

**[P2] The preview confidently shows non-dialable numbers.** `PHONE_REGEX` accepts any 3+ chars with a digit, so `123` yields no error and "Will dial: 123". The preview's entire value is trust; "Will dial: 123" teaches users it is not authoritative. Fix: gate the preview on a stricter minimum (e.g. require roughly 7+ digits after normalization) in `phone.ts` or `TelForm.tsx`.

**[P2] Screen-reader users do not get the dial confirmation.** The preview is a plain `<p>` not referenced by the input and not a live region; `aria-describedby` resolves only to the hint (browser-confirmed). The single best status improvement is invisible to assistive tech. Fix: add the preview's id to the input's `aria-describedby` (preferred over a live region, since it changes per keystroke and would otherwise spam).

**[P3] Generic error copy misses a teaching moment.** `telNumberError` = "Enter a valid phone number" gives no hint about what failed. Fix: "Enter a phone number using digits, e.g. +95 9 123 456 789." Align SMS.

## Persona Red Flags

**Jordan (non-technical first-timer):** Reads the hint ("include country code"), types local `09...`, then reads the caution telling them the same thing again. Mild "did I do it wrong?" friction from the redundancy. Otherwise well served: the preview reassures.

**Small-business owner ("call us" QR):** The preview shines when they paste a formatted number, showing the stripped result. But a pasted short extension or vanity string yields "Will dial: 123" false confidence and could ship a broken code on a printed flyer.

**Burmese-locale user:** Strong parity: placeholder, hint, preview, and caution all translated with locale-appropriate `+95`. Watch item only: verify the `{number}` (LTR digits) sits cleanly against the Burmese caution text; no bug observed.

## Minor Observations

- The caution condition `!!dialNumber && !dialNumber.startsWith('+')` correctly suppresses on empty/invalid input (normalizePhone returns null), so no caution flashes on garbage.
- `TelForm` already imports `useId`, so the P2 aria-describedby fix has no new import cost.
- `telCorrectionHint` ("Set to Highest...") reads slightly imperative though the app already forced Highest; shared across all non-text modes, not Tel-specific.

## Questions to Consider

1. If the dial preview is the trust anchor, why does it appear for `123` while the number itself is never checked for dialability? Are you previewing confidence you can't back?
2. SMS and Phone share the same normalization and the same "will it dial abroad?" risk. What is the product reason SMS users get less safety, or is this just where the work stopped?
3. You added a hint that pre-teaches the country code and a caution that re-teaches it. If you kept only one, which actually changes behavior?
