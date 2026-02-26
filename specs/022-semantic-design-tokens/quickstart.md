# Quickstart: Semantic Design Token System

**Branch**: `022-semantic-design-tokens`

This guide gives a developer everything needed to understand,
extend, and validate the semantic token system after this refactor.

---

## How the Token System Works

```
:root (light defaults)          :root.dark (dark overrides)
──────────────────────          ───────────────────────────
--color-surface: #fff           --color-surface: #020617
--color-action:  #4f46e5        --color-action:  #0ea5e9
        │                                │
        ▼  (resolved at runtime via CSS cascade)
@theme {
  --color-surface: var(--color-surface);   ← bridges CSS var to Tailwind utility
  --color-action:  var(--color-action);
}
        │
        ▼  (Tailwind generates utility classes)
bg-surface  →  background-color: var(--color-surface)
bg-action   →  background-color: var(--color-action)
bg-action/90 → background-color: color-mix(in srgb, var(--color-action) 90%, transparent)
```

---

## Adding a New Theme

1. Open `src/index.css`.
2. Add a new context block:
   ```css
   :root.sepia {
     --color-surface:       #f4ecd8;
     --color-text-primary:  #2c1a0e;
     /* ... define ALL tokens from the catalogue in data-model.md ... */
   }
   ```
3. Apply the class to `<html>` via `ThemeProvider` or browser console:
   ```js
   document.documentElement.classList.add('sepia')
   ```
4. Every component updates automatically. **Zero component file changes needed.**

> ⚠️ Themes MUST define every `--color-*` token. Omitting a token causes the
> browser to render with its default (transparent), which is the intentional
> diagnostic signal (see research.md R-002).

---

## Using Tokens in New Components

Always use semantic utilities. Never use literal colour utilities.

```tsx
// ✅ Correct — semantic, theme-aware
<div className="bg-surface-raised text-text-primary border border-border-strong">
  <button className="bg-action text-action-fg hover:bg-action/90 focus-visible:ring-focus-ring">
    Click
  </button>
</div>

// ❌ Wrong — hardcoded, breaks future themes
<div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
  <button className="bg-indigo-600 dark:bg-sky-600">Click</button>
</div>
```

---

## Interactive State Rules

| State | Approach | Example |
|---|---|---|
| Hover | Opacity modifier on base token | `hover:bg-action/90` |
| Active | Opacity modifier on base token | `active:bg-action/80` |
| Focus | `ring-focus-ring` token | `focus-visible:ring-2 focus-visible:ring-focus-ring` |
| Disabled fill | `bg-action-disabled` token | `disabled:bg-action-disabled` |
| Disabled text | `text-text-disabled` token | `disabled:text-text-disabled` |

---

## Token Reference Card

| Utility | Purpose |
|---|---|
| `bg-surface` | Root / page background |
| `bg-surface-raised` | Card, panel, control |
| `bg-surface-overlay` | Frosted-glass header/panels |
| `bg-surface-inset` | Inner shadow / placeholder areas |
| `text-text-primary` | Headings and body |
| `text-text-secondary` | Helper text, subtitles |
| `text-text-disabled` | Disabled elements |
| `border-border-subtle` | Hairline separators |
| `border-border-strong` | Input outlines, card rings |
| `bg-action` / `text-action-fg` | Primary CTA button |
| `bg-action/90` | Primary CTA hover |
| `bg-action/80` | Primary CTA active |
| `bg-action-disabled` | Primary disabled fill |
| `ring-focus-ring` | Keyboard focus indicator |
| `text-link` | Hyperlink colour |
| `text-error` | Error message text |
| `bg-error-surface` | Error alert background |
| `border-error-border` | Error alert outline |

---

## Running Validation

```bash
# 1. Confirm no dark: variants remain in components
grep -rn "dark:" src/ --include="*.tsx" --include="*.ts" | grep -v "__tests__"
# Expected output: 0 lines (or only documented exceptions)

# 2. Run full test suite
npm run test

# 3. Lint check
npm run lint

# 4. Build
npm run build
```

---

## ThemeProvider Initialization Order

```
On mount (useTheme.ts):
  1. Read localStorage key "qr-generator:theme-preference"
     → if "light" or "dark" → use it
  2. Else, read window.matchMedia('(prefers-color-scheme: dark)')
     → if matches → use "dark"
  3. Else → default to "light"

On toggle:
  → Update state → persist to localStorage → ThemeProvider
    applies/removes .dark on document.documentElement
```
