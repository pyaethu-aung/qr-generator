# Tasks: Automated CI/CD Workflows

**Input**: Design documents from `/specs/004-github-workflows/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: Testing is MANDATORY per Constitution Principle II. While these tasks define GitHub workflows, you MUST verify each workflow's logic locally where possible (e.g., running `npm run lint`, `npm run build`, and `npm audit`) before committing. Every user story implementation must be verified by triggering the corresponding workflow in a test repository or via local runners if available.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **CI/CD Workflows**: `.github/workflows/`
- **Application Code**: `src/`
- **Tests**: `tests/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create GitHub Actions workflow directory in `.github/workflows/`
- [ ] T002 Configure GitHub Pages settings in repository (manual instruction in README/Spec)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T003 [P] Create base workflow template with Node.js 20 environment in `.github/workflows/base-node.yml.example`
- [x] T004 Define environment secrets schema for `SNYK_TOKEN` in `specs/004-github-workflows/quickstart.md`

**Checkpoint**: Foundation ready - workflow implementation can now begin

---

## Phase 3: User Story 1 - Automated Deployment to GitHub Pages (Priority: P1) 🎯 MVP

**Goal**: Automate the build and deployment of the Vite project to GitHub Pages on push to main.

**Independent Test**: Push to `main` branch and verify the "deploy" workflow completes and the site is live.

### Implementation for User Story 1

- [x] T005 [US1] Create deployment workflow file in `.github/workflows/deploy.yml`
- [x] T006 [US1] Define build job in `.github/workflows/deploy.yml` using `npm run build`
- [x] T007 [US1] Configure artifact upload for `dist/` directory in `.github/workflows/deploy.yml`
- [x] T008 [US1] Configure deployment job using `actions/deploy-pages` in `.github/workflows/deploy.yml`
- [x] T009 [US1] Add permissions for `id-token` and `pages` in `.github/workflows/deploy.yml`

**Checkpoint**: User Story 1 is fully functional.

---

## Phase 4: User Story 2 - Code Quality Verification (Priority: P2)

**Goal**: Automatically run linting and type checking on all pull requests.

**Independent Test**: Open a PR with a linting error and verify the "lint" workflow fails and blocks the PR.

### Implementation for User Story 2

- [x] T010 [US2] Create linting workflow file in `.github/workflows/lint.yml`
- [x] T011 [US2] Configure PR trigger for `main` branch in `.github/workflows/lint.yml`
- [x] T012 [US2] Implement `npm run lint` step in `.github/workflows/lint.yml`
- [x] T013 [US2] Implement `tsc --noEmit` type-check step in `.github/workflows/lint.yml`
- [x] T014 [US2] Implement `npm run build` verification step in `.github/workflows/lint.yml`

**Checkpoint**: User Story 2 is fully functional.

---

## Phase 5: User Story 3 - Security Vulnerability Scanning (Priority: P2)

**Goal**: Implement multi-layered security scanning using npm audit, CodeQL, and Snyk.

**Independent Test**: Trigger the security workflow and verify that reports for all three tools are generated in Action logs or Security tab.

### Implementation for User Story 3

- [x] T015 [US3] Create security workflow file in `.github/workflows/security.yml`
- [x] T016 [P] [US3] Implement `npm audit` step in `.github/workflows/security.yml`
- [x] T017 [P] [US3] Integrate GitHub CodeQL analysis in `.github/workflows/security.yml`
- [x] T018 [P] [US3] Integrate Snyk scanning using `SNYK_TOKEN` in `.github/workflows/security.yml`
- [x] T019 [US3] Configure failure conditions to alert on high-severity vulnerabilities in `.github/workflows/security.yml`

**Checkpoint**: User Story 3 is fully functional.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T020 [P] Update `README.md` with status badges for build, lint, and security
- [x] T021 [P] Ensure all workflows use consistent Node.js version management via `.nvmrc` or setup-node
- [ ] T022 Final validation of all workflows in the GitHub Actions dashboard
- [x] T023 Fix asset path 404 issue by setting `base: './'` in `vite.config.ts` and adding `.nojekyll`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Setup.
- **User Stories (Phase 3+)**: All depend on Foundational completion.
- **Polish (Final Phase)**: Depends on all user stories.

### Parallel Opportunities

- T003 and T004 (Foundational) can run in parallel.
- US1, US2, and US3 can be developed in parallel as they use different workflow files.
- T016, T017, and T018 (Security tools) can be configured in parallel within the same file.

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Setup + Foundational
2. Complete Phase 3: User Story 1 (Deployment)
3. Validate live site.

### Incremental Delivery

1. Foundation ready.
2. Add Deployment (US1) -> MVP!
3. Add Linting (US2) -> Quality enforcement.
4. Add Security (US3) -> Hardening.

---

## Notes

- [P] tasks = different files or independent logic blocks.
- [Story] label maps task to specific user story for traceability.
- Verify each command (`npm run lint`, etc.) works locally before adding to workflow.
