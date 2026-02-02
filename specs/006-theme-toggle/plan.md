# Implementation Plan: Light/Dark Theme Toggle

**Branch**: `006-theme-toggle` | **Date**: 2026-02-02 | **Spec**: [spec.md](file:///Users/pyaethuaung/go/src/github.com/pyaethu-aung/qr-generator/specs/006-theme-toggle/spec.md)  
**Input**: Feature specification from `/specs/006-theme-toggle/spec.md`

## Summary

Implement light/dark theme support with a toggle button, system preference detection, and localStorage persistence. The feature uses React Context pattern (matching `LocaleProvider`) with CSS custom properties and Tailwind's `dark:` variant for styling.

## Technical Context

**Language/Version**: TypeScript 5.9 + React 19  
**Primary Dependencies**: Tailwind CSS 4, React Context  
**Storage**: Browser localStorage for preference persistence  
**Testing**: Vitest + React Testing Library  
**Target Platform**: Web (Chrome, Safari, Firefox, Edge) - desktop & mobile  
**Project Type**: Single SPA  
**Performance Goals**: Theme transition <300ms, no flash of wrong theme on load  
**Constraints**: Must work when localStorage unavailable; must respect `prefers-color-scheme`

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- ✅ Tests, lint, and build MUST be run locally after every change via `npm run test`, `npm run lint`, and `npm run build`
- ✅ Unit tests MUST be added for `useTheme` hook and `ThemeToggle` component; maintain coverage ≥85%
- ✅ UI MUST be fully functional and consistent across desktop/mobile and major browsers
- ✅ Structure adherence: Hook in `src/hooks`, component in `src/components/common`, types in `src/types`
- ✅ Remove unused code/assets; no commented-out blocks
- ✅ Commit discipline: commit each task; titles ≤50 chars
- ✅ CI gates (lint, test, build) MUST pass; PR review is mandatory

## Project Structure

### Documentation (this feature)

```text
specs/006-theme-toggle/
├── plan.md              # This file
├── spec.md              # Feature specification
└── checklists/
    └── requirements.md  # Quality checklist
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── common/
│   │   └── ThemeToggle.tsx      # [NEW] Theme toggle button
│   └── Navigation/
│       └── Navbar.tsx           # [MODIFY] Add ThemeToggle
├── hooks/
│   ├── ThemeProvider.tsx        # [NEW] Theme context provider
│   └── useTheme.ts              # [NEW] Theme state hook
├── types/
│   └── theme.ts                 # [NEW] Theme type definitions
├── index.css                    # [MODIFY] CSS custom properties for themes
├── main.tsx                     # [MODIFY] Wrap with ThemeProvider
└── App.tsx                      # [MODIFY] Remove hardcoded dark classes if needed
```

**Structure Decision**: Following existing patterns with `LocaleProvider`/`useLocale`, I'll create `ThemeProvider`/`useTheme` in `src/hooks/` and `ThemeToggle` in `src/components/common/`.

---

## Proposed Changes

### Theme Infrastructure

#### [NEW] [theme.ts](file:///Users/pyaethuaung/go/src/github.com/pyaethu-aung/qr-generator/src/types/theme.ts)

Define theme types:
- `Theme` type: `'light' | 'dark'`
- `ThemePreference` type: `'light' | 'dark' | 'system'`

---

#### [NEW] [useTheme.ts](file:///Users/pyaethuaung/go/src/github.com/pyaethu-aung/qr-generator/src/hooks/useTheme.ts)

Core theme logic hook (following `useLocale` pattern):
- Detect system preference via `window.matchMedia('(prefers-color-scheme: dark)')`
- Read persisted preference from localStorage (`qr-generator:theme-preference`)
- Priority: stored preference > system preference > dark fallback
- Listen for system preference changes
- Persist preference on change
- Export: `theme`, `setTheme`, `toggleTheme`, `systemPreference`

---

#### [NEW] [ThemeProvider.tsx](file:///Users/pyaethuaung/go/src/github.com/pyaethu-aung/qr-generator/src/hooks/ThemeProvider.tsx)

Context provider (following `LocaleProvider` pattern):
- Create `ThemeContext` with `useTheme` result
- Apply theme class to `document.documentElement` (`dark` class for dark mode)
- Update `<meta name="theme-color">` for browser chrome
- Export `ThemeProvider` and `useThemeContext`

---

### Theme Toggle Component

#### [NEW] [ThemeToggle.tsx](file:///Users/pyaethuaung/go/src/github.com/pyaethu-aung/qr-generator/src/components/common/ThemeToggle.tsx)

Toggle button component:
- Display icon showing **target** theme (moon when light, sun when dark)
- Accessible: keyboard focusable, ARIA label describing action
- Use `useThemeContext()` to get/set theme
- Smooth icon transition animation

---

### Styling Updates

#### [MODIFY] [index.css](file:///Users/pyaethuaung/go/src/github.com/pyaethu-aung/qr-generator/src/index.css)

Add CSS custom properties for theme colors:
- Define light theme colors in `:root`
- Define dark theme colors in `:root.dark` or `.dark` class
- Add transition property for smooth theme changes
- Update base styles to use CSS custom properties

---

#### [MODIFY] [Layout.tsx](file:///Users/pyaethuaung/go/src/github.com/pyaethu-aung/qr-generator/src/components/Layout/Layout.tsx)

Update to support both themes:
- Replace hardcoded `bg-slate-950 text-slate-50` with theme-aware classes
- Use Tailwind `dark:` variants or CSS custom properties

---

### Integration

#### [MODIFY] [main.tsx](file:///Users/pyaethuaung/go/src/github.com/pyaethu-aung/qr-generator/src/main.tsx)

Wrap app with `ThemeProvider`:
```tsx
<ThemeProvider>
  <LocaleProvider>
    <App />
  </LocaleProvider>
</ThemeProvider>
```

---

#### [MODIFY] [Navbar.tsx](file:///Users/pyaethuaung/go/src/github.com/pyaethu-aung/qr-generator/src/components/Navigation/Navbar.tsx)

Add `ThemeToggle` next to `LanguageToggle`:
- Place in the header's right section
- Maintain consistent spacing with existing toggle

---

### Tests

#### [NEW] [useTheme.test.ts](file:///Users/pyaethuaung/go/src/github.com/pyaethu-aung/qr-generator/src/hooks/__tests__/useTheme.test.ts)

Unit tests for the hook:
- Returns current theme
- Toggles between light and dark
- Persists preference to localStorage
- Reads persisted preference on init
- Falls back to system preference when no stored value
- Falls back to dark when system preference unavailable

---

#### [NEW] [ThemeToggle.test.tsx](file:///Users/pyaethuaung/go/src/github.com/pyaethu-aung/qr-generator/src/components/common/__tests__/ThemeToggle.test.tsx)

Component tests:
- Renders correct icon based on current theme
- Toggles theme on click
- Has correct ARIA label
- Is keyboard accessible

---

## Verification Plan

### Automated Tests

Run after each change:
```bash
npm run test      # All tests pass
npm run lint      # No lint errors
npm run build     # Build succeeds
```

Coverage check:
```bash
npm run test:coverage   # Verify ≥85% coverage maintained
```

### Manual Verification

1. **Theme Toggle**:
   - Open app in browser
   - Click theme toggle button
   - Verify all colors change smoothly (backgrounds, text, buttons, cards)

2. **Persistence**:
   - Set theme to light
   - Close browser completely
   - Reopen app → should load in light mode

3. **System Preference**:
   - Clear localStorage: `localStorage.removeItem('qr-generator:theme-preference')`
   - Set OS to dark mode → app should load dark
   - Set OS to light mode → app should load light

4. **Cross-browser**:
   - Test in Chrome, Safari, Firefox, Edge
   - Test on mobile viewport

5. **Accessibility**:
   - Tab to theme toggle → should show focus ring
   - Press Enter/Space → should toggle theme
   - Screen reader should announce action
