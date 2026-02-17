---
name: docker-multi-stage-optimization
description: Optimize Docker builds using multi-stage patterns, layer caching, and size reduction. Use when asked to "optimize my Dockerfile", "reduce image size", "speed up Docker builds", or "improve build performance".
metadata:
  author: custom
  version: "2.0.0"
  argument-hint: <dockerfile-path>
---

# Docker Multi-Stage Build Optimization Skill

Optimization guide tailored to this project's architecture: a **React 19 + TypeScript + Vite 7 SPA** (with Tailwind CSS v4) built with `node:20-alpine` and served by `nginx:alpine`.

## Project Context

| Aspect | Detail |
|--------|--------|
| **App type** | React 19 + TypeScript 5.9 + Vite 7 single-page application |
| **Styling** | Tailwind CSS v4 (`@tailwindcss/vite` + `@tailwindcss/postcss`) |
| **Build command** | `tsc -b && vite build` (TypeScript check + Vite build) |
| **Vite config** | `vite.config.ts` (TypeScript) |
| **Build output** | Static files in `dist/` |
| **Dockerfile** | ⚠️ To be implemented: 2-stage `node:20-alpine` (builder) → `nginx:alpine` (runtime) |
| **Nginx config** | ⚠️ To be implemented: `.docker/nginx.conf` (security headers, gzip, SPA routing, `/health`) |
| **Non-root user** | `app` (UID 1000) |
| **Runtime port** | 80 (Nginx) |
| **CI cache** | GitHub Actions cache (`type=gha`) |

## What This Skill Does

1. **Multi-Stage Build Design**
   - Analyzes the Node.js build → Nginx runtime separation
   - Optimizes layer ordering for cache efficiency
   - Minimizes final image size (Nginx + static files only)

2. **Layer Optimization**
   - Reviews layer ordering for dependency caching
   - Identifies cache-busting patterns
   - Optimizes COPY instructions for SPA builds

3. **Build Performance Analysis**
   - Measures build times and image sizes
   - Recommends BuildKit features
   - Analyzes `.dockerignore` coverage

## Recommended Dockerfile

The Dockerfile should follow this pattern (to be created at project root):

```dockerfile
# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies (leverage cache)
COPY package.json package-lock.json ./
RUN npm ci

# Copy source and build (includes TypeScript compilation)
COPY . .
RUN npm run build && npm prune --production

# Stage 2: Runtime
FROM nginx:alpine AS runtime

# Install curl for healthcheck and configure non-root user
# hadolint ignore=DL3018
RUN apk add --no-cache curl && \
    adduser -D -H -u 1000 -s /bin/false app && \
    mkdir -p /var/run/nginx /var/log/nginx /var/cache/nginx && \
    touch /var/run/nginx.pid && \
    chown -R app:app /var/run/nginx.pid /var/log/nginx /var/cache/nginx /etc/nginx/conf.d

# Copy build artifacts with correct ownership
COPY --from=builder --chown=app:app /app/dist /usr/share/nginx/html

# Copy custom nginx config with correct ownership
COPY --chown=app:app .docker/nginx.conf /etc/nginx/conf.d/default.conf

USER app

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### Why This Architecture Works Well

1. **Builder stage** contains Node.js, npm, TypeScript compiler, and all dev dependencies (~300MB+)
2. **Runtime stage** contains only Nginx + static HTML/JS/CSS (~40MB)
3. **Result**: ~95% size reduction compared to a single-stage build

### TypeScript Build Considerations

Unlike a plain JavaScript project, this project runs `tsc -b` before `vite build`. This means:
- TypeScript compiler (`typescript` package) is required in the builder stage
- `tsconfig.json`, `tsconfig.app.json`, and `tsconfig.node.json` must be present during build
- Type-checking errors will fail the Docker build, acting as an additional safety gate
- All TypeScript config files are automatically included via `COPY . .`

## Layer Caching Analysis

### Optimal Cache-Efficient Ordering ✅

```dockerfile
# 1. Copy dependency manifests first (changes infrequently)
COPY package.json package-lock.json ./
RUN npm ci

# 2. Copy source code (changes frequently)
COPY . .
RUN npm run build && npm prune --production
```

This is optimal — dependency installation is cached unless `package.json` or `package-lock.json` change.

### What Would Break Caching ❌

```dockerfile
# BAD: Copying everything before npm ci invalidates cache on ANY file change
COPY . .
RUN npm ci
RUN npm run build
```

## Recommended .dockerignore

The `.dockerignore` should be created with these entries:

```
node_modules
.git
.gitignore
.dockerignore
Dockerfile*
README.md
LICENSE
docs
specs
coverage
.vscode
.idea
*.log
.DS_Store
dist
.specify
.agent
.github
.eslintcache
.trivyignore
.mailmap
.npmignore
.prettierignore
.prettierrc
.nvmrc
AGENTS.md
tests
```

### What Should Be Excluded ✅
- `node_modules` — Builder installs fresh via `npm ci`
- `.git` — Not needed for build, large directory
- `dist` — Builder creates fresh via `npm run build`
- `coverage`, `docs`, `specs` — Not needed at runtime
- `.agent`, `.github`, `.specify` — Development/CI tooling, not needed in image
- `tests` — Test files not needed in production image
- `*.log`, `.DS_Store` — System/editor artifacts
- `.prettierrc`, `.prettierignore`, `.nvmrc`, `.npmignore`, `.eslintcache` — Dev config files

### What Must NOT Be Excluded ⚠️
- `.docker/` — Contains `nginx.conf` which is `COPY`'d in the Dockerfile
- `src/` — Source code needed for build
- `index.html` — Entry point for Vite
- `package.json`, `package-lock.json` — Dependency manifests
- `vite.config.ts` — Build configuration
- `tsconfig*.json` — TypeScript configuration
- `postcss.config.cjs` — PostCSS/Tailwind configuration
- `tailwind.config.js` — Tailwind CSS configuration

## Size Reduction Techniques

### 1. Alpine Base Images (Recommended ✅)

```dockerfile
FROM node:20-alpine AS builder   # ~180MB (vs ~1GB full node)
FROM nginx:alpine AS runtime     # ~40MB (vs ~140MB full nginx)
```

### 2. npm prune (Recommended ✅)

```dockerfile
RUN npm run build && npm prune --production
```

This removes dev dependencies after the build, but since we don't copy `node_modules` to the runtime stage, this primarily reduces the build context for cache purposes.

### 3. Combine RUN Commands (Recommended ✅)

```dockerfile
# Runtime stage combines all setup in one RUN layer
RUN apk add --no-cache curl && \
    adduser -D -H -u 1000 -s /bin/false app && \
    mkdir -p /var/run/nginx /var/log/nginx /var/cache/nginx && \
    touch /var/run/nginx.pid && \
    chown -R app:app /var/run/nginx.pid /var/log/nginx /var/cache/nginx /etc/nginx/conf.d
```

### 4. Potential Further Optimization: Remove curl

If health checking is done externally (e.g., load balancer, Kubernetes), `curl` can be removed:

```dockerfile
# Without curl (smaller image, but no in-container health check tool)
RUN adduser -D -H -u 1000 -s /bin/false app && \
    mkdir -p /var/run/nginx /var/log/nginx /var/cache/nginx && \
    touch /var/run/nginx.pid && \
    chown -R app:app /var/run/nginx.pid /var/log/nginx /var/cache/nginx /etc/nginx/conf.d
```

> **Trade-off**: `curl` adds ~5MB but enables `docker exec` health checks.

## BuildKit Features

### GitHub Actions Cache (Recommended ✅)

```yaml
# In docker-publish.yml
- name: Build and push Docker image
  uses: docker/build-push-action@v5
  with:
    context: .
    cache-from: type=gha
    cache-to: type=gha,mode=max
```

### BuildKit Cache Mounts (Optional Enhancement)

For faster local builds, use cache mounts for npm:

```dockerfile
# syntax=docker/dockerfile:1.4
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./

# Cache npm packages across builds
RUN --mount=type=cache,target=/root/.npm \
    npm ci

COPY . .
RUN npm run build
```

> **Note**: Cache mounts don't persist in CI unless explicitly configured.

## Build Performance Measurement

```bash
# Build with timing output
DOCKER_BUILDKIT=1 docker build --progress=plain -t qr-generator:local .

# Check final image size
docker images qr-generator:local

# Analyze image layers
docker history qr-generator:local

# Interactive layer analysis with dive
brew install dive
dive qr-generator:local
```

### Expected Metrics

| Metric | Expected Value |
|--------|---------------|
| Builder stage size | ~300MB |
| Final image size | ~45-55MB |
| Build time (cold) | ~30-60s |
| Build time (cached deps) | ~10-20s |
| Layer count (final) | ~8-10 |

## Build Optimization Checklist

When reviewing this project's Dockerfile:

- [x] **Multi-stage builds** — Builder (node:20-alpine) → Runtime (nginx:alpine)
- [x] **Layer ordering** — `package*.json` + `npm ci` before `COPY . .`
- [x] **Minimal base** — Alpine images for both stages
- [x] **Dependency caching** — package files copied before source
- [x] **.dockerignore** — Excludes node_modules, .git, dist, tests, .agent, etc.
- [x] **Combine commands** — Runtime setup in single RUN layer
- [x] **CI cache** — GitHub Actions cache (`type=gha`)
- [ ] **BuildKit cache mounts** — Optional for local development
- [x] **Non-root user** — `app` user (UID 1000)
- [x] **Security scanning** — Trivy + Hadolint in CI

## Development vs Production Pattern

### Development (Local)

```bash
# Use Vite dev server directly (not Docker)
npm run dev
# → http://localhost:5173 with HMR
```

### Production Preview (Local Docker)

```bash
# Build and run the production Nginx container
npm run docker:build
npm run docker:run
# → http://localhost:8080 with read-only filesystem
```

> **Note**: `docker:build` and `docker:run` scripts are not yet defined in `package.json`. They should be added when the Dockerfile is implemented.

### Production (CI/CD)

```bash
# Automated via docker-publish.yml
# Push a tag to trigger: git tag v1.0.0 && git push --tags
```

## References

- [Docker Multi-Stage Builds](https://docs.docker.com/build/building/multi-stage/)
- [BuildKit Documentation](https://docs.docker.com/build/buildkit/)
- [Best Practices for Writing Dockerfiles](https://docs.docker.com/develop/dev-best-practices/)
- [dive - Layer Analysis Tool](https://github.com/wagoodman/dive)
- [Nginx Alpine Docker Image](https://hub.docker.com/_/nginx)
