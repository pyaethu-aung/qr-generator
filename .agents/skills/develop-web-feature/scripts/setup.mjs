#!/usr/bin/env node
/**
 * setup.mjs
 * Ensure .claude/settings.json has all the allow entries needed for
 * develop-web-feature to run hands-off. Safe to run multiple times (idempotent).
 * Run from the project root.
 *
 * Portable: the toolchain grants are DERIVED from the project (its package
 * manager and dependencies), never hard-coded to one stack. The skill-infra and
 * git grants are ecosystem-generic. So this is safe to ship via a skills repo
 * and run unchanged in any web project.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const SETTINGS_PATH = '.claude/settings.json';

function readJSON(path) {
  try { return JSON.parse(readFileSync(path, 'utf8')); } catch { return null; }
}

// --- Detect the project so the grants fit whatever stack is in use ---
const pkg = readJSON('package.json') ?? {};
const deps = { ...pkg.dependencies, ...pkg.devDependencies };
const hasDep = (name) => Boolean(deps[name]);

// Package manager from the lockfile present (npm is the fallback).
const pm = existsSync('pnpm-lock.yaml') ? 'pnpm'
  : existsSync('yarn.lock') ? 'yarn'
  : (existsSync('bun.lockb') || existsSync('bun.lock')) ? 'bun'
  : 'npm';

// Direct tool invocations the agent reaches for during Phase 3/5 single-file
// iteration — granted only for the tools this project actually depends on. npx
// is the runner because it ships with Node and works under every package manager.
const TOOLCHAIN_MAP = [
  { dep: '@playwright/test', entry: 'Bash(npx playwright*)' },
  { dep: 'playwright',       entry: 'Bash(npx playwright*)' },
  { dep: 'vitest',           entry: 'Bash(npx vitest*)' },
  { dep: 'jest',             entry: 'Bash(npx jest*)' },
  { dep: 'mocha',            entry: 'Bash(npx mocha*)' },
  { dep: 'typescript',       entry: 'Bash(npx tsc*)' },
  { dep: 'eslint',           entry: 'Bash(npx eslint*)' },
];
const TOOLCHAIN = [...new Set(TOOLCHAIN_MAP.filter((t) => hasDep(t.dep)).map((t) => t.entry))];

const REQUIRED = [
  // All project scripts (gates, dev server, e2e) via the detected package manager.
  `Bash(${pm} run *)`,
  // The skill's one hard dependency, installed via npx (available under any PM).
  'Bash(npx impeccable*)',
  // Spec / fixture directory creation. `mkdir -p` is create-only, never destructive.
  'Bash(mkdir -p *)',
  // Node scripts written to the project cache dir (avoids node -e inline blocks)
  'Bash(node .cache/develop-web-feature/*)',
  // Phase 0 scripts + the dev-server lifecycle helper (replaces raw curl/lsof/pkill/kill)
  'Bash(node .claude/skills/develop-web-feature/scripts/setup.mjs*)',
  'Bash(node .claude/skills/develop-web-feature/scripts/cache-check.mjs*)',
  'Bash(node .claude/skills/develop-web-feature/scripts/discover.mjs*)',
  'Bash(node .claude/skills/develop-web-feature/scripts/cache-write.mjs*)',
  'Bash(node .claude/skills/develop-web-feature/scripts/dev-server.mjs*)',
  // Git: read-only inspection, staging, and branch creation. Commit and PR
  // creation stay gated behind the /commit-message and /create-pr skills (their
  // sentinel-prefixed forms are added conditionally below); these cover
  // everything the workflow does directly outside those skills.
  'Bash(git status:*)',
  'Bash(git diff:*)',
  'Bash(git log:*)',
  'Bash(git show:*)',
  'Bash(git branch:*)',
  'Bash(git rev-parse:*)',
  'Bash(git add:*)',
  'Bash(git switch:*)',
  'Bash(git checkout -b:*)',
  // The one outward git action; the pre-push hook still blocks pushes to the default branch.
  'Bash(git push:*)',
];

// Added only when the corresponding skill or tool is present
const CONDITIONAL = [
  // Skill-invocation tokens. The Claude Code token is `Skill(...)` SINGULAR — the
  // plural `Skills(...)` never matches (verified against the tokens Claude Code
  // itself writes to settings.local.json on approval). Grant BOTH the bare form
  // and the `:*` form: a slash command carries its arguments in the token, so an
  // invocation like `/impeccable craft <x>` needs `Skill(impeccable:*)`, while a
  // bare `/update-readme` needs `Skill(update-readme)`.
  { path: '.claude/skills/develop-web-feature', entry: 'Skill(develop-web-feature)' },
  { path: '.claude/skills/develop-web-feature', entry: 'Skill(develop-web-feature:*)' },
  { path: '.claude/skills/commit-message',      entry: 'Skill(commit-message)' },
  { path: '.claude/skills/commit-message',      entry: 'Skill(commit-message:*)' },
  { path: '.claude/skills/create-pr',           entry: 'Skill(create-pr)' },
  { path: '.claude/skills/create-pr',           entry: 'Skill(create-pr:*)' },
  { path: '.claude/skills/impeccable',          entry: 'Skill(impeccable)' },
  { path: '.claude/skills/impeccable',          entry: 'Skill(impeccable:*)' },
  { path: '.claude/skills/update-readme',       entry: 'Skill(update-readme)' },
  { path: '.claude/skills/update-readme',       entry: 'Skill(update-readme:*)' },
  // /impeccable runs several scripts from its own dir (detect, live-server,
  // critique-storage, context, load-context, trend, …); one wildcard covers them.
  { path: '.claude/skills/impeccable',          entry: 'Bash(node .claude/skills/impeccable/scripts/*)' },
  // critique-storage is also invoked with an env-var prefix (IMPECCABLE_CRITIQUE_META=...),
  // which shifts the command prefix so the node-path entry alone does not match.
  { path: '.claude/skills/impeccable',          entry: 'Bash(IMPECCABLE_CRITIQUE_META=*)' },
  // commit/PR creation only via the sentinel forms the guard hooks demand; the
  // skills set the sentinel, so this trusts the skill, not arbitrary commits.
  { path: '.claude/skills/commit-message',      entry: 'Bash(CLAUDE_COMMIT_VIA_SKILL=1 git commit:*)' },
  { path: '.claude/skills/create-pr',           entry: 'Bash(CLAUDE_PR_VIA_SKILL=1 gh pr create:*)' },
  // create-pr also READS pr state — `gh pr list` (existing-PR check) and
  // `gh pr view` (post-create verify). Merge/close stay ungranted: Phase 7 is human.
  { path: '.claude/skills/create-pr',           entry: 'Bash(gh pr view:*)' },
  { path: '.claude/skills/create-pr',           entry: 'Bash(gh pr list:*)' },
];

let settings = {};
if (existsSync(SETTINGS_PATH)) {
  try {
    settings = JSON.parse(readFileSync(SETTINGS_PATH, 'utf8'));
  } catch (err) {
    console.error(`[setup] ERROR: ${SETTINGS_PATH} contains invalid JSON — aborting to avoid data loss.`);
    console.error(`[setup] Fix the file manually, then re-run setup.`);
    process.exit(1);
  }
}
if (!settings.permissions) settings.permissions = {};
if (!Array.isArray(settings.permissions.allow)) settings.permissions.allow = [];

const existing = new Set(settings.permissions.allow);
const added = [];

for (const entry of [...REQUIRED, ...TOOLCHAIN]) {
  if (!existing.has(entry)) {
    settings.permissions.allow.push(entry);
    existing.add(entry);
    added.push(entry);
  }
}

for (const { path, entry } of CONDITIONAL) {
  if (existsSync(path) && !existing.has(entry)) {
    settings.permissions.allow.push(entry);
    existing.add(entry);
    added.push(entry);
  }
}

if (added.length > 0) {
  writeFileSync(SETTINGS_PATH, JSON.stringify(settings, null, 2) + '\n');
  console.log(`[setup] Added ${added.length} allow ${added.length === 1 ? 'entry' : 'entries'} to ${SETTINGS_PATH}:`);
  added.forEach(e => console.log(`  + ${e}`));
} else {
  console.log('[setup] All required allow entries already present — nothing to do.');
}
