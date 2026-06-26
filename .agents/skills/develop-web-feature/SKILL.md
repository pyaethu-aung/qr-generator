---
name: develop-web-feature
description: "Develop, design, and ship a website feature end-to-end with /impeccable: shape, build, e2e specs, gate, audit, critique, fix, open a PR, and release. Portable across web projects. Use when asked to add, build, craft, or design a new feature."
metadata:
  version: "1.4.0"
argument-hint: "[--auto] The feature to build (e.g. 'Calendar event content type')"
allowed-tools: Bash(npm*) Bash(npx*) Bash(node*) Bash(git:*) Bash(gh:*) Bash(grep*) Bash(ls*) Bash(cat*) Read Write Edit Task
---

# Develop a feature with /impeccable

The playbook for taking a web feature from idea to release using the
`/impeccable` design workflow. It is not a runnable driver: the "driver" is the sequence of
skill invocations and gate commands below.

The loop, in one line: **learn → shape → build → gate → audit + critique →
fix → re-evaluate ↻ → commit → docs → PR**, then ship: **merge → version-bump
PR → merge → tag + release**. Critique browser-tests the live app; the
audit/critique → fix cycle repeats until no P0/P1 findings remain and the score
plateaus. Publishing the release (not merging) is what deploys.

This skill is portable. The *workflow* and *disciplines* are the same in every
project; the *specifics* (gate commands, file layout, conventions, enforcement)
differ, so Phase 0 installs the one hard dependency (`/impeccable`) and
discovers the rest before any code is written. A concrete worked example from
one project is at the end, as illustration only: yours will differ.

## Autonomous mode (reduce human-in-the-loop)

By default the workflow pauses in several places: `craft` confirms scope,
`critique` asks what to fix, and the commit and PR skills each confirm. When
the request asks for a hands-off run (it says "autonomous" or "hands-off", or
passes `--auto`), collapse those into a single review at the PR:

- **Skip craft's scope confirmation** when the prompt is already a complete
  spec, or run one silent `/impeccable shape` pass and proceed. Phase 0's rule
  still holds: if the scope is genuinely ambiguous, ask once rather than build
  the wrong thing.
- **Run `audit` and `critique` non-interactively:** feed both passes' findings
  into the Phase 5 loop, which fixes P0/P1 by severity. Audit already prompts
  for nothing; critique just skips its closing question.
- **Surface what was not fixed.** P0/P1 from both passes are fixed in the loop;
  the remaining P2/P3 are deliberately not auto-fixed, but must not vanish in a
  hands-off run. List them in the PR body under a **Deferred (P2/P3)** heading,
  drawn from the critique snapshot in `.impeccable/critique/` and the audit
  report, so you can triage them at review.
- **Commit and open the PR without prompting:** route through
  `/commit-message --yes` and `/create-pr --yes` (same format and skill token,
  no confirmation pause).
- **Stop at the opened PR.** Do not auto-merge and do not publish the release;
  PR approval, merge, and the release publish stay human (Phase 7). The PR is
  your single review surface.

Autonomous mode removes only the in-flow confirmations. The gates, the fix
loop, atomic commits, and the disciplines are unchanged.

## Phase 0: Set up

### Ensure dependencies

**`/impeccable` is required.** The whole workflow is built on it. If it is not
already available in the project, install it from the project root:

```bash
npx impeccable skills install
```

then, inside the AI tool:

```
/impeccable init
```

Use the CLI, not a hand copy of the skill file: it installs the design skill
**and** its anti-pattern detector engine. A copy-only or symlink-only install
leaves `/impeccable critique`'s detector failing with "bundled detector not
found." Do not proceed without `/impeccable`.

**`/commit-message` and `/create-pr` are optional.** They standardize commits
and PRs, but the workflow completes without them. If the project has them (or
you choose to add them: they are single-file skills, drop each `SKILL.md` into
`.claude/skills/<name>/`), Phase 6 routes through them. If the user chooses not
to install them, Phase 6 falls back to doing the commit and PR directly, with
the same conventions inlined there.

### Learn this project (do not skip)

**First, check for a cached baseline.** This skill caches its Phase 0 findings
per project in your OS user cache directory — `$XDG_CACHE_HOME/develop-web-feature/`
(falling back to `$HOME/.cache/develop-web-feature/`) on Linux, or
`$HOME/Library/Caches/develop-web-feature/` on macOS — under a filename keyed to
this repo's absolute path. If that file exists, read it and trust it: skip the
discovery below, re-deriving only the entries whose source has changed. One
thing is never cached — the **green baseline**: always re-run the gates once on
a clean tree, because it is a live fact (dependency or coverage drift), not a
static answer. If there is no cache file, discover everything from scratch and
write it at the end of this phase (see "Cache the baseline").

Before building, find this project's answers. Most live in `CLAUDE.md` /
`AGENTS.md`, `README`, `package.json` scripts, the lint config, and
`.claude/settings.json`. Establish:

- **The gates:** the exact commands that must pass before a PR (test? lint?
  typecheck? build? a coverage threshold?). Run them once now on a clean tree
  so you know the green baseline.
- **The feature pattern:** how an existing comparable feature is structured.
  Find the newest one and copy its file layout (types, logic, state, UI,
  i18n, tests). Match it; do not invent a new shape.
- **Enforcement:** are commits/PRs routed through skills or hooks? Is direct
  push to the default branch blocked? What is the branch-naming convention?
- **The design system:** token file, component primitives, color/spacing
  rules, accessibility bar, localization. `/impeccable` reads PRODUCT.md /
  DESIGN.md if present; honor them.
- **What is NOT a gate:** many repos carry a formatter or doc backlog that
  fails on files you never touched. Confirm which checks actually block merge
  so you do not chase noise.

If any of these is ambiguous, ask rather than guess.

### Cache the baseline

Write what you found to the OS user cache so the next run skips rediscovery:

```bash
CACHE_DIR="${XDG_CACHE_HOME:-$HOME/.cache}/develop-web-feature"   # macOS: "$HOME/Library/Caches/develop-web-feature"
mkdir -p "$CACHE_DIR"
KEY="$(basename "$PWD")-$(printf '%s' "$PWD" | shasum | cut -c1-8)"   # repo name + path hash, collision-safe
# write the findings to "$CACHE_DIR/$KEY.md"
```

It lives outside the repo on purpose: a regenerable cache, never committed, no
`.gitignore` entry needed. Record the five findings above plus the date you
captured them, and keep it terse — a cheat sheet, not documentation. Treat an
entry as stale and re-derive it when its source moves: the gates when
`package.json` scripts or the lint config change; the feature pattern when a
newer comparable feature lands. The gate run itself is never cached — confirm
green on a clean tree every time. The "Worked example" below shows the shape of
a filled-in baseline.

## Phase 1: Shape before building

```
/impeccable craft <feature>
```

`craft` runs a shape-and-confirm step first: it proposes scope and waits.
Confirm or adjust before any code is written. The confirmation is the cheapest
place to catch a scope mismatch. (Use `/impeccable shape <feature>` for
planning only, without the build.)

## Phase 2: Build

**Branch first.** Create a feature branch off the default branch
(`<type>/<slug>`, e.g. `feat/event-mode`) before the first commit; never commit
to the default branch.

Follow the feature pattern from Phase 0. Match the surrounding code: use the
project's primitives and design tokens, not ad-hoc markup or hard-coded
values. Honor the design system and `/impeccable`'s shared laws (no em dashes
in copy, accessibility bar, real translations where the project is localized).

**Write e2e specs for the feature as you build it.** Every user-facing scenario
introduced or changed must have a corresponding Playwright spec in `e2e/`. The
spec is the proof that the feature works end-to-end in a real browser, not just
that units pass in jsdom. Keep specs interaction-driven: navigate, fill, click,
assert — one scenario per test, role-based selectors first, `data-testid` where
a role is ambiguous. A well-written spec must fail on the code before your
change and pass after. Place specs alongside the implementation commit; do not
leave them for the end.

**Commit as you go.** When a logical chunk of the implementation is gate-green
(Phase 3), commit it through `/commit-message`, one logical change per commit,
rather than batching at the end. The implementation, each Phase 5 fix, and the
Phase 6 docs all land as their own commits, so the history tracks every step.

Treat each of the following as its own commit boundary — do not bundle them:

- A new or substantially rewritten component
- A new or substantially rewritten hook
- A new utility module and its test
- A new or updated type definition
- An e2e spec (or a batch of specs for one scenario group)
- An i18n / locale key addition
- A doc update (README, architecture docs, design docs)

If a single task touches more than two of the above categories, split it before
committing: stage one category, commit, then the next. Check the project's
`CLAUDE.md` for project-specific commit boundary guidance.

## Phase 3: Gate

Run the project's gate commands (from Phase 0). All must pass before a PR;
this is the only bar that blocks merge. Iterate on one test file at a time
while building, and preview in a browser if the project has a dev server.

## Phase 4: Evaluate

```
/impeccable audit <feature>
```

Technical pass: a11y, performance, theming, responsive, anti-patterns. It is
static: it reads source and scores it, with no browser and no user prompts.

```
/impeccable critique <feature>
```

Design pass: heuristics scored out of 40, persona walkthroughs, an AI-slop
verdict, and a deterministic detector run. It persists a snapshot and prints
a score trend across runs. It drives a browser and ends by asking you what to
fix, so it stays in the foreground.

### Under Claude Code: overlap the two passes (optional)

Both passes are read-only and ignore each other's output, so they can run at
the same time. They are asymmetric, so the split is one-sided:

- **Offload `audit` to a background subagent** (the `Task` tool). It asks
  nothing and returns a report you fix from, so it is safe to run headless.
- **Keep `critique` in the foreground.** It drives a browser and calls
  `AskUserQuestion`, neither of which an autonomous subagent can do, and
  it already fans out its own Assessment A/B subagents internally: nesting it
  inside a subagent would force critique back to its slower sequential
  fallback.

Merge both finding sets before Phase 5. **Never run two browser-driving
`/impeccable` commands at once against one app:** they contend on the
dev-server port and browser resources. Only critique drives the browser here
(audit is static), which is the point of the split. Harnesses without parallel
subagents run the two passes sequentially, in either order.

### Critique must drive the real UI, not just source

Critique earns its keep by judging what actually renders and behaves, so under
Claude Code run it against the live app, not source alone, using the
**Playwright CLI** (one-time install in the README):

1. Start the dev server (`npm run dev`) in the background; note its URL.
2. Screenshot each key state with `npx playwright screenshot --viewport-size=...`
   across **both themes (light and dark)** and **mobile and desktop** widths.
3. For real flows (the clicks, typing, and submits a user performs, plus the
   edge cases the personas would hit), write a short spec under `e2e/` and run
   it with `npx playwright test`. Feed the screenshots and any failures into
   the critique alongside its detector output.

This runs on the main thread; the audit subagent stays static and touches no
browser. If the project ships a `/verify` skill, route the interaction pass
through it.

## Phase 5: Fix and loop until clean

This is a loop, not a one-shot pass. Work one finding (or one tightly related
group) at a time so each fix is its own commit:

1. **Fix by severity (P0/P1 first), driven by the findings.** Both audit and
   critique tag every issue with a severity and a **Suggested command**; run
   the command each finding names instead of free-handing the fix. Typical
   routings:
   - performance / LCP / bundle -> `/impeccable optimize`
   - responsive breakage or overflow -> `/impeccable adapt`
   - confusing copy or error text -> `/impeccable clarify`
   - spacing, rhythm, hierarchy -> `/impeccable layout`
   - clutter, cognitive overload, or too many visible options -> `/impeccable distill`
   - generic type -> `/impeccable typeset`; flat color -> `/impeccable colorize`
   - missing i18n, edge cases, error states -> `/impeccable harden`
   - empty or first-run states -> `/impeccable onboard`
2. **Re-run the gates** (Phase 3): the refine commands changed code, so
   `test && lint && build` must pass again.
3. **Commit that fix on its own** once green: a focused `fix(<area>): ...` per
   finding (or close group), so the history shows what each change addressed.
   Route through `/commit-message` (`--yes` in autonomous mode).
4. **Re-evaluate** (Phase 4): re-run `audit` and the browser-tested `critique`
   to refresh the finding list.

Repeat until **no P0 or P1 findings remain and the critique score plateaus**
(expect a few points per pass). Stop when the remainder is genuine P2/P3
polish, not at a perfect 40.

Once the loop settles, **promote anything reusable before the final polish.**
If the feature introduced a component, token, or pattern that belongs in the
shared design system rather than this feature alone, run `/impeccable extract`
to pull it into the project's primitives (here, `src/components/common/` and
the token file), then re-run the gates and commit it. Skip this when the
feature added nothing shareable. It is the cheapest moment to catch a
feature-local duplicate of what should be a shared primitive.

Then run `/impeccable polish` as the closing pass, re-run the gates one final
time, and commit it.

## Phase 6: Commit, document, and PR

**Precondition: the Phase 5 loop has converged.** Gates green, no open P0 or
P1 audit or critique finding, and the full e2e suite passes. Run the e2e suite
now (`npx playwright test`, or the project's `test:e2e` script) and fix any
failure before opening the PR — a red e2e test is a broken user flow, not a
cosmetic issue. If anything is still red or unresolved, return to Phase 5; do
not open a PR around an open P0/P1 or a failing e2e spec.

The implementation and every P* fix are already committed incrementally on the
feature branch (Phases 2 and 5), one logical change each. Never bypass hooks
with `--no-verify`. Add the doc commits, then open the PR last so it carries
every commit:

1. **The feature and its fixes** are already committed (Phases 2 and 5);
   nothing to re-commit here.
2. **The docs the change moved, each as its own commit, before the PR.** Skip
   any whose trigger did not fire; most features touch one or two, not all
   three:
   - **README** (`/update-readme`) when user-visible behavior changed.
   - **CLAUDE.md / AGENTS.md** when architecture, conventions, commands, or the
     directory layout changed (a hand-written conventional commit): what a
     future contributor or agent needs to know.
   - **DESIGN.md** (`/impeccable document`) when the design system changed (new
     tokens, primitives, or patterns, often right after `extract`); reconcile
     its output with the file's hand-written notes rather than overwriting them.

   This matches the project's own history, where `docs:`, `chore(claude):`, and
   `docs(design):` commits land separately from the `feat:` commit.
3. **The PR**, opened last so it carries the feature and the doc commits.

**If `/commit-message` and `/create-pr` are installed,** route through them;
they enforce the format and confirm before acting.

**If they are not** (the project opted out), do it directly with the same
discipline:

- *Commit.* Conventional Commits: an imperative subject of 50 characters or
  fewer (hard limit 72), a blank line, then a body wrapped at 72 explaining
  what changed and why. One logical change per commit; split unrelated concerns
  into separate commits.

  ```bash
  git add <files for this change>
  git commit
  ```

- *PR.* Push the branch and open a PR whose body has a short summary and a test
  plan (the gate commands you ran and their result):

  ```bash
  git push -u origin feat/<slug>
  gh pr create --title "<type>: <summary>" --body "<what changed, why, test plan>"
  ```

## Phase 7: Merge, version, and release

Phase 6 ends with the feature PR open; the rest is the release lifecycle. Two
points are **human gates** (you cannot approve your own PR), and the release
publish is an outward action to confirm before running.

1. **Merge the feature PR.** After a human approves it and CI is green, merge it
   (`gh pr merge`, per the repo's merge style). Merging to `main` does not deploy
   anything on its own (see step 5).
2. **Decide the version bump** from what merged, by Conventional Commit type:
   a breaking change -> **major**, `feat` -> **minor**, `fix` and other
   user-affecting patches -> **patch**. This repo is pre-1.0 (`0.14.0` now), so
   by convention breaking changes ride in **minor** until `1.0.0` is cut
   deliberately: most releases are minor (a new content type or view) or patch
   (a bug fix).
3. **Open the version-bump PR**, separate from the feature, because `main` is
   protected. On a `chore/release-<X.Y.Z>` branch, set `version` in
   `package.json` to `<X.Y.Z>`, then commit and open the PR through the same
   `/commit-message` and `/create-pr` route as Phase 6, with the subject
   `chore(release): bump version to <X.Y.Z>` (matching the repo's history).
4. **Merge the version-bump PR** after approval (same human gate as step 1).
5. **Tag and publish the release** on the merged `main`; the tag must match the
   bumped version:

   ```bash
   gh release create v<X.Y.Z> --target main --generate-notes
   ```

   **Confirm before running this:** publishing the release is the deploy
   trigger. `deploy.yml` (GitHub Pages) and `docker-publish.yml` (GHCR image +
   Trivy scan) both fire on `release: published`, not on a tag push, so
   `gh release create` is what ships the site and the image; a bare `git tag` +
   push deploys nothing. After publishing, confirm both workflows go green (a
   high/critical CVE makes Trivy fail the image publish).

## Universal disciplines (portable, every project)

- **Build only what the feature needs (YAGNI).** Implement the scope confirmed
  in Phase 1, nothing speculative: no unused props or options, no config flags
  or abstraction layers for callers that do not exist yet, no generality added
  "for later". The simplest thing that satisfies the feature and passes the
  gates wins; add structure when a second real caller actually arrives, not
  before. Applies to the feature's code, not to this workflow.
- **The gates are the merge bar, nothing else.** A clean formatter or a high
  critique score is not permission to skip them; a failing unrelated check is
  not a reason to stop.
- **Commit atomically.** One logical change per commit; split unrelated
  concerns into separate commits even within one feature.
- **Keep your diff legible.** Do not reformat or "fix" files your feature did
  not touch, even when a linter flags them project-wide.
- **Specifics live in three+ places.** Type systems, i18n registries, and
  config unions often require the same addition in several files; a value
  added in one place that fails the typecheck usually needs its sibling edits.
- **When a "clever" pattern fails the linter, prefer the plain one.** Modern
  React/TS lint rules reject many indirection tricks; the straightforward
  derived value is usually both correct and accepted.
- **Treat the detector as one signal.** `/impeccable critique`'s automated
  scan can be unavailable or noisy; weigh it alongside the design review, not
  above it.

## Worked example: qr-generator (illustration only)

What Phase 0 surfaced in one React + Vite + Tailwind project, to show the
*kind* of thing to look for. None of this is portable; yours will differ.

- **Gates:** `npm run test && npm run lint && npm run build`. Prettier was
  *not* a gate (a 286-file pre-existing backlog made `npm run format` fail on
  untouched files).
- **Feature pattern:** each QR "content mode" = a type union entry + a pure
  `buildXString` util + a `useXConfig` hook + an `XForm` component + parallel
  tests, wired into two files. Copying the newest mode was the fastest start.
- **i18n in three files:** a key needed adding to `en.json`, `my.json`, **and**
  both a `ControlStrings` interface and a `TranslationKey` union in
  `src/types/i18n.ts`, or lint/build failed.
- **Lint was React Compiler strict:** no `setState` in an effect, no ref
  access during render, `useCallback` wanted an inline function. Three
  separate rewrites came from these.
- **Enforcement:** `PreToolUse` hooks routed `git commit`/`gh pr create`
  through `/commit-message` and `/create-pr`; a `pre-push` hook blocked pushes
  to `main`; branches were `feat/<slug>`.
- **Design system:** warm token palette, a strict "three accent elements per
  view" economy, no em dashes, WCAG AA, English + Burmese.

## Installing this skill and its dependencies elsewhere

- **`/impeccable` (required):** from the target project root, run
  `npx impeccable skills install`, then `/impeccable init` inside the AI tool.
  It is the npm package `impeccable`; the CLI compiles the skill and installs
  the detector engine that `/impeccable critique` needs.
- **`/commit-message`, `/create-pr` (optional):** install with
  `npx skills add pyaethu-aung/skills --skill commit-message` (and
  `--skill create-pr`), or skip them to use Phase 6's direct fallback.
- **This skill:** `npx skills add pyaethu-aung/skills --skill develop-web-feature`
  (add `--global` to install it for every project).

## What this skill is not

A runnable driver. The browser-driving harness (start the dev server, click
through the UI, screenshot) lives inside `/impeccable critique`, which spins it
up itself (`/impeccable audit` is static: it reads and scores source, with no
browser). For a standalone way to
launch and drive a specific app, author a `run-<app>` skill with
`/run-skill-generator`.
