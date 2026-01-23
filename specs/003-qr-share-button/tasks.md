# Tasks: QR PNG share button

**Input**: Design documents from `/specs/003-qr-share-button/`
**Prerequisites**: plan.md, spec.md (required); research.md, data-model.md, contracts/, quickstart.md (available)

**Tests**: Testing is MANDATORY per Constitution Principle II. Run `npm run test` and `npm run lint` after every change. Maintain ≥85% coverage. Each story adds/updates unit (and integration where applicable) tests before implementation.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Story label (US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

- [ ] T001 Confirm baseline passes via scripts in package.json (`npm run lint`, `npm run test`) to ensure clean state before changes. [package.json]

---

## Phase 2: Foundational (Blocking Prerequisites)

- [ ] T002 [P] Add share-related types (`SharePayload`, `ShareRequest`) to support PNG sharing flows in `src/types/qr.ts`.
- [ ] T003 Create share utility for WYSIWYG canvas→PNG blob/file generation with fixed filename `qr-code.png` in `src/utils/share.ts`.
- [ ] T004 Add capability detection helpers for `navigator.share`, `canShare(files)`, clipboard image write, and download fallback in `src/utils/share.ts` (uses types from T002).
- [ ] T005 Wire QR preview canvas ref exposure (if missing) to enable PNG capture in `src/components/feature/qr/QRPreview.tsx` or associated hook file.

**Checkpoint**: Foundation ready; user stories may proceed.

---

## Phase 3: User Story 1 - Share QR as PNG (Priority: P1) 🎯 MVP

**Goal**: Share current QR as PNG via native share sheet using WYSIWYG dimensions and fixed filename.
**Independent Test**: Generate QR → tap share button → native share sheet shows PNG attachment matching preview; recipient opens correct PNG.

### Tests for User Story 1

- [ ] T006 [P] [US1] Add unit tests for share button render/disabled states in `src/components/feature/qr/__tests__/QRPreview.test.tsx`.
- [ ] T007 [P] [US1] Add unit tests mocking `navigator.share` to verify PNG `File` payload (name `qr-code.png`, WYSIWYG size) in `src/components/feature/qr/__tests__/QRShareButton.test.tsx`.

### Implementation for User Story 1

- [ ] T008 [US1] Add share button UI beneath QR preview with correct styling and disabled logic when no QR in `src/components/feature/qr/QRPreview.tsx`.
- [ ] T009 [US1] Implement share handler using native share (`navigator.share` with `files`) consuming PNG generator/capability helpers in `src/hooks/useQRShare.ts` (new).
- [ ] T010 [US1] Connect share handler to QR preview component and ensure latest rendered QR canvas is used (debounce rapid taps) in `src/components/feature/qr/QRPreview.tsx`.

**Checkpoint**: User Story 1 independently shareable via native share.

---

## Phase 4: User Story 2 - Fallback when share unsupported (Priority: P2)

**Goal**: Provide working share alternatives (download/copy) when native share is unavailable or rejected.
**Independent Test**: In an environment without `navigator.share`, tapping share shows fallback that successfully saves/copies PNG.

### Tests for User Story 2

- [ ] T011 [P] [US2] Add tests for fallback selection (share unsupported → clipboard/download) in `src/components/feature/qr/__tests__/QRShareFallback.test.tsx`.

### Implementation for User Story 2

- [ ] T012 [P] [US2] Implement clipboard image fallback using `ClipboardItem` and `navigator.clipboard.write` in `src/hooks/useQRShare.ts`.
- [ ] T013 [P] [US2] Implement download fallback via object URL and `<a download>` in `src/utils/share.ts` and expose through `useQRShare`.
- [ ] T014 [US2] Add user-facing messaging for cancel/error and fallback outcomes (non-blocking toast/message) in `src/hooks/useQRShare.ts` and `src/components/feature/qr/QRPreview.tsx`.

**Checkpoint**: User Story 2 independently usable with fallbacks.

---

## Phase 5: User Story 3 - Mobile photo sharing compatibility (Priority: P3)

**Goal**: Ensure mobile sharing delivers clear PNG to common targets (messaging, files, photos) with fidelity and appropriate capability detection.
**Independent Test**: On mobile, share QR → target apps receive clear PNG; capability detection prefers file share when supported.

### Tests for User Story 3

- [ ] T015 [P] [US3] Add mobile-focused tests simulating `canShare({ files })` support and verifying PNG fidelity (size/color) in `src/components/feature/qr/__tests__/QRShareMobile.test.tsx`.

### Implementation for User Story 3

- [ ] T016 [P] [US3] Enhance capability detection to prioritize file-based share on mobile and guard non-supported `canShare` paths in `src/utils/share.ts` and `src/hooks/useQRShare.ts`.
- [ ] T017 [US3] Ensure WYSIWYG PNG fidelity for mobile exports (respect preview dimensions, colors, error correction) and reuse filename in `src/hooks/useQRShare.ts` and `src/components/feature/qr/QRPreview.tsx`.

**Checkpoint**: User Story 3 independently compatible on mobile targets.

---

## Phase 6: Polish & Cross-Cutting Concerns

- [ ] T018 [P] Add accessibility affordances (aria-label, focus/keyboard) for share button in `src/components/feature/qr/QRPreview.tsx`.
- [ ] T019 [P] Update docs with share usage/fallback notes in `specs/003-qr-share-button/quickstart.md` and `README.md`.
- [ ] T020 Run full validation: `npm run lint`, `npm run test`, `npm run build` from repo root to confirm release readiness. [package.json]

---

## Dependencies & Execution Order

- Setup (Phase 1) → Foundational (Phase 2) → US1 (P1) → US2 (P2) → US3 (P3) → Polish.
- US2 and US3 depend on foundational helpers and may run after US1 but should remain independently testable.
- Tests in each story should be added before feature code within that story.

## Parallel Execution Examples

- US1: T006 and T007 can run in parallel; after tests, T008 (UI) and T009 (hook) can progress concurrently if coordinating on `QRPreview` vs `useQRShare`.
- US2: T012 (clipboard) and T013 (download) can run in parallel; T011 (tests) can be written in parallel with implementations using mocks.
- US3: T015 (mobile tests) can proceed in parallel with T016 (capability enhancement); T017 follows capability updates.

## Implementation Strategy

- MVP: Complete Phases 1–3; deliver native share with PNG fidelity.
- Incremental: Add fallbacks (Phase 4) then mobile-specific robustness (Phase 5); each story shippable independently.
- Always finish with Phase 6 polish and full validation.
