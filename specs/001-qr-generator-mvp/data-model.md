# Data Model: QR Generator MVP

## Entities

### QRConfig

Represents the user's active configuration for the generated QR code.

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `value` | string | Yes | "" | The confirmed text content to encode (set on "Generate" click). |
| `ecLevel` | enum | Yes | 'M' | Error Correction Level (L, M, Q, H). |
| `fgColor` | string | Yes | "#000000" | Foreground color (hex). |
| `bgColor` | string | Yes | "#ffffff" | Background color (hex). |
| `size` | number | No | N/A | Size in pixels (used for download generation only). |

## State Management

- **Scope**: Local State (Container Component).
- **Structure**:
    - `inputBuffer`: string (Tracks typing)
    - `qrConfig`: QRConfig (Tracks verified output)
- **Persistence**: None required for MVP.

## Validation Rules

- **value**: Max length ~2000 chars (depending on EC level).
- **colors**: Valid Hex codes.
