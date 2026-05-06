# Component API Contracts

**Feature**: Update Website Design | **Date**: 2026-05-07

This document records the prop-interface changes for components affected by the design update. All changes are additive or behavioural — no prop removals that would break callers.

---

## ThemeToggle

No prop changes. Internal rendering changes:
- Remove emoji span; render `<Sun>` or `<Moon>` from `lucide-react` (18×18)
- Button shape: `rounded-lg` → `rounded-full`
- Border: `border-border-strong` → `border-border-subtle`
- Background: `bg-surface-raised` (unchanged)
- Existing `aria-label` remains (already correct)

---

## LanguageToggle

No prop changes. Internal rendering changes:
- Remove text label span; render `<Globe>` from `lucide-react` (18×18)
- Button shape: `rounded-lg` → `rounded-full`
- Add border: `border border-border-subtle`
- Width/height: `h-9 w-9` (36×36)
- Existing `aria-label` (from `translate('locale.switchTo.*')`) remains

---

## QRControls

Prop interface is **unchanged**. Rendering changes only:

| Prop | Current rendering | New rendering |
|---|---|---|
| `ecLevel` / `onEcLevelChange` | `<select>` | Pill row of 4 `<button>` elements |
| `correctionOptions` | Options list for `<select>` | Labels for pill buttons |
| `pixelPattern` / `onPixelPatternChange` | `<select>` | Pill toggle: Square / Dots |
| `fgColor` / `bgColor` | Color swatch + hex label | Inset box (44px), circle + mono hex |
| `onGenerate` | `<Button>` text only | `<Button>` with `<Zap>` icon (18×18) preceding label |
| `onDownloadPng` / `onDownloadSvg` | Below divider, text only | Below Generate btn, `<Download>` icon (16×16) + label, no divider |

**Container change**: Remove the `rounded-2xl border bg-surface-raised/40 p-4 sm:p-6` wrapper div from `QRControls` — the parent `QRGenerator` left column provides the spatial context.

---

## QRPreview

Prop interface is **unchanged**. Rendering changes:

| Element | Current | New |
|---|---|---|
| Outer wrapper | `flex flex-col items-center p-3 sm:p-4 bg-surface-raised rounded-lg` | Removed — preview area is in parent |
| Preview area | Implicit (canvas fills card) | `h-[536px] md:h-[536px]` inset box in parent `QRGenerator` |
| QR canvas | Any size from `size` prop | Centered in white `rounded-lg p-4 bg-white` card (220×220 target) |
| Share button | Inside card, `rounded-full bg-action` | Below preview area in parent; `rounded-xl bg-surface-raised`, `<Share2>` icon |
| Download button | Inside card | Removed from `QRPreview`; lives in `QRControls` |

**Note**: The `shareControls` section currently renders both a download button and a share button. After this change, `QRPreview` renders only the share button (and status message); the download action moves entirely to `QRControls`.

---

## Navbar

No prop changes (stateless component). Rendering changes:
- Subtitle `<p>`: add `hidden sm:block`
- `<ThemeToggle>` and `<LanguageToggle>`: icon styling handled inside those components
- Padding class: `py-3 sm:py-5 px-4 sm:px-6 lg:px-8` → `py-4 px-6 sm:px-12`

---

## QRGenerator (layout container)

No prop changes. Rendering changes:

| Element | Current | New |
|---|---|---|
| Card corner radius | `rounded-[32px]` | `rounded-xl` (12px) |
| Card padding | `p-4 sm:p-6` | `p-8` |
| Column gap | `gap-8 lg:gap-10` | `gap-10` |
| Preview area wrapper | Inline `flex...justify-center rounded-2xl` div | `h-[536px]` inset box, auto on mobile |
| Hero section gap | `space-y-6` | `space-y-3` (12px) |
