# Project Review: QR Generator

**Method:** dual-agent critique (Assessment A design review and Assessment B detector/browser evidence ran as isolated parallel sub-agents), plus an independent technical audit sub-agent and a parent verification pass.
**Date:** 2026-09-05
**Version reviewed:** 0.18.0, branch `main`, commit `5970675`
**Scope:** whole project, all three views (Generate, Batch, Scan), light and dark, 320/390/768/1440 px.
**Surface mode:** Operate (the visitor completes a task and leaves with a file), with a light Persuade top-of-page.

**Scores:** Design Health **27/40** (Good, upper-middle band). Audit Health **12/20** (Acceptable, significant work needed).

---

## Executive summary

This is a carefully built product with an unusually strong engineering core and a design system that has quietly drifted away from what actually ships.

The engineering is genuinely good: zero console errors anywhere, zero horizontal overflow at any width, flawless ARIA and form labelling, correct opt-in reduced-motion handling, near-perfect design-token discipline in components, and correct code-splitting for the three heaviest optional dependencies. `npm run lint` and `npm run build` both pass clean. i18n is at full parity: 365 keys in both `en.json` and `es.json`, zero missing, zero extra.

Three things undercut it:

1. **The committed design system is substantially not shipped.** Inter is never loaded (only Geist Mono is fetched), Playfair Display is absent, the brand mark is a system emoji, the documented `card-ambient` shadow is `shadow-lg`, and the documented primary button does not exist on the flagship view. `DESIGN.md` reads as aspiration recorded as fact.
2. **Two design tokens cause roughly 20 distinct WCAG AA contrast failures.** Every placeholder in the product is below threshold in both themes; in dark mode they measure 1.88:1. Every border token fails non-text contrast against every surface in both themes.
3. **825 lines across 7 modules are dead code**, including a hi-res export feature that `CLAUDE.md` and `DESIGN.md` both document as shipped and no user can reach.

No P0 defect blocks task completion on desktop. One P0 exists on mobile, where the Generate view puts an empty preview and four disabled buttons ahead of the only input.

---

# Part 1: Design Critique

## Design Health Score

| # | Heuristic | Score | Key issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | The 40%-dimmed settings block reads as unavailable but is fully clickable and tab-focusable; disabled Download buttons never say why |
| 2 | Match System / Real World | 3 | "Scan Reliability, Low (7%) to Highest (30%)" is an excellent de-jargoning of error correction, but "Foreground Fill / Solid / Linear / Radial / Direction" is designer vocabulary in a non-designer tool |
| 3 | User Control and Freedom | 2 | No undo anywhere; "clear all history" fires with no confirm while deleting a *single* preset does confirm, an inverted safety gradient |
| 4 | Consistency and Standards | 2 | Four buttons in one row, all disabled, render two different disabled languages (measured: `#FAF6F1`/`#1A1A1A` vs `#E8DDD2`/`#706860`) |
| 5 | Error Prevention | 3 | Capacity guard, WEP warning, contrast-ratio warning, phone validation, batch truncation callout are all genuinely strong; undercut by five safety messages hardcoded in English |
| 6 | Recognition Rather Than Recall | 2 | 22 style swatches at 18px monochrome on same-value fills; at least four Pixel Patterns and six Corner Frames are mutually indistinguishable |
| 7 | Flexibility and Efficiency | 3 | Real power (presets, history, share-by-URL, CSV mapping) but 9 tab stops to reach the URL field and no roving tabindex |
| 8 | Aesthetic and Minimalist Design | 3 | Calm and restrained, but 69 interactive controls on the Generate view and a 536px preview well holding a 332px artifact (38% fill) |
| 9 | Error Recovery | 3 | Error copy is unusually good, but every scanner error including hard failures renders as `role="status"` in amber warning chrome |
| 10 | Help and Documentation | 3 | Two tooltips and good inline hints, but the CSV mapping feature ships with only chrome labels and nothing explains the three top-level tabs |
| **Total** | | **27/40** | **Good (upper-middle band)** |

No heuristic scored `n/a`.

## Design Specificity Verdict

**Authored at the palette layer. Category-interchangeable at the identity and output layers. Roughly 60% of "The Potter's Atelier" is actually shipped.**

### What is genuinely authored

The warm sand ground (`#F3EBE2`), the single terracotta accent, the full-radius pill vocabulary for every segmented control, and the 10px/0.3em and 11px/0.15em uppercase eyebrows over 24px bold titles. There is no blue primary, no card grid, no cool gray. The anti-references in `PRODUCT.md` have been genuinely avoided at the chrome level.

### Five drifts back toward generic

1. **The brand mark is a system emoji.** `src/components/Navigation/Navbar.tsx:13` renders `<span className="text-xl sm:text-2xl">🔳</span>`. `DESIGN.md` specifies a "Sparkle glyph (22px)". What ships is Unicode U+1F533, which macOS draws as a plain black square (visible top-left in all 28 screenshots). The one place the product signs its name is a platform default that changes appearance per OS, sits outside the warm palette, and has no `aria-hidden`, so screen readers announce "white square button" as the start of the page's primary heading.

2. **Neither heading typeface is loaded.** `index.html:8` fetches only Geist Mono. `src/App.css:2` names `'Inter','Segoe UI',system-ui,sans-serif` on `#root` but Inter is never downloaded. Browser-verified: `document.fonts` contains only Geist Mono; computed `body` font-family resolves to the Tailwind default stack, so headings and body use *different* stacks and the rendered face is whatever the OS provides (SF Pro on macOS, Segoe UI on Windows). Playfair Display is absent, which `DESIGN.md:164` admits, but the consequence is unacknowledged: the "editorial typography, quiet authority of a well-labeled workshop drawer" claim rests entirely on two eyebrow tracking values. There is also no `--font-*` token anywhere in `src/index.css`: typography is the single part of the system with no tokens at all.

3. **The atelier never reaches the artifact.** `PRODUCT.md` says "The result is the product" and sets the emotional goal at "this actually looks good". The shipped default output is pure `#000000` on `#FFFFFF`, square modules, square corner frames. A user who touches nothing, which is the primary persona by definition, leaves with a code indistinguishable from any free generator's. The warmth is entirely in the chrome the user throws away.

4. **The anti-reference colour is a shipped default.** `src/components/feature/qr/QRControls.tsx:22`: `const DEFAULT_GRADIENT_END = '#4F46E5'`, Tailwind `indigo-600`. `DESIGN.md` says "Don't use blue, purple, or cool-gray." The one feature explicitly about expressing taste seeds itself with the exact colour the system forbids.

5. **Documented components were replaced by stock Tailwind.** `QRGenerator.tsx:310` uses `rounded-xl border border-border-strong bg-surface-overlay p-8 shadow-lg`, not the documented two-layer `card-ambient`. Because `--color-surface-overlay` is `rgba(243,235,226,0.7)` over an identical `--color-surface`, the main card reads as a hairline rectangle rather than a raised object.

### Named-rule violations

- **The Terracotta Economy** caps the accent at three elements per view. Live DOM count at rest on the default Generate view is **4** (Generate tab pill, "QUICK & EASY" eyebrow, "Link / Text" pill, "Medium (15%)" pill). In Wi-Fi mode it is **5**. With Appearance, Frame and Logo expanded it is **10**, and three of those express selection as a 2px terracotta *border* rather than a fill, a second selection language competing with the pills directly above them.
- **The backdrop-blur ban.** `src/components/Navigation/Navbar.tsx:9` carries `backdrop-blur-sm` on a resting, non-scrolling header. `DESIGN.md` names the batch drop overlay as "the one sanctioned use" and says "never use blur for resting atmosphere". Nothing scrolls beneath the navbar, so it costs a compositing layer for zero visual benefit. `grep -rn backdrop-blur src/` returns exactly two hits: this one and the sanctioned overlay.
- **The Warm Neutral Rule** calls tinting "non-negotiable", but `--color-text-primary: #1A1A1A` and `--color-text-secondary: #6B6B6B` are literally pure achromatic gray (OKLCH chroma 0.00). Six more tokens sit at hue 70 to 74, just outside the documented 48 to 68 band.

### Deterministic scan

`impeccable detect --json src` exited 2 with **14 findings** across 216 files. Verified in context: **1 real, 13 false positives.**

| Rule | Count | Verdict |
|---|---|---|
| `design-system-font-size` | 10 | 1 real (`Tooltip.tsx:24` uses `text-[9px]`, which is on no step of the documented 10/11/13/14/16/18/20/24/36 ramp). The other 9 are `text-[11px]` matching the documented "Caption, Panel" step |
| `broken-image` | 2 | Both false positives: the literal text `<img>` inside Vitest test titles in `useQrScanner.test.ts:202,227` |
| `overused-font` | 1 | False positive: `App.css:2` declares Inter, which `DESIGN.md` itself specifies |
| `design-system-color` | 1 | False positive: `#123456` is a round-trip test fixture in `persistedDesign.test.ts:78` |

**The detector missed the most consequential violation in the codebase**, the resting `backdrop-blur-sm` on the navbar, which is a direct contradiction of an explicit named rule in `DESIGN.md`. A 1-in-14 true-positive rate on this codebase means the deterministic scan is currently near-useless here and should not be treated as a gate.

### Visual overlays

**Not available.** The live-server plus `detect.js` injection flow was not run; Assessment B used isolated headless Playwright instances for DOM and contrast probing instead, because three agents were working concurrently and a shared browser session would have collided. No user-visible overlay exists in any browser tab. The fallback signal is the measured DOM evidence recorded throughout this document.

## Overall Impression

The tool works, and it works well. Someone who arrives with a URL on a desktop gets a QR code in a few seconds with a live preview, and the interaction is calm and unhurried in a way most free generators are not. The Scan Reliability control alone shows more design thought than most of this category.

What does not work is the gap between the document and the build. `DESIGN.md` describes a warm editorial artisan tool with Playfair headings, a sparkle mark, an ambient two-layer card shadow, a terracotta primary CTA, and a strict three-element accent budget. The build has none of those five. It has a warm palette and pills, which is real but is the easy half.

**The single biggest opportunity:** the QR code itself. The product's own first design principle is "The result is the product", and the result is the one surface the design system never touched. Defaulting the output to warm ink on warm paper (`#1A1612` on `#FAF6F1`, still far above the 4:1 scanner threshold) would mean every user who touches nothing still walks away with something recognisably from this tool. That is one constant change with more identity impact than any amount of chrome polish.

## What's Working

**1. Scan Reliability is a genuine act of translation, not a rename.** Error-correction levels become "Low (7%) / Medium (15%) / High (25%) / Highest (30%)" with "Higher = survives damage and supports logos", a tooltip explaining the density tradeoff, per-mode contextual hints ("Contact QR codes are data-dense, so Highest reliability is recommended"), an auto-set to Highest on entering data-dense modes, and a warning that flips the active pill from terracotta to amber when the user goes below the recommendation. Colour, copy, and default all agree. This is exactly what `PRODUCT.md` asks for: "Options are present but never intimidating."

**2. Error and warning copy is consistently excellent.** "Enter a phone number using digits, e.g. +95 9 123 456 789." "That image is too large. Choose a file under 25 MB." "Camera access was blocked. Allow it in your browser settings, or upload an image instead." "2.1:1, low contrast may prevent scanners from reading the QR code. Try darkening your foreground or lightening your background." Every one names the problem in plain language and gives the next action. No error codes, no "something went wrong".

**3. Progressive disclosure with a customisation tell.** Appearance / Frame / Logo collapse by default, persist their open state, and each header carries a 1.5px terracotta dot when its contents differ from defaults (`QRControls.tsx:963`). The novice never sees 31 style options; the returning user can tell at a glance which drawer they have been in without opening anything. That dot is the most "Potter's Atelier" detail in the build.

## Cognitive Load

**5 of 8 checklist items fail: CRITICAL.**

| Item | Verdict | Evidence |
|---|---|---|
| Single focus | FAIL | Two co-equal 24px bold headings ("Settings", "Preview"). On mobile the user meets an empty 220px dashed box plus four dead buttons before ever seeing the input, roughly 930 CSS px of scroll to the first field |
| Chunking (<=4 per group) | FAIL | Content type 9, Corner Frame 8, Pixel Pattern 8, Frame Style 9, Corner Dot 6, gradient direction 8 |
| Grouping | PASS | CONFIGURATION / LIVE PREVIEW eyebrows, dividers, three named disclosures |
| Visual hierarchy | FAIL | Main card is 70% alpha of the identical page colour so it barely separates from the ground, and the Generate view has no primary action at all |
| One thing at a time | PASS | Content mode swaps the whole form; Appearance/Frame/Logo collapsed by default |
| Minimal choices (<=4 visible) | FAIL | Five decision points exceed four. With Appearance and Frame open, the left column presents 31 mutually exclusive style options simultaneously |
| Working memory | FAIL | On mobile the preview is off-screen above while the user edits colours below. Compounded by the orphan `0 / 1273` counter in non-text modes, a bare number with no visible referent |
| Progressive disclosure | PASS | Best-judged thing in the interface |

## Emotional Journey

**Peak:** the moment the QR appears. `qr-enter` at 220ms on a proper `cubic-bezier(0.22, 1, 0.36, 1)`, `qr-update` cross-fade on every change, both behind `prefers-reduced-motion`. A live preview with no Generate button is the right call for an Operate surface. This is the app's best moment.

**Valley 1, the first eight seconds.** On desktop the eye lands on a large empty oatmeal well with a dashed box labelled "QR preview" and three dead buttons, occupying the entire right half. On mobile that dead half comes *first*. The interface opens by showing the user nothing, in the largest area on screen. `hero.subtitle` ("Paste your link, make it yours, download in seconds.") is written, translated into Spanish, and never rendered; Batch and Scan both show their subtitles, the flagship view does not.

**Valley 2, filling in a non-text mode.** Everything below the form drops to 40% opacity: the Scan Reliability label, all four pills, the recommendation line, and the Appearance / Frame / Logo headings. Measured contrast on those live, operable controls: label 2.45:1, helper text 1.67:1, white on the dimmed active pill 1.89:1. The page looks half-broken mid-task, and the dimming gates nothing: clicking a dimmed pill flips `aria-pressed` to `true`.

**Valley 3, the ending.** For a product whose stated purpose is "the user walks away with a QR code they're proud to use", the download confirmation is a 15px terracotta check and a 14px grey "Downloaded", smaller than the tooltip trigger beside it.

**Reassurance at high-stakes moments.** Download: no size stated, no format guidance, four equal buttons and silence. Batch generate: strongest in the app, with a real `role="progressbar"`, a truncation callout and a typed error callout, and the only correct primary CTA in the product. Camera permission: weakest. "Start camera" is a plain secondary button that triggers the OS prompt with zero local reassurance; the one sentence that would defuse it ("Runs entirely in your browser") is stranded in the navbar subtitle at the top of the page.

## Priority Issues

### [P0] Mobile puts an empty preview and four dead buttons ahead of the input

**Where:** `QRGenerator.tsx:314` and `:481` set `order-2 md:order-1` on the controls column and `order-1 md:order-2` on the preview.
**What:** On a 390px viewport the first screen is the "Preview" heading, a 220px empty dashed box, and Download PNG / Download SVG / Share QR code / Copy link, all disabled, before the "Link / Text" field appears roughly 930px down.
**Why it matters:** The primary persona is non-technical, needs a QR in under a minute, and arrives with a URL. Mobile is where a small-business owner does this. The app opens by showing them nothing to do and four things they cannot do. It reads as broken before the first interaction.
**Fix:** Invert on mobile only. Put the content-type pills and the input first, keep a compact preview sticky beneath them, and render the action row only once `canDownload` is true.
**Suggested command:** `/impeccable adapt`

### [P1] The Generate view has no primary action, and the design system's primary button exists only elsewhere

**Where:** `QRGenerator.tsx:507-552` renders four identically-styled `rounded-xl border bg-surface-raised` buttons. The documented primary (terracotta fill, pill, 48px, full width) ships in `BatchGenerator.tsx:579` and `QRScanner.tsx:157` but not here. `controls.generate` ("Generate QR Code") survives as a dead key in `en.json`, `es.json` and `types/i18n.ts:449`.
**Why it matters:** At the exact moment the user has succeeded, the interface offers four equal options and no recommendation. PNG is right for roughly 95% of this audience and nothing says so.
**Fix:** Promote Download PNG to the documented primary directly under the preview and demote SVG / Share / Copy link to a secondary row. State the output size on the primary ("Download PNG, 1024 x 1024").
**Suggested command:** `/impeccable layout`

### [P1] The 40% dim reads as disabled, is not disabled, and fails contrast on live controls

**Where:** `QRControls.tsx:919` wraps everything from Scan Reliability down in `opacity-40` whenever content is empty.
**What:** Live probe returns `opacity: 0.4`, `pointer-events: auto`, `tabIndex: 0`, `disabled: false`, no `inert`, no `aria-hidden`. Clicking a dimmed pill changes `aria-pressed`. The state produces 32 text nodes between 1.62:1 and 2.48:1.
**Why it matters:** It teaches a false rule (these are locked), then silently breaks it. Low-vision users cannot read the recommendation text at all, and it is the text that keeps their printed code scannable.
**Fix:** Pick one. Either genuinely gate it (`inert` plus `aria-hidden`, drop to `opacity-60`, add "Add a link to customize"), or drop the dim entirely. Do not ship a decorative disabled look over operable controls.
**Suggested command:** `/impeccable harden`

### [P1] Style swatches are unrecognisable, forcing click-and-check across 31 options

**Where:** `QRControls.tsx:983-1045` renders Corner Frame (8), Corner Dot (6) and Pixel Pattern (8) as 18px monochrome `currentColor` paths in `text-text-secondary` on `bg-surface-inset`.
**What:** Six of eight Corner Frame glyphs read as "a square with a hole"; four of eight Pixel Patterns read as "a grey dot grid". The only labels are `title`/`aria-label`, so touch users get nothing.
**Why it matters:** `PRODUCT.md` names designers and small-business owners wanting visual control as the secondary audience. They cannot exercise it by recognition, only by clicking all 22 in turn.
**Fix:** Render each swatch in the user's actual current foreground colour at 24px so it previews the real result, and add visible text labels exactly as the Frame Style grid three sections down already does.
**Suggested command:** `/impeccable clarify`

### [P2] Two disabled languages in one button row, and no reason given for either

**Where:** `QRGenerator.tsx:526-541` gives Share a bespoke `bg-surface-inset text-text-disabled` branch the others do not have.
**What:** Measured live: Download PNG / SVG / Copy link render `#FAF6F1` background with `#1A1A1A` text at `opacity 0.5`; Share renders `#E8DDD2` with `#706860`. Four buttons, same state, side by side, two visual vocabularies, none explaining itself.
**Fix:** Normalise on one disabled treatment via a shared class and add "Add a link to enable downloads" under the row. The `placeholderHint` machinery in `QRPreview.tsx:186` already exists to carry mode-specific reasons.
**Suggested command:** `/impeccable polish`

### [P2] Five safety messages are hardcoded in English and never translate

**Where:** `QRControls.tsx:1046` ("Merges touching modules into flowing shapes."), `:1051-1052` (`title="Readability Risk"` plus body), `:1481` (`title={isLowContrast ? 'Contrast Risk' : 'Inverted Colors'}`), `:1483` (`dismissLabel`), `:1485-1487` (both contrast-warning bodies). Also `App.tsx:38` ("Skip to main content"), `useQRGenerator.ts:17` ("Input too long (max N characters)"), `Button.tsx:57` ("Loading..."), `WiFiForm.tsx:62` (`title="required"`).
**Why it matters:** Every one of the `QRControls` strings is a *safety* message about whether the user's code will actually scan. A Spanish-locale user gets the whole app translated and these specific warnings in English. "Modules" is also QR jargon in a tool whose third design principle is "Non-technical by default".
**Fix:** Add `controls.readabilityRiskTitle`, `controls.readabilityRiskBody`, `controls.contrastRiskTitle`, `controls.invertedColorsTitle`, `controls.contrastDismissLabel`, `controls.contrastLowBody`, `controls.contrastInvertedBody`, `controls.patternFluidHint`, `controls.inputTooLong` (with a `{max}` placeholder) and `layout.skipToContent` to both locale files.
**Suggested command:** `/impeccable harden`

### [P3] Dead code and dead copy contradict the shipped product

**Where:** See the audit's P2-1 below. Six translated i18n keys are also never rendered: `hero.subtitle`, `config.helper`, `controls.contentLabel`, `controls.contentPlaceholder`, `controls.generate`, `controls.downloadsTitle`.
**Why it matters:** `hero.subtitle` is "Paste your link, make it yours, download in seconds." That is the single best orienting line in the product, written, translated, and not on screen, on the one view that has no subtitle.
**Fix:** Render `hero.subtitle` under the Generate headline to match Batch and Scan. Then resolve the export-modal cluster and correct the stale `CLAUDE.md` paragraphs.
**Suggested command:** `/impeccable distill`

## Persona Red Flags

### Alex, impatient power user

- **9 tab stops before the input.** Skip link, language, theme, Generate, Batch, Scan, then all nine content pills, *then* "Enter URL or text". `PillGroup.tsx:60-80` renders every option as an independent tab stop with `aria-pressed`, no roving tabindex, no arrow-key handling. For a mutually exclusive set this is both the wrong ARIA pattern and nine wasted keystrokes per visit.
- **No keyboard shortcut for the thing he came for.** No Cmd+Enter to download, no `/` to focus the input.
- **Export is locked at 1024px** (`defaults.ts:10`) with the size picker built and disconnected. He wants 2048 for print and cannot get it.
- **No undo, and "clear all history" has no confirm.** `QRHistory.tsx:35` fires `onClear` directly from a 14px trash icon, erasing every saved code permanently, while deleting a single *preset* does ask.
- **`PillGroup.tsx:65` calls `scrollIntoView` on every pill click**, nudging the viewport under his cursor during rapid style comparison.

### Jordan, confused first-timer

- **Opens on a page whose largest element is empty.** The right half is a 536px oatmeal well containing a dashed square that says "QR preview". Nothing indicates that typing in the left field is what fills it, because `hero.subtitle` is not rendered.
- **Nine content-type pills before a single field**, all at equal visual weight; he must work out that the already-selected first one is his.
- **The half-dimmed page** reads as "loading" or "I broke something". He can still click the dimmed controls, which makes it worse.
- **`0 / 1273` with no label** appears mid-form in Contact and Wi-Fi modes. He has no idea what is counted or whether 1273 is good.
- **Four equal buttons at the finish.** He does not know what SVG is and nothing tells him PNG is the safe answer.

### Mya, runs a 12-table teashop in Yangon, making a menu QR for table tents

- **The Burmese locale does not exist.** `PRODUCT.md` states "The Burmese localization (`my.json`) signals an intentional audience beyond English-speaking markets." `src/data/i18n/` contains only `en.json` and `es.json`; `index.ts` registers exactly two locales. The stated audience signal is not shipped.
- **Her whole task is on mobile**, where the input is a screen and a half down (see P0).
- **Nothing tells her the code must survive printing.** She is making table tents. Link/Text defaults to Medium (15%), and the only hint is displayed at 40% opacity (1.67:1) until she has typed. The line that would help her, "Printed codes scan best at Highest reliability", exists in `en.json` but only fires in Wi-Fi mode.
- **The output is not something she is proud to use.** Pure black on white, square modules, no frame, no caption. Everything that would make it look considered is behind a collapsed drawer whose options she cannot tell apart on a phone.
- **If she picks a brand colour, the warning that saves her prints in English.**

## Minor Observations

- `Button.tsx:43` sets `rounded-lg` for every variant, so the shipped `Button` cannot produce the system's documented full-pill primary. That is likely why `BatchGenerator.tsx:579` and `QRGenerator.tsx:507` both hand-roll their buttons instead of using it, and why `Button.tsx` ended up unused entirely.
- Three button radii coexist in one view: `rounded-full` (pills, batch CTA), `rounded-xl` (all four Generate action buttons), `rounded-lg` (`Button`, inputs, swatch tiles).
- Two pill heights coexist against a documented single 36px: nav/scan tabs at `h-9`, content and reliability pills at `h-11`.
- `DESIGN.md` specifies input focus as "2px ring at 25% opacity"; `Input.tsx:27` ships a full-opacity `focus-visible:ring-2`. The batch textarea does use `ring-focus-ring/25` correctly, so the two disagree.
- `Callout.tsx` is tone-locked to warning by design, which means every hard scanner error renders in amber with `role="status"`. Screen readers get "camera blocked" announced politely.
- Dark mode is the better-behaved theme for the accent: `#D4916E` on `#1A1612` measures 6.92:1. Light-mode terracotta on sand is 4.96:1, passing AA with almost no margin.
- The Batch textarea placeholder renders three plausible URLs in monospace, close enough to real content that a user may believe the list is pre-filled and press Generate.
- The disabled "Generate ZIP" renders as a soft, inviting terracotta at `opacity-50` rather than reading as unavailable, and no text says a list is required.
- 69 interactive controls live on the Generate view once all disclosures are open.
- `Button.tsx:19` and `:44` both apply the same `focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2`, a duplicated declaration.

## Questions to Consider

1. **If "the result is the product", why is the result the only surface the design system never touched?** What would change if the *default* output were warm ink on warm paper (`#1A1612` on `#FAF6F1`, still comfortably above the 4:1 scanner threshold), so a user who touches nothing still walks away with something recognisably from this tool?

2. **The Generate view has no primary button, and Batch and Scan both do. Which one is wrong?** If the live preview genuinely removed the need for a Generate button, the download is now the primary act and should be dressed as one. If the four-equal-buttons row is correct, the terracotta CTA in Batch is a system inconsistency. It cannot be both.

3. **Twenty-two style swatches the user cannot tell apart: is the answer better swatches, or fewer options?** Eight corner frames where six read as squares is not a rendering problem, it is a question about whether eight distinguishable corner frames exist.

4. **`PRODUCT.md` names a Burmese localization as proof of intent, and the file does not exist. What else in the brief is aspiration read as fact?** Playfair is documented and not loaded. `card-ambient` is documented and is `shadow-lg`. The Terracotta Economy caps the accent at three and ships four at rest. Is the design system a contract the build is measured against, or a description written after the fact that has now drifted from both?

---

# Part 2: Technical Audit

## Audit Health Score

| # | Dimension | Score | Key finding |
|---|-----------|-------|-------------|
| 1 | Accessibility | 2 | Excellent ARIA/labelling/landmark hygiene, but 5 confirmed WCAG AA failures: 1.4.3, 1.4.11, 1.4.13 (x2), 1.4.4 |
| 2 | Performance | 2 | 963 kB initial chunk, 598 kB of which is a decoder only 1 of 3 tabs needs |
| 3 | Responsive Design | 3 | Zero horizontal overflow at every width and view tested; loses a point for text-resize clipping navbar controls off-screen |
| 4 | Theming | 3 | Near-perfect token discipline, undermined by a white focus-ring offset on 35 controls in dark mode |
| 5 | Implementation Integrity | 2 | Several verified issues with a systemic pattern: docs describe a product that is not shipped |
| **Total** | | **12/20** | **Acceptable (significant work needed)** |

## Implementation Integrity Verdict

**Fail, with a specific and fixable cause.** The implementation is internally coherent and disciplined; what it is not coherent *with* is its own documentation. Verified: 7 dead modules totalling 825 lines including a feature both `CLAUDE.md` and `DESIGN.md` describe as shipped; a typography system with no tokens and no loaded fonts; a brand mark that is a system emoji; two named `DESIGN.md` rules violated in the shipped build; and three separate stale claims in `CLAUDE.md`. The deterministic detector caught almost none of this (1 true positive in 14 findings) and missed the clearest violation entirely.

This is not drift from sloppiness. Component-level token discipline is close to perfect (zero Tailwind palette classes, zero arbitrary colour values, zero `text-white`/`bg-black` across all of `src/`). The failure is that the documents were never re-derived from the build after the build changed.

## Build and Lint (actual output)

```
npm run lint  -> exit 0, no errors or warnings

npm run build -> exit 0, built in 428ms
dist/assets/index-DFDLjoNr.css           65.02 kB | gzip:  11.55 kB
dist/assets/typeof-B5XbjTb1.js            0.27 kB | gzip:   0.16 kB
dist/assets/purify.es-adlwq8Pz.js        26.85 kB | gzip:  10.45 kB
dist/assets/UTIF-DpbW5mLW.js             83.63 kB | gzip:  29.35 kB
dist/assets/index.es-DhAbu8ib.js        151.21 kB | gzip:  48.82 kB
dist/assets/html2canvas-sMCp_Mwu.js     199.56 kB | gzip:  46.78 kB
dist/assets/jspdf.es.min-_jTXY6k9.js    392.64 kB | gzip: 126.32 kB
dist/assets/index-CsGD0QST.js           963.20 kB | gzip: 277.01 kB   <- initial
dist/assets/heic-to-ZuqnReuv.js       2,996.24 kB | gzip: 751.35 kB   <- lazy, correct
(!) Some chunks are larger than 500 kB after minification.
```

## Findings by Severity

### P0

**None.** Every primary flow (generate, customise, download, batch, scan) completes by keyboard and by pointer at every viewport tested.

### P1

#### P1-1. `--color-text-disabled` fails WCAG 1.4.3 in dark mode by a factor of 2

- **Location:** `src/index.css:55`; consumed at `QRPreview.tsx:179`, `BatchGenerator.tsx:418`, `:513`, and as `placeholder:` in 7 files
- **Category:** Accessibility / Theming
- **Measured:** 2.42:1 on `surface`, 2.06:1 on `surface-raised`, 1.78:1 on `surface-inset`. Live: "QR preview" empty state **1.62:1**, batch hint **2.17:1**, every input placeholder **1.88:1**
- **Standard:** WCAG 2.2 SC 1.4.3 (AA, 4.5:1). None of these are disabled controls, so no exemption applies
- **Impact:** In dark mode the preview's empty-state explanation and the batch view's only instructional copy are effectively invisible. Placeholders, the primary affordance telling a first-timer what to type, are unreadable
- **Fix:** Raise dark `--color-text-disabled` to at least `#8F857A` (4.6:1 on `surface-raised`). Separately, stop using `text-disabled` for text that is not a disabled control
- **Command:** `/impeccable colorize`

#### P1-2. `--color-text-secondary` on `surface-inset` fails 1.4.3 in light mode across 11 strings

- **Location:** `src/index.css:12` (`#6B6B6B`) against `:9` (`#E8DDD2`)
- **Measured:** **3.99:1** (needs 4.5:1). Affects the "?" tooltip glyph, "Match foreground", "Click or drop image", and all 8 frame-style pill labels
- **Standard:** WCAG 2.2 SC 1.4.3 (AA)
- **Fix:** Darken light `--color-text-secondary` to `#636363`. Note the same token passes on `surface` (4.52:1) and `surface-raised` (4.95:1), so this is specifically the inset pairing
- **Command:** `/impeccable colorize`

#### P1-3. Every form-control boundary fails WCAG 1.4.11 in both themes

- **Location:** `src/index.css:15-16` and `:57-58`; applied by `Input.tsx:26`, `Textarea.tsx:26`, `BatchGenerator.tsx:395`, `CountryCodeSelect.tsx:158`, `QRControls.tsx:1433`, `QRPresets.tsx:161`, `WiFiForm.tsx:72`
- **Measured:** `border-strong` vs `surface` = **2.23:1** light, **1.79:1** dark. `border-subtle` vs `surface` = **1.56:1** light, **1.36:1** dark. The fill does not rescue it: `surface-inset` vs `surface` is **1.13:1** light, **1.16:1** dark
- **Standard:** WCAG 2.2 SC 1.4.11 Non-text Contrast (AA, 3:1)
- **Impact:** An empty text field, the batch textarea, and the nav icon buttons have no boundary a low-vision user can resolve. Worst case is the main URL input before the user types
- **Fix:** Raise `border-strong` to roughly `#8A8073` (3.1:1) light and `rgba(255,255,255,0.30)` dark. `border-subtle` may stay decorative provided it is never the sole boundary of an interactive control (today it is, on nav icon buttons and secondary action buttons)
- **Command:** `/impeccable colorize`

#### P1-4. Tooltip fails WCAG 1.4.13 on both Dismissible and Hoverable

- **Location:** `Tooltip.tsx:18` (`onMouseLeave`), `:20` (`onBlur`), no `keydown` handler
- **Verified live:** `Escape` while open leaves it open. Moving the pointer from trigger onto the tooltip body dismisses it, so the text cannot be read with a magnifier or a tremor
- **Standard:** WCAG 2.2 SC 1.4.13 (AA)
- **Impact:** The error-correction explainer, the one place the app teaches its non-technical audience what EC level means, is unreachable for magnifier users and undismissable by keyboard
- **Fix:** Add an `Escape` handler that clears `visible`, and move `onMouseEnter`/`onMouseLeave` to the outer `div` at `Tooltip.tsx:13`
- **Command:** `/impeccable harden`

#### P1-5. Text resize to 150%+ pushes navbar controls outside the viewport, where `overflow-x-hidden` clips them unreachably

- **Location:** `Layout.tsx:9` (`overflow-x-hidden`) plus `Navbar.tsx:10` (`flex items-center justify-between`, no wrap)
- **Verified live at 390px:**

  | root font-size | theme toggle x-range | reachable? |
  |---|---|---|
  | 16px (default) | 332..387 | yes |
  | 20px (125%) | 332..387 | yes |
  | 24px (150%) | **397..463** | no |
  | 32px (200%) | **526..614** | no; language select also clipped |

  `scrollWidth` stays 390 in all cases, so content is clipped, not scrollable
- **Standard:** WCAG 2.2 SC 1.4.4 Resize Text (AA); SC 1.4.10 Reflow also implicated
- **Fix:** Add `flex-wrap` and `gap-y` to the navbar row, or move the subtitle out of flow at small widths. Do not rely on `overflow-x-hidden`: it converts a scroll into content loss
- **Command:** `/impeccable adapt`

#### P1-6. The entire `@zxing/library` decoder ships in the initial chunk for all users

- **Location:** `qrDecode.ts:1-7` (static import) reached via `useQrScanner.ts:7` and `QRScanner.tsx:7`, which `App.tsx:5` imports statically
- **Measured:** an isolated Vite build of exactly the five symbols `qrDecode.ts` imports produces **597.76 kB minified / 133.58 kB gzip**, 62% of the 963.20 kB initial chunk. The main chunk contains the full multi-format reader (`AZTEC`, `PDF_417`, `MAXICODE`, `ITF`, `UPC_EAN_EXTENSION`), none of which the app uses
- **Impact:** Every visitor to the Generate view, the default and most common entry, downloads and parses a barcode decoder they will never invoke. `App.tsx:64` already mounts `QRScanner` on demand, so the intent is there but the module graph defeats it
- **Fix:** `React.lazy(() => import('./components/feature/qr/QRScanner'))` behind `<Suspense>`. Expected reduction: roughly 600 kB raw / 133 kB gzip, taking the entry to about 365 kB raw / 144 kB gzip
- **Command:** `/impeccable optimize`

### P2

#### P2-1. Seven modules (825 lines) are dead code, and the docs describe one of them as shipped

- **Location and size:**

  | Module | Lines | Reachable? |
  |---|---|---|
  | `src/components/common/ExportModal.tsx` | 230 | no importer |
  | `src/components/common/DimensionSelector.tsx` | 118 | only via ExportModal |
  | `src/components/common/FormatSelector.tsx` | 95 | only via ExportModal |
  | `src/hooks/useExportState.ts` | 169 | no importer |
  | `src/utils/export/pngExporter.ts` | 116 | no importer |
  | `src/components/common/Button.tsx` | 62 | no importer |
  | `src/components/common/Toast.tsx` | 35 | no importer |
  | **Total** | **825** | |

- **Verified:** an import-graph sweep over all 120 non-test source modules finds no importer outside their own definitions and tests. The built bundle contains zero occurrences of `aria-modal`, confirming Rollup never included the component
- **Impact:** `CLAUDE.md` ("`useExportState` + `src/utils/export/` drive the hi-res export modal") and `DESIGN.md` ("**modal** (`shadow-2xl`): Export modal, the only surface that fully lifts above the page") both describe a feature no user can reach. `Button.tsx` being dead means the design system's own button primitive is unused while every button in the product is hand-rolled, which is the direct cause of the three-radii and two-disabled-language inconsistencies above. Four of these modules carry unit tests, so the 85% coverage gate is partly satisfied by unreachable code. Latent defects in `ExportModal` (focus-trap selector at `:74-76` misses `textarea`/`[tabindex]`, no `max-height`/`overflow-y`, hardcoded English "Exporting...") are dormant only because nothing mounts it
- **Fix:** Either wire the modal to a trigger and fix its three defects first, or delete all seven modules, their tests, and the `export.*` i18n keys, then correct `CLAUDE.md` and `DESIGN.md`. Separately, decide whether `Button.tsx` becomes the real primitive (it needs a pill variant first) or goes
- **Command:** `/impeccable distill`

#### P2-2. The batch CSV source view is `disabled`, not `readOnly`

- **Location:** `BatchGenerator.tsx:385`
- **Verified live:** after importing a 3-column CSV, the textarea reports `disabled: true`, `readOnly: false`, and is absent from the tab order
- **Impact:** `CLAUDE.md` describes this element as a "read-only source view". `disabled` removes it from the accessibility tree and applies `disabled:opacity-50`, halving an already-low-contrast monospace block
- **Fix:** Swap `disabled` for `readOnly` when `mappingActive` (keep `disabled` for `isGenerating`) and drop the opacity treatment in the read-only case
- **Command:** `/impeccable harden`

#### P2-3. `@babel/core` is a runtime `dependencies` entry with no consumer

- **Location:** `package.json:23`
- **Verified:** zero references anywhere outside `package.json`; zero occurrences of `babel` in the built bundle. `@vitejs/plugin-react` declares its own Babel dependency and is correctly in `devDependencies`
- **Impact:** No bundle cost, but it adds a large transitive tree to every `npm ci` including the production Docker stage, enlarging the Trivy/SCA surface for no benefit
- **Fix:** Remove it
- **Command:** `/impeccable optimize`

#### P2-4. The live camera scan loop runs an unthrottled main-thread ZXing decode per frame

- **Location:** `useQrScanner.ts:348-359` calling `decodeFromSource` at `:121-127` and `decodeDrawable` at `:101-118`
- **Mechanism:** `tick()` reschedules via `requestAnimationFrame` immediately after each decode resolves. Without `BarcodeDetector` (Firefox, older Safari) the fallback iterates `getDecodeEdges` (`qrDecode.ts:53`, up to 9 scale targets) doing a `drawScaled` plus a synchronous `decodeImageData` with `TRY_HARDER` for each: up to nine full ZXing passes per animation frame, on the main thread
- **Impact:** Sustained 100% single-core use and visible jank while the camera is on, with battery cost on the mobile devices this feature targets
- **Fix:** Throttle to roughly 8-10 fps with a timestamp guard, cap the fallback ladder to one or two edges for live frames (keep the full ladder for still uploads), consider `requestVideoFrameCallback`
- **Command:** `/impeccable optimize`

#### P2-5. `FormatSelector` implements `role="radiogroup"` without radiogroup keyboard behaviour

- **Location:** `FormatSelector.tsx:30-46` (latent, see P2-1)
- **Issues:** all three `role="radio"` buttons are individually tabbable with no arrow-key handling or roving `tabindex`; line 30 renders `{formatLabels[selected]} Format` as the group label, so the accessible name changes as the user selects and " Format" is hardcoded English; the `<label id>` has no `for`
- **Standard:** WCAG 2.2 SC 4.1.2
- **Fix:** Switch to the `role="group"` + `aria-pressed` pattern the rest of the codebase already uses consistently
- **Command:** `/impeccable harden`

#### P2-6. Untranslated user-facing strings

Covered as a design issue above. Full list: `QRControls.tsx:1046,1051-1052,1481,1483,1485-1487`; `useQRGenerator.ts:17`; `App.tsx:38`; `Button.tsx:57`; `WiFiForm.tsx:62`. The dozens of English default prop values in `QRControls.tsx:478-580` are *not* a problem: `QRGenerator` overrides all of them with `translate(...)` calls.

### P3

| # | Issue | Location |
|---|---|---|
| P3-1 | `--tw-ring-offset-color` defaults to `#fff` on **35 of 36** `ring-offset-*` sites, painting a bright white halo inside the terracotta focus ring in dark mode (measured `rgb(255,255,255) 0 0 0 2px, rgb(212,145,110) 0 0 0 4px`; white is 17.99:1 on `#1A1612` vs terracotta's 6.92:1, so the artifact dominates). Contradicts `DESIGN.md` ("2px `focus-ring` ring with 2px `surface` offset") | 16 files; only `Button.tsx:44` is correct. Fix once with `--tw-ring-offset-color: var(--color-surface)` in `@layer base` |
| P3-2 | Navbar `backdrop-blur-sm` at rest over a non-scrolling header: banned by `DESIGN.md`, costs a compositing layer for zero benefit | `Navbar.tsx:9` |
| P3-3 | `text-primary #1A1A1A` and `text-secondary #6B6B6B` are pure achromatic gray (OKLCH C=0.00) against the "non-negotiable" Warm Neutral Rule; six more tokens sit at hue 70-74, outside the documented 48-68 band | `src/index.css:11-12` |
| P3-4 | `transition-colors` appears **34 times** with no `motion-reduce:` guard; only `CountryCodeSelect.tsx` guards. Not a WCAG AA failure (2.3.3 is AAA and 150ms colour fades are not vestibular triggers), but `PRODUCT.md` asks for it on "any transitions" | throughout `src/components` |
| P3-5 | Tailwind v4 auto content-detection scans `specs/*.md` and `README.md`, generating **37 unused palette colours / 239 references** in shipped CSS (`indigo-*`, `sky-*`, `slate-*`, `fuchsia-500`, `gray-950`, including `.focus-visible:outline-indigo-500`), all traced to class names quoted in `specs/022-semantic-design-tokens/tasks.md` | `src/index.css:1`. Fix with an explicit `@source "../src";` |
| P3-6 | Batch progress bar animates `width`, a layout property, at `duration-150` every tick | `BatchGenerator.tsx:607` |
| P3-7 | `void canvas.offsetWidth` forces a synchronous layout on every QR regeneration | `QRPreview.tsx:110` |
| P3-8 | The decorative `🔳` in the `<h1>` has no `aria-hidden`, so screen readers announce "white square button" before the brand name | `Navbar.tsx:13` |
| P3-9 | Scanner errors including camera-permission denial render as `role="status"` (polite) rather than `role="alert"` | `QRScanner.tsx:293` |
| P3-10 | Hardcoded `border-white/90` and `shadow-[0_0_0_9999px_rgba(0,0,0,0.35)]` on the camera viewfinder, the only two colour literals in `src/components` | `QRScanner.tsx:255` |
| P3-11 | Theme-colour hex duplicated in four places, two in `index.html`'s inline script and two in `ThemeProvider` | `index.html:26`, `ThemeProvider.tsx:19` |
| P3-12 | `localStorage.getItem` in the `prefers-color-scheme` handler is the only unguarded access in a file that wraps every other one in `try/catch` | `useTheme.ts:44` |
| P3-13 | The footer separator (`text-border-strong`, 2.23:1 light / 1.75:1 dark) is the lowest-contrast text on the page. `aria-hidden` and decorative, so 1.4.3 does not apply | `App.tsx:71` |
| P3-14 | Terracotta Economy over budget: 4 resting action-coloured elements on Generate against a documented maximum of 3 | multiple |
| P3-15 | Controls below the 44px the design system specifies for itself: view tabs and content pills 36px, mapping selects 38px, "Import from file" 26px, "Clear" 24px, tooltip trigger 28px. All clear WCAG 2.2 SC 2.5.8 (24px); none meet SC 2.5.5 (AAA) | `PillGroup.tsx:70`, `BatchGenerator.tsx:56/354/440`, `Tooltip.tsx:21` |
| P3-16 | The "Transparent" toggle overhangs the 390px viewport by **2.03px** (right edge 392.03), clipped silently by `overflow-x-hidden` | `QRControls.tsx:1116-1127` |
| P3-17 | `Tooltip.tsx:24` uses `text-[9px]`, on no step of the documented type ramp. This is the detector's single true positive | `Tooltip.tsx:24` |

## Patterns and Systemic Issues

1. **Two tokens cause roughly 20 distinct contrast violations.** `text-disabled` accounts for 4 of the 6 measured 1.4.3 failures and is applied via `placeholder:text-text-disabled` in **7 files**, so every placeholder in the product is under threshold in both themes. `text-secondary` on `surface-inset` accounts for the remaining 11 failing strings. Both are one-line fixes in `src/index.css`.

2. **Focus-ring offset colour was never wired to the design system.** 35 of 36 `ring-offset-*` usages across 16 files inherit Tailwind's `#fff` default. `Button.tsx`, the dead module, is the only file that got it right. A copy-paste class string propagated a defect, and the fix is one base-layer declaration rather than 35 edits.

3. **Non-text contrast was never part of the token design.** Every border token fails 3:1 against every surface in both themes without exception. The system was tuned for text contrast, where it mostly succeeds, and SC 1.4.11 appears never to have been applied.

4. **Documentation has drifted from implementation in at least five places.** (a) `CLAUDE.md` describes a Generate button that snapshots pending state into `config`; no such button exists, `useQRGenerator.ts:110-115` debounces at 300ms, and `QRControls.test.tsx:228` asserts the button is *not* in the document. (b) `CLAUDE.md` and `DESIGN.md` both document the hi-res export modal as shipped; it is unmounted dead code. (c) `CLAUDE.md` says the batch CSV textarea is "read-only"; it is `disabled`. (d) `CLAUDE.md` says `CapacityCounter` is "text mode only"; `QRControls.tsx:909` renders it in every non-text mode. (e) `PRODUCT.md` cites a Burmese `my.json` as evidence of audience intent; the file does not exist. Docs describing behaviour that does not exist are worse than no docs, because they direct future work at the wrong code.

5. **`overflow-x-hidden` is used defensively at two levels** (`Layout.tsx:9` and every view section), which is why the horizontal-overflow numbers are perfect. It also means any layout overflow silently becomes content loss rather than a visible scrollbar, which is exactly what P1-5 and P3-16 are.

6. **Reduced-motion handling is correct at the CSS layer but was not applied to Tailwind's `transition-*` utilities.** Two conventions coexist in one codebase.

## Positive Findings

- **No global `* { animation-duration: 0.01ms }` kill switch.** Reduced motion is opt-in (`@media (prefers-reduced-motion: no-preference)` at `index.css:84` and `:139`, plus `motion-safe:` on the six real animations). Verified with `reducedMotion: 'reduce'`: `transitions-ready` is never applied, `qr-enter` resolves to `animation: none`, zero elements animating. This is the pattern most codebases get wrong, and it preserves useful feedback instead of destroying it.
- **ARIA and labelling hygiene is essentially flawless.** A live sweep of the fully expanded Generate view and the Scan view found **0 duplicate IDs, 0 unlabelled form controls, 0 dangling `aria-labelledby`/`describedby`/`controls`/`activedescendant` references, and 0 buttons or links without an accessible name**. The `hidden` Generate view correctly resolves to `display: none` with no focusable descendants leaking into the tab order.
- **Zero console errors, warnings, or uncaught page errors** across all 12 configurations (3 views x 2 themes x 2 viewports).
- **No horizontal page overflow anywhere:** 320 / 390 / 768 / 1440 px in all three views, and 640x360 (the 400%-reflow equivalent). The densest layout in the app, the CSV column-mapping panel, is clean at 390px.
- **Clean heading hierarchy:** no missing h1, no skipped levels, no duplicate h1 in any view or theme.
- **Runtime performance of the core loop is excellent.** Typing 33 characters produced **zero long tasks**. The 300ms debounce, the cached-image canvas compositor with separate stale-render guards for base and logo layers, and the ref-shadowed props that keep `drawFrame` dependency-free are well thought out. DOM stays at 226 nodes; no `will-change` anywhere; no `<img>` elements, so no lazy-loading or alt-text debt.
- **Code splitting is correct for the three heaviest optional dependencies:** `heic-to` (2,996 kB), `utif` (84 kB) and `jspdf` (393 kB) are all behind `await import()`. P1-6 is the exception, not the rule.
- **Token discipline in components is the best I would expect to see.** Zero Tailwind palette classes, zero arbitrary colour values, zero `text-white`/`bg-black` across all of `src/`. Exactly two colour literals escape the system, both on the camera viewfinder. Full `:root.dark` override of all 21 tokens plus `color-scheme`, and a no-FOUC inline theme script.
- **i18n is at full parity.** `en.json` and `es.json` both flatten to **365 keys, zero missing, zero extra**. The 14 identical strings are proper nouns and numerals (Wi-Fi, Bitcoin, WPA/WPA2, 37.7870) that correctly do not translate. The provider falls back to the default locale per key and logs once per missing key.
- **`CountryCodeSelect` is a genuinely well-built combobox:** `aria-activedescendant`, Arrow/Home/End/Enter/Escape, `Escape` refocuses the trigger, `Tab` closes without stealing focus, light-dismiss on outside pointerdown, `scrollIntoView` guarded for jsdom, and the only three `motion-reduce:` guards in the codebase. It is also the only component with a documented exit-animation lifecycle.
- **Focus is visible on 100% of focusable elements.** Every `button`, `a`, `input`, `select` and `textarea` carries a `focus-visible:ring-2`; the sweep found zero exceptions. Tab order follows DOM and visual order with no traps. The four `input[type="color"]` elements that appear to lack an indicator carry it on the `focus-within` wrapper, verified painting.
- **`useQrScanner` resource management is careful:** monotonic scan tokens to drop superseded decodes, a `startingRef` guard against stacked `getUserMedia` calls, track cleanup on stop and unmount, a 25 MB file cap with a documented rationale, and a deliberate decision not to clear the error on a denied retry to avoid flicker.

---

# Remediation status

Everything below was fixed on `fix/impeccable-review-remediation` after this review was written. Findings are listed by their IDs above.

| Finding | Status |
|---|---|
| P0 mobile column order | Fixed. Controls precede the preview on mobile; desktop unchanged |
| P1-1 / P1-2 text contrast | Fixed in `src/index.css`. Placeholders, empty states and hints moved off `text-disabled` onto `text-secondary` |
| P1-3 non-text contrast | Fixed. `border-strong` raised to 3:1+; interactive controls moved off decorative `border-subtle` |
| P1-4 tooltip SC 1.4.13 | Fixed. Escape dismisses, hover moved to the wrapper so the pointer can enter the panel |
| P1-5 text resize | Fixed. Navbar wraps; verified operable at 200% |
| P1-6 ZXing in entry chunk | Fixed. Scan and Batch are `React.lazy`; entry 963.20 kB → 458.81 kB (277.01 → 140.15 kB gzip) |
| P1 no primary action | Fixed. Download PNG is the terracotta pill CTA and states its 1024 output size |
| P1 `opacity-40` dim | Fixed. Removed rather than enforced: the controls genuinely work |
| P1 unrecognizable swatches | **Not done.** See below |
| P2-1 dead code | Fixed. 7 modules / 825 lines and 4 test files removed, with 27 dead locale keys |
| P2-2 CSV textarea | Fixed. `readOnly`, not `disabled` |
| P2-3 `@babel/core` | Fixed. Removed from runtime deps and the lockfile |
| P2-4 camera decode loop | Fixed. ~10 fps and two ladder passes; worst case 420 → 20 passes/sec |
| P2-5 disabled languages | Fixed. One treatment, explained once beneath the primary |
| P2-6 untranslated strings | Fixed. 10 strings behind `translate()`; both locales at parity |
| P3-1 focus-ring offset | Fixed with one base-layer declaration covering all 35 sites |
| P3-2 navbar blur | Fixed. Removed |
| P3-3 achromatic neutrals | Fixed. `text-primary` and `text-secondary` warmed |
| P3-4 unguarded transitions | Fixed with one scoped `prefers-reduced-motion` rule |
| P3-5 Tailwind content scope | Fixed. CSS 65.02 kB → 39.21 kB (11.55 → 7.89 kB gzip) |
| P3-6 progress bar | Fixed. Animates `scaleX`, not `width` |
| P3-8 emoji brand mark | Fixed. Replaced with an inline finder-pattern SVG in ink |
| P3-9 scanner `role` | Fixed. Camera denial and unsupported browsers announce assertively |
| P3-10 viewfinder literals | Fixed. `--color-viewfinder` / `--color-scrim` tokens |
| P3-11 theme-color duplication | Fixed. Read back off `--color-surface` |
| P3-12 unguarded storage read | Fixed |
| P3-13 footer separator | Fixed |
| P3-14 Terracotta Economy | Fixed by rewriting the rule to the one the build can keep, and freeing the decorative eyebrow |
| P3-16 toggle overhang | Fixed |
| P3-17 off-ramp 9px | Fixed. Tooltip glyph at the documented 10px, trigger raised to 36px |
| Design specificity: output | Fixed. The QR defaults to warm ink on warm paper (16.72:1) |
| Design specificity: typography | Resolved as documentation. The system stack is now the committed choice; see below |
| Doc drift (5 claims) | Fixed. `CLAUDE.md`, `DESIGN.md`, `PRODUCT.md` reconciled |

## Deliberately not done

- **P1 unrecognizable style swatches.** The fix needs a design decision this review cannot make alone: whether to render each swatch in the user's current foreground colour, add visible labels, or cut eight corner frames down to three well-named ones. All three are defensible and they lead to different products. Left for a `/impeccable clarify` pass.
- **Loading Playfair Display and Inter.** The brief chose to keep the system stack rather than add two webfont payloads to a tool that promises "under a minute". `DESIGN.md` now documents the system stack as the intended choice rather than describing fonts nothing fetches, and adds a rule against naming an unloaded family.
- **Wiring the export modal instead of deleting it.** Both were valid readings of P2-1. Deletion was chosen as the one consistent with making the docs true; the code is one `git revert` away if hi-res export should come back as a real feature.
- **P3-15 touch targets below 44px.** All clear WCAG 2.2 SC 2.5.8 (24px). Raising the 36px segmented controls to 44px changes the density of every view and is a design decision, not a defect fix.

## Verification

`npm run test` (935 passed), `npm run lint` (clean), `npm run build` (clean), and `npm run test:e2e` (234 passed across desktop/mobile × light/dark) all pass. `e2e/accessibility.spec.ts` adds scenarios for the mobile ordering, the primary CTA, the disabled-state explanation, tooltip dismissal and hoverability, the 200% navbar, and the lazy chunks.

---

# Part 3: Recommended Order of Work

Ordered by impact per unit of effort, not strictly by severity.

1. **`/impeccable colorize`** (P1-1, P1-2, P1-3): raise `text-disabled` (dark), `text-secondary` (light), and both border tokens in `src/index.css`. One file, resolves roughly 20 distinct WCAG AA violations.
2. **`/impeccable polish`** (P3-1): set `--tw-ring-offset-color: var(--color-surface)` in `@layer base`. One line, fixes the white focus halo across 35 sites.
3. **`/impeccable optimize`** (P1-6, P2-3, P2-4): `React.lazy` the Scan view (roughly 133 kB gzip off initial load), drop `@babel/core`, throttle the camera decode loop.
4. **`/impeccable adapt`** (P0, P1-5, P3-16): fix the mobile column order on Generate, wrap the navbar for text resize, fix the 2px toggle overhang.
5. **`/impeccable harden`** (P1-3 dim, P1-4, P2-2, P2-6): resolve the `opacity-40` ambiguity, fix Tooltip dismiss/hover, swap `disabled` for `readOnly`, translate the ten hardcoded strings.
6. **`/impeccable layout`** (P1 primary action): promote Download PNG to the documented primary CTA and demote the rest.
7. **`/impeccable clarify`** (P1 swatches): render swatches in the user's actual foreground colour with visible labels.
8. **`/impeccable distill`** (P2-1, P3): decide the fate of the 7-module dead cluster, then reconcile `CLAUDE.md`, `DESIGN.md` and `PRODUCT.md` with what actually ships.
9. **`/impeccable typeset`**: load the fonts the design system claims, or rewrite the system to describe the system font stack it actually uses. Add `--font-*` tokens either way.
10. **`/impeccable polish`** as the final pass.

Per `CLAUDE.md` commit discipline, items 1, 2 and 9 are `src/index.css` changes; item 5 splits into an i18n commit and component commits; item 8 splits into a code commit and a docs commit. Stage them separately.

---

# Appendix: Method and Coverage

**How this was produced.** Two isolated parallel sub-agents ran the critique halves (Assessment A: design review, source and screenshots, no detector access; Assessment B: detector plus browser measurement, no design opinions). A third sub-agent ran the technical audit independently. A parent verification pass independently confirmed the dead-code sweep, the font-loading claim, the i18n key parity, the `backdrop-blur` violation and the doc-drift claims before synthesis. Conflicts between agents were resolved against re-verified evidence: the audit missed `Button.tsx` in the dead-code cluster, which an import-graph sweep over all 120 non-test modules confirmed.

**Evidence base.** 28 full-page screenshots (3 views x 2 themes x 2 viewports plus content-mode states), a computed WCAG contrast matrix over every token pair in `src/index.css`, tab-order walks (70 stops on Generate, 12 Batch, 9 Scan per theme and viewport), text-resize probes at 100/125/150/200%, an isolated Vite build to size `@zxing/library`, and `npm run lint` plus `npm run build`.

**Not covered.**
- The **export modal's** live behaviour (contrast, touch targets, focus trap): it is unreachable, so only static defects were assessed.
- The **batch multi-column CSV mapping UI** was not exercised end to end (it needs a real multi-column upload); its layout was checked at 390px and is clean.
- **Scan camera mode**: headless Chromium has no camera, so only the Upload path was audited. The permission-denied and decode-error paths were read in source, not run.
- **Populated states**: QR history list, saved presets list, scan-result panel, and batch progress/result were not measured.
- **The `es` locale** was not visually audited, so there is no i18n text-overflow evidence. Given the navbar already clips at 150% text, longer Spanish strings are worth a look.
- **The e2e suite** (`npm run test:e2e`) was not run.
