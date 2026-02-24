# Tasks: CI/CD Workflow Trigger and Conditional Accuracy Improvements

**Input**: Design documents from `/specs/021-fix-cicd-issues/`  
**Prerequisites**: plan.md ✅ | spec.md ✅ | research.md ✅ | quickstart.md ✅

> **Note**: This feature is YAML-only. There are no application code changes, no data
> models, no API contracts, and no test tasks. Each fix is an isolated line-level edit
> to a single workflow file. `data-model.md` and `contracts/` are intentionally absent.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to
- Include exact file paths in descriptions

---

## Phase 1: Setup

**Purpose**: Confirm scope and current state of affected workflow files before editing.

- [X] T001 Confirm `.github/workflows/lint.yml` requires no changes — read the file,
  verify `eslint.config.js` and `tsconfig.*` are correctly included in both `push:` and
  `pull_request:` `paths:` blocks (lint/tsc config changes legitimately affect this
  workflow); the no-change finding is already documented in `specs/021-fix-cicd-issues/
  spec.md` Assumptions — verification only, no additional write needed

**Checkpoint**: Scope confirmed — three targeted edits across two files, lint.yml untouched.

---

## Phase 2: User Story 1 — Deploy Workflow Path Filters (Priority: P1) 🎯 MVP

**Goal**: Prevent the deploy workflow from running on documentation-only pushes by adding
`paths:` inclusion filters to the `push:` trigger in `deploy.yml`.

**Independent Test**: Push a `README.md`-only commit to `main` → deploy workflow does NOT
run. Push a `src/` file change → deploy workflow DOES run. (See quickstart.md §Fix 1.)

### Implementation for User Story 1

- [X] T002 [P] [US1] Add a `paths:` block under the `push:` trigger in
  `.github/workflows/deploy.yml` with these entries (in order):
  `.github/workflows/deploy.yml`, `src/**`, `index.html`, `public/**`,
  `package.json`, `package-lock.json`, `vite.config.*`, `tsconfig.*`, `.nvmrc` —
  leave the `workflow_dispatch:` block unchanged with no `paths:` entry [FR-003]

**Checkpoint**: `deploy.yml` updated. Push a doc-only commit to validate via GitHub
Actions UI before proceeding.

---

## Phase 3: User Story 2 — Security Workflow Path Filter Cleanup (Priority: P2)

**Goal**: Stop the security scan from triggering on ESLint and TypeScript config changes
by removing `eslint.config.js` and `tsconfig.*` from `security.yml` path filters.

**Independent Test**: Push a `tsconfig.json`-only change to `main` → security workflow
does NOT run. Push a `package.json` change → security workflow DOES run.
(See quickstart.md §Fix 2.)

### Implementation for User Story 2

- [ ] T003 [P] [US2] Remove `eslint.config.js` and `tsconfig.*` from the `paths:`
  block under the `push:` trigger in `.github/workflows/security.yml` — retain
  `src/**`, `package.json`, `package-lock.json`, and
  `.github/workflows/security.yml` (parallelisable with T002 only; T004 follows)

- [ ] T004 [US2] Remove `eslint.config.js` and `tsconfig.*` from the `paths:`
  block under the `pull_request:` trigger in `.github/workflows/security.yml` —
  retain the same four paths as T003 (depends on T003)

**Checkpoint**: Both `push:` and `pull_request:` path filter blocks in `security.yml`
now contain only the four security-relevant paths.

---

## Phase 4: User Story 3 — SARIF Upload Condition Fix (Priority: P3)

**Goal**: Prevent the Snyk SARIF upload step from running after a manual workflow
cancellation by replacing `always()` with `success() || failure()`.

**Independent Test**: Manually cancel a running security workflow → the "Upload Snyk
results to GitHub Security tab" step shows as **Skipped** in the run summary.
(See quickstart.md §Fix 3.)

### Implementation for User Story 3

- [ ] T005 [US3] Change `if: always()` to `if: success() || failure()` on the
  "Upload Snyk results to GitHub Security tab" step in
  `.github/workflows/security.yml` (line ~64; depends on T003/T004 being complete
  to avoid editing the file mid-sequence)

**Checkpoint**: All three fixes applied. `security.yml` now has clean path filters and
a correct SARIF upload condition.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Final verification pass and documentation closure.

- [ ] T006 [P] Run `git diff main..HEAD -- .github/workflows/lint.yml` and confirm
  empty output — validate lint.yml was not modified

- [ ] T007 [P] Run `git diff main..HEAD -- .github/workflows/` and review the full
  diff against the expected changes in `specs/021-fix-cicd-issues/plan.md` to confirm
  no unintended edits

- [ ] T008 Update `specs/021-fix-cicd-issues/checklists/requirements.md` — mark all
  items verified and add a note that CI observation tests in `quickstart.md` are the
  acceptance mechanism

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Phase 2 (US1)** and **Phase 3 (US2)**: Both depend on Phase 1; can run **in
  parallel** with each other — they edit different files
- **Phase 4 (US3)**: Depends on Phase 3 completion — T005 edits `security.yml`,
  which T003/T004 must finish first to avoid mid-sequence file conflicts
- **Polish (Phase 5)**: Depends on all user story phases being complete

### User Story Dependencies

- **User Story 1 (P1)**: Independent — edits `deploy.yml` only
- **User Story 2 (P2)**: Independent — edits `security.yml` path filters only
- **User Story 3 (P3)**: Sequentially after US2 — edits `security.yml` step condition

### Within Each User Story

- US2: T003 (push trigger) must complete before T004 (pull_request trigger) —
  same file, sequential to avoid conflicts
- US3: T005 must follow T003 + T004 — same file

### Parallel Opportunities

- T002 (deploy.yml) and T003 (security.yml) are different files → can run in parallel
- T006 and T007 (polish reads) → can run in parallel

---

## Parallel Example: User Stories 1 & 2

```bash
# After Phase 1 (T001), launch US1 and US2 simultaneously:
Task A: T002 — add paths: to deploy.yml push trigger
Task B: T003 — remove eslint.config.js + tsconfig.* from security.yml push trigger

# Task A completes independently.
# After Task B: T004 — remove from security.yml pull_request trigger
# After T003 + T004: T005 — change SARIF upload condition
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Confirm lint.yml scope (T001)
2. Complete Phase 2: Add deploy.yml path filters (T002)
3. **STOP and VALIDATE**: Push a doc-only commit to `main`, confirm no deploy triggered
4. Merge to main if validated

### Incremental Delivery

1. Phase 1 → scope confirmed
2. Phase 2 (US1) → deploy workflow only triggers on source changes ✅
3. Phase 3 (US2) → security workflow excludes non-security config ✅
4. Phase 4 (US3) → SARIF upload skips on cancellation ✅
5. Phase 5 → verified, documented ✅

### Sequential Single-Developer Strategy

```
T001 → T002 → T003 → T004 → T005 → T006+T007 → T008
```

Total: **8 tasks** | All YAML-only | No build step required

---

## Notes

- [P] tasks = different files or independent reads, no dependencies on each other
- [Story] label maps each task to its user story for traceability
- No `npm run test/lint/build` required — workflow files have no application code
- Acceptance testing is CI observation per `specs/021-fix-cicd-issues/quickstart.md`
- Commit after each phase (or each task) per Constitution §Commit Discipline
- `lint.yml` and `docker-publish.yml` are out of scope for edits
