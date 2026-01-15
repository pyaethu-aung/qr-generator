# Data Model: QR Generator MVP

Since this is a frontend-only application, this model describes the **Client-Side State** and **TypeScript Interfaces**.

## Core Types

### `QRConfig`
The configuration state for generating a QR code.

```typescript
interface QRConfig {
  /** The content to encode (text or URL) */
  value: string;
  /** Error Correction Level (fixed to 'M' for MVP) */
  level: 'L' | 'M' | 'Q' | 'H';
  /** Display size in pixels (fixed to 256 for MVP preview) */
  size: number;
  /** Background color (fixed to #FFFFFF for MVP) */
  bgColor: string;
  /** Foreground color (fixed to #000000 for MVP) */
  fgColor: string;
}
```

### `ValidationResult`
Result of input string validation.

```typescript
interface ValidationResult {
  /** Is the input potentially a valid URL? */
  isURL: boolean;
  /** If not a valid URL, is it non-empty text? */
  isValidText: boolean;
  /** Warning message if applicable (e.g., "Invalid URL format") */
  warning?: string;
}
```

## State Management

**Store**: React `useState` (Local Component State is sufficient for MVP).

- `inputValue`: string (Linked to Input field)
- `qrConfig`: QRConfig (derived from inputValue + defaults)

## Transformation Logic

`Input String` -> `Validation` -> `QRConfig` -> `Render`
