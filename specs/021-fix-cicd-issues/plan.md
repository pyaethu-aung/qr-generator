# Implementation Plan: CI/CD Workflow Trigger and Conditional Accuracy Improvements

**Branch**: `021-fix-cicd-issues` | **Date**: 2026-02-24 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/021-fix-cicd-issues/spec.md`

## Summary

Three isolated, surgical YAML edits to GitHub Actions workflow files — no application
code is changed. The fixes address two trigger-accuracy problems (unnecessary workflow
runs caused by missing or incorrect `paths:` filters) and one step-conditional problem
(SARIF upload running even after manual cancellation).

1. **`deploy.yml`** — add `paths:` inclusion filters to the `push` trigger
2. **`security.yml`** — remove non-security config files from `paths:` filters; change
   SARIF upload condition from `always()` to `success() || failure()`
3. **`lint.yml`** — reviewed; no change required (path filters are correct as-is)

## Technical Context

**Language/Version**: YAML (GitHub Actions workflow syntax)  
**Primary Dependencies**: GitHub Actions built-ins (`paths:` filter, step conditionals);
`snyk/actions/node@v1.0.0`; `github/codeql-action/upload-sarif@v4`  
**Storage**: N/A  
**Testing**: Manual CI observation on push to `main`; no automated test suite for
workflow YAML files  
**Target Platform**: GitHub Actions (ubuntu-latest runners)  
**Performance Goals**: N/A  
**Constraints**: YAML-only edits; no new files; no new dependencies; no application
code touched; three atomic, independently deployable changes  
**Scale/Scope**: 2 files modified (`deploy.yml`, `security.yml`); 1 file reviewed with
no change (`lint.yml`); approximately 12 YAML lines changed total

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Code Quality | ✅ Pass | YAML edits are minimal, readable, and idiomatic |
| II. Testing (NON-NEGOTIABLE) | ✅ Pass (exception justified) | `npm run test/lint/build` are inapplicable — no application code is touched. Acceptance test is manual CI observation per FR-001–008. Documented in Complexity Tracking. |
| III. UX Consistency | ✅ N/A | No user-facing interface changes |
| IV. Performance | ✅ N/A | No runtime performance implications |
| V. Architecture & Structure | ✅ Pass | No source directory changes; edits are confined to `.github/workflows/` |
| VI. Execution Discipline (NON-NEGOTIABLE) | ✅ Pass (exception justified) | `npm run build` is inapplicable. Exception documented — CI itself is the build/validate surface for this change. |
| VII. Cross-Platform | ✅ N/A | No UI changes |
| VIII. Theme Support | ✅ N/A | No UI changes |
| IX. Skill-Driven Dev | ✅ N/A | No React/UI/TS code; `react-vite-essentials` and `web-design-guidelines` skills do not apply |

## Project Structure

### Documentation (this feature)

```text
specs/021-fix-cicd-issues/
├── plan.md              ← this file
├── research.md          ← Phase 0 output
├── quickstart.md        ← Phase 1 output (validation guide)
└── tasks.md             ← Phase 2 output (/speckit.tasks — not created here)
```

> `data-model.md` and `contracts/` are omitted — this feature has no data entities
> and no API surface.

### Source Code (affected files only)

```text
.github/workflows/
├── deploy.yml           ← MODIFIED: add paths: filter to push trigger
├── security.yml         ← MODIFIED: remove eslint.config.js + tsconfig.* from
│                           paths: filters; change SARIF upload if: condition
└── lint.yml             ← REVIEWED: no change required
```

**Structure Decision**: Single-project, configuration-only change. No new directories
or source files are created. All edits are within `.github/workflows/`.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|--------------------------------------|
| §II/§VI: No `npm run test/lint/build` | Workflow YAML has no compilable or testable application code | Running the app test suite would not exercise or validate GitHub Actions trigger logic — CI observation is the only valid acceptance mechanism |

## Implementation Phases

### Phase 1 — Apply Fixes (all in `.github/workflows/`)

#### Fix 1 — Add `paths:` filter to `deploy.yml` `push` trigger

**File**: `.github/workflows/deploy.yml`  
**Change**: Add a `paths:` block under the `push:` trigger event only.  
`workflow_dispatch:` is left without path restriction — manual triggers always run
unconditionally regardless of which files changed.

Path filter entries to add (under `push:` only):
```yaml
paths:
  - '.github/workflows/deploy.yml'
  - 'src/**'
  - 'index.html'
  - 'public/**'
  - 'package.json'
  - 'package-lock.json'
  - 'vite.config.*'
  - 'tsconfig.*'
  - '.nvmrc'
```

**Acceptance**: Push a `README.md`-only commit to `main` → deploy workflow does NOT
run. Push a `src/` change → deploy workflow DOES run.

---

#### Fix 2 — Remove non-security files from `security.yml` `paths:` filters

**File**: `.github/workflows/security.yml`  
**Change**: Remove `eslint.config.js` and `tsconfig.*` from the `paths:` block under
**both** `push:` and `pull_request:` triggers.

Lines to remove from each `paths:` block:
```yaml
      - 'eslint.config.js'   # ← remove
      - 'tsconfig.*'         # ← remove
```

Retained paths (unchanged):
```yaml
paths:
  - 'src/**'
  - 'package.json'
  - 'package-lock.json'
  - '.github/workflows/security.yml'
```

**Acceptance**: Push a `tsconfig.json`-only change to `main` → security workflow does
NOT run. Push a `package.json` change → security workflow DOES run.

---

#### Fix 3 — Change SARIF upload condition in `security.yml`

**File**: `.github/workflows/security.yml`  
**Change**: On the "Upload Snyk results to GitHub Security tab" step, change:

```yaml
if: always()
```
to:
```yaml
if: success() || failure()
```

**Rationale**: `always()` runs even after a manual cancellation, producing partial or
empty SARIF uploads. `success() || failure()` runs after both a clean Snyk scan and a
scan that finds vulnerabilities, but skips on cancellation.

**Acceptance**: Manually cancel a running security workflow → upload step is skipped
in the workflow run summary.

---

#### Fix 4 — Review `lint.yml` (no change)

**File**: `.github/workflows/lint.yml`  
**Finding**: Path filters are correct. `eslint.config.js` and `tsconfig.*` are
legitimately included because this workflow runs `npm run lint` (ESLint) and
`tsc --noEmit` directly — changes to those files materially affect lint and type-check
outcomes. No modification required.

**Deliverable**: Finding documented in spec Assumptions; no YAML edit made.
