# Implementation Plan: QR site branding and bilingual toggle

**Branch**: `feature/002-seo-i18n-toggle` | **Date**: 2026-01-20 | **Spec**: [specs/002-seo-i18n-toggle/spec.md](specs/002-seo-i18n-toggle/spec.md)
**Input**: Feature specification from `/specs/002-seo-i18n-toggle/spec.md`

## Summary

- Brand the experience as "QR Code Generator" across document title, hero, and metadata.
- Add SEO/Open Graph/Twitter metadata and keep HTML `lang` in sync with active locale.
- Provide bilingual UI (English default, Burmese `my`) with a top-right toggle and immediate text/metadata updates; persist preference locally.
- Store translations in separate locale config files to simplify adding future languages.

## Technical Context

**Language/Version**: TypeScript + React 19 (Vite)  
**Primary Dependencies**: qrcode.react, qrcode, Tailwind CSS v4, React Router (N/A), i18n via custom locale configs  
**Storage**: Browser localStorage for `LocalePreference` (fallback to in-memory default)  
**Testing**: Vitest + React Testing Library + jest-dom; run `npm run test` + `npm run lint` per change  
**Target Platform**: Web SPA  
**Project Type**: single web app  
**Performance Goals**: Language toggle applies text + metadata within 1s; no full page reloads  
**Constraints**: Accessibility-first (correct `lang`, aria labels), SEO metadata present for both locales, coverage ≥85%  
**Scale/Scope**: Single-page generator with bilingual UI; future languages supported via additional locale config files

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Tests and lint MUST be run locally after every change via `npm run test` and `npm run lint` per constitution.
- Unit and integration tests MUST be added/updated for each change; maintain coverage ≥85%.
- Structure adherence: UI in `src/components`, hooks in `src/hooks`, utilities in `src/utils`, data shapers in `src/data`, shared types in `src/types`.
- Remove unused code/assets; no commented-out blocks committed.
- Commit discipline: commit each task; commit titles ≤50 chars and body lines ≤72 chars.
- CI gates (lint, test, build) MUST pass; PR review is mandatory.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)
```text
src/
├── components/
│   ├── common/
│   └── feature/qr/
├── hooks/
├── utils/
├── data/
│   └── i18n/            # locale config files (en.json, my.json, index.ts)
├── types/
└── assets/

specs/002-seo-i18n-toggle/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
└── contracts/

tests/ (co-located via Vitest + RTL under src/**/__tests__)
```

**Structure Decision**: Keep SPA layout; add `src/data/i18n` for locale config files to ease future language additions while aligning with data shapers area. Tests remain co-located near components/hooks.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
