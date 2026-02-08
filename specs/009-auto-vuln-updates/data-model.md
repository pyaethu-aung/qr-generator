# Data Model: Auto Vulnerability Updates

**Feature**: Automated Dependency Vulnerability Updates relative to [spec.md](spec.md)
**Status**: Conceptual
**Date**: 2026-02-09

## Entities

### Dependency
- **Description**: A library or package used by the project.
- **Source**: `package.json` / `package-lock.json`
- **Attributes**:
  - `Name`: String (e.g., "react")
  - `Version`: SemVer String (e.g., "18.2.0")
  - `Type`: Enum ["production", "dev"]

### Vulnerability
- **Description**: A known security flaw associated with a specific version range of a Dependency.
- **Source**: GitHub Advisory Database (via Dependabot)
- **Attributes**:
  - `ID`: String (CVE-XXXX-XXXX or GHSA-xxxx-xxxx-xxxx)
  - `Severity`: Enum ["Critical", "High", "Moderate", "Low"]
  - `PatchedVersion`: SemVer String
  - `AdvisoryURL`: URL

### Security Update (Pull Request)
- **Description**: A Pull Request created by Dependabot to upgrade a vulnerable dependency.
- **Attributes**:
  - `Title`: String (e.g., "Bump react from 18.2.0 to 18.3.1")
  - `Description`: String (Contains vulnerability details, release notes, changelog)
  - `Labels`: List<String> (e.g., "security", "dependencies")
  - `State`: Enum ["Open", "Merged", "Closed"]

## Relationships

1. **Project** *has many* **Dependencies**.
2. **Dependency** *can have many* **Vulnerabilities**.
3. **Vulnerability** *triggers one* **Security Update**.
