# Research: Structured Data (JSON-LD) implementation

## Decision: Use `react-helmet-async` for JSON-LD injection

### Rationale
`react-helmet-async` is the standard solution for managing document head in React applications. While direct DOM manipulation is possible, `react-helmet-async` provides a more declarative, React-friendly API and handles asynchronous updates correctly (especially important for SEO and potential SSR in the future).

### Alternatives considered
- **Direct DOM Manipulation**: Rejected because it's less declarative and harder to manage in a component lifecycle compared to Helmet.
- **Static implementation in `index.html`**: Rejected because some of the data (like the feature list and URL) might eventually become dynamic, and the user specifically requested a component approach.

## JSON-LD Schema: `SoftwareApplication`

Based on Schema.org and Google's documentation for [Software Application rich results](https://developers.google.com/search/docs/appearance/structured-data/software-app):

### Required Fields for Google:
- `name`: "QR Code Generator"
- `offers`: { "@type": "Offer", "price": "0", "priceCurrency": "USD" }

### Recommended Fields:
- `applicationCategory`: "UtilitiesApplication"
- `operatingSystem`: "Web"
- `url`: "https://pyaethu-aung.github.io/qr-generator/"
- `image`: "./logo.png"

### Custom User Requirements:
- `featureList`: "Client-side generation, Zero-backend, SVG Export"

## Testing Strategy

### Rationale
Testing `react-helmet-async` components can be tricky because they inject data into the document head, which is outside the React root.

### Approach
Use `@testing-library/react` and `vitest`. We can wrap the component in `HelmetProvider` and then use `document.querySelector('script[type="application/ld+json"]')` to verify the presence and content of the script tag in the `jsdom` document head.

```typescript
// Example test pattern
const helmetContext = {};
render(
  <HelmetProvider context={helmetContext}>
    <SEOHead />
  </HelmetProvider>
);
const script = document.head.querySelector('script[type="application/ld+json"]');
expect(script).toBeDefined();
const json = JSON.parse(script.innerHTML);
expect(json['@type']).toBe('SoftwareApplication');
```
