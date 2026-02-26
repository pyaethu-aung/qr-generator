# Feature Specification: Semantic Design Token System

**Feature Branch**: `022-semantic-design-tokens`  
**Created**: 2026-02-25  
**Status**: Draft  
**Input**: User description: "Refactor the current light/dark theme implementation to use a semantic design token system instead of hardcoded Tailwind dark variants. Establish CSS variables in index.css (like --color-surface, --color-text-primary, --color-border-subtle) that adapt automatically to the active theme. Configure Tailwind v4 to map its utility classes to these variables using the @theme directive. Update all existing UI components (Button, Input, QRControls, etc.) to consume these new semantic classes. The end result must be visually identical to the current design but rely entirely on tokens, making it easy to maintain and extend for future themes. Ensure the existing Vitest coverage is maintained."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Theme Visually Unchanged After Refactor (Priority: P1)

A developer who works on the QR generator app loads the application in both light and dark modes and observes that the visual appearance is indistinguishable from the previous implementation — colours, spacing, shadows, and interactive states all look and behave the same.

**Why this priority**: Visual regression is the primary risk of this refactor. Confirming zero visible change is the baseline success condition that all other stories depend on.

**Independent Test**: Open the app in a browser, toggle between light and dark themes, and compare each page visually against the pre-refactor screenshots. All surfaces, text, borders, and button states must match exactly.

**Acceptance Scenarios**:

1. **Given** the application is in light mode, **When** any page is loaded, **Then** all surfaces, text colours, border colours, and interactive states appear identical to the pre-refactor light-mode design.
2. **Given** the application is in dark mode, **When** any page is loaded, **Then** all surfaces, text colours, border colours, and interactive states appear identical to the pre-refactor dark-mode design.
3. **Given** the user is on any page, **When** the theme is toggled between light and dark, **Then** colour transitions are smooth and immediate, with no flash of unstyled content.

---

### User Story 2 - Future Themes Can Be Added by Editing One Location (Priority: P2)

A developer wants to add a new "high-contrast" or "sepia" theme. With the semantic token system in place, they can define a new set of CSS variable overrides in `index.css` (one block, like `:root.high-contrast { ... }`) and the entire UI inherits those values without touching individual component files.

**Why this priority**: This is the primary maintainability goal of the refactor. If this story is not satisfied, the refactor provides no long-term benefit beyond the current state.

**Independent Test**: Add a temporary `:root.test-theme` block in `index.css` with obviously different colours, apply the class to the `<html>` element in the browser console, and verify that all UI components instantly reflect the new values without any component-level code changes.

**Acceptance Scenarios**:

1. **Given** a new CSS variable block is added in `index.css` for a new theme class, **When** that class is applied to the root element, **Then** all components render with the new token values without any component-level code changes.
2. **Given** the semantic token vocabulary is documented, **When** a developer adds a new component, **Then** they can express all light/dark styling using semantic tokens alone, without adding any `dark:` Tailwind variants.

---

### User Story 3 - Existing Tests Continue to Pass (Priority: P3)

A developer runs the existing Vitest test suite after the refactor and all tests pass without modification, confirming that no component behaviour, accessibility attributes, or rendered markup has changed.

**Why this priority**: The existing test suite is the automated safety net for this refactor. Maintaining full coverage ensures regressions are caught without requiring manual re-testing of every interaction.

**Independent Test**: Run `npm run test` (or equivalent) and confirm all tests exit with a 0 exit code and no skipped or failing specs.

**Acceptance Scenarios**:

1. **Given** the refactor is complete, **When** the Vitest suite is run, **Then** all previously passing tests continue to pass.
2. **Given** any component class names change from `dark:bg-slate-900` style utilities to semantic token utilities, **When** tests that query by class or style are run, **Then** those tests are updated to reflect the new class names while still validating the same visual intent.

---

### Edge Cases

- What happens when a user's browser or OS preference forces `prefers-color-scheme: dark` and no manual theme class is set?
- How does the system handle a CSS variable falling back to an undefined value if a future theme omits a token?
- What happens if a component receives an explicit inline `style` or `className` override that conflicts with a semantic token?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The stylesheet (`index.css`) MUST define a complete set of semantic CSS custom properties (e.g., `--color-surface`, `--color-text-primary`, `--color-border-subtle`) for the `:root` (light) context and override them inside `:root.dark` for the dark context.
- **FR-002**: Tailwind v4's `@theme` directive MUST be used to map Tailwind utility class names to the semantic CSS variables, so that utilities like `bg-surface` or `text-text-primary` resolve to the correct token value at runtime.
- **FR-003**: All existing UI components (Button, Input, Card, QRControls, QRPreview, ThemeToggle, ExportModal, DimensionSelector, FormatSelector, LanguageToggle, Toast) MUST have their hardcoded `dark:` Tailwind variant classes replaced with semantic token utilities.
- **FR-004**: The resulting rendered output in both light and dark mode MUST be pixel-identical (or imperceptibly close) to the pre-refactor state for every component.
- **FR-005**: No component file MUST contain `dark:` Tailwind variant utilities after the refactor, except where a `dark:` variant is genuinely irremovable without disproportionate effort (exceptions must be documented).
- **FR-006**: The existing CSS variable names used in `index.css` (`--bg-primary`, `--text-primary`, `--bg-secondary`, `--border-primary`) MUST be migrated to the new semantic naming convention; backward-compatibility aliases are acceptable during transition but must be removed before completion.
- **FR-007**: The `ThemeProvider` hook mechanism for applying the `.dark` class to `:root` MUST remain unchanged; only the CSS and component layer changes.
- **FR-008**: All existing Vitest tests MUST continue to pass after the refactor, with test files updated only where class name assertions need to reflect the new utility names.
- **FR-009**: The semantic token set MUST cover at minimum: page background, card/surface background, primary text, secondary/muted text, border (subtle and strong), interactive focus colour, primary action colour, and disabled state colours.

### Key Entities

- **Design Token**: A named CSS custom property that represents a semantic role (e.g., "surface background") rather than a raw colour value. Each token has a light-mode value and a dark-mode override.
- **Semantic Utility Class**: A Tailwind utility (e.g., `bg-surface`) whose value is mapped via `@theme` to a design token CSS variable, rather than a hardcoded colour.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All Vitest tests pass with 0 failures after the refactor completes.
- **SC-002**: A search for `dark:` Tailwind variant patterns across all component files returns 0 matches (excluding any documented exceptions).
- **SC-003**: The semantic token set is entirely defined in a single location (`index.css`) — adding or modifying a theme requires changes to only that one file.
- **SC-004**: Visual output of the application in light and dark modes is indistinguishable from pre-refactor screenshots, validated by a side-by-side comparison.
- **SC-005**: The number of component files touched during a hypothetical "add new theme" scenario is 0 (theme change only requires editing `index.css`).

## Assumptions

- The project uses Tailwind CSS v4 with the `@theme` directive available for mapping custom properties to utility classes.
- The existing `.dark` class on `:root` toggled by `ThemeProvider` is the sole mechanism for activating dark mode; media-query-based dark mode (`prefers-color-scheme`) is a separate future concern and is out of scope.
- Token naming will follow a `--color-<role>` convention (e.g., `--color-surface`, `--color-text-primary`, `--color-border-subtle`) rather than the existing `--bg-primary` / `--text-primary` naming, as the new naming is more scalable.
- The ExportModal and other components with complex internal styling will be updated using the same token approach as simpler components.
- Interactive states (hover, focus, active, disabled) will continue to be expressed via Tailwind utilities, but those utilities will resolve to token values rather than hardcoded colours.
- The `a` element colour in `index.css` currently uses `dark:text-indigo-400`; this will be migrated to a `--color-link` token.
