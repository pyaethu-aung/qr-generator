# Research: Sticky Dark Theme

**Feature**: Sticky Dark Theme (007)
**Status**: Research Complete

## Executive Summary

To implement the requested "Sticky Dark Theme", we need to override the existing theme logic to enforce `dark` mode regardless of system settings or local storage. The visual toggle button must be preserved but disabled, and a new Toast component is required to provide feedback on hover.

## Research Findings

### 1. Enforcing Dark Mode
- **Current State**: `useTheme.ts` determines the initial theme from `localStorage` or `window.matchMedia`. It listens for system changes and updates `localStorage` on toggle.
- **Problem**: We need to ignore these inputs without deleting the code (per user request).
- **Solution**: Modify `useTheme.ts` to hardcode the returned state to `'dark'` and make `setTheme` / `toggleTheme` no-ops or log warnings. We will comment out the actual logic or wrap it in a condition that is currently always false, preserving the implementation for future use.

### 2. Disabling Theme Toggle & Adding Feedback
- **Current State**: `ThemeToggle.tsx` is a standard button with an `onClick` handler.
- **Requirement**: Button exists, looks disabled (opacity/cursor), doesn't toggle, shows "Coming soon" on hover.
- **Solution**:
    - Update `ThemeToggle.tsx` to remove `onClick` (or prevent default).
    - Add `onMouseEnter` / `onMouseLeave` handlers to trigger the toast.
    - Apply `opacity-50 cursor-not-allowed` classes for the disabled look (Option A).

### 3. Toast Notification
- **Current State**: No `Toast` component exists in `src/components/common`.
- **Solution**: Create a new `Toast.tsx` component.
    - **Design**: A simple, fixed-position notification (e.g., bottom-center or near the toggle).
    - **State**: Needs local state in `ThemeToggle` or a global Toast context. Given the scope, local state in `ThemeToggle` rendering a `Toast` component is sufficient and simpler than a full context system.

## Decisions

- **Theme Logic**: Modify `useTheme` to initiate with and persist `'dark'` only. Disable `toggleTheme`.
- **Toggle UI**: Retain `ThemeToggle` component but modify generic styles to reflect disabled state.
- **Feedback**: Implement a lightweight `Toast` component rendered directly by `ThemeToggle` on hover.

## Alternatives Considered

- **Deleting Code**: Rejected. User explicitly requested to *not* remove theme support.
- **Global Toast Context**: Rejected. Overkill for a single "Coming soon" message. Local state is sufficient.
- **CSS-only Tooltip**: Rejected. "Toast" implies a more distinct UI element than a browser title or simple tooltip, though a custom tooltip component would also work. A "Toast" usually implies ephemeral feedback. We will implement a small popover/toast that appears near the button.
