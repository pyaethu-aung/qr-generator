# Product

## Register

product

## Users

Non-technical everyday users who need a QR code in under a minute — for a restaurant menu, an event flyer, a link to share. They are not designers, but they care that the result looks good enough to use in a real context. They arrive with a URL or string, customize minimally, and leave with a file.

Secondary users: designers and small-business owners who want visual control (colors, patterns) and a clean export. Not the primary audience, but the product should not embarrass them.

## Product Purpose

A single-page QR code generator. The user pastes a URL or text, adjusts colors, error correction level, and pixel pattern, sees a live preview, and downloads or shares the result. Success means the user walks away with a QR code they're proud to use — not just one that works.

The Burmese localization (`my.json`) signals an intentional audience beyond English-speaking markets. Copy and layout must communicate clearly regardless of script.

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

WCAG AA. Keyboard navigable throughout. Screen-reader-friendly labels and roles. Sufficient contrast ratios on all text and interactive states — including the terracotta accent (`$action`) against both light and dark surfaces. Support `prefers-reduced-motion` for any transitions (the 150ms theme transition should respect it).
