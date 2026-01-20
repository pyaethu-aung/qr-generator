# Tasks: QR site branding and bilingual toggle

**Input**: specs/002-seo-i18n-toggle/spec.md and plan.md
**Prerequisites**: plan.md (required), spec.md (required); optional docs currently not present

**Tests**: Testing is MANDATORY per Constitution Principle II. Run `npm run test` and `npm run lint` after every change. Every code change must add or update unit tests, all tests must pass before merge, and every user story implementation must include corresponding unit and integration tests unless explicitly waived. Maintain project-wide coverage at or above 85%.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare i18n storage for locale configs

- [X] T001 [P] Create locale config directory with initial files src/data/i18n/en.json, src/data/i18n/my.json, src/data/i18n/index.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core i18n and metadata plumbing required by all stories

- [X] T002 Define i18n types and locale key exports in src/types/i18n.ts
- [X] T003 Implement locale loader and translation resolver in src/data/i18n/index.ts (import json, expose `getCopy(lang)`)
- [X] T022 [P] Add English fallback for missing translations and log gaps in src/data/i18n/index.ts with unit tests in src/data/i18n/__tests__/i18n.test.ts
- [X] T004 Implement metadata helper to set document title, meta description, Open Graph/Twitter tags per locale in src/utils/metadata.ts
 - [X] T005 Implement locale state hook with `useLocale` (lang state, setter, fallbacks) in src/hooks/useLocale.ts
- [X] T006 Wire HTML `lang` synchronization effect in src/main.tsx to active locale

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Site identity and metadata (Priority: P1) 🎯 MVP

**Goal**: Brand site as "QR Code Generator" with correct default metadata in English

**Independent Test**: Fresh load shows English branding; metadata (title, description, OG/Twitter) present; HTML `lang` = en

### Implementation for User Story 1

- [ ] T007 [P] [US1] Add metadata helper unit tests covering en defaults in src/utils/__tests__/metadata.test.ts
- [ ] T008 [US1] Apply default English copy (title/heading/body strings) via i18n resolver in src/App.tsx and src/components/feature/qr/*.tsx
- [ ] T009 [US1] Render SEO meta tags (title, description, OG/Twitter) with English values in src/App.tsx using metadata helper

**Checkpoint**: User Story 1 fully functional and testable independently

---

## Phase 4: User Story 2 - Toggle language top-right (Priority: P1)

**Goal**: Top-right toggle switches UI between English and Burmese immediately with accessible control

**Independent Test**: Toggle to Burmese updates all visible strings and metadata; toggle is keyboard-focusable and announces languages

### Tests for User Story 2

- [ ] T010 [P] [US2] Add RTL/Vitest tests for LanguageToggle focusability and label announcements in src/components/common/__tests__/LanguageToggle.test.tsx
- [ ] T011 [P] [US2] Add integration test to verify UI strings and metadata swap to Burmese on toggle in src/App.test.tsx
- [ ] T024 [US2] Add performance check in src/App.test.tsx ensuring toggle + metadata update completes within 1s

### Implementation for User Story 2

- [ ] T012 [P] [US2] Build LanguageToggle component in src/components/common/LanguageToggle.tsx positioned top-right, consuming useLocale
- [ ] T013 [US2] Replace hardcoded strings with i18n lookups across QR views in src/components/feature/qr/*.tsx and shared UI
- [ ] T014 [US2] Invoke metadata helper on locale changes to update title/meta/OG/Twitter in src/App.tsx

**Checkpoint**: User Story 1 and 2 functional and independently testable

---

## Phase 5: User Story 3 - Persist language preference (Priority: P2)

**Goal**: Remember user-selected language across visits; default to English when storage unavailable

**Independent Test**: Switch to Burmese, reload, locale persists; when storage blocked, app falls back to English without errors

### Tests for User Story 3

- [ ] T015 [P] [US3] Add persistence and fallback tests for useLocale (localStorage available/unavailable) in src/hooks/__tests__/useLocale.test.ts
- [ ] T023 [P] [US3] Add tests for invalid/unknown locale codes defaulting to English in src/hooks/__tests__/useLocale.test.ts and src/App.test.tsx
- [ ] T016 [P] [US3] Add integration test to confirm initial locale derives from stored preference in src/App.test.tsx

### Implementation for User Story 3

- [ ] T017 [US3] Persist locale selection with storage guards inside src/hooks/useLocale.ts (read/write, graceful fallback)
- [ ] T018 [US3] Initialize app with stored locale and sync toggle/metadata on load in src/App.tsx

**Checkpoint**: All user stories independently functional

---

## Phase N: Polish & Cross-Cutting Concerns

- [ ] T019 [P] Update documentation for i18n usage and SEO expectations in README.md and specs/002-seo-i18n-toggle/quickstart.md
- [ ] T020 Run `npm run lint` and `npm run test` and address any issues; ensure coverage ≥85%
- [ ] T021 [P] Accessibility sweep for language labels and metadata correctness (manual + axe) across pages

---

## Dependencies & Execution Order

- Foundational (Phase 2) blocks all user stories
- User Story 1 must complete before User Story 2 and 3 (metadata and base copy required)
- User Story 2 depends on i18n foundation and default copy (Phase 3) but can proceed after US1
- User Story 3 depends on locale hook and toggle from US2 for persistence validation

### User Story Dependencies

- US1 → US2 → US3

### Within Each User Story

- Tests first (where present), then implementation
- i18n copy before metadata updates within a story
- Metadata updates after locale state is wired

### Parallel Opportunities

- T001, T002, T003 can run in parallel (different files)
- Within US2, T010 and T011 can run in parallel; T012 and T013 can run in parallel once foundation is ready
- Within US3, T015 and T016 can run in parallel; T017 depends on T015, T016 depends on T017 for final verification

## Parallel Example: User Story 2

- Parallel tests: T010 and T011
- Parallel implementation: T012 and T013 after foundation; T014 follows to wire metadata updates

## Implementation Strategy

- MVP: Complete Phases 1–3 to deliver branded English experience with SEO metadata.
- Incremental: Add toggle (Phase 4) with tests; then add persistence (Phase 5).
- Always run `npm run lint` and `npm run test` after changes; maintain coverage ≥85%.
