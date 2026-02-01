<!--
SYNC IMPACT REPORT
Version: 1.4.0 -> 1.5.0
Modified Principles:
- VII. Cross-Platform & Browser Compatibility (NEW: ensure UI works on desktop/mobile and major browsers)
- Governance (Removed branch name prefix requirement)
Templates Updated:
- .specify/templates/plan-template.md ✅
- .specify/templates/tasks-template.md ✅
- README.md ✅
Deferred Items:
- None
-->
# QR Generator Constitution

## Core Principles

### I. Code Quality & Craftsmanship
Code must be readable, maintainable, and idiomatic. Automated linting and formatting are required on every commit. No dead code, unused assets, or commented-out blocks are permitted; remove unreferenced resources as part of each change. Refactoring is continuous, and complexity is managed through modular design.

### II. Testing & Execution Discipline (NON-NEGOTIABLE)
Testing is mandatory (Unit & Integration). Run `npm run test`, `npm run lint`, and `npm run build` locally after every task and before opening a PR. Every code change MUST add or update relevant unit tests, and all tests MUST pass locally and in CI before merge. Regression tests are required for bug fixes. Maintain coverage at or above 85%. Tests must be deterministic, fast, and independent. TDD is encouraged.

### III. User Experience Consistency
Interfaces (CLI, API, UI) must be predictable and consistent. Standardize flags, error messages, and return codes across the application. Documentation must match implementation. Prioritize user intent and minimize cognitive load in workflows.

### IV. Performance Requirements
Performance is a feature. Define and respect latency/throughput budgets (e.g., <200ms response time for user info). O(n) complexity or better is preferred for core algorithms. Resource usage (CPU/RAM) must be bounded and monitored.

### V. Architecture & Structure
Follow the agreed project layout: UI in `src/components`, stateful hooks in `src/hooks`, pure utilities in `src/utils`, and data shapers/models in `src/data` (plus shared types in `src/types`). Keep configuration minimal and co-located. Avoid ad-hoc folders and remove unused files as the structure evolves.

### VI. Execution Discipline (NON-NEGOTIABLE)
After completing each task, the project MUST be validated with a successful `npm run build` (or equivalent platform build) in addition to `npm run test` and `npm run lint`. If the build cannot run (e.g., platform limitations), document the blocker and perform a local smoke run to verify runtime basics. Never mark a task complete without a passing build or documented exception.

### VII. Cross-Platform & Browser Compatibility
The user interface MUST be fully functional and aesthetically consistent across desktop and mobile browsers, including all major browsers (Chrome, Safari, Firefox, Edge). Responsive design is mandatory, and testing must be performed on both screen types before marking UI tasks as complete.

## Documentation & Standards

All public APIs and libraries must be documented. The README must be kept up to date with the latest features and usage instructions. Internal documentation should use Markdown and be co-located with the code. Architecture and structure decisions must be reflected in docs and code owners should prune obsolete references.

## Review & Quality Gates

All code changes require a Pull Request review. Continuous Integration (CI) checks (linting, testing, build) must pass before merging; tests must be added/updated for the change set. No direct pushes to the main branch are permitted. Reviews must confirm adherence to structure conventions, removal of unused code/resources, compliance with these principles, documented local runs of `npm run test`, `npm run lint`, and `npm run build`, and coverage remaining above 85%.

## Governance

This Constitution supersedes previous ad-hoc practices. Amendments require a Pull Request with justification and team approval. Each task must be committed individually; commit titles must be ≤50 characters and commit body lines ≤72 characters. Versioning follows Semantic Versioning (MAJOR for principle changes, MINOR for additions, PATCH for clarifications). Compliance is verified during Code Review and CI.

**Version**: 1.5.0 | **Ratified**: 2026-01-15 | **Last Amended**: 2026-02-01

