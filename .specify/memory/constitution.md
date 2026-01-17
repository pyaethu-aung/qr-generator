<!--
SYNC IMPACT REPORT
Version: 1.0.0 -> 1.1.0
Modified Principles:
- Code Quality & Craftsmanship (explicit removal of unused code/resources)
- Testing Standards (per-change unit tests must be added/updated and all tests must pass)
Added Sections:
- Architecture & Structure
Templates Updated:
- .specify/templates/plan-template.md (✅ updated)
- .specify/templates/tasks-template.md (✅ updated)
Deferred Items:
- None
-->
# QR Generator Constitution

## Core Principles

### I. Code Quality & Craftsmanship
Code must be readable, maintainable, and idiomatic. Automated linting and formatting are required on every commit. No dead code, unused assets, or commented-out blocks are permitted; remove unreferenced resources as part of each change. Refactoring is continuous, and complexity is managed through modular design.

### II. Testing Standards (NON-NEGOTIABLE)
Testing is mandatory (Unit & Integration). Every code change MUST add or update relevant unit tests, and all tests MUST pass locally and in CI before merge. Regression tests are required for bug fixes. Target minimum 80% coverage. Tests must be deterministic, fast, and independent. TDD is encouraged.

### III. User Experience Consistency
Interfaces (CLI, API, UI) must be predictable and consistent. Standardize flags, error messages, and return codes across the application. Documentation must match implementation. Prioritize user intent and minimize cognitive load in workflows.

### IV. Performance Requirements
Performance is a feature. Define and respect latency/throughput budgets (e.g., <200ms response time for user info). O(n) complexity or better is preferred for core algorithms. Resource usage (CPU/RAM) must be bounded and monitored.

### V. Architecture & Structure
Follow the agreed project layout: UI in `src/components`, stateful hooks in `src/hooks`, pure utilities in `src/utils`, and data shapers/models in `src/data` (plus shared types in `src/types`). Keep configuration minimal and co-located. Avoid ad-hoc folders and remove unused files as the structure evolves.

## Documentation & Standards

All public APIs and libraries must be documented. The README must be kept up to date with the latest features and usage instructions. Internal documentation should use Markdown and be co-located with the code. Architecture and structure decisions must be reflected in docs and code owners should prune obsolete references.

## Review & Quality Gates

All code changes require a Pull Request review. Continuous Integration (CI) checks (linting, testing, build) must pass before merging; tests must be added/updated for the change set. No direct pushes to the main branch are permitted. Reviews must confirm adherence to structure conventions, removal of unused code/resources, and compliance with these principles.

## Governance

This Constitution supersedes previous ad-hoc practices. Amendments require a Pull Request with justification and team approval. Versioning follows Semantic Versioning (MAJOR for principle changes, MINOR for additions, PATCH for clarifications). Compliance is verified during Code Review and CI.

**Version**: 1.1.0 | **Ratified**: 2026-01-15 | **Last Amended**: 2026-01-17
