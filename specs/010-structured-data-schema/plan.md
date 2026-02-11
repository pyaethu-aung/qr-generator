# Implementation Plan: Implement Structured Data

**Branch**: `010-structured-data-schema` | **Date**: 2026-02-12 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

This feature adds `SoftwareApplication` JSON-LD structured data to the QR Code Generator's main page to target Google search rich results. We will implement a `SEOHead` component using `react-helmet-async` to inject the required metadata into the `<head>` of the document. This includes the application's category, price, operating system, and a feature list.

## User Review Required

> [!IMPORTANT]
> This plan introduces a new dependency: `react-helmet-async`. This is the industry-standard way to manage head tags in React applications.

## Technical Context

**Language/Version**: TypeScript / React 19  
**Primary Dependencies**: `react-helmet-async` (NEW), `react`, `react-dom`  
**Storage**: N/A  
**Testing**: `vitest`, `@testing-library/react`  
**Target Platform**: Web (Modern Browsers)  
**Project Type**: Single-page Web Application (Vite/React)  
**Performance Goals**: No negative impact on page load speed; metadata injected synchronously to ensure search engine crawlability.  
**Constraints**: UI/UX consistency, Dark/light theme support (though not directly applicable to JSON-LD), ARIA attributes (not directly applicable).  
**Scale/Scope**: Single component implementation with context provider integration.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] Tests, lint, and build MUST be run locally after every change via `npm run test`, `npm run lint`, and `npm run build` per constitution.
- [x] Unit and integration tests MUST be added/updated for each change; maintain coverage ≥85%.
- [x] UI MUST be fully functional and consistent across desktop/mobile and major browsers via responsive design.
- [x] Theme support: all UI MUST be planned with dark/light theme support.
- [x] Skill audits: React components MUST be audited against `vercel-react-best-practices`.
- [x] Structure adherence: UI in `src/components`, hooks in `src/hooks`, utilities in `src/utils`, data shapers in `src/data`, shared types in `src/types`.
- [x] Remove unused code/assets; no commented-out blocks committed.
- [x] Commit discipline: commit each phase after completion; follow 50/72 rule.
- [x] **AGENTS.md sync**: update if constitution changes (N/A for this task).
- [x] CI gates (lint, test, build) MUST pass; PR review is mandatory.

## Project Structure

### Documentation (this feature)

```text
specs/010-structured-data-schema/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output
```

### Source Code

```text
src/
├── components/
│   └── common/
│       ├── SEOHead.tsx       # [NEW] SEO component
│       └── __tests__/
│           └── SEOHead.test.tsx # [NEW] Unit tests
├── App.tsx                   # Integrate HelmProvider and SEOHead
└── main.tsx                  # Wrap with HelmetProvider
```

**Structure Decision**: Standard SPA layout as per constitution.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |

### Dependencies

#### [MODIFY] [package.json](../../package.json)
- Add `react-helmet-async` to dependencies.

### SEO Component

#### [NEW] [SEOHead.tsx](../../src/components/common/SEOHead.tsx)
- Implementation of the `SEOHead` component using `Helmet` from `react-helmet-async`.
- Injects JSON-LD script tag with `SoftwareApplication` schema.

#### [MODIFY] [App.tsx](../../src/App.tsx)
- Render `SEOHead` within the main application tree.

#### [MODIFY] [main.tsx](../../src/main.tsx)
- Wrap `<App />` with `<HelmetProvider />`.

### Documentation

#### [MODIFY] [README.md](../../README.md)
- Add a "Maintenance" or "SEO" section explaining how to update the application URL in `index.html`'s JSON-LD.

## Verification Plan

### Automated Tests
- Run `npm run test src/components/common/__tests__/SEOHead.test.tsx` to verify component renders the script tag correctly.
- Run `npm run lint` to ensure code quality.
- Run `npm run build` to verify no build regressions.

### Manual Verification
- Start dev server: `npm run dev`.
- Inspect the `<head>` of the page in the browser (F12 -> Elements -> Head).
- Check for the presence of `<script type="application/ld+json">`.
- Use [Google Rich Results Test](https://search.google.com/test/rich-results) with the dev server URL (or tunnel it if needed, or paste the rendered HTML).
