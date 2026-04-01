# Quickstart Guide: Custom QR Shapes (Dev)

## 1. Local Evaluation
1. Clone branch `023-custom-qr-shapes` and run `npm ci` to get dependencies.
2. Initialize Vite dev environment with `npm run dev`.
3. The new shape options panel will appear alongside the main configuration tab for "Design".

## 2. Testing Pure SVG Functionality
Since the custom shapes depend heavily on raw module parsing from `qrcode`, we have mandated full unit test coverage for the shape builders:
- Run the visual/SVG mathematical tests continuously: `npm run test:watch`.
- The primary assertions log the coordinate mapping for circular/hexagonal corners against predefined matrix snapshots.

## 3. WCAG Keyboard Navigation
Ensure you manually tab through the new QR toggle inputs to verify ARIA attributes `aria-pressed`, `aria-label`, and `role="switch"` update dynamically before closing feature tickets.
