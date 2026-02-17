---
name: docker-multi-stage-optimization
description: Optimize Docker builds using multi-stage patterns, layer caching, and size reduction. Use when asked to "optimize my Dockerfile", "reduce image size", "speed up Docker builds", or "improve build performance".
metadata:
  author: custom
  version: "1.0.0"
  argument-hint: <dockerfile-path>
---

# Docker Multi-Stage Build Optimization Skill

Master Docker build optimization through multi-stage builds, intelligent caching, and size reduction techniques.

## What This Skill Does

1. **Multi-Stage Build Design**
   - Analyzes build requirements and dependencies
   - Designs optimal stage separation
   - Minimizes final image size
   - Improves build cache efficiency

2. **Layer Optimization**
   - Reviews layer ordering for cache efficiency
   - Identifies cache-busting patterns
   - Optimizes COPY instructions
   - Minimizes layer count and size

3. **Build Performance Analysis**
   - Measures build times
   - Identifies slow build steps
   - Recommends BuildKit features
   - Implements parallel builds

## Multi-Stage Build Patterns

### Pattern 1: Build + Runtime Separation (Node.js)

```dockerfile
# -----------------------------
# Stage 1: Dependencies
# -----------------------------
FROM node:20-alpine AS deps
WORKDIR /app

# Copy dependency files only (better caching)
COPY package*.json ./
RUN npm ci --only=production

# -----------------------------
# Stage 2: Builder
# -----------------------------
FROM node:20-alpine AS builder
WORKDIR /app

# Copy dependency files
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build application
RUN npm run build

# -----------------------------
# Stage 3: Runtime
# -----------------------------
FROM node:20-alpine AS runtime
WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy only production dependencies from deps stage
COPY --from=deps --chown=nodejs:nodejs /app/node_modules ./node_modules

# Copy built application from builder stage
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist

USER nodejs

EXPOSE 3000
CMD ["node", "dist/index.js"]
```

### Pattern 2: Development vs Production

```dockerfile
# -----------------------------
# Base Stage (shared)
# -----------------------------
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./

# -----------------------------
# Development Stage
# -----------------------------
FROM base AS development
RUN npm install
COPY . .
CMD ["npm", "run", "dev"]

# -----------------------------
# Production Builder
# -----------------------------
FROM base AS production-builder
RUN npm ci --only=production
COPY . .
RUN npm run build

# -----------------------------
# Production Runtime
# -----------------------------
FROM node:20-alpine AS production
WORKDIR /app
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001
COPY --from=production-builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=production-builder --chown=nodejs:nodejs /app/node_modules ./node_modules
USER nodejs
CMD ["node", "dist/index.js"]
```

### Pattern 3: Distroless Final Image

```dockerfile
# Build stage
FROM node:20 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Bundle stage - create standalone bundle
FROM node:20 AS bundler
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
# Use webpack or esbuild to create single bundle if possible
RUN npx esbuild dist/index.js --bundle --platform=node --outfile=bundle.js

# Runtime - distroless
FROM gcr.io/distroless/nodejs20-debian12
COPY --from=bundler /app/bundle.js /app/
WORKDIR /app
CMD ["bundle.js"]
```

## Layer Caching Best Practices

### ✅ DO: Order from least to most frequently changed

```dockerfile
# 1. Install system dependencies (rarely changes)
RUN apk add --no-cache git

# 2. Copy dependency definitions (changes occasionally)
COPY package*.json ./

# 3. Install dependencies (changes when package.json changes)
RUN npm ci

# 4. Copy source code (changes frequently)
COPY . .

# 5. Build application (changes when source changes)
RUN npm run build
```

### ❌ DON'T: Copy everything before installing dependencies

```dockerfile
# BAD: This invalidates cache on ANY file change
COPY . .
RUN npm install
RUN npm run build
```

## Size Reduction Techniques

### 1. Use Alpine or Distroless Base Images

```dockerfile
# Alpine - Small but has shell and package manager
FROM node:20-alpine  # ~50MB vs ~300MB for full node

# Distroless - Minimal runtime, no shell
FROM gcr.io/distroless/nodejs20-debian12  # ~40MB
```

### 2. Remove Build Dependencies

```dockerfile
# Install, build, and clean in single layer
RUN apk add --no-cache --virtual .build-deps \
    python3 make g++ && \
    npm install && \
    npm run build && \
    apk del .build-deps
```

### 3. Exclude Unnecessary Files

`.dockerignore`:
```
node_modules
npm-debug.log
.git
.gitignore
.env
.env.local
*.md
.vscode
.idea
coverage
.test
*.test.js
*.spec.js
dist
build
```

### 4. Use --no-install-recommends (Debian/Ubuntu)

```dockerfile
RUN apt-get update && apt-get install -y --no-install-recommends \
    package1 \
    package2 \
    && rm -rf /var/lib/apt/lists/*
```

## BuildKit Features

Enable BuildKit for better performance:

```bash
# Enable BuildKit
export DOCKER_BUILDKIT=1

# Or in docker-compose.yml
export COMPOSE_DOCKER_CLI_BUILD=1
export DOCKER_BUILDKIT=1
```

### BuildKit Optimizations

```dockerfile
# syntax=docker/dockerfile:1.4

# Use cache mounts for package managers
FROM node:20-alpine AS builder
WORKDIR /app

# Cache npm packages between builds
RUN --mount=type=cache,target=/root/.npm \
    npm install

# Use bind mounts for copying
RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm \
    npm ci --only=production
```

## Performance Measurement

### Analyze Build Time

```bash
# Build with timing
docker build --progress=plain -t myapp .

# Use dive to analyze image layers
brew install dive
dive myapp:latest
```

### Analyze Image Size

```bash
# Check image size
docker images myapp

# Detailed layer analysis
docker history myapp:latest

# Use dive for interactive analysis
dive myapp:latest
```

## Build Optimization Checklist

When optimizing a Dockerfile:

- [ ] **Multi-stage builds** - Separate build and runtime stages
- [ ] **Layer ordering** - Order COPY/RUN from least to most frequently changed
- [ ] **Minimal base** - Use Alpine or distroless images
- [ ] **Dependency caching** - Copy package files before source code
- [ ] **.dockerignore** - Exclude unnecessary files from build context
- [ ] **Combine commands** - Reduce layer count by combining RUN commands
- [ ] **BuildKit cache** - Use --mount=type=cache for package managers
- [ ] **Remove build deps** - Clean up build tools in same layer
- [ ] **Parallel stages** - Use multiple FROM statements that can build in parallel
- [ ] **Security scanning** - Ensure optimizations don't compromise security

## Example Analysis Output

When analyzing a Dockerfile:

```
🔍 Docker Build Optimization Analysis
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 Current Metrics:
  Image Size: 487 MB
  Build Time: 3m 42s
  Layers: 23

⚠️  Issues Found:

1. [CRITICAL] Missing multi-stage build
   Line: 1
   Impact: Final image includes build tools (~200MB unnecessary)
   Fix: Implement multi-stage build pattern

2. [HIGH] Inefficient layer caching
   Line: 5
   Impact: COPY before npm install invalidates cache on any code change
   Fix: Move COPY package*.json before RUN npm install

3. [MEDIUM] Large base image
   Line: 1
   Impact: Using full node image instead of alpine
   Fix: Change FROM node:20 to node:20-alpine

📈 Optimization Potential:
  Estimated size reduction: 350MB → 80MB (77% reduction)
  Estimated build time improvement: 3m 42s → 45s (with cache)

💡 Recommendations:
  1. Implement multi-stage build
  2. Switch to Alpine base image
  3. Improve .dockerignore coverage
  4. Enable BuildKit cache mounts
```

## Docker Compose for Development

```yaml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
      target: development  # Use development stage
      cache_from:
        - myapp:latest
      args:
        BUILDKIT_INLINE_CACHE: 1
    volumes:
      - .:/app
      - /app/node_modules  # Prevent overwriting
    environment:
      - NODE_ENV=development
    ports:
      - "3000:3000"
```

## References

- [Docker Multi-Stage Builds](https://docs.docker.com/build/building/multi-stage/)
- [BuildKit Documentation](https://docs.docker.com/build/buildkit/)
- [Best Practices for Writing Dockerfiles](https://docs.docker.com/develop/dev-best-practices/)
- [dive - Layer Analysis Tool](https://github.com/wagoodman/dive)
