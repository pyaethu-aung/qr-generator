# Manual Verification for Mobile Layout (005-fix-mobile-overflow)

## Test Environment
- Device: Mobile Simulator (Chrome/Safari)
- Resolution: 320px width (iPhone SE or custom)

## US1: View Content Without Horizontal Scroll

### Scenario 1.1: Long URL/Hash handling
1. Open the application.
2. Enter a very long string (e.g., 200+ characters URL) in the QR generator input.
3. Observe the displayed QR code details and raw string display.
4. **Expected**: The string should wrap within the screen width. No horizontal scrollbar should appear.

### Scenario 1.2: Global Layout
1. Navigate between elements.
2. Verify that the `header`, `main`, and `footer` all stay within the horizontal bounds.
3. **Expected**: No horizontal "sway" or scrollbar.

## US2: Access All Interactive Elements

### Scenario 2.1: Navigation
1. Shrink viewport to < 768px.
2. Observe navigation links.
3. **Expected**: Links should collapse into a hamburger menu.
4. Open the hamburger menu.
5. **Expected**: Mobile menu overlay appears and is usable.

### Scenario 2.2: Form Stacking
1. Observe the input form on mobile.
2. **Expected**: Labels should be ABOVE the input fields (stacked).
3. Verify buttons are fully visible and clickable.
