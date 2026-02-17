---
name: docker-cicd-integration
description: Integrate Docker builds, testing, and deployment into CI/CD pipelines. Use when asked to "add Docker to CI/CD", "automate Docker builds", "setup container deployment", or "configure Docker in GitHub Actions".
metadata:
  author: custom
  version: "1.0.0"
  argument-hint: <ci-platform>
---

# Docker CI/CD Integration Skill

Comprehensive guide for integrating Docker into CI/CD pipelines with build automation, testing, security scanning, and deployment.

## What This Skill Does

1. **CI/CD Pipeline Setup**
   - Configures automated Docker builds
   - Implements multi-platform builds
   - Sets up image tagging strategies
   - Manages container registry integration

2. **Automated Testing**
   - Container testing in CI
   - Integration test orchestration
   - Health check validation
   - Performance testing

3. **Security Integration**
   - Vulnerability scanning in pipeline
   - Image signing and verification
   - Secret management
   - Compliance checking

4. **Deployment Automation**
   - Registry push automation
   - Multi-environment deployment
   - Rollback strategies
   - Version management

## GitHub Actions Workflows

### Complete CI/CD Pipeline

`.github/workflows/docker-ci.yml`:

```yaml
name: Docker CI/CD Pipeline

on:
  push:
    branches: [main, develop]
    tags:
      - 'v*'
  pull_request:
    branches: [main]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  # Job 1: Lint and Security Check
  lint-and-security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Run Hadolint (Dockerfile linter)
        uses: hadolint/hadolint-action@v3.1.0
        with:
          dockerfile: Dockerfile
          failure-threshold: warning
      
      - name: Run Trivy config scan
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'config'
          scan-ref: 'Dockerfile'
          exit-code: '1'
          severity: 'CRITICAL,HIGH'

  # Job 2: Build and Test
  build-and-test:
    needs: lint-and-security
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
    steps:
      - uses: actions/checkout@v4
      
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3
      
      - name: Log in to Container Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      
      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
          tags: |
            type=ref,event=branch
            type=ref,event=pr
            type=semver,pattern={{version}}
            type=semver,pattern={{major}}.{{minor}}
            type=sha,prefix={{branch}}-
      
      - name: Build Docker image
        uses: docker/build-push-action@v5
        with:
          context: .
          push: false
          load: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
          build-args: |
            BUILDKIT_INLINE_CACHE=1
      
      - name: Run container tests
        run: |
          # Start container
          docker run -d --name test-container \
            -p 3000:3000 \
            ${{ steps.meta.outputs.tags }}
          
          # Wait for container to be healthy
          timeout 30s bash -c 'until docker exec test-container wget -q --spider http://localhost:3000/health; do sleep 2; done'
          
          # Run tests
          docker exec test-container npm test
          
          # Cleanup
          docker stop test-container
          docker rm test-container
      
      - name: Scan image for vulnerabilities
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: ${{ steps.meta.outputs.tags }}
          format: 'sarif'
          output: 'trivy-results.sarif'
          severity: 'CRITICAL,HIGH'
      
      - name: Upload Trivy results to GitHub Security
        uses: github/codeql-action/upload-sarif@v2
        if: always()
        with:
          sarif_file: 'trivy-results.sarif'
      
      - name: Push Docker image
        if: github.event_name != 'pull_request'
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

  # Job 3: Multi-platform Build (for releases)
  multi-platform-build:
    if: startsWith(github.ref, 'refs/tags/v')
    needs: build-and-test
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
    steps:
      - uses: actions/checkout@v4
      
      - name: Set up QEMU
        uses: docker/setup-qemu-action@v3
      
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3
      
      - name: Log in to Container Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      
      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
          tags: |
            type=semver,pattern={{version}}
            type=semver,pattern={{major}}.{{minor}}
            type=semver,pattern={{major}}
      
      - name: Build and push multi-platform
        uses: docker/build-push-action@v5
        with:
          context: .
          platforms: linux/amd64,linux/arm64
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
```

### Separate Security Scanning Workflow

`.github/workflows/docker-security.yml`:

```yaml
name: Docker Security Scan

on:
  schedule:
    # Run daily at 2 AM UTC
    - cron: '0 2 * * *'
  workflow_dispatch:

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  security-scan:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      security-events: write
    steps:
      - name: Log in to Container Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      
      - name: Pull latest image
        run: docker pull ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:latest
      
      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:latest
          format: 'sarif'
          output: 'trivy-results.sarif'
          severity: 'CRITICAL,HIGH,MEDIUM'
      
      - name: Upload results to GitHub Security
        uses: github/codeql-action/upload-sarif@v2
        with:
          sarif_file: 'trivy-results.sarif'
      
      - name: Generate SBOM
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:latest
          format: 'cyclonedx'
          output: 'sbom.json'
      
      - name: Upload SBOM artifact
        uses: actions/upload-artifact@v3
        with:
          name: sbom
          path: sbom.json
```

## Image Tagging Strategy

### Semantic Versioning Tags

```yaml
# Automatically create tags based on git events
- name: Docker metadata
  id: meta
  uses: docker/metadata-action@v5
  with:
    images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
    tags: |
      # Branch name
      type=ref,event=branch
      
      # PR number
      type=ref,event=pr
      
      # Semantic versioning
      type=semver,pattern={{version}}
      type=semver,pattern={{major}}.{{minor}}
      type=semver,pattern={{major}}
      
      # Git SHA (short)
      type=sha,prefix={{branch}}-,format=short
      
      # Latest tag for main branch
      type=raw,value=latest,enable={{is_default_branch}}
```

### Tag Examples
- `v1.2.3` → Tags: `1.2.3`, `1.2`, `1`, `latest`
- `main` branch → Tag: `main`
- PR #42 → Tag: `pr-42`
- Commit on develop → Tag: `develop-a1b2c3d`

## Container Registry Options

### GitHub Container Registry (GHCR)

```yaml
- name: Log in to GHCR
  uses: docker/login-action@v3
  with:
    registry: ghcr.io
    username: ${{ github.actor }}
    password: ${{ secrets.GITHUB_TOKEN }}
```

### Docker Hub

```yaml
- name: Log in to Docker Hub
  uses: docker/login-action@v3
  with:
    username: ${{ secrets.DOCKER_USERNAME }}
    password: ${{ secrets.DOCKER_PASSWORD }}
```

### AWS ECR

```yaml
- name: Configure AWS credentials
  uses: aws-actions/configure-aws-credentials@v4
  with:
    aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
    aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
    aws-region: us-east-1

- name: Log in to Amazon ECR
  id: login-ecr
  uses: aws-actions/amazon-ecr-login@v2

- name: Build and push
  uses: docker/build-push-action@v5
  with:
    push: true
    tags: ${{ steps.login-ecr.outputs.registry }}/myapp:${{ github.sha }}
```

## Testing Strategies

### Unit Tests in Container

```dockerfile
# In Dockerfile
FROM node:20-alpine AS test
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm test
```

```yaml
# In GitHub Actions
- name: Run tests in container
  run: |
    docker build --target test -t myapp:test .
```

### Integration Tests

```yaml
- name: Start services with Docker Compose
  run: docker-compose up -d

- name: Wait for services
  run: |
    timeout 30s bash -c 'until curl -f http://localhost:3000/health; do sleep 2; done'

- name: Run integration tests
  run: npm run test:integration

- name: Collect logs
  if: failure()
  run: docker-compose logs

- name: Cleanup
  if: always()
  run: docker-compose down -v
```

## Security Best Practices in CI/CD

### 1. Scan Before Push

```yaml
- name: Scan before pushing
  uses: aquasecurity/trivy-action@master
  with:
    image-ref: myapp:${{ github.sha }}
    exit-code: '1'  # Fail build if vulnerabilities found
    severity: 'CRITICAL,HIGH'
```

### 2. Sign Images

```yaml
- name: Install Cosign
  uses: sigstore/cosign-installer@v3

- name: Sign image
  env:
    COSIGN_PASSWORD: ${{ secrets.COSIGN_PASSWORD }}
  run: |
    cosign sign --key cosign.key \
      ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:${{ github.sha }}
```

### 3. Secret Scanning

```yaml
- name: Scan for secrets
  uses: trufflesecurity/trufflehog@main
  with:
    path: ./
    base: ${{ github.event.repository.default_branch }}
    head: HEAD
```

## Deployment Integration

### Deploy to Production

`.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  release:
    types: [published]

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: production
    steps:
      - name: Deploy to Kubernetes
        run: |
          kubectl set image deployment/myapp \
            myapp=${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:${{ github.event.release.tag_name }}
          
          kubectl rollout status deployment/myapp
```

## Makefile for Local Development

```makefile
.PHONY: build test push scan

IMAGE_NAME := myapp
REGISTRY := ghcr.io/username
TAG := $(shell git rev-parse --short HEAD)

build:
	docker build -t $(IMAGE_NAME):$(TAG) .
	docker tag $(IMAGE_NAME):$(TAG) $(IMAGE_NAME):latest

test:
	docker run --rm $(IMAGE_NAME):$(TAG) npm test

scan:
	trivy image $(IMAGE_NAME):$(TAG)

push:
	docker tag $(IMAGE_NAME):$(TAG) $(REGISTRY)/$(IMAGE_NAME):$(TAG)
	docker push $(REGISTRY)/$(IMAGE_NAME):$(TAG)

ci: build test scan
```

## References

- [GitHub Actions for Docker](https://docs.github.com/en/actions/publishing-packages/publishing-docker-images)
- [Docker Build Push Action](https://github.com/docker/build-push-action)
- [Trivy Action](https://github.com/aquasecurity/trivy-action)
- [Container Security Best Practices](https://cheatsheetseries.owasp.org/cheatsheets/Docker_Security_Cheat_Sheet.html)
