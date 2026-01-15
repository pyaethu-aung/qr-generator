---
description: "Task list for QR Code Generator MVP"
---

# Tasks: QR Code Generator MVP

**Input**: Design documents from `/specs/001-qr-generator-mvp/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md

**Tests**: Testing is MANDATORY per Constitution Principle II. Every user story implementation includes corresponding unit and integration tests.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Initialize Vite project with React + TypeScript in `.`
- [x] T002 Install dependencies (`qrcode.react`, `qrcode`, `clsx`, `tailwind-merge`, `tailwindcss`, `autoprefixer`, `postcss`)
- [x] T003 [P] Configure ESLint, Prettier, and Vitest in project root

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure and shared components required by all stories

- [ ] T004 [P] Create shared types `QRConfig` and `ValidationResult` in `src/types/index.ts`
- [ ] T005 [P] Setup Tailwind CSS configuration in `tailwind.config.js` and `src/index.css`
- [ ] T006 [P] Create reusable `Button` component in `src/components/common/Button.tsx`
- [ ] T007 [P] Create reusable `Card` container component in `src/components/common/Card.tsx`
- [ ] T008 [P] Create reusable `Input` component in `src/components/common/Input.tsx`

**Checkpoint**: Foundation ready - UI primitives and types available.

## Phase 3: User Story 1 - Real-time QR Generation (Priority: P1)

**Goal**: User types text/URL and sees an instant QR preview.

**Independent Test**: Load page, type "test", verify QR code SVG appears on screen without page reload.

### Tests for US1

- [ ] T009 [P] [US1] Create unit tests for validation logic in `src/utils/validation.test.ts`
- [ ] T010 [P] [US1] Create component tests for QRPreview rendering in `src/components/qr/QRPreview.test.tsx`

### Implementation for US1

- [ ] T011 [P] [US1] Implement `validateInput` utility in `src/utils/validation.ts`
- [ ] T012 [P] [US1] Implement `useQR` hook (state & validation logic) in `src/hooks/useQR.ts`
- [ ] T013 [P] [US1] Create `QRForm` component (wraps Input) in `src/components/qr/QRForm.tsx`
- [ ] T014 [P] [US1] Create `QRPreview` component (wraps qrcode.react) in `src/components/qr/QRPreview.tsx`
- [ ] T015 [US1] Assemble Main Layout and US1 components in `src/App.tsx`

**Checkpoint**: App displays valid QR codes from input.

## Phase 4: User Story 2 - Download QR Assets (Priority: P1)

**Goal**: User can download the generated QR as PNG or SVG.

**Independent Test**: Generate QR, click "Download PNG", verify file download event and content type.

### Tests for US2

- [ ] T016 [P] [US2] Create unit tests for download utility (mocking DOM/Blob) in `src/utils/download.test.ts`

### Implementation for US2

- [ ] T017 [P] [US2] Implement `downloadQR` utility (using `qrcode` lib) in `src/utils/download.ts`
- [ ] T018 [P] [US2] Create `QRDownload` component (buttons) in `src/components/qr/QRDownload.tsx`
- [ ] T019 [US2] Integrate `QRDownload` component into main view in `src/App.tsx`

**Checkpoint**: Download buttons function correctly.

## Final Phase: Polish & Cross-cutting

- [ ] T020 [P] Verify accessibility (ARIA labels, keyboard nav) across all components
- [ ] T021 [P] Run Lighthouse performance check and optimize assets if needed

## Dependencies

- Phase 1 & 2 must be complete before Phase 3/4.
- Phase 3 (Generation) is a logical prerequisite for Phase 4 (Download), though compoments can be built in parallel.

## Parallel Execution Opportunities

- T006, T007, T008 (UI Components) can be built simultaneously.
- T011 (Validation) and T012 (Hook) can be built in parallel with T013/T014 (UI).
- T016 (Download Logic) is independent of the UI work in Phase 3.
