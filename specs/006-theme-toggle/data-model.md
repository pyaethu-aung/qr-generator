# Data Model: Light/Dark Theme Toggle

**Feature**: 006-theme-toggle  
**Date**: 2026-02-02

## Entities

### Theme

Represents the visual mode applied to the UI.

| Field | Type | Description |
|-------|------|-------------|
| value | `'light' \| 'dark'` | Current active theme |

**Constraints**:
- Only two valid values: `'light'` and `'dark'`
- Default when no preference: system preference, falling back to `'dark'`

---

### ThemePreference

User's stored theme choice.

| Field | Type | Storage | Description |
|-------|------|---------|-------------|
| preference | `'light' \| 'dark' \| null` | localStorage | User's explicit choice, null if not set |

**Storage Key**: `qr-generator:theme-preference`

**Lifecycle**:
1. On first visit: `null` (use system preference)
2. On user toggle: stored value (`'light'` or `'dark'`)
3. On subsequent visits: read from storage

---

### SystemPreference

Operating system's theme preference detected via CSS media query.

| Field | Type | Source | Description |
|-------|------|--------|-------------|
| prefersDark | `boolean` | `prefers-color-scheme` | True if OS prefers dark mode |

**Detection**: `window.matchMedia('(prefers-color-scheme: dark)').matches`

---

## State Resolution

```text
Final Theme = 
  if (storedPreference exists) → storedPreference
  else if (systemPreference available) → systemPreference
  else → 'dark' (fallback)
```

## React Context Shape

```typescript
interface ThemeContextValue {
  theme: 'light' | 'dark'           // Resolved current theme
  setTheme: (theme: Theme) => void  // Set specific theme
  toggleTheme: () => void           // Toggle between light/dark
}
```
