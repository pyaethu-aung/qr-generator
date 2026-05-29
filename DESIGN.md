---
name: QR Generator
description: Craft custom QR codes — warm, considered, done in under a minute.
colors:
  action: "#A04D28"
  action-fg: "#FFFFFF"
  action-disabled: "#E8C5B3"
  surface: "#F3EBE2"
  surface-raised: "#FAF6F1"
  surface-inset: "#E8DDD2"
  text-primary: "#1A1A1A"
  text-secondary: "#6B6B6B"
  text-disabled: "#706860"
  border-subtle: "#C5BEB6"
  border-strong: "#A89E93"
  error: "#C53030"
  error-surface: "#FEF2F2"
  warning: "#7C4A18"
  warning-surface: "#FAF3E6"
  focus-ring: "#A04D28"
typography:
  display:
    fontFamily: "Inter, Segoe UI, system-ui, sans-serif"
    fontSize: "36px"
    fontWeight: 700
    lineHeight: 1.2
  title:
    fontFamily: "Inter, Segoe UI, system-ui, sans-serif"
    fontSize: "24px"
    fontWeight: 700
    lineHeight: 1.3
  body:
    fontFamily: "Inter, Segoe UI, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Inter, Segoe UI, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 600
    lineHeight: 1.4
  caption:
    fontFamily: "Inter, Segoe UI, system-ui, sans-serif"
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

This system rejects the interchangeable. There is no blue primary, no card grid, no SaaS-cream background. Playfair Display headings give the configuration panel the quiet authority of a well-labeled workshop drawer. Inter handles the functional work without noise. The sand surface (#F3EBE2) is never purely neutral — it is always slightly warm, always hinting at the material world.

Interaction is brief and purposeful. The user arrives with a URL, leaves with a QR code they are not embarrassed by. The tool does not perform. It does.

**Key Characteristics:**
- Warm earthy palette: sand, linen, oatmeal neutrals anchored by a single terracotta accent
- Editorial typography: Playfair Display for authority, Inter for function, Geist Mono for precision
- Dual theme: light mode is warm afternoon light; dark mode is a dim workshop at dusk
- Pill-shaped controls: segmented options feel tactile, not digital
- Settled and warm: controls feel planted — no floating, no over-animation
- 150ms transitions: state changes feel immediate, not harsh

## 2. Colors: The Terracotta Palette

A restrained palette built on warm neutrals with a single terracotta accent. Every surface sits on the warm side of neutral — hues in the 48–68 range in OKLCH. All color tokens are CSS custom properties in `src/index.css`; `:root.dark` overrides each with dark-mode equivalents.

### Primary

- **Terracotta** (#A04D28, dark: #D4916E): The brand accent. Used on the Generate button, active pills, section eyebrow text, and focus rings. At most three elements per view carry this color.
- **Action Foreground** (#FFFFFF, dark: #1A1612): Text and icons on terracotta surfaces.
- **Action Disabled** (#E8C5B3, dark: #6B4B38): Disabled state of action elements.

### Neutral

- **Warm Sand** (#F3EBE2, dark: #1A1612): Page background. Never pure white; the warmth carries through every surface.
- **Pale Linen** (#FAF6F1, dark: #2A2420): Cards, navbar, raised surfaces — one step lighter than sand.
- **Oatmeal** (#E8DDD2, dark: rgba(255,255,255,0.05)): Inputs, inactive pills, preview area — the inset well.
- **Inkwell** (#1A1A1A, dark: #F3EBE2): Primary text.
- **Driftwood** (#6B6B6B, dark: #A89E93): Secondary text, icons, muted labels.
- **Fog** (#706860, dark: #5C544C): Placeholder and disabled text.
- **Pale Stone** (#C5BEB6, dark: rgba(255,255,255,0.10)): Most dividers and subtle borders.
- **Warm Slate** (#A89E93, dark: rgba(255,255,255,0.18)): Card outline and strong borders.

### Tertiary

- **Clay Red** (#C53030, dark: #F87171): Error states only — field borders, error messages, destructive feedback.
- **Ember** (#7C4A18, dark: #D4A850): Warning states — readability risk alerts, caution notices.

### Named Rules

**The Terracotta Economy.** The action color appears on at most three elements per view: the active pill, the Generate button, and the hero eyebrow. Its rarity is the point. A fourth terracotta element devalues all of them.

**The Warm Neutral Rule.** No surface is pure gray or pure white. Every neutral is tinted toward the warm hue family (48–68 in OKLCH). #F3EBE2 is not white. #1A1612 is not black. Tinting is non-negotiable.

## 3. Typography

**Body Font:** Inter (with Segoe UI, system-ui, sans-serif fallback) — the only typeface in the current build
**Mono Font:** Geist Mono (loaded via Google Fonts — hex values in the color picker only)

> **Implementation note:** Playfair Display (the intended heading font from `design.pen`) is not yet loaded. All headings currently use Inter 700. When added, it applies to Display and Title roles only. This section reflects what is built.

**Character:** Inter carries the full UI — from hero headline to form labels. Hierarchy comes entirely from size and weight contrast: 700 for display and titles, 600 for labels and eyebrows, 400 for body copy. It's functional and clear, which suits the non-technical audience. The eyebrow captions compensate for the single-font system with aggressive uppercase tracking, giving sections visual anchoring without a second typeface.

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

**The Inter-Only Rule (current).** Playfair Display is not in the current build. When it is added for the redesign, it applies to Display and Title roles only — never to labels, buttons, pills, or captions, and never below 18px.

## 4. Elevation

Depth is conveyed primarily through tonal layering: `surface` (page) → `surface-raised` (card, navbar) → `surface-inset` (inputs, pills, preview). Controls are flat at rest. The main card and modal get lift from ambient shadows; everything else relies on surface contrast.

### Shadow Vocabulary

- **card-ambient** (`0 2px 4px rgba(0,0,0,0.031), 0 12px 32px rgba(0,0,0,0.059)`): Main two-column card. Two-layer ambient shadow for grounded depth. The heaviest structural shadow in the system.
- **button-lift** (`shadow-sm`): Primary and secondary buttons at rest. Subtle ground contact only.
- **tooltip** (`shadow-md`): Tooltip and inline popovers.
- **modal** (`shadow-2xl`): Export modal — the only surface that fully lifts above the page.
- **preview-inset-dark** (`0 2px 8px rgba(0,0,0,0.125)`): Preview area in dark mode. Reinforces the inset well.

### Named Rules

**The Flat-By-Default Rule.** Controls (pills, inputs, dropdowns) are flat at rest. Shadow is a structural signal, not decoration. New components must not introduce a shadow heavier than `card-ambient` unless they genuinely float above all other surfaces (modal, tooltip).

## 5. Components

**Overall feel:** Settled and warm. Controls feel planted — pill-shaped edges soften the UI without making anything feel floating or ungrounded. The terracotta accent appears sparingly. Every touch target is 36–48px tall.

### Buttons

- **Shape:** Pill (9999px radius) for primary. Gently rounded (12px) for secondary, download, and share buttons.
- **Primary (Generate QR Code):** Terracotta fill, white text, full-width, 48px tall, inline zap icon, 700 weight.
- **Secondary (Download, Share):** Surface-raised fill, `border-subtle` stroke, text-primary label, 44px tall. Icon precedes label in `text-secondary`.
- **Hover:** `background-color` shift at 150ms ease. Primary darkens toward #8B4020; secondary shifts to `surface-inset`.
- **Focus:** 2px `focus-ring` ring with 2px `surface` offset, applied via `focus-visible` only.
- **Disabled:** 50% opacity, `cursor-not-allowed`.

### Chips / Pills

- **Style:** 18px (or full) radius, 36px tall. Equal-width flex siblings sharing the container.
- **Active:** Terracotta fill, action-fg text, 600 weight.
- **Inactive:** Surface-inset fill, text-primary, 400–500 weight.
- **Transition:** 150ms ease on `background-color` and `color`.
- **Used for:** Error Correction Level (4 pills), Pixel Pattern (2 pills), Content Mode (4 pills).

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

### Navigation

- **Navbar:** `surface-overlay` fill, `border-subtle` bottom border. 16px vertical / 48px horizontal padding.
- **Brand:** Sparkle glyph (22px) + "QR Code Generator" (18px, 600, Playfair Display) + subtitle (13px, `text-secondary`).
- **Icon Buttons:** Circular (36×36px), `surface-raised` fill, `border-subtle` stroke, `text-secondary` icons (18×18px). Theme toggle (sun/moon) and language toggle (globe).

### Color Picker (Signature Component)

An inline control: a 44px inset box containing a 20px color circle and a Geist Mono hex label. The native `<input type="color">` sits full-coverage at 0 opacity as the interactive layer; the visual is entirely custom. Used for foreground and background color selection.

## 6. Do's and Don'ts

### Do:
- **Do** use `var(--color-action)` for the primary CTA, active pills, section eyebrow text, and focus rings only — three elements per view at most.
- **Do** pair Playfair Display headings with Inter body copy. Never use Playfair Display below 18px or in labels, buttons, or pill text.
- **Do** use `surface-inset` (#E8DDD2) for all input backgrounds and inactive pill fills.
- **Do** keep every neutral warm — hue 48–68 in OKLCH. #F3EBE2 is not white. #1A1612 is not black.
- **Do** use full pill radius (9999px) for nav icon buttons, the Generate button, and segmented controls. Use 12px for inputs, cards, and download buttons.
- **Do** apply 150ms ease to all state transitions — faster feels abrupt, slower feels sluggish.
- **Do** maintain WCAG AA contrast across both light and dark themes on all text and interactive states.

### Don't:
- **Don't** use blue, purple, or cool-gray. Every neutral must sit on the warm side of neutral (hue 48–68 in OKLCH).
- **Don't** use `border-left` or `border-right` greater than 1px as a colored accent stripe. Rewrite with full borders, background tints, or nothing.
- **Don't** use gradient text (`background-clip: text` with a gradient). Use solid color; emphasis comes from weight and size.
- **Don't** assemble from a generic SaaS kit — no blue primary, no card grid, no `rounded-xl` everything from a template.
- **Don't** use neon accents or dark backgrounds with glowing effects. This signals "developer tool" and excludes the primary audience.
- **Don't** build dense, gray, data-heavy UI. This is for everyday users, not IT admins.
- **Don't** use glassmorphism, decorative blurs, or gradient layering for atmosphere.
- **Don't** introduce a shadow heavier than `card-ambient` (0 2px 4 + 0 12px 32) except on the export modal.
- **Don't** go overdesigned or maximalist — too many animations and layered effects make this feel like a portfolio piece rather than something useful.
