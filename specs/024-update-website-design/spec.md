# Feature Specification: Update Website Design

**Feature Branch**: `024-update-website-design`
**Created**: 2026-05-06
**Status**: Draft
**Input**: User description: "I want to update the website design for both desktop and mobile view based on @design.pen. It contains both light and dark theme."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Desktop Layout Matches Design (Priority: P1)

A visitor opens the QR generator on a desktop browser and sees a two-column card layout (Settings on the left, Live Preview on the right) with a navbar, hero section, and footer — exactly as designed in `design.pen` for the light theme.

**Why this priority**: The desktop layout is the primary view in the design file and the most commonly used viewport. All other stories depend on the card layout being correct.

**Independent Test**: Can be fully tested by loading the app in a ≥1440 px browser window and verifying every section (navbar, hero, card columns, footer) against the design screenshots. Delivers a complete, visually correct desktop experience.

**Acceptance Scenarios**:

1. **Given** a desktop viewport (≥1024 px wide), **When** the page loads, **Then** the navbar shows the ✨ logo, title, subtitle, a circular theme-toggle button, and a circular language-toggle button.
2. **Given** a desktop viewport, **When** the page loads, **Then** the hero section shows the "QUICK & EASY" eyebrow, the h1 heading, and the descriptive subtitle, all center-aligned.
3. **Given** a desktop viewport, **When** the page loads, **Then** the main card renders as a two-column row (Configuration left, Preview right) with correct padding (32 px) and column gap (40 px).
4. **Given** a desktop viewport, **When** the page loads, **Then** the footer shows "Made with ♡ — QR Code Generator" centered with a top border.

---

### User Story 2 - Configuration Controls Styled Correctly (Priority: P1)

A user interacting with the Settings column sees properly styled inputs, pill selectors, color pickers, the Generate button, and download buttons — matching the design spec for both light and dark themes.

**Why this priority**: These controls are the core interactive elements. Incorrect styling breaks perceived quality and usability.

**Independent Test**: Can be tested by inspecting each control in both light and dark mode against the design without running any QR generation logic.

**Acceptance Scenarios**:

1. **Given** the Settings column is visible, **When** the user views it, **Then** the Content input (44 px tall, rounded) shows the placeholder "Enter URL or text..." in disabled text color.
2. **Given** the Error Correction row, **When** M is the active selection, **Then** the M pill has the `$action` background and `$action-fg` text; all others use `$surface-inset` with `$text-secondary` text.
3. **Given** the color picker row, **When** rendered in light mode, **Then** Foreground defaults to #000000 and Background to #FFFFFF, each showing a color circle + monospace hex label.
4. **Given** the Eye Shape field, **When** rendered, **Then** a dropdown box shows "Square" with a chevron-down icon aligned to the right.
5. **Given** the Pixel Pattern row, **When** Square is active, **Then** the Square pill uses `$action` fill and the Dots pill uses `$surface-inset`.
6. **Given** the Generate button, **When** rendered, **Then** it is full-width, 48 px tall, fully rounded, filled with `$action`, and (in dark mode) includes a `zap` icon before the label.
7. **Given** the download row, **When** rendered, **Then** PNG and SVG buttons are equal-width, styled as secondary (raised surface + subtle border), and (in dark mode) include a `download` icon.

---

### User Story 3 - Preview Column Styled Correctly (Priority: P2)

A user sees the Live Preview column with a large inset preview area displaying the QR card, and a Share QR Code button below.

**Why this priority**: The preview is the primary output area. Getting it right is important but depends on the left column being stable.

**Independent Test**: Can be tested by checking the preview panel in isolation — no QR generation needed, just visual correctness of the container and the placeholder QR card.

**Acceptance Scenarios**:

1. **Given** the Preview column, **When** rendered on desktop, **Then** the preview area is a large inset box (rounded corners, subtle border) centered both vertically and horizontally around a 220×220 px white QR card.
2. **Given** the Share button below the preview area, **When** rendered, **Then** it shows a `share-2` icon and the label "Share QR Code" centered, styled as a secondary surface button.

---

### User Story 4 - Dark Theme Applied Correctly (Priority: P2)

A user toggles to dark mode and sees the entire UI switch to the dark theme — background, surfaces, text, borders, and buttons — matching the dark frame in `design.pen`.

**Why this priority**: Dark mode is a core feature; mismatched tokens or missing dark styles degrade the experience for dark-mode users.

**Independent Test**: Can be tested by toggling to dark mode and comparing each section against the dark theme screenshots.

**Acceptance Scenarios**:

1. **Given** dark mode is active, **When** the page renders, **Then** the page background, navbar, card, and all inputs use the dark-mode semantic tokens (`$surface`, `$surface-overlay`, `$surface-inset`, etc.).
2. **Given** dark mode, **When** the color picker defaults are shown, **Then** Foreground displays #FFFFFF and Background displays #0F172A.
3. **Given** dark mode, **When** the navbar theme-toggle button is shown, **Then** it displays the `moon` icon instead of `sun`.

---

### User Story 5 - Mobile Layout is Responsive (Priority: P2)

A user opening the app on a mobile browser sees a readable, single-column layout where the configuration and preview stack vertically without overflow or clipping.

**Why this priority**: Mobile responsiveness is explicitly required. The current design is desktop-first; mobile layout must be derived and implemented.

**Independent Test**: Can be tested by resizing to 375–430 px wide (typical phone viewport) and verifying no horizontal scroll, no clipped elements, and readable text.

**Acceptance Scenarios**:

1. **Given** a mobile viewport (<768 px wide), **When** the page loads, **Then** the card columns stack vertically (Settings above Preview) with no horizontal overflow.
2. **Given** a mobile viewport, **When** the page loads, **Then** the card wrapper removes the 170 px horizontal padding so the card uses full viewport width with appropriate smaller margins.
3. **Given** a mobile viewport, **When** the page loads, **Then** the navbar collapses or wraps gracefully — logo/title remain readable and icon buttons remain tappable (≥36×36 px touch target).
4. **Given** a mobile viewport, **When** the page loads, **Then** all form controls (inputs, pills, dropdowns, buttons) are full-width and have adequate tap targets (≥44 px tall).

---

### Edge Cases

- What happens when the viewport is between tablet widths (768–1024 px)? → Layout should gracefully transition, ideally still two-column if width permits.
- How does the hero section scale on very narrow screens? → Text should wrap without overflow; font size may reduce.
- What happens if a user's system preference is dark mode and they haven't manually toggled? → System preference should be respected as the initial theme.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The UI MUST implement the navbar layout with branding (left) and icon buttons (right) as specified in `design.pen`.
- **FR-002**: The UI MUST implement the hero section with eyebrow text, heading, and subtitle center-aligned.
- **FR-003**: The UI MUST implement the two-column card (Settings + Preview) on desktop viewports.
- **FR-004**: The UI MUST implement all Settings controls (Content input, Error Correction pills, Foreground/Background color pickers, Eye Shape dropdown, Pixel Pattern pills, Generate button, PNG/SVG download buttons) with the correct visual styling.
- **FR-005**: The UI MUST implement the Preview column with an inset preview area containing the QR card and a Share QR Code button below.
- **FR-006**: The UI MUST implement the footer with the required text and top border.
- **FR-007**: The UI MUST apply dark-mode semantic tokens correctly when the `.dark` class is active on `<html>`, matching the dark frame in `design.pen`.
- **FR-008**: The UI MUST be responsive — on mobile viewports the card columns MUST stack vertically and horizontal overflow MUST be eliminated.
- **FR-009**: All spacing, corner radii, and typography MUST use semantic design tokens (CSS custom properties) — no hard-coded hex values in component classes.
- **FR-010**: The theme-toggle button MUST display the `sun` icon in light mode and the `moon` icon in dark mode.
- **FR-011**: The Generate button MUST include a `zap` icon in dark mode; download buttons MUST include `download` icons in dark mode.
- **FR-012**: The color picker fields MUST display the hex value in a monospace font.

### Key Entities

- **Design Token**: A CSS custom property (e.g., `$surface`, `$action`) that maps to a concrete color per theme mode. All color references in components must go through tokens.
- **Theme Mode**: Either `light` or `dark`, driven by the `.dark` class on `<html>` and persisted to `localStorage`.
- **Viewport Breakpoint**: The pixel threshold (≈768 px) at which the layout switches from two-column to single-column.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A developer can open the app at any desktop viewport ≥1024 px wide and visually confirm all sections (navbar, hero, card, footer) match `design.pen` without referencing any other document.
- **SC-002**: Every interactive control in the Settings column is reachable and visually correct on a 375 px wide mobile viewport without horizontal scrolling.
- **SC-003**: Toggling between light and dark mode produces a complete theme switch — no element retains a hard-coded color that conflicts with the active theme.
- **SC-004**: All existing Vitest tests continue to pass (≥85% coverage maintained) after the design changes are applied.
- **SC-005**: `npm run lint` and `npm run build` both pass with zero errors after implementation.

## Assumptions

- The existing semantic design token CSS custom properties (`$surface`, `$action`, `$text-primary`, etc.) are already defined in `src/index.css`; this feature updates component markup and styles to consume them correctly, not redefine the tokens.
- Mobile layout is a derived, single-column adaptation of the desktop design — no separate mobile design frame exists in `design.pen`.
- The `download` icon and `zap` icon are already available via the lucide icon set already used in the project.
- The Geist Mono font (used for hex color values in the dark theme's color pickers) is either already loaded or will be added as part of this feature.
- Tablet viewports (768–1023 px) will use the same two-column layout as desktop, possibly with reduced horizontal padding.
- Existing QR generation, share, and export functionality must remain fully working after design updates — this spec covers only visual/layout changes.
