# QR Generator

Single-page app for generating QR codes with real-time preview and download.

## Stack

- React 19, TypeScript, Vite 7
- Tailwind CSS v4 (via `@tailwindcss/vite` + `@tailwindcss/postcss`)
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

## Quality & Constitution Highlights

- Every change must add/update relevant unit tests, maintain ≥85% coverage, and all tests must pass before merge.
- Run `npm run test` and `npm run lint` after every change before opening a PR.
- Remove unused code/assets; keep files in the agreed structure above.
- CI gates: lint, test, build must pass; PR review required.

## Tailwind v4 Notes

- Entry point: `src/index.css` imports `tailwindcss` and defines base/component layers.
- Vite integration: `@tailwindcss/vite` plugin plus `@tailwindcss/postcss` in `postcss.config.cjs`.
