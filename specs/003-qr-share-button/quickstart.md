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

The share handler lives inside `src/hooks/useQRShare.ts`, so that every tap goes through the same capability detection chain: it prefers the native share sheet, falls back to clipboard copy, and finally triggers a download. On mobile devices we still attempt `navigator.share` even when `navigator.canShare({ files })` is absent, keeping the PNG payload WYSIWYG and named `qr-code.png`. The component surfaces a live status message below the button so users know when sharing is pending, shared, or failed.

5) Testing
- Unit/component tests for share button render states and disabled state when no QR.
- Mock `navigator.share`, `navigator.clipboard.write`, and ensure fallbacks trigger in unsupported cases.
- Verify PNG generation uses WYSIWYG dimensions and correct filename.
- Run `npm run test` and `npm run lint` before commit.

6) Build verification
- `npm run build` to ensure Vite build succeeds after changes.

7) Observability & Supportability (SC-005)
- **Target**: Maintain a “cannot share QR” rate of ≤1% for technical failures.
- **Monitoring Approach**:
  - Instrument the `useQRShare` hook to log `shareRequest` outcomes.
  - Specifically track `status === 'failed'` vs `status === 'canceled'`. 
  - Technical failures (browser API rejection, payload generation errors) should be aggregated to monitor the 1% threshold.
  - User cancellations (`AbortError`) should be excluded from the technical failure rate but monitored for UX friction.
  - Log the `method` (navigator-share, clipboard, download) alongside failures to identify environment-specific issues.

8) Permission UX & Error Handling (T026)
- **Automatic Fallback**: If `navigator.share` or clipboard access is denied (`NotAllowedError`), the system automatically triggers the next fallback (usually download).
- **Explicit Messaging**: Users receive a brief "Permission denied" message before the fallback completes, informing them why the behavior changed.
- **Persistence**: Once a permission is denied in the current session, the hook remembers this and skips the failing method in subsequent attempts to avoid repeated, intrusive prompts.
- **Non-blocking Flow**: All share interactions use non-blocking status messages below the button rather than obstructive modal dialogs, maintaining a smooth generation-to-export flow.
