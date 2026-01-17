# Research: QR Generation & Download Strategy

## Decision: Dual-Library Approach

**Selected Libraries**:
1. `qrcode.react` (Display/Preview)
2. `qrcode` (Generation/Download)

### Rationale

**1. Preview Requirement**:
- The user needs to verify the outcome before downloading.
- Instead of "flashy" real-time updates which might be distracting or resource-intensive during rapid typing, a **manual "Generate" button** provides deliberate control.
- `qrcode.react` offers a simple `<QRCodeSVG />` or `<QRCodeCanvas />` component that accepts `value` as a prop.
- It handles the rendering updates efficiently within the React lifecycle.

**2. Download Requirement**:
- Users need PNG and SVG downloads.
- While we could "scrape" the Preview canvas, that ties download quality to display size (e.g., if preview is 200px, download is 200px).
- **Better approach**: Use the core `qrcode` library to generate a *fresh* high-resolution buffer/string for download when the button is pressed.
- This allows us to export a 1000px PNG even if the preview is only 256px, ensuring "Print Quality".

### Implementation Details

**PNG Download**:
- Use `QRCode.toDataURL(text, { width: 1024, margin: 1 })`
- Trigger pseudo-link click.

**SVG Download**:
- Use `QRCode.toString(text, { type: 'svg', width: 1024, margin: 1 })`
- Create Blob -> `URL.createObjectURL` -> trigger link click.

### Alternatives Considered

**Option A: Scrape DOM**:
- Pros: WYSIWYG.
- Cons: Low resolution (only what's on screen), requires DOM reference refs, fragile.

**Option B: `qrcode` for everything**:
- Pros: One dependency.
- Cons: Must manually manage `canvas` refs and `useEffect` hooks to draw the QR code on every keystroke. `qrcode.react` abstracts this standard boilerplate.

### Conclusion

Use `qrcode.react` for the UI to keep component code clean (`<QRCode value={...} />`).
Use `qrcode` logic in `utils/download.ts` to generate high-quality assets on demand.
