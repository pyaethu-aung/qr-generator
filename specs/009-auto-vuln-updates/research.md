# Research: Automated Dependency Vulnerability Updates

**Feature**: Automated Dependency Vulnerability Updates relative to [spec.md](spec.md)
**Status**: Completed
**Date**: 2026-02-09

## Decisions

### 1. Configuration Method
- **Decision**: Use `.github/dependabot.yml` configuration file.
- **Rationale**: Provides granular control over update behavior, allowing us to specify:
  - `package-ecosystem: npm` for our project
  - `schedule.interval: daily` for timely detection
  - `open-pull-requests-limit` to manage PR volume
  - `groups` to batch updates if needed (though FR-009 requires manual review, grouping helps reduce noise)
  - `rebase-strategy` to handle conflicts
- **Alternatives Considered**:
  - UI-only configuration: Less reproducible, harder to audit changes.
  - Third-party tools (Snyk/Renovate): Rejected per spec clarification (Dependabot only).

### 2. Vulnerability Scanning & Alerts
- **Decision**: Enable "Dependabot alerts" and "Dependabot security updates" via repository settings (manual step in quickstart/README) + `dependabot.yml` for tuning.
- **Rationale**: `dependabot.yml` primarily configures version updates, but `applies-to: security-updates` (as seen in docs) allows overriding security update behavior (like grouping). The core enabling is a repo setting.
- **Implementation**: The feature will deliver the `dependabot.yml` file. The documentation will instruct on enabling the repo-level settings if not already active.

### 3. PR Automation & Manual Review
- **Decision**: Configure `open-pull-requests-limit: 10` (default) to ensure PRs are created but not overwhelming.
- **Decision**: Explicitly DO NOT configure `automerge` in the workflow, aligning with FR-009.
- **Rationale**: Spec strictly prohibits auto-merge for security updates ("Never auto-merge"). We will rely on standard GitHub PR review flow.

### 4. Notification Strategy
- **Decision**: Rely on GitHub's native notification system (Web/Email based on user settings).
- **Rationale**: Spec clarification confirmed "GitHub notifications only". No extra integration (Slack/Discord) work needed.

## Technical Details

### `dependabot.yml` Structure

```yaml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "daily"
    # Enable version updates to keep deps healthy, which reduces security delta
    open-pull-requests-limit: 10
    groups:
       # Optional: group dev dependencies to reduce noise
       dev-dependencies:
          patterns:
            - "*"
          update-types:
            - "minor"
            - "patch"
          dependency-type: "development"
```

*Note: Security updates (driven by alerts) are separate but respect `dependabot.yml` configs if applicable. We will primarily configure the daily check to ensure we stay Close to HEAD, which prevents security issues.*

### Verification Strategy
1. **Syntax Check**: Use `dependabot-cli` or online validator (if possible) or visually verify YAML.
2. **Dry Run**: Since we cannot easily trigger a real CVE in a test environment without bringing in a vulnerable package, validation will focus on:
   - Validating the YAML syntax.
   - Verifying the file is detected by GitHub (Simulated via "Insights > Dependency graph > Dependabot").

## Open Questions Resolved
- **Tool**: Dependabot (via Spec).
- **Auto-merge**: Disabled (via Spec FR-009).
- **Notifications**: Native GitHub (via Spec).
