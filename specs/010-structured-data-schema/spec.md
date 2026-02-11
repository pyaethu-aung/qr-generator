# Feature Specification: Implement Structured Data

**Feature Branch**: `010-structured-data-schema`  
**Created**: 2026-02-11  
**Status**: Draft  
**Input**: User description: "Implement Structured Data: Add 'SoftwareApplication' JSON-LD schema markup to the main page. It must explicitly define the app as a 'UtilitiesApplication', price as '0', and operating system as 'Web' to target Google rich results."

## Clarifications

### Session 2026-02-11

- Q: Should we explicitly include a `url` property in the JSON-LD, and if so, what should it be? → A: Use `https://pyaethu-aung.github.io/qr-generator/` and add note to README to update it if the URL changes.
- Q: Should we reuse `./logo.png` for the JSON-LD `image` property? → A: Yes, reuse `./logo.png`.


## User Scenarios & Testing *(mandatory)*

### User Story 1 - Search Engine Rich Results (Priority: P1)

As a site owner, I want search engines to recognize the QR Code Generator as a software application so that it can be displayed with rich snippets in search results (price, categories, platform).

**Why this priority**: High priority as it improves visibility and click-through rate from search engines, directly impacting user acquisition.

**Independent Test**: Can be fully tested by inspecting the `index.html` source code for the presence of the correct JSON-LD object and validating it through the Google Rich Results Test tool.

**Acceptance Scenarios**:

1. **Given** the user visits the home page, **When** they view the page source, **Then** they should see a `<script type="application/ld+json">` tag containing the `SoftwareApplication` schema.
2. **Given** the page URL is submitted to the Google Rich Results Test, **When** Google parses the schema, **Then** it should identify the page as a valid `SoftwareApplication` with no critical errors.

### Edge Cases

- **Missing Meta Data**: If existing titles or descriptions are changed, the JSON-LD should ideally remain consistent or reflect those changes if dynamically linked (though for this task, static implementation is expected).
- **Duplicate Schema**: Ensure no other conflicting `SoftwareApplication` or `WebApplication` schema already exists on the page.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST include a JSON-LD script tag in the `<head>` of the main `index.html` file.
- **FR-002**: JSON-LD MUST use the `@type`: `SoftwareApplication`.
- **FR-003**: System MUST define `applicationCategory` as `UtilitiesApplication`.
- **FR-004**: System MUST define `operatingSystem` as `Web`.
- **FR-005**: System MUST include an `offers` object with `@type`: `Offer`, `price`: `0`, and `priceCurrency`: `USD`.
- **FR-006**: JSON-LD MUST include the `name` of the application ("QR Code Generator").
- **FR-007**: JSON-LD MUST include a `description` matching the meta description ("Generate high-quality QR codes instantly with real-time preview.").
- **FR-008**: JSON-LD MUST include a `url` property set to `https://pyaethu-aung.github.io/qr-generator/`.
- **FR-009**: `README.md` MUST be updated with a section documentation that the application URL in `index.html`'s JSON-LD needs to be updated if the hosting URL changes.
- **FR-010**: JSON-LD MUST include an `image` property set to `./logo.png`.


### Non-Functional Requirements

- **NFR-001**: Structured data MUST be valid according to Schema.org standards.
- **NFR-002**: The addition of the script tag MUST NOT negatively impact the page load speed or performance.
- **NFR-003**: The schema markup MUST be easily maintainable for future updates to pricing or application characteristics.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of the required fields (`applicationCategory`, `operatingSystem`, `price`) are correctly mapped in the JSON-LD.
- **SC-002**: Validation with [Google's Rich Results Test](https://search.google.com/test/rich-results) shows the `SoftwareApplication` type is detected and valid.
- **SC-003**: The HTML source code contains exactly one `application/ld+json` script tag for this feature.
