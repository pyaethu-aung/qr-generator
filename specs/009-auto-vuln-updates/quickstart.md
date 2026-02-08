# Quickstart: Enabling Auto Vulnerability Updates

**Feature**: Automated Dependency Vulnerability Updates
**Target Audience**: Repository Administrators

## Prerequisite: Enable GitHub Dependabot

The `dependabot.yml` file configures *how* Dependabot behaves, but you must first enable *Enable Dependabot alerts* and *Enable Dependabot security updates* in the repository settings.

1. Go to the repository on GitHub.
2. Click **Settings** > **Code security and analysis**.
3. Under **Dependabot**:
   - Enable **Dependabot alerts**.
   - Enable **Dependabot security updates**.

## Verification

Once enabled and the feature branch is merged:

1. **Check Dependency Graph**:
   - Go to **Insights** > **Dependency graph**.
   - Verify that "Dependabot" is listed or active.

2. **Validate Configuration**:
   - Go to **Insights** > **Dependency graph** > **Dependabot**.
   - Review the "Last checked" timestamp for the "npm" ecosystem.
   - Ensure there are no errors in the log.
