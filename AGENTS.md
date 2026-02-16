# QR Generator - AI Agent Guidelines

> Universal instructions for AI coding assistants (Antigravity, Gemini CLI, GitHub Copilot, etc.)

## Quick Reference

```bash
# Validation (run after EVERY change)
npm run test && npm run lint && npm run build

# Development
npm run dev        # Start dev server
npm run test:watch # Watch mode for tests
```

## Stack

- **Framework**: React 19 + TypeScript 5.9 + Vite 7 + `react-helmet-async`
- **Styling**: Tailwind CSS v4 (`@tailwindcss/vite` + `@tailwindcss/postcss`)
- **QR**: `qrcode.react` (preview), `qrcode` (generation), `jspdf` (PDF export)
- **Testing**: Vitest + React Testing Library + jest-dom
- **Linting**: ESLint (type-aware) + Prettier

## Project Structure

```text
src/
├── components/     # UI components (common/, feature views)
├── hooks/          # Stateful logic/custom hooks
├── utils/          # Pure helper functions
├── data/           # Data shapers, models, i18n configs
└── types/          # Shared TypeScript types
```

## Constitution Principles (MUST FOLLOW)

### Code Quality
- Readable, maintainable, idiomatic code
- No dead code, unused assets, or commented-out blocks
- Automated linting/formatting on every commit

### Testing (NON-NEGOTIABLE)
- Every code change MUST add/update unit tests
- **Every utility function in `src/utils/` MUST have a corresponding unit test**
- Maintain coverage ≥85%
- Tests must be deterministic, fast, independent
- TDD encouraged

### Theme Support (Principle VIII)
- Plan dark/light theme support from the start
- Never hard-code colors; use CSS custom properties
- Default theme MUST match system preference (`prefers-color-scheme`)
- User choice persisted in `localStorage`

### Cross-Platform Compatibility
- UI must work on desktop AND mobile browsers
- Support Chrome, Safari, Firefox, Edge
- Responsive design is mandatory

### Skill-Driven Development & Agentic Workflow (Principle IX - NON-NEGOTIABLE)
- Skills are "Primary Source Truth" across all spec-kit phases (`/specify`, `/plan`, `/implement`)
- React components MUST be audited against `react-vite-essentials` skill
- UI/UX decisions MUST adhere to `web-design-guidelines` skill:
  - **WCAG accessibility**: keyboard-accessible, proper ARIA labels, AA contrast
  - **ARIA requirement**: All components MUST include appropriate ARIA attributes
  - **Responsive layouts**: mobile-first, correct viewport adaptation
- **TS Learning Mode**: Provide brief comments explaining *why* a TypeScript pattern was chosen when it relates to a skill guideline

### Execution Discipline (NON-NEGOTIABLE)
Run after EVERY task completion:
```bash
npm run test && npm run lint && npm run build
```

### Commit Discipline (50/72 Rule)
- Subject: ≤50 characters, imperative mood, no period
- Body: ≤72 characters per line
- Use conventional prefixes: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`
- Commit each phase individually

## i18n

- Locales: English (`en.json`), Burmese (`my.json`) in `src/data/i18n/`
- Use `useLocaleContext` and `translate(key)`
- Language preference persisted in `localStorage`

## Skills Available

The Agent MUST consult these skills during planning and implementation:
- **React & Vite Essentials**: `.agent/skills/react-vite-essentials/SKILL.md`
- **UI/UX & Design**: `.agent/skills/web-design-guidelines/SKILL.md`

## Key Patterns

### Share Functionality
- `useQRShare` hook handles all share logic
- Fallback chain: `navigator.share` → clipboard → download

### Theme Context
- `useTheme` hook for theme state
- System preference detection + localStorage persistence

### SEO & Metadata
- `SEOHead` component manages document head via `react-helmet-async`
- Injects `SoftwareApplication` JSON-LD for rich results
- `url` property in `SEOHead` MUST remain sync with deployment URL

## CI/CD

- **Deploy**: GitHub Actions → GitHub Pages (push to `main`)
- **Gates**: lint, test, build must pass
- **Security**: Snyk dependency scanning (requires `SNYK_TOKEN`)

---

> Synced with Constitution v1.7.4 (2026-02-17). See `.specify/memory/constitution.md` for full governance details.
