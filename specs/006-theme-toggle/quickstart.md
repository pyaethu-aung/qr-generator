# Quickstart: Light/Dark Theme Toggle

**Feature**: 006-theme-toggle  
**Date**: 2026-02-02

## Prerequisites

- Node.js 20+
- npm

## Setup

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

## Using Theme Toggle

### In Components

```tsx
import { useThemeContext } from '../hooks/ThemeProvider'

function MyComponent() {
  const { theme, toggleTheme } = useThemeContext()
  
  return (
    <button onClick={toggleTheme}>
      Current: {theme}
    </button>
  )
}
```

### Adding ThemeToggle Button

```tsx
import { ThemeToggle } from '../components/common/ThemeToggle'

// Just include the component - it handles everything
<ThemeToggle />
```

## Testing

```bash
# Run all tests
npm run test

# Run with coverage
npm run test:coverage

# Run specific test file
npm run test -- useTheme.test.ts
```

## Theme-Aware Styling

Use Tailwind's `dark:` variant:

```tsx
<div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50">
  Content adapts to theme
</div>
```

## Storage

Theme preference is stored in `localStorage`:
- Key: `qr-generator:theme-preference`
- Values: `'light'` or `'dark'`

Clear preference to test system detection:
```js
localStorage.removeItem('qr-generator:theme-preference')
```
