---
name: docker-security-hardening
description: Analyze and harden Docker configurations for security best practices. Use when asked to "secure my Docker setup", "scan for vulnerabilities", "check Docker security", or "harden container security".
metadata:
  author: custom
  version: "1.0.0"
  argument-hint: <dockerfile-path>
---

# Docker Security Hardening Skill

Comprehensive security analysis and hardening recommendations for Docker configurations.

## What This Skill Does

1. **Dockerfile Security Analysis**
   - Scans for security anti-patterns
   - Checks for proper multi-stage builds
   - Validates non-root user configuration
   - Identifies exposed secrets or credentials
   - Verifies minimal base image usage

2. **Image Vulnerability Scanning**
   - Recommends and configures Trivy scanner
   - Integrates CVE scanning into CI/CD
   - Generates SBOM (Software Bill of Materials)
   - Checks for outdated dependencies

3. **Runtime Security Checks**
   - Container privilege escalation prevention
   - Network isolation verification
   - Volume mount security review
   - Resource limit validation

## Security Checklist

When reviewing a Dockerfile, verify:

### Base Image Security
- [ ] Using official, minimal base images (Alpine, distroless, or slim variants)
- [ ] Base image version is pinned with specific tag (not `latest`)
- [ ] Base image is from trusted registry
- [ ] Regular updates documented

### Build Security
- [ ] Multi-stage builds used to minimize final image
- [ ] No secrets in build arguments or ENV variables
- [ ] .dockerignore excludes sensitive files
- [ ] Build cache doesn't expose sensitive data

### Runtime Security
- [ ] Non-root user created and used (USER directive)
- [ ] WORKDIR properly set
- [ ] Minimal packages installed (only what's needed)
- [ ] No interactive shells in production images
- [ ] HEALTHCHECK defined
- [ ] Proper signal handling (exec form for ENTRYPOINT/CMD)

### Network & Permissions
- [ ] Only necessary ports exposed
- [ ] Read-only root filesystem where possible
- [ ] No privileged mode required
- [ ] Capabilities properly dropped/added

### Secrets Management
- [ ] No hardcoded credentials, API keys, or tokens
- [ ] Environment variables for configuration
- [ ] Docker secrets or external secret management for sensitive data
- [ ] ARG values don't leak into final image

## Recommended Tools

### 1. Trivy (Vulnerability Scanner)
```bash
# Install Trivy
brew install aquasecurity/trivy/trivy

# Scan Dockerfile
trivy config Dockerfile

# Scan built image
trivy image <image-name>

# Generate SBOM
trivy image --format cyclonedx <image-name>
```

### 2. Hadolint (Dockerfile Linter)
```bash
# Install Hadolint
brew install hadolint

# Lint Dockerfile
hadolint Dockerfile
```

### 3. Docker Bench Security
```bash
# Run CIS Docker Benchmark
docker run --rm --net host --pid host --cap-add audit_control \
  -e DOCKER_CONTENT_TRUST=$DOCKER_CONTENT_TRUST \
  -v /var/lib:/var/lib \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v /usr/lib/systemd:/usr/lib/systemd \
  -v /etc:/etc --label docker_bench_security \
  docker/docker-bench-security
```

## Usage Examples

### Example 1: Basic Security Review
```
USER: Can you check my Dockerfile for security issues?
ASSISTANT: [Reads SKILL.md for docker-security-hardening]
ASSISTANT: [Reviews Dockerfile against security checklist]
ASSISTANT: [Provides findings and recommendations]
```

### Example 2: CI/CD Integration
```
USER: Add vulnerability scanning to my GitHub Actions
ASSISTANT: [Reads SKILL.md]
ASSISTANT: [Creates .github/workflows/security-scan.yml with Trivy]
ASSISTANT: [Configures automated scanning on PR and push]
```

## Secure Dockerfile Template

```dockerfile
# Stage 1: Build
FROM node:20-alpine AS builder

# Install dependencies only when needed
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Stage 2: Runtime
FROM node:20-alpine AS runtime

# Security: Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Set working directory
WORKDIR /app

# Copy only necessary files from builder
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --chown=nodejs:nodejs . .

# Security: Switch to non-root user
USER nodejs

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

# Security: Use exec form
ENTRYPOINT ["node", "index.js"]
```

## Output Format

When analyzing Dockerfile security:

1. **Critical Issues** (must fix)
2. **High Priority** (should fix)
3. **Medium Priority** (recommended)
4. **Low Priority** (nice to have)
5. **Best Practices** (suggestions)

For each issue, provide:
- Line number or section
- Description of the issue
- Security impact
- Recommended fix
- Example code

## Integration with CI/CD

Add to `.github/workflows/docker-security.yml`:

```yaml
name: Docker Security Scan

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  security-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'config'
          scan-ref: 'Dockerfile'
          format: 'sarif'
          output: 'trivy-results.sarif'
      
      - name: Upload Trivy results to GitHub Security
        uses: github/codeql-action/upload-sarif@v2
        with:
          sarif_file: 'trivy-results.sarif'
```

## References

- [CIS Docker Benchmark](https://www.cisecurity.org/benchmark/docker)
- [OWASP Docker Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Docker_Security_Cheat_Sheet.html)
- [Trivy Documentation](https://aquasecurity.github.io/trivy/)
- [Docker Security Best Practices](https://docs.docker.com/develop/security-best-practices/)
