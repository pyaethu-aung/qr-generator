# Implementation Plan: Custom QR Shapes

**Branch**: `023-custom-qr-shapes` | **Date**: 2026-04-01 | **Spec**: [spec.md](../spec.md)
**Input**: Feature specification from `/specs/023-custom-qr-shapes/spec.md`

## Summary

Add UI options for customizing QR code "eye" geometric shapes (square, rounded, diamond, leaf, hexagon) and inner pixel patterns (squares, dots). Includes handling edge cases where scannability is compromised by displaying a warning. 

## Technical Context

**Language/Version**: TypeScript 5.9 + React 19
**Primary Dependencies**: `qrcode`, `qrcode.react`, Tailwind CSS v4, `react-helmet-async`
**Storage**: `localStorage` (for persisting user design choices)
**Testing**: Vitest + React Testing Library + jest-dom
**Target Platform**: Web Browsers (Chrome, Safari, Firefox, Edge)
**Project Type**: Web Application (SPA)
**Performance Goals**: < 50ms latency addition for real-time preview changes
**Constraints**: WCAG accessibility, responsive design, 100% client-side rendering
**Scale/Scope**: Local QR generation component update

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Principle I & II (Code Quality & Testing)**: All new utils in `src/utils/qrShapeRenderer.ts` MUST have a corresponding unit test file. We must maintain ≥85% test coverage.
- **Principle VII (Cross-Platform)**: UI must be responsive for both desktop and mobile.
- **Principle VIII (Theme Support)**: All shape selection UI must use CSS custom properties to respect the dynamic `useTheme` toggle.
- **Principle IX (Agentic Workflow)**:
  - ARIA attributes required on shape toggles (Web Design Guidelines).
  - Code must adhere to React + Vite essentials (e.g. robust Hook usage for the new state).

## Project Structure

### Documentation (this feature)

```text
specs/023-custom-qr-shapes/
├── plan.md
├── research.md
├── data-model.md
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── QRCodePreview.tsx        # Adjusted to handle custom SVG/Canvas rendering
│   └── QRDesignOptions.tsx      # New UI panel for shapes/patterns
├── hooks/
│   └── useQRDesign.ts           # State management for shape configurations
├── utils/
│   ├── qrShapeRenderer.ts       # Raw matrix parser and SVG path builder
│   └── qrShapeRenderer.test.ts  # Required unit testing for shapes
├── types/
│   └── qr.ts                    # Updated with config interfaces
```

**Structure Decision**: Standard React layout following the Constitution. Pure functions for building SVG shape paths will reside in `src/utils/` to ensure they are easily testable as mandated.
