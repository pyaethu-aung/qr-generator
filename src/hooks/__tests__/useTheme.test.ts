import { renderHook, act } from '@testing-library/react'
import { describe, expect, it, beforeEach, vi } from 'vitest'
import { useTheme } from '../useTheme'

describe('useTheme (Sticky Dark Theme)', () => {
  beforeEach(() => {
    window.localStorage.clear()
    vi.clearAllMocks()
    
    // Mock matchMedia default to light to prove overrides work
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    })
  })

  it('initializes with dark theme even if system is light', () => {
    // System is mocked as light above
    const { result } = renderHook(() => useTheme())
    expect(result.current.theme).toBe('dark')
    expect(result.current.isDark).toBe(true)
  })

  it('initializes with dark theme even if localStorage has light', () => {
    window.localStorage.setItem('qr-generator:theme-preference', 'light')
    const { result } = renderHook(() => useTheme())
    expect(result.current.theme).toBe('dark')
  })

  it('toggleTheme does NOT change the theme', () => {
    const { result } = renderHook(() => useTheme())
    expect(result.current.theme).toBe('dark')

    act(() => {
      result.current.toggleTheme()
    })

    expect(result.current.theme).toBe('dark')
  })

  it('setTheme forces dark (ignores input)', () => {
    const { result } = renderHook(() => useTheme())
    
    act(() => {
      // Call setTheme - it should ignore any input and stay dark
      result.current.setTheme()
    })

    expect(result.current.theme).toBe('dark')
    // It should also enforce 'dark' in localStorage to keep it sticky
    expect(window.localStorage.getItem('qr-generator:theme-preference')).toBe('dark')
  })

  it('ignores system preference changes', () => {
    let changeHandler: ((e: MediaQueryListEvent) => void) | null = null
    const addListenerMock = vi.fn().mockImplementation((_event: string, handler: (e: MediaQueryListEvent) => void) => {
      changeHandler = handler
    })

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false, // light
        media: query,
        addEventListener: addListenerMock,
        removeEventListener: vi.fn(),
      })),
    })

    const { result } = renderHook(() => useTheme())
    expect(result.current.theme).toBe('dark')

    act(() => {
      if (changeHandler) {
        // Try to trigger a system change (though logic currently disables the listener)
        changeHandler({ matches: true } as MediaQueryListEvent)
      }
    })

    expect(result.current.theme).toBe('dark')
  })
})
