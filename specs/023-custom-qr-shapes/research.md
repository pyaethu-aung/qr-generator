# Phase 0: Research (Custom QR Shapes)

## Objective
Determine the best technical approach for rendering predefined geometric shapes (diamond, leaf, hexagon) along with dot "pixels" while preserving real-time preview latency (< 50ms) and without violating the Constitution.

## Findings: Custom Shape Rendering

- **Issue**: Standard components from `qrcode.react` do not provide a native API to inject complex SVG paths (like hexagons or leaves) specifically for the three distinct position-detection "eyes" while also maintaining separate styles for the data pixels.
- **Approach**: The underlying utility `qrcode` exposes a `.create(data, options)` method resulting in a raw bit matrix (a 2D array of light/dark modules). 
- **Solution Strategy**: Build a dedicated, pure functional renderer in `src/utils/qrShapeRenderer.ts`. This utility parses the `qrcode` matrix, detects the bounds of the three positioning eyes, and generates precise React SVG elements. The data payload sections are distinct and can be iteratively drawn as circles (dots) or standard squares.

## Decision: Pure Functional Matrix Parser & SVG Builder
**Chosen Option**: Parse native `qrcode` matrix data into custom SVG nodes.
**Rationale**: 
1. **Performance**: Avoids importing large styling libraries, ensuring we easily meet the < 50ms render target.
2. **Testability**: Parsing the matrix and outputting generic paths is a pure functional process, making it perfectly aligned with the non-negotiable `src/utils/` unit-testing constitution rule.
3. **Control**: Exposes exact matrix dimensions (`qr.modules.size`), allowing deterministic detection of "dense/risky" payloads to trigger the required UI warning defined in our Edge Cases specification.

## Alternatives Considered
- **Adopting `qr-code-styling`**: A popular library supporting heavy customization.
  - *Rejected*: Adds unnecessary bloat to the Vite bundle when we already use `qrcode.react`. Re-writing our existing PDF export pipelines to support this library would introduce too much regression risk.

## Post-Implementation Finding: SVG `shape-rendering` Scope

**Discovery**: Setting `shape-rendering="crispEdges"` on the `<svg>` root element disables anti-aliasing for the entire document, including the eye paths. This is desirable for axis-aligned square data modules (prevents sub-pixel blurring) but harmful for any curved or diagonal geometry.

**Impact**: All non-square eye shapes (Rounded, Diamond, Leaf, Hexagon) rendered with visible jagged edges at preview size.

**Resolution**: `shape-rendering="crispEdges"` must be scoped to the data-module `<path>` element only. Eye paths should inherit the default `auto` rendering, which enables anti-aliasing for smooth curves and diagonals.
