# Research: High-Resolution Export Suite

**Feature Branch**: `008-hires-export`  
**Date**: 2026-02-05

## Phase 0 Research Findings

### 1. Export Format Strategy

| Format | Decision | Rationale | Alternatives Rejected |
|--------|----------|-----------|----------------------|
| **PNG** | Use native Canvas `toBlob()` with resolution scaling | Direct access to QRCodeCanvas ref; no extra library needed | html2canvas (overkill), canvg (unnecessary conversion) |
| **SVG** | Use `qrcode` package's `toString('svg')` method | Already installed, supports SVG output directly | Manual SVG generation (error-prone), svg-builder (extra dep) |
| **PDF** | Use `jspdf` with SVG embedding | Lightweight, client-side, vector quality; ~200KB gzipped | pdfmake (larger), pdf-lib (more complex API), server-side (overkill) |

### 2. State Management Strategy

**Decision**: Use React Context + useReducer for export configuration state.

```typescript
// Export state shape
interface ExportConfig {
  format: 'png' | 'svg' | 'pdf'
  dimension: 500 | 1000 | 2000
  dpi: 72 | 150 | 300
  isExporting: boolean
  error: string | null
}
```

**Rationale**: 
- Clean separation from QR generation state
- Predictable state transitions via reducer
- Easy to test utility functions independently

**Alternatives Rejected**:
- Single useState (harder to manage complex transitions)
- Zustand/Jotai (overkill for this scope)
- Prop drilling (poor DX, harder testing)

### 3. Blob Handling & Thread Performance

**Decision**: Use OffscreenCanvas with Web Worker for 2000px exports.

**Why**: Per `vercel-react-best-practices` (`rerender-` rules), generating a 2000px PNG (~16MB uncompressed) can block the main thread. OffscreenCanvas in a worker keeps UI responsive.

**Fallback**: For browsers without OffscreenCanvas support, use main thread with `requestIdleCallback` chunking.

**Implementation**:
```typescript
// src/utils/export/pngExporter.ts
export async function exportPng(
  canvas: HTMLCanvasElement,
  dimension: number
): Promise<Blob> {
  if (typeof OffscreenCanvas !== 'undefined' && dimension >= 2000) {
    return exportPngWorker(canvas, dimension)
  }
  return exportPngSync(canvas, dimension)
}
```

### 4. PDF Generation Strategy

**Decision**: jspdf with SVG-first approach.

**Rationale**: 
- Embed QR as vector SVG inside PDF (infinite scalability, print-quality)
- jspdf supports `addSvgAsImage()` for vector embedding
- Smaller file size than rasterized approach

**Implementation Flow**:
1. Generate SVG string from `qrcode.toString({ type: 'svg' })`
2. Create jsPDF instance at specified DPI
3. Add SVG to PDF at calculated dimensions
4. Export as blob

### 5. Scaling & Coordinate Mapping

**Decision**: Create pure utility functions for dimension/DPI calculations.

```typescript
// src/utils/export/exportCalculations.ts

/**
 * Calculate canvas scale factor for target dimension
 * @why Uses integer scaling to avoid sub-pixel artifacts
 */
export function calculateScaleFactor(
  sourceSize: number,
  targetDimension: number
): number {
  return Math.ceil(targetDimension / sourceSize)
}

/**
 * Convert DPI to points per unit for PDF
 * @why PDF uses points (1/72 inch), DPI affects physical size
 */
export function dpiToPageSize(dimension: number, dpi: number): number {
  return (dimension / dpi) * 72
}
```

**Rationale**: Pure functions enable comprehensive unit testing and are easily reusable.

### 6. Mobile Export Strategy

**Decision**: Feature detection with fallback chain.

```typescript
const exportStrategies = [
  { name: 'download', check: () => 'download' in document.createElement('a') },
  { name: 'share', check: () => navigator.share && navigator.canShare },
  { name: 'blob', check: () => true } // always available as last resort
]
```

**Rationale**: iOS Safari limitations with blob downloads require Web Share API fallback.

### 7. Dependencies Required

| Package | Version | Purpose | Bundle Impact |
|---------|---------|---------|---------------|
| `jspdf` | ^2.5.1 | PDF generation | ~200KB gzipped (dynamic import) |

**Note**: `qrcode` is already installed for SVG generation.

### 8. Performance Targets

| Operation | Target | Strategy |
|-----------|--------|----------|
| PNG 500px | <500ms | Main thread |
| PNG 1000px | <1s | Main thread |
| PNG 2000px | <3s | OffscreenCanvas Worker |
| SVG any size | <200ms | String generation |
| PDF any DPI | <1.5s | jspdf with SVG embed |

### 9. Testing Strategy

**Unit Tests Required** (per constitution NFR-005):

| Utility | Test File | Cases |
|---------|-----------|-------|
| `exportCalculations.ts` | `exportCalculations.test.ts` | Scale factor, DPI conversion, dimension validation |
| `pngExporter.ts` | `pngExporter.test.ts` | Blob generation, dimension accuracy |
| `svgExporter.ts` | `svgExporter.test.ts` | SVG string validity, color preservation |
| `pdfExporter.ts` | `pdfExporter.test.ts` | PDF blob generation, dimension accuracy |
