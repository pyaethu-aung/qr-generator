# QR Generator

[![Deploy to GitHub Pages](https://github.com/pyaethu-aung/qr-generator/actions/workflows/deploy.yml/badge.badge.svg)](https://github.com/pyaethu-aung/qr-generator/actions/workflows/deploy.yml)
[![Lint and Type Check](https://github.com/pyaethu-aung/qr-generator/actions/workflows/lint.yml/badge.svg)](https://github.com/pyaethu-aung/qr-generator/actions/workflows/lint.yml)
[![Security Scan](https://github.com/pyaethu-aung/qr-generator/actions/workflows/security.yml/badge.svg)](https://github.com/pyaethu-aung/qr-generator/actions/workflows/security.yml)

Single-page app for generating QR codes with real-time preview and download.

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

## SEO & Accessibility

- Metadata (title, description, Open Graph, Twitter) is automatically updated on language change.
- HTML `lang` attribute is kept in sync with the active locale.
- Language toggle is accessible and keyboard-friendly.

## Development

- Install: `npm install`
- Dev server: `npm run dev`
- Lint: `npm run lint` (fix: `npm run lint:fix`)
- Format check: `npm run format` (write: `npm run format:fix`)
- Tests: `npm run test` (watch: `npm run test:watch`, coverage: `npm run test:coverage`)
- Build: `npm run build`

## Docker Support
49: 
50: [![Docker Build](https://github.com/pyaethu-aung/qr-generator/actions/workflows/docker-publish.yml/badge.svg)](https://github.com/pyaethu-aung/qr-generator/actions/workflows/docker-publish.yml)
51: 
52: Included Dockerfile supports multi-stage builds (Node.js builder → Nginx runtime) for a secure, optimized (<25MB) production image.
53: 
54: ### Local Development
55: 
56: ```bash
57: # Build image locally
58: npm run docker:build
59: 
60: # Run container at http://localhost:8080
61: npm run docker:run
62: ```
63: 
64: ### CI/CD Pipeline
65: 
66: - **Triggers**: Push to `main`, PRs, and daily schedule (Build + Scan only).
67: - **Publish**: Images are pushed to GHCR **only** on version tags (e.g., `git tag v1.0.0`).
68: - **Security**: Integrated Trivy scanning (blocking high/critical CVEs), Hadolint linting, and Cosign image signing.
69: 
70: ## Quality & Constitution Highlights

- Every change must add/update relevant unit tests, maintain ≥85% coverage, and all tests must pass before merge.
- Run `npm run test`, `npm run lint`, and `npm run build` after every change before opening a PR.
- UI must be fully functional and consistent across desktop/mobile and major browsers via responsive design.
- Remove unused code/assets; keep files in the agreed structure above.
- CI gates: lint, test, build must pass; PR review required.

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
3. Push to `main` to trigger the `deploy.yml` workflow.

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
