# Phase 0: Research & Decisions

## 1. Pin Action Versions
- **Decision**: Update `snyk/actions/node@master` to `snyk/actions/node@v1.0.0` in `security.yml`. Update `aquasecurity/trivy-action@master` to `aquasecurity/trivy-action@0.34.1` in `docker-publish.yml`.
- **Rationale**: Prevents supply chain attacks and unexpected breaking changes from floating tags.
- **Alternatives considered**: Dependabot auto-updates, but explicit pinning in the file provides immediate compliance with the spec.

## 2. Upgrade CodeQL Action
- **Decision**: Update `github/codeql-action/init@v3` and `github/codeql-action/analyze@v3` to `@v4` in `security.yml`.
- **Rationale**: Mitigates upcoming deprecation warnings and ensures we are on the supported V4 runner.

## 3. Concurrency Controls
- **Decision**: Add `concurrency` block to `lint.yml` and `security.yml` using `group: ${{ github.workflow }}-${{ github.ref }}` and `cancel-in-progress: true`.
- **Rationale**: Cancels redundant jobs when new commits are pushed to the same branch/PR, saving CI minutes.

## 4. Job Timeouts
- **Decision**: Add `timeout-minutes: 15` at the job level in `deploy.yml` (jobs `build` and `deploy`), `docker-publish.yml` (job `build`), `lint.yml` (job `lint-and-build`), and `security.yml` (job `security`).
- **Rationale**: Prevents hung jobs from consuming infinite CI minutes.

## 5. Handle Missing Optional Secrets & SARIF Integration (Snyk)
- **Decision**: Use `continue-on-error: true` on the Snyk step in `security.yml`. Output results using `--sarif-file-output=snyk.sarif` and push using `github/codeql-action/upload-sarif@v4` with `if: always()`.
- **Rationale**: `continue-on-error: true` fulfills the "non-blocking" requirement. Uploading the SARIF payload integrates the scan natively with GitHub's Security dashboard, providing superior visibility compared to console logs alone. The `if: always()` condition guarantees the upload executes even if the Snyk step "fails" due to found vulnerabilities.

## 6. Deploy After Validation
- **Decision**: Add `npm run lint` before `npm run build` in `deploy.yml`.
- **Rationale**: Ensures the code conforms to lint rules before deploying to GitHub pages.

## 7. Workflow Implementation Triggers
- **Decision**: Add `paths` inclusion filters to `push` and `pull_request` triggers across `docker-publish.yml`, `lint.yml`, and `security.yml`. Specific paths include `.github/workflows/*`, `src/**`, `package.json`, `eslint.config.js`, `tsconfig.*`, etc.
- **Rationale**: Prevents heavy docker builds, code analysis (CodeQL), and node linting cycles when only markdown or unrelated config files are changed, vastly reducing wasted CI minutes.

## 8. Run `lint.yml` on Default Branch
- **Decision**: Add `push: branches: ["main"]` trigger to `lint.yml`.
- **Rationale**: Verifies direct commits and populates caches for PRs.

## 9. Centralize Node.js Version
- **Decision**: Create `.nvmrc` with `20`. Update `actions/setup-node` in all workflows to use `node-version-file: '.nvmrc'` instead of `node-version: 20`.
- **Rationale**: Single source of truth for the Node runtime version.

## 10. Optimize ESLint Caching
- **Decision**: Add `actions/cache` in `lint.yml` to cache the `.eslintcache` file. Use `key: eslint-${{ runner.os }}-${{ hashFiles('**/*.[jt]s', '**/*.[jt]sx') }}` or similar, and run `npm run lint` with `--cache`. (Assuming `npm run lint` already uses `--cache` if `.eslintcache` is specified, but we will check `package.json` to be sure, or just cache the `.eslintcache` file. We will just cache `.eslintcache`).
- **Rationale**: Speeds up successive lint runs.

## 11. Docker Multi-Arch Build Efficiency
- **Decision**: In `docker-publish.yml`, the "Build and load Docker image for scan" step will use `outputs: type=docker,dest=/tmp/image.tar` to export the built image straight to disk as an OCI-compliant tarball.
- **Rationale**: Bypasses the heavy local Docker daemon initialization and architecture restrictions. The Trivy scanner reads the `/tmp/image.tar` directly via its `input:` configuration for maximum scan efficiency.
