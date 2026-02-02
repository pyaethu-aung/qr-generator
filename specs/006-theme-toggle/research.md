# Research: Light/Dark Theme Toggle

**Feature**: 006-theme-toggle  
**Date**: 2026-02-02

## Theme Detection Strategy

**Decision**: Use `window.matchMedia('(prefers-color-scheme: dark)')` for system preference detection

**Rationale**: 
- Native browser API with excellent support (97%+ global coverage)
- Provides `MediaQueryList` with `change` event for real-time updates
- No external dependencies required

**Alternatives considered**:
- CSS-only `@media (prefers-color-scheme)`: Rejected because we need JS control for user toggle and persistence
- Third-party libraries (e.g., `use-dark-mode`): Rejected to minimize dependencies and maintain control

## Theme Application Approach

**Decision**: Apply `dark` class to `<html>` element and use Tailwind's `dark:` variant

**Rationale**:
- Tailwind CSS 4 natively supports class-based dark mode
- Single source of truth at document root
- Works with existing Tailwind utilities
- No CSS custom property refactoring needed for most cases

**Alternatives considered**:
- CSS custom properties only: More flexible but requires refactoring all color references
- `data-theme` attribute: Works but `dark` class is Tailwind convention
- Media query based: Doesn't allow user override

## Flash Prevention Strategy

**Decision**: Inline script in `index.html` to apply theme before React hydration

**Rationale**:
- Prevents flash of wrong theme on page load
- Runs synchronously before any render
- Reads from localStorage immediately

**Implementation**:
```html
<script>
  (function() {
    try {
      var stored = localStorage.getItem('qr-generator:theme-preference');
      var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      var isDark = stored === 'dark' || (!stored && prefersDark);
      if (isDark) document.documentElement.classList.add('dark');
    } catch (e) {}
  })();
</script>
```

## localStorage Key

**Decision**: `qr-generator:theme-preference` with values `'light'` or `'dark'`

**Rationale**:
- Namespaced to avoid conflicts
- Matches existing pattern from locale preference (`qr-generator:locale-preference`)
- Simple string values for easy debugging

## Theme Transition

**Decision**: Use CSS `transition` on color properties with 150ms duration

**Rationale**:
- 150ms feels responsive yet smooth (spec allows up to 300ms)
- Transition on `background-color`, `color`, `border-color`
- Applied via utility class `.theme-transition`

## Browser Theme Color

**Decision**: Update `<meta name="theme-color">` dynamically on theme change

**Rationale**:
- Syncs browser chrome (address bar) with theme
- Improves visual consistency on mobile
- Already implemented in prior feature (can reuse approach)
