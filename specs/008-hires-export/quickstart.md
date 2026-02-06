# Quickstart: High-Resolution Export Suite

**Feature Branch**: `008-hires-export`

## Development Setup

```bash
# Install new dependency
npm install jspdf

# Run dev server
npm run dev
```

## Key Files to Create/Modify

### New Files

| Path | Purpose |
|------|---------|
| `src/types/export.ts` | Export-related TypeScript types |
| `src/utils/export/exportCalculations.ts` | Pure scaling/dimension utilities |
| `src/utils/export/pngExporter.ts` | PNG blob generation |
| `src/utils/export/svgExporter.ts` | SVG string generation |
| `src/utils/export/pdfExporter.ts` | PDF blob generation |
| `src/hooks/useExportState.ts` | Export state management (useReducer) |
| `src/components/common/ExportModal.tsx` | Modal UI component |
| `src/components/common/FormatSelector.tsx` | Format selection component |
| `src/components/common/DimensionSelector.tsx` | Dimension/DPI selection component |

### Modified Files

| Path | Changes |
|------|---------|
| `src/components/feature/qr/QRPreview.tsx` | Add Export button, integrate modal |
| `src/data/i18n/en.json` | Add export-related translation keys |
| `src/data/i18n/my.json` | Add export-related translation keys |

## Testing Commands

```bash
# Run all tests
npm run test

# Run export-specific tests
npm run test -- export

# Run with coverage
npm run test:coverage
```

## Verification Checklist

- [x] PNG export produces correct dimensions (500px, 1000px, 2000px)
- [x] SVG export is valid, scalable, and does not show dimension selector
- [x] PDF export opens in PDF readers with correct DPI
- [x] Modal is keyboard accessible
- [x] Works on mobile (iOS Safari, Android Chrome)
- [x] Theme support (dark/light)

## FAQ

### Why do all PDF DPI settings produce the same file size?

**Answer:** This is correct and expected behavior!

DPI controls the **physical print size**, not the file size:

- All PDFs contain the same pixel data (e.g., 2000×2000px PNG)
- DPI is metadata telling the printer how large to print it
- **Same dimension + different DPI = same file size**

Example with 2000px dimension:
- **72 DPI**: Prints at 27.78 inches (screen quality)
- **150 DPI**: Prints at 13.33 inches (standard print)
- **300 DPI**: Prints at 6.67 inches (high-quality print)

**To change file size**, change the **dimension** (500px, 1000px, 2000px), not the DPI.

**Higher DPI** = Smaller print size = **Better quality** at that size ✓
