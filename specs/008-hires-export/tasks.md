# Tasks: High-Resolution Export Suite

**Input**: Design documents from `/specs/008-hires-export/`  
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, quickstart.md ✅

**Tests**: Testing is MANDATORY per Constitution Principle II. Run `npm run test`, `npm run lint`, and `npm run build` after every change. Every code change must add or update unit tests, all tests must pass before merge, and every user story implementation must include corresponding unit and integration tests unless explicitly waived. **Every utility function in `src/utils/` MUST have a corresponding unit test.** Maintain project-wide coverage at or above 85%. Additionally, UI changes MUST be verified on both desktop and mobile browsers per Principle VII, MUST consider dark/light theme support per Principle VIII, and React components MUST be audited against `vercel-react-best-practices` and UI/UX decisions against `web-design-guidelines` per Principle IX. **All components MUST include ARIA attributes.** Commit discipline: commit each phase after completion following the 50/72 rule (subject ≤50 chars, body ≤72 chars per line) with conventional commit prefixes.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- For this project, default web SPA structure uses `src/components`, `src/hooks`, `src/utils`, `src/data`, and `src/types`
- Export utilities grouped under `src/utils/export/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and dependency installation

- [x] T001 Install jspdf dependency via `npm install jspdf`
- [x] T002 [P] Create export types in `src/types/export.ts` (ExportFormat, DimensionPreset, DpiPreset, ExportState, ExportAction, ExportPayload)
- [x] T003 [P] Create export directory structure `src/utils/export/`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core utilities that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 [P] Create `src/utils/export/exportCalculations.ts` with `calculateScaleFactor()`, `dpiToPageSize()`, `generateFilename()` functions
- [x] T005 [P] Create `src/utils/export/__tests__/exportCalculations.test.ts` with unit tests for scale factor, DPI conversion, filename generation
- [x] T006 Create `src/hooks/useExportState.ts` with useReducer-based state management (OPEN_MODAL, CLOSE_MODAL, SET_FORMAT, SET_DIMENSION, SET_DPI, START_EXPORT, EXPORT_SUCCESS, EXPORT_ERROR actions)
- [x] T007 Create `src/hooks/__tests__/useExportState.test.ts` with unit tests for reducer state transitions
- [x] T008 Run validation: `npm run test && npm run lint && npm run build`

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Download QR Code as PNG (Priority: P1) 🎯 MVP

**Goal**: Users can download QR codes as PNG images at preset dimensions (500px, 1000px, 2000px)

**Independent Test**: Generate a QR code, open export modal, select PNG format with 1000px, verify downloaded file is 1000x1000px PNG that decodes correctly

### Implementation for User Story 1

- [x] T009 [P] [US1] Create `src/utils/export/pngExporter.ts` with `exportPng(canvas, dimension)` function using Canvas scaling (OffscreenCanvas for 2000px per react-best-practices)
- [x] T010 [P] [US1] Create `src/utils/export/__tests__/pngExporter.test.ts` with unit tests for blob generation, dimension accuracy, worker fallback
- [x] T011 [P] [US1] Create `src/components/common/ExportModal.tsx` with modal overlay, backdrop click to close, focus trap, Escape key handling, ARIA attributes (`role="dialog"`, `aria-modal="true"`, `aria-labelledby`)
- [x] T012 [P] [US1] Create `src/components/common/FormatSelector.tsx` with radio group for PNG/SVG/PDF selection, ARIA labels, format descriptions
- [x] T013 [P] [US1] Create `src/components/common/DimensionSelector.tsx` with preset buttons (500px, 1000px, 2000px), DPI selector, ARIA labels
- [x] T014 [US1] Modify `src/components/feature/qr/QRPreview.tsx` to add Download button next to Share button, disabled when QR empty with tooltip
- [x] T015 [US1] Integrate ExportModal into QRPreview via React portal
- [x] T016 [US1] Add i18n keys to `src/data/i18n/en.json`: modal title, PNG format label, dimension labels, download button, error messages
- [x] T017 [US1] Add i18n keys to `src/data/i18n/my.json` with Burmese translations
- [x] T018 [P] [US1] Create `src/components/common/__tests__/ExportModal.test.tsx` with tests for open/close, keyboard navigation, ARIA attributes, format selection
- [x] T019 [US1] Run validation: `npm run test && npm run lint && npm run build`

**Checkpoint**: User Story 1 complete - users can download QR codes as PNG

---

## Phase 4: User Story 2 - Download QR Code as SVG (Priority: P2)

**Goal**: Users can download QR codes as scalable vector graphics (SVG)

**Independent Test**: Generate a QR code, select SVG format, download, open in vector editor (Figma/Illustrator) and verify infinite scalability and color preservation

### Implementation for User Story 2

- [x] T020 [P] [US2] Create `src/utils/export/svgExporter.ts` with `exportSvg(value, config)` function using `qrcode.toString({ type: 'svg' })`, preserving colors
- [x] T021 [P] [US2] Create `src/utils/export/__tests__/svgExporter.test.ts` with unit tests for SVG string validity, color preservation
- [x] T022 [US2] Integrate SVG export into ExportModal flow in `src/components/common/ExportModal.tsx`
- [x] T023 [US2] Add SVG-specific i18n keys to `src/data/i18n/en.json` and `src/data/i18n/my.json`
- [x] T024 [US2] Run validation: `npm run test && npm run lint && npm run build`

**Checkpoint**: User Stories 1 AND 2 complete - users can download PNG or SVG

---

## Phase 5: User Story 3 - Download QR Code as PDF (Priority: P3)

**Goal**: Users can download print-ready PDFs with QR codes at specific DPI settings (72, 150, 300 DPI)

**Independent Test**: Generate a QR code, select PDF format with 300 DPI, download, open in PDF reader and verify print-quality rendering

### Implementation for User Story 3

- [x] T025 [P] [US3] Create `src/utils/export/pdfExporter.ts` with `exportPdf(value, config)` function using jspdf with SVG embedding for vector quality
- [x] T026 [P] [US3] Create `src/utils/export/__tests__/pdfExporter.test.ts` with unit tests for PDF blob generation, dimension accuracy
- [x] T027 [US3] Integrate PDF export into ExportModal flow in `src/components/common/ExportModal.tsx`
- [x] T028 [US3] Show DPI selector only when PDF format is selected in DimensionSelector
- [x] T029 [US3] Add PDF-specific i18n keys to `src/data/i18n/en.json` and `src/data/i18n/my.json`
- [x] T030 [US3] Run validation: `npm run test && npm run lint && npm run build`

**Checkpoint**: User Stories 1, 2, AND 3 complete - users can download PNG, SVG, or PDF

---

## Phase 6: User Story 4 - Accessible Download Modal (Priority: P2)

**Goal**: Full keyboard navigation and screen reader support for the export modal

**Independent Test**: Navigate entire modal using only Tab and Enter keys, verify all options announced by screen reader (VoiceOver/NVDA)

### Implementation for User Story 4

- [x] T031 [US4] Audit ExportModal for keyboard navigation: Tab through all controls, Enter to select, Escape to close
- [x] T032 [US4] Verify focus management: focus trapped inside modal, focus returns to Download button on close
- [x] T033 [US4] Add `aria-describedby` for format descriptions, DPI descriptions
- [x] T034 [US4] Add screen reader-only status announcements for export progress and completion
- [x] T035 [P] [US4] Add accessibility tests to `src/components/common/__tests__/ExportModal.test.tsx` for focus trap, keyboard events, ARIA announcements
- [x] T036 [US4] Run validation: `npm run test && npm run lint && npm run build`

**Checkpoint**: All user stories complete with full accessibility

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T037 [P] Verify dark/light theme support in ExportModal and all child components
- [x] T038 [P] Test mobile responsiveness: stack layout on small screens, touch-friendly targets
- [x] T039 [P] Test mobile export: iOS Safari share sheet, Android Chrome direct download
- [x] T040 Run full test suite with coverage: `npm run test:coverage`
- [x] T041 Run quickstart.md validation manually
- [x] T042 Final validation: `npm run test && npm run lint && npm run build`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - US1 (PNG) can start immediately after Foundational
  - US2 (SVG) can run in parallel with US1 (different utility file)
  - US3 (PDF) can run in parallel with US1/US2 (different utility file)
  - US4 (Accessibility) depends on US1 modal being complete
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

| Story | Depends On | Can Parallelize |
|-------|------------|-----------------|
| US1 (PNG) | Phase 2 | Yes - start immediately |
| US2 (SVG) | Phase 2 | Yes - parallel with US1 |
| US3 (PDF) | Phase 2 | Yes - parallel with US1/US2 |
| US4 (A11y) | US1 (modal exists) | After US1 or in parallel late phase |

### Within Each User Story

- Tests written alongside implementation (not strict TDD for this feature)
- Utility functions before component integration
- Component implementation before i18n
- Validation at end of each story

### Parallel Opportunities

#### Phase 2 (Foundational)
```
T004 exportCalculations.ts ─┐
T005 exportCalculations.test.ts ─┤── Can run in parallel
```

#### Phase 3 (US1 - PNG)
```
T009 pngExporter.ts ─┐
T010 pngExporter.test.ts ─┤
T011 ExportModal.tsx ─┤── Can run in parallel
T012 FormatSelector.tsx ─┤
T013 DimensionSelector.tsx ─┘
```

#### Across Stories
```
US1 (PNG tasks) ─┐
US2 (SVG tasks) ─┤── Can run in parallel by different developers
US3 (PDF tasks) ─┘
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (PNG export)
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready - users can download PNG!

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add User Story 1 (PNG) → Test independently → Deploy (MVP!)
3. Add User Story 2 (SVG) → Test independently → Deploy
4. Add User Story 3 (PDF) → Test independently → Deploy
5. Add User Story 4 (A11y) → Final polish → Deploy
6. Each story adds value without breaking previous stories

---

## Summary

| Metric | Value |
|--------|-------|
| **Total Tasks** | 42 |
| **Phase 1 (Setup)** | 3 tasks |
| **Phase 2 (Foundational)** | 5 tasks |
| **US1 (PNG)** | 11 tasks |
| **US2 (SVG)** | 5 tasks |
| **US3 (PDF)** | 6 tasks |
| **US4 (A11y)** | 6 tasks |
| **Polish** | 6 tasks |
| **Parallel Opportunities** | 18 tasks marked [P] |
| **Suggested MVP** | Phase 1-3 (US1 only) = 19 tasks |

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each phase following 50/72 rule
- Stop at any checkpoint to validate story independently
