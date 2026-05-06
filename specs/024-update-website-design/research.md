# Research: Update Website Design

**Branch**: `024-update-website-design` | **Date**: 2026-05-07

## Icon Library

**Decision**: Add `lucide-react` as a runtime dependency.

**Rationale**: The design.pen uses the Lucide icon family throughout (sun, moon, globe, zap, download, share-2, chevron-down). `lucide-react` is the official React binding — tree-shakeable, typed, and actively maintained. Each icon is an individual named export so unused icons are eliminated at build time.

**Alternatives considered**:
- Inline SVG paths: Zero dependency cost but requires manual path extraction and maintenance as icons evolve. Not worth the maintenance burden for 7 icons.
- `@heroicons/react`: Different icon family; would not match the design.

**Install**: `npm install lucide-react`

---

## Geist Mono Font

**Decision**: Load via Google Fonts `<link>` in `index.html`.

**Rationale**: Geist Mono is available on Google Fonts. A `<link rel="preconnect">` + `<link rel="stylesheet">` in `index.html` is the simplest approach with no build configuration changes. The font is only used for hex color labels — a low-usage case that does not justify adding `@fontsource/geist-mono` as a build-time dependency.

**Alternatives considered**:
- `@fontsource/geist-mono`: Build-time bundling, avoids external network at runtime. Acceptable but adds another devDependency for a single minor use case.
- System monospace fallback: No network cost, but does not match the design.

**Implementation**: Add to `index.html`:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Geist+Mono:wght@400;500&display=swap" rel="stylesheet">
```
Then add `font-['Geist_Mono']` Tailwind utility class where hex values appear.

---

## Theme Transition

**Decision**: Adjust transition from 200ms to 150ms on `:root`; verify `body` also inherits.

**Rationale**: The spec clarification specified ~150ms. The existing CSS has a 200ms transition on `:root` for `background-color`, `color`, and `border-color`. Reducing to 150ms matches the spec. The `body` inherits from `:root` for background; individual surface elements may need `transition-colors` Tailwind utility added if they set their own background.

**Alternatives considered**:
- Keep 200ms: Negligible UX difference; but the spec is explicit, so match it.
- JavaScript-driven transition: Unnecessary complexity — CSS is sufficient.

---

## Error Correction Level — Pill Row

**Decision**: Replace `<select>` with a pill button row (4 buttons).

**Rationale**: There are exactly 4 fixed options. A pill row provides immediate visual selection feedback matching the design, and all options are visible simultaneously — better discoverability than a dropdown. The `QRErrorCorrectionLevel` type already exists; the change is purely in the control UI.

**Implementation pattern**:
```tsx
{correctionOptions.map(({ value: optValue, label }) => (
  <button
    key={optValue}
    onClick={() => onEcLevelChange(optValue)}
    className={ecLevel === optValue
      ? 'bg-action text-action-fg font-semibold'
      : 'bg-surface-inset text-text-secondary'}
    ...
  >
    {label}
  </button>
))}
```

**Test impact**: `QRControls.test.tsx` needs to be updated — pill buttons are clicked via `screen.getByRole('button', { name: ... })` rather than `select` element changes.

---

## Pixel Pattern — Pill Toggle

**Decision**: Replace `<select>` with a 2-option pill toggle (Square / Dots).

**Rationale**: Same reasoning as EC Level pills; 2 fixed options are clearer as a toggle than a dropdown.

---

## Color Picker Box

**Decision**: Keep `<input type="color">` but render it hidden behind a colored circle. Show a styled inset box (44px tall) with the circle + monospace hex label, matching the design.

**Rationale**: The native color picker is cross-browser compatible and requires no additional library. The design shows a circle preview + hex text; the actual picker opens on click. The existing implementation already does this pattern but with a different layout — the box needs restyling.

**Hex label font**: `font-['Geist_Mono']` (added by research item above).

---

## Download Button Placement

**Decision**: Remove the "Download Formats" divider section from `QRControls` and place PNG/SVG buttons directly below the Generate button, with `download` icon from `lucide-react`.

**Rationale**: The design shows download buttons as part of the primary action flow (Generate → PNG/SVG), without a section divider or title. The `QRControls` component already receives `onDownloadPng` / `onDownloadSvg` props — this is a layout-only change.

---

## Navbar Subtitle Visibility

**Decision**: `hidden sm:block` on the subtitle `<p>` element.

**Rationale**: Tailwind's `hidden` sets `display: none`, `sm:block` restores it at ≥640px. This matches the clarified requirement (subtitle hidden on mobile, visible on tablet+).

---

## Circular Icon Buttons (ThemeToggle, LanguageToggle)

**Decision**: Restyle both as `h-9 w-9 rounded-full border border-border-subtle bg-surface-raised` with centered SVG icon from `lucide-react`.

**Rationale**: Design.pen shows 36×36 circular buttons with a subtle border. Both components already have `aria-label` attributes; no accessibility changes needed beyond verifying labels remain.

**ThemeToggle**: Replace emoji span with `<Sun>` / `<Moon>` from lucide-react (18×18, `text-text-secondary`).

**LanguageToggle**: Replace text label with `<Globe>` from lucide-react (18×18, `text-text-secondary`). The `aria-label` on the button already provides the accessible name.
