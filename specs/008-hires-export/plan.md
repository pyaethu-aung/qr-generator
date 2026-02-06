# Implementation Plan: High-Resolution Export Suite

**Branch**: `008-hires-export` | **Date**: 2026-02-05 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/008-hires-export/spec.md`

## Summary

Implement a High-Resolution Export Suite enabling users to download QR codes as PNG (raster), SVG (vector), or PDF (print-ready) through an accessible modal dialog. The solution uses:
- Canvas scaling for PNG exports (with OffscreenCanvas worker for 2000px)
- `qrcode` package for SVG string generation
- `jspdf` for client-side PDF generation with embedded SVG
- React Context + useReducer for export state management

## Technical Context

**Language/Version**: TypeScript 5.9 (React 19)  
**Primary Dependencies**: `qrcode.react` (existing), `qrcode` (existing), `jspdf` (new)  
**Storage**: N/A (client-side only)  
**Testing**: Vitest + React Testing Library  
**Target Platform**: Modern browsers (Chrome, Safari, Firefox, Edge) + iOS Safari, Android Chrome  
**Project Type**: SPA (Vite)  
**Performance Goals**: <3s for 2000px PNG export  
**Constraints**: Max 4000px export dimension; client-side only (no server)  
**Scale/Scope**: Single feature addition to existing app

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.* ✅

- [x] Tests, lint, and build MUST be run locally after every change
- [x] Unit and integration tests for each change; **every utility function in `src/utils/` has unit test**
- [x] UI fully functional and consistent across desktop/mobile and major browsers
- [x] Theme support: dark/light planned from start; CSS custom properties used
- [x] Skill audits: Components audited against `vercel-react-best-practices`; ARIA attributes included
- [x] Structure adherence: UI in `src/components`, hooks in `src/hooks`, utilities in `src/utils`, types in `src/types`
- [x] No unused code/assets; no commented-out blocks
- [x] Commit discipline: 50/72 rule; conventional commit prefixes
- [x] CI gates (lint, test, build) MUST pass

## Project Structure

### Documentation (this feature)

```text
specs/008-hires-export/
├── plan.md              # This file
├── research.md          # Phase 0 output ✅
├── data-model.md        # Phase 1 output ✅
├── quickstart.md        # Phase 1 output ✅
└── tasks.md             # Phase 2 output (via /speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── common/
│   │   ├── ExportModal.tsx          # [NEW] Modal container with focus trap
│   │   ├── FormatSelector.tsx       # [NEW] Format radio group
│   │   └── DimensionSelector.tsx    # [NEW] Dimension/DPI selectors
│   └── feature/qr/
│       └── QRPreview.tsx            # [MODIFY] Add export button
├── hooks/
│   └── useExportState.ts            # [NEW] Export state management
├── utils/
│   └── export/                      # [NEW] Export utilities directory
│       ├── exportCalculations.ts    # [NEW] Scale/dimension utilities
│       ├── pngExporter.ts           # [NEW] PNG blob generation
│       ├── svgExporter.ts           # [NEW] SVG string generation
│       └── pdfExporter.ts           # [NEW] PDF blob generation
├── types/
│   └── export.ts                    # [NEW] Export type definitions
└── data/
    └── i18n/
        ├── en.json                  # [MODIFY] Add export translations
        └── my.json                  # [MODIFY] Add export translations
```

**Structure Decision**: Single SPA structure maintained. All export utilities grouped under `src/utils/export/` for cohesion. Types, hooks, and components follow existing patterns.

---

## Proposed Changes

### 1. Types (Foundation)

#### [NEW] [export.ts](file:///Users/pyaethuaung/go/src/github.com/pyaethu-aung/qr-generator/src/types/export.ts)

- Define `ExportFormat`, `DimensionPreset`, `DpiPreset` types
- Define `ExportState`, `ExportAction` for reducer
- Define `ExportPayload` for download results
- Include preset configurations (FORMAT_CONFIGS, DIMENSION_PRESETS, DPI_PRESETS)

---

### 2. Utilities (Core Logic)

#### [NEW] [exportCalculations.ts](file:///Users/pyaethuaung/go/src/github.com/pyaethu-aung/qr-generator/src/utils/export/exportCalculations.ts)

- `calculateScaleFactor(sourceSize, targetDimension)` - Integer scaling for canvas
- `dpiToPageSize(dimension, dpi)` - PDF dimension calculation
- `generateFilename(format, config)` - Filename with timestamp

#### [NEW] [pngExporter.ts](file:///Users/pyaethuaung/go/src/github.com/pyaethu-aung/qr-generator/src/utils/export/pngExporter.ts)

- `exportPng(canvas, dimension)` - Main PNG export function
- Uses OffscreenCanvas for dimensions ≥2000px (per `rerender-` rules in react-best-practices)
- Returns Promise<Blob>

#### [NEW] [svgExporter.ts](file:///Users/pyaethuaung/go/src/github.com/pyaethu-aung/qr-generator/src/utils/export/svgExporter.ts)

- `exportSvg(value, config)` - SVG string generation using `qrcode.toString()`
- Preserves colors from QR config
- Returns Promise<Blob>

#### [NEW] [pdfExporter.ts](file:///Users/pyaethuaung/go/src/github.com/pyaethu-aung/qr-generator/src/utils/export/pdfExporter.ts)

- `exportPdf(value, config)` - PDF generation using jspdf
- Embeds QR as vector SVG for print quality
- Calculates page size from DPI
- Returns Promise<Blob>

---

### 3. Hook (State Management)

#### [NEW] [useExportState.ts](file:///Users/pyaethuaung/go/src/github.com/pyaethu-aung/qr-generator/src/hooks/useExportState.ts)

- `useExportState()` - useReducer-based state management
- Actions: OPEN_MODAL, CLOSE_MODAL, SET_FORMAT, SET_DIMENSION, SET_DPI, START_EXPORT, EXPORT_SUCCESS, EXPORT_ERROR
- Exposes: state, dispatch, helpers (openModal, closeModal, setFormat, etc.)

---

### 4. Components (UI)

#### [NEW] [ExportModal.tsx](file:///Users/pyaethuaung/go/src/github.com/pyaethu-aung/qr-generator/src/components/common/ExportModal.tsx)

- Modal overlay with backdrop click to close
- Focus trap inside modal
- Escape key to close
- ARIA: `role="dialog"`, `aria-modal="true"`, `aria-labelledby`
- Responsive: Stack on mobile, horizontal on desktop

#### [NEW] [FormatSelector.tsx](file:///Users/pyaethuaung/go/src/github.com/pyaethu-aung/qr-generator/src/components/common/FormatSelector.tsx)

- Radio group for PNG/SVG/PDF
- ARIA: `role="radiogroup"`, `aria-label`
- Shows format description

#### [NEW] [DimensionSelector.tsx](file:///Users/pyaethuaung/go/src/github.com/pyaethu-aung/qr-generator/src/components/common/DimensionSelector.tsx)

- Preset buttons for 500px/1000px/2000px (hidden for SVG format)
- DPI selector (shown only for PDF format)
- ARIA labels for each option

#### [MODIFY] [QRPreview.tsx](file:///Users/pyaethuaung/go/src/github.com/pyaethu-aung/qr-generator/src/components/feature/qr/QRPreview.tsx)

- Add "Download" button next to existing "Share" button
- Button disabled when QR code is empty (with tooltip)
- Integrate ExportModal via portal

---

### 5. i18n Updates

#### [MODIFY] [en.json](file:///Users/pyaethuaung/go/src/github.com/pyaethu-aung/qr-generator/src/data/i18n/en.json)

Add keys for: modal title, format labels, dimension labels, DPI labels, download button, error messages, success messages.

#### [MODIFY] [my.json](file:///Users/pyaethuaung/go/src/github.com/pyaethu-aung/qr-generator/src/data/i18n/my.json)

Mirror all new keys with Burmese translations.

---

## Verification Plan

### Automated Tests

> Commands to run after implementation:

```bash
# 1. Run all tests (includes new and existing tests)
npm run test

# 2. Run export-specific utility tests
npm run test -- exportCalculations

# 3. Run component tests
npm run test -- ExportModal

# 4. Run lint check
npm run lint

# 5. Run build
npm run build

# 6. Full CI check
npm run test && npm run lint && npm run build
```

#### New Unit Tests Required

| Test File | Tests | Command |
|-----------|-------|---------|
| `src/utils/export/__tests__/exportCalculations.test.ts` | Scale factor calculation, DPI conversion, filename generation | `npm run test -- exportCalculations` |
| `src/utils/export/__tests__/pngExporter.test.ts` | Blob generation, dimension accuracy, worker fallback | `npm run test -- pngExporter` |
| `src/utils/export/__tests__/svgExporter.test.ts` | SVG validity, color preservation | `npm run test -- svgExporter` |
| `src/utils/export/__tests__/pdfExporter.test.ts` | PDF blob generation, dimensions | `npm run test -- pdfExporter` |
| `src/hooks/__tests__/useExportState.test.ts` | Reducer state transitions, action handlers | `npm run test -- useExportState` |
| `src/components/common/__tests__/ExportModal.test.tsx` | Open/close, keyboard nav, ARIA, format selection | `npm run test -- ExportModal` |

### Browser Testing

After automated tests pass, verify manually:

1. **Desktop Chrome/Firefox/Safari**: Open app, generate QR code, click Download, try each format/dimension combo
2. **Mobile iOS Safari**: Verify modal works with touch, export triggers share sheet or download
3. **Mobile Android Chrome**: Verify direct download works
4. **Keyboard Navigation**: Tab through modal, Enter to select, Escape to close
5. **Screen Reader**: Use VoiceOver/NVDA to verify announcements

### Manual Verification Steps

1. **PNG Export Test**:
   - Generate QR code with content "https://example.com"
   - Click Download button
   - Select PNG format, 1000px dimension
   - Click Export
   - Verify: Downloaded file is 1000x1000px PNG, QR decodes correctly

2. **SVG Export Test**:
   - Select SVG format
   - Export and open in vector editor (Figma, Illustrator)
   - Verify: Scales infinitely, colors preserved

3. **PDF Export Test**:
   - Select PDF format, 300 DPI
   - Open in PDF reader
   - Verify: Print-ready quality, QR decodes correctly

4. **Accessibility Test**:
   - Navigate entire modal using only Tab and Enter keys
   - Verify focus visible ring on all interactive elements
   - Verify Escape closes modal

---

## Dependencies

| Package | Action | Reason |
|---------|--------|--------|
| `jspdf` | Install | PDF generation |

```bash
npm install jspdf
```

## Complexity Tracking

No constitution violations requiring justification.
