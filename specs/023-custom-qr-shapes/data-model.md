# Phase 1: Data Model (Custom QR Shapes)

## Core Types

```typescript
// src/types/qr.ts

export type QREyeShape = 'Square' | 'Rounded' | 'Diamond' | 'Leaf' | 'Hexagon';
export type QRPixelPattern = 'Square' | 'Dots';
export type QRErrorCorrection = 'L' | 'M' | 'Q' | 'H';

export interface QRDesignConfig {
  eyeShape: QREyeShape;
  pixelPattern: QRPixelPattern;
  errorCorrectionLevel: QRErrorCorrection;
  // Reuses existing fields:
  fgColor: string;
  bgColor: string;
}

// Data output structure for pure functions
export interface QRShapePaths {
  eyes: string[]; // SVG paths for corners
  pixels: string[]; // SVG paths or coordinates for data modules
}
```

## State & Validation Rules

- **Scannability Flagging**: If `config.pixelPattern === 'Dots'` and the underlying data matrix size (modules count) exceeds 33x33 (indicative of dense payload like a VCard or long URL), the `useQRDesign` hook sets an `isRiskyPattern` boolean to `true`. This directly drives the dismissible UI warning mandated by the spec.
- **Default Config**: 
  - `eyeShape`: "Square"
  - `pixelPattern`: "Square"
  - Defaults ensure backwards compatibility with previously saved configuration strings.
