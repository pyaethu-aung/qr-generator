# Contracts: QR PNG share button

## Overview
Client-side feature only. No new backend APIs are introduced. Sharing relies on browser capabilities.

## Client Capability Contract
- Capability detection must check:
  - `navigator.canShare` with `files` containing a PNG `File`.
  - `navigator.share` availability.
  - `ClipboardItem` and `navigator.clipboard.write` for image copy fallback.
- Fallback download link must be available when share/copy is unsupported.

## Share Flow (pseudo-API)
- Input: PNG Blob, filename `qr-code.png`.
- Preferred path: `navigator.share({ files: [new File([blob], 'qr-code.png', { type: 'image/png' })] })`.
- Fallback path A: `navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])`.
- Fallback path B: programmatic download via object URL and `<a download>`.

## Errors
- If preferred path rejects (lack of support or user cancel), surface non-blocking message and attempt next fallback where applicable.

## Non-Goals
- No server upload, no persistent storage, no additional metadata payloads.
