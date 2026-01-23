# Functional Checklist: QR PNG share button

**Purpose**: Validate functional requirements for QR PNG sharing, with cross-platform coverage and share-sheet vs fallback flows
**Created**: 2026-01-23
**Feature**: [specs/003-qr-share-button/spec.md](specs/003-qr-share-button/spec.md)

## Requirement Completeness

- [ ] CHK001 Are native share flows defined for both mobile and desktop, including PWA-installed contexts? [Completeness, Spec §FR-002, §FR-006]
- [ ] CHK002 Are fallback behaviors (download/copy) specified for every environment where native share is absent or rejected? [Completeness, Spec §FR-004, §Edge Cases]
- [ ] CHK003 Is the share button availability/disabled state fully defined when no QR exists or generation is in progress? [Completeness, Spec §FR-001, §Edge Cases]

## Requirement Clarity

- [ ] CHK004 Is the PNG export sizing rule explicitly WYSIWYG with no hidden scaling or alternate resolution? [Clarity, Spec §FR-005, §Clarifications]
- [ ] CHK005 Is the filename requirement (`qr-code.png`) unambiguous across all share and fallback paths? [Clarity, Spec §FR-003]
- [ ] CHK006 Are user-facing responses to cancel/error states described (messaging type, non-blocking)? [Clarity, Spec §FR-007]

## Requirement Consistency

- [ ] CHK007 Do user stories, functional requirements, and edge cases agree on sharing the current rendered QR (not a stale/previous render)? [Consistency, Spec §User Story 1, §FR-002, §Edge Cases]
- [ ] CHK008 Are desktop “photo-share equivalents” (save/copy) consistent with mobile share expectations and success criteria? [Consistency, Spec §FR-006, §SC-001-§SC-003]

## Acceptance Criteria Quality

- [ ] CHK009 Do success criteria map to each primary flow (native share, fallback copy, fallback download) with measurable thresholds (≤3 actions, ≤3s, success rates)? [Acceptance Criteria, Spec §SC-001-§SC-004]
- [ ] CHK010 Is there a criterion ensuring low support issues for sharing (e.g., ≤1% tickets) and does it align with coverage targets? [Acceptance Criteria, Spec §SC-005]

## Scenario Coverage

- [ ] CHK011 Are cancel, denial, and error scenarios covered for both native share sheets and fallbacks, including user messaging? [Coverage, Spec §FR-004, §FR-007, §Edge Cases]
- [ ] CHK012 Are rapid repeated taps/debounced interactions addressed to prevent multiple dialogs? [Coverage, Spec §Edge Cases]
- [ ] CHK013 Is offline or limited-connectivity behavior defined (still allow local save/copy)? [Coverage, Spec §Edge Cases, §Assumptions]

## Edge Case Coverage

- [ ] CHK014 Are large/error-correction-heavy QR codes considered for PNG size and share reliability? [Edge Case, Spec §Edge Cases]
- [ ] CHK015 Is the “edit then immediately share” race handled to ensure the latest preview is shared? [Edge Case, Spec §Edge Cases]

## Non-Functional Requirements

- [ ] CHK016 Is the 3-second share completion budget enforced or testable across share and fallback flows? [Non-Functional, Spec §SC-004]

## Dependencies & Assumptions

- [ ] CHK017 Are capability detection rules for `navigator.share`, `canShare(files)`, clipboard image copy, and download fallback documented and aligned with requirements? [Dependencies, contracts/share.md §Client Capability Contract]

## Ambiguities & Conflicts

- [ ] CHK018 Are permission prompts/denials (e.g., clipboard permissions) addressed with expected UX? [Gap]
