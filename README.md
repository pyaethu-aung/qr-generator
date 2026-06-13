# QR Generator

[![Deploy to GitHub Pages](https://github.com/pyaethu-aung/qr-generator/actions/workflows/deploy.yml/badge.svg)](https://github.com/pyaethu-aung/qr-generator/actions/workflows/deploy.yml)
[![Lint and Type Check](https://github.com/pyaethu-aung/qr-generator/actions/workflows/lint.yml/badge.svg)](https://github.com/pyaethu-aung/qr-generator/actions/workflows/lint.yml)
[![Security Scan](https://github.com/pyaethu-aung/qr-generator/actions/workflows/security.yml/badge.svg)](https://github.com/pyaethu-aung/qr-generator/actions/workflows/security.yml)

Single-page app for generating QR codes with real-time preview and download.

## Content types

The generator encodes eight kinds of content, selectable from the pill bar
above the form:

- **Text / URL** — free-form text or a link (the default).
- **Wi-Fi** — network credentials; scanning joins the network.
- **Contact (vCard)** — name, phone, email, and address as a vCard.
- **Email** — a `mailto:` link with optional subject and body.
- **SMS** — a phone number with an optional pre-filled message.
- **Phone** — a `tel:` link that starts a call on scan.
- **Location** — geographic coordinates as a `geo:` URI, with a
  "use my location" helper.
- **Event** — a calendar event (RFC 5545 `VCALENDAR`/`VEVENT`): title,
  start/end, an all-day toggle, location, and an optional description.
  Times are encoded as floating local time so the event lands at the
  wall-clock time the scanner's device is set to; all-day events use
  `VALUE=DATE` with the exclusive end date handled automatically.

## Customization

QR codes can be styled before download:

- **Eye border & eye center** — the three finder squares are styled as two
  independent parts: the outer border (Square, Rounded, Circle, Leaf, Hexagon,
  SquareRound, RoundSquare, Diamond) and the inner center (Square, Rounded, Dot,
  Diamond, Star, Cross), in any combination.
- **Eye colors** — the border and center each take their own color, independent
  of the data modules. Both default to the foreground color ("Match foreground").
- **Pixel pattern** — data modules render in eight styles: Square, Dots, Rounded,
  Diamond, Vertical, Horizontal, Classy, and Fluid. Classy and Fluid are
  neighbor-aware: adjacent dark modules merge into a continuous connected form
  rather than rendering as isolated shapes.
- **Frames** — wrap the code in a decorative, code-drawn frame with a
  call-to-action caption. Six styles (Banner, Card, Ticket, Label, Bubble,
  Corners) plus None (the default). The caption text, frame color, and caption
  position (top/bottom) are configurable; the caption auto-contrasts against the
  frame fill. Frames are built from SVG primitives (no raster/licensed image
  assets) and render identically in the live preview and every export (PNG/SVG).
- **Colors, error correction & logo** — foreground/background colors, EC level,
  and an optional centered logo overlay.
- **Contrast warnings** — a dismissible alert appears when the foreground/background
  contrast ratio falls below 3:1 or the colors are inverted (light on dark), both
  of which can prevent scanners from reading the code.

The white separator gap and dark center are always preserved, so any eye
combination stays scannable. Path rendering lives in
`src/utils/qrShapeRenderer.ts`, frame artwork in `src/utils/frameRenderer.ts`,
and `src/utils/qrSvgComposer.ts` is the single source that composes the
QR + frame SVG for the preview and all exports. Styling and frame state are
owned by `useQRDesign` and persisted to `localStorage`.

## Stack

- React 19, TypeScript, Vite 7
- Tailwind CSS v4 (via `@tailwindcss/vite` + `@tailwindcss/postcss`)
- `react-helmet-async`: For managing document head and SEO metadata
- `qrcode.react` for preview, `qrcode` for asset generation
- Testing: Vitest + React Testing Library + jest-dom
- Linting/formatting: ESLint (type-aware) + Prettier

## Project Structure

- `src/components` – UI components (common primitives, feature views)
- `src/hooks` – stateful logic/hooks
- `src/utils` – pure helpers
- `src/data` – data shapers/models (including `i18n` configs)
- `src/types` – shared types

## Localization (i18n)

The app supports multiple languages (English and Burmese) via custom locale config files in `src/data/i18n/`.
- Localized strings are stored in `en.json` and `my.json`.
- Components consume translations via `useLocaleContext` and `translate(key)`.
- User language preference is persisted in `localStorage`.
- The language toggle UI is currently hidden from the navbar; the locale infrastructure and translations remain intact for future re-enabling.

## SEO & Accessibility

- Metadata (title, description, Open Graph, Twitter) is automatically updated on language change.
- HTML `lang` attribute is kept in sync with the active locale.

## Development

- Install: `npm install` (also activates git hooks in `.githooks/` via the `prepare` script — the `pre-push` hook blocks direct pushes to `main`)
- Dev server: `npm run dev`
- Browser testing (MCP): `npx playwright install chromium` (one-time setup for Playwright MCP)
- Design source: `DESIGN.md` — tokens, component specs, and layout measurements; `PRODUCT.md` — brand personality and design principles
- Lint: `npm run lint` (fix: `npm run lint:fix`)
- Format check: `npm run format` (write: `npm run format:fix`)
- Tests: `npm run test` (watch: `npm run test:watch`, coverage: `npm run test:coverage`)
- Build: `npm run build`

## Spec-Kit

This project uses [spec-kit](https://github.com/github/spec-kit) v0.8.4 for
AI-assisted development workflows — including structured planning, feature
scaffolding, and commit/PR automation via skills in `.claude/skills/` and
`.agents/skills/`.

| Skill | When to use |
|---|---|
| `/commit-message` | Creating or amending any git commit |
| `/create-pr` | Opening a GitHub pull request |
| `/update-readme` | After any user-facing change worth documenting |
| `/test-design` | Validate the live UI against `design.pen` spec using Playwright MCP |

## Docker Support

[![Docker Build](https://github.com/pyaethu-aung/qr-generator/actions/workflows/docker-publish.yml/badge.svg)](https://github.com/pyaethu-aung/qr-generator/actions/workflows/docker-publish.yml)

Included Dockerfile supports multi-stage builds (Node.js builder → Nginx runtime) for a secure, optimized (<25MB) production image.

### Local Development

```bash
# Build image locally
npm run docker:build

# Run container at http://localhost:8080
npm run docker:run
```

### CI/CD Pipeline

- **Triggers**: GitHub release (published), PRs, and daily schedule (Build + Scan only).
- **Publish**: Images are pushed to GHCR on GitHub release publish (fires together with GitHub Pages).
- **Security**: Integrated Trivy scanning (blocking high/critical CVEs), Hadolint linting, and Cosign image signing.

## Quality & Constitution Highlights

- Every change must add/update relevant unit tests, maintain ≥85% coverage, and all tests must pass before merge.
- Run `npm run test`, `npm run lint`, and `npm run build` after every change before opening a PR.
- UI must be fully functional and consistent across desktop/mobile and major browsers via responsive design.
- Remove unused code/assets; keep files in the agreed structure above.
- CI gates: lint, test, build must pass; PR review required. A `pre-push` git hook prevents direct pushes to `main` — all changes must go through a pull request.

## Share experience

- The QR share button under the preview consumes `useQRShare`, so every tap goes through one handler that captures the canvas, conversts it to a PNG `SharePayload`, and shares using native APIs when possible.
- Capability detection prioritizes `navigator.share` with `files`, then clipboard image write via `ClipboardItem`, and finally a download link that names the file `qr-code.png`. The hook surfaces a polite status message (pending/shared/failed) that `aria-describedby` is wired to the button.
- On mobile devices we still attempt `navigator.share` even when `navigator.canShare({ files })` is absent, ensuring the share sheet receives the WYSIWYG PNG at the preview dimensions and colors.
- Validate share/fallback behavior with Vitest mocks, including the mobile path, clipboard path, and download fallback so every environment succeeds.

## Tailwind v4 Notes

- Entry point: `src/index.css` imports `tailwindcss` and defines base/component layers.
- Vite integration: `@tailwindcss/vite` plugin plus `@tailwindcss/postcss` in `postcss.config.cjs`.

## CI/CD & Deployment

This project uses GitHub Actions for automated testing, security scanning, and deployment.

### GitHub Pages Setup
To enable automated deployments:
1. Go to your repository **Settings > Pages**.
2. Under **Build and deployment > Source**, select **GitHub Actions**.
3. Publish a GitHub release to trigger the `deploy.yml` workflow.

### Auto Vulnerability Updates (009)
This project uses **GitHub Dependabot** for automated vulnerability patching.

**Configuration**:
- Configured in `.github/dependabot.yml`
- Targets `npm` ecosystem
- Runs daily
- **No auto-merge** (Manual review required)

**Setup Requirement**:
Repo admins must enable **Dependabot alerts** and **Dependabot security updates** in repository settings for this to function.

## SEO Maintenance

The application injects `SoftwareApplication` JSON-LD structured data into the document head for rich search results.

**Key Configuration:**
- The application URL is hardcoded in `src/components/common/SEOHead.tsx`.
- If the hosting URL changes (e.g., from `pyaethu-aung.github.io` to a custom domain), you **MUST** update the `url` property in `SEOHead.tsx` to maintain valid schema markup.
