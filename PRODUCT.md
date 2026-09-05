# Product

## Register

product

## Users

Non-technical everyday users who need a QR code in under a minute — for a restaurant menu, an event flyer, a link to share. They are not designers, but they care that the result looks good enough to use in a real context. They arrive with a URL or string, customize minimally, and leave with a file.

Secondary users: designers and small-business owners who want visual control (colors, patterns) and a clean export. Not the primary audience, but the product should not embarrass them.

## Product Purpose

A single-page QR code generator. The user pastes a URL or text, adjusts colors, error correction level, and pixel pattern, sees a live preview, and downloads or shares the result. Success means the user walks away with a QR code they're proud to use — not just one that works.

The product ships English and Spanish (`en.json`, `es.json`), at full key parity. Copy and layout must communicate clearly regardless of script, and the locale registry is additive by design so a further language needs no type edits. (An earlier revision of this document cited a Burmese `my.json` as evidence of audience intent; that file has never existed. The intent is real, the artifact was not.)

## Brand Personality

Warm, crafted, trustworthy. Approachable but polished — the kind of tool a designer would recommend to a non-designer. Not a developer tool. Not a SaaS product. A well-made thing.

Emotional goal: the user's reaction to the generated QR code should be "this actually looks good," not just "it worked."

## Anti-references

- **Generic SaaS / Tailwind UI kit** — Blue primary color, card grid, `rounded-xl` everywhere, assembled from a template. Interchangeable with any other tool.
- **Neon / cyberpunk / tech-dark** — Dark backgrounds with glowing accents. Signals "for developers," which excludes the primary audience.
- **Corporate enterprise tool** — Dense, gray, data-heavy. Designed for IT admins, not people running a small restaurant.
- **Overdesigned / maximalist** — Too many gradients, animations, layered effects. Feels like a portfolio piece rather than something useful.

## Design Principles

1. **The result is the product.** The QR code output is what the user came for. Every design decision — spacing, contrast, control layout — should serve the quality and confidence of what they walk away with. The UI is a means, not the end.

2. **Warmth without fuss.** The earthy palette and editorial typography signal that care went into this. But warmth does not mean decorative complexity. Restraint is how craft shows.

3. **Non-technical by default.** Options are present but never intimidating. Labels use plain language. The happy path is obvious on first glance. Power-user controls are reachable, not prominent.

4. **Earned polish.** Every detail that exists should earn its place. No side-stripe borders, no gradient text, no glass cards for atmosphere. Refinement comes from what is removed, not what is added.

5. **Cross-cultural clarity.** With English and Burmese support, copy and layout must communicate accurately when translated. No idioms that break in translation. No layouts that assume left-to-right text flow as fixed.

## Accessibility & Inclusion

WCAG AA, treated as a floor the token layer has to meet rather than something components patch case by case:

- **1.4.3 (text, 4.5:1)** across both themes, including placeholders, empty states and hints. `text-disabled` is reserved for genuinely inactive controls, which the criterion exempts.
- **1.4.11 (non-text, 3:1)** for the boundary of every interactive control. `border-strong` meets it; `border-subtle` is decorative and must never be a control's only edge.
- **1.4.4 / 1.4.10 (resize and reflow)** to 200% text with nothing clipped. `Layout` hides horizontal overflow, so any layout that overflows loses content instead of gaining a scrollbar: wrap, don't overflow.
- **1.4.13 (content on hover or focus)** dismissible with Escape and hoverable without vanishing.
- Keyboard navigable throughout, with a visible focus ring on every focusable element and a ring offset bound to the page surface.
- `prefers-reduced-motion` respected as an **opt-in** (`@media (prefers-reduced-motion: no-preference)` and `motion-safe:`), never a global `0.01ms` kill that destroys useful feedback.
