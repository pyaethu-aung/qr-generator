# Research: Mobile Layout & Responsiveness

## Decisions

### 1. Long Word Handling
**Decision**: Use `word-break: break-all` (Tailwind `break-all`) for containers holding raw data string (Hashes, URLs) and `word-break: break-word` (Tailwind `break-words`) for natural text.
**Rationale**: 
- URLs and Hashes do not have natural break points. On narrow screens (320px), they will overflow even with `overflow-wrap: break-word` if the string has no hyphens/slashes.
- `break-all` forces a break at any character, guaranteeing confinement.
**Alternatives**:
- `overflow-x-scroll`: Preserves string integrity but requires user interaction to read. Rejected per user preference for "Force Break" (Clarification Q1).

### 2. Form Layout Strategy
**Decision**: Use CSS Flexbox (`flex-col`) with a media query breakpoint at `md` (768px). Mobile = `flex-col`, Desktop = `flex-row` (or Grid).
**Rationale**:
- Standard responsive pattern.
- Maximizes horizontal space for inputs on mobile.
**Alternatives**:
- Shrinking labels: Hard to read on small screens.

### 3. Navigation Pattern
**Decision**: Simple, scalable header without hamburger menu.
- **Approach**: Maintain always-visible navigation elements (e.g., Logo, Title, Language Toggle) but scale their typography and spacing for mobile viewports.
- **Rationale**: 
  - Reduced complexity for the current feature set.
  - Avoids hiding critical controls (like Language) behind a click.
  - Simplifies accessibility by keeping all elements in the primary tab order.
**Implementation**: Update `Navbar.tsx` to handle responsive font sizes and padding instead of a toggle state.
