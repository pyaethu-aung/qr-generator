# Tasks: Light/Dark Theme Toggle

**Input**: Design documents from `/specs/006-theme-toggle/`  
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, quickstart.md ✅

**Tests**: Testing is MANDATORY per Constitution Principle II. Run `npm run test`, `npm run lint`, and `npm run build` after every change. Every code change must add or update unit tests, all tests must pass before merge. Maintain project-wide coverage at or above 85%. UI changes MUST be verified on both desktop and mobile browsers per Principle VII.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Type definitions and core theme hook infrastructure

- [x] T001 [P] Create theme type definitions in `src/types/theme.ts`
- [x] T002 [P] Add inline theme script to prevent flash in `index.html`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core theme hook and provider that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T003 Implement `useTheme` hook with system preference detection in `src/hooks/useTheme.ts`
- [x] T004 Create `ThemeProvider` context with document class application in `src/hooks/ThemeProvider.tsx`
- [x] T005 Add unit tests for `useTheme` hook in `src/hooks/__tests__/useTheme.test.ts`
- [x] T006 Update CSS with theme variables and transition in `src/index.css`
- [x] T007 Wrap app with `ThemeProvider` in `src/main.tsx`
- [x] T008 Update `Layout` component for theme-aware styling in `src/components/Layout/Layout.tsx`

**Checkpoint**: Foundation ready - theme infrastructure works, user story implementation can begin

---

## Phase 3: User Story 1 - Toggle Theme Manually (Priority: P1) 🎯 MVP

**Goal**: Users can click a toggle button to switch between light and dark themes with smooth transitions

**Independent Test**: Click theme toggle button → UI colors change smoothly between light/dark

### Implementation for User Story 1

- [x] T009 [P] [US1] Create `ThemeToggle` component with target icon in `src/components/common/ThemeToggle.tsx`
- [x] T010 [P] [US1] Add unit tests for `ThemeToggle` in `src/components/common/__tests__/ThemeToggle.test.tsx`
- [x] T011 [US1] Add `ThemeToggle` to `Navbar` in `src/components/Navigation/Navbar.tsx`
- [x] T012 [US1] Update Navbar header styling for both themes in `src/components/Navigation/Navbar.tsx`
- [x] T013 [US1] Verify smooth transition (<300ms) on toggle - manual browser test

**Checkpoint**: User Story 1 complete - users can toggle theme manually with smooth transitions

---

## Phase 4: User Story 2 - Persist Theme Preference (Priority: P2)

**Goal**: Theme preference persists across browser sessions via localStorage

**Independent Test**: Select theme → close browser → reopen → same theme applied

### Implementation for User Story 2

- [x] T014 [US2] Add localStorage persistence tests to `src/hooks/__tests__/useTheme.test.ts`
- [x] T015 [US2] Verify localStorage key `qr-generator:theme-preference` stores correctly - manual test
- [x] T016 [US2] Test persistence across browser restart - manual verification

**Checkpoint**: User Story 2 complete - theme persists across sessions

---

## Phase 5: User Story 3 - Respect System Preference (Priority: P3)

**Goal**: First-time visitors see theme matching their OS preference

**Independent Test**: Clear localStorage → set OS to dark → visit site → dark theme applied

### Implementation for User Story 3

- [x] T017 [US3] Add system preference detection tests to `src/hooks/__tests__/useTheme.test.ts`
- [x] T018 [US3] Add system preference change listener tests to `src/hooks/__tests__/useTheme.test.ts`
- [x] T019 [US3] Test fallback behavior when prefers-color-scheme unavailable
- [x] T020 [US3] Manual verification: clear storage, change OS theme, verify app follows

**Checkpoint**: User Story 3 complete - system preference detection works

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final verification, accessibility, and cross-browser testing

- [ ] T021 [P] Verify keyboard accessibility (Tab, Enter/Space) on ThemeToggle
- [ ] T022 [P] Verify ARIA attributes and screen reader announcement
- [ ] T023 Test on Chrome, Safari, Firefox, Edge - desktop
- [ ] T024 Test on mobile viewport (responsive design)
- [ ] T025 Run `npm run test:coverage` and verify ≥85% coverage maintained
- [ ] T026 Final cleanup: remove any unused code, run lint

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational completion
  - US1 → US2 → US3 (sequential, each builds on previous)
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Depends on Foundational phase - core toggle functionality
- **User Story 2 (P2)**: Depends on US1 - persistence is an enhancement to toggle
- **User Story 3 (P3)**: Depends on Foundational - system detection runs on init, but testing depends on US1/US2

### Within Each Phase

- Tests should be written alongside implementation
- Component before integration
- Core implementation before polish
- Commit after each task

### Parallel Opportunities

**Phase 1**: T001 and T002 can run in parallel (different files)

**Phase 3**: T009 and T010 can run in parallel (component + test)

**Phase 6**: T021 and T022 can run in parallel (different accessibility aspects)

---

## Parallel Example: Phase 1

```bash
# Launch setup tasks together:
Task: "Create theme type definitions in src/types/theme.ts"
Task: "Add inline theme script to prevent flash in index.html"
```

## Parallel Example: User Story 1

```bash
# Launch component and tests together:
Task: "Create ThemeToggle component in src/components/common/ThemeToggle.tsx"
Task: "Add unit tests for ThemeToggle in src/components/common/__tests__/ThemeToggle.test.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T002)
2. Complete Phase 2: Foundational (T003-T008)
3. Complete Phase 3: User Story 1 (T009-T013)
4. **STOP and VALIDATE**: Theme toggle works, transitions smooth
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Theme infrastructure ready
2. Add User Story 1 → Test toggle → Deploy/Demo (MVP!)
3. Add User Story 2 → Test persistence → Deploy/Demo
4. Add User Story 3 → Test system detection → Deploy/Demo
5. Polish phase → Final quality checks

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story builds on previous but can be tested independently
- Run `npm run test && npm run lint && npm run build` after each task
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
