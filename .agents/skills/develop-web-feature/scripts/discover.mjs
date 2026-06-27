#!/usr/bin/env node
/**
 * discover.mjs
 * Emit a structured Phase 0 project overview: scripts, version, inferred
 * gates, git hooks, enforcement config, and which doc files are present.
 * Run from the project root. Analytical work (feature pattern, design system)
 * is still done by the agent reading source files.
 */
import { readFileSync, existsSync, readdirSync } from 'node:fs';

function readJSON(path) {
  try { return JSON.parse(readFileSync(path, 'utf8')); } catch { return null; }
}

const pkg = readJSON('package.json');
const scripts = pkg?.scripts ?? {};
const deps = { ...pkg?.dependencies, ...pkg?.devDependencies };

// Framework / toolchain detection
const detect = (map) =>
  Object.entries(map)
    .filter(([k]) => deps?.[k])
    .map(([k, label]) => label(deps[k]));

const frameworks = detect({
  react:   v => `React ${v}`,
  next:    v => `Next.js ${v}`,
  vue:     v => `Vue ${v}`,
  svelte:  v => `Svelte ${v}`,
  angular: v => `Angular ${v}`,
});
const buildTools = detect({
  vite:    v => `Vite ${v}`,
  webpack: v => `webpack ${v}`,
  esbuild: v => `esbuild ${v}`,
  turbo:   v => `Turborepo ${v}`,
  rollup:  v => `Rollup ${v}`,
});
const testRunners = detect({
  vitest:             v => `Vitest ${v}`,
  jest:               v => `Jest ${v}`,
  '@playwright/test': v => `Playwright ${v}`,
  mocha:              v => `Mocha ${v}`,
});

// Heuristic gate detection
const GATE_PATTERNS = ['test', 'lint', 'build', 'typecheck', 'type-check', 'check', 'tsc'];
const gateKeys = Object.keys(scripts).filter(k =>
  GATE_PATTERNS.some(p => k === p || k.startsWith(p + ':'))
);

// Git hooks
const hooks = [];
for (const dir of ['.githooks', '.git/hooks']) {
  if (existsSync(dir)) {
    try { readdirSync(dir).forEach(f => hooks.push(`${dir}/${f}`)); } catch { /* ignore */ }
  }
}

// .claude/settings.json enforcement
const settings = readJSON('.claude/settings.json');
const preHooks = (settings?.hooks?.PreToolUse ?? [])
  .flatMap(h => (h.hooks ?? []).map(hk => hk.command));
const allowList = settings?.permissions?.allow ?? [];

// Docs
const DOCS = ['CLAUDE.md', 'AGENTS.md', 'README.md', 'DESIGN.md', 'PRODUCT.md'];

// Output
const lines = [
  '## Project Discovery',
  '',
  `**Version:** ${pkg?.version ?? 'unknown'}`,
  `**Framework:** ${frameworks.length ? frameworks.join(', ') : 'not detected'}`,
  `**Build tool:** ${buildTools.length ? buildTools.join(', ') : 'not detected'}`,
  `**Test runner:** ${testRunners.length ? testRunners.join(', ') : 'not detected'}`,
  `**TypeScript:** ${deps?.typescript ? `yes (${deps.typescript})` : 'no'}`,
  '',
  '### npm Scripts',
  ...Object.entries(scripts).map(([k, v]) => `- \`${k}\`: \`${v}\``),
  '',
  '### Suggested Gates',
  gateKeys.length
    ? `\`${gateKeys.map(s => `npm run ${s}`).join(' && ')}\``
    : 'None detected — inspect scripts above and confirm with the user.',
  '',
  '### Git Hooks',
  ...(hooks.length ? hooks.map(h => `- \`${h}\``) : ['- none found']),
  '',
  '### Enforcement (.claude/settings.json)',
  ...(preHooks.length
    ? ['PreToolUse hooks:', ...preHooks.map(h => `  - \`${h}\``)]
    : ['- no PreToolUse hooks configured']),
  ...(allowList.length
    ? ['Allow list:', ...allowList.map(e => `  - \`${e}\``)]
    : []),
  '',
  '### Docs',
  ...DOCS.map(d => `- ${d}: ${existsSync(d) ? '✓' : '✗'}`),
];

console.log(lines.join('\n'));
