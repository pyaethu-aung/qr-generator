# Data Model: High-Resolution Export Suite

**Feature Branch**: `008-hires-export`  
**Date**: 2026-02-05

## Entities

### ExportFormat

Represents the available output formats.

```typescript
// src/types/export.ts

export type ExportFormat = 'png' | 'svg' | 'pdf'

export interface FormatConfig {
  format: ExportFormat
  mimeType: string
  extension: string
  supportsTransparency: boolean
}

export const FORMAT_CONFIGS: Record<ExportFormat, FormatConfig> = {
  png: {
    format: 'png',
    mimeType: 'image/png',
    extension: '.png',
    supportsTransparency: true
  },
  svg: {
    format: 'svg',
    mimeType: 'image/svg+xml',
    extension: '.svg',
    supportsTransparency: true
  },
  pdf: {
    format: 'pdf',
    mimeType: 'application/pdf',
    extension: '.pdf',
    supportsTransparency: false
  }
}
```

### ExportDimensions

Represents size configuration including presets and DPI settings.

```typescript
// src/types/export.ts

export type DimensionPreset = 500 | 1000 | 2000
export type DpiPreset = 72 | 150 | 300

export interface DimensionConfig {
  value: DimensionPreset
  label: string
  description: string
}

export const DIMENSION_PRESETS: DimensionConfig[] = [
  { value: 500, label: '500px', description: 'Web / Social Media' },
  { value: 1000, label: '1000px', description: 'Standard' },
  { value: 2000, label: '2000px', description: 'Print / High-Res' }
]

export interface DpiConfig {
  value: DpiPreset
  label: string
  description: string
}

export const DPI_PRESETS: DpiConfig[] = [
  { value: 72, label: '72 DPI', description: 'Screen' },
  { value: 150, label: '150 DPI', description: 'Standard Print' },
  { value: 300, label: '300 DPI', description: 'High-Quality Print' }
]
```

### ExportState

Represents the export modal state (managed by useReducer).

```typescript
// src/types/export.ts

export interface ExportState {
  isOpen: boolean
  format: ExportFormat
  dimension: DimensionPreset
  dpi: DpiPreset
  isExporting: boolean
  error: string | null
  progress: number // 0-100 for progress indicator
}

export type ExportAction =
  | { type: 'OPEN_MODAL' }
  | { type: 'CLOSE_MODAL' }
  | { type: 'SET_FORMAT'; payload: ExportFormat }
  | { type: 'SET_DIMENSION'; payload: DimensionPreset }
  | { type: 'SET_DPI'; payload: DpiPreset }
  | { type: 'START_EXPORT' }
  | { type: 'EXPORT_PROGRESS'; payload: number }
  | { type: 'EXPORT_SUCCESS' }
  | { type: 'EXPORT_ERROR'; payload: string }
  | { type: 'RESET' }
```

### ExportPayload

Represents the generated file ready for download.

```typescript
// src/types/export.ts

export interface ExportPayload {
  blob: Blob
  filename: string
  format: ExportFormat
  dimensions: {
    width: number
    height: number
  }
  metadata: {
    createdAt: string
    dpi?: number
  }
}
```

## State Transitions

```
┌─────────────┐
│   CLOSED    │ ◄──────────────────────────────┐
└──────┬──────┘                                │
       │ OPEN_MODAL                            │
       ▼                                       │
┌─────────────┐     SET_FORMAT/DIM/DPI   ┌─────┴─────┐
│    IDLE     │ ◄───────────────────────►│  EDITING  │
└──────┬──────┘                          └───────────┘
       │ START_EXPORT
       ▼
┌─────────────┐     EXPORT_PROGRESS
│  EXPORTING  │ ─────────────────────► Progress update
└──────┬──────┘
       │
       ├─── EXPORT_SUCCESS ───► CLOSED (auto-close after 2s)
       │
       └─── EXPORT_ERROR ────► Error displayed, stays open
```

## Validation Rules

1. **QR Content Validation**: Export is disabled when `value` is empty or whitespace-only
2. **Dimension Validation**: Only preset values (500, 1000, 2000) are accepted
3. **DPI Validation**: Only preset values (72, 150, 300) are accepted
4. **Format Validation**: Only 'png', 'svg', 'pdf' are accepted
