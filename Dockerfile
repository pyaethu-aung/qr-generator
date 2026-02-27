# =============================================================================
# Dockerfile — QR Generator SPA (Multi-Stage Build)
#
# Stage 1 (builder): Node 20 Alpine — install deps, compile TS, build Vite
# Stage 2 (runtime): Nginx Alpine — serve static assets with security hardening
#
# Build:  docker build -t qr-generator:local .
# Run:    docker run --rm -p 8080:80 --read-only --cap-drop ALL \
#           --tmpfs /var/cache/nginx:mode=1777 \
#           --tmpfs /var/run:mode=1777 \
#           --tmpfs /tmp:mode=1777 \
#           qr-generator:local
# =============================================================================

# ---------------------------------------------------------------------------
# Stage 1: Builder — compile TypeScript + bundle with Vite
# ---------------------------------------------------------------------------
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency manifests first for layer cache optimization (FR-016)
# Only re-runs npm ci when package files change, not on every source edit
COPY package.json package-lock.json ./

# Use npm ci for reproducible, clean installs (mirrors CI behavior)
RUN npm ci --ignore-scripts

# Copy configuration files needed by the build pipeline
COPY tsconfig.json tsconfig.app.json tsconfig.node.json ./
COPY vite.config.ts ./
COPY postcss.config.cjs tailwind.config.js ./
COPY index.html ./

# Copy source code and public assets (changes here don't invalidate npm ci cache)
COPY src/ src/
COPY public/ public/

# Compile TypeScript and build production bundle
RUN npm run build

# ---------------------------------------------------------------------------
# Stage 2: Runtime — serve static assets with hardened Nginx
# ---------------------------------------------------------------------------
FROM nginx:alpine-slim AS runtime

# Create non-root user for security hardening (FR-003)
# UID 1000, no home directory, no login shell
RUN addgroup -g 1000 -S app && \
    adduser -u 1000 -S -G app -s /sbin/nologin app

# Remove default Nginx HTML and config
RUN rm -rf /usr/share/nginx/html/* /etc/nginx/conf.d/default.conf

# Copy built static assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration
COPY .docker/nginx.conf /etc/nginx/nginx.conf

# Prepare writable directories for Nginx on read-only filesystem (FR-004)
# These are the only directories Nginx needs to write to at runtime
RUN mkdir -p /var/cache/nginx /var/run /tmp && \
    chown -R app:app /var/cache/nginx /var/run /tmp && \
    chown -R app:app /usr/share/nginx/html && \
    chown -R app:app /var/log/nginx

# Expose HTTP port
EXPOSE 80

# Health check instruction for container orchestrators (FR-012)
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:80/health || exit 1

# Switch to non-root user
USER app

# Start Nginx in foreground (required for container lifecycle management)
CMD ["nginx", "-g", "daemon off;"]
