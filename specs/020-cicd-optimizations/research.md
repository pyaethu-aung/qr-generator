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

## 5. Handle Missing Optional Secrets (Snyk)
- **Decision**: Use `continue-on-error: true` on the Snyk step in `security.yml`.
- **Rationale**: In GitHub Actions, `continue-on-error: true` allows the step to fail without failing the entire job, matching the "non-blocking" (allow-failure) requirement.

## 6. Deploy After Validation
- **Decision**: Add `npm run lint` before `npm run build` in `deploy.yml`.
- **Rationale**: Ensures the code conforms to lint rules before deploying to GitHub pages.

## 7. Container Build Triggers
- **Decision**: Add `paths` filter to `push` and `pull_request` triggers in `docker-publish.yml` for `docker-publish.yml`, `src/**`, `index.html`, `package.json`, `package-lock.json`, `vite.config.js`, `eslint.config.js`.
- **Rationale**: Prevents heavy docker builds when only markdown or unrelated config files are changed.

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
- **Decision**: In `docker-publish.yml`, the "Build and load Docker image for scan" step is currently loading a multi-arch image or a single arch image. `load: true` only supports single-arch. We'll specify `platforms: linux/amd64` in the scan build step to avoid multi-arch loading overhead during the Trivy scan, and only build multi-arch during the final push step. Or, if it's already single-arch (default), we just ensure we only scan the tarball. The spec suggests OCI tar archive or optimizing the two-phase build. We'll use `--output type=docker,dest=image.tar` in a buildx `--output` or just rely on the existing `load: true` but ensure `cache-from` and `cache-to` are optimized. Let's use `outputs: type=docker,dest=/tmp/image.tar` to export it, then point Trivy to `input: /tmp/image.tar` directly.
- **Rationale**: Exporting directly to tar and scanning the tarball avoids the Docker daemon load overhead.
