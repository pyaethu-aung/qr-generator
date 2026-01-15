<!--
SYNC IMPACT REPORT
Version: 0.0.0 -> 1.0.0
Modified Principles:
- Defined: Code Quality, Testing Standards, User Experience, Performance
Added Sections:
- Documentation & Standards
- Review & Quality Gates
Templates Updated:
- .specify/templates/tasks-template.md (Enforced mandatory testing)
-->
# QR Generator Constitution

## Core Principles

### I. Code Quality & Craftsmanship
Code must be readable, maintainable, and idiomatic. Automated linting and formatting are required on every commit. No dead code or commented-out blocks allowed. Refactoring is a continuous process, not a separate phase. Complexity should be managed through modular design.

### II. Testing Standards (NON-NEGOTIABLE)
Testing is mandatory (Unit & Integration). New features must have accompanying tests. Regression tests are required for bug fixes. Target minimum 80% code coverage. Tests must be deterministic, fast, and independent. TDD (Test Driven Development) is encouraged.

### III. User Experience Consistency
Interfaces (CLI, API, UI) must be predictable and consistent. Standardize flags, error messages, and return codes across the application. Documentation must match implementation. Prioritize user intent and minimize cognitive load in workflows.

### IV. Performance Requirements
Performance is a feature. Define and respect latency/throughput budgets (e.g., <200ms response time for user info). O(n) complexity or better preferred for core algorithms. Resource usage (CPU/RAM) must be bounded and monitored.

## Documentation & Standards

All public APIs and libraries must be documented. The README must be kept up to date with the latest features and usage instructions. Internal documentation should use Markdown and be co-located with the code.

## Review & Quality Gates

All code changes require a Pull Request review. Continuous Integration (CI) checks (linting, testing, build) must pass before merging. No direct pushes to the main branch are permitted. Code reviews should focus on logic, correctness, and adherence to these principles, not just style.

## Governance

This Constitution supersedes previous ad-hoc practices. Amendments require a Pull Request with justification and team approval.
Versioning follows Semantic Versioning (MAJOR for principle changes, MINOR for additions, PATCH for clarifications).
Compliance is verified during Code Review.

**Version**: 1.0.0 | **Ratified**: 2026-01-15 | **Last Amended**: 2026-01-15
