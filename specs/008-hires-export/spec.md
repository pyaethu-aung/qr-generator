# Feature Specification: High-Resolution Export Suite

**Feature Branch**: `008-hires-export`  
**Created**: 2026-02-05  
**Status**: Draft  
**Input**: User description: "Define the requirements for a High-Resolution Export Suite with format support (SVG, PDF, PNG), custom dimensions, accessible download UI, and error handling."

## Clarifications

### Session 2026-02-05

- Q: Should the export options appear in a modal dialog or a dropdown menu? → A: Modal dialog (centered overlay with backdrop)
- Q: Should users be able to enter custom pixel dimensions beyond the presets? → A: No, presets only (simpler UI)
- Q: Which format should be the default selection when the modal opens? → A: PNG (most common, best for web/digital)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Download QR Code as PNG (Priority: P1)

A user has generated a QR code and wants to download it as a PNG image at a specific resolution for use on their website or digital materials.

**Why this priority**: PNG is the most common format for web and digital use. This is the baseline export functionality that all other formats extend.

**Independent Test**: Can be fully tested by generating a QR code, selecting PNG format, choosing a size, and verifying the downloaded file dimensions and content integrity.

**Acceptance Scenarios**:

1. **Given** a valid QR code is displayed, **When** the user opens the download modal and selects PNG format with 1000px size, **Then** a PNG file with 1000x1000 dimensions is downloaded.
2. **Given** a valid QR code is displayed, **When** the user selects 300 DPI preset, **Then** the PNG is exported at print-quality resolution.
3. **Given** the QR code field is empty, **When** the user attempts to open the download modal, **Then** the download option is disabled with an informative tooltip.

---

### User Story 2 - Download QR Code as SVG (Priority: P2)

A designer wants to download the QR code as a scalable vector graphic (SVG) for use in professional design tools or print materials where infinite scalability is required.

**Why this priority**: SVG provides maximum flexibility for professional use cases, making it the second most important format after PNG.

**Independent Test**: Can be fully tested by generating a QR code, selecting SVG format, downloading, and opening in a vector editor to verify scalability.

**Acceptance Scenarios**:

1. **Given** a valid QR code is displayed, **When** the user selects SVG format and downloads, **Then** a valid SVG file is saved that renders correctly in modern browsers and design software.
2. **Given** a valid QR code with custom colors, **When** downloading as SVG, **Then** the exported SVG preserves the exact colors and styling.
3. **Given** the user selects SVG format, **When** viewing the export modal, **Then** the dimension selector is hidden as SVG is resolution-independent and infinitely scalable.

---

### User Story 3 - Download QR Code as PDF (Priority: P3)

A user preparing print materials needs a print-ready PDF containing the QR code at specific dimensions or DPI for professional printing.

**Why this priority**: PDF is essential for print workflows but is a more specialized use case than PNG or SVG.

**Independent Test**: Can be fully tested by generating a QR code, selecting PDF format with print DPI, downloading, and verifying the PDF opens correctly with proper dimensions.

**Acceptance Scenarios**:

1. **Given** a valid QR code is displayed, **When** the user selects PDF format with 300 DPI, **Then** a properly formatted PDF is downloaded suitable for professional printing.
2. **Given** a valid QR code with custom dimensions, **When** downloading as PDF, **Then** the PDF contains the QR code at the specified size.

---

### User Story 4 - Accessible Download Modal (Priority: P2)

A user navigating with a keyboard or screen reader needs to access the download options through an accessible interface.

**Why this priority**: Accessibility is mandatory per constitution. This story runs parallel to P2 as it affects how users interact with all download functionality.

**Independent Test**: Can be tested using keyboard-only navigation and screen reader software to verify full functionality without a mouse.

**Acceptance Scenarios**:

1. **Given** a user navigating with keyboard only, **When** they Tab to the download button and press Enter, **Then** the download modal opens with focus trapped inside.
2. **Given** a screen reader user, **When** the download modal is open, **Then** all options are properly announced with clear labels and instructions.
3. **Given** an open download modal, **When** the user presses Escape or clicks outside, **Then** the modal closes and focus returns to the download button.

---

### Edge Cases

- What happens when the user selects an extremely large dimension (e.g., 10000px)? → System caps at a reasonable maximum with user notification.
- How does the system handle export during slow network conditions? → Progress indicator shown; export completes locally before any network operations.
- What if the QR code content contains special characters? → All content is properly encoded across all export formats.
- What happens on mobile devices with limited download capabilities? → System uses appropriate mobile APIs (share sheet) or direct download.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a **modal dialog** (centered overlay with backdrop) accessible from the main QR code view for export options.
- **FR-002**: System MUST support export in PNG, SVG, and PDF formats.
- **FR-003**: Users MUST be able to select from preset dimension options (500px, 1000px, 2000px) for **PNG and PDF** formats only. SVG format does not display dimension options as it is resolution-independent. Custom input is not supported.
- **FR-004**: Users MUST be able to select DPI presets (72 DPI for screen, 150 DPI standard print, 300 DPI for high-quality print) **for PDF format only**.
- **FR-005**: System MUST validate that QR code content is non-empty before enabling export options.
- **FR-006**: System MUST preserve QR code styling (colors, patterns) in all export formats.
- **FR-007**: System MUST provide clear error messages when export fails.
- **FR-008**: Download modal MUST be fully keyboard navigable with proper focus management.
- **FR-009**: All format options and controls MUST have appropriate ARIA labels for screen readers.
- **FR-010**: Download modal MUST be responsive and usable on mobile devices.
- **FR-011**: PNG format MUST be pre-selected as the default when the export modal opens.

### Non-Functional Requirements

- **NFR-001**: UI MUST be fully functional and consistent across desktop/mobile and major browsers (Chrome, Safari, Firefox, Edge).
- **NFR-002**: System MUST adhere to responsive design principles for all UI components.
- **NFR-003**: All UI features MUST be planned and implemented with dark/light theme support from the start; default theme MUST match system preference; user theme choice MUST be persisted in browser storage.
- **NFR-004**: React components MUST be audited against `vercel-react-best-practices` skill; UI/UX decisions MUST adhere to `web-design-guidelines` skill (WCAG accessibility + responsive layouts). **All components MUST include appropriate ARIA attributes.**
- **NFR-005**: Every utility function in `src/utils/` MUST have a corresponding unit test file (Vitest/Jest).
- **NFR-006**: Export operations MUST complete within 3 seconds for standard dimensions on typical hardware.

### Key Entities

- **ExportFormat**: Represents the available output formats (PNG, SVG, PDF) with their respective configuration options.
- **ExportDimensions**: Represents size configuration including pixel dimensions and DPI settings.
- **ExportPayload**: The generated file ready for download, including format metadata and blob content.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can complete a QR code export in under 5 seconds from clicking download to receiving the file.
- **SC-002**: All three export formats (PNG, SVG, PDF) produce valid, scannable QR codes that decode correctly.
- **SC-003**: 100% of interactive elements in the download modal are accessible via keyboard navigation.
- **SC-004**: Screen reader users can complete the full download flow without assistance.
- **SC-005**: Export functionality works correctly on mobile devices (iOS Safari, Android Chrome) via appropriate download or share mechanisms.
- **SC-006**: Zero validation-preventable errors occur (i.e., users cannot export empty/invalid QR codes).

## Assumptions

- The existing QR code preview component provides access to the underlying canvas or SVG element for export.
- Browser APIs for file download (Blob, download attribute, or Web Share API for mobile) are sufficient without server-side processing.
- PDF generation can be handled client-side using existing or new libraries.
- Maximum export dimension will be capped at 4000px to prevent browser memory issues.

**Technical Note - DPI and File Size:**

DPI (Dots Per Inch) controls the **physical print size**, not the file size. When exporting a 2000px QR code as PDF:

- **All DPI settings produce identical file sizes** because they embed the same 2000×2000px PNG image
- **DPI determines the page size** in the PDF, which controls how large the QR code prints:
  - **72 DPI** → 2000px ÷ 72 = 27.78 inches (large print, screen quality)
  - **150 DPI** → 2000px ÷ 150 = 13.33 inches (medium print, standard quality)
  - **300 DPI** → 2000px ÷ 300 = 6.67 inches (small print, high quality)
- **Higher DPI = smaller physical print size = better quality** at that size
- To change file size, users must change the **dimension** (500px, 1000px, 2000px), not the DPI
