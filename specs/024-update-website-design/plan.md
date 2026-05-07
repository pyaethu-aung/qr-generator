# Implementation Plan: Update Website Design

**Branch**: `024-update-website-design` | **Date**: 2026-05-07 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `specs/024-update-website-design/spec.md`

## Summary

Update the visual design of the QR Generator web app to match `design.pen` for both desktop and mobile viewports, covering both light and dark themes. Changes are UI-only — no business logic, no data model changes. The work spans icon library integration, component restyling (navbar, controls, preview, footer), responsive layout adjustments, and accessible markup corrections.

## Technical Context

**Language/Version**: TypeScript 5.9 + React 19  
**Primary Dependencies**: Tailwind CSS v4, clsx, tailwind-merge (existing); `lucide-react` (new — icon set)  
**Storage**: localStorage (theme/locale persistence — no change)  
**Testing**: Vitest + Testing Library (jsdom); coverage threshold ≥ 85%  
**Target Platform**: Modern desktop + mobile browsers (Chrome, Safari, Firefox, Edge)  
**Project Type**: Web application (SPA)  
**Performance Goals**: No measurable regression; theme switch transition ≤ 150 ms  
**Constraints**: No hard-coded hex values in component classes; semantic tokens only. All changes must keep `npm run test && npm run lint && npm run build` passing.  
**Scale/Scope**: ~10 component files + their test files

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|---|---|---|
| I. Code Quality | ✅ | No dead code; tokens enforced; existing patterns followed |
| II. Testing (NON-NEGOTIABLE) | ✅ | All changed components have existing tests; tests will be updated and added |
| III. UX Consistency | ✅ | Design changes standardise icons, labels, and layout |
| IV. Performance | ✅ | CSS transitions only; no runtime cost |
| V. Architecture & Structure | ✅ | Files stay in existing directories; no new folders |
| VI. Execution Discipline | ✅ | Build + test after every task |
| VII. Cross-Platform & Browser | ✅ | Responsive breakpoints tested on mobile and desktop |
| VIII. Theme Support | ✅ | Dark/light tokens used throughout; transition on theme switch |
| IX. Skill-Driven Workflow | ✅ | /commit-message and /create-pr used per CLAUDE.md |

No violations. No complexity tracking needed.

## Project Structure

### Documentation (this feature)

```text
specs/024-update-website-design/
├── plan.md              ← this file
├── research.md          ← Phase 0 output
├── data-model.md        ← Phase 1 output
├── contracts/
│   └── component-api.md ← Phase 1 output
└── tasks.md             ← Phase 2 output (/speckit-tasks)
```

### Source Code (files touched by this feature)

```text
package.json                                         ← add lucide-react
index.html                                           ← add Geist Mono font
src/index.css                                        ← adjust transition to 150ms; replace entire
                                                       color token palette with warm earthy system
                                                       sourced from design.pen variables

src/components/Layout/Layout.tsx                     ← remove radial sky-blue gradient overlay
src/components/Navigation/Navbar.tsx                 ← hide subtitle on mobile; circular icon btns
src/components/common/ThemeToggle.tsx                ← circular 36px, lucide sun/moon SVG
src/components/common/LanguageToggle.tsx             ← circular 36px, lucide globe SVG

src/components/feature/qr/QRGenerator.tsx            ← card radius/padding/gap; hero gap;
                                                       remove sky/fuchsia/indigo gradient blobs
src/components/feature/qr/QRControls.tsx             ← EC pills; pixel pills; color boxes;
                                                       generate btn + icon; download btns + icon
src/components/feature/qr/QRPreview.tsx              ← tall inset preview; share btn below

src/App.tsx                                          ← footer: h-16, py-6; remove py-8/py-16/py-20
                                                       from <main> so hero controls its own top spacing

Tests updated:
src/components/common/__tests__/ThemeToggle.test.tsx
src/components/common/__tests__/LanguageToggle.test.tsx
src/components/feature/qr/__tests__/QRControls.test.tsx
src/components/feature/qr/__tests__/QRPreview.test.tsx
```

**Structure Decision**: Single web-app project. All changes stay within `src/`. No new directories.

---

## Phase 0 — Research

*See [research.md](./research.md) for full findings.*

### Key Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Icon library | `lucide-react` | Matches icon family used in design.pen; tree-shakeable; actively maintained |
| Geist Mono loading | Google Fonts `<link>` in `index.html` | Zero build complexity; already using a CDN approach for other assets |
| Theme transition scope | CSS `transition-colors` on `:root` + `body` | Existing 200ms → adjust to 150ms; no JS required |
| EC Level control | Pill row (4 buttons) | Matches design; better discoverability than a `<select>` for 4 fixed options |
| Pixel Pattern control | Pill toggle (2 buttons) | Matches design; replaces current `<select>` |
| Eye Shape control | Styled `<select>` dropdown | Keeps existing behaviour; design shows dropdown, not pills |
| Color picker box | Color circle + `<input type="color">` hidden behind | Preserves native picker; matches design's circle-preview + hex label pattern |
| Download btn placement | Keep in `QRControls` (already there) | Move from "Download Formats" section (with divider) to inline with Generate btn |

---

## Phase 1 — Design & Contracts

### Gap Analysis: Current vs Design

#### Navbar

| Element | Current | Target |
|---|---|---|
| Theme toggle | Emoji button, `rounded-lg`, 36×36 | Lucide `sun`/`moon` SVG, `rounded-full`, 36×36, `border-border-subtle` |
| Language toggle | Text pill ("EN"), `rounded-lg` | Lucide `globe` SVG, `rounded-full`, 36×36, `border-border-subtle` |
| Subtitle | Always visible | `hidden sm:block` (hidden on mobile) |
| Padding | `py-3 sm:py-5 px-4 sm:px-6 lg:px-8` | `py-4 px-12` (16/48 px) |
| aria-labels | ✅ present | Verify both icon btns have correct labels |

#### Hero

| Element | Current | Target |
|---|---|---|
| Eyebrow gap | `mt-2` | `gap-3` in flex column (12px) |
| Top spacing | `py-8 sm:py-16 lg:py-20` on `<main>` in `App.tsx` + `pt-16` on hero div = 96–144px total | Remove `py` from `<main>`; hero div's `pt-16` (64px) is the sole top spacing, matching design |

#### Color Tokens

| Element | Current | Target |
|---|---|---|
| `surface` (light) | `#ffffff` | `#F3EBE2` warm beige |
| `action` | `#4f46e5` indigo | `#D4916E` terracotta |
| `surface` (dark) | `#020617` cool near-black | `#1A1612` warm near-black |
| `action` (dark) | `#38bdf8` sky blue | `#D4916E` terracotta (same as light) |
| All surface/text/border tokens | Cool blue/slate palette | Warm earthy palette from `design.pen` variables |

#### Decorative Gradients

| Element | Current | Target |
|---|---|---|
| `Layout.tsx` | Radial sky-blue gradient overlay on entire page | Remove — design has flat surface background |
| `QRGenerator.tsx` | Sky/fuchsia/indigo blurred blob decorations | Remove — absent from design |

#### Main Card

| Element | Current | Target |
|---|---|---|
| Corner radius | `rounded-[32px]` | `rounded-xl` (12px) |
| Padding | `p-4 sm:p-6` | `p-8` (32px uniform) |
| Column gap | `gap-8 lg:gap-10` | `gap-10` (40px) |

#### QRControls

| Element | Current | Target |
|---|---|---|
| EC Level | `<select>` dropdown | Pill row: L 7% / M 15% / Q 25% / H 30% |
| Pixel Pattern | `<select>` dropdown | Pill toggle: Square / Dots |
| Color picker | Color swatch overlay + hex label | Inset box (44px), color circle + monospace hex |
| Generate button | `<Button>` no icon | Full-width 48px, fully-rounded, zap icon + label |
| Download buttons | Below divider, no icon | Below Generate, 44px, download icon + label, no divider |
| Container | `rounded-2xl border bg-surface-raised/40 p-4` | Remove container; fields are flush in left column |

#### QRPreview

| Element | Current | Target |
|---|---|---|
| Preview area | Compact card with QR + buttons | Tall inset box: `h-[536px]` desktop / auto mobile, centered QR card |
| QR card | Canvas inside a padded card | White `bg-white rounded-lg p-4` card, 220px, centered |
| Share button | Inside preview card, `rounded-full` action style | Below preview area, `rounded-xl`, secondary style, `share-2` icon |
| Download button | Inside preview card | Moved to QRControls |

#### Footer

| Element | Current | Target |
|---|---|---|
| Padding | `py-8` | `py-6 h-16` |

#### Theme Toggle Transition

| Element | Current | Target |
|---|---|---|
| Duration | 200ms on `:root` | 150ms on `:root` and `body` |

---

*See [contracts/component-api.md](./contracts/component-api.md) for changed prop signatures.*
