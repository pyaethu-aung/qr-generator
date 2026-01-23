# Quickstart: QR PNG share button

1) Install and set up
- `npm install`
- `npm run dev` to verify baseline QR generator works.

2) Implement share UI
- Add a share button under the QR preview in `src/components/feature/qr/QRPreview.tsx` (or related component).
- Disable or hide the button when no QR is generated.

3) Generate PNG payload
- Access the rendered QR canvas (from qrcode.react) and call `toDataURL('image/png')` at current preview dimensions.
- Convert data URL to `Blob`; create `File` named `qr-code.png`.

4) Share and fallbacks
- Preferred: use `navigator.share` with `files` when supported.
- Fallback A: use `ClipboardItem` + `navigator.clipboard.write` to copy the image when supported.
- Fallback B: provide a download link (`<a download>` with object URL) as the universal path.
- Debounce rapid taps; show non-blocking message on cancel/error.

5) Testing
- Unit/component tests for share button render states and disabled state when no QR.
- Mock `navigator.share`, `navigator.clipboard.write`, and ensure fallbacks trigger in unsupported cases.
- Verify PNG generation uses WYSIWYG dimensions and correct filename.
- Run `npm run test` and `npm run lint` before commit.

6) Build verification
- `npm run build` to ensure Vite build succeeds after changes.
