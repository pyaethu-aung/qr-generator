# Quickstart: QR Generator MVP

## Overview

This feature provides a single-page interface to generate and download QR codes. It runs entirely client-side.

## Running the Feature

1.  **Install Dependencies**:
    ```bash
    npm install qrcode.react qrcode
    npm install -D @types/qrcode
    ```

2.  **Start Development Server**:
    ```bash
    npm run dev
    ```

3.  **Navigate to**: `http://localhost:5173` (The main entry point will be updated to show the generator).

## Key Components

- `QRGenerator`: Main container managing state.
- `QRPreview`: Displays the SVG preview using `qrcode.react`.
- `QRControls`: Inputs for text and color.
- `useQR`: Hook handling generation logic for downloads.

## Testing

Run unit tests for the new components:
```bash
npm run test src/components/feature/qr
```
