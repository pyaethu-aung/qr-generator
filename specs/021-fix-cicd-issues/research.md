# Research: CI/CD Workflow Trigger and Conditional Accuracy Improvements

**Feature**: `021-fix-cicd-issues` | **Date**: 2026-02-24

> All three fixes were fully specified by the user. This document confirms the key
> GitHub Actions behavioural assumptions that underpin the implementation.

---

## Decision 1 — `paths:` filter applies only to event-based triggers

**Decision**: Path filters added under `push:` in `deploy.yml` will NOT be added under
`workflow_dispatch:` — the `workflow_dispatch:` block requires no `paths:` entry.

**Rationale**: GitHub Actions `paths:` filtering only applies to `push` and
`pull_request` events. The `workflow_dispatch` event always runs unconditionally
regardless of which files changed; adding `paths:` under `workflow_dispatch:` has no
effect and would be misleading. The fix correctly targets `push:` only.

**Alternatives considered**:
- Adding `paths:` under `workflow_dispatch:` — rejected; has no effect, adds confusion.
- Adding a separate `paths-ignore:` exclusion list — rejected; an inclusion list is
  more precise and easier to maintain for this use case.

---

## Decision 2 — `success() || failure()` vs `always()` for step conditionals

**Decision**: Replace `if: always()` with `if: success() || failure()` on the Snyk
SARIF upload step.

**Rationale**: GitHub Actions defines four job/step conclusion states: `success`,
`failure`, `cancelled`, and `skipped`. The functions map as follows:

| Function | success | failure | cancelled | skipped |
|----------|---------|---------|-----------|---------|
| `always()` | ✅ | ✅ | ✅ | ✅ |
| `success() \|\| failure()` | ✅ | ✅ | ❌ | ❌ |
| `success()` | ✅ | ❌ | ❌ | ❌ |

`success() || failure()` is the correct guard: it runs after both a clean Snyk scan
and a scan that finds vulnerabilities (`continue-on-error: true` means Snyk exits
non-zero on findings, which GitHub Actions classifies as `failure` on the step), but it
correctly skips on manual cancellation (`cancelled` state).

**Alternatives considered**:
- `if: success()` — rejected; would skip the upload when Snyk finds vulnerabilities,
  preventing findings from reaching the GitHub Security tab.
- Keeping `if: always()` — rejected; causes uploads on cancellation, producing
  empty/partial SARIF results in the Security tab.

---

## Decision 3 — `eslint.config.js` and `tsconfig.*` classification

**Decision**: Remove both from `security.yml` path filters. Retain both in `lint.yml`
path filters unchanged.

**Rationale**:
- **`security.yml`**: The workflow runs `npm audit` and Snyk/CodeQL scans, which
  analyse dependency trees and source code for known vulnerabilities. ESLint rule
  changes and TypeScript compiler option changes have zero effect on vulnerability
  detection. Their presence in `security.yml` triggers unnecessary, misleading scans.
- **`lint.yml`**: The workflow runs `npm run lint` (ESLint) and `tsc --noEmit`. Changes
  to `eslint.config.js` or `tsconfig.*` directly change what errors these commands
  report. Including them as triggering paths is correct and intentional.

**Alternatives considered**:
- Removing from both workflows — rejected; would mean `lint.yml` no longer runs when
  ESLint config changes, breaking the lint signal.
- Keeping in both workflows — rejected; creates unnecessary security workflow runs with
  no security value.

---

## Decision 4 — `lint.yml` path filters confirmed correct, no change needed

**Decision**: `lint.yml` is in scope for review (per clarification Q1) but requires no
modification.

**Current `lint.yml` paths** (both `push` and `pull_request`):
```yaml
- 'src/**'
- 'package.json'
- 'package-lock.json'
- 'eslint.config.js'
- 'tsconfig.*'
- '.github/workflows/lint.yml'
```

**Finding**: All entries are correct for a workflow that runs ESLint and `tsc`. No
additions or removals are needed. `docker-publish.yml` is explicitly out of scope.
