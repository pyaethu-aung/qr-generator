---

description: "Task list template for feature implementation"
---

# Tasks: Fix Mobile Layout Overflow

**Input**: Design documents from `/specs/005-fix-mobile-overflow/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md (empty)

**Tests**: Testing is MANDATORY per Constitution Principle II. Run `npm run test`, `npm run lint`, and `npm run build` after every change. Every code change must add or update unit tests, all tests must pass before merge. Additionally, UI changes MUST be verified on both desktop and mobile browsers per Principle VII.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure updates for mobile responsiveness

- [ ] T001 Verify project running and tests passing locally in `npm run test`
- [ ] T002 Update `tailwind.config.js` or `index.css` to ensure standard breakpoints (sm: 640px, md: 768px) and utilities (break-all, break-words) are available

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core UI components that must be responsive before User Stories can be fully addressed

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T003 [P] Create `src/components/Navigation/Navbar.tsx` shell for navigation logic
- [ ] T004 [P] Ensure `src/components/Layout/Layout.tsx` (or equivalent main wrapper) has `max-w-full overflow-x-hidden` on the root container

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - View Content Without Horizontal Scroll (Priority: P1) 🎯 MVP

**Goal**: Ensure no horizontal scroll appears on mobile viewports (320px+) for general content.

**Independent Test**: Open app at 320px width, scroll vertically, verify no horizontal sway or scrollbar.

### Implementation for User Story 1

- [ ] T005 [P] [US1] Create reproduction test case for horizontal overflow if possible, or manual verification script in `tests/manual-verification.md`
- [ ] T006 [P] [US1] Update global CSS in `src/index.css` to enforce `word-break: break-word` on body or standard text containers
- [ ] T007 [US1] Apply `word-break: break-all` utility to QR code hash/URL display containers in `src/components/QRCodeDisplay.tsx` (or relevant component)
- [ ] T008 [US1] Audit and fix main container widths in `src/App.tsx` or page components to ensure `max-w-[100vw]` or `w-full` usage
- [ ] T009 [US1] Verify no horizontal scroll on 320px viewport manually

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Access All Interactive Elements (Priority: P1)

**Goal**: Ensure interactive elements (forms, buttons, nav) are visible and usable on mobile.

**Independent Test**: Verify form inputs are stacked and navigation is accessible via hamburger menu on mobile.

### Implementation for User Story 2 (Navigation)

- [ ] T010 [P] [US2] Install `lucide-react` (if not present) for Menu/X icons
- [ ] T011 [US2] Implement `src/components/Navigation/HamburgerMenu.tsx` component with `isOpen` state
- [ ] T012 [US2] Update `src/components/Navigation/Navbar.tsx` to switch between Desktop Links and Hamburger Button at `md` breakpoint
- [ ] T013 [US2] Add mobile menu overlay logic in `src/components/Navigation/Navbar.tsx` (toggle visibility on click)

### Implementation for User Story 2 (Forms)

- [ ] T014 [P] [US2] Update `src/components/QRForm.tsx` (or main input form) to use `flex-col` on mobile and `flex-row` on desktop (`md:flex-row`)
- [ ] T015 [US2] Ensure all button containers wrap or stack correctly on mobile in `src/components/QRForm.tsx`

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T016 [P] Run full build `npm run build` and verify output size
- [ ] T017 Cross-browser manual check (Safari/Chrome Mobile Simulator)
- [ ] T018 Code cleanup (remove any temporary styles used for debugging)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies
- **Foundational (Phase 2)**: Depends on Setup
- **User Stories (Phase 3+)**: Depend on Foundational
  - US1 (Content Overflow) and US2 (Interactive Elements) are technically independent but US2 (Forms/Nav) often CAUSES the overflow in US1.
  - Recommended Order: US1 (Global Text Fixes) -> US2 (Layout/Nav Structural Fixes).

### Parallel Opportunities

- T011 (Hamburger component) and T014 (Form CSS updates) can be done in parallel.
- T006 (Global CSS) and T007 (Specific Component CSS) can be done in parallel.

---

## Implementation Strategy

### MVP First (User Story 1 + 2 Core)

1. **Fix Text Overflow (US1)**: This is "low hanging fruit" to stop huge URLs from breaking layout.
2. **Fix Form Layout (US2)**: Often the widest element on the page; stacking it solves significant overflow.
3. **Fix Navigation (US2)**: The final step to make the header usable.
4. **Validate**: Check 320px viewport for all pages.
