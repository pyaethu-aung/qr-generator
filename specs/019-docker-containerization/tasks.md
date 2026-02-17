---
description: "Task list for Docker Containerization"
---

# Tasks: Docker Containerization

**Input**: Design documents from `/specs/019-docker-containerization/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, quickstart.md

**Tests**:
Tests are mandatory. After each task, run `npm run test`, `npm run lint`, and `npm run build` before merge.
For Docker tasks, testing involves `docker build` validation, `hadolint` linting, and `trivy` scanning.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create `.docker/` directory and `.dockerignore` file in project root
- [x] T002 Create `.trivyignore` file in project root for unfixable CVE suppressions

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T003 Create Nginx configuration in `.docker/nginx.conf` with SPA routing (`try_files $uri $uri/ /index.html`), gzip compression, security headers (X-Frame-Options, X-Content-Type-Options, Referrer-Policy, CSP with `unsafe-inline`/`unsafe-eval`), and `/health` endpoint
- [x] T004 Create multi-stage `Dockerfile` in project root with builder stage (`node:20-alpine`, `npm ci`, `tsc -b && vite build`) and runtime stage (`nginx:alpine`, non-root `app` user UID 1000, read-only fs prep, `COPY` dist + nginx.conf)

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Secure Production Deployment (Priority: P1) 🎯 MVP

**Goal**: DevOps engineer can deploy secure, optimized Docker image to GHCR via tag push

**Independent Test**: Push a semver tag (`v*.*.*`), verify image appears in GHCR, pull image, run it, and verify application accessibility and health endpoint

### Implementation for User Story 1

- [ ] T005 [US1] Finalize `Dockerfile` builder stage: copy `package.json` + `package-lock.json` first, `npm ci`, then copy source + config files, run `tsc -b && vite build` (layer cache optimization per FR-016)
- [ ] T006 [US1] Finalize `Dockerfile` runtime stage: create non-root `app` user (UID 1000, no home, no shell), copy `dist/` from builder, copy `.docker/nginx.conf`, set writable dirs (`/var/cache/nginx`, `/var/run`, `/tmp`), expose port 80, `HEALTHCHECK` instruction
- [ ] T007 [US1] Create GitHub Actions workflow `.github/workflows/docker-publish.yml` with triggers (`push` main, `tags v*.*.*`, `pull_request` main, daily cron `35 6 * * *`), env vars (`REGISTRY: ghcr.io`, `IMAGE_NAME`), and permissions (`contents: read`, `packages: write`, `id-token: write`)
- [ ] T008 [US1] Add Hadolint linting step to `.github/workflows/docker-publish.yml` using `hadolint/hadolint-action@v3.1.0`
- [ ] T009 [US1] Add Cosign installer step to `.github/workflows/docker-publish.yml` (skip on PRs) using `sigstore/cosign-installer@v3.5.0`
- [ ] T010 [US1] Add Docker Buildx setup, GHCR login (skip on PRs), and metadata extraction steps to `.github/workflows/docker-publish.yml` with semver tags (`{{version}}`, `{{major}}.{{minor}}`, `{{major}}`, `sha`)
- [ ] T011 [US1] Add build-and-load step to `.github/workflows/docker-publish.yml` for local Trivy scanning (with GHA cache)
- [ ] T012 [US1] Add Trivy vulnerability scanning step to `.github/workflows/docker-publish.yml` (`exit-code: 1`, `ignore-unfixed: true`, `severity: CRITICAL,HIGH`, `trivyignores: .trivyignore`)
- [ ] T013 [US1] Add build-and-push step to `.github/workflows/docker-publish.yml` with `push: ${{ startsWith(github.ref, 'refs/tags/') }}` (tag-only push), `platforms: linux/amd64`, GHA cache
- [ ] T014 [US1] Add Cosign signing step to `.github/workflows/docker-publish.yml` (tag-only, signs `{}@${DIGEST}`)
- [ ] T015 [US1] Add health check endpoint `/health` returning `200 OK` in `.docker/nginx.conf` (verify with `curl http://localhost:8080/health` after local `docker run`)

**Checkpoint**: User Story 1 fully functional and testable independently

---

## Phase 4: User Story 2 - Local Development Parity (Priority: P2)

**Goal**: Developer can build and run production-like container locally with npm convenience scripts

**Independent Test**: Run `npm run docker:build` and `npm run docker:run` locally, access app at `http://localhost:8080`, verify all features work

### Implementation for User Story 2

- [ ] T016 [US2] Add `docker:build` script to `package.json`: `docker build -t qr-generator:local .`
- [ ] T017 [US2] Add `docker:run` script to `package.json`: `docker run --rm -p 8080:80 --name qr-app --read-only --cap-drop ALL --tmpfs /var/cache/nginx:mode=1777 --tmpfs /var/run:mode=1777 --tmpfs /tmp:mode=1777 qr-generator:local`
- [ ] T018 [US2] Validate local build: run `npm run docker:build`, verify image size < 25MB compressed (`docker save qr-generator:local | gzip | wc -c`), document findings in `specs/019-docker-containerization/research.md`
- [ ] T019 [US2] Validate non-root execution: run `npm run docker:run`, verify `docker exec qr-app whoami` returns `app` and `docker exec qr-app touch /test-file` fails with read-only error

**Checkpoint**: User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Automated Security Compliance (Priority: P2)

**Goal**: Security engineer has automated daily checks for vulnerabilities and Dockerfile best practices

**Independent Test**: Verify scheduled cron trigger runs daily scan; introduce Dockerfile bad practice, verify Hadolint fails

### Implementation for User Story 3

- [ ] T020 [US3] Verify daily schedule cron (`35 6 * * *`) in `.github/workflows/docker-publish.yml` triggers build + Trivy scan (no push) — already configured in T007 trigger, validate the scheduled path builds and scans correctly
- [ ] T021 [US3] Populate `.trivyignore` with any known unfixable false positives discovered during T012/T018 validation (if none found, add header comment explaining purpose)

**Checkpoint**: All user stories should now be independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T022 [P] Update `README.md` with Docker instructions section (build, run, verify, scan commands from `quickstart.md`)
- [ ] T023 [P] Validate `specs/019-docker-containerization/quickstart.md` instructions against final implementation — run each command, fix any discrepancies

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Phase 1
- **User Stories (Phase 3+)**: Depend on Phase 2
- **Polish (Final)**: Depends on all user stories

### User Story Dependencies

- **US1**: Foundation → US1 (T005-T015)
- **US2**: Foundation → US2 (T016-T019); independent of US1, but shares `Dockerfile`
- **US3**: Foundation → US3 (T020-T021); independent of US1/US2, validates US1 pipeline

### Within Each User Story

- Dockerfile stages (T005-T006) before CI/CD workflow (T007-T014)
- CI/CD workflow steps in execution order (Hadolint → Cosign install → Buildx → Login → Metadata → Build+Load → Trivy → Build+Push → Sign)
- Local scripts (T016-T017) before validation (T018-T019)

### Parallel Opportunities

- T001 and T002 can run in parallel (different files, no dependencies)
- T008, T009, T010 can be worked on in parallel after T007 creates the workflow file
- T016 and T017 can be worked on in parallel (both modify `package.json` but different script entries)
- T022 and T023 can run in parallel (different files)

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 & 2 (`.dockerignore` + `nginx.conf` + `Dockerfile`)
2. Complete Phase 3 (CI/CD pipeline: build → scan → push → sign)
3. **STOP and VALIDATE**: Push tag, check GHCR, pull image, `curl /health`

### Incremental Delivery

1. Foundation ready (`Dockerfile` + `nginx.conf` work locally)
2. Add CI/CD (US1) → Production release ready on tag push
3. Add dev scripts (US2) → Developer convenience + size/security validation
4. Add scheduled scans (US3) → Ongoing security maturity
5. Polish → Documentation alignment + README

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Docker image is pushed to GHCR ONLY on semver tag pushes (`v*.*.*`)
- Main branch, PR, and scheduled cron triggers only build + scan (no push)
- Commit after each task or logical group following 50/72 commit convention
- Stop at any checkpoint to validate story independently
