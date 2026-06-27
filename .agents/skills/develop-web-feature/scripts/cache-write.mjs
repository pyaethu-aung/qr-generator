#!/usr/bin/env node
/**
 * cache-write.mjs
 * Write Phase 0 findings (from stdin) to the project cache.
 * Also ensures .cache/develop-web-feature/ exists and is gitignored.
 * Run from the project root.
 *
 * Usage:
 *   echo "<findings markdown>" | node cache-write.mjs
 *   cat findings.md | node cache-write.mjs
 */
import { createHash } from 'node:crypto';
import { writeFileSync, mkdirSync, readFileSync, existsSync, appendFileSync } from 'node:fs';
import { basename } from 'node:path';

const cwd = process.cwd();
const key = `${basename(cwd)}-${createHash('sha1').update(cwd).digest('hex').slice(0, 8)}`;
const CACHE_DIR = '.cache/develop-web-feature';
const GITIGNORE_ENTRY = '.cache/develop-web-feature/';

mkdirSync(CACHE_DIR, { recursive: true });

// Auto-update .gitignore
if (existsSync('.gitignore')) {
  const lines = readFileSync('.gitignore', 'utf8').split('\n').map(l => l.trim());
  if (!lines.includes(GITIGNORE_ENTRY)) {
    appendFileSync('.gitignore', `\n${GITIGNORE_ENTRY}\n`);
    console.error(`[cache-write] Added ${GITIGNORE_ENTRY} to .gitignore`);
  }
} else {
  writeFileSync('.gitignore', `${GITIGNORE_ENTRY}\n`);
  console.error(`[cache-write] Created .gitignore with ${GITIGNORE_ENTRY}`);
}

// Read content from stdin
let content = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => { content += chunk; });
process.stdin.on('end', () => {
  const cacheFile = `${CACHE_DIR}/${key}.md`;
  writeFileSync(cacheFile, content);
  console.log(`[cache-write] Saved to ${cacheFile}`);
});
