# Quickstart & Validation Guide: CI/CD Workflow Fixes

**Feature**: `021-fix-cicd-issues` | **Date**: 2026-02-24

> These are YAML-only changes. There is no local build step to run. Validation is
> performed by observing GitHub Actions workflow runs after pushing to `main`.

---

## Prerequisites

- Changes merged (or pushed directly) to `main`
- Access to the repository's **Actions** tab on GitHub

---

## Validating Fix 1 — Deploy Workflow Path Filters

### Test A: Documentation-only push should NOT trigger deploy

1. Make a trivial edit to `README.md` (e.g., add a blank line)
2. Commit and push to `main`
3. Open **Actions → Deploy to GitHub Pages**
4. ✅ **Expected**: No new workflow run is created for this push

### Test B: Source code change SHOULD trigger deploy

1. Make a trivial edit to any file under `src/` (e.g., add a comment)
2. Commit and push to `main`
3. Open **Actions → Deploy to GitHub Pages**
4. ✅ **Expected**: A new workflow run is triggered and completes successfully

### Test C: `index.html` change SHOULD trigger deploy

1. Add a comment or whitespace change to `index.html`
2. Commit and push to `main`
3. Open **Actions → Deploy to GitHub Pages**
4. ✅ **Expected**: A new workflow run is triggered

### Test D: `workflow_dispatch` always runs

1. Open **Actions → Deploy to GitHub Pages**
2. Click **Run workflow** (manual trigger)
3. ✅ **Expected**: Workflow runs regardless of recent file changes

---

## Validating Fix 2 — Security Workflow Path Filter Cleanup

### Test A: ESLint config change should NOT trigger security scan

1. Make a trivial edit to `eslint.config.js` (e.g., add a comment)
2. Commit and push to `main`
3. Open **Actions → Security Scan**
4. ✅ **Expected**: No new workflow run is created for this push

### Test B: `tsconfig` change should NOT trigger security scan

1. Make a trivial whitespace edit to `tsconfig.json`
2. Commit and push to `main`
3. Open **Actions → Security Scan**
4. ✅ **Expected**: No new workflow run is created

### Test C: Dependency change SHOULD trigger security scan

1. Add a comment to `package.json`
2. Commit and push to `main`
3. Open **Actions → Security Scan**
4. ✅ **Expected**: A new workflow run is triggered

---

## Validating Fix 3 — SARIF Upload Condition

### Test A: Upload runs after successful Snyk scan

1. Trigger a security scan (e.g., push a `src/` change)
2. Let the workflow run to completion
3. Open the workflow run → expand "Upload Snyk results to GitHub Security tab"
4. ✅ **Expected**: Step runs and shows green (or green with informational output)

### Test B: Upload runs when Snyk finds vulnerabilities

1. If `SNYK_TOKEN` is configured and vulnerabilities exist, the Snyk step will
   exit non-zero but `continue-on-error: true` prevents workflow failure
2. Open the workflow run → check the upload step
3. ✅ **Expected**: Upload step still runs (condition is `success() || failure()`)

### Test C: Upload is skipped on manual cancellation

1. Trigger a security scan
2. While the scan is in progress, click **Cancel workflow** in the Actions UI
3. Open the cancelled run → expand "Upload Snyk results to GitHub Security tab"
4. ✅ **Expected**: Step shows as **Skipped** (not Failed, not run)

---

## Validating Fix 4 — `lint.yml` Review (No Change)

No validation required. Confirm that `lint.yml` was not modified by checking:

```bash
git diff main..HEAD -- .github/workflows/lint.yml
```

✅ **Expected**: No output (no diff).
