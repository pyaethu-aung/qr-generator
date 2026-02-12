# Tasks: Implement Structured Data

**Input**: Design documents from `specs/010-structured-data-schema/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, quickstart.md

**Tests**: Testing is MANDATORY per Constitution Principle II. Run `npm run test`, `npm run lint`, and `npm run build` after every change. Every code change must add or update unit tests, all tests must pass before merge, and every user story implementation must include corresponding unit and integration tests unless explicitly waived. **Every utility function in `src/utils/` MUST have a corresponding unit test.** Maintain project-wide coverage at or above 85%. Additionally, UI changes MUST be verified on both desktop and mobile browsers per Principle VII, MUST consider dark/light theme support per Principle VIII, and React components MUST be audited against `vercel-react-best-practices` and UI/UX decisions against `web-design-guidelines` per Principle IX. **All components MUST include ARIA attributes.** Commit discipline: commit each phase after completion following the 50/72 rule (subject ≤50 chars, body ≤72 chars per line) with conventional commit prefixes.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include repo-relative file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Install `react-helmet-async` dependency in `package.json`
- [x] T002 Configure `HelmetProvider` in `src/main.tsx`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T003 Define `SoftwareApplicationJSONLD` interface in `src/types/seo.ts`
- [x] T004 Create `SEOHead` component boilerplate in `src/components/common/SEOHead.tsx`

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Search Engine Rich Results (Priority: P1) 🎯 MVP

**Goal**: Inject `SoftwareApplication` JSON-LD schema into the document head for search engine indexing.

**Independent Test**: Inspect the `<head>` of the rendered page for a `<script type="application/ld+json">` tag containing a valid `SoftwareApplication` object with the specified metadata.

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T005 [P] [US1] Create unit test for `SEOHead` schema injection in `src/components/common/__tests__/SEOHead.test.tsx`

### Implementation for User Story 1

- [x] T006 [US1] Implement `SEOHead` component using `react-helmet-async` to inject JSON-LD in `src/components/common/SEOHead.tsx`
- [x] T007 [US1] Integrate `SEOHead` component into the application root in `src/App.tsx`
- [x] T008 [US1] Verify schema validity via `npm run test` and browser inspection

**Checkpoint**: User Story 1 is fully functional and testable independently.

---

## Phase 4: Polish & Cross-Cutting Concerns

**Purpose**: Documentation and final quality verification

- [x] T009 [P] Update `README.md` with SEO maintenance documentation regarding URL updates
- [x] T010 Run final project-wide verification: `npm run lint` and `npm run build`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Must complete first to have `react-helmet-async` available.
- **Foundational (Phase 2)**: Depends on Phase 1 for types and initial component structure.
- **User Story 1 (Phase 3)**: Depends on Phase 2. This is the MVP.
- **Polish (Phase 4)**: Final cleanup after functional implementation.

### User Story Dependencies

- **User Story 1 (US1)**: Primary goal, no dependencies on other stories.

---

## Parallel Example: User Story 1

```bash
# Launch setup and documentation tasks in parallel (if on different branches/PRs):
Task: "Configure HelmetProvider in src/main.tsx"
Task: "Update README.md with SEO maintenance documentation"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Verify JSON-LD injection in the browser head.

### Incremental Delivery

1. Setup + Foundation -> Infrastructure ready.
2. User Story 1 -> MVP delivery with rich results capability.
3. Polish -> Final documentation for site maintenance.
