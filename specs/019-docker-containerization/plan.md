# Implementation Plan: Docker Containerization

**Branch**: `019-docker-containerization` | **Date**: 2026-02-17 | **Spec**: [specs/019-docker-containerization/spec.md](./spec.md)
**Input**: Feature specification from `/specs/019-docker-containerization/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Implement a production-grade Docker containerization strategy for the QR Generator SPA (React 19 + TypeScript 5.9 + Vite 7 + Tailwind CSS v4). The approach uses a multi-stage Dockerfile (Node 20 Builder → Nginx Alpine Runtime) to optimize image size (<25MB compressed target) and security (non-root, read-only fs). Includes a comprehensive CI/CD pipeline with GitHub Actions for automated linting (Hadolint), security scanning (Trivy), and Cosign keyless image signing. Images are pushed to GHCR only on semver tag pushes (`v*.*.*`); main/PR/schedule triggers only build and scan.

## Technical Context

**Language/Version**: Dockerfile syntax 1.4+ (BuildKit), Nginx 1.25+ (Alpine), Node 20 (Builder), TypeScript 5.9 (compile step in builder)  
**Primary Dependencies**: Docker, GitHub Actions, Trivy, Hadolint, Cosign  
**Storage**: N/A (Stateless container)  
**Testing**: Container smoke tests (curl healthcheck), Trivy image scan, Hadolint static analysis  
**Target Platform**: Docker (Linux/AMD64), deploying to GHCR  
**Project Type**: Single-page Application (SPA) container  
**Performance Goals**: Image size < 25MB (compressed), CI build time < 5 min, cached rebuild < 30s  
**Constraints**: Non-root execution, Read-only filesystem, No secrets in image, Single platform (amd64)  
**Scale/Scope**: Single container image, no orchestration complexity required

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Code Quality & Craftsmanship**: Dockerfile keys on readability and best practices (Hadolint clean); explicit version pinning for base images; clear inline comments.
- **II. Testing & Execution Discipline**: All builds verified in CI; Healthcheck endpoint ensures runtime viability; Trivy scans prevent regression. Note: `npm run test && npm run lint && npm run build` is not directly applicable for Dockerfile/Nginx config changes, but the CI pipeline validates the Docker build as an execution gate.
- **III. UX Consistency**: N/A for infra, but ensures app is served correctly (SPA routing, gzip, security headers).
- **IV. Performance Requirements**: Optimized Nginx config (gzip, caching) ensures fast load times; small image size (<25MB compressed) ensures fast scale-up and deployment.
- **V. Architecture & Structure**: `Dockerfile` and `.dockerignore` in project root (standard convention). Nginx config in `.docker/nginx.conf` to keep root clean.
- **VI. Execution Discipline**: CI pipeline enforcing `docker build` success, Trivy scan, and Hadolint validation before push. Local validation via `npm run docker:build`.
- **VII. Cross-Platform & Browser Compatibility**: Browser compatibility handled by React app; Container targets Linux/AMD64 only (ARM64 dropped for CI speed per clarification).
- **VIII. Theme Support Planning**: N/A for Docker infra, but containerized app preserves theme switching functionality.
- **IX. Skill-Driven Development**: Strictly adhering to `docker-multi-stage-optimization` and `docker-security-hardening` skills.

## Project Structure

### Documentation (this feature)

```text
specs/019-docker-containerization/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # N/A for this infra feature
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # N/A
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
.github/
└── workflows/
    └── docker-publish.yml   # CI/CD pipeline (build, scan, sign, push)

.docker/
└── nginx.conf               # Nginx configuration (security headers, gzip, SPA routing, health)

Dockerfile                    # Multi-stage build definition (builder → runtime)
.dockerignore                 # Build context exclusion rules
.trivyignore                  # Known unfixable CVE suppressions
```

**Structure Decision**: `Dockerfile` and `.dockerignore` in project root (Docker standard convention). Nginx config placed in `.docker/nginx.conf` to organize Docker-related configuration without cluttering the root. `.trivyignore` in root for Trivy CI integration. This matches the uuid-generator project's established pattern.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|--------------------------------------|
| No `npm test`/`npm lint` in Docker CI | Docker workflow focuses on image build/scan/push; lint and test are handled by existing `lint.yml` and `deploy.yml` workflows | Duplicating test/lint steps in Docker CI would increase CI time and create maintenance burden |
