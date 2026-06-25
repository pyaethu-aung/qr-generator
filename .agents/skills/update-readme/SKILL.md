---
name: update-readme
description: Use after any change worth documenting (new feature, new skill, config change, or breaking change). Updates README.md to reflect the change, or creates it if missing.
metadata:
  version: "1.1.0"
model: sonnet
allowed-tools: Bash(git log:*) Bash(git diff:*) Bash(git status:*) Bash(ls:*) Glob Read Write Edit
---

# README Update Rules

Follow these rules when updating or creating README.md.

## Understand what changed

Determine the full scope of the change, not just the last commit. The README
update often lands as its own commit after a multi-commit feature, so inspect
the working tree and everything on this branch, not only `HEAD~1..HEAD`:

```!
git log --oneline -10
```

```!
git status --short
```

```!
git diff --stat
```

```!
git diff main...HEAD --stat 2>/dev/null || git diff master...HEAD --stat 2>/dev/null || true
```

---

## 1. Decide if README.md needs updating

Update README.md when the change involves any of:

- A new feature, skill, command, or tool a user would discover through the README
- A changed or removed public interface, option, or behaviour
- A new installation or setup step
- A breaking change
- A new section of the project (new directory, new subsystem)

**Skip** for changes that are internal only: refactors, test fixes, CI tweaks, comment edits, or anything a user of the project would never notice.

If the change does not warrant a README update, stop and tell the user why.

---

## 2. Read existing README.md

If README.md exists, read it in full before making any changes:

- Identify which section(s) the change belongs in
- Match the existing tone, heading style, and formatting
- Do not restructure or rewrite sections unrelated to the change
- No em dashes in prose (project convention): use commas, colons, or
  parentheses instead

If README.md does not exist, create one from scratch using the structure in §4.

---

## 3. Scope of edits

- **Add** content for new features or skills
- **Update** content for changed behaviour or options
- **Remove** content for deleted features; do not leave stale documentation
- **Never** rewrite the whole file for a small change; edit only the relevant section(s)
- **Keep it user-facing.** The README documents what a user of the project
  sees and does. Architecture, conventions, and internals belong in
  `CLAUDE.md` / `AGENTS.md`; design tokens and component specs in `DESIGN.md`.
  Do not duplicate those here.
- **Keep links valid.** If you add, rename, or remove a section, update any
  in-page anchor links or table-of-contents entries that point to it.

---

## 4. README structure (when creating from scratch)

Use this structure as a starting point; adapt to what the project actually contains:

```markdown
# <project name>

<one-sentence description of what the project does>

## <primary feature or section>

<description>

## Installation

<install steps>

## Usage

<usage instructions>
```

---

## 5. Confirm before writing

After drafting the changes, show the user a summary:

```
Action:   update / create
File:     README.md

Sections affected:
  <section name> — <what changes and why>
  ...

Proceed? (yes / edit / cancel)
```

- **yes**: write the changes
- **edit**: ask what to change, revise, and show the summary again
- **cancel**: stop without writing anything

Do not write any files until the user explicitly confirms.
