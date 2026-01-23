# Data Model: QR PNG share button

## Entities

### QRConfig
- content: string (QR payload)
- size: number (px)
- fgColor: string (color)
- bgColor: string (color)
- level: string (error correction level)
- margin: number (px)

### QRRender
- canvasRef: HTMLCanvasElement (rendered QR from qrcode.react)
- dataUrl: string (PNG data URL derived from canvas)

### SharePayload
- blob: Blob (PNG binary)
- filename: string (`qr-code.png`)
- lastUpdated: Date (when generated from current preview)

### ShareRequest
- method: "navigator-share" | "download" | "clipboard"
- targetSupported: boolean
- status: "pending" | "shared" | "canceled" | "failed"
- errorMessage?: string

## Relationships
- QRConfig drives QRRender; QRRender produces dataUrl → SharePayload (blob + filename).
- ShareRequest references SharePayload and chosen method based on capability detection.

## Validation Rules
- PNG must be generated from current canvas at displayed dimensions (WYSIWYG).
- filename fixed to `qr-code.png`.
- ShareRequest status must transition: pending → shared|canceled|failed.
- If capability detection fails, fallback method must be available (download at minimum).

## State Transitions (ShareRequest)
- pending → shared (share succeeds)
- pending → canceled (user cancels)
- pending → failed (error during share/copy/download)
