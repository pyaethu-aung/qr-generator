# Tasks: Semantic Design Token System

**Input**: Design documents from `specs/022-semantic-design-tokens/`
**Prerequisites**: plan.md ✅ spec.md ✅ research.md ✅ data-model.md ✅ quickstart.md ✅

**Organization**: Tasks are grouped by user story to enable independent implementation
and testing of each story. No test tasks are generated (not requested in spec).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Baseline verification — confirm Tailwind v4 `@theme` directive is
available and the build pipeline is healthy before any CSS changes.

- [ ] T001 Run `npm run test && npm run lint && npm run build` to establish a green
  baseline and record current `dark:` count via
  `grep -rn "dark:" src/ --include="*.tsx" --include="*.ts" | grep -v "__tests__" | wc -l`
  (expect ~78)

> 📦 **Commit checkpoint** (Constitution §Governance — MANDATORY): commit Phase 1
> before making any file changes. Suggested subject: `chore(semantic-design-token): record baseline metrics`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Define the complete semantic token vocabulary and `@theme` mappings in
`src/index.css`. Every subsequent phase depends on these utilities being available.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [ ] T002 Replace the 4-variable `:root` block in `src/index.css` with the full
  17-token `--color-*` catalogue (surface ×4, text ×3, border ×2, action ×3,
  focus-ring ×1, link/error ×4) for both `:root` (light) and `:root.dark` (dark),
  following the exact values in `data-model.md § Full Token Catalogue`

- [ ] T003 Add the `@theme` block in `src/index.css` immediately after the `@layer base`
  block, mapping all 17 `--color-*` CSS variables to Tailwind utility names
  (`--color-surface: var(--color-surface)`, etc.), following `data-model.md §
  Tailwind Utility Mapping`

- [ ] T004 Replace the global `transition` in `:root` in `src/index.css`: remove
  `@apply … transition-colors duration-300` and add the explicit CSS declaration
  `transition: background-color 200ms ease, color 200ms ease, border-color 200ms ease`
  (NF-002); also migrate the `a` element from `dark:text-indigo-400` to
  `color: var(--color-link)`

- [ ] T005 Migrate `.app-shell` and `.card-surface` component classes in `src/index.css`
  from hardcoded Tailwind colour utilities to semantic token utilities:
  `.app-shell → @apply min-h-screen bg-surface`,
  `.card-surface → @apply rounded-xl bg-surface-raised shadow-md ring-1 ring-border-subtle`

- [ ] T006 Run `npm run build` to confirm `@theme` compiles without errors and
  semantic utility classes are generated; verify with browser DevTools that
  `bg-surface` resolves to `var(--color-surface)`

**Checkpoint**: Token taxonomy complete — all `bg-surface`, `text-text-primary`,
`border-border-strong`, `ring-focus-ring` etc. utilities available for component use.

> 📦 **Commit checkpoint** (Constitution §Governance — MANDATORY): commit Phase 2
> in full before starting Phase 3. Suggested subject: `feat(semantic-design-token): define token taxonomy in index.css`

---

## Phase 3: User Story 2 — ThemeProvider Dynamic Logic (Priority: P2) ⚙️

> **Note on ordering**: US2 (ThemeProvider restore) is implemented before US1
> (visual parity) because US1's independent test requires a working theme toggle.
> US2 has no dependency on component migration, so it can be done in isolation.

**Goal**: Remove the "force dark" workaround and restore full dynamic
localStorage → prefers-color-scheme initialization and theme toggling.

**Independent Test**: Open the app, clear localStorage, reload with OS set to light
mode — confirm app opens in light. Set OS to dark, reload — confirm app opens in dark.
Toggle the ThemeToggle button — confirm theme switches and `localStorage` is updated.

### Implementation for User Story 2

- [ ] T007 [US2] Restore dynamic `useState` initializer in `src/hooks/useTheme.ts`:
  uncomment the original lazy-init block (localStorage → prefers-color-scheme → light),
  remove the hardcoded `useState<Theme>('dark')` line,
  remove all `// TODO: Revert…` comments and the `void getSystemTheme` no-op

- [ ] T008 [US2] Restore `setTheme` and `toggleTheme` in `src/hooks/useTheme.ts`:
  `setTheme` must accept `newTheme: Theme`, persist to localStorage, and call
  `setThemeState(newTheme)`; `toggleTheme` must call
  `setTheme(theme === 'light' ? 'dark' : 'light')`; remove `console.warn` no-ops;
  return `isDark: theme === 'dark'` instead of hardcoded `true`

- [ ] T009 [US2] Re-enable `ThemeToggle` in `src/components/common/ThemeToggle.tsx`:
  remove `aria-disabled="true"` attribute, remove the static `opacity-50 cursor-not-allowed`
  classes, wire `onClick` to `toggleTheme()` from `useThemeContext()`;
  also begin dark-class migration: replace
  `border-slate-200 bg-white text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-white`
  with `border-border-strong bg-surface-raised text-text-primary`

- [ ] T010 [US2] Update `src/hooks/__tests__/useTheme.test.ts` to reflect restored
  behaviour: update any assertions that expect `isDark: true` unconditionally;
  confirm toggle and setTheme tests pass; run `npm run test -- useTheme`

**Checkpoint**: Theme toggle is live; app correctly initializes from localStorage /
OS preference; `useTheme.test.ts` and `ThemeToggle.test.tsx` pass.

> 📦 **Commit checkpoint** (Constitution §Governance — MANDATORY): commit Phase 3
> before starting Phase 4. Suggested subject: `feat(semantic-design-token): restore ThemeProvider dynamic init`

---

## Phase 4: User Story 1 — Visual Parity After Token Migration (Priority: P1) 🎯 MVP

**Goal**: Replace all `dark:` Tailwind variant classes across the remaining 14 source
files with semantic token utilities. Visual output is pixel-identical to pre-refactor.

**Independent Test**: Open app in browser, toggle light ↔ dark — all surfaces, text,
borders, and interactive states look identical to pre-refactor design.
Run `grep -rn "dark:" src/ --include="*.tsx" | grep -v "__tests__"` → 0 matches
(excluding documented exceptions). Run `npm run test` → 0 failures.

### Implementation for User Story 1

*Process files in atomic → composite → layout order (matching plan.md Phase 3 order).
Run `npm run test` after each task to catch regressions immediately.*

- [ ] T011 [P] [US1] Migrate `src/App.tsx`:
  footer — replace `text-slate-500 dark:text-slate-400` → `text-text-secondary`,
  `border-black/5 dark:border-white/5` → `border-border-subtle`

- [ ] T012 [P] [US1] Migrate `src/components/common/Card.tsx`:
  replace `bg-white ring-slate-200` → `bg-surface-raised ring-border-subtle`
  (no `dark:` variants, but uses hardcoded light colours that break future themes)

- [ ] T013 [P] [US1] Migrate `src/components/common/Input.tsx`:
  replace `bg-white dark:bg-slate-950` → `bg-surface`,
  `border-slate-300 dark:border-white/10` → `border-border-strong`,
  `text-slate-900 dark:text-white` → `text-text-primary`,
  `placeholder:text-slate-500 dark:placeholder:text-slate-500` → `placeholder:text-text-secondary`,
  `focus:ring-indigo-500 dark:focus:ring-sky-500` → `focus:ring-focus-ring`,
  `focus:border-indigo-500 dark:focus:border-sky-500` → `focus:border-focus-ring`,
  `bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400` →
  `bg-action-disabled text-text-disabled` (disabled state),
  label `text-slate-700 dark:text-slate-300` → `text-text-primary`,
  error `text-red-600 dark:text-red-400` → `text-error`,
  helper `text-slate-500 dark:text-slate-400` → `text-text-secondary`,
  `border-red-300 dark:border-red-500` → `border-error-border`

- [ ] T014 [US1] Migrate `src/components/common/Button.tsx`:
  primary variant — `bg-indigo-600 dark:bg-sky-600` → `bg-action`,
  `text-white` → `text-action-fg`,
  `hover:bg-indigo-500 dark:hover:bg-sky-500` → `hover:bg-action/90`,
  `active:bg-indigo-700 dark:active:bg-sky-700` → `active:bg-action/80`,
  `focus-visible:outline-indigo-500 dark:focus-visible:outline-sky-500` →
  `focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2`;
  secondary variant — `bg-white dark:bg-slate-900` → `bg-surface-raised`,
  `text-slate-900 dark:text-white` → `text-text-primary`,
  `border-slate-200 dark:border-white/10` → `border-border-strong`,
  `hover:bg-slate-50 dark:hover:bg-slate-800` → `hover:bg-surface-raised/80`,
  `active:bg-slate-100 dark:active:bg-slate-700` → `active:bg-surface-inset`;
  ghost variant — `text-slate-900 dark:text-slate-300` → `text-text-primary`,
  `hover:bg-slate-100 dark:hover:bg-white/5` → `hover:bg-surface-inset`,
  `active:bg-slate-200 dark:active:bg-white/10` → `active:bg-surface-inset/80`;
  base ring — `focus-visible:ring-indigo-500 focus-visible:ring-offset-white` →
  `focus-visible:ring-focus-ring focus-visible:ring-offset-surface`

- [ ] T015 [P] [US1] Migrate `src/components/common/LanguageToggle.tsx`:
  replace `border-black/10 dark:border-white/30` → `border-border-subtle`,
  `bg-white/5 dark:bg-white/5` → `bg-surface-overlay`,
  `text-slate-900 dark:text-white` → `text-text-primary`,
  `hover:border-black/20 dark:hover:border-white` → `hover:border-border-strong`,
  `hover:bg-black/5 dark:hover:bg-white/10` → `hover:bg-surface-inset`,
  `focus-visible:outline-sky-500` → `focus-visible:ring-focus-ring`

- [ ] T016 [P] [US1] Migrate `src/components/common/FormatSelector.tsx`:
  selected state — `border-slate-900 dark:border-sky-500` → `border-action`,
  `bg-slate-50 dark:bg-sky-900/20` → `bg-action/10`;
  unselected state — `border-slate-200 dark:border-slate-700` → `border-border-strong`,
  `hover:border-slate-300 dark:hover:border-slate-600` → `hover:border-action/60`,
  `bg-white dark:bg-slate-900` → `bg-surface-raised`;
  text — `text-slate-900 dark:text-white` → `text-text-primary`,
  `text-slate-500 dark:text-slate-400` → `text-text-secondary`,
  `text-slate-600 dark:text-slate-400` → `text-text-secondary`;
  selected icon — `text-slate-900 dark:text-sky-500` → `text-action`

- [ ] T017 [P] [US1] Migrate `src/components/common/DimensionSelector.tsx`:
  apply identical mapping as FormatSelector (same pattern):
  selected — `border-slate-900 dark:border-sky-500` → `border-action`,
  `bg-slate-50 dark:bg-sky-900/20` → `bg-action/10`;
  unselected — `border-slate-200 dark:border-slate-700` → `border-border-strong`,
  `bg-white dark:bg-slate-900` → `bg-surface-raised`;
  text — `text-slate-900 dark:text-white` → `text-text-primary`,
  `text-slate-500 dark:text-slate-400` → `text-text-secondary`;
  label — `text-slate-900 dark:text-white` → `text-text-primary`

- [ ] T018 [US1] Migrate `src/components/common/ExportModal.tsx`:
  backdrop — keep `bg-black/50 backdrop-blur-sm` (intentional overlay, not a token);
  modal panel — `bg-white dark:bg-slate-900` → `bg-surface-raised`,
  `border-slate-200 dark:border-white/10` → `border-border-strong`;
  title — `text-slate-900 dark:text-white` → `text-text-primary`;
  close button — `text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200`
  → `text-text-secondary hover:text-text-primary`,
  `hover:bg-slate-100 dark:hover:bg-slate-800` → `hover:bg-surface-inset`;
  error block — `bg-red-50 dark:bg-red-900/20` → `bg-error-surface`,
  `border-red-200 dark:border-red-900/50` → `border-error-border`,
  `text-red-700 dark:text-red-400` → `text-error`;
  cancel button — `text-slate-700 dark:text-slate-300` → `text-text-primary`,
  `bg-slate-100 dark:bg-slate-800` → `bg-surface-inset`,
  `hover:bg-slate-200 dark:hover:bg-slate-700` → `hover:bg-surface-inset/80`;
  export button — `bg-slate-900 dark:bg-sky-600` → `bg-action`,
  `hover:bg-slate-800 dark:hover:bg-sky-500` → `hover:bg-action/90`

- [ ] T019 [P] [US1] Migrate `src/components/Navigation/Navbar.tsx`:
  header — `border-black/5 dark:border-white/10` → `border-border-subtle`,
  `bg-white/70 dark:bg-slate-950/70` → `bg-surface-overlay`;
  h1 — `text-slate-900 dark:text-white` → `text-text-primary`;
  subtitle — `text-slate-600 dark:text-slate-300` → `text-text-secondary`

- [ ] T020 [P] [US1] Migrate `src/components/Layout/Layout.tsx`:
  evaluate the `dark:bg-[radial-gradient(…)]` decorative background — document as
  FR-005 exception in `specs/022-semantic-design-tokens/research.md` (non-semantic
  purely aesthetic gradient); replace the wrapping div's
  `transition-colors duration-300` with nothing (global transition on `:root` covers it)

- [ ] T021 [US1] Migrate `src/components/feature/qr/QRControls.tsx`:
  outer wrapper — `bg-white dark:bg-slate-900/40` → `bg-surface-raised`,
  `border-slate-100 dark:border-white/5` → `border-border-subtle`;
  helper text — `text-slate-600 dark:text-slate-400` → `text-text-secondary`;
  labels — `text-slate-900 dark:text-slate-300` → `text-text-primary`;
  select — identical mapping to `Input.tsx` (same border/bg/focus/disabled pattern);
  color swatch border — `border-slate-300 dark:border-white/20` → `border-border-strong`;
  hex label — `text-slate-600 dark:text-slate-400` → `text-text-secondary`;
  divider — `border-slate-100 dark:border-white/5` → `border-border-subtle`;
  section label — `text-slate-700 dark:text-slate-300` → `text-text-secondary`

- [ ] T022 [US1] Migrate `src/components/feature/qr/QRGenerator.tsx`:
  badge text — `text-indigo-700 dark:text-sky-300` → `text-action`;
  h2 — `text-slate-900 dark:text-white` → `text-text-primary`;
  subtitle — `text-slate-800 dark:text-slate-300` → `text-text-secondary`;
  glass panel — `border-slate-200 dark:border-white/10` → `border-border-strong`,
  `bg-white/70 dark:bg-slate-900/70` → `bg-surface-overlay`,
  `shadow-slate-200/50 dark:shadow-black/50` → keep as-is (shadow, not a colour token);
  section labels — `text-slate-600 dark:text-slate-400` → `text-text-secondary`;
  section titles — `text-slate-900 dark:text-white` → `text-text-primary`;
  preview wrapper — `border-slate-100 dark:border-white/10` → `border-border-subtle`,
  `bg-slate-50/50 dark:bg-white/5` → `bg-surface-inset`;
  decorative gradient divs (`dark:from-sky-400/40`, `dark:bg-fuchsia-500/40`,
  `dark:bg-indigo-500/30`) — document as FR-005 exceptions (aria-hidden ornamental)

- [ ] T023 [US1] Migrate `src/components/feature/qr/QRPreview.tsx`:
  outer card — `bg-white dark:bg-slate-900` → `bg-surface-raised`,
  `border-slate-200 dark:border-white/10` → `border-border-strong`;
  placeholder — `bg-slate-50 dark:bg-slate-800/50` → `bg-surface-inset`,
  `text-slate-500 dark:text-slate-500` → `text-text-secondary`,
  `border-slate-200 dark:border-white/10` → `border-border-subtle`;
  share status — `text-slate-500 dark:text-slate-400` → `text-text-secondary`;
  download button (enabled) — `border-slate-700 dark:border-slate-400` → `border-border-strong`,
  `text-slate-900 dark:text-white` → `text-text-primary`,
  `hover:bg-slate-700 hover:text-white dark:hover:bg-slate-400 dark:hover:text-slate-900` →
  `hover:bg-action hover:text-action-fg`;
  download button (disabled) — `border-slate-200 dark:border-white/5` → `border-border-subtle`,
  `bg-slate-100 dark:bg-slate-800` → `bg-surface-inset`,
  `text-slate-400 dark:text-slate-500` → `text-text-disabled`;
  share button (enabled) — `border-slate-900 bg-slate-900 dark:border-sky-500 dark:bg-sky-600`
  → `border-action bg-action`,
  `text-white` → `text-action-fg`,
  `hover:bg-slate-800 dark:hover:bg-sky-500` → `hover:bg-action/90`,
  `focus-visible:ring-slate-900 dark:focus-visible:ring-sky-500` → `focus-visible:ring-focus-ring`;
  share button (disabled) — same as download button disabled pattern

- [ ] T024 [P] [US1] Audit `src/utils/export/svgExporter.ts` for any `dark:` variant
  class strings embedded in SVG generation logic; if found, migrate to token values;
  if none found, confirm with a grep and mark complete

- [ ] T025 [US1] Update test assertions: grep all `src/**/__tests__/*.test.*` for
  migrated class names (`bg-indigo-600`, `bg-slate-900`, `border-white/10`,
  `dark:`, etc.) and update only those specific lines to reflect the new semantic
  utility names; confirm `npm run test` exits 0

**Checkpoint**: `grep -rn "dark:" src/ --include="*.tsx" | grep -v "__tests__"` returns
0 matches (or only the documented FR-005 exceptions in `Layout.tsx` / `QRGenerator.tsx`).
All visual output is pixel-identical to pre-refactor design.

> 📦 **Commit checkpoint** (Constitution §Governance — MANDATORY): commit Phase 4
> before starting Phase 5. Suggested subject: `refactor(semantic-design-token): migrate all components to tokens`

---

## Phase 5: User Story 3 — Tests Continue to Pass (Priority: P3) ✅

**Goal**: Confirm the full Vitest suite passes, coverage stays ≥85%, and all
ThemeProvider behaviour is tested correctly after the dynamic-init restoration.

**Independent Test**: `npm run test` exits 0 with no skipped specs. Coverage report
shows ≥85%. `npm run lint` exits 0. `npm run build` exits 0.

### Implementation for User Story 3

- [ ] T026 [P] [US3] Update `src/hooks/__tests__/useTheme.test.ts` if not already
  done in T010: ensure tests cover (a) no localStorage → prefers-color-scheme dark
  initializes to dark, (b) no localStorage + light OS → initializes to light,
  (c) localStorage 'light' overrides dark OS preference, (d) `toggleTheme` persists
  to localStorage and updates state

- [ ] T027 [P] [US3] Update `src/components/common/__tests__/ThemeToggle.test.tsx`:
  remove any assertion that button is disabled (`aria-disabled`, `cursor-not-allowed`);
  confirm toggle fires `toggleTheme`; update class name assertions from old
  `dark:bg-white/5` style to new `bg-surface-raised` style

- [ ] T028 [US3] Run full validation suite:
  `npm run test` (all 28 test files, 0 failures),
  `npm run lint` (0 errors),
  `npm run build` (successful production build),
  confirm coverage is ≥85% in the report output

**Checkpoint**: All user stories are independently functional. Full test suite passes.

> 📦 **Commit checkpoint** (Constitution §Governance — MANDATORY): commit Phase 5
> before starting Phase 6. Suggested subject: `test(semantic-design-token): verify full suite passes post-refactor`

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final audit, documentation, and WCAG contrast verification.

- [ ] T029 [P] Perform zero-`dark:` final audit:
  `grep -rn "dark:" src/ --include="*.tsx" --include="*.ts" | grep -v "__tests__"`;
  for any remaining `dark:` hits — either migrate them or add an entry to the
  Exceptions section of `specs/022-semantic-design-tokens/research.md` per FR-005

- [ ] T030 [P] WCAG contrast spot-check (manual, browser DevTools):
  verify `--color-text-primary` on `--color-surface` ≥4.5:1 (light + dark),
  `--color-text-secondary` on `--color-surface-raised` ≥4.5:1 (light + dark),
  `--color-focus-ring` on `--color-surface-raised` ≥3:1 (light + dark),
  `--color-action-fg` (white) on `--color-action` ≥4.5:1 (light + dark);
  adjust token values in `src/index.css` if any ratio fails

- [ ] T031 Browser smoke test per `quickstart.md § Running Validation`:
  (a) apply `:root.test-theme { --color-surface: hotpink }` in console — all surfaces
  update; (b) toggle theme — 200ms ease transition, no FOUC;
  (c) force OS dark, clear localStorage, reload — app opens dark;
  (d) force OS dark, set `localStorage['qr-generator:theme-preference']='light'`,
  reload — app opens light

- [ ] T032 [P] Remove all `// TODO: Revert…` comments and any remaining commented-out
  theme code across `src/hooks/useTheme.ts`; ensure no dead code or
  unreferenced imports remain (Constitution §I)

> 📦 **Commit checkpoint** (Constitution §Governance — MANDATORY): commit Phase 6
> to close the feature. Suggested subject: `chore(semantic-design-token): Polish and WCAG audit`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — run immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 — **blocks all user story phases**
- **Phase 3 (US2 — ThemeProvider)**: Depends on Phase 2; independent of US1
- **Phase 4 (US1 — Migration)**: Depends on Phase 2; can run in parallel with Phase 3
- **Phase 5 (US3 — Tests)**: Depends on Phase 3 + Phase 4 completion
- **Phase 6 (Polish)**: Depends on Phase 5

### User Story Dependencies

- **US2 (P2) before US1 (P1)** *(exception to priority order)*: ThemeProvider must
  be restored before the full visual parity test can be independently validated.
  Phase 3 and Phase 4 can overlap — US2 touches only hooks/ThemeToggle,
  US1 touches only component files.
- **US3 (P3)**: Depends on both US1 and US2 being complete.

### Within Each Phase

- Tasks marked `[P]` touch different files and can run in parallel.
- T014 (Button) depends on T013 (Input) patterns being established first — reference
  T013 to ensure consistent token mapping decisions before Button.
- T025 (test assertion updates) must run after T011–T024 are all complete.

### Parallel Opportunities

```
Phase 2:  T002 → T003 → T004 → T005  (sequential, same file)

Phase 3:  T007 → T008  (sequential, same file)
          T009 (ThemeToggle, different file, after T007)
          T010 (tests, after T008–T009)

Phase 4:  T011 [P]  T012 [P]  T013 [P]     ← all parallel (different files)
          T015 [P]  T016 [P]  T017 [P]
          T019 [P]  T020 [P]  T024 [P]
          T014  (after T013 pattern established)
          T018  (complex, after T016 pattern)
          T021  (after T013 + T014 patterns)
          T022  (after T021 pattern)
          T023  (most complex, after T022 pattern)
          T025  (after ALL T011–T024 done)

Phase 5:  T026 [P]  T027 [P]  (parallel)
          T028        (after T026 + T027)

Phase 6:  T029 [P]  T030 [P]  (parallel)
          T031  T032 [P]       (T031 after T029+T030; T032 parallel)
```

---

## Implementation Strategy

### MVP: User Story 1 Visual Parity

1. Complete Phase 1 (T001) — baseline
2. Complete Phase 2 (T002–T006) — token taxonomy **[CRITICAL BLOCKER]**
3. Complete Phase 3 (T007–T010) — restore ThemeProvider
4. Complete Phase 4 (T011–T025) — migrate all components
5. **STOP and VALIDATE**: visual parity confirmed, `dark:` count = 0
6. Complete Phase 5 (T026–T028) — full suite passes
7. Complete Phase 6 (T029–T032) — polish and WCAG sign-off

### Incremental Delivery

- **After T006**: Token utilities available — developers can start writing new
  components using semantic tokens immediately
- **After T010**: Theme toggle is live — manual dark/light testing possible
- **After each T011–T024**: That component is fully migrated and individually smoke-testable
- **After T025**: SC-001 (tests pass) and SC-002 (0 dark: variants) both satisfied
- **After T031**: SC-003, SC-004, SC-005 satisfied — feature is shippable

---

## Notes

- `[P]` tasks touch different files with no inter-task dependencies
- Decorative gradient `dark:` variants in `Layout.tsx` and `QRGenerator.tsx` are
  FR-005 documented exceptions — do not block SC-002
- Each task should be committed individually following the 50/72 commit rule
  with `semantic-design-token` scope
- The `Toast.tsx` component requires no changes — it uses a fixed dark tooltip colour
  (`bg-slate-800`) intentionally independent of theme
- After every commit: `npm run test && npm run lint` must pass
