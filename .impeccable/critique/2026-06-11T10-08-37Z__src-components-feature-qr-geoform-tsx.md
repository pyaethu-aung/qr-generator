---
target: Geo content type
total_score: 32
p0_count: 0
p1_count: 0
p2_count: 2
timestamp: 2026-06-11T10-08-37Z
slug: src-components-feature-qr-geoform-tsx
---
## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Locating spinner + sr-only status, live preview, EC auto-set announced. No success confirmation once coords fill. |
| 2 | Match System / Real World | 3 | "Use my location" and "Opens maps at…" are plain, but "Latitude/Longitude" is the jargon the non-technical persona doesn't speak. |
| 3 | User Control and Freedom | 4 | Coordinates fully editable; geolocation optional and non-destructive; nothing traps the user. |
| 4 | Consistency and Standards | 4 | Reuses Input, Callout, the preview-line pattern, lucide icons, terracotta, EC-H behavior. Matches sibling forms. |
| 5 | Error Prevention | 3 | Range-bounded per-field validation; partial/invalid refuses to encode. Asymmetric ranges catch most swaps. No nudge for 0,0. |
| 6 | Recognition Rather Than Recall | 3 | Placeholders model the format; preview shows the payload. Manual path still needs the user to know their coordinates. |
| 7 | Flexibility and Efficiency | 3 | Two paths (one-tap GPS, manual). Decimal keyboard on mobile. No paste-a-link path (descoped). |
| 8 | Aesthetic and Minimalist Design | 4 | Clean, uncluttered, on-brand in both themes. Verified in browser. |
| 9 | Error Recovery | 3 | Geolocation + field errors specific and actionable. But the location-error Callout goes stale on manual entry. |
| 10 | Help and Documentation | 2 | If geolocation is denied, the non-technical user faces two empty number fields with no guidance on where to find coordinates. |
| **Total** | | **32/40** | **Good** |

## Anti-Patterns Verdict

LLM: Not AI slop. Faithful extension of the existing system (PhoneNumberFeedback preview line, Callout, lucide MapPin, terracotta). GPS-assist + manual fallback + live preview is a deliberate composition. No absolute-ban violations. Both themes verified on screen.

Deterministic scan: Unavailable (detect.mjs reports "bundled detector not found", exit 1). No counts to reconcile.

Visual overlays: None (overlay depends on the missing detector bundle). Manual browser inspection this session covered light, dark, mobile, and error states.

## Overall Impression

Solid, well-integrated feature. Biggest opportunity is audience fit: the product exists for non-technical users, and this is the one content type whose primary input (raw coordinates) is something that audience usually doesn't have. Geolocation covers "I'm here now"; when it fails or is declined, the feature falls back to two bare number fields with no map and no guidance. That gap plus one stale-state bug separate 32 from a high-30s score.

## What's Working

1. Non-destructive optional GPS: writes only on explicit click, never auto-fires, degrades cleanly to manual entry with an actionable Callout (H3 = 4).
2. Live preview closes the loop: "Opens maps at 37.787, -122.3997" reuses the phone confirmation pattern; the user sees the payload before downloading.
3. Invisible system integration: EC forced Highest like other printed modes, preview/Callout patterns, MapPin pill, decimal inputMode (H4 = 4).

## Priority Issues

[P2] Stale location-error Callout when the user switches to manual entry
- What: After denied/failed geolocation, the error clears only on the next "Use my location" click. Typing coordinates manually leaves the error banner pinned above a valid, generating QR.
- Why: Contradictory UI ("couldn't get your location" over a working location) reads as broken at the worst moment (peak-end after failure).
- Fix: Clear locationError when either coordinate field changes, or give the Callout an onDismiss. Clearing on edit is better.
- Command: /impeccable harden

[P2] No path forward for the non-technical user who can't use geolocation
- What: The primary persona doesn't know coordinates. Deny the prompt or fail indoors and they face two empty Latitude/Longitude fields with no way to proceed.
- Why: Core audience hits a wall on the feature meant to serve them. The descoped map-link parser was the thing that turned "a place I have" into coordinates; nothing replaced its job.
- Fix: One-line helper under the fields ("In Google Maps, right-click your spot and copy the coordinates"), or revisit the paste-a-link path.
- Command: /impeccable clarify or /impeccable onboard

[P3] "Use my location" success is silent
- What: On success the spinner stops and fields populate, but nothing confirms it; a screen-reader user gets no announcement.
- Why: A brief "Location found" closes the loop and serves AT users. role=status currently announces only the in-flight state.
- Fix: Set the status region to a transient "Location found" on success.
- Command: /impeccable harden

[P3] Valid-but-meaningless coordinates pass without a nudge
- What: 0,0 (Null Island) or a single fat-fingered field encodes a valid geo URI pointing somewhere unintended.
- Why: Low frequency, but a silent wrong-location QR is discovered only after printing.
- Fix: Optional soft caution for 0,0. Don't over-engineer.
- Command: /impeccable harden

## Persona Red Flags

Jordan (First-Timer) / restaurant owner: Denies the permission prompt by reflex, then stares at "Latitude/Longitude" with no idea what to type or where to find it. No map, no example beyond a placeholder, no how-to. Highest abandonment risk, and it's the headline audience.

Sam (Accessibility-Dependent): Mostly well-served (labeled required fields, role=status for locating, Callout role=alert, decimal inputMode). Gap: geolocation success updates fields silently, so a non-sighted user hears "finding…" then nothing.

Casey (Mobile User): Best-served persona. decimal inputMode raises the right keyboard, the pair holds at 390px, "Use my location" maps to device GPS. No red flags.

## Minor Observations

- "Use my location" uses rounded-lg while export buttons use rounded-xl. Defensible inline-helper distinction, but make it deliberate.
- Preview canonicalizes latitude ("37.7870" -> "37.787"), so it won't byte-match the typed precision. Harmless.
- enableHighAccuracy: true with a 10s timeout can be slow and battery-hungry indoors; acceptable for a one-shot.
- On the denied-permission empty state, the only remaining text is the hint "Scan to open this spot in a map app", which explains the outcome, not the input. That's the H10 gap.

## Questions to Consider

- "The product is built for people who don't know their coordinates. Is two number fields plus optional GPS enough, or does the descoped map-link paste path need to come back?"
- "What does a confident empty state look like, the one a first-timer sees after denying the location prompt?"
