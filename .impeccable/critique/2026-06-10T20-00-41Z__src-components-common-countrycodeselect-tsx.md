---
target: Country code selector
total_score: 30
p0_count: 0
p1_count: 0
p2_count: 0
timestamp: 2026-06-10T20-00-41Z
slug: src-components-common-countrycodeselect-tsx
---
## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Focus ring fully visible; preview, errors, caution all solid. Search input still uses focus: not focus-visible:. |
| 2 | Match System / Real World | 3 | "Country" reads naturally. Auto-parse behavior remains undiscoverable. |
| 3 | User Control and Freedom | 3 | Tab-out now closes the popover. Backspace-to-clear-country undiscoverable but not a blocker. |
| 4 | Consistency and Standards | 3 | role=group and focus-visible: on Input align with standards. Search input inside popover still uses focus:. |
| 5 | Error Prevention | 3 | No change. |
| 6 | Recognition Rather Than Recall | 3 | No change. Auto-parse on paste remains hidden. |
| 7 | Flexibility and Efficiency | 3 | No change. |
| 8 | Aesthetic and Minimalist Design | 3 | Exit animation and confirmed-selection background are genuine polish. Entry/exit now symmetric. |
| 9 | Error Recovery | 3 | No change. |
| 10 | Help and Documentation | 3 | aria-live="polite" on listbox means AT users hear "No countries match" as filter updates. |
| **Total** | | **30/40** | **Good** |

## Anti-Patterns Verdict

Not AI slop. The onSearchBlur relatedTarget check, visible/open dual-state animation, and focus-within:z-10 stacking wrapper are deliberate and precise. CLI detector unavailable; no browser visualization.

## Overall Impression

Shippable. Every P0, P1, P2 from run 1 is resolved. Remaining findings are all P3: focus: remnants not swept with the Input change, and touch-target size in the option list.

## What's Working

1. Tab-out close: onSearchBlur relatedTarget check correctly handles Escape (refocuses trigger, inside containerRef, no spurious close), Tab (closes cleanly). Edge case handling complete.
2. Symmetric animation: Entry and exit both fade at 150ms. visible/open two-state pattern avoids keyboard-reachable hidden content without needing inert. clearTimeout on rapid reopen handled.
3. Semantic composite field: role="group" + aria-labelledby means screen readers announce "Phone number group" before enumerating controls. Label still has htmlFor for click-to-focus.

## Priority Issues

**[P3] Search input uses focus: while Input component was updated to focus-visible:**
- What: CountryCodeSelect.tsx line 210 — search input className includes focus:border-focus-ring focus:ring-2 focus:ring-focus-ring. Not updated in this pass.
- Why it matters: Mouse-click focus on search shows ring; keyboard focus on number inputs doesn't. Inconsistency within the same feature.
- Fix: Replace focus: ring/border classes with focus-visible: equivalents on the search input.

**[P3] Error-state className in PhoneNumberField re-introduces focus: for ring**
- What: className passed to Input in error state includes focus:border-error focus:ring-error. These override Input's focus-visible: via twMerge.
- Why it matters: Inconsistent ring behavior depending on error state. Contradicts the Input fix from this pass.
- Fix: Change to focus-visible:border-error focus-visible:ring-error in PhoneNumberField className strings.

**[P3] Option row touch targets are ~32px on mobile**
- What: List items have py-2 (32px total). WCAG 2.5.5 and platform guidelines recommend 44px minimum.
- Why it matters: On mobile with keyboard open, mis-taps on adjacent rows likely.
- Fix: Change py-2 to py-2.5 or py-3 on option rows.

**[P3] aria-expanded hardcoded as string "true" on search input**
- What: aria-expanded="true" is a static string, never reflects false.
- Why it matters: Screen reader may cache as always-expanded. Minor semantic gap.
- Fix: Change to aria-expanded={open}.

## Persona Red Flags

**Sam (Accessibility-Dependent)**: Substantially improved. Tab-out works. Composite announced as group. Empty search state spoken via aria-live. Remaining: search input focus: ring on mouse click (visual-only annoyance, not AT blocker); hardcoded aria-expanded="true".

**Jordan (First-Timer)**: No meaningful change. "Country" is clearer. Country-code caution still appears late. Risk of local-only QR code remains for users who type 09... format.

**Casey (Mobile User)**: Option rows still ~32px. One remaining mobile-specific fix: bump to py-2.5 or py-3.

## Minor Observations

- PhoneNumberField passes focus:border-error focus:ring-error in className, overriding Input's focus-visible: fix. The Input.tsx fix is correct but incomplete without updating callers.
- triggerPlaceholder JSDoc comment in the interface still says e.g. "+ Code" — stale documentation reference.
- aria-label and placeholder on search input both equal searchPlaceholder but serve distinct purposes (accessible name vs. visual hint) — not actually redundant, previous note dismissed.

## Questions to Consider

- "The py-2 option rows trade density for touch comfort — is compactness the right call for a list used one-handed on mobile?"
- "The auto-parse behavior is powerful but invisible. Would a one-line hint under the selector earn its place, or add noise?"
