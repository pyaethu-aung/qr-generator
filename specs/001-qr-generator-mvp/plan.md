# Implementation Plan: QR Generator MVP

**Branch**: `feature/001-qr-generator-mvp` | **Date**: 2026-01-17 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `specs/001-qr-generator-mvp/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Implement a client-side only QR code generator using React 19 and Tailwind CSS. The app will include a "Generate" button, options for Color/ECC Level, and download capability for 1024px PNGs and SVGs.

## Technical Context

**Language/Version**: TypeScript 5.x (React 19)
**Primary Dependencies**: React 19, Vite 7, Tailwind CSS v4, `qrcode.react` (display), `qrcode` (generation/download)
**Storage**: N/A (Client-side state only; session persistence not required for MVP)
**Testing**: Vitest, React Testing Library (Minimum 80% coverage)
**Target Platform**: Modern Web Browsers (Chrome, Firefox, Safari, Edge)
**Project Type**: Web (SPA)
**Performance Goals**: Generation latency < 200ms after button click.
**Constraints**: Fully offline capable (no backend), Zero-knowledge (no logging)
**Scale/Scope**: ~3-5 components (Input, Preview, Controls, Layout)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **Code Quality**: Linting/Formatting active.
- [x] **Testing Standards**: All components must have unit tests. Helper logic tested.
- [x] **UX Consistency**: Matches existing UI patterns (Input/Button).
- [x] **Performance**: Client-side generation ensures < 200ms latency on click.
- [x] **Architecture**: Follows `src/components`, `src/hooks`, `src/utils`.

## Project Structure

### Documentation (this feature)

```text
specs/001-qr-generator-mvp/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── common/          # Reusable UI (Input, Button - existing)
│   └── feature/
│       └── qr/          # QR Generator feature components
│           ├── QRPreview.tsx
│           ├── QRControls.tsx
│           └── QRGenerator.tsx # Container
├── hooks/
│   └── useQRGenerator.ts # Logic for state & download
├── utils/
│   └── download.ts      # Helper to save Blobs/Data URLs
├── data/
│   └── defaults.ts      # Default config values
└── types/
    └── qr.ts            # QRConfig interface
```

**Structure Decision**: Option 1 (Single project), refined for feature isolation in `src/components/feature/qr`.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
