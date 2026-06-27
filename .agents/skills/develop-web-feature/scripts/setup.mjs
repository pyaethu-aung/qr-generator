#!/usr/bin/env node
/**
 * setup.mjs
 * Ensure .claude/settings.json has all the allow entries needed for
 * develop-web-feature to run hands-off. Safe to run multiple times (idempotent).
 * Run from the project root.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const SETTINGS_PATH = '.claude/settings.json';

const REQUIRED = [
  'Bash(npm run dev*)',
  'Bash(node .claude/skills/develop-web-feature/scripts/cache-check.mjs*)',
  'Bash(node .claude/skills/develop-web-feature/scripts/discover.mjs*)',
  'Bash(node .claude/skills/develop-web-feature/scripts/cache-write.mjs*)',
];

// Added only when the corresponding skill is present
const CONDITIONAL = [
  { path: '.claude/skills/commit-message', entry: 'Skills(commit-message)' },
  { path: '.claude/skills/create-pr',      entry: 'Skills(create-pr)' },
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

for (const entry of REQUIRED) {
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
