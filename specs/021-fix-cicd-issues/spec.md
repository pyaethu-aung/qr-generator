# Feature Specification: CI/CD Workflow Trigger and Conditional Accuracy Improvements

**Feature Branch**: `021-fix-cicd-issues`  
**Created**: 2026-02-24  
**Status**: Draft  
**Input**: User description: "CI/CD workflow trigger and conditional accuracy improvements"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Deploy Workflow Triggers Only on Meaningful Source Changes (Priority: P1)

As a developer maintaining the QR generator project, when I push a change to `main` that only affects a `README.md` or documentation file, the deployment workflow should not run — there is nothing to rebuild or redeploy. The deploy workflow must only activate when changes actually affect the built output: source code, dependency definitions, or configuration files used during the build.

**Why this priority**: This is the most impactful fix — unnecessary deployments waste CI minutes, can cause spurious deployment failures on non-breaking changes, and give a false impression that every commit to `main` deploys. Getting the trigger right is foundational to CI reliability.

**Independent Test**: Can be fully tested by pushing a documentation-only commit to `main` and confirming the deploy workflow is not triggered, and separately pushing a source file change and confirming it does trigger.

**Acceptance Scenarios**:

1. **Given** a push to `main` that modifies only `README.md`, **When** the CI system evaluates the workflow trigger, **Then** the deploy workflow does NOT run.
2. **Given** a push to `main` that modifies any file under `src/`, **When** the CI system evaluates the workflow trigger, **Then** the deploy workflow DOES run.
3. **Given** a push to `main` that modifies `package.json` or `package-lock.json`, **When** the CI system evaluates the workflow trigger, **Then** the deploy workflow DOES run.
4. **Given** a push to `main` that modifies `vite.config.*`, `tsconfig.*`, or `.nvmrc`, **When** the CI system evaluates the workflow trigger, **Then** the deploy workflow DOES run.
5. **Given** a push to `main` that modifies the deploy workflow file itself, **When** the CI system evaluates the workflow trigger, **Then** the deploy workflow DOES run.
6. **Given** a manual `workflow_dispatch` event, **When** the CI system receives it, **Then** the deploy workflow DOES run regardless of which files changed (path filters do not apply to `workflow_dispatch`).

---

### User Story 2 - Security Workflow Excludes Non-Security Configuration Files (Priority: P2)

As a developer making a change to ESLint rules or TypeScript compiler options, the security scan workflow should not trigger. Changes to linting and type-checking configuration do not introduce or remove security vulnerabilities — they only affect code style and type correctness. The security workflow path filters should be scoped to files that can meaningfully affect the application's security posture: dependency manifests and application source code.

**Why this priority**: Incorrect path filters in the security workflow produce false positives — security alerts or CI noise triggered by changes that have no security implications. This erodes trust in the security signal.

**Independent Test**: Can be fully tested by pushing a change to `eslint.config.js` or a `tsconfig.*` file to `main` and confirming the security workflow does not trigger, and separately pushing a `package.json` change and confirming it does trigger.

**Acceptance Scenarios**:

1. **Given** a push to `main` that modifies only `eslint.config.js`, **When** the CI system evaluates the security workflow trigger, **Then** the security workflow does NOT run.
2. **Given** a push to `main` that modifies only `tsconfig.json` or any `tsconfig.*` file, **When** the CI system evaluates the security workflow trigger, **Then** the security workflow does NOT run.
3. **Given** a push to `main` that modifies `package.json` or `package-lock.json`, **When** the CI system evaluates the security workflow trigger, **Then** the security workflow DOES run.
4. **Given** a push to `main` that modifies any file under `src/`, **When** the CI system evaluates the security workflow trigger, **Then** the security workflow DOES run.
5. **Given** a push to `main` that modifies the security workflow file itself, **When** the CI system evaluates the security workflow trigger, **Then** the security workflow DOES run.

---

### User Story 3 - SARIF Upload Skipped on Manual Workflow Cancellation (Priority: P3)

As a developer who manually cancels a running security workflow, the Snyk SARIF upload step should not attempt to run after cancellation. An upload of an incomplete or empty SARIF file causes a misleading or failed upload to the GitHub Security tab. The upload step should run after both successful and failed Snyk scans (so real vulnerability findings are always reported), but not after a cancellation.

**Why this priority**: While the impact is lower than the trigger issues, a cancelled-then-uploading workflow produces confusing noise in the GitHub Security tab and can pollute the security findings history with empty results.

**Independent Test**: Can be fully tested by manually cancelling a running security workflow and confirming the "Upload Snyk results to GitHub Security tab" step is skipped in the workflow run summary.

**Acceptance Scenarios**:

1. **Given** the Snyk Scan step completes successfully (no vulnerabilities found), **When** the upload step evaluates its condition, **Then** the upload step DOES run.
2. **Given** the Snyk Scan step exits with a failure (vulnerabilities found), **When** the upload step evaluates its condition, **Then** the upload step DOES run (so findings are always reported).
3. **Given** the workflow is manually cancelled mid-run, **When** the upload step evaluates its condition, **Then** the upload step does NOT run.

---

### Edge Cases

- What happens when a push to `main` modifies both a documentation file and a source file? The deploy and security workflows should trigger because at least one path-matched file changed.
- What happens if the `snyk.sarif` file is not created because the Snyk step was skipped due to a missing `SNYK_TOKEN` secret? The SARIF upload step should not run if Snyk did not complete — the `success() || failure()` condition covers this correctly since a skipped step does not set `failure()` on upstream.
- What happens when `workflow_dispatch` is used on the security workflow? Path filters do not apply to manual triggers; the workflow should run as normal.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The deploy workflow (`deploy.yml`) MUST include path filters on the `push` trigger so that it only runs when files that affect the built output are changed.
- **FR-002**: The deploy workflow path filters MUST include: all files under `src/`, `package.json`, `package-lock.json`, build and compiler configuration files (`vite.config.*`, `tsconfig.*`, `.nvmrc`), and the workflow file itself (`.github/workflows/deploy.yml`).
- **FR-003**: The deploy workflow MUST continue to support `workflow_dispatch` as a trigger with no path restriction (path filters only apply to event-based triggers like `push`).
- **FR-004**: The security workflow (`security.yml`) MUST remove `eslint.config.js` and `tsconfig.*` from its path filters under both `push` and `pull_request` triggers.
- **FR-005**: The security workflow path filters MUST retain: all files under `src/`, `package.json`, `package-lock.json`, and the workflow file itself (`.github/workflows/security.yml`).
- **FR-006**: The "Upload Snyk results to GitHub Security tab" step in `security.yml` MUST use the condition `if: success() || failure()` instead of `if: always()`.
- **FR-007**: The SARIF upload step condition change MUST ensure the step runs after both a successful Snyk scan and a failed Snyk scan (vulnerability found), but NOT after a manual workflow cancellation.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A documentation-only commit to `main` (e.g., change to `README.md`) does not trigger the deploy workflow, reducing unnecessary CI runs to zero for non-source changes.
- **SC-002**: A change to `eslint.config.js` or any `tsconfig.*` file on `main` does not trigger the security workflow, eliminating false-positive security scans caused by non-security configuration changes.
- **SC-003**: Manually cancelling a security workflow run results in the "Upload Snyk results to GitHub Security tab" step being skipped 100% of the time, preventing partial or empty SARIF uploads.
- **SC-004**: All three changes can be validated within a single CI pipeline run cycle with no regressions to existing deploy, security scan, or CodeQL analysis behaviour.

## Assumptions

- The project uses Vite as its build tool; `vite.config.*` is included in deploy path filters as it affects build output.
- `.nvmrc` is included in deploy path filters because it specifies the Node.js version used during the build step.
- The security workflow's `schedule` trigger (weekly on Mondays) is unaffected by path filters — scheduled triggers always run regardless of path configuration.
- `eslint.config.js` and `tsconfig.*` are correctly classified as non-security files; their removal from security path filters is intentional and does not reduce security coverage.
- The `continue-on-error: true` on the Snyk step means that even when Snyk finds vulnerabilities and exits non-zero, the step is considered "failed" not "errored" from GitHub Actions perspective — so `failure()` correctly captures this case for the upload condition.
