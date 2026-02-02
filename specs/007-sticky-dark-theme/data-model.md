# Data Model: Sticky Dark Theme

**Feature**: Sticky Dark Theme (007)
**Status**: Design Complete

## Entities

No new data entities are introduced by this feature. The theme state is managed purely on the client-side via React state and `localStorage` (inherited from existing implementation, though strictly forced to 'dark').

## Storage

- **LocalStorage Key**: `qr-generator:theme-preference`
    - **Behavior Change**: The application will *read* this key but will ignore any value other than 'dark' during initialization. It will effectively "read-only" ignore 'light'.
