# Data Model: Semantic Design Token System

**Branch**: `022-semantic-design-tokens` | **Date**: 2026-02-26

This feature introduces no new runtime data models, database tables, or API entities.
The "data model" for this refactor is the **token vocabulary** — the canonical set of
CSS custom properties that constitute the design language.

---

## Token Entity

A **Design Token** is a named CSS custom property that encodes a semantic role rather
than a raw colour value. Each token exists in two contexts: `:root` (light) and
`:root.dark` (dark).

### Token Schema

```
Token {
  name:        string           // CSS custom property name, e.g. "--color-surface"
  light:       CSSColorValue    // Value when :root.dark is absent
  dark:        CSSColorValue    // Value when :root.dark is present
  role:        SemanticRole     // Human description of the token's purpose
  wcagPairing: TokenName[]      // Tokens it is commonly layered against (for contrast audits)
}
```

### State Transitions

Tokens are stateless by definition. Theme switching changes which *context block*
(`:root` vs `:root.dark`) is active — it does not change the token names or values.

```
User action: toggle theme
  → ThemeProvider adds/removes .dark on <html>
  → Browser re-evaluates :root.dark { ... } block
  → CSS variables resolve to dark values
  → All token-consuming utilities update via cascade
  (No JavaScript state change in token values themselves)
```

---

## Full Token Catalogue (Canonical)

These tokens are defined in `src/index.css` under `:root` (light defaults) and
overridden under `:root.dark`. They are the ONLY permitted source of colour values
across all component files after refactor completion.

### Surface Tokens

| CSS Variable | Light | Dark | Role |
|---|---|---|---|
| `--color-surface` | `#ffffff` | `#020617` | Root page / body background |
| `--color-surface-raised` | `#f8fafc` | `#0f172a` | Card, panel, control background |
| `--color-surface-overlay` | `rgba(255,255,255,0.7)` | `rgba(15,23,42,0.7)` | Frosted-glass containers |
| `--color-surface-inset` | `#f1f5f9` | `rgba(255,255,255,0.05)` | Inner-shadow / inset areas |

### Text Tokens

| CSS Variable | Light | Dark | Role |
|---|---|---|---|
| `--color-text-primary` | `#0f172a` | `#f8fafc` | Headings, body copy |
| `--color-text-secondary` | `#475569` | `#94a3b8` | Subtitles, helper text |
| `--color-text-disabled` | `#94a3b8` | `#4b5563` | Disabled-state text |

### Border Tokens

| CSS Variable | Light | Dark | Role |
|---|---|---|---|
| `--color-border-subtle` | `rgba(0,0,0,0.08)` | `rgba(255,255,255,0.08)` | Hairline separators |
| `--color-border-strong` | `#cbd5e1` | `rgba(255,255,255,0.18)` | Visible UI borders, inputs |

### Action / Interactive Tokens

| CSS Variable | Light | Dark | Role |
|---|---|---|---|
| `--color-action` | `#4f46e5` | `#0ea5e9` | Primary CTA colour |
| `--color-action-fg` | `#ffffff` | `#ffffff` | Text atop action backgrounds |
| `--color-action-disabled` | `#c7d2fe` | `#0c4a6e` | Disabled primary fill |

### Accessibility-Critical Tokens

| CSS Variable | Light | Dark | Role | WCAG Target |
|---|---|---|---|---|
| `--color-focus-ring` | `#6366f1` | `#38bdf8` | Keyboard-focus ring | ≥3:1 vs adjacent surface |

### Semantic Status Tokens

| CSS Variable | Light | Dark | Role |
|---|---|---|---|
| `--color-link` | `#4f46e5` | `#818cf8` | Anchor / hyperlink text |
| `--color-error` | `#dc2626` | `#f87171` | Error text |
| `--color-error-surface` | `#fef2f2` | `rgba(153,27,27,0.2)` | Error message background |
| `--color-error-border` | `#fecaca` | `rgba(153,27,27,0.5)` | Error message outline |

---

## Tailwind Utility Mapping (via `@theme`)

The `@theme` block in `src/index.css` maps Tailwind utility names to CSS variable
references. This is the bridge that lets components write `bg-surface` instead of
`bg-white dark:bg-gray-950`.

```css
@theme {
  --color-surface:          var(--color-surface);
  --color-surface-raised:   var(--color-surface-raised);
  --color-surface-overlay:  var(--color-surface-overlay);
  --color-surface-inset:    var(--color-surface-inset);
  --color-text-primary:     var(--color-text-primary);
  --color-text-secondary:   var(--color-text-secondary);
  --color-text-disabled:    var(--color-text-disabled);
  --color-border-subtle:    var(--color-border-subtle);
  --color-border-strong:    var(--color-border-strong);
  --color-action:           var(--color-action);
  --color-action-fg:        var(--color-action-fg);
  --color-action-disabled:  var(--color-action-disabled);
  --color-focus-ring:       var(--color-focus-ring);
  --color-link:             var(--color-link);
  --color-error:            var(--color-error);
  --color-error-surface:    var(--color-error-surface);
  --color-error-border:     var(--color-error-border);
}
```

**Generated utility examples**:
- `bg-surface` → `background-color: var(--color-surface)`
- `text-text-primary` → `color: var(--color-text-primary)`
- `border-border-subtle` → `border-color: var(--color-border-subtle)`
- `ring-focus-ring` → `--tw-ring-color: var(--color-focus-ring)`
- `bg-action/90` → action colour at 90% opacity (hover state)

---

## Component → Token Mapping

The following table documents which component properties map to which tokens,
serving as a migration guide for Phase 3.

| Component | Property | Old classes | New token utility |
|---|---|---|---|
| All | Background fills | `bg-white dark:bg-slate-900` | `bg-surface-raised` |
| All | Page background | `bg-white dark:bg-slate-950` | `bg-surface` |
| All | Primary text | `text-slate-900 dark:text-white` | `text-text-primary` |
| All | Secondary text | `text-slate-500 dark:text-slate-400` | `text-text-secondary` |
| All | Subtle borders | `border-black/5 dark:border-white/5` | `border-border-subtle` |
| All | Strong borders | `border-slate-200 dark:border-white/10` | `border-border-strong` |
| Button (primary) | Background | `bg-indigo-600 dark:bg-sky-600` | `bg-action` |
| Button (primary) | Text | `text-white` | `text-action-fg` |
| Button (primary) | Hover | `hover:bg-indigo-500 dark:hover:bg-sky-500` | `hover:bg-action/90` |
| Button (primary) | Active | `active:bg-indigo-700 dark:active:bg-sky-700` | `active:bg-action/80` |
| Button (primary) | Focus ring | `focus-visible:outline-indigo-500 dark:…sky-500` | `focus-visible:ring-focus-ring` |
| Button (secondary) | Background | `bg-white dark:bg-slate-900` | `bg-surface-raised` |
| Button (secondary) | Border | `border-slate-200 dark:border-white/10` | `border-border-strong` |
| Input | Background | `bg-white dark:bg-slate-950` | `bg-surface` |
| Input | Border | `border-slate-300 dark:border-white/10` | `border-border-strong` |
| Input | Focus ring | `focus:ring-indigo-500 dark:focus:ring-sky-500` | `focus:ring-focus-ring` |
| Input | Disabled fill | `bg-slate-100 dark:bg-slate-800` | `bg-action-disabled` |
| Input | Error border | `border-red-300 dark:border-red-500` | `border-error-border` |
| FormatSelector | Selected border | `border-slate-900 dark:border-sky-500` | `border-action` |
| FormatSelector | Selected bg | `bg-slate-50 dark:bg-sky-900/20` | `bg-action/10` |
| ExportModal | Modal bg | `bg-white dark:bg-slate-900` | `bg-surface-raised` |
| ExportModal | Error block | `bg-red-50 dark:bg-red-900/20` | `bg-error-surface` |
| ExportModal | Error border | `border-red-200 dark:border-red-900/50` | `border-error-border` |
| QRPreview | Placeholder bg | `bg-slate-50 dark:bg-slate-800/50` | `bg-surface-inset` |
| App.tsx | Footer border | `border-black/5 dark:border-white/5` | `border-border-subtle` |
| Navbar | Header border | `border-black/5 dark:border-white/10` | `border-border-subtle` |
| Navbar | Header bg | `bg-white/70 dark:bg-slate-950/70` | `bg-surface-overlay` |
| Layout | BG gradient | `dark:bg-[radial-gradient(…)]` | Handled via `--color-surface` |
| LanguageToggle | Border | `border-black/10 dark:border-white/30` | `border-border-subtle` |
| `a` element | colour | `text-indigo-600 dark:text-indigo-400` | `text-link` |

---

## Validation Rules

- Every token in the catalogue above MUST appear in both `:root` and `:root.dark` blocks.
- No component file may reference `dark:` Tailwind variant classes post-refactor
  (except `svgExporter.ts` if non-visual, or documented exceptions per FR-005).
- `--color-focus-ring` light and dark values must both pass 3:1 contrast ratio against
  `--color-surface-raised` (their typical adjacent surface).
- `--color-text-primary` in both themes must pass 4.5:1 against `--color-surface`.
