# Data Model: Update Website Design

**Feature**: Update Website Design | **Date**: 2026-05-07

This is a UI-only feature. No database entities, no API payloads, and no new state shape are introduced. All existing data flows remain unchanged.

## Affected State (no shape changes)

| State / Hook | Owner | Change |
|---|---|---|
| `theme` (`'light' \| 'dark'`) | `useTheme` / `ThemeProvider` | No change; `ThemeToggle` now shows Lucide SVG instead of emoji |
| `locale` (`SupportedLocale`) | `useLocale` / `LocaleProvider` | No change; `LanguageToggle` now shows globe icon instead of text |
| `ecLevel` (`QRErrorCorrectionLevel`) | `useQRGenerator` | No change; control changes from `<select>` to pill row |
| `pixelPattern` (`QRPixelPattern`) | `useQRDesign` | No change; control changes from `<select>` to pill toggle |
| `inputFgColor` / `inputBgColor` | `useQRGenerator` | No change; color picker is restyled, not rewired |

## Design Token Mapping (reference)

The following CSS custom properties are already defined in `src/index.css` and drive all visual changes:

| Token | Light value | Dark value | Used for |
|---|---|---|---|
| `--color-surface` | `#ffffff` | `#020617` | Page background |
| `--color-surface-raised` | `#f8fafc` | `#0f172a` | Card, secondary surfaces |
| `--color-surface-overlay` | `rgba(255,255,255,0.7)` | `rgba(15,23,42,0.7)` | Navbar, main card fill |
| `--color-surface-inset` | `#f1f5f9` | `rgba(255,255,255,0.05)` | Inputs, preview area, inactive pills |
| `--color-text-primary` | `#0f172a` | `#f8fafc` | Default text |
| `--color-text-secondary` | `#475569` | `#94a3b8` | Labels, icons, muted text |
| `--color-text-disabled` | `#94a3b8` | `#4b5563` | Placeholder text |
| `--color-border-subtle` | `rgba(0,0,0,0.08)` | `rgba(255,255,255,0.08)` | Most borders |
| `--color-border-strong` | `#cbd5e1` | `rgba(255,255,255,0.18)` | Card outer border |
| `--color-action` | `#4f46e5` | `#38bdf8` | Primary accent; active pill fill; Generate btn |
| `--color-action-fg` | `#ffffff` | `#020617` | Text on action backgrounds |

No token values change as part of this feature. The token names match the design.pen `$`-prefixed variables.

## No New Entities

This feature introduces no new TypeScript types, interfaces, or Zod schemas. All type definitions in `src/types/` remain unchanged.
