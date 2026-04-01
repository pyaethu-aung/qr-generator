# Tasks: Custom QR Shapes

**Input**: Design documents from `/specs/023-custom-qr-shapes/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md

**Tests**: Tests are explicitly requested by project Constitution (Unit testing in src/utils, components, and hooks).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., [US1], [US2])
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure updates

- [x] T001 Update `src/types/qr.ts` with explicit enums for `QREyeShape` and `QRPixelPattern` types.
- [x] T002 Initialize default custom shape properties and ensure `localStorage` persistence inside `src/hooks/useQRDesign.ts`.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T003 Create unit test scaffold in `src/utils/qrShapeRenderer.test.ts`, asserting against the minimum 85% coverage benchmark.
- [x] T004 Implement generic parsing of `qrcode.create()` grid size and positional detection blocks in `src/utils/qrShapeRenderer.ts`.

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Change Eye Shapes (Priority: P1) 🎯 MVP

**Goal**: Allow users to swap the three position markers with custom geometries (Rounded, Diamond, Leaf, Hexagon).

**Independent Test**: Can successfully render, preview, and download a basic payload QR with 'Leaf' corners.

### Tests for User Story 1 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T005 [P] [US1] Add unit test assertions for expected geometric corner offsets in `src/utils/qrShapeRenderer.test.ts`
- [x] T006 [P] [US1] Add unit tests for `useQRDesign` hook state updates regarding eye shapes in `src/hooks/useQRDesign.test.ts`
- [x] T007 [P] [US1] Add component tests for eye shape selection UI in `src/components/QRDesignOptions.test.tsx`

### Implementation for User Story 1

- [x] T008 [US1] Implement precise mathematical SVG coordinates for `Rounded`, `Diamond`, `Leaf`, and `Hexagon` inside `src/utils/qrShapeRenderer.ts`
- [x] T009 [US1] Refactor `src/components/QRCodePreview.tsx` to handle custom generated SVG paths when non-square eye shapes are active.
- [x] T010 [US1] Construct the shape selection dropdowns in `src/components/QRDesignOptions.tsx` using `role="group"` and proper ARIA labels.

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Customize Pixel Pattern Shapes (Priority: P2)

**Goal**: Swap the data grid body into dots, while displaying a dismissible warning if readability degrades.

**Independent Test**: Switching to "Dots" on a dense URL correctly fires the warning banner without preventing user downloads.

### Tests for User Story 2 ⚠️

- [x] T011 [P] [US2] Enhance testing for accurate dot radius coordinate mapping in `src/utils/qrShapeRenderer.test.ts`
- [x] T012 [P] [US2] Add unit tests verifying `isRiskyPattern` logic triggers correctly in `src/hooks/useQRDesign.test.ts`

### Implementation for User Story 2

- [x] T013 [US2] Apply core data pixel styling logic (Circles instead of pure paths) in `src/utils/qrShapeRenderer.ts`
- [x] T014 [US2] Introduce "Pixel Pattern" mode toggle within `src/components/QRDesignOptions.tsx`
- [x] T015 [US2] Implement hook flagging logic (`isRiskyPattern`) for high density dots inside `src/hooks/useQRDesign.ts`
- [x] T016 [US2] Integrate the dismissible UI warning element directly inside `src/components/QRCodePreview.tsx`

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T017 Verify correct DOM layering for image download operations AND ensure SVG paths are properly serialized for PDF export via `jspdf` in `src/hooks/useQRShare.ts`.
- [x] T018 Run validation checks: `npm run test && npm run lint && npm run build` securely in project root `package.json`.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - May integrate with US1 but should be independently testable

### Within Each User Story

- Tests (if included) MUST be written and FAIL before implementation
- Models before services
- Services before endpoints
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- All tests for a user story marked [P] can run in parallel (T005, T006, T007)

---

## Parallel Example: User Story 1

```bash
# Launch tests for User Story 1 together:
Task: "Add unit test assertions for expected geometric corner offsets in src/utils/qrShapeRenderer.test.ts"
Task: "Add unit tests for useQRDesign hook state updates... in src/hooks/useQRDesign.test.ts"
Task: "Add component tests for eye shape selection UI in src/components/QRDesignOptions.test.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Each story adds value without breaking previous stories
