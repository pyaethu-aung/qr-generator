# Quickstart: Bilingual Support & SEO Metadata

## Introduction

This feature adds bilingual support (English/Burmese) and SEO metadata management to the QR Code Generator. It implements immediate language switching with persistence and metadata synchronization.

## Architecture

1.  **Locale Data**: Stored in `src/data/i18n/*.json`.
2.  **Locale Context**: `LocaleProvider` manages the active locale and provides `translate` and `seo` objects.
3.  **Persistence**: `useLocale` hook reads from/writes to `localStorage` with safety guards.
4.  **Metadata Utility**: `src/utils/metadata.ts` provides `applySeoMetadata` to update document title and meta tags.

## Usage

### Adding a New Language

1.  Create a new JSON file in `src/data/i18n/` (e.g., `es.json`).
2.  Import it in `src/data/i18n/index.ts` and add it to `localeRegistry`.
3.  Update `src/types/i18n.ts` to include any new keys if necessary.

### Translating Components

```tsx
import { useLocaleContext } from '../hooks/LocaleProvider';

function MyComponent() {
  const { translate } = useLocaleContext();
  return <h1>{translate('my.translation.key')}</h1>;
}
```

## SEO Management

The `useLocale` hook returns an `seo` object aligned with the current locale. `App.tsx` has a side effect that calls `applySeoMetadata(seo)` whenever the locale changes.

Supported SEO Tags:
- Document Title
- Meta Description
- Canonical Link
- Open Graph (Title, Description, Type)
- Twitter (Card, Title, Description)

## Implementation Details

- **Burmese Locale Code**: `my`
- **Default Locale**: `en`
- **Toggle Location**: Top-right corner (fixed).
- **Persistence Key**: `qr-generator:locale-preference`
