# Tasks: Update Website Design

**Input**: Design documents from `specs/024-update-website-design/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/component-api.md ✅

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to (US1–US5)
- All changes are UI-only — no data model or API changes

---

## Phase 1: Setup (Blocking Prerequisites)

**Purpose**: Install the icon library and load the Geist Mono font. These must complete before icon-related components can be implemented.

- [ ] T001 Install lucide-react as a runtime dependency in `package.json` (`npm install lucide-react`)
- [ ] T002 [P] Add Geist Mono Google Fonts `<link>` tags to `index.html` (preconnect + stylesheet for weights 400 and 500)
- [ ] T003 [P] Reduce theme transition duration from 200ms to 150ms on `:root` in `src/index.css`; confirm `body` inherits the transition or add explicit `transition-colors duration-150` on `body` if it sets its own background independently

**Checkpoint**: `lucide-react` importable; Geist Mono loads; theme switch transitions at 150ms. Run `npm run build` to verify.

---

## Phase 2: User Story 1 — Desktop Layout Matches Design (Priority: P1) 🎯 MVP

**Goal**: Navbar, hero, two-column card, and footer all match `design.pen` on desktop (≥1024px). ThemeToggle and LanguageToggle render as circular icon buttons.

**Independent Test**: Open the app at ≥1440px wide — verify navbar circular icon buttons, hero eyebrow/heading/subtitle, two-column card with `rounded-xl` / `p-8` / `gap-10`, and footer with top border and `h-16`.

### Implementation for User Story 1

- [ ] T004 [P] [US1] Restyle ThemeToggle to `h-9 w-9 rounded-full border border-border-subtle bg-surface-raised` with `<Sun>` / `<Moon>` lucide icons (18×18, `text-text-secondary`); remove emoji span in `src/components/common/ThemeToggle.tsx`
- [ ] T005 [P] [US1] Restyle LanguageToggle to `h-9 w-9 rounded-full border border-border-subtle bg-surface-raised` with `<Globe>` lucide icon (18×18, `text-text-secondary`); remove text label span in `src/components/common/LanguageToggle.tsx`
- [ ] T006 [US1] Update Navbar: change padding to `py-4 px-6 sm:px-12`; add `hidden sm:block` to subtitle `<p>` in `src/components/Navigation/Navbar.tsx`
- [ ] T007 [P] [US1] Update QRGenerator: change card `rounded-[32px]` → `rounded-xl`, `p-4 sm:p-6` → `p-8`, `gap-8 lg:gap-10` → `gap-10`; change hero section gap `space-y-6` → `space-y-3`; update hero section padding from `py-8 sm:py-16 lg:py-20` to `pt-16 pb-8 px-6 sm:px-12` in `src/components/feature/qr/QRGenerator.tsx`
- [ ] T008 [P] [US1] Update footer in `src/App.tsx`: add `h-16` and change padding to `py-6`
- [ ] T009 [US1] Update ThemeToggle tests to assert `<Sun>` / `<Moon>` SVG presence (check for `svg` element in container) instead of emoji; verify `aria-label` passes through in `src/components/common/__tests__/ThemeToggle.test.tsx`
- [ ] T010 [US1] Update LanguageToggle tests to assert `<Globe>` SVG presence instead of text label; verify `aria-label` still present in `src/components/common/__tests__/LanguageToggle.test.tsx`

**Checkpoint**: US1 fully functional. Run `npm run test && npm run lint && npm run build`. Open desktop viewport and visually confirm layout against design.

---

## Phase 3: User Story 2 — Configuration Controls Styled Correctly (Priority: P1)

**Goal**: EC Level pill row, Pixel Pattern pill toggle, restyled color pickers (inset box + circle + Geist Mono hex), Eye Shape dropdown with lucide chevron, Generate button with zap icon, download buttons with download icon — all matching design in both light and dark themes.

**Independent Test**: Inspect Settings column in both light and dark mode at any viewport. Verify each control: EC pills highlight active selection with `action` color, color pickers show circle + mono hex in a 44px inset box, Eye Shape shows lucide chevron-down, Generate button is full-width 48px with zap icon, PNG/SVG buttons have download icon.

### Implementation for User Story 2

- [ ] T011 [US2] Replace EC Level `<select>` with a pill row of 4 `<button>` elements; active pill: `bg-action text-action-fg font-semibold rounded-full`; inactive: `bg-surface-inset text-text-secondary rounded-full` in `src/components/feature/qr/QRControls.tsx`
- [ ] T012 [US2] Replace Pixel Pattern `<select>` with a 2-button pill toggle (Square / Dots); same active/inactive token pattern as EC Level pills in `src/components/feature/qr/QRControls.tsx`
- [ ] T013 [US2] Restyle Foreground and Background color pickers to a 44px-tall inset box (`bg-surface-inset rounded-lg`): color circle (20px, `rounded-full`, clicking opens the hidden `<input type="color">`) + monospace hex label (`font-['Geist_Mono'] text-sm font-medium`) in `src/components/feature/qr/QRControls.tsx`
- [ ] T014 [US2] Add `<Zap>` lucide icon (18×18) before the Generate button label; make button full-width, 48px tall (`h-12`), fully rounded (`rounded-full`), filled `bg-action text-action-fg` in `src/components/feature/qr/QRControls.tsx`
- [ ] T015 [US2] Move PNG and SVG download buttons directly below Generate button (no "Download Formats" section divider); add `<Download>` lucide icon (16×16) before each label; style as secondary (`bg-surface-raised border border-border-subtle h-11`) in `src/components/feature/qr/QRControls.tsx`
- [ ] T016 [US2] Restyle Eye Shape `<select>`: wrap in a `relative` div, add `appearance-none pr-8` to the `<select>` to suppress the native arrow, and position a `<ChevronDown>` lucide icon (16×16, `text-text-secondary`) absolutely on the right (`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none`) in `src/components/feature/qr/QRControls.tsx`
- [ ] T017 [US2] Remove the `rounded-2xl border bg-surface-raised/40 p-4 sm:p-6` container wrapper div from QRControls so fields render flush in the left column; complete T007 before or alongside this task — parent QRGenerator padding replaces the removed wrapper spacing in `src/components/feature/qr/QRControls.tsx`
- [ ] T018 [US2] Update QRControls tests: replace `<select>` element queries with `screen.getByRole('button', { name: ... })` for EC Level and Pixel Pattern pill buttons; add assertions for zap icon and download icons; verify download buttons are no longer separated by a divider in `src/components/feature/qr/__tests__/QRControls.test.tsx`

**Checkpoint**: US2 fully functional. Run `npm run test && npm run lint && npm run build`. Visually inspect all controls in both themes.

---

## Phase 4: User Story 3 — Preview Column Styled Correctly (Priority: P2)

**Goal**: Preview column shows a 536px-tall inset box on desktop (auto-height on mobile) with the QR card centered inside and a Share QR Code button (`<Share2>` icon) below the preview area. Download button removed from `QRPreview`.

**Independent Test**: View Preview column on desktop — confirm 536px inset box with subtle border, centered white `rounded-lg p-4` QR card (220×220), and a Share button with share-2 icon positioned below the box (not inside). Complete T015 (US2) before implementing T019 — download button moves from QRPreview to QRControls.

### Implementation for User Story 3

- [ ] T019 [US3] Restyle QRPreview: replace compact card outer wrapper with a `md:h-[536px] bg-surface-inset rounded-lg border border-border-subtle` inset box; center QR canvas in a white `rounded-lg p-4 bg-white` card (220×220); remove the download button from QRPreview (it is now in QRControls); move Share button below the inset box with `<Share2>` lucide icon (18×18), `rounded-xl bg-surface-raised border border-border-subtle` style in `src/components/feature/qr/QRPreview.tsx`
- [ ] T020 [US3] Update QRPreview tests: remove download button assertions; add assertions for Share button with share-2 icon rendered below the preview area; verify download button is absent from QRPreview in `src/components/feature/qr/__tests__/QRPreview.test.tsx`

**Checkpoint**: US3 fully functional. Run `npm run test && npm run lint && npm run build`. Visually confirm preview column layout on desktop.

---

## Phase 5: User Story 4 — Dark Theme Applied Correctly (Priority: P2)

**Goal**: Every UI element uses dark-mode semantic tokens when `.dark` is active. No hard-coded colors visible. Moon icon shows in dark mode. Color picker defaults show #FFFFFF (fg) and #0F172A (bg) in dark mode.

**Independent Test**: Toggle to dark mode — confirm page background, navbar, card, all inputs, pills, and buttons use dark token values. Check color picker hex labels. Check ThemeToggle shows moon icon.

### Implementation for User Story 4

- [ ] T021 [US4] Audit all modified component files for any hard-coded hex values or non-token color classes; replace with semantic token utilities (`bg-action`, `text-text-primary`, `border-border-subtle`, etc.) across `src/components/common/ThemeToggle.tsx`, `src/components/common/LanguageToggle.tsx`, `src/components/Navigation/Navbar.tsx`, `src/components/feature/qr/QRGenerator.tsx`, `src/components/feature/qr/QRControls.tsx`, `src/components/feature/qr/QRPreview.tsx`, `src/App.tsx`
- [ ] T022 [US4] Verify that the QR preview card uses `bg-white` (intentional — QR codes require white background); all surrounding surfaces use tokens; confirm no unintentional hard-coded values remain in `src/components/feature/qr/QRPreview.tsx`

**Checkpoint**: US4 verified. Toggle dark mode and confirm full theme switch with no conflicting colors.

---

## Phase 6: User Story 5 — Mobile Layout is Responsive (Priority: P2)

**Goal**: Single-column layout at <768px with no horizontal overflow, subtitle hidden, all controls full-width with ≥44px tap targets, preview area auto-height on mobile.

**Independent Test**: Resize browser to 375px wide — confirm vertical stack (controls above preview), no horizontal scrollbar, navbar subtitle hidden, all form controls full-width with sufficient tap target size.

### Implementation for User Story 5

- [ ] T023 [US5] Verify and fix QRGenerator mobile stacking: confirm `flex-col md:flex-row` so columns stack below 768px and remain two-column at ≥768px (tablet + desktop); update preview area height to `md:h-[536px]` (auto below `md:` breakpoint) in `src/components/feature/qr/QRGenerator.tsx`
- [ ] T024 [US5] Verify hero section mobile padding and text wrapping: confirm `pt-16 pb-8 px-6 sm:px-12` (or equivalent responsive padding) and no text overflow on 375px viewport in `src/components/feature/qr/QRGenerator.tsx`
- [ ] T025 [US5] Verify all QRControls form elements are full-width and meet the 44px minimum tap target height at mobile viewport (inputs, pill buttons, Generate button, download buttons, color picker boxes) in `src/components/feature/qr/QRControls.tsx`

**Checkpoint**: US5 verified. Test at 375px, 430px, and 768px widths for no overflow and correct stacking.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final validation pass across all stories.

- [ ] T026 Run `npm run test && npm run lint && npm run build` and fix any remaining failures across all modified files
- [ ] T027 [P] Visual QA: test both themes at 375px (mobile), 768px (tablet), 1024px (small desktop), and 1440px (large desktop) — compare each breakpoint against `design.pen` for layout fidelity
- [ ] T028 [P] Accessibility spot-check: confirm `aria-label` is present on ThemeToggle (`"Toggle theme"`) and LanguageToggle; confirm pill buttons have readable text labels and correct focus rings in `src/components/common/ThemeToggle.tsx` and `src/components/common/LanguageToggle.tsx`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **US1 (Phase 2)**: Depends on T001 (lucide-react installed). T004, T005, T007, T008 can run in parallel after T001.
- **US2 (Phase 3)**: Depends on T001 (lucide-react) and T002 (Geist Mono for hex labels). T011–T017 are sequential (same file: `QRControls.tsx`); T018 runs after T011–T017.
- **US3 (Phase 4)**: Can start after Setup (Phase 1). Complete T015 (US2) before T019 to avoid a broken intermediate state where download functionality is missing from both components.
- **US4 (Phase 5)**: Depends on US1, US2, US3 being complete (verifies all components).
- **US5 (Phase 6)**: Depends on US1 and US2 (responsive checks on already-restyled components).
- **Polish (Phase 7)**: Depends on all user stories complete.

### User Story Dependencies

- **US1 (P1)**: Start after Setup → T004–T008 in parallel, then T009–T010
- **US2 (P1)**: Start after Setup → T011–T017 sequentially (same file), then T018
- **US3 (P2)**: Start after Setup + T015 → T019–T020 sequentially (same file)
- **US4 (P2)**: Start after US1 + US2 + US3 → T021–T022 are a verification pass
- **US5 (P2)**: Start after US1 + US2 → T023–T025 are responsive verification

### Parallel Opportunities Within Phases

- **Phase 1**: T002 and T003 can run in parallel (different files)
- **Phase 2 (US1)**: T004, T005, T007, T008 can all run in parallel after T001; T009, T010 can run in parallel after their respective component tasks
- **Phase 3 (US2)**: T011–T017 are sequential (all modify `QRControls.tsx`); T018 runs after T011–T017
- **Phase 4 (US3)**: T019 then T020
- **Phase 7**: T027 and T028 can run in parallel

---

## Parallel Example: User Story 1 Setup

```bash
# After T001 (lucide-react installed), launch in parallel:
Task: "Restyle ThemeToggle — src/components/common/ThemeToggle.tsx"          # T004
Task: "Restyle LanguageToggle — src/components/common/LanguageToggle.tsx"    # T005
Task: "Update QRGenerator card — src/components/feature/qr/QRGenerator.tsx" # T007
Task: "Update footer — src/App.tsx"                                          # T008
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2)

1. Complete Phase 1: Setup
2. Complete Phase 2: US1 — desktop layout (navbar, hero, card, footer, icon buttons)
3. Complete Phase 3: US2 — configuration controls (pills, color pickers, action buttons)
4. **STOP and VALIDATE**: Both P1 stories fully functional and visually correct
5. Deploy/demo if ready

### Incremental Delivery

1. Setup → Foundation ready
2. US1 → Navbar + layout correct → Demo ✅
3. US2 → All controls restyled → Demo ✅
4. US3 → Preview column correct → Demo ✅
5. US4 → Dark theme verified → Demo ✅
6. US5 → Mobile responsive → Demo ✅ Full feature complete

### Total Task Count

| Phase | Story | Tasks | Notes |
|---|---|---|---|
| Phase 1 | Setup | 3 | T001–T003 |
| Phase 2 | US1 (P1) | 7 | T004–T010; 4 parallelizable |
| Phase 3 | US2 (P1) | 8 | T011–T018; sequential (same file) |
| Phase 4 | US3 (P2) | 2 | T019–T020 |
| Phase 5 | US4 (P2) | 2 | T021–T022; verification pass |
| Phase 6 | US5 (P2) | 3 | T023–T025; verification pass |
| Phase 7 | Polish | 3 | T026–T028; 2 parallelizable |
| **Total** | | **28** | |

---

## Notes

- [P] tasks = different files, no shared-state dependencies
- All color references must use semantic token utilities — no hard-coded hex in component classes
- `bg-white` in QRPreview QR card is intentional (QR codes require white background)
- QRControls.tsx receives the most changes; tasks T011–T017 must be sequential
- Eye Shape uses a `<select>` wrapped with a positioned `<ChevronDown>` icon — preserves native accessibility while matching design
- Run `npm run test && npm run lint && npm run build` at each phase checkpoint
- Coverage threshold ≥85% must be maintained throughout
