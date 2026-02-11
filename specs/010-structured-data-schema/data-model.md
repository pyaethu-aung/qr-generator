# Data Model: Structured Data (JSON-LD)

## SoftwareApplication Schema

The following TypeScript interface defines the contract for the JSON-LD object injected into the document head.

```typescript
/**
 * Contract for the SoftwareApplication JSON-LD object.
 * Based on Schema.org and Google Search requirements.
 */
export interface SoftwareApplicationJSONLD {
  "@context": "https://schema.org";
  "@type": "SoftwareApplication";
  name: string;
  description: string;
  applicationCategory: string;
  operatingSystem: string;
  url: string;
  image: string;
  featureList: string;
  offers: {
    "@type": "Offer";
    price: string;
    priceCurrency: string;
  };
}
```

## Static Values Mapping

| Property | Value | Source |
|----------|-------|--------|
| `@type` | `SoftwareApplication` | User Requirement |
| `name` | `QR Code Generator` | `index.html` Title |
| `description` | `Generate high-quality QR codes instantly with real-time preview.` | `index.html` Meta |
| `applicationCategory` | `UtilitiesApplication` | User Requirement |
| `operatingSystem` | `Web` | User Requirement |
| `url` | `https://pyaethu-aung.github.io/qr-generator/` | Clarified Requirement |
| `image` | `./logo.png` | Clarified Requirement |
| `featureList` | `Client-side generation, Zero-backend, SVG Export` | User Requirement |
| `price` | `0` | User Requirement |
| `priceCurrency` | `USD` | Standard Default |
