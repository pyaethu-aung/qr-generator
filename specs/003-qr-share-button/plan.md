# Implementation Plan: QR PNG share button

**Branch**: `feature/003-qr-share-button` | **Date**: 2026-01-23 | **Spec**: [specs/003-qr-share-button/spec.md](specs/003-qr-share-button/spec.md)
**Input**: Feature specification from `/specs/003-qr-share-button/spec.md`

**Note**: Filled via `/speckit.plan` workflow.

## Summary

Add a share button under the QR preview that shares the currently rendered QR as a PNG (WYSIWYG dimensions) via the native share sheet when available, with fallbacks to download/copy on unsupported environments. Preserve fidelity and provide user-visible confirmation on error/cancel.

## Technical Context

**Language/Version**: TypeScript, React 18, Vite 5  
**Primary Dependencies**: react, react-dom, qrcode.react (QR rendering), tailwindcss; browser APIs `navigator.share`, `ClipboardItem`, `HTMLCanvasElement.toDataURL`  
**Storage**: N/A (client-side only)  
**Testing**: Vitest, @testing-library/react, jsdom  
**Target Platform**: Modern desktop and mobile browsers (PWA-like SPA)  
**Project Type**: Web SPA (single project)  
**Performance Goals**: Share initiation→completion in ≤3s for standard QR; maintain existing QR render speed  
**Constraints**: Must use WYSIWYG PNG dimensions matching preview; maintain >85% coverage; adhere to structure and lint rules  
**Scale/Scope**: Single QR generator UI; no backend changes

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Tests, lint, and build MUST be run locally after every change via `npm run test`, `npm run lint`, and `npm run build` per constitution.
- Unit and integration tests MUST be added/updated for each change; maintain coverage ≥85%.
- Structure adherence: UI in `src/components`, hooks in `src/hooks`, utilities in `src/utils`, data shapers in `src/data`, shared types in `src/types`.
- Remove unused code/assets; no commented-out blocks committed.
- Commit discipline: commit each task; commit titles ≤50 chars and commit body lines ≤72 chars.
- CI gates (lint, test, build) MUST pass; PR review is mandatory.

## Project Structure

### Documentation (this feature)

```text
specs/003-qr-share-button/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
└── tasks.md (from /speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── feature/qr/            # QR UI, share button placement
│   └── common/                # shared UI components
├── hooks/                     # stateful logic (e.g., share helpers if hook-based)
├── utils/                     # pure helpers (e.g., download/copy utilities)
├── data/                      # defaults and i18n
└── types/                     # shared TS types

tests/
├── unit/                      # component and hook unit tests (co-located via __tests__ in src)
├── integration/               # integration tests if added for share flows
└── contract/                  # none anticipated
```

**Structure Decision**: Use existing single-project SPA structure; QR UI changes in `src/components/feature/qr`, helpers in `src/utils`, optional share hook in `src/hooks`, types in `src/types`.

## Complexity Tracking

No constitution violations anticipated; table not required.
