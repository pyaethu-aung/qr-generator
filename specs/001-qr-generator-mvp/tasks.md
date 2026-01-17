# Tasks: QR Generator MVP

**Feature Branch**: `feature/001-qr-generator-mvp`
**Spec**: [spec.md](./spec.md)
**Plan**: [plan.md](./plan.md)

## Phase 1: Setup
*Goal: Initialize dependencies and project structure.*

- [x] T001 Install dependencies (qrcode, qrcode.react, @types/qrcode) in package.json
- [x] T002 Create feature directory structure (src/components/feature/qr, src/types, src/data, src/utils)

## Phase 2: Foundational
*Goal: Create shared types, constants, and utility helpers required by the feature.*

- [x] T003 Create QRConfig interface and Enums in src/types/qr.ts
- [x] T004 Create default configuration constants (colors, ecLevel) in src/data/defaults.ts
- [x] T005 [P] Implement downloadBlob utility helper in src/utils/download.ts
- [x] T006 [P] Add unit tests for downloadBlob helper in src/utils/__tests__/download.test.tsx

## Phase 3: User Story 1 - Manual QR Generation (Priority: P1)
*Goal: Allow users to input text and manually trigger QR code generation.*
*Independent Test: Enter text, click "Generate", verify QR code appears.*

- [x] T007 [US1] Implement QRPreview component using qrcode.react in src/components/feature/qr/QRPreview.tsx
- [x] T008 [US1] Implement basic QRControls component (Input + Generate Button) in src/components/feature/qr/QRControls.tsx
- [x] T009 [US1] Implement useQRGenerator hook (state logic + generation handler) in src/hooks/useQRGenerator.ts
- [x] T010 [US1] Implement QRGenerator container component wiring hook to children in src/components/feature/qr/QRGenerator.tsx
- [x] T011 [US1] Update App.tsx to render QRGenerator component
- [ ] T012 [US1] Add integration test for Manual Generation flow in src/components/feature/qr/__tests__/QRGenerator.test.tsx

## Phase 4: User Story 2 - Download QR Assets (Priority: P1)
*Goal: Allow users to download the generated QR as PNG or SVG.*
*Independent Test: Generate QR, click Download PNG/SVG, verify file download.*

- [ ] T013 [US2] Update useQRGenerator hook to implement downloadPng (headless qrcode) and downloadSvg logic in src/hooks/useQRGenerator.ts
- [ ] T014 [US2] Update QRControls to add "Download PNG" and "Download SVG" buttons in src/components/feature/qr/QRControls.tsx
- [ ] T015 [US2] Add unit tests for download functions (mocking qrcode lib) in src/hooks/__tests__/useQRGenerator.test.tsx

## Phase 5: User Story 3 - Customize QR Colors (Priority: P2)
*Goal: Allow users to customize foreground/background colors and error correction level.*
*Independent Test: Change color/EC level, click Generate, verify visual update and download consistency.*

- [ ] T016 [US3] Update QRControls to add Color Pickers (FG/BG) and EC Level Select in src/components/feature/qr/QRControls.tsx
- [ ] T017 [US3] Update QRPreview to accept and render dynamic colors/EC level in src/components/feature/qr/QRPreview.tsx
- [ ] T018 [US3] Update useQRGenerator download logic to use customized config in src/hooks/useQRGenerator.ts
- [ ] T019 [US3] Add unit tests for configuration updates in src/components/feature/qr/__tests__/QRControls.test.tsx

## Final Phase: Polish & Cross-Cutting
*Goal: Ensure validation, accessibility, and styles are production-ready.*

- [ ] T020 Implement inline error validation (FR-004) for input length/content in src/hooks/useQRGenerator.ts
- [ ] T021 Apply final Tailwind styles and responsiveness in src/components/feature/qr/QRGenerator.tsx
- [ ] T022 Verify Accessibility (alt text, keyboard nav) across all components

## Dependencies
- US2 depends on US1 (Skeleton & Generator logic)
- US3 depends on US1 (Controls & Preview)
- T013 depends on T005 (Download helper)

## Implementation Strategy
We will build the MVP starting with Manual Generation (US1), followed by the critical Download features (US2), and finally add Customization attributes (US3). Each phase includes its own tests.
