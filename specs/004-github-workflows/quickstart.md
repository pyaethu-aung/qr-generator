# Quickstart: CI/CD Workflows

## Workflow Overview

The following workflows are located in `.github/workflows/`:

1.  **Deploy (`deploy.yml`)**: Triggered on push to `main`. Builds the project and deploys the `dist` folder to GitHub Pages.
2.  **Lint (`lint.yml`)**: Triggered on pull requests to `main`. Runs `npm run lint` and `npm run build` (which includes `tsc`).
3.  **Security (`security.yml`)**: Triggered on push to `main` and pull requests. Runs `npm audit`, CodeQL, and Snyk.

## Local Troubleshooting

If a workflow fails, you can simulate steps locally:

- **Lint failure**: Run `npm run lint`.
- **Build failure**: Run `npm run build`.
- **Security failure**: Run `npm audit`.

## Required Secrets

For Snyk scanning to work, add the following to GitHub Repository Secrets:
- `SNYK_TOKEN`: Your Snyk API token.
