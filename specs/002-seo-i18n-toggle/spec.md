# Feature Specification: QR site branding and bilingual toggle

**Feature Branch**: `feature/002-seo-i18n-toggle`  
**Created**: 2026-01-20  
**Status**: Draft  
**Input**: User description: "Set the website name as QR Code Generator. Add required metadata for SEO and accessibility. And support both English and Burmese. English should be the default one, and user choice will be stored locally for next time usage. Language toggle should be at the top-right corner."

## Clarifications

### Session 2026-01-20

- Q: Which locale code should be used for Burmese? → A: Use `my`.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Site identity and metadata (Priority: P1)

A visitor lands on the site and immediately sees the experience branded as "QR Code Generator" with matching document title and SEO metadata in the default language.

**Why this priority**: Clear branding and metadata are foundational for trust, discoverability, and accessibility.

**Independent Test**: Load the home page in a fresh session and verify the page title, hero heading, HTML `lang`, meta description, and Open Graph/Twitter metadata all present "QR Code Generator" in English.

**Acceptance Scenarios**:

1. **Given** a first-time visitor with no saved preferences, **When** they open the site, **Then** the document title, primary heading, and visible copy show "QR Code Generator" in English.
2. **Given** the landing page has loaded, **When** metadata is inspected, **Then** HTML `lang` is `en`, meta description is present, and Open Graph/Twitter title/description use the English branding.

---

### User Story 2 - Toggle language top-right (Priority: P1)

A visitor can switch between English and Burmese using a clearly visible toggle in the top-right corner, with full UI text updating immediately.

**Why this priority**: Language accessibility directly impacts usability for Burmese-speaking users.

**Independent Test**: Click the top-right language toggle to switch to Burmese and confirm all visible UI strings (navigation, headings, controls, helpers) display in Burmese without page reload.

**Acceptance Scenarios**:

1. **Given** the page is in English, **When** the visitor activates the top-right language toggle to Burmese, **Then** all visible labels, headings, and helper text switch to Burmese and the toggle remains keyboard-focusable.
2. **Given** the visitor switches to Burmese, **When** metadata is refreshed, **Then** document title and HTML `lang` reflect Burmese and screen readers announce Burmese content.

---

### User Story 3 - Persist language preference (Priority: P2)

A returning visitor sees the site in their previously selected language without reselecting it.

**Why this priority**: Persistence reduces friction for repeat visits and respects user choice.

**Independent Test**: Select Burmese, reload the page, and verify the site loads in Burmese automatically; clear local data and confirm the site defaults back to English.

**Acceptance Scenarios**:

1. **Given** a visitor selected Burmese previously, **When** they return or reload, **Then** the site initializes in Burmese and the toggle state matches the stored preference.
2. **Given** local storage is unavailable or cleared, **When** the visitor loads the site, **Then** it defaults to English without errors and allows switching languages.

### Edge Cases

- If local storage is blocked, unavailable, or cleared, the site defaults to English per session while still allowing language switching.
- Missing or invalid locale codes fall back to English without mixed-language UI fragments.
- Language changes update `lang` and metadata so screen readers and crawlers do not mis-pronounce or mis-index content.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The site MUST present the name "QR Code Generator" consistently in the document title, primary heading, and SEO metadata for the active language.
- **FR-002**: The site MUST include SEO metadata (title, meta description, canonical URL, Open Graph/Twitter tags) that align with the active language and reflect the "QR Code Generator" brand.
- **FR-003**: The document MUST set the HTML `lang` attribute to the active language and update it upon language changes to support accessibility and SEO.
- **FR-004**: The UI MUST support English (default) and Burmese (`my`) for all visible strings, including navigation, headings, controls, helper text, and accessibility labels.
- **FR-005**: The language toggle MUST be placed in the top-right of the viewport, be keyboard-focusable, have an accessible name announcing current/target language, and be discoverable on both desktop and mobile layouts.
- **FR-006**: Language switching MUST update visible text and key metadata without a full page reload and complete within 1 second of user action.
- **FR-007**: The system MUST persist the user’s selected language locally and automatically reapply it on subsequent visits; if local storage is unavailable, the site MUST fall back to English gracefully.
- **FR-008**: The system MUST avoid partial translations by falling back to English for any missing Burmese strings while logging gaps for remediation.

### Key Entities *(include if feature involves data)*

- **LocalePreference**: The active language code (`en` or `my`) stored locally for reuse on return visits.
- **LocalizedCopy**: Bundled text resources for English and Burmese covering all user-facing strings and accessibility labels.

### Assumptions

- Burmese translations for existing UI strings will be provided/approved by the product team.
- A single canonical URL exists for the landing page; language selection does not change the URL structure.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: First-time visitors see the site in English with document title and primary heading set to "QR Code Generator" in 100% of test runs.
- **SC-002**: Language toggle is reachable via keyboard and screen reader announces current language in 100% of accessibility checks; language switch completes within 1 second.
- **SC-003**: After selecting Burmese, 100% of visible UI strings (including labels/tooltips/aria text) render in Burmese without mixed-language fragments.
- **SC-004**: Stored language preference is reapplied on reload/return in 100% of sessions where local storage is available; when storage is unavailable, the site defaults to English without errors.
