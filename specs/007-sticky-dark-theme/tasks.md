# Tasks: Sticky Dark Theme

**Feature Branch**: `007-sticky-dark-theme`

## Dependencies

1. **Phase 1: Setup** must complete before **Phase 3** (Toast needed for toggle interaction).
2. **Phase 2: Foundational** must complete before **Phase 3** (Theme logic overrides needed before verification).
3. **Phase 3: US1 (Forced Dark)** and **Phase 4: US2 (Disabled Toggle)** can be implemented in parallel after Phase 1 & 2.

## Implementation Strategy

We will first build the new `Toast` component to satisfy the "visual feedback" requirement. Then, we will modify the core `useTheme` hook to enforce dark mode. Finally, we will update the `ThemeToggle` component to be disabled and show the toast on hover.

---

## Phase 1: Setup
**Goal**: Create reusable components required for the feature.
**Independent Test**: `Toast` component renders correctly and accepts message props.

- [ ] T001 Create `Toast` component in `src/components/common/Toast.tsx` with Prop interface

## Phase 2: Foundational
**Goal**: Implement the core logic override for forced dark mode.
**Independent Test**: Application loads in dark mode regardless of `localStorage` or system settings.

- [ ] T002 Implement forced dark mode logic in `src/hooks/useTheme.ts`
    - **Constraint**: Initialize state to 'dark' always.
    - **Constraint**: Disable `toggleTheme` functionality.
    - **Constraint**: Add `// TODO` comments for reversibility as per plan.

## Phase 3: User Story 1 - Dark Theme as Perpetual Default (P1)
**Goal**: Verify and enforce dark theme persistence.
**Independent Test**: Manually verify `localStorage` interactions are ignored.

- [ ] T003 [US1] Verify `useTheme` ignores `localStorage` 'light' value (Manual Verification task)
- [ ] T004 [US1] Verify system color scheme changes are ignored (Manual Verification task)

## Phase 4: User Story 2 - Interaction with Disabled Toggle (P2)
**Goal**: Update UI to reflect disabled state and provide feedback.
**Independent Test**: Button looks disabled and shows toast on hover.

- [ ] T005 [US2] Update `src/components/common/ThemeToggle.tsx` to add visual disabled state (opacity, cursor)
- [ ] T006 [US2] Implement hover interaction in `src/components/common/ThemeToggle.tsx` to trigger `Toast`
- [ ] T007 [US2] Add "Coming soon" message to `ThemeToggle` hover logic

## Phase 5: Polish & Verification
**Goal**: Final clean up and comprehensive testing.

- [ ] T008 Verify no console errors related to theme switching
- [ ] T009 [P] Run full build and lint check
- [ ] T010 Prepare final walkthrough with screenshots of disabled toggle and toast
