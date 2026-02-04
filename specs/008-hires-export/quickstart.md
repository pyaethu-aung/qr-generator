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

- [ ] PNG export produces correct dimensions
- [ ] SVG export is valid and scalable
- [ ] PDF export opens in PDF readers
- [ ] Modal is keyboard accessible
- [ ] Works on mobile (iOS Safari, Android Chrome)
- [ ] Theme support (dark/light)
