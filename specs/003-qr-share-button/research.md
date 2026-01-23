# Research: QR PNG share button

## Decisions

### 1) Share API usage and fallbacks
- Decision: Use `navigator.share` with `Files` when available; otherwise fall back to download (desktop) or clipboard image copy when supported, else provide download link.
- Rationale: Leverages native share sheet for best UX; ensures universal path via download/copy when share APIs are unavailable.
- Alternatives considered: Force download only (worse UX on mobile), embed data URL in mailto (limited, clunky).

### 2) PNG generation source
- Decision: Capture the rendered QR canvas (from qrcode.react) via `toDataURL('image/png')`, convert to `Blob`, and share/copy that blob.
- Rationale: Ensures WYSIWYG fidelity with current preview styling and size; avoids rerendering a second canvas.
- Alternatives considered: Regenerate QR off-screen at higher resolution (adds divergence from preview), use SVG export (would differ from PNG requirement).

### 3) File naming
- Decision: Use consistent filename `qr-code.png` for all share/download flows.
- Rationale: Predictable and user-friendly; aligns desktop and mobile behavior.
- Alternatives considered: Timestamped filenames (clutter), content-derived names (risk leaking data in filename).

### 4) Error and cancel handling
- Decision: Surface non-blocking toast/message on share errors or user cancel; leave QR preview unchanged.
- Rationale: Matches FR-007, keeps UI resilient without disruptive modals.
- Alternatives considered: Silent failures (confusing), blocking dialogs (heavier UX).

### 5) Performance budget
- Decision: Keep share initiation→completion within 3s for standard QR; debounce rapid taps.
- Rationale: Aligns with success criteria and prevents duplicate share sheets.
- Alternatives considered: No debounce (risk multiple dialogs), higher latency budget (worse UX).
