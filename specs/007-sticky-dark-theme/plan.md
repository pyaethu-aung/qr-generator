# Implementation Plan - Sticky Dark Theme

Enable "Sticky Dark Theme" by forcing dark mode, disabling the theme toggle, and adding a "Coming soon" toast.

## Technical Context

**Concept**: Override the existing theme logic to enforce `dark` mode permanently (for now). The theme toggle will remain in the UI but be disabled. Hovering over it will trigger a "Coming soon" toast.

**Key Components**:
- `src/hooks/useTheme.ts`: Logic source for theme state.
- `src/components/common/ThemeToggle.tsx`: The visual control.
- `src/components/common/Toast.tsx` (New): Feedback mechanism.

**Dependencies**:
- `clsx` / `tailwind-merge`: For conditional styling (already in project).

## Constitution Check

- [x] **Cross-Platform**: UI changes (toast, disabled state) are CSS-based and responsive.
- [x] **State Management**: Theme state is simplified to a constant, reducing complexity for this feature.
- [x] **Testing**: Existing tests for `useTheme` may fail if they rely on toggling. They will need to be updated or skipped/mocked for this specific feature branch.

## Proposed Changes

### Phase 1: Shared Components & Contracts

#### [NEW] [Toast.tsx](file:///Users/pyaethuaung/go/src/github.com/pyaethu-aung/qr-generator/src/components/common/Toast.tsx)
- Create a reusable `Toast` component.
- Props: `message`, `isVisible`.
- Styling: Fixed position (absolute/relative to parent), z-index, dark background (slate-800), white text, rounded corners.

### Phase 2: Core Implementation

#### [MODIFY] [useTheme.ts](file:///Users/pyaethuaung/go/src/github.com/pyaethu-aung/qr-generator/src/hooks/useTheme.ts)
- **Constraint**: Do not remove existing logic.
- **Change**: Initialize state to `'dark'` always.
- **Change**: `toggleTheme` function should do nothing (or log warning).
- **Change**: `useEffect` listening for system preferences should be disabled or early-return.
- **Constraint**: Add `// TODO: Revert to dynamic theme logic when sticky dark theme is no longer needed` comments near any hardcoded 'dark' values or disabled logic to ensure easy reversibility using `grep`.

#### [MODIFY] [ThemeToggle.tsx](file:///Users/pyaethuaung/go/src/github.com/pyaethu-aung/qr-generator/src/components/common/ThemeToggle.tsx)
- **UI**: Add `opacity-50` and `cursor-not-allowed` to the button.
- **Interaction**: Remove `onClick`. Add `onMouseEnter` to show Toast.
- **State**: Track `showToast` local state.

## Verification Plan

### Automated Tests
- **Unit Tests**:
    - `useTheme.test.ts`: Verify it returns 'dark' and toggle does nothing.
    - `ThemeToggle.test.tsx`: Verify it renders with disabled styles and shows toast text on interaction (if verifiable via testing-library).

### Manual Verification
1. Open app: Confirm Dark Mode is active.
2. Check `localStorage`: Even if set to 'light', app forces dark.
3. Hover Toggle: Confirm "Coming soon" toast appears.
4. Click Toggle: Confirm nothing happens (no theme switch).
