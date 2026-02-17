# Feature Specification: Docker Containerization

**Feature Branch**: `019-docker-containerization`  
**Created**: 2026-02-17  
**Status**: Draft  
**Input**: User description: "Implement Docker containerization for the QR Generator single-page React application using the docker-security-hardening and docker-multi-stage-optimization skills."

## Clarifications

### Session 2026-02-17
- Q: How should we balance multi-platform build requirements (AMD64+ARM64) against CI time limits? → A: Prioritize speed; build only for `linux/amd64` (same decision as uuid-generator project).
- Q: Should the build fail on ALL Critical/High vulnerabilities, even if no patch exists in Alpine upstream? → A: Fail only on "fixable" vulnerabilities to avoid blocking releases on unpatched upstream issues (same decision as uuid-generator project).
- Q: Does TypeScript compilation in the Docker build stage change the image size target? → A: No — TypeScript compiler only runs in the builder stage and is discarded. The final image contains the same static assets as a JS project. Target remains < 25MB compressed.
- Q: Should the CI/CD pipeline include Cosign keyless image signing for supply chain security? → A: Yes — include Cosign keyless signing on tag pushes (same as uuid-generator project).
- Q: What Content-Security-Policy should Nginx enforce for the React + Tailwind CSS SPA? → A: Allow `unsafe-inline` + `unsafe-eval` for `script-src` and `unsafe-inline` for `style-src` (same as uuid-generator; required for React/Vite/Tailwind runtime).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Secure Production Deployment (Priority: P1)

As a DevOps engineer, I want the QR Generator application to be packaged as a secure, optimized Docker image and automatically published to GHCR so that it can be deployed to any container platform with minimal security risks.

**Why this priority**: Essential for production deployment and security compliance.

**Independent Test**: Push code to `main` branch, verify image appears in GHCR, pull image, run it, and verify application accessibility.

**Acceptance Scenarios**:

1. **Given** a semver tag (`v*.*.*`) is pushed, **When** the CI pipeline runs, **Then** a `linux/amd64` Docker image is built, scanned, pushed to GHCR, and signed with Cosign.
2. **Given** a commit is pushed to main or a PR is opened, **When** the CI pipeline runs, **Then** the Docker image is built and scanned but NOT pushed to GHCR.
3. **Given** the image is built, **When** Trivy scans it, **Then** no fixable critical or high vulnerabilities are reported.
4. **Given** the container is running in production, **When** inspected, **Then** it runs as a non-root user with a read-only filesystem (except required temp dirs).
5. **Given** the container is running, **When** a request is made to the health endpoint, **Then** it returns a 200 OK status.

---

### User Story 2 - Local Development Parity (Priority: P2)

As a developer, I want to build and run the production-like container locally so that I can debug deployment issues and verify behavior before pushing code.

**Why this priority**: Ensures developers can reproduce production issues and verifies the build process locally.

**Independent Test**: Run `docker build` and `docker run` locally, access application at localhost port.

**Acceptance Scenarios**:

1. **Given** the local repository, **When** `docker build` is executed, **Then** it successfully creates an image under 25MB (compressed target).
2. **Given** the container is running locally, **When** a user accesses `http://localhost:8080`, **Then** the QR Generator app loads successfully with all features working (QR code generation, download, theme switching).
3. **Given** the container is running, **When** `docker exec` is attempted, **Then** the shell environment confirms the user is non-root.

---

### User Story 3 - Automated Security Compliance (Priority: P2)

As a security engineer, I want automated checks for Dockerfile best practices and vulnerabilities so that we maintain a high security posture without manual review.

**Why this priority**: Prevents security regressions and technical debt.

**Independent Test**: Introduce a bad practice (e.g., expose secrets) or vulnerable base image, verify pipeline fails.

**Acceptance Scenarios**:

1. **Given** a Pull Request with Dockerfile changes, **When** the CI pipeline runs, **Then** Hadolint checks the Dockerfile for best practice violations.
2. **Given** a deployed image, **When** the scheduled check runs daily, **Then** it is scanned for new vulnerabilities and alerts are generated if found.

---

### Edge Cases

- **Registry Rate Limits**: Build process should handle potential rate limiting from Docker Hub (for base images) by caching or mirroring if critical.
- **Base Image Vulnerabilities**: If the base `node:20-alpine` or `nginx:alpine` image has a fixable critical vulnerability, the build MUST fail, preventing deployment of insecure artifacts.
- **Secrets in Build Args**: If a developer accidentally passes secrets as build args, the process should ideally detect (via secret scanning) or documentation must explicitly warn against it.
- **Cache Invalidation**: Optimization relies on caching; if `package.json` changes frequently in ways that don't affect deps, build times might increase (mitigated by `npm ci` strategy).
- **TypeScript Compilation Failure**: If `tsc -b` fails during the Docker build, the build must fail at the builder stage with TypeScript error output visible in the build log.
- **SPA Routing**: When a user navigates directly to a deep route (e.g., browser refresh on a non-root path), Nginx must return the SPA's `index.html` so that client-side routing handles the request.

## Requirements *(mandatory)*

### Constitution Alignment (Mandatory)

- **I. Code Quality & Craftsmanship**: Dockerfile must follow best practices, pass `hadolint` with no errors, and use clear comments.
- **II. Testing & Execution Discipline**: All Docker builds must be verified with automated tests in CI (health check, simple curl test).
- **III. UX Consistency**: N/A for backend/infra, but ensures app is served correctly.
- **IV. Performance Requirements**: Image size must be minimized (< 25MB compressed target). Nginx configuration must enable gzip compression and cache headers.
- **V. Architecture & Structure**: Docker related files (`Dockerfile`, `.dockerignore`, `.docker/nginx.conf`) placed in root or appropriate config folder.
- **VI. Execution Discipline**: `docker build` and scan commands are integrated into `npm` scripts.
- **VII. Cross-Platform & Browser Compatibility**: Application functionality is preserved; Docker image supports `linux/amd64` only.
- **VIII. Theme Support Planning**: N/A for Docker infra, but containerized app must preserve theme switching functionality.
- **IX. Skill-Driven Development**: Adheres to `docker-multi-stage-optimization` and `docker-security-hardening` skills.

### Functional Requirements

- **FR-001**: System MUST provide a `Dockerfile` using multi-stage builds:
    - Stage 1: `node:20-alpine` (builder) to install dependencies, compile TypeScript, and build the React app with Vite.
    - Stage 2: `nginx:alpine` (runtime) to serve static assets.
- **FR-002**: System MUST target a final image size of < 25MB (compressed) to minimize storage and transfer time.
- **FR-003**: System MUST run the Nginx process as a non-root user (custom `app` user with UID 1000, no home directory, no shell).
- **FR-004**: System MUST mount the root filesystem as read-only, with exceptions only for strictly necessary writable directories (e.g., `/var/cache/nginx`, `/var/run`, `/tmp`).
- **FR-005**: System MUST include a GitHub Actions workflow that builds and scans the image on every push to `main`, PR, and daily schedule, but pushes to GHCR ONLY on semver tag pushes (`v*.*.*`).
- **FR-006**: System MUST implement semantic versioning for image tags based on Git tags (`v*`), with `type=sha` for commit traceability.
- **FR-007**: System MUST scan images for CVEs using Trivy in the CI/CD pipeline and fail on `CRITICAL` or `HIGH` severity vulnerabilities ONLY if a fix is available (using `--ignore-unfixed`).
- **FR-008**: System MUST validate the `Dockerfile` syntax and best practices using `hadolint` during CI.
- **FR-009**: System MUST perform daily scheduled vulnerability scans of the published image.
- **FR-010**: System MUST NOT include any secrets or sensitive environment variables in the final image or build history.
- **FR-011**: Nginx configuration MUST implement security headers including but not limited to:
    - `X-Frame-Options: DENY`
    - `X-Content-Type-Options: nosniff`
    - `Referrer-Policy: strict-origin-when-cross-origin`
    - `Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:; connect-src 'self';`
- **FR-012**: System MUST expose a lightweight health check endpoint (`/health` serving a 200 OK) configured in Nginx.
- **FR-013**: System MUST support single-platform builds for `linux/amd64` only (multi-platform disabled for speed).
- **FR-014**: System MUST provide a `.dockerignore` file that excludes build artifacts, development tooling, test files, documentation, agent skills, and version control metadata from the build context.
- **FR-015**: System MUST provide npm scripts (`docker:build`, `docker:run`) for building and running the Docker container locally with security-hardened defaults.
- **FR-016**: System MUST order Dockerfile layers to maximize build cache efficiency, with dependency manifests (`package.json`, `package-lock.json`) copied and installed before source code.
- **FR-017**: Nginx configuration MUST implement gzip compression for text-based assets (HTML, CSS, JavaScript, JSON, SVG) and proper SPA routing (fallback to `index.html` for non-file requests).
- **FR-018**: System MUST sign published Docker images using Cosign keyless signing (via Sigstore/Fulcio OIDC) on tag pushes to enable supply chain verification.

### Key Entities

- **Docker Image**: The deployable unit containing the compiled React + TypeScript application and Nginx server.
- **Container Registry**: The storage location (GHCR) for versioned Docker images.
- **CI/CD Pipeline**: The automation workflow (GitHub Actions) for building, scanning, and publishing the image.
- **Nginx Configuration**: The web server configuration handling static file serving, SPA routing, gzip compression, security headers, and health endpoint.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Final Docker image size is under 25MB (compressed layer size as reported by registry or `docker save | gzip`).
- **SC-002**: CI pipeline completes successfully (build, scan, push) in under 5 minutes (single platform `linux/amd64`).
- **SC-003**: Trivy scan reports 0 fixable `CRITICAL` and 0 fixable `HIGH` vulnerabilities in the final image.
- **SC-004**: Application within container is accessible via HTTP on port 8080 and renders the QR Generator homepage correctly with all features functional.
- **SC-005**: Health check endpoint returns HTTP 200 status code.
- **SC-006**: Dockerfile passes Hadolint with no errors or warnings (score 10/10).
- **SC-007**: All HTTP responses include mandatory security headers (`X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Content-Security-Policy`).
- **SC-008**: Subsequent builds with only source changes (no dependency changes) complete in under 30 seconds by reusing cached dependency layers.
- **SC-009**: Published images on tag pushes are signed and verifiable via `cosign verify`.

### Assumptions

- The existing React + TypeScript application builds successfully with `npm run build` (`tsc -b && vite build`).
- GitHub Actions has access/permissions to write to GHCR packages for the repository.
- No server-side rendering (SSR) is required; this is a purely static SPA served by Nginx.
- "Read-only filesystem" requirement allows for standard ephemeral tmp/cache directories required by Nginx to function.
- Docker and Docker BuildKit are available on the developer's machine for local testing.
- Port 8080 on the host is available for local Docker container testing.
- The `docker-cicd-integration` skill provides the reference CI/CD workflow structure.
