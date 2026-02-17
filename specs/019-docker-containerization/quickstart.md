# Quickstart: Docker Containerization

**Feature**: 019-docker-containerization  
**Date**: 2026-02-17

## Prerequisites

- Docker Desktop or Docker Engine with BuildKit support
- Node.js 20+ (for building outside Docker)
- Git (for tagging releases)

## Local Development (No Docker)

```bash
# Standard Vite dev server with HMR
npm run dev
# → http://localhost:5173
```

## Build & Run Locally (Docker)

```bash
# Build the production Docker image
npm run docker:build
# → docker build -t qr-generator:local .

# Run with security-hardened defaults
npm run docker:run
# → docker run --rm -p 8080:80 --name qr-app \
#     --read-only --cap-drop ALL \
#     --tmpfs /var/cache/nginx:mode=1777 \
#     --tmpfs /var/run:mode=1777 \
#     --tmpfs /tmp:mode=1777 \
#     qr-generator:local

# Access the app
open http://localhost:8080

# Verify health endpoint
curl http://localhost:8080/health
# → OK

# Stop the container
docker stop qr-app
```

## Verify Security Hardening

```bash
# Check running user (should NOT be root)
docker exec qr-app whoami
# → app

# Check read-only filesystem (should fail)
docker exec qr-app touch /test-file
# → touch: /test-file: Read-only file system

# Check security headers
curl -I http://localhost:8080
# → X-Frame-Options: DENY
# → X-Content-Type-Options: nosniff
# → Referrer-Policy: strict-origin-when-cross-origin
# → Content-Security-Policy: default-src 'self'; ...
```

## Check Image Size

```bash
docker images qr-generator:local
# → SIZE should be ~40-50MB uncompressed

# Check compressed size (target: <25MB)
docker save qr-generator:local | gzip | wc -c | awk '{printf "%.1f MB\n", $1/1048576}'
```

## Lint Dockerfile

```bash
# Install Hadolint
brew install hadolint

# Lint
hadolint Dockerfile
# → Should report no errors or warnings
```

## Scan for Vulnerabilities

```bash
# Install Trivy
brew install aquasecurity/trivy/trivy

# Scan image
trivy image --ignore-unfixed --severity CRITICAL,HIGH qr-generator:local
```

## CI/CD: Publish to GHCR

> **Note**: Images are pushed to GHCR ONLY on semver tag pushes. Main branch pushes, PRs, and daily scheduled runs only build + scan (no push).

```bash
# Tag a release (triggers docker-publish.yml → build + scan + push + sign)
git tag v1.0.0
git push origin v1.0.0

# Main branch push only builds and scans (no push to GHCR)
git push origin main
# → docker-publish.yml runs: build ✅ → Trivy scan ✅ → push ❌ (skipped)

# Verify published image
docker pull ghcr.io/pyaethu-aung/qr-generator:1.0.0

# Verify Cosign signature
cosign verify ghcr.io/pyaethu-aung/qr-generator:1.0.0 \
  --certificate-identity-regexp="https://github.com/pyaethu-aung/qr-generator" \
  --certificate-oidc-issuer="https://token.actions.githubusercontent.com"
```

## Analyze Image Layers

```bash
# Install dive
brew install dive

# Analyze layer efficiency
dive qr-generator:local
```

## File Layout

```text
Dockerfile              # Multi-stage: node:20-alpine → nginx:alpine
.dockerignore           # Build context exclusions
.docker/nginx.conf      # Nginx: SPA routing, gzip, security headers, /health
.trivyignore            # CVE suppressions for unfixable issues
.github/workflows/
  docker-publish.yml    # CI: build → scan → push → sign
package.json            # docker:build and docker:run scripts
```
