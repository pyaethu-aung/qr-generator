# Feature Specification: QR PNG share button

**Feature Branch**: `feature/003-qr-share-button`  
**Created**: 2026-01-23  
**Status**: Draft  
**Input**: User description: "I want to add share QR button at the bottom of generated QR code. That share button must share the PNG format of generated QR code, and share function should support any other standard photo sharing functions in both desktop and mobile."

## Clarifications

### Session 2026-01-23
- Q: What PNG export sizing rule should we use for sharing? → A: Export at the exact rendered preview dimensions (WYSIWYG).

## User Scenarios & Testing *(mandatory)*

<!--
  IMPORTANT: User stories should be PRIORITIZED as user journeys ordered by importance.
  Each user story/journey must be INDEPENDENTLY TESTABLE - meaning if you implement just ONE of them,
  you should still have a viable MVP (Minimum Viable Product) that delivers value.
  
  Assign priorities (P1, P2, P3, etc.) to each story, where P1 is the most critical.
  Think of each story as a standalone slice of functionality that can be:
  - Developed independently
  - Tested independently
  - Deployed independently
  - Demonstrated to users independently
-->

### User Story 1 - Share QR as PNG (Priority: P1)

As a user viewing a generated QR code, I can tap a share button placed directly under the QR preview to share the PNG image through my device's standard share sheet (desktop or mobile).

**Why this priority**: Sharing the QR image is the primary new value; without it the feature delivers no benefit.

**Independent Test**: Generate a QR code, tap the share button, choose a target app/device, and verify the recipient receives a PNG matching the current preview.

**Acceptance Scenarios**:

1. **Given** a QR code is generated and visible, **When** the user taps the share button under the QR preview, **Then** the native share sheet opens with a PNG attachment of the displayed QR.
2. **Given** the user selects a share target, **When** the share completes, **Then** the recipient (or target app) receives the PNG with the same content and styling as the preview.

---

### User Story 2 - Fallback when share unsupported (Priority: P2)

As a user on a device or browser that lacks native photo sharing, I can still save or copy the QR PNG via a fallback action exposed from the same share button flow.

**Why this priority**: Ensures the feature works across environments and avoids dead-end interactions.

**Independent Test**: Simulate or use a browser without native share support, tap the share button, and verify a fallback option allows saving/copying the PNG.

**Acceptance Scenarios**:

1. **Given** the environment does not support native sharing, **When** the user taps the share button, **Then** a fallback option (e.g., save/download or copy image) is shown and completes successfully.

---

### User Story 3 - Mobile photo sharing compatibility (Priority: P3)

As a mobile user, I can share the QR PNG to common photo-aware targets (messaging, gallery, files) with the image preserving clarity and size.

**Why this priority**: Mobile usage is a common QR scenario; compatibility reduces support risk.

**Independent Test**: On a mobile device, share the QR PNG to at least one messaging app and one files/photos destination, confirming the PNG renders without distortion.

**Acceptance Scenarios**:

1. **Given** a mobile device with messaging and photo apps installed, **When** the user shares the QR via the share button, **Then** the selected app receives a PNG that opens clearly at the expected resolution.

---

### Edge Cases

- Share button tapped before a QR is generated (should be disabled or prompt to generate first).
- User edits QR content, then immediately shares while generation is in progress (must share the latest rendered QR).
- Native share sheet denied or canceled by the user (should return gracefully without broken UI state).
- Offline or limited connectivity (sharing should still allow saving the PNG locally).
- Very rapid repeated taps on the share button (should debounce to prevent multiple dialogs).
- Large or high-error-correction QR leading to larger PNG size (ensure share still succeeds without corruption).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Display a share button directly beneath the generated QR preview, always visible when a QR exists.
- **FR-002**: When tapped, produce a PNG of the current QR state (including styling, size, and content) and initiate the device's standard share flow with that PNG attached as an image/photo payload.
- **FR-003**: Name the shared file descriptively (e.g., `qr-code.png`) and ensure the filename is consistent across desktop and mobile.
- **FR-004**: Provide a graceful fallback when native sharing is unavailable or fails: allow the user to save/download or copy the PNG without losing the current QR state.
- **FR-005**: Preserve image fidelity: the shared PNG MUST match the on-screen QR in resolution (WYSIWYG at rendered preview dimensions), colors, and error-correction choices visible in the preview.
- **FR-006**: On desktop, support standard photo-share equivalents (e.g., save to disk, copy image) initiated from the same share button interaction.
- **FR-007**: If sharing is canceled or errors, inform the user with a non-blocking message and leave the QR preview unchanged.

### Key Entities *(include if feature involves data)*

- **QR Image (PNG)**: Rendered QR code image including current user-selected parameters (content, size, styling, error correction); supplied to share targets.
- **Share Request**: A single user-initiated share action encapsulating the QR PNG payload and any user-selected target/app.

### Assumptions

- Supported environments include modern desktop and mobile browsers; when native share is absent, fallback download/copy is acceptable as a "share" equivalent.
- No additional text or link metadata is required beyond the PNG itself unless added later.
- PNG dimensions match the displayed preview size exactly; no separate high-res export is mandated.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can initiate and complete sharing the QR PNG in ≤3 user actions from the QR preview on both desktop and mobile.
- **SC-002**: 95% of share attempts on supported environments deliver a PNG that opens successfully without corruption or missing styling.
- **SC-003**: In environments lacking native share, 100% of users are presented a working fallback (save/download or copy) from the same share entry point.
- **SC-004**: Share initiation to completion (including fallback) finishes within 3 seconds for a standard QR on typical consumer devices.
- **SC-005**: Support requests related to "cannot share QR" remain ≤1% of total QR feature usage within the first release window.
