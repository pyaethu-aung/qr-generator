---
name: git-commit-discipline
description: Enforce Conventional Commits and the 50/72 rule for all Git commits. Use this skill when generating commit messages or committing code.
compatibility: Any project using Git
metadata:
  author: Antigravity
---

# Git Commit Discipline

This skill defines the strict rules and guidelines for creating Git commit messages. When asked to generate a commit message, or when making a commit on behalf of the user, you MUST follow these instructions precisely.

## 1. Conventional Commits Format

Every commit message must follow the Conventional Commits specification:

```text
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Allowed Types:
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `perf`: A code change that improves performance
- `test`: Adding missing tests or correcting existing tests
- `build`: Changes that affect the build system or external dependencies
- `ci`: Changes to CI configuration files and scripts
- `chore`: Other changes that don't modify `src` or `test` files
- `revert`: Reverts a previous commit

## 2. The 50/72 Rule

### Subject Line (The 50 Rule)
- Limit the subject line to **50 characters** or less (including the type prefix). This ensures it is not truncated in Git history views.
- Use the **imperative mood** (e.g., "Add feature" not "Added feature" or "Adds feature").
- Do **not** end the subject line with a period.
- Capitalize the first letter of the description (after the type/scope prefix).

### Body (The 72 Rule)
- Leave a **blank line** between the subject line and the body.
- Wrap all lines in the body at **72 characters** max.
- Use the body to explain **what** and **why**, vs. **how**. Focus on the context and reasoning for the change.

## 3. Best Practices & Recommendations (To Follow)

These recommendations elevate the quality of commits beyond just formatting rules:

1. **Atomic Commits**: Each commit should represent a single, indivisible unit of work. Do not mix unrelated changes (e.g., refactoring one component and fixing a bug in another) into the same commit. Break up large changes into smaller, logical steps.
2. **"Why" over "What"**: The code diff already shows *what* changed. Use the commit body to explain *why* the change was made, any constraints considered, or alternative solutions rejected.
3. **Issue References**: If the commit resolves or relates to a tracked issue, include it in the footer using keywords like `Fixes #123` or `Resolves #456`.
4. **Separate Formatting from Logic**: If you are fixing typos, reformatting code, and introducing a new feature, split these into multiple commits (e.g., `style: format codebase` then `feat: add new widget`). This makes history easier to review and revert if necessary.
5. **Execution Verification**: (Based on project Constitution) Ensure validation steps (e.g., `npm run test && npm run lint && npm run build`) pass *before* committing.

## Example of a Perfect Commit Message

```text
feat(auth): Add support for OAuth2 login

Implement OAuth2 flow for the login component to allow users to authenticate 
using third-party providers. This replaces the legacy Basic Auth method which 
was causing security vulnerabilities in recent audits.

- Add OAuth2 provider configuration
- Implement callback handling in generic auth hook
- Remove deprecated BasicAuthService

Fixes #204
```
