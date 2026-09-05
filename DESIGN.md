---
name: QR Generator
description: Craft custom QR codes — warm, considered, done in under a minute.
colors:
  action: "#A04D28"
  action-hover: "#8B4020"
  action-fg: "#FFFFFF"
  action-disabled: "#E8C5B3"
  surface: "#F3EBE2"
  surface-raised: "#FAF6F1"
  surface-inset: "#E8DDD2"
  text-primary: "#1C1A17"
  text-secondary: "#605A52"
  text-disabled: "#6E665C"
  border-subtle: "#C5BEB6"
  border-strong: "#877D70"
  error: "#C53030"
  error-surface: "#FEF2F2"
  warning: "#7C4A18"
  warning-surface: "#FAF3E6"
  warning-border: "#D4A850"
  focus-ring: "#A04D28"
typography:
  display:
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
    fontSize: "36px"
    fontWeight: 700
    lineHeight: 1.2
  title:
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
    fontSize: "24px"
    fontWeight: 700
    lineHeight: 1.3
  body:
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
    fontSize: "13px"
    fontWeight: 600
    lineHeight: 1.4
  caption:
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
    fontSize: "10px"
    fontWeight: 600
    letterSpacing: "0.3em"
  mono:
    fontFamily: "Geist Mono, monospace"
    fontSize: "14px"
    fontWeight: 500
rounded:
  sm: "8px"
  md: "12px"
  lg: "16px"
  full: "9999px"
spacing:
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "20px"
  xl: "32px"
  2xl: "40px"
components:
  button-primary:
    backgroundColor: "{colors.action}"
    textColor: "{colors.action-fg}"
    rounded: "{rounded.full}"
    height: "48px"
    padding: "0 24px"
  button-primary-hover:
    backgroundColor: "#8B4020"
    textColor: "{colors.action-fg}"
  button-secondary:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.md}"
    height: "44px"
    padding: "0 16px"
  button-secondary-hover:
    backgroundColor: "{colors.surface-inset}"
    textColor: "{colors.text-primary}"
  pill-active:
    backgroundColor: "{colors.action}"
    textColor: "{colors.action-fg}"
    rounded: "{rounded.full}"
    height: "36px"
    padding: "0 12px"
  pill-inactive:
    backgroundColor: "{colors.surface-inset}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.full}"
    height: "36px"
    padding: "0 12px"
  input:
    backgroundColor: "{colors.surface-inset}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.sm}"
    height: "44px"
    padding: "0 12px"
  card:
    backgroundColor: "{colors.surface-raised}"
    rounded: "{rounded.md}"
    padding: "32px"
---

# Design System: QR Generator

## 1. Overview

**Creative North Star: "The Potter's Atelier"**

A QR code generator that treats the output as a craft object, not a utility dump. Every surface carries the warmth of fired clay and linen — earthy without being rustic, refined without being cold. The palette is committed to a single terracotta accent that earns the right to appear, surrounded by strata of warm neutrals that breathe.

This system rejects the interchangeable. There is no blue primary, no card grid, no SaaS-cream background. Authority comes from restraint rather than a display face: heavy weight against generous space, uppercase eyebrows tracking out over bold titles, and a single accent that only ever marks state or action. The sand surface (#F3EBE2) is never purely neutral — it is always slightly warm, always hinting at the material world. And the warmth now reaches the code itself, not just the frame around it.

Interaction is brief and purposeful. The user arrives with a URL, leaves with a QR code they are not embarrassed by. The tool does not perform. It does.

**Key Characteristics:**
- Warm earthy palette: sand, linen, oatmeal neutrals anchored by a single terracotta accent
- One face, worked hard: the platform system stack for the whole UI, Geist Mono for machine values only
- Dual theme: light mode is warm afternoon light; dark mode is a dim workshop at dusk
- Pill-shaped controls: segmented options feel tactile, not digital
- The output inherits the palette: warm ink on warm paper, never black on white
- Settled and warm: controls feel planted — no floating, no over-animation
- 150ms transitions: state changes feel immediate, not harsh

## 2. Colors: The Terracotta Palette

A restrained palette built on warm neutrals with a single terracotta accent. Every surface sits on the warm side of neutral — hues in the 48–68 range in OKLCH. All color tokens are CSS custom properties in `src/index.css`; `:root.dark` overrides each with dark-mode equivalents.

### Primary

- **Terracotta** (#A04D28, hover #8B4020; dark: #D4916E, hover #E3A98B): The brand accent. Used on the Generate button, active pills, section eyebrow text, and focus rings. At most three elements per view carry this color.
- **Action Foreground** (#FFFFFF, dark: #1A1612): Text and icons on terracotta surfaces.
- **Action Disabled** (#E8C5B3, dark: #6B4B38): Disabled state of action elements.

### Neutral

- **Warm Sand** (#F3EBE2, dark: #1A1612): Page background. Never pure white; the warmth carries through every surface.
- **Pale Linen** (#FAF6F1, dark: #2A2420): Cards, navbar, raised surfaces — one step lighter than sand.
- **Oatmeal** (#E8DDD2, dark: rgba(255,255,255,0.05)): Inputs, inactive pills, preview area — the inset well.
- **Inkwell** (#1C1A17, dark: #F3EBE2): Primary text. Warm-tinted, per the Warm Neutral Rule.
- **Driftwood** (#605A52, dark: #A89E93): Secondary text, icons, muted labels, **placeholders**, empty states and hints. Meets 4.5:1 on all three surfaces including `surface-inset` (5.10:1).
- **Fog** (#6E665C, dark: #948A7E): **Disabled controls only.** WCAG 1.4.3 exempts inactive components; anything a sighted user is meant to read (placeholders, empty states, hints) uses Driftwood instead.
- **Pale Stone** (#C5BEB6, dark: rgba(255,255,255,0.10)): Dividers, panel and popover outlines. **Decorative only** — it does not meet 1.4.11 and must never be a control's sole boundary.
- **Warm Slate** (#877D70, dark: rgba(255,255,255,0.38)): Card outline, and the boundary of every interactive control. Meets the 3:1 of WCAG 1.4.11 against all surfaces in both themes.

### Tertiary

- **Clay Red** (#C53030, dark: #F87171): Error states only — field borders, error messages, destructive feedback. Paired with Error Surface (#FEF2F2) for background fills.
- **Ember** (#7C4A18, dark: #D4A850): Warning text and icons. Paired with Warning Surface (#FAF3E6, dark: rgba(180,120,30,0.15)) for background fills and Warning Border (#D4A850, dark: rgba(180,120,30,0.35)) for the Callout component's full-perimeter stroke.

### Named Rules

**The Terracotta Economy.** The action color earns its place by meaning, not by a headcount. It is reserved for exactly three jobs:

1. the **active state** of a segmented control (view tabs, content mode, reliability, batch format),
2. exactly **one primary action** per view (Download PNG, Generate ZIP), and
3. **focus rings**.

Nothing decorative may take it. The hero eyebrow used to, and gave it up when the primary download claimed it. If you are reaching for the accent and your element is not in that list, the answer is `text-primary` or `border-strong`.

On the Generate view this resolves to four resting elements (active tab, active content pill, active reliability pill, primary CTA), each carrying state or action. An earlier revision of this rule capped the count at three, which the build never met and could not: two segmented controls plus a tab bar plus a CTA is four before any decoration.

**The Warm Neutral Rule.** No surface is pure gray or pure white. Every neutral is tinted toward the warm hue family (48–68 in OKLCH). #F3EBE2 is not white. #1A1612 is not black. Tinting is non-negotiable.

## 3. Typography

**UI Font:** the platform system stack (`system-ui, -apple-system, Segoe UI, Roboto, sans-serif`) — the only typeface in the UI
**Mono Font:** Geist Mono (loaded via Google Fonts — hex values in the color picker and the batch list only)

> **Deliberate, not aspirational.** Earlier revisions of this document specified Inter for the UI and Playfair Display for headings. Neither was ever loaded: `index.html` fetches only Geist Mono, so the shipped type has always been whatever the OS provides, and it differed per platform. Rather than add two webfont payloads to a tool whose whole promise is "done in under a minute", the system stack is now the documented choice: zero bytes, zero FOUC, and a face that already looks native to the visitor. If a display face is ever added, it applies to Display and Title only, never below 18px, and it must be self-hosted and preloaded.

**Character:** the system stack carries the full UI — from hero headline to form labels. Hierarchy comes entirely from size and weight contrast: 700 for display and titles, 600 for labels and eyebrows, 400 for body copy. It's functional and clear, which suits the non-technical audience. The eyebrow captions compensate for the single-font system with aggressive uppercase tracking, giving sections visual anchoring without a second typeface.

### Hierarchy

- **Display** (700, 24px mobile / 36px desktop, lh 1.2): Hero headline ("Create Custom QR Codes"). One instance per page. `text-2xl sm:text-4xl`.
- **Title** (700, 24px, lh 1.3): Panel section headings (Settings, Preview). `text-2xl`.
- **Navbar Title** (600, 18px mobile / 20px desktop, lh 1.3): Brand name. `text-lg sm:text-xl`.
- **Body** (400, 14px mobile / 16px desktop, lh 1.5): Descriptive copy and hero subheading. `text-sm sm:text-base`. Line length 65–75ch.
- **Label** (600, 13px, lh 1.4): Form field labels, button text, pill labels. The workhorse of the UI.
- **Caption — Hero** (600, 10px, ls 0.3em, uppercase): Hero eyebrow ("QUICK & EASY"). `text-[10px] tracking-[0.3em]`.
- **Caption — Panel** (600, 11px, ls 0.15em, uppercase): Section eyebrows (CONFIGURATION, LIVE PREVIEW). `text-[11px] tracking-[0.15em]`.
- **Mono** (500, 14px, uppercase): Hex color values in the color picker. Geist Mono. `text-sm font-['Geist_Mono']`.

### Named Rules

**The Weight-Scale Rule.** In a single-font system, hierarchy lives entirely in weight and size. 700 for headings, 600 for labels and eyebrows, 400–500 for body and secondary. Never use 400 on interactive element labels — it reads as inactive.

**The One-Face Rule.** The UI ships a single family, the system stack, and Geist Mono for machine values only (hex codes, the batch list). Do not introduce a third face without loading it: a `font-family` naming a font nothing fetches is not a typographic choice, it is a per-platform accident.

## 4. Elevation

Depth is conveyed primarily through tonal layering: `surface` (page) → `surface-raised` (card, navbar) → `surface-inset` (inputs, pills, preview). Controls are flat at rest. The main card and modal get lift from ambient shadows; everything else relies on surface contrast.

### Shadow Vocabulary

- **card-ambient** (`0 2px 4px rgba(0,0,0,0.031), 0 12px 32px rgba(0,0,0,0.059)`): Main two-column card. Two-layer ambient shadow for grounded depth. The heaviest structural shadow in the system.
- **button-lift** (`shadow-sm`): Primary and secondary buttons at rest. Subtle ground contact only.
- **tooltip** (`shadow-md`): Tooltip and inline popovers.
- **preview-inset-dark** (`0 2px 8px rgba(0,0,0,0.125)`): Preview area in dark mode. Reinforces the inset well.

### Named Rules

**The Flat-By-Default Rule.** Controls (pills, inputs, dropdowns) are flat at rest. Shadow is a structural signal, not decoration. New components must not introduce a shadow heavier than `card-ambient` unless they genuinely float above all other surfaces (the tooltip and the country popover are the only two that do).

## 5. Components

**Overall feel:** Settled and warm. Controls feel planted — pill-shaped edges soften the UI without making anything feel floating or ungrounded. The terracotta accent appears sparingly. Every touch target is 36–48px tall.

### Buttons

- **Shape:** Pill (9999px radius) for primary. Gently rounded (12px) for secondary, download, and share buttons.
- **Primary (Download PNG, Generate ZIP):** Terracotta fill (`bg-action`, hover `bg-action-hover`), `action-fg` text, full-width, 48px tall, pill radius, leading icon, 700 weight. **One per view.** The Generate view's primary states its output size ("Download PNG · 1024 × 1024") so the visitor knows what they are getting.
- **Secondary (Download SVG, Share, Copy link):** Surface-raised fill, `border-strong` stroke, text-primary label, 44px tall, 12px radius. Icon precedes label.
- **Hover:** `background-color` shift at 150ms ease. Primary darkens toward #8B4020; secondary shifts to `surface-inset`.
- **Focus:** 2px `focus-ring` ring with 2px `surface` offset, applied via `focus-visible` only.
- **Disabled:** 50% opacity, `cursor-not-allowed`, and the *same* fill and text as the enabled state. One disabled vocabulary, never a per-button variant. When a whole action group is disabled, say why once beneath it rather than leaving dead buttons unexplained.

> **No Button component.** `Button.tsx` existed but was never imported: it could not express the pill primary above, so every button was hand-rolled around it. It was removed. Compose buttons from the recipes here; if a primitive is reintroduced it must be able to produce the primary.

### Chips / Pills

- **Style:** 18px (or full) radius, 36px tall. Equal-width flex siblings sharing the container.
- **Active:** Terracotta fill, action-fg text, 600 weight.
- **Inactive:** Surface-inset fill, text-primary, 400–500 weight.
- **Transition:** 150ms ease on `background-color` and `color`.
- **Used for:** Error Correction Level (4 pills), Pixel Pattern (8 pills), Content Mode (8 pills).

### Cards / Containers

- **Corner Style:** 12px radius.
- **Background:** `surface-overlay` (light) / `surface-raised` (dark).
- **Border:** `border-strong`, 1px inside.
- **Shadow:** `card-ambient` — two-layer ambient lift (see Elevation).
- **Padding:** 32px all sides; 40px column gap.

### Inputs / Fields

- **Style:** Surface-inset background, `border-strong` stroke (1px), 8px radius, 44px tall, 12px horizontal padding.
- **Focus:** Border shifts to `focus-ring`; 2px ring at 25% opacity.
- **Error:** Border and ring shift to `error`; error message below in 12px `text-error`.
- **Placeholder:** `text-disabled` color.

### Textarea

The multiline sibling of the input — same surface, stroke, radius, and focus vocabulary, sized by `rows` instead of a fixed height. Used for the collapsible optional message bodies (email, SMS, calendar-event description).

- **Style:** Inherits the Inputs / Fields treatment (surface-inset fill, `border-strong` stroke, 8px radius, 12px horizontal padding) with `resize-none` and 3 rows by default.
- **Focus / Error / Placeholder:** Identical to Inputs / Fields, including the `focus-visible` ring and the `error`-colored border + message.
- **Labelling:** Carries the same optional `label` / `helperText` / `error` API as the input. In the content forms it ships label-less, named instead by its collapsible toggle button via `aria-labelledby`.

### Navigation

- **Navbar:** `surface-overlay` fill, `border-subtle` bottom border. 16px vertical / 48px horizontal padding. Wraps (`flex-wrap`) so its controls stay on screen at 200% text size — `Layout` clips horizontal overflow, so anything pushed out is lost, not scrollable. **No `backdrop-blur`:** it is a resting surface (see Do's and Don'ts).
- **Brand:** `BrandMark` (22px inline SVG: the three QR finder patterns plus four data modules, drawn in `currentColor` = `text-primary`) + "QR Code Generator" (18px, 600) + subtitle (13px, `text-secondary`, hidden below `sm`). The mark is `aria-hidden`, so the `<h1>` announces the name alone. It is deliberately **not** terracotta: chrome present on every view would spend the accent budget permanently.
- **Icon Buttons:** Circular (44×44px), `surface-raised` fill, `border-strong` stroke, `text-secondary` icons (18×18px). Theme toggle (sun/moon) and language toggle (globe).

### Color Picker (Signature Component)

An inline control: a 44px inset box containing a 20px color circle and a Geist Mono hex label. The native `<input type="color">` sits full-coverage at 0 opacity as the interactive layer; the visual is entirely custom. Used for foreground and background color selection.

### Callout (Warning Block)

A framed caution block for non-blocking warnings: payload-too-long, weak Wi-Fi security, missing country code, and similar soft alerts. Tone is fixed to warning — no info/success variants. If new tones are ever needed, add a variant prop; never a second component.

- **Structure:** Horizontal flex, 8px radius, 12px padding, 8px gap. Leading `TriangleAlert` icon (16–18px, aria-hidden). Optional bold title above the body text. Optional dismiss button at the trailing edge.
- **Color:** `warning-surface` (#FAF3E6) background, `warning-border` (#D4A850) full-perimeter border (1px), `warning` (#7C4A18) text and icon.
- **Dismiss button:** 8px radius, 10px padding, `hover:bg-warning-border/20`, `focus-visible:ring-2 focus-visible:ring-focus-ring`.
- **Semantics:** `role="alert"` (assertive) by default; pass `role="status"` for non-urgent updates.

### Fused Input Group (Phone Number Field)

A country dial-code selector and text input joined at their shared border into a single visual unit. The selector has a flat right edge and no right border; the input has a flat left edge and no left border. A z-index wrapper (`z-[1]`, `focus-within:z-10`) on the input ensures its focus ring renders above the selector when focused.

- **Grouping:** `role="group"` on the outer wrapper, `aria-labelledby` pointing at the shared visible label. The label keeps `htmlFor` for the text input so click-to-focus still works, while the AT group announcement covers both controls.
- **Sizing:** Both elements are 44px tall, matching all other inputs in the system.

### CountryCodeSelect (Signature Component)

A searchable country dial-code picker following the ARIA combobox pattern. Designed to fuse to the left edge of a phone input but reusable standalone via the `className` prop.

- **Trigger:** Surface-inset fill, `border-strong` stroke (1px), rounded left corners only (8px), 44px tall, 12px horizontal padding. Shows the selected country's emoji flag + dial code when populated; "Country" placeholder in `text-secondary` when empty. ChevronDown icon (15px) rotates 180° when open. `focus-visible:ring-2`.
- **Popover:** 288px wide (`w-72`), left-aligned below the trigger (`top-full mt-1.5`), `z-20`. Surface-raised fill, `border-subtle` full-perimeter stroke (1px), 12px radius, `shadow-md`. Entry and exit both fade at 150ms opacity via `@starting-style`; the DOM element persists for 150ms after close to complete the exit fade before unmounting (`visible`/`open` dual-state pattern).
- **Search:** Surface-inset input with `border-strong` stroke, 8px radius, 36px tall. 14px `Search` icon absolutely positioned at the leading edge. `focus-visible:` ring convention.
- **List:** `max-h-64`, scrollable, 4px padding. Each row: emoji flag + localized country name + trailing dial code, 32px tall (`py-2`). Selected country shows a 15px `Check` icon in `text-action`. The keyboard-highlighted row and the selected row share `bg-surface-inset` — both states visible simultaneously.
- **Keyboard:** Arrow keys navigate; `Enter` selects and closes; `Escape` closes and refocuses the trigger; `Tab` away closes without refocus (preserves natural document order).
- **`aria-live="polite"`** on the listbox announces the empty-results message to screen readers when the filter returns no matches.

### Batch Mapping Select (Signature Component)

The native `<select>` used throughout the Batch view's CSV column-mapping panel: content type, per-field column pickers, and the filename-column picker. It reuses the input vocabulary so the mapping panel reads as part of the same family, not a bolt-on.

- **Trigger:** `appearance-none` native select on a surface-inset fill, `border-strong` stroke (1px), 8px radius, `py-2` height, `pl-3 pr-9` padding (the right pad clears the chevron). A non-interactive `ChevronDown` (15px, `text-secondary`) is absolutely positioned at the trailing edge.
- **Label:** 12px (`text-xs`), 500 weight, `text-secondary`, sitting above the control. Required fields append a 0.5ch-offset `error`-colored asterisk (aria-hidden); the requiredness is also carried in the field model, not by color alone.
- **Focus:** Border shifts to `focus-ring`; 2px ring at 25% opacity (`focus-visible` only) — identical to Inputs.
- **Layout:** Pickers flow in a one- or two-column grid (`sm:grid-cols-2`) inside the mapping panel, which is a nested `surface-raised` block with a `border-subtle` stroke and 16px radius.

### List Drop Zone (Signature Component)

The Batch list textarea doubles as a file drop target for `.txt` / `.csv` import, mirroring the Import button's handler. The drop affordance is a transient overlay, not a persistent chrome element.

- **Structure:** A `relative` wrapper carries the drag handlers (not the textarea itself) so a drop still lands while the textarea is read-only during an active CSV mapping.
- **Drag-over overlay:** `absolute inset-0`, `pointer-events-none`, centered column layout. A 2px **dashed** `action` border, an `action`-tinted translucent fill (`surface-overlay/90`) with a light `backdrop-blur-sm`, an `Upload` glyph (20px), and the drop hint in `action`, 14px, 600 weight. It appears only while a file is dragged over the zone and is removed on drop or drag-leave.
- **Accessibility:** The overlay is `aria-hidden`; the **Import** button remains the keyboard and assistive-tech path. Drops are ignored while a batch is generating.

### Format & Layout Pills (Batch)

The Batch view reuses the **Chips / Pills** component (see above) for its mutually-exclusive choices rather than inventing new controls: output format (PNG / SVG / PDF / Labels), label-sheet layout preset (3 Avery-style options), and the captions on/off toggle. Same 36px height, full radius, terracotta active fill, 150ms transition.

### The Code Itself (the actual deliverable)

`PRODUCT.md`'s first principle is "The result is the product", and for a long time the QR was the one surface this system never touched: pure `#000000` on `#FFFFFF`, indistinguishable from any free generator's output. The chrome was the atelier; the artifact was a commodity.

The default output is now **warm ink on warm paper**: `#1A1612` on `#FAF6F1` (`DEFAULT_QR_CONFIG` in `src/data/defaults.ts`), the same ink and paper the rest of the product uses. A visitor who customizes nothing still leaves with something recognizably from this tool.

- **Concrete hex, never tokens.** These colors are baked into the exported PNG/SVG, which cannot read CSS variables, and must look identical whether the visitor generated them in light or dark UI. Everything that needs a color fallback derives it from `DEFAULT_QR_CONFIG` rather than repeating a literal.
- **Contrast is not negotiable.** 16.72:1 here, far above the ~4:1 scanners need. The contrast warning fires below 3:1. Any future change to the default must be checked against that floor first, because an unreadable code is not a design decision.
- **The logo backing disc follows the code's background**, not white. It exists to clear modules for the logo; a hard `#FFFFFF` plate on warm paper is a visible bright disc.

---

### Label Sheet (Output Format)

Not a screen component: the **Labels** format renders a single printable PDF instead of a ZIP, arranging codes in an Avery-style grid (3 presets: A4·3×7, A4·2×4, Letter·3×6). Each cell optionally prints a caption beneath the code — a readable field (Wi-Fi network name, contact full name, `lat,long`) when the source was a mapped CSV, falling back to the raw value otherwise. Geometry is pure points math in `labelSheetLayout.ts`; the render is jsPDF in `buildLabelSheetPdf.ts`.

## 6. Do's and Don'ts

### Do:
- **Do** use `var(--color-action)` for the active state of a segmented control, exactly one primary action per view, and focus rings. Nothing decorative (see The Terracotta Economy).
- **Do** build hierarchy from size and weight in the single system face. Geist Mono is for machine values only (hex codes, the batch list).
- **Do** use `surface-inset` (#E8DDD2) for all input backgrounds and inactive pill fills.
- **Do** keep every neutral warm — hue 48–68 in OKLCH. #F3EBE2 is not white. #1A1612 is not black.
- **Do** use full pill radius (9999px) for nav icon buttons, the Generate button, and segmented controls. Use 12px for inputs, cards, and download buttons.
- **Do** apply 150ms ease to all state transitions — faster feels abrupt, slower feels sluggish.
- **Do** maintain WCAG AA across both themes: 4.5:1 for text (SC 1.4.3) and 3:1 for control boundaries (SC 1.4.11). Placeholders and empty states are text and take `text-secondary`; `text-disabled` is only for genuinely inactive controls.
- **Do** give any hover- or focus-revealed panel an Escape dismiss and let the pointer travel into it (SC 1.4.13). The tooltip carries hover on its wrapper, not its trigger, for exactly this reason.
- **Do** reserve `backdrop-blur` for transient, functional overlays only — the batch file-drop affordance is the one sanctioned use. It signals an active drag state and disappears the moment the drag ends. This is the explicit exception to the no-decorative-blur rule below; never use blur for resting atmosphere.

### Don't:
- **Don't** use blue, purple, or cool-gray. Every neutral must sit on the warm side of neutral (hue 48–68 in OKLCH).
- **Don't** use `border-left` or `border-right` greater than 1px as a colored accent stripe. Rewrite with full borders, background tints, or nothing.
- **Don't** use gradient text (`background-clip: text` with a gradient). Use solid color; emphasis comes from weight and size.
- **Don't** dim a region with opacity to mark it secondary. It reads as disabled, it does not gate anything, and it drags every nested token below contrast. Use the rule, the heading, and spacing.
- **Don't** assemble from a generic SaaS kit — no blue primary, no card grid, no `rounded-xl` everything from a template.
- **Don't** use neon accents or dark backgrounds with glowing effects. This signals "developer tool" and excludes the primary audience.
- **Don't** build dense, gray, data-heavy UI. This is for everyday users, not IT admins.
- **Don't** use glassmorphism, decorative blurs, or gradient layering for atmosphere.
- **Don't** introduce a shadow heavier than `card-ambient` (0 2px 4 + 0 12px 32) except on the export modal.
- **Don't** go overdesigned or maximalist — too many animations and layered effects make this feel like a portfolio piece rather than something useful.
