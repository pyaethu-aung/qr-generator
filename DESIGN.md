# Design Reference

Source file: `design.pen` (two frames — Light Theme and Dark Theme, each 1440 px wide).

---

## Page Structure

```
<html>                    (.dark toggles dark mode)
└── Navbar
└── Hero
└── Card Wrapper
    └── Card (two-column)
        ├── Left Column — Configuration
        └── Right Column — Preview
└── Footer
```

---

## Navbar

| Property | Value |
|---|---|
| Fill | `$surface-overlay` |
| Border | `$border-subtle`, 1 px, bottom only |
| Padding | 16 px (vertical) × 48 px (horizontal) |
| Layout | Row, `justify: space-between`, `align: center` |

**Left — brand block** (vertical layout, 2 px gap)

- Title row (8 px gap, center-aligned):
  - ✨ glyph — 22 px, `$text-primary`
  - "QR Code Generator" — `$font-heading`, 18 px, 600, `$text-primary`
- Subtitle — "Generate & customize QR codes instantly" — `$font-family`, 13 px, `$text-secondary`

**Right — icon buttons** (8 px gap)

Two circular icon buttons (36 × 36 px, `$surface-raised`, 9999 radius, `$border-subtle` stroke):

| Frame | Light icon | Dark icon |
|---|---|---|
| Theme toggle | `sun` (lucide) | `moon` (lucide) |
| Language | `globe` (lucide) | `globe` (lucide) |

Icons are 18 × 18 px, `$text-secondary`.

---

## Hero

| Property | Value |
|---|---|
| Layout | Vertical, `align: center` |
| Padding | 64 top / 48 right / 32 bottom / 48 left |
| Gap | 12 px (light) / 8 px (dark) |

Children:

1. **Eyebrow** — "QUICK & EASY" — `$font-caption`, 10 px, 700, letter-spacing 2–3, `$action`
2. **Heading** — "Create Custom QR Codes" — `$font-heading`, 36 px, 700, `$text-primary`
3. **Body** — "Customize colors, patterns, and error correction — for perfect QR codes every time." — `$font-family`, 16 px, `$text-secondary`

---

## Card Wrapper

Padding: 0 (vertical) × 170 px (horizontal); centers the card inside the full-width section.

---

## Card

| Property | Value |
|---|---|
| Fill | `$surface-overlay` (light) / `$surface-raised` (dark) |
| Corner radius | 12 px |
| Border | `$border-strong`, 1 px, inside |
| Shadows | `#00000008` 0 2 4 + `#0000000f` 0 12 32 |
| Padding | 32 px all sides |
| Gap | 40 px (between columns) |
| Layout | Row (two equal-width columns) |

---

## Left Column — Configuration

Vertical layout, 20 px gap, fills available width.

### Section header

- Label — "CONFIGURATION" — `$font-caption`, 11 px, 600, letter-spacing 1.5–2, `$text-secondary`
- Title — "Settings" — `$font-heading`, 24 px, 700 (light) / 600 (dark), `$text-primary`

### Content input

Label: "Content" — 13 px, 600, `$text-primary`

Input box (44 px tall, corner-radius 12 px light / 8 px dark, `$surface-inset`, `$border-subtle`):
- Placeholder — "Enter URL or text..." — 14 px, `$text-disabled`

### Error Correction Level

Label: "Error Correction Level" — 13 px, 600

Pill row (8 px gap, equal-width pills, 36 px tall, corner-radius 18 px light / 9999 dark):

| Pill | Active state | Inactive state |
|---|---|---|
| L 7% | `$action` fill, `$action-fg` text, 600 | `$surface-inset`, `$text-secondary` |
| **M 15%** | ← default selected | — |
| Q 25% | — | `$surface-inset`, `$text-secondary` |
| H 30% | — | `$surface-inset`, `$text-secondary` |

### Color Pickers

Row layout, 16 px gap, two equal-width groups.

Each group (vertical, 8 px gap):
- Label — 13 px, 600
- Box (44 px tall, corner-radius 12 px light / 8 px dark, `$surface-inset`, `$border-subtle`, 12 px horizontal padding, 10 px gap):
  - Color circle — 20 px (light) / 22 px (dark) ellipse
  - Hex string — Geist Mono, 13 px, 500, `$text-primary`

| Group | Light default | Dark default |
|---|---|---|
| Foreground | `#000000` | `#FFFFFF` |
| Background | `#FFFFFF` (+ `$border-subtle` ring) | `#0F172A` (+ `$border-subtle` ring) |

### Eye Shape

Label: "Eye Shape" — 13 px, 600

Dropdown box (44 px tall, corner-radius 12 px light / 8 px dark, `$surface-inset`, `$border-subtle`, `justify: space-between`):
- "Square" — 14 px, `$text-primary`
- `chevron-down` lucide icon 16 × 16, `$text-secondary` (both themes)

### Pixel Pattern

Label: "Pixel Pattern" — 13 px, 600

Two equal-width pills (36 px tall, fill-container, corner-radius 18 px light / 9999 dark):

| Pill | Active | Inactive |
|---|---|---|
| Square | `$action` fill, `$action-fg` text, 600 | — |
| Dots | — | `$surface-inset`, `$text-secondary` |

Square is selected by default.

### Generate Button

Full-width, 48 px tall, corner-radius 24 px (light) / 9999 (dark), `$action` fill.

`zap` lucide icon (18 × 18, `$action-fg`) + "Generate QR Code" — both themes:
- Light: 15 px, 700, `$action-fg`
- Dark: 15 px, 600, `$action-fg`

### Download Buttons

Row, 12 px gap, two equal-width buttons (44 px light / 42 px dark tall, corner-radius 12 px light / 8 px dark, `$surface-raised`, `$border-subtle`).

`download` lucide icon 16 × 16 (`$text-secondary`) + label — both themes:
- Light: 14 px, 600, `$text-primary`
- Dark: 14 px, 500, `$text-primary`

---

## Right Column — Preview

Vertical layout, 20 px gap, fills available width (and height in dark).

### Section header

- Label — "LIVE PREVIEW" — `$font-caption`, 11 px, 600, letter-spacing 1.5–2, `$text-secondary`
- Title — "Preview" — `$font-heading`, 24 px, 700 (light) / 600 (dark), `$text-primary`

### Preview area

| Property | Light | Dark |
|---|---|---|
| Height | 536 px fixed | fill container |
| Fill | `$surface-inset` | `$surface-inset` |
| Corner radius | 16 px | 12 px |
| Border | `$border-subtle`, 1 px | `$border-subtle`, 1 px |
| Shadow | — | `#00000020` 0 2 8 outer |
| Layout | Vertical, center/center | Vertical, center/center |
| Gap | 16 px | — |

**QR code card** (reusable component `jTNVY`, 220 × 220 px):
- Fill: `#FFFFFF`
- Corner radius: 8 px
- Padding: 16 px
- Inner content area: 188 × 188 px, free layout
- Contains the QR pattern (3 finder eyes + data modules at 8 px grid)

### Share button

Full-width, 42 px tall, `$surface-raised`, corner-radius 12 px, `$border-subtle`, row/center:
- `share-2` lucide icon 16 × 16 px, `$text-secondary`
- "Share QR Code" — 14 px, 500, `$text-primary`

---

## Footer

| Property | Value |
|---|---|
| Height | 64 px |
| Border | `$border-subtle`, 1 px, top only |
| Padding | 24 px vertical |
| Layout | Row, `justify: center`, `align: center` |

Text: "Made with ♡ — QR Code Generator" — `$font-family`, 14 px, `$text-secondary`

---

## Design Tokens

### Color values

| Token | Light | Dark |
|---|---|---|
| `$surface` | `#F3EBE2` | `#1A1612` |
| `$surface-raised` | `#FAF6F1` | `#2A2420` |
| `$surface-overlay` | `rgba(243, 235, 226, 0.70)` | `rgba(42, 36, 32, 0.70)` |
| `$surface-inset` | `#E8DDD2` | `rgba(255, 255, 255, 0.05)` |
| `$text-primary` | `#1A1A1A` | `#F3EBE2` |
| `$text-secondary` | `#6B6B6B` | `#A89E93` |
| `$text-disabled` | `#9B9080` | `#5C544C` |
| `$border-subtle` | `#C5BEB6` | `rgba(255, 255, 255, 0.10)` |
| `$border-strong` | `#A89E93` | `rgba(255, 255, 255, 0.18)` |
| `$action` | `#D4916E` | `#D4916E` |
| `$action-fg` | `#FFFFFF` | `#1A1612` |
| `$action-disabled` | `#E8C5B3` | `#6B4B38` |
| `$focus-ring` | `#D4916E` | `#D4916E` |
| `$error` | `#C53030` | `#F87171` |
| `$error-surface` | `#FEF2F2` | `rgba(155, 27, 27, 0.20)` |
| `$error-border` | `#FECACA` | `rgba(155, 27, 27, 0.50)` |
| `$accent-secondary` | `#C4CFDE` | `#4A5568` |

### Token roles

| Token | Role |
|---|---|
| `$surface` | Page background |
| `$surface-overlay` | Navbar / card surface (light); semi-transparent overlay |
| `$surface-raised` | Card (dark), icon buttons, download buttons |
| `$surface-inset` | Inputs, preview area, inactive pills |
| `$text-primary` | Default text |
| `$text-secondary` | Labels, icons, muted text |
| `$text-disabled` | Placeholder text |
| `$border-subtle` | Most borders |
| `$border-strong` | Card outer border |
| `$action` | Brand accent — primary buttons, active pills, eyebrow text |
| `$action-fg` | Text/icons on `$action` backgrounds |
| `$action-disabled` | Disabled state of action elements |
| `$focus-ring` | Keyboard focus indicator |
| `$error` | Error text and icon |
| `$error-surface` | Error message background |
| `$error-border` | Error field border |
| `$accent-secondary` | Secondary accent (not used in main UI) |

### Typography

| Token | Font family |
|---|---|
| `$font-family` | Inter |
| `$font-heading` | Playfair Display |
| `$font-caption` | Geist |

Hex labels (color pickers) use **Geist Mono** directly (not a theme token).

---

## Spacing Reference

| Context | Value |
|---|---|
| Card padding | 32 px |
| Column gap (card) | 40 px |
| Section-item gap | 8 px |
| Field group gap | 20 px |
| Color picker gap | 16 px |
| Download button gap | 12 px |
| Navbar padding | 16 × 48 px |
| Hero padding | 64 / 48 / 32 / 48 px |
| Card wrapper horizontal padding | 170 px |
