# Implementation Plan: QR Code Generator MVP

**Branch**: `001-qr-generator-mvp` | **Date**: 2026-01-15 | **Spec**: [specs/001-qr-generator-mvp/spec.md](../spec.md)
**Input**: Feature specification from `specs/001-qr-generator-mvp/spec.md`

## Summary

Build a client-side only QR Code generator using React, TypeScript, and Vite.
Key features: Real-time preview, URL validation, and PNG/SVG download support.
Stack: React 18+, TypeScript 5+, Vite, `qrcode.react` (display), `qrcode` (generation logic).

## Technical Context

**Language/Version**: TypeScript 5.x (Node 20+ for tooling)
**Primary Dependencies**: React 18+, Vite 5+, qrcode.react, qrcode
**Storage**: N/A (Transient client state only)
**Testing**: Vitest (Unit), React Testing Library (Component), Playwright (E2E if needed)
**Target Platform**: Modern Web Browsers (ESModules supported)
**Project Type**: Web (SPA)
**Performance Goals**: <1s LCP, <50ms TBT (Total Blocking Time) during typing
**Constraints**: Frontend-only, No Backend, Zero tracking
**Scale/Scope**: Small (MVP), extensible for future phases

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Code Quality**: Setup ESLint + Prettier with strict TS config.
- **II. Testing**: Plan includes Unit tests for utils and Component tests for QR generation. (Pass)
- **III. UX Consistency**: Uses shared UI components (Button, Input) for consistent styling. (Pass)
- **IV. Performance**: Client-side generation ensures low latency; strict bundle management via Vite. (Pass)

## Project Structure

### Documentation (this feature)

```text
specs/001-qr-generator-mvp/
├── plan.md              # This file
├── research.md          # Phase 0: Library selection (qrcode vs qrcode.react)
├── data-model.md        # Phase 1: State interfaces (QRConfig)
├── quickstart.md        # Phase 1: Dev server instructions
└── tasks.md             # Phase 2: Implementation tasks
```

### Source Code (repository root)

```text
src/
├── assets/          # Static assets
├── components/
│   ├── common/      # Reusable UI (Button.tsx, Input.tsx, Card.tsx)
│   ├── layout/      # MainLayout.tsx, Header.tsx
│   └── qr/          # QRPreview.tsx, QRForm.tsx, QRDownload.tsx
├── hooks/           # useQR.ts (Business logic separation)
├── types/           # index.ts (Shared type definitions)
├── utils/           # validation.ts, download.ts
├── App.tsx
├── main.tsx
└── styles/          # Tailwind or CSS modules (TBD in setup)
```

**Structure Decision**: Standard React+Vite structure with "feature-first" folder organization suppressed for MVP (too small/simple). Separation of concerns via `hooks/` and `utils/`.

## Implementation Steps

### Phase 1.1: Project Initialization & Standards

- [ ] **Step 1: Initialize Vite Project**
    - **Action**: Create new Vite project with React + TypeScript.
    - **Config**: update `vite.config.ts`, set up path aliases if needed (for `@/`).
    - **Effect**: `package.json`, `tsconfig.json` created.
- [ ] **Step 2: Install Dependencies**
    - **Action**: Install `qrcode.react` (for UI), `qrcode` (for utils), `@types/qrcode`.
    - **Action**: Install `clsx` and `tailwind-merge` (for styling utilities).
    - **Action**: Setup Tailwind CSS (optional but recommended for "clean design").
- [ ] **Step 3: Setup Quality Tools (Constitution I)**
    - **Action**: Configure ESLint with strict rules.
    - **Action**: Configure Prettier.
    - **Action**: Setup `vitest` and `jsdom` for testing.

### Phase 1.2: Core Units & Utilities

- [ ] **Step 4: Create Validation Utility**
    - **File**: `src/utils/validation.ts`
    - **Logic**: Implement `validateInput(text: string): ValidationResult`. Checks basic URL patterns vs plain text.
    - **Test**: Create `src/utils/validation.test.ts` to verify URL detection logic.
- [ ] **Step 5: Create Download Utility**
    - **File**: `src/utils/download.ts`
    - **Logic**: Implement `downloadQR(text: string, format: 'png' | 'svg')`.
    - **Detail**: Use `qrcode.toDataURL` for PNG and `qrcode.toString` (SVG mode) for SVG. Manually trigger anchor tag click.

### Phase 1.3: Component Architecture

- [ ] **Step 6: UI Primitives**
    - **File**: `src/components/common/Input.tsx` (Styled text input).
    - **File**: `src/components/common/Button.tsx` (Styled button with variants: Primary, Outline).
    - **File**: `src/components/common/Card.tsx` (Container for the QR module).
- [ ] **Step 7: QR Hooks**
    - **File**: `src/hooks/useQR.ts`
    - **Logic**: Manage state (`inputValue`). Return `{ value, isValid, validationWarning, handleChange }`.
    - **Detail**: Debounce logic here if optimizing performance (though spec allows real-time, constitution says <50ms blocking, so controlled input is fine for small strings).

### Phase 1.4: Feature Implementation

- [ ] **Step 8: QR Preview Component**
    - **File**: `src/components/qr/QRPreview.tsx`
    - **Logic**: Accept `value`. Use `QRCodeSVG` from `qrcode.react`.
    - **Detail**: Handle empty state (render placeholder or nothing).
- [ ] **Step 9: Main Feature Composition**
    - **File**: `src/App.tsx`
    - **Logic**: Check layout rules. Header "QR Generator". Input Field. Preview. Download Buttons below.
    - **Accessibility**: Ensure tab order. `aria-live` for validation warnings.

### Phase 1.5: Testing & Verification

- [ ] **Step 10: Component Integration Tests**
    - **File**: `src/tests/App.test.tsx`
    - **Action**: Test finding input, typing "hello", asserting QR code is in document (check alt tag or SVG presence).
- [ ] **Step 11: Performance Check (Constitution IV)**
    - **Action**: Run Lighthouse (manual). Verify bundle size.

## Complexity Tracking

No violations anticipated.


## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
