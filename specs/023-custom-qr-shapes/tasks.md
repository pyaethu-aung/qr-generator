# Tasks: Custom QR Shapes

**Input**: Design documents from `/specs/023-custom-qr-shapes/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md

**Tests**: Tests are explicitly requested by project Constitution (Unit testing in src/utils).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., [US1], [US2])
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure updates

- [ ] T001 Update `src/types/qr.ts` with explicit enums for `QREyeShape` and `QRPixelPattern` types.
- [ ] T002 Initialize default custom shape properties inside configuration defaults in `src/hooks/useQRDesign.ts`.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T003 Create unit test scaffold in `src/utils/qrShapeRenderer.test.ts`, asserting against the minimum 85% coverage benchmark.
- [ ] T004 Implement generic parsing of `qrcode.create()` grid size and positional detection blocks in `src/utils/qrShapeRenderer.ts`.

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Change Eye Shapes (Priority: P1) 🎯 MVP

**Goal**: Allow users to swap the three position markers with custom geometries (Rounded, Diamond, Leaf, Hexagon).

**Independent Test**: Can successfully render, preview, and download a basic payload QR with 'Leaf' corners.

### Tests for User Story 1 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T005 [P] [US1] Add unit test assertions for expected geometric corner offsets in `src/utils/qrShapeRenderer.test.ts`

### Implementation for User Story 1

- [ ] T006 [US1] Implement precise mathematical SVG coordinates for `Rounded`, `Diamond`, `Leaf`, and `Hexagon` inside `src/utils/qrShapeRenderer.ts`
- [ ] T007 [US1] Refactor `src/components/QRCodePreview.tsx` to handle custom generated SVG paths when non-square eye shapes are active.
- [ ] T008 [US1] Construct the shape selection dropdowns in `src/components/QRDesignOptions.tsx` using `role="group"` and proper ARIA labels.

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Customize Pixel Pattern Shapes (Priority: P2)

**Goal**: Swap the data grid body into dots, while displaying a dismissible warning if readability degrades.

**Independent Test**: Switching to "Dots" on a dense URL correctly fires the warning banner without preventing user downloads.

### Tests for User Story 2 ⚠️

- [ ] T009 [P] [US2] Enhance testing for accurate dot radius coordinate mapping in `src/utils/qrShapeRenderer.test.ts`

### Implementation for User Story 2

- [ ] T010 [US2] Apply core data pixel styling logic (Circles instead of pure paths) in `src/utils/qrShapeRenderer.ts`
- [ ] T011 [US2] Introduce "Pixel Pattern" mode toggle within `src/components/QRDesignOptions.tsx`
- [ ] T012 [US2] Implement hook flagging logic (`isRiskyPattern`) for high density dots inside `src/hooks/useQRDesign.ts`
- [ ] T013 [US2] Integrate the dismissible UI warning element directly inside `src/components/QRCodePreview.tsx`

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T014 Verify correct DOM layering for image download operations in `src/hooks/useQRShare.ts`
- [ ] T015 Run validation checks: `npm run test && npm run lint && npm run build` securely in project root `package.json`

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
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- All tests for a user story marked [P] can run in parallel
- Models within a story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch tests and UI components for User Story 1 together:
Task: "Add unit test assertions for expected geometric corner offsets in src/utils/qrShapeRenderer.test.ts"
Task: "Construct the shape selection dropdowns in src/components/QRDesignOptions.tsx"
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
