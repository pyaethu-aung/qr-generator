# Tasks: Auto Vulnerability Updates

**Branch**: `009-auto-vuln-updates` | **Spec**: [spec.md](spec.md) | **Plan**: [plan.md](plan.md)

## Implementation

- [ ] Configure Dependabot <!-- id: 8 -->
    - Create `.github/dependabot.yml`
    - Verify YAML syntax
    - Ensure `npm` ecosystem is configured without auto-merge

## Verification

- [ ] Manual Verification <!-- id: 9 -->
    - Verify file placement in `.github/`
    - Check configuration values against plan
    - (Optional) Enable repo-level settings if access permits
