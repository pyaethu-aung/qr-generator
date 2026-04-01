# Feature Specification: Custom QR Shapes

**Feature Branch**: `023-custom-qr-shapes`  
**Created**: 2026-04-01  
**Status**: Draft  
**Input**: User description: "I want to add options to change the \"eye\" shape (square, rounded, or custom shapes) and the \"pixel\" pattern."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Change Eye Shapes (Priority: P1)

As a user, I want to change the "eye" (position detection pattern) shapes of my QR code to square, rounded, or other custom designs so that the QR code matches my brand.

**Why this priority**: Customizing the most prominent parts of a QR code drives user engagement and solves the main requirement.

**Independent Test**: Can be fully tested by selecting different "eye" shape options and verifying that the QR code preview accurately updates the corner patterns.

**Acceptance Scenarios**:

1. **Given** the QR generator interface is open, **When** the user selects "Rounded" for the eye shape, **Then** the QR code preview updates to reflect rounded position detection patterns.
2. **Given** a generated QR code with a custom eye shape, **When** the code is scanned with a standard QR reader, **Then** it will successfully decode the underlying text or URL.

---

### User Story 2 - Customize Pixel Pattern Shapes (Priority: P2)

As a user, I want to change the pattern of the inner pixels (the body of the QR code) to variations like dots or rounded geometric shapes, so the overall design feels unique.

**Why this priority**: Enhances the overall visual aesthetic, providing value alongside the eye shape customization.

**Independent Test**: Can be independently tested by changing the data pixel style in the interface and verifying the preview updates accordingly.

**Acceptance Scenarios**:

1. **Given** the QR generator interface, **When** the user selects the "Dots" style for the pixel pattern, **Then** the main body of the QR code renders as circular dots instead of standard squares.
2. **Given** a customized pixel pattern, **When** the user exports the QR code, **Then** the downloaded image perfectly matches the stylized preview.

### Edge Cases

- What happens if the selected combination of eye shape and pixel pattern compromises scannability?
- How does the system handle high-density QR codes (long URLs) where dots might become too small to read cleanly?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow users to select an "eye" shape style from a predefined list (including Square and Rounded).
- **FR-002**: System MUST allow users to select a "pixel" pattern style for the primary QR code body (including standard squares and dots).
- **FR-003**: System MUST update the real-time preview of the QR code instantly when shape or pattern options are modified.
- **FR-004**: System MUST ensure that chosen styling options are preserved when downloading the QR code as a PDF or image format.
- **FR-005**: All newly introduced form elements for styling MUST be keyboard-accessible and comply with WCAG accessibility guidelines.

### Key Entities

- **QR Design Configuration**: Holds the current selections for eye shape and pixel pattern style.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can successfully generate and download a QR code with customized eyes and pixels in under 30 seconds.
- **SC-002**: 100% of generated QR codes with non-standard eye and pixel shapes retain their scannability and effectively resolve via standard mobile camera readers.
- **SC-003**: The user interface for selecting shapes introduces less than 50ms of additional latency to the real-time preview rendering.

## Assumptions

- Custom shape rendering can be achieved purely via frontend libraries without requiring server-side image processing.
- The standard Error Correction Levels are robust enough to maintain QR readability when standard square dots are reshaped.
