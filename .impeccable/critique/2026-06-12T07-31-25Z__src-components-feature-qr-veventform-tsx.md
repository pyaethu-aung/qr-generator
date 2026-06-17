---
target: Calendar/vEvent content type
total_score: 29
p0_count: 0
p1_count: 2
timestamp: 2026-06-12T07-31-25Z
slug: src-components-feature-qr-veventform-tsx
---
# Critique: Calendar/vEvent content type

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Empty required fields leave a dashed placeholder preview with zero explanation of why |
| 2 | Match System / Real World | 4 | Google-Calendar vocabulary, native pickers, inclusive end date silently converted to RFC-exclusive DTEND in the user's favor |
| 3 | User Control and Freedom | 2 | All-day round trip silently destroys chosen times (18:00/21:00 became 09:00/10:00); no undo, no persistence on refresh |
| 4 | Consistency and Standards | 3 | Two collapsible idioms coexist: Description (15px terracotta chevron) vs Appearance/Frame/Logo (12px secondary chevrons) |
| 5 | Error Prevention | 3 | Layered min/inline-error/EC-forcing is strong; nothing prevents the all-day time wipe |
| 6 | Recognition Rather Than Recall | 3 | Collapsed "Description" row reads like an app-settings section, not an event field |
| 7 | Flexibility and Efficiency | 2 | Live regeneration is good; no draft persistence across refresh, single rigid path |
| 8 | Aesthetic and Minimalist Design | 3 | Form is lean; 8-pill mode bar is the heaviest element and terracotta exceeds the documented three-element economy |
| 9 | Error Recovery | 3 | End-before-start error is plain and work-preserving; payload warning misattributes its cause; empty-required has no message |
| 10 | Help and Documentation | 3 | Mode hint and tooltips exist; floating local-time encoding is explained nowhere |
| **Total** | | **29/40** | **Good** |

## Anti-Patterns Verdict

**LLM assessment: PASS.** No side-stripe borders, gradient text, glassmorphism, hero-metric template, card grids, or modal reflex. Committed warm sand/terracotta palette rather than a category-reflex blue; native OS pickers chosen deliberately; placeholders are concrete and human. Mild residual tells: an em dash in adjacent-mode copy (`vcardCorrectionHint`, en.json line 112, outside the vevent strings), and the 8-pill lucide icon bar is a recognizably stock treatment.

**Deterministic scan: unavailable.** `detect.mjs` ran and exited 1 with "bundled detector not found"; the engine files (`detect-antipatterns.mjs`, `detect-antipatterns-browser.js`) are absent from the skill bundle. The in-page overlay variant failed the same way (live-server returned 404 for detect.js after mutation preflight succeeded). The anti-pattern verdict therefore rests on the design review alone; no overlay is visible in any browser tab.

## Overall Impression

The form itself is quiet, competent craft: lean fields, native pickers, real translations, and invisible RFC work that serves the printed result. What drags it down is state behavior, not appearance: a destructive all-day toggle, a mute empty state, and a warning whose copy blames the wrong field. The single biggest opportunity is making the form's behavior as trustworthy as its payload encoding.

## What's Working

1. **Native pickers as a documented design position**: the OS date wheel beats any custom calendar for this audience, and the all-day switch swaps input types while preserving the chosen day.
2. **Invisible RFC craft**: inclusive "Ends" emitted as exclusive next-day DTEND, full VCALENDAR envelope for iOS, PRODID/UID/folding dropped to keep the matrix sparse and scannable.
3. **Cross-mode coherence**: Description mirrors EmailForm's collapsible block with the same 300-char threshold and Callout; Burmese strings are real translations with locale-appropriate placeholders.

## Priority Issues

- **[P1] All-day round trip wipes times** (`useVEventConfig.setAllDay`): toggling all-day on then off replaces chosen times with 09:00/10:00 defaults. Silent data change to the product's highest-stakes output; a printed poster could carry the wrong time. Fix: stash the times when toggling on, restore them when toggling off, default only when none existed. Verified live in the browser.
- **[P1] No guidance when required fields are missing**: title-only or start-only states leave a dashed placeholder preview, dimmed controls, and disabled downloads with no words. First-timers stall. Fix: state-aware preview copy in vevent mode ("Add a start time to finish your event code") or a quiet inline prompt.
- **[P2] Payload warning misattributes cause**: `isPayloadLong` measures the whole payload (title + location + ~60 chars of envelope) but the copy blames "a long description", even when Description is empty. Following the advice may not clear the warning. Fix: field-neutral copy in en.json and my.json.
- **[P2] Two collapsible idioms in one column**: Description (event data, terracotta 15px chevron) vs Appearance/Frame/Logo (settings, secondary 12px chevrons) blurs the data/settings boundary and pushes terracotta past the three-element economy. Fix: secondary-colored chevron for field-level disclosure, optionally an "(optional)" suffix.
- **[P3] Floating time is invisible**: no TZID by design, but nothing tells the creator that scanners get wall-clock local time. Myanmar (UTC+6:30) and Vietnam (UTC+7) are 30 minutes apart. Fix: a caption or mode-hint sentence; also downgrade the payload Callout to `role="status"`.

## Persona Red Flags

**Jordan (confused first-timer)**: fills "Event title", preview stays a dashed placeholder with no explanation (Starts still empty); the "Description" toggle row is structurally identical to "Appearance"/"Frame"/"Logo" below it so it never reads as an event field; mode hint "Scan to add this event to the calendar." is written from the scanner's perspective, not the creator's.

**Casey (distracted mobile user)**: at 375px the preview and download/share buttons sit above the form, so the QR updates out of view while editing; a refresh loses the whole draft. Positive: native pickers and 44px hit areas are right for one-thumb entry.

**Riley (deliberate stress tester)**: the all-day time wipe reads as data corruption; long title + location with Description collapsed still triggers the "long description" warning (copy contradicts observable state); the Callout mounts/unmounts per keystroke at the 300-char boundary. Good marks: emoji and `;,\` escape correctly, end-before-start honestly removes the QR, impossible dates are rejected.

## Minor Observations

- DESIGN.md still documents "Content Mode (4 pills)"; the build has 8. Stale system doc.
- In Burmese locale, "Appearance" and "Logo" section toggles render in English beside the fully translated vevent form; LanguageToggle exists but is not rendered in the Navbar, so Burmese is reachable only via persisted localStorage.
- EN `veventCorrectionHint` is an imperative ("Set to Highest…") while the MY version is a statement; the MY phrasing matches the auto-set behavior better.
- `min={config.start}` on Ends is picker-level only; typed violations are correctly caught by the layered inline error.

## Questions to Consider

1. The org ships to two countries 30 minutes apart, yet the event QR encodes timezone-less floating time with no way to say otherwise. Is "what an invitation poster expects" still true for the cross-border case?
2. At 8 equal pills, is the content-mode bar still a segmented control, or has it become navigation that wants grouping?
3. "Ends" left empty produces a valid zero-duration event, but the user is never told what scanning will create. Should the preview state what the calendar entry will actually contain?
