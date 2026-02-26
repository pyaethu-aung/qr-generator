# Research: Semantic Design Token System

**Branch**: `022-semantic-design-tokens` | **Date**: 2026-02-26

---

## R-001: Tailwind v4 `@theme` Directive vs. `tailwind.config.js`

**Decision**: Use `@theme` directive inside `src/index.css` exclusively. Do not extend `tailwind.config.js`.

**Rationale**: Tailwind v4 moves all design system configuration into CSS via the `@theme` directive. The project already imports Tailwind via `@import 'tailwindcss'` in `index.css` (v4 syntax). Using `@theme` to map custom utility names to CSS variables is the v4-canonical approach and keeps all theming in one file — satisfying FR-001, FR-002, and SC-003 in a single location.

**How it works**:
```css
/* Define semantic CSS variables for each theme context */
:root {
  --color-surface: #ffffff;
  --color-text-primary: #0f172a;
}
:root.dark {
  --color-surface: #020617;
  --color-text-primary: #f8fafc;
}

/* Map Tailwind utilities to CSS variables using @theme */
@theme {
  --color-surface: var(--color-surface);
  --color-text-primary: var(--color-text-primary);
}
/* This generates: bg-surface, text-surface, border-surface, etc. */
```

**Alternatives considered**:
- `tailwind.config.js` `extend.colors` — rejected because it uses static hex values, not dynamic CSS variables, meaning dark mode still requires `dark:` variant classes.
- CSS-only solution (no Tailwind) — rejected because the project's component layer relies on Tailwind utilities throughout; replacing them entirely is out of scope.

---

## R-002: Token Naming Convention

**Decision**: Use `--color-<role>` for all colour tokens. Role names are semantic (what the element *is*), not visual (what colour it *looks like*).

**Rationale**: Semantic naming decouples token values from visual choices, enabling future themes to change colours without renaming tokens. The existing `--bg-primary`, `--text-primary` names must be migrated (FR-006).

**Final token taxonomy** (minimum required by FR-009):

| Token Name | Light Value | Dark Value | Role |
|---|---|---|---|
| `--color-surface` | `#ffffff` | `#020617` | Page/root background |
| `--color-surface-raised` | `#f8fafc` | `#0f172a` | Card/panel background |
| `--color-surface-overlay` | `rgba(255,255,255,0.7)` | `rgba(15,23,42,0.7)` | Frosted glass panels |
| `--color-surface-inset` | `#f1f5f9` | `rgba(255,255,255,0.05)` | Inset/inner-shadow areas |
| `--color-text-primary` | `#0f172a` | `#f8fafc` | Primary body text |
| `--color-text-secondary` | `#475569` | `#94a3b8` | Muted/secondary text |
| `--color-text-disabled` | `#94a3b8` | `#475569` | Disabled element text |
| `--color-border-subtle` | `rgba(0,0,0,0.1)` | `rgba(255,255,255,0.1)` | Hairline borders |
| `--color-border-strong` | `#cbd5e1` | `rgba(255,255,255,0.2)` | Visible UI borders |
| `--color-action` | `#4f46e5` | `#0ea5e9` | Primary CTA (indigo light / sky dark) |
| `--color-action-fg` | `#ffffff` | `#ffffff` | Text on action backgrounds |
| `--color-action-disabled` | `#c7d2fe` | `#0c4a6e` | Disabled primary action fill |
| `--color-focus-ring` | `#6366f1` | `#38bdf8` | Focus ring (meets WCAG AA 3:1) |
| `--color-link` | `#4f46e5` | `#818cf8` | Anchor text |
| `--color-error` | `#dc2626` | `#f87171` | Error text/border |
| `--color-error-surface` | `#fef2f2` | `rgba(153,27,27,0.2)` | Error message background |
| `--color-error-border` | `#fecaca` | `rgba(153,27,27,0.5)` | Error message border |

**Naming rules**:
- Prefix: always `--color-`
- No `dark` or `light` in the token name — theme is context, not name
- Hover/active states use Tailwind opacity modifiers (`bg-action/90`), NOT new tokens (R-005)

---

## R-003: ThemeProvider Initialization Strategy

**Decision**: Remove the temporary "force dark" workaround. Restore the original dynamic initialization: `localStorage` → `prefers-color-scheme` → `light` default.

**Current state**: `useTheme.ts` has a hardcoded `useState<Theme>('dark')` with the original dynamic logic commented out behind a TODO.

**Target state**:
```typescript
// Initialization order (FR-007 updated):
const [theme, setThemeState] = useState<Theme>(() => {
  if (!isBrowser) return 'light'
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'light' || stored === 'dark') return stored as Theme
  } catch (e) {
    console.warn('[theme] Could not read from localStorage', e)
  }
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
})
```

**Toggle restoration**: `toggleTheme` and `setTheme` must be fully restored (not no-ops). The `ThemeToggle` component's `aria-disabled="true"` and `opacity-50 cursor-not-allowed` must be removed so theme switching is live.

**Rationale**: The clarification session confirmed the initialization order (Q2). The temporary dark-only lock was a development shortcut; restoring dynamic behaviour is required by FR-007 (updated) and Constitution §VIII.

**Alternatives considered**:
- Keep the temporary lock, add `@media prefers-color-scheme` — rejected because it bypasses the user's manual toggle and contradicts the existing `ThemeProvider` class-application mechanism.

---

## R-004: Handling the `.app-shell` and `.card-surface` Component Classes

**Decision**: Migrate `.app-shell` and `.card-surface` in `index.css` from hardcoded Tailwind utilities to semantic token utilities. They become thin wrappers over `bg-surface` and `bg-surface-raised`.

**Current state** (`index.css`):
```css
.app-shell   { @apply min-h-screen bg-gradient-to-b from-slate-50 to-slate-100; }
.card-surface { @apply rounded-xl bg-white shadow-md ring-1 ring-slate-200; }
```

**Target state**: Replace with token utilities.
```css
.app-shell   { @apply min-h-screen bg-surface; }
.card-surface { @apply rounded-xl bg-surface-raised shadow-md ring-1 ring-border-subtle; }
```
Note: `Card.tsx` uses `bg-white ring-slate-200` directly — these are also migrated in Phase 3.

---

## R-005: Hover & Active State Strategy (Tailwind Opacity Modifiers)

**Decision**: All hover/active colour variations are expressed as `bg-action/90`, `bg-action/80` — Tailwind's built-in opacity modifier applied to the base action token — rather than discrete `--color-action-hover` tokens.

**Rationale (clarification Q5)**: Focus and disabled require discrete tokens because they have explicit WCAG AA contrast targets that must be independently validated. Hover/active are aesthetic variations of the base hue; opacity modifiers express the relationship naturally and reduce token surface by 2 entries.

**Mapping table** (replaces `dark:hover:bg-sky-500` etc.):

| Old class | New class |
|---|---|
| `hover:bg-indigo-500 dark:hover:bg-sky-500` | `hover:bg-action/90` |
| `active:bg-indigo-700 dark:active:bg-sky-700` | `active:bg-action/80` |
| `hover:bg-slate-100 dark:hover:bg-white/5` | `hover:bg-surface-raised/80` |

---

## R-006: Files Scope — All 15 Dark-Variant Files

The following 15 source files currently contain `dark:` Tailwind variant usage and require migration in Phase 3:

1. `src/App.tsx`
2. `src/components/common/Button.tsx`
3. `src/components/common/DimensionSelector.tsx`
4. `src/components/common/ExportModal.tsx`
5. `src/components/common/FormatSelector.tsx`
6. `src/components/common/Input.tsx`
7. `src/components/common/LanguageToggle.tsx`
8. `src/components/common/ThemeToggle.tsx`
9. `src/components/feature/qr/QRControls.tsx`
10. `src/components/feature/qr/QRGenerator.tsx`
11. `src/components/feature/qr/QRPreview.tsx`
12. `src/components/Layout/Layout.tsx`
13. `src/components/Navigation/Navbar.tsx`
14. `src/hooks/useQRGenerator.ts` *(svgExporter.ts if it contains theme logic)*
15. `src/utils/export/svgExporter.ts`

**Test files to update** (28 test files; only those asserting class names need changes):
- `Button.test.tsx`, `Input.test.tsx`, `ThemeToggle.test.tsx`, `useTheme.test.ts` are the highest-probability candidates for class-name assertions.

---

## R-007: Test Strategy for Class-Name Assertions

**Decision**: Grep all test files for `dark:` or raw Tailwind colour class strings before starting Phase 3. Update only the specific assertions that reference migrated class names. All other test behaviour remains identical.

**WCAG Validation**: Manual contrast check via browser DevTools or https://webaim.org/resources/contrastchecker is sufficient (SC-006). No automated axe-core integration is required for this refactor (it would be a separate accessibility feature).

**Vitest coverage target**: Maintain ≥85% per Constitution §II.

---

## R-008: `App.css` Handling

**Current state**: `src/App.css` contains minimal styles (`#root { ... }`). It does not contain `dark:` classes. No changes required to this file.

---

## R-009: Transition Implementation

**Decision (NF-002)**: Apply a global `transition` on `:root` targeting colour properties with `200ms ease`.

```css
:root {
  transition: background-color 200ms ease, color 200ms ease,
              border-color 200ms ease;
}
```

**Rationale**: Applying at `:root` means all token-consuming elements inherit the transition without needing per-component declarations. This replaces the scattered `transition-colors duration-300` utilities currently on every component (those can be removed or kept as they don't conflict).

**Note**: `@apply transition-colors duration-300` on `:root` in the current code will be replaced with an explicit CSS `transition` declaration to avoid Tailwind utility dependency in this specific location and to 
---

## Exceptions (FR-005)

The following UI elements are confirmed decorative gradients that are **exempt** from semantic token migration per FR-005. They retain their original Tailwind/CSS values even after the migration.

| Location | Element | Rationale |
|---|---|---|
| `src/components/Layout/Layout.tsx` | Background radial-gradient | Global brand background; subtle opacity shift already handles theme adjustment. |
| `src/components/feature/qr/QRGenerator.tsx` | Background gradient blobs (absolute divs) | Brand decorative blobs; opacity-20 (light) and opacity-60 (dark) already provide theme context. |
| `src/components/feature/qr/QRGenerator.tsx` | Glass panel shadow | Aesthetic shadow (`shadow-slate-200/50` vs `shadow-black/50`) linked to depth, not just surface color. |
