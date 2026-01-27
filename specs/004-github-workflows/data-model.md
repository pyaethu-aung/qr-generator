# Data Model: Workflow Configuration

While this feature centered on CI/CD infrastructure, the "data" consists of workflow configuration entities.

## Workflow Entities

### Deploy Job
- **Triggers**: `push` to `main`
- **Steps**: Checkout, Setup Node, Install, Build, Upload Artifact, Deploy Page
- **Outputs**: Live site at `https://[username].github.io/[repo-name]/`

### Quality Check Job
- **Triggers**: `pull_request` to `main`
- **Steps**: Checkout, Setup Node, Install, Lint, Typecheck, Build
- **Constraint**: Must pass 100% to permit merging.

### Security Scan Job
- **Triggers**: `push` to `main`, `pull_request` to `main`, `schedule` (optional)
- **Tools**:
    - **Snyk**: Dependency vulnerability scanning.
    - **CodeQL**: Static Analysis Security Testing (SAST).
    - **NPM Audit**: Native package security check.
