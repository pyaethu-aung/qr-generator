---
target: Country code selector
total_score: 29
p0_count: 0
p1_count: 1
p2_count: 2
timestamp: 2026-06-10T19-33-48Z
slug: src-components-common-countrycodeselect-tsx
---
## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Dial preview, live error clearing, and caution nudge are solid. No async state to show. |
| 2 | Match System / Real World | 3 | Plain labels throughout. `+ Code` placeholder is slightly cryptic — "Country" reads more naturally. |
| 3 | User Control and Freedom | 2 | Tab away from open popover doesn't close it. No explicit deselect path — only Backspace-in-empty-input (undiscoverable). |
| 4 | Consistency and Standards | 3 | Tokens used correctly. Fused input group follows established web pattern. |
| 5 | Error Prevention | 3 | Live validation after blur, country-code caution, and auto-parsing "+NNN" numbers are proactive. Minor gap: changing country after typing a number silently replaces the dial prefix. |
| 6 | Recognition Rather Than Recall | 3 | All options searchable and visible. Preview eliminates need to mentally track what is encoded. No hint that typing +95... auto-populates the selector. |
| 7 | Flexibility and Efficiency | 3 | Two entry paths (dropdown + paste-and-parse). Full keyboard navigation inside popover. Backspace shortcut to release country. |
| 8 | Aesthetic and Minimalist Design | 3 | Clean composite layout. At fully-filled state, 5 text elements stack below the label — borderline verbose but each earns its place. |
| 9 | Error Recovery | 3 | Inline, plain-language messages. Clears on valid input. Same generic string for too-short and malformed — misses diagnostic layer. |
| 10 | Help and Documentation | 3 | Hint, preview, and error example give good inline guidance. No hint that full +NNN paste auto-parses. |
| **Total** | | **29/40** | **Good** |

## Anti-Patterns Verdict

**LLM assessment**: Not AI slop. Warm neutrals, terracotta checkmark, flag + dial code compact trigger, and two-way auto-parse are product-thinking decisions, not template assembly. No gradient text, no glassmorphism, no side-stripe borders.

**Deterministic scan**: Unavailable — bundled detector not found (exit 1).

**Visual overlays**: Not attempted.

## Overall Impression

The mechanics are excellent: ARIA combobox pattern correctly implemented, two-way auto-parse is clever, keyboard navigation inside the popover is complete. The gap is in the seams — Tab-out doesn't close the popover, and the fieldset grouping is absent. Fix those two and this is shippable.

## What's Working

1. **Two-way number parsing.** Typing or pasting +959123456789 into the number field auto-parses the dial code, loads Myanmar in the selector, and deposits the local part in the input.
2. **Full ARIA combobox keyboard navigation.** Arrow keys, Home, End, Enter, Escape are wired to the search input with correct aria-activedescendant. Scrolls active option into view.
3. **Burmese locale auto-defaulting to Myanmar.** locale === 'my' produces iso = 'MM' on mount — a small detail with real warmth.

## Priority Issues

**[P1] Popover doesn't close on Tab-out**
- What: When the popover is open and user presses Tab, focus moves to the next DOM element. The popover stays open. Light-dismiss only fires on mousedown/touchstart.
- Why it matters: Keyboard and screen reader users are stranded — popover overlaps subsequent fields. Breaks WCAG 2.1 SC 2.1.1 (keyboard).
- Fix: Add onBlur on the search input that closes when relatedTarget is outside containerRef. `if (!containerRef.current?.contains(event.relatedTarget)) close()`

**[P2] Input focus ring clipped on left edge**
- What: CountryCodeSelect trigger has focus-visible:z-10. The Input component does not — its left-side ring disappears under the trigger when the number input is focused.
- Why it matters: WCAG 2.4.11 (Focus Appearance) — indicator must be unobscured.
- Fix: Add relative z-[1] focus-within:z-10 to the Input wrapper in the fused context, or pass a className with these values from PhoneNumberField.

**[P2] Composite field lacks semantic grouping**
- What: label[htmlFor=inputId] only associates with the number input, not the CountryCodeSelect. Screen readers announce the two as unrelated controls.
- Why it matters: Users must infer the selector is part of "Phone number" from visual proximity alone. ARIA best practice for composite controls is fieldset/legend.
- Fix: Wrap the label + CountryCodeSelect + Input in a fieldset with a sr-only legend carrying the field name.

**[P3] Asymmetric popover animation**
- What: Entry fades in via starting:opacity-0 (CSS @starting-style). Exit is instant DOM removal — no fade-out.
- Why it matters: Snap close is jarring; breaks motion coherence the entry establishes.
- Fix: Keep element in DOM, toggle opacity class with 150ms duration, delay setOpen(false) to match. Wrap in motion-reduce:transition-none.

**[P3] + Code placeholder contrast**
- What: text-text-disabled (#706860) on bg-surface-inset (#E8DDD2) is ~3.4:1 — fails WCAG AA 4.5:1 for 14px normal text.
- Why it matters: The trigger is the primary CTA for country selection; low contrast makes it easy to miss.
- Fix: Use text-text-secondary (#6B6B6B) instead. This is not a disabled state — it is an empty state.

## Persona Red Flags

**Jordan (First-Timer)**: Types +959123456789 directly into the number field — works (two-way parse), but accidental success, not guided discovery. Typing 09123456789 shows caution in xs warning text below the field — easily missed on mobile. Risk: generates QR with local-only number.

**Sam (Accessibility-Dependent)**: Tab from search input while popover is open moves focus past it without closing — listbox DOM stays live and may be read by screen reader. CountryCodeSelect and phone number input are announced as two unrelated controls, not one composite field.

**Casey (Mobile User)**: Tapping search input in popover opens software keyboard, pushing viewport up and potentially scrolling popover off-screen. List items are py-2 (~32px row height) — below 44px recommended touch target.

## Minor Observations

- noResultsLabel is a bare p inside role="listbox" — not role="option", may not be announced by screen readers. Use li[role="option"][aria-disabled="true"] instead.
- aria-label on the search input duplicates the placeholder — one is redundant.
- Confirmed-selection row has no background tint at rest when popover re-opens — checkmark alone marks it, harder to spot at a glance.
- Input uses focus:ring-2 not focus-visible:ring-2 — ring shows on mouse click, inconsistent with the system's focus-visible convention on buttons and pills.

## Questions to Consider

- "What if + Code read Country instead — does the extra word add cost, or does it pay its way in clarity?"
- "Should the composite field fail validation if a number is entered but no country is selected?"
- "What does the caution look like on a 320px viewport with the software keyboard open — does it survive?"
