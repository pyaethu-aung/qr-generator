# qr-generator Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-02-17

## Active Technologies
- YAML (GitHub Actions workflow syntax) + GitHub Actions built-ins (`paths:` filter, step conditionals); (021-fix-cicd-issues)
- TypeScript 5.x, React 18 + Tailwind CSS v4 (`@theme` directive), Vite, clsx, tailwind-merge (022-semantic-design-tokens)
- `localStorage` (theme preference key: `qr-generator:theme-preference`) (022-semantic-design-tokens)

- Dockerfile syntax 1.4+ (BuildKit), Nginx 1.25+ (Alpine), Node 20 (Builder), TypeScript 5.9 (compile step in builder) + Docker, GitHub Actions, Trivy, Hadolint, Cosign (019-docker-containerization)

## Project Structure

```text
src/
tests/
```

## Commands

npm test && npm run lint

## Code Style

Dockerfile syntax 1.4+ (BuildKit), Nginx 1.25+ (Alpine), Node 20 (Builder), TypeScript 5.9 (compile step in builder): Follow standard conventions

## Recent Changes
- 022-semantic-design-tokens: Added TypeScript 5.x, React 18 + Tailwind CSS v4 (`@theme` directive), Vite, clsx, tailwind-merge
- 022-semantic-design-tokens: Added [if applicable, e.g., PostgreSQL, CoreData, files or N/A]
- 021-fix-cicd-issues: Added YAML (GitHub Actions workflow syntax) + GitHub Actions built-ins (`paths:` filter, step conditionals);


<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
