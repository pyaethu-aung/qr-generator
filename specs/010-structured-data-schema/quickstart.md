# Quickstart: SEOHead Component

## Purpose
The `SEOHead` component manages the document head metadata using `react-helmet-async`. It primary target is injecting the `SoftwareApplication` JSON-LD schema for search engines.

## Setup

1. **Install Dependency**:
   ```bash
   npm install react-helmet-async
   ```

2. **Wrap Application**:
   In `src/main.tsx`, wrap the `<App />` with `<HelmetProvider />`.

3. **Incorporate into App**:
   In `src/App.tsx`, render `<SEOHead />` at the top of the component tree.

## Maintenance

If the hosting URL changes, update the following:
- `FR-008` in `spec.md`
- `url` property in `SEOHead.tsx`
- Documentation in `README.md`

## Verification

### Local Validation
Run the test suite:
```bash
npm run test src/components/common/__tests__/SEOHead.test.tsx
```

### Production Validation
Paste the rendered HTML from the live site into the [Google Rich Results Test](https://search.google.com/test/rich-results).
