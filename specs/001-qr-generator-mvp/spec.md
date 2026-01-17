# Feature Specification: QR Code Generator MVP

**Feature Branch**: `001-qr-generator-mvp`
**Created**: 2026-01-15
**Status**: Draft
**Input**: User description: "Build a web-based QR Code Generator application..."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Manual QR Generation (Priority: P1)

As a user, I want to click a button to generate the QR code after entering my text, so that I can control when the code is created and avoid flashing updates while typing.

**Why this priority**: Core functionality of the application. Without this, the app serves no purpose.

**Independent Test**: Can be tested by opening the page, typing in the input field, clicking "Generate", and observing the visual QR code appear.

**Acceptance Scenarios**:

1. **Given** the application is loaded and input is empty, **When** I view the page, **Then** no QR code is visible (or a placeholder/empty state is shown) and the "Generate" button is disabled.
2. **Given** I am on the main page, **When** I type "Hello World" into the input field and click "Generate", **Then** a valid QR code representing "Hello World" appears in the preview area.
3. **Given** I have typed text but not clicked "Generate", **When** I check the preview, **Then** the QR code does not appear (or shows the previous state).
4. **Given** I type a string that is not a valid URL format (e.g., "google com"), **When** the input loses focus or after clicking "Generate", **Then** a warning message "Invalid URL format" appears, but the QR code is generated.

---

### User Story 2 - Download QR Assets (Priority: P1)

As a user, I want to download the generated QR code as a PNG or SVG file, so that I can use it in my designs or print materials.

**Why this priority**: Users need to export the result to verify usability outside the browser.

**Independent Test**: Can be tested by generating a QR code and clicking download buttons, then verifying the downloaded files open in an image viewer.

**Acceptance Scenarios**:

1. **Given** a QR code is visible, **When** I click "Download PNG", **Then** a `.png` file is downloaded to my device containing the currently displayed QR code.
2. **Given** a QR code is visible, **When** I click "Download SVG", **Then** a `.svg` vector file is downloaded to my device containing the currently displayed QR code.
3. **Given** the input field is empty, **When** I view the download buttons, **Then** they are disabled or hidden to prevent downloading empty/invalid files.

### Edge Cases

- What happens when text is extremely long? QR code should increase version (density) or show error if max limit reached.
- How does system handle non-ASCII input? Should encode properly (UTF-8).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a single text input field accepting any Unicode characters or URL strings.
- **FR-002**: System MUST validate if the input acts like a URL and display a non-blocking warning if malformed (while still generating the QR).
- **FR-003**: System MUST provide a "Generate" button that is disabled if input is empty.
- **FR-004**: QR code generation MUST happen strictly on client-side state; no data shall be sent to any remote server.
- **FR-005**: Preview MUST update only when the user explicitly triggers the "Generate" action.
- **FR-006**: System MUST generate standard PNG images (bitmap) for download.
- **FR-007**: System MUST generate standard SVG images (vector) for download.
- **FR-008**: Filenames for downloads SHOULD include a timestamp or sanitized content snippet (e.g., `qr-code-2026-01-15.png`).
- **FR-009**: The QR code image components MUST have an appropriate `alt` text attribute reflecting its content or function for accessibility.
- **FR-010**: Input fields and buttons MUST be navigable via keyboard (Tab/Enter).

### Non-Functional Requirements (Constraints)

- **NFR-001**: Initial page load must complete (Visual Complete) in under 1 second on 4G networks/modern devices.
- **NFR-002**: QR generation logic must not block the main UI thread for more than 50ms (avoid UI freezing).
- **NFR-003**: Zero-knowledge architecture: No user input is logged, stored, or transmitted to a backend.
- **NFR-004**: Must work on modern mobile browsers (iOS Safari, Android Chrome) and desktop browsers (Chrome, Firefox, Safari, Edge).
- **NFR-005**: Frontend-only implementation (HTML/CSS/JS bundled via Vite).
- **NFR-006**: Use `qrcode` or `qrcode.react` libraries for generation.

### Key Entities

- **Input Data**: String entered by user.
- **QR Configuration**: Settings used for generation (currently fixed defaults: Size, ECC Level).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: User can generate and download a valid PNG QR code within 5 seconds of landing on the page.
- **SC-002**: Generated QR codes are scannable by standard mobile camera apps (iOS/Android).
- **SC-003**: Lighthouse Performance score > 90.
- **SC-004**: Network tab confirms 0 requests to backend APIs during generation (privacy verification).

## UI/UX Rules

### Layout
- Single-column layout on mobile
- Horizontal split view on desktop: inputs at right column

### Theme
- Light mode default (Black QR on White)
- Support light and dark model

### Responsiveness
- Fits visible area without scrolling on typical mobile screens

### Typography
- System font stack
- Clear hierarchy:
  - Page title
  - Section labels
  - Body text

## Assumptions

- Users are primarily online to load the page, but the app should function if connection drops after load.
- Default error correction level (Medium) and size (e.g., 256px) are sufficient for MVP.
- Browser support for `<a>` tag download attributes is available (standard in modern browsers).
