# Feature Recommendations (Client-Side Only)

All features below require **zero backend** and build on the current capabilities.

## Current state

- **Content types:** URL/text, WiFi, vCard, Email
- **Design:** fg/bg color, EC level, eye-frame & eye-center shapes, pixel patterns, logo overlay, decorative frames (Banner/Card/Ticket/Label/Bubble/Ticks/Photo) with captions
- **Output:** PNG/SVG/PDF hi-res export, Web Share / clipboard / download
- **Platform:** i18n (en/my), dark mode, contrast checking

## Strong recommendations

| Feature | Why it fits | Effort | Notes / trade-offs |
|---|---|---|---|
| **More content types** (SMS, tel:, Geo, Calendar/vEvent, Crypto/UPI) | Pure string-builders — mirrors existing `wifi.ts`/`vcard.ts`/`email.ts` + a form. Lowest-risk, highest-coverage win. | Low | Each is one util + test + form. Pick the 2–3 most-requested (SMS, phone, geo are most common). |
| **Shareable config URL** (encode design+content into query params) | Makes the app linkable without a server — reproduces a QR from a link. Big UX multiplier. | Low–Med | Watch URL length with logos (data-URIs won't fit — exclude logo or store in localStorage). |
| **Design presets / save-my-styles** (localStorage) | One-click brand styles; the design surface is already large enough that re-configuring is tedious. | Med | Needs a small "saved styles" UI + JSON import/export of a style. |
| **QR decoder** (upload image or camera via `BarcodeDetector`/jsQR) | Turns a one-way tool into round-trip; fully client-side. | Med | `BarcodeDetector` is native but not on all browsers — needs `jsqr` fallback (~the only new dep). |

## Worth considering

| Feature | Why | Effort |
|---|---|---|
| **Gradient foreground** (linear/radial) | Custom pixel rendering already exists in `qrShapeRenderer.ts`, so the hook is there. | Med |
| **Batch generation** (paste list → ZIP of PNGs/SVGs) | Power-user feature; needs a client zip lib (`fflate`/`jszip`). | Med |
| **Recent history** (localStorage thumbnails) | Quick re-access; small. | Low–Med |
| **Transparent PNG background** | Common request for overlaying on designs; small toggle. | Low |

## Recommendation

Start with **two low-effort, high-impact items**:

1. **A few more content types** — SMS, phone, and geo are the most-requested and slot cleanly into the existing pattern.
2. **Shareable config URL** — uniquely makes a backendless app feel "saved/shared."

Then add **design presets** once the design surface justifies it.

Hold off on batch generation and the decoder unless there's real demand — both add a dependency and meaningfully more surface area to test (and there is an 85% coverage gate).
