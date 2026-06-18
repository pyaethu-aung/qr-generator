# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev             # start dev server
npm run build           # tsc + vite build
npm run lint            # ESLint (type-aware)
npm run lint:fix        # auto-fix lint errors
npm run format          # Prettier check
npm run format:fix      # Prettier write
npm run test            # Vitest (watch mode)
npm run test:coverage   # coverage report (≥85% required)
npm run docker:build    # build production image
npm run docker:run      # run container at http://localhost:8080
```

Run a single test file: `npx vitest run src/utils/share.test.ts`

Before opening any PR, all three must pass locally: `npm run test && npm run lint && npm run build`

Never push directly to `main`. All changes must go through a pull request. A `pre-push` git hook in `.githooks/` enforces this — activated automatically via the `prepare` npm script on `npm install`.

## Architecture

### State flow

`useQRGenerator` owns all QR config state. Input fields update "pending" state (e.g. `inputFgColor`); clicking **Generate** snapshots them into `config`, which drives the `qrcode.react` preview. Downloads use the headless `qrcode` library against the pending input state — not the DOM.

### Context providers (wired in `src/main.tsx`)

- `ThemeProvider` — reads/writes `localStorage`, toggles `.dark` on `<html>`, exposes `useThemeContext()`
- `LocaleProvider` — reads/writes `localStorage`, syncs `document.documentElement.lang`, exposes `useLocaleContext()` with `translate(key)` and a locale-aware `seo` object

### Directory conventions

| Path | Purpose |
|---|---|
| `src/components/common/` | Reusable primitives (Button, Input, Card, etc.) |
| `src/components/feature/qr/` | QR-specific views |
| `src/hooks/` | Stateful hooks and context providers |
| `src/utils/` | Pure helpers — every file here requires a corresponding test |
| `src/data/` | Static config and i18n JSON (`en.json`, `my.json`) |
| `src/types/` | Shared TypeScript types |

### Styling

Tailwind CSS v4 via `@tailwindcss/vite`. Entry point is `src/index.css`. Use semantic design tokens (CSS custom properties) for all colors — never hard-code hex values in component classes. The `dark` class on `<html>` drives dark-mode variants.

### Views

Three top-level views toggle via a `PillGroup` in `src/App.tsx`: **Generate** (`QRGenerator`), **Batch** (`BatchGenerator`), **Scan** (`QRScanner`). Generate stays mounted (`hidden`); Batch and Scan mount on demand.

### Share / export

`useQRShare` handles the share button: tries `navigator.share` with files → `ClipboardItem` image write → download fallback. `useExportState` + `src/utils/export/` drive the hi-res export modal (PNG / SVG / PDF via jspdf).

Headless rendering (no DOM preview) is shared: `renderQrPngBlob` (`src/utils/export/pngRenderer.ts`) for PNG, `exportSvg` / `exportPdf` for the rest. The single-QR download path and batch generation both go through these.

### Batch generation

`BatchGenerator` + `useBatchGenerator` render a pasted list (one value per line, deduped, capped at `BATCH_MAX_LINES`) to PNG/SVG/PDF and pack them into one ZIP via `fflate`. The core lives in `src/utils/batch/` (`parseBatchInput`, `batchFilename`, `buildBatchZip`). Each code inherits the user's current design read from `localStorage`: design/frame via `persistedDesign.ts`, foreground/background/EC via `persistedAppearance.ts`. These loaders are the single source of truth, also consumed by `useQRDesign` / `useQRGenerator`, so a batch code matches the live preview. Because the tab mounts on demand it re-reads that design on each open; the pasted list itself is persisted so a tab switch doesn't lose it.

## Testing

Vitest with jsdom. Setup file: `src/setupTests.ts` (imports `@testing-library/jest-dom`). Mock browser APIs (`navigator.share`, `ClipboardItem`) per test file. Coverage threshold: **85%**.

## Skills

Skills are stored under `.agents/skills/` (source files) with symlinks from `.claude/skills/`. Active skills are tracked in `skills-lock.json` (sourced from `pyaethu-aung/skills` on GitHub).

| Skill | When to use |
|---|---|
| `/commit-message` | Creating or amending any git commit |
| `/create-pr` | Opening a GitHub pull request |
| `/update-readme` | After any user-facing change worth documenting |
| `/develop-web-feature` | Building a new feature end-to-end (shape → build → audit → PR) |

Two `PreToolUse` hooks in `.claude/settings.json` enforce that `git commit` and `gh pr create` go through the relevant skills. Do not bypass them with `--no-verify`.

## Deployment

- **GitHub Pages**: triggered on push to `main` via `.github/workflows/deploy.yml`
- **Docker image**: published to GHCR on version tags (e.g. `git tag v1.0.0`); Trivy blocks high/critical CVEs
- **Dependabot**: runs daily for npm; no auto-merge

If the hosting URL changes from `pyaethu-aung.github.io`, update the `url` property in `src/components/common/SEOHead.tsx` to keep JSON-LD structured data valid.