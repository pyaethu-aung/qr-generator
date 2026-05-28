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

### Share / export

`useQRShare` handles the share button: tries `navigator.share` with files → `ClipboardItem` image write → download fallback. `useExportState` + `src/utils/export/` drive the hi-res export modal (PNG / SVG / PDF via jspdf).

## Testing

Vitest with jsdom. Setup file: `src/setupTests.ts` (imports `@testing-library/jest-dom`). Mock browser APIs (`navigator.share`, `ClipboardItem`) per test file. Coverage threshold: **85%**.

## Skills

Skills are stored under `.agents/skills/` (source files) with symlinks from `.claude/skills/`. Active skills are tracked in `skills-lock.json` (sourced from `pyaethu-aung/skills` on GitHub).

| Skill | When to use |
|---|---|
| `/commit-message` | Creating or amending any git commit |
| `/create-pr` | Opening a GitHub pull request |
| `/update-readme` | After any user-facing change worth documenting |

Two `PreToolUse` hooks in `.claude/settings.json` enforce that `git commit` and `gh pr create` go through the relevant skills. Do not bypass them with `--no-verify`.

## Deployment

- **GitHub Pages**: triggered on push to `main` via `.github/workflows/deploy.yml`
- **Docker image**: published to GHCR on version tags (e.g. `git tag v1.0.0`); Trivy blocks high/critical CVEs
- **Dependabot**: runs daily for npm; no auto-merge

If the hosting URL changes from `pyaethu-aung.github.io`, update the `url` property in `src/components/common/SEOHead.tsx` to keep JSON-LD structured data valid.

<!-- SPECKIT START -->
## Active Feature

**Branch**: `024-update-website-design`
**Plan**: [specs/024-update-website-design/plan.md](specs/024-update-website-design/plan.md)
**Spec**: [specs/024-update-website-design/spec.md](specs/024-update-website-design/spec.md)

UI-only redesign to match `design.pen` for desktop and mobile (light + dark themes).
Key changes: lucide-react icons, pill controls (EC level, pixel pattern), circular nav buttons, responsive navbar, tall preview area, theme transition 150ms.
<!-- SPECKIT END -->
