# Implementation Plan: Semantic Design Token System

**Branch**: `022-semantic-design-tokens` | **Date**: 2026-02-26
**Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `specs/022-semantic-design-tokens/spec.md`

---

## Summary

Refactor the QR Generator's light/dark theming from scattered `dark:` Tailwind variant
classes to a centralized semantic CSS token system. A set of `--color-*` CSS custom
properties is defined once in `src/index.css` — light defaults under `:root`, dark
overrides under `:root.dark`. Tailwind v4's `@theme` directive maps each variable to a
semantic utility class (e.g. `bg-surface`, `text-text-primary`). All 15 component files
that currently contain `dark:` classes are then migrated to consume these semantic
utilities. The visible output is pixel-identical to the pre-refactor design; the
long-term benefit is that future themes require editing only `index.css`.

Additionally, the temporary "force dark" workaround in `useTheme.ts` is removed and
the full dynamic initialization logic (localStorage → prefers-color-scheme → light
default) is restored.

Finally, to structurally remedy the Trivy vulnerability (CVE-2026-25646), the Dockerfile
`runtime` base image will be updated from `nginx:alpine` to `nginx:alpine-slim`, which strips the vulnerable `libpng` dependency natively, and the temporary suppression config in `.trivyignore` will be removed.

---

## Technical Context

**Language/Version**: TypeScript 5.x, React 18  
**Primary Dependencies**: Tailwind CSS v4 (`@theme` directive), Vite, clsx, tailwind-merge  
**Storage**: `localStorage` (theme preference key: `qr-generator:theme-preference`)  
**Testing**: Vitest + React Testing Library (28 test files, ≥85% coverage target)  
**Target Platform**: Modern browsers — Chrome, Safari, Firefox, Edge (desktop + mobile)  
**Performance Goals**: CSS variable resolution is browser-native, zero JS overhead  
**Constraints**: Theme transition ≤200ms ease (NF-002); WCAG 2.1 AA contrast (NF-001)  
**Scale/Scope**: 15 component/hook files; 1 CSS file; ~78 `dark:` occurrences to migrate

---

## Constitution Check

*GATE: Must pass before Phase 1 execution. Re-checked after Phase 3.*

| Principle | Status | Notes |
|---|---|---|
| I. Code Quality | ✅ Pass | Only removing `dark:` classes and adding semantic ones; no dead code introduced |
| II. Testing (NON-NEGOTIABLE) | ✅ Pass | All 28 test files preserved; class-name assertions updated where needed; coverage ≥85% maintained |
| IV. Performance | ✅ Pass | CSS variable resolution is browser-native; no JS overhead; 200ms transition within budget |
| V. Architecture & Structure | ✅ Pass | No new folders; CSS in `index.css`, hooks in `src/hooks/`, components untouched structurally |
| VI. Execution Discipline | ✅ Pass | Each phase committed individually; build + test + lint after every task |
| VII. Cross-Platform | ✅ Pass | CSS custom properties and `@theme` supported in all modern browsers |
| VIII. Theme Support | ✅ Pass | This feature IS the Theme Support implementation; localStorage + prefers-color-scheme |
| IX. Skill-Driven Dev | ✅ Pass | react-vite-essentials: no God Components, no derived-state anti-patterns introduced |

**No violations. Proceed to Phase 1.**

---

## Project Structure

### Documentation (this feature)

```text
specs/022-semantic-design-tokens/
├── plan.md        ← this file
├── research.md    ← Phase 0 output (all decisions resolved)
├── data-model.md  ← Phase 1 output (full token catalogue + component mapping)
├── quickstart.md  ← Phase 1 output (developer usage guide)
└── tasks.md       ← Phase 2 output (/speckit.tasks — NOT created here)
```

### Source Code (files modified by this feature)

```text
src/
├── index.css                              ← Phase 1: token definitions + @theme
├── hooks/
│   └── useTheme.ts                        ← Phase 2: restore dynamic init + toggle
├── components/
│   ├── common/
│   │   ├── Button.tsx                     ← Phase 3: migrate dark: → tokens
│   │   ├── Card.tsx                       ← Phase 3: migrate dark: → tokens
│   │   ├── DimensionSelector.tsx          ← Phase 3: migrate dark: → tokens
│   │   ├── ExportModal.tsx                ← Phase 3: migrate dark: → tokens
│   │   ├── FormatSelector.tsx             ← Phase 3: migrate dark: → tokens
│   │   ├── Input.tsx                      ← Phase 3: migrate dark: → tokens
│   │   ├── LanguageToggle.tsx             ← Phase 3: migrate dark: → tokens
│   │   └── ThemeToggle.tsx                ← Phase 3: enable + migrate dark: → tokens
│   ├── feature/qr/
│   │   ├── QRControls.tsx                 ← Phase 3: migrate dark: → tokens
│   │   ├── QRGenerator.tsx                ← Phase 3: migrate dark: → tokens
│   │   └── QRPreview.tsx                  ← Phase 3: migrate dark: → tokens
│   ├── Layout/
│   │   └── Layout.tsx                     ← Phase 3: migrate dark: → tokens
│   └── Navigation/
│       └── Navbar.tsx                     ← Phase 3: migrate dark: → tokens
├── App.tsx                                ← Phase 3: migrate dark: → tokens
└── utils/export/
    └── svgExporter.ts                     ← Phase 3: audit; migrate if theming present
```

---

## Phase 1 — Token Taxonomy in CSS

**Goal**: Define the complete semantic token vocabulary and Tailwind `@theme` mappings
in `src/index.css`. This is the foundation all subsequent phases depend on.

### Task 1.1 — Define CSS custom properties in `index.css`

Replace the existing 4-variable system (`--bg-primary`, `--text-primary`,
`--bg-secondary`, `--border-primary`) with the full 17-token catalogue.

**Changes to `src/index.css`**:

```css
@import 'tailwindcss';

/* ── Semantic Design Tokens ─────────────────────────────── */
@layer base {
  :root {
    /* Surface */
    --color-surface:         #ffffff;
    --color-surface-raised:  #f8fafc;
    --color-surface-overlay: rgba(255, 255, 255, 0.7);
    --color-surface-inset:   #f1f5f9;
    /* Text */
    --color-text-primary:    #0f172a;
    --color-text-secondary:  #475569;
    --color-text-disabled:   #94a3b8;
    /* Border */
    --color-border-subtle:   rgba(0, 0, 0, 0.08);
    --color-border-strong:   #cbd5e1;
    /* Action */
    --color-action:          #4f46e5;
    --color-action-fg:       #ffffff;
    --color-action-disabled: #c7d2fe;
    /* Accessibility */
    --color-focus-ring:      #6366f1;
    /* Status */
    --color-link:            #4f46e5;
    --color-error:           #dc2626;
    --color-error-surface:   #fef2f2;
    --color-error-border:    #fecaca;

    /* Global theme transition (NF-002) */
    transition: background-color 200ms ease, color 200ms ease,
                border-color 200ms ease;

    background-color: var(--color-surface);
    color: var(--color-text-primary);
    @apply font-sans antialiased;
  }

  :root.dark {
    /* Surface */
    --color-surface:         #020617;
    --color-surface-raised:  #0f172a;
    --color-surface-overlay: rgba(15, 23, 42, 0.7);
    --color-surface-inset:   rgba(255, 255, 255, 0.05);
    /* Text */
    --color-text-primary:    #f8fafc;
    --color-text-secondary:  #94a3b8;
    --color-text-disabled:   #4b5563;
    /* Border */
    --color-border-subtle:   rgba(255, 255, 255, 0.08);
    --color-border-strong:   rgba(255, 255, 255, 0.18);
    /* Action */
    --color-action:          #0ea5e9;
    --color-action-fg:       #ffffff;
    --color-action-disabled: #0c4a6e;
    /* Accessibility */
    --color-focus-ring:      #38bdf8;
    /* Status */
    --color-link:            #818cf8;
    --color-error:           #f87171;
    --color-error-surface:   rgba(153, 27, 27, 0.2);
    --color-error-border:    rgba(153, 27, 27, 0.5);
  }

  body {
    @apply min-h-screen break-words;
    background-color: var(--color-surface);
    color: var(--color-text-primary);
  }

  a {
    color: var(--color-link);
    @apply underline-offset-4 hover:underline;
  }
}

/* ── @theme: Bridge CSS vars to Tailwind utilities ───────── */
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

/* ── Legacy component classes (migrated to tokens) ────────── */
@layer components {
  .app-shell {
    @apply min-h-screen bg-surface;
  }
  .card-surface {
    @apply rounded-xl bg-surface-raised shadow-md ring-1 ring-border-subtle;
  }
}
```

**Validation**: Build must pass (`npm run build`). No class-name changes in
components yet — this step is purely additive to the CSS layer.

---

## Phase 2 — Restore ThemeProvider Dynamic Logic

**Goal**: Remove the temporary "force dark" workaround in `useTheme.ts` and restore
full dynamic theme initialization and toggling. Update `ThemeToggle.tsx` to be
interactive again.

### Task 2.1 — Restore `useTheme.ts`

- Uncomment the dynamic `useState` initializer (localStorage → prefers-color-scheme).
- Restore the `setTheme` function to accept `newTheme: Theme` and persist to localStorage.
- Restore `toggleTheme` to call `setTheme(theme === 'light' ? 'dark' : 'light')`.
- Remove the `// TODO: Revert...` comments and the `void getSystemTheme` no-op line.
- The `prefers-color-scheme` change listener (ongoing OS changes) remains commented out
  per the clarification (Q2 — only initial detection is in scope, not live updates).

### Task 2.2 — Re-enable `ThemeToggle.tsx`

- Remove `aria-disabled="true"` attribute.
- Remove `opacity-50 cursor-not-allowed` from the button's static class list.
- Wire `onClick` to call `toggleTheme()` from `useThemeContext()`.
- Replace `dark:border-white/10 dark:bg-white/5 dark:text-white` with semantic tokens
  (`border-border-strong bg-surface-raised text-text-primary`).

**Validation**: `npm run test` (useTheme.test.ts, ThemeToggle.test.tsx must pass).

---

## Phase 3 — Systematic Component Migration

**Goal**: Replace all `dark:` Tailwind variant classes across the 15 affected source
files with semantic token utilities. Process component by component, running tests
after each file to detect regressions immediately.

**Migration order** (atomic → composite → layout):

1. `App.tsx` — footer `dark:border-white/5 dark:text-slate-400`
2. `components/common/Card.tsx` — no dark: but uses raw `bg-white ring-slate-200`
3. `components/common/Toast.tsx` — no dark: (already uses fixed slate-800 tooltip)
4. `components/common/Input.tsx` — 5 dark: groups
5. `components/common/Button.tsx` — 6 dark: groups (primary, secondary, ghost)
6. `components/common/ThemeToggle.tsx` — already done in Phase 2
7. `components/common/LanguageToggle.tsx` — 3 dark: classes
8. `components/common/FormatSelector.tsx` — 4 dark: groups
9. `components/common/DimensionSelector.tsx` — 4 dark: groups (same pattern as Format)
10. `components/common/ExportModal.tsx` — 8 dark: groups (most complex)
11. `components/Navigation/Navbar.tsx` — 4 dark: groups
12. `components/Layout/Layout.tsx` — 1 dark: gradient (evaluate for token replacement)
13. `components/feature/qr/QRControls.tsx` — 7 dark: groups
14. `components/feature/qr/QRGenerator.tsx` — 6 dark: groups (includes decorative gradients)
15. `components/feature/qr/QRPreview.tsx` — 9 dark: groups (most complex feature file)
16. `utils/export/svgExporter.ts` — audit only; likely no visual dark: classes

**Key migration rules**:
- `dark:bg-slate-900` / `dark:bg-slate-950` → `bg-surface` or `bg-surface-raised`
  (check context: page bg = `surface`, card bg = `surface-raised`)
- `dark:text-white` → `text-text-primary`
- `dark:text-slate-300` / `dark:text-slate-400` → `text-text-secondary`
- `dark:border-white/10` → `border-border-strong`
- `dark:border-white/5` → `border-border-subtle`
- `dark:focus:ring-sky-500` → `focus:ring-focus-ring`
- Decorative gradients in `QRGenerator.tsx` (`dark:from-sky-400/40`) — keep as `dark:`
  if they are purely aesthetic ornamentation with no semantic role. Document as exception
  per FR-005.

**After each file**: run `npm run test -- --reporter verbose` and confirm no failures.

### Task 3.1 — Update test assertions

After completing all component migrations, run:

```bash
grep -rn "dark:" src/ --include="*.test.*"
grep -rn "bg-indigo-600\|bg-slate-900\|bg-white" src/ --include="*.test.*"
```

Update only the specific test lines that assert the old class names. Do not change
test logic or remove test cases.

---

## Phase 4 — Final Validation

### Task 4.1 — Zero `dark:` audit

```bash
grep -rn "dark:" src/ --include="*.tsx" --include="*.ts" | grep -v "__tests__"
```

Expected: 0 matches (or documented exceptions in `research.md` under "Exceptions").

### Task 4.2 — Full test suite

```bash
npm run test
npm run lint
npm run build
```

All must exit 0. Coverage must remain ≥85%.

### Task 4.3 — WCAG contrast spot-check

Manually verify in browser DevTools (light + dark):
- `--color-text-primary` on `--color-surface`: ≥4.5:1
- `--color-text-secondary` on `--color-surface-raised`: ≥4.5:1
- `--color-focus-ring` on `--color-surface-raised`: ≥3:1
- `--color-action` text (`--color-action-fg` white) on `--color-action`: ≥4.5:1

### Task 4.4 — Theme switch smoke test

In browser console:
- Apply `:root.test-theme { --color-surface: hotpink; }` — confirm ALL surfaces update.
- Toggle theme using `ThemeToggle` button — confirm 200ms transition, no FOUC.
- Reload with OS dark mode forced — confirm app opens in dark on first visit.
- Reload with OS dark mode forced but `localStorage` set to `light` — confirm light wins.

---

## Complexity Tracking

> No Constitution violations. Table included as confirmation.

| Potential Concern | Assessment | Resolution |
|---|---|---|
| Decorative gradients using `dark:` | These are aria-hidden ornamental backgrounds with no semantic role | Document as FR-005 exception in research.md; they don't affect theme maintainability |
| `QRPreview` download/share button inline style logic | Complex but purely visual; maps cleanly to `bg-surface-inset`, `bg-action` | No special treatment needed |
| ThemeToggle was intentionally disabled | Enabling it changes observable app behaviour | Aligns with spec intent (Q2 clarification) and Constitution §VIII |
