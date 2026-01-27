# Research: GitHub Workflows for QR Generator

## Decision 1: GitHub Pages Deployment with Vite
- **Choice**: Use `actions/deploy-pages@v4` with a custom build job.
- **Rationale**: Vite requires a build step. We will build the project and then upload the `dist` folder as an artifact for the deployment job.
- **Alternatives Considered**: 
    - `peaceiris/actions-gh-pages`: Popular but using native GitHub Actions (`actions/deploy-pages`) is now the recommended approach for "GitHub Actions" source in Pages settings.

## Decision 2: Security Scanning Tools Integration
- **Choice**: 
    - `npm audit`: Run as a simple shell command in the security workflow.
    - `github/codeql-action`: Use the standard `init`, `analyze` steps.
    - `snyk/actions/node`: Use the Snyk GitHub Action.
- **Rationale**: These tools complement each other. `npm audit` is fast, Snyk provides deep dependency analysis, and CodeQL finds logic vulnerabilities.
- **Configuration**: Snyk will require a `SNYK_TOKEN` secret. CodeQL will run on `push` to `main` and `pull_request` to `main`.

## Decision 3: Strict Linting Enforcement
- **Choice**: Use `npm run lint` and `npm run build`.
- **Rationale**: If these commands exit with a non-zero status code, the GitHub Action will fail, which naturally blocks PR merges if "Require status checks to pass before merging" is enabled in repository settings.
- **Additional check**: Include `tsc --noEmit` to ensure type safety is also checked during the linting phase.

## Decision 4: Token Management
- **Choice**: GitHub's native `GITHUB_TOKEN` for deployment and CodeQL; GitHub Secrets for `SNYK_TOKEN`.
- **Rationale**: Minimizes security risk by using scoped tokens where possible.
