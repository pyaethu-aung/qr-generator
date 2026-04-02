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

## Post-Implementation Fixes

### Fix: Eye Shape Rendering Quality (2026-04-02)

Three aesthetic issues were identified after the initial implementation and corrected:

**1. `shape-rendering="crispEdges"` scope was too broad**

The attribute was set on the `<svg>` root element, which caused the browser to disable anti-aliasing globally — including for the eye paths. This made all curved and diagonal eye shapes (Rounded, Diamond, Leaf, Hexagon) look jagged or stairstepped.

*Fix*: Moved `shape-rendering="crispEdges"` from the `<svg>` root to only the `<path>` element for data modules. Eye paths now render with the default (anti-aliased) behaviour. Applied in both `QRPreview.tsx` and `svgExporter.ts`.

**2. Rounded eye inner dot was nearly square**

The inner centre of the Rounded eye used `r=0.5s` on a 3×3-module box, producing barely-visible rounding that looked inconsistent against the fully-rounded outer frame (`r=1.5s`) and gap (`r=s`).

*Fix*: Replaced the rounded-rect inner dot with a true circle (`r=1.5s`) drawn as two semicircle arcs centred at the eye's midpoint `(x+3.5s, y+3.5s)`.

**3. Hexagon eye gap and inner subpaths had incorrect side-vertex y-coordinates**

A regular pointy-top hexagon places its equatorial side-vertices at `H/4` and `3H/4` of its total height. The outer layer (H=7s) was correct (`y+1.75s`, `y+5.25s`), but the gap (H=5s) and inner (H=3s) subpaths reused the outer's absolute y-values instead of scaling proportionally, distorting the hexagon shape at the inner layers.

*Fix*: Recalculated side-vertex y-coordinates for each layer using their own height:
- Gap (H=5s, spans `y+s` to `y+6s`): side vertices at `y+2.25s` and `y+4.75s`
- Inner (H=3s, spans `y+2s` to `y+5s`): side vertices at `y+2.75s` and `y+4.25s`
