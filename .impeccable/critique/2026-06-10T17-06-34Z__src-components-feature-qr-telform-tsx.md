---
target: "added tel: content type"
total_score: 31
p0_count: 0
p1_count: 0
timestamp: 2026-06-10T17-06-34Z
slug: src-components-feature-qr-telform-tsx
---
## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Live preview + `aria-live` reliability caption are good; no positive "valid number" affirmation and no preview of the dialed string |
| 2 | Match System / Real World | 3 | Plain-language hint, `tel:` correctly hidden; EN placeholder is a US number for a Myanmar/Vietnam-first audience |
| 3 | User Control and Freedom | 3 | Visible formatting preserved, nondestructive, single field; no clear/undo affordance (low cost) |
| 4 | Consistency and Standards | 4 | Exact sibling parity with SmsForm: validate-on-blur-then-live, input attrs, forced-Highest EC |
| 5 | Error Prevention | 3 | Permissive regex rejects garbage but accepts country-code-less numbers that may not dial |
| 6 | Recognition Rather Than Recall | 3 | Placeholder + label + hint visible; no country-code example beyond placeholder |
| 7 | Flexibility and Efficiency | 3 | `autoComplete="tel"` + `inputMode="tel"` correct; no paste/normalize preview |
| 8 | Aesthetic and Minimalist Design | 4 | Leanest form in the family; message field and payload Callout correctly omitted |
| 9 | Error Recovery | 3 | Clear error wired via merged `aria-describedby` + `role="alert"`; says what, not why (no country-code hint) |
| 10 | Help and Documentation | 2 | One-line hint only; EC row has a Tooltip, the number field has none |
| **Total** | | **31/40** | **Good (strong; gaps are about international-number guidance, not structure)** |

## Anti-Patterns Verdict

**LLM assessment: PASS.** Does not read as AI-generated. No gradient text, glassmorphism, side-stripe borders, identical card grids, or redundant copy; no em dashes in user-facing strings. `TelForm` is the leanest form in the family, reuses the shared `Input` primitive and semantic tokens, and the deliberate omission of a message field and payload warning shows judgment, not template-filling.

**Deterministic scan: UNAVAILABLE.** `detect.mjs` loads but its bundled core is missing, so it crashed after a real attempt ("bundled detector not found"). No CLI findings and, per the same missing bundle, no injectable browser overlay. No false positives to report; no overlay is visible in the browser.

**Browser evidence (manual fallback):** Confirmed visually that a bare local number `(555) 123-4567` validates with no error and no preview of the dialed digits; Burmese locale renders cleanly (localized label/hint, local `+95 9` placeholder, Burmese numerals in the EC pills) with no overflow; no console errors.

## Overall Impression

Solid, disciplined, and consistent. The Phone mode does one thing and inherits the family's good behaviors for free, which is exactly the "earned familiarity" bar for a product surface. The single biggest opportunity: for a feature whose entire value is "it dials the right number," the UI never confirms the number it will actually dial, and silently accepts country-code-less numbers that can fail when scanned.

## What's Working

1. **Exact sibling consistency.** `TelForm` mirrors `SmsForm` line-for-line for the number field (validate-on-blur-then-live, `type`/`inputMode`/`autoComplete`, EC forced to Highest in the same effect). A user who learned SMS gets Phone for free.
2. **Disciplined minimalism.** Correctly omits the message field and the payload-length Callout; the form is one input and one hint. Nothing extraneous.
3. **Correct accessibility wiring.** The hint id is passed as `aria-describedby` and the shared `Input` merges it with the error id rather than clobbering, so a screen reader hears both hint and error; `role="alert"` and the required marker are present.

## Priority Issues

**[P2] No confirmation of the number that will be dialed.** The field preserves the user's formatting but never shows the normalized `tel:` digits (`+`/digits). Browser evidence confirmed this. For a "call us" QR, this is the highest-stakes moment and there is zero reassurance the encoded number is right; a mangled number is discovered only after printing. Fix: when valid, show a small helper line driven off `normalizePhone(config.number)`, e.g. "Will dial: +95912345678".

**[P2] Bare local numbers validate but may not dial.** `PHONE_REGEX` accepts a number with no country code and `buildTelString` emits `tel:0912345678`. Such a code can fail on scanners abroad or some carriers, with no warning. Fix: when the normalized number has no leading `+`, surface a soft caution (not a hard error) suggesting a country code, consistent with the amber-caution pattern already used for reliability.

**[P3] EN placeholder uses a US number for a Myanmar-first audience.** `en.json` is `+1 555 123 4567` while `my.json` correctly uses `+95 9 123 456 789`. The English placeholder subtly signals "not built for here" to English-reading local users. Fix: change the EN placeholder to a `+95` example (or region-neutral).

**[P3] Help/documentation is the weakest dimension.** The field offers only its one-line hint and no affordance to learn about international format, while the reliability row gets a Tooltip. Fix: expand `telModeHint` to mention the country code ("include the country code, e.g. +95"), or add a small Tooltip beside the label.

## Persona Red Flags

**Jordan (non-technical first-timer):** Types `0912345678`, sees no error, generates a code that may not dial in a real call app. Nothing suggests a country code helps; they learn it failed only after printing.

**Small-business owner ("call us" QR):** Pastes a formatted number from their website and gets no confirmation of the dialed digits. The one guarantee they care about, that it calls their shop, is never affirmed. Highest-stakes gap.

**Burmese-locale user:** Fully served on strings (all six keys present, natural Burmese, local placeholder, localized numerals). Only the shared friction remains: a bare `09…` number passing validation without a `+95` nudge.

## Minor Observations

- The reliability-caption ternary is now a 5-deep `contentMode` chain (wifi/vcard/email/sms/tel). Functional but brittle; a lookup map keyed by `contentMode` would scale better as content types grow.
- The content-type PillGroup is now 6 options, above the "≤4 visible options" comfort line. It is a navigation switcher (not a per-task choice) and wraps cleanly 3-up/2-up, so it is acceptable, but worth watching if a seventh type lands.
- `tel.ts`'s doc comment says it returns '' for an "implausible" number; the regex is deliberately loose, so the comment slightly oversells the validation. Soften to "rejects obvious garbage" to match `phone.ts`.
- The number field keeps `required`, but a blank value just yields an empty QR (no hard block), consistent with siblings.

## Questions to Consider

1. If the entire value of a Phone QR is "it dials the right number," why does the UI never show the user the number it will actually dial?
2. A loose regex optimizes for "don't annoy the user" but ships country-code-less codes that fail in the field. For a print-once medium, is permissiveness the right default, or should Phone mode nudge toward `+country` the way scanners expect?
3. The content switcher is now six pills and growing. At what point does the flat PillGroup stop being "recognition" and start being something users must re-scan every visit?
