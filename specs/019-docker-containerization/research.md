# Research: Docker Containerization

**Feature**: 019-docker-containerization  
**Date**: 2026-02-17  
**Status**: Complete

## Research Topics

### 1. Multi-Stage Dockerfile for React + TypeScript + Vite + Tailwind CSS v4

**Decision**: 2-stage build — `node:20-alpine` (builder) → `nginx:alpine` (runtime)

**Rationale**: This is the established pattern from the uuid-generator project and matches the `docker-multi-stage-optimization` skill. TypeScript compilation (`tsc -b`) runs entirely in the builder stage. Vite bundles static assets into `dist/`. Only the `dist/` output is copied to the runtime stage, so the final image contains no Node.js, npm, TypeScript compiler, or source code.

**Alternatives considered**:
- Single-stage Node.js image: Rejected — 500MB+ image, includes build tools in production, violates security principles.
- Distroless Nginx: Rejected — limited debugging capability, non-standard config, and no `apk` for curl (health checks).
- Multi-stage with scratch: Rejected — Nginx requires a full base image for its runtime.

**Key findings**:
- Tailwind CSS v4 uses `@tailwindcss/vite` plugin, which runs at build time. No runtime dependency; all CSS is compiled into static files in `dist/`.
- TypeScript adds ~0s to Docker build when cached (only recompiles on source change).
- `npm prune --production` after build reduces node_modules but is cosmetic since node_modules is not copied to runtime stage.

### 2. Nginx Configuration for SPA Serving

**Decision**: Custom `.docker/nginx.conf` with SPA routing, gzip, security headers, and `/health` endpoint.

**Rationale**: A React SPA requires `try_files $uri $uri/ /index.html` for client-side routing. Security headers are mandatory per FR-011. Gzip compression reduces transfer size for text assets.

**Alternatives considered**:
- Default Nginx config: Rejected — no SPA routing, no security headers, no gzip.
- Apache/Caddy: Rejected — Nginx Alpine is the lightest option and is the established standard.

**Key findings**:
- CSP must allow `unsafe-inline` + `unsafe-eval` for React/Vite/Tailwind (per clarification).
- `server_tokens off` prevents Nginx version disclosure.
- Asset cache headers (`Cache-Control: max-age=31536000, immutable`) for hashed Vite assets, no-cache for `index.html`.

### 3. Image Size Target: <25MB Compressed

**Decision**: Target <25MB compressed, matching uuid-generator.

**Rationale**: The uuid-generator achieves this target. The QR Generator has similar characteristics (static SPA, small JS bundle). Tailwind CSS v4 produces optimized CSS via tree-shaking, so CSS bundle size is minimal.

**Alternatives considered**:
- Relaxed target (60MB): Rejected — no technical reason; the uuid-generator proves <25MB is achievable.

**Key findings**:
- `nginx:alpine` base: ~8MB compressed
- Static assets (HTML + JS + CSS): ~2-5MB compressed (varies by app complexity)
- `curl` adds ~5MB but is needed for health checks
- Total expected: ~15-20MB compressed

### 4. CI/CD Pipeline: GitHub Actions → GHCR

**Decision**: Single `docker-publish.yml` workflow based on `docker-cicd-integration` skill reference.

**Rationale**: Matches the uuid-generator's proven pipeline. Uses established GitHub Actions (checkout, buildx, metadata, trivy, cosign).

**Alternatives considered**:
- Separate build/scan/push workflows: Rejected — single workflow is simpler and ensures sequential execution.
- Docker Hub instead of GHCR: Rejected — GHCR integrates natively with GitHub permissions.

**Key findings**:
- Build-then-scan pattern: build and `load` locally → Trivy scan → then build and `push` on tag.
- Push strategy: images are pushed to GHCR ONLY on semver tag pushes (`v*.*.*`). Main branch pushes, PRs, and scheduled runs only build + scan (no push). This is controlled via `push: ${{ startsWith(github.ref, 'refs/tags/') }}` in the build-push-action.
- `--ignore-unfixed` flag prevents blocking on unpatched Alpine CVEs (per clarification).
- GHA cache (`type=gha`, `mode=max`) persists layers between builds.
- Single platform (`linux/amd64`) keeps CI under 5 minutes.
- Workflow triggers: `push` to main (build+scan), tags `v*.*.*` (build+scan+push+sign), PRs (build+scan), daily cron (build+scan for new CVEs).

### 5. Cosign Keyless Image Signing

**Decision**: Cosign keyless signing via Sigstore/Fulcio OIDC on tag pushes.

**Rationale**: Zero key management overhead. GitHub Actions provides OIDC identity automatically. Matches uuid-generator pattern.

**Alternatives considered**:
- Key-based signing: Rejected — requires secret management, rotation.
- No signing: Rejected — supply chain verification is a best practice (per clarification).

**Key findings**:
- Requires `id-token: write` permission in GitHub Actions.
- Signs using `cosign sign --yes {}@${DIGEST}` (digest-based, not tag-based).
- Verification uses `--certificate-identity-regexp` and `--certificate-oidc-issuer`.

### 6. Security Hardening

**Decision**: Non-root user (`app`, UID 1000), read-only fs, `--cap-drop ALL`, tmpfs mounts.

**Rationale**: Defense-in-depth per `docker-security-hardening` skill. Matches uuid-generator's proven configuration.

**Alternatives considered**:
- Root user with dropped capabilities: Rejected — non-root is stricter.
- Docker's built-in `nginx` user: Rejected — custom `app` user with explicit UID is more portable across orchestrators.

**Key findings**:
- Nginx requires writable dirs: `/var/cache/nginx`, `/var/run` (PID file), `/tmp`.
- tmpfs with `mode=1777` provides writable space on a read-only root fs.
- `--security-opt=no-new-privileges` is recommended for production but not enforced in npm scripts (kept simple for local dev).

### 7. .dockerignore Strategy

**Decision**: Comprehensive exclusion list derived from `docker-multi-stage-optimization` skill.

**Rationale**: Smaller build context = faster `docker build`. Excludes everything not needed by the Dockerfile's `COPY` instructions.

**Key findings**:
- Must NOT exclude `.docker/` (contains `nginx.conf` used by `COPY`).
- Must NOT exclude `tsconfig*.json`, `vite.config.ts`, `postcss.config.cjs`, `tailwind.config.js` (needed by builder).
- Should exclude: `node_modules`, `.git`, `dist`, `coverage`, `tests`, `.agent`, `.github`, `.specify`, `specs`, docs.

### 8. Local Development Scripts (Phase 4 Implementation)

**Date Added**: 2026-02-18

**Scripts Added to package.json**:
- `docker:build`: `docker build -t qr-generator:local .`
- `docker:run`: `docker run --rm -p 8080:80 --name qr-app --read-only --cap-drop ALL --tmpfs /var/cache/nginx:mode=1777 --tmpfs /var/run:mode=1777 --tmpfs /tmp:mode=1777 qr-generator:local`

**Validation Requirements** (when Docker is available):
- Image size target: < 25MB compressed
- Verify command: `docker save qr-generator:local | gzip | wc -c | awk '{printf "%.1f MB\n", $1/1048576}'`
- Non-root verification: `docker exec qr-app whoami` → should return `app`
- Read-only fs verification: `docker exec qr-app touch /test-file` → should fail with "Read-only file system"
- Health endpoint: `curl http://localhost:8080/health` → should return `OK`

**Expected Results** (based on uuid-generator reference):
- Compressed image size: ~15-20MB (well under 25MB target)
- nginx:alpine base: ~8MB compressed
- Static assets: ~2-5MB compressed
- Total uncompressed: ~40-50MB
