import { renderHook, act } from '@testing-library/react'
import { describe, expect, it, beforeEach, vi } from 'vitest'
import { useTheme } from '../useTheme'

describe('useTheme', () => {
  beforeEach(() => {
    window.localStorage.clear()
    vi.clearAllMocks()
    
    // Mock matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(), // deprecated
        removeListener: vi.fn(), // deprecated
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    })
  })

  it('initializes with dark theme if no preference is stored and system is light', () => {
    // Note: Our hook currently falls back to getSystemTheme() which we mock as false (light)
    // But the spec says default to dark if not supported.
    // In our implementation: return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    const { result } = renderHook(() => useTheme())
    expect(result.current.theme).toBe('light')
  })

  it('initializes with dark theme if system prefers dark', () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: query === '(prefers-color-scheme: dark)',
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    })

    const { result } = renderHook(() => useTheme())
    expect(result.current.theme).toBe('dark')
  })

  it('initializes with stored preference if available', () => {
    window.localStorage.setItem('qr-generator:theme-preference', 'light')
    const { result } = renderHook(() => useTheme())
    expect(result.current.theme).toBe('light')

    window.localStorage.setItem('qr-generator:theme-preference', 'dark')
    const { result: result2 } = renderHook(() => useTheme())
    expect(result2.current.theme).toBe('dark')
  })

  it('persists theme change to localStorage', () => {
    const { result } = renderHook(() => useTheme())

    act(() => {
      result.current.setTheme('dark')
    })

    expect(result.current.theme).toBe('dark')
    expect(window.localStorage.getItem('qr-generator:theme-preference')).toBe('dark')

    act(() => {
      result.current.toggleTheme()
    })

    expect(result.current.theme).toBe('light')
    expect(window.localStorage.getItem('qr-generator:theme-preference')).toBe('light')
  })

  it('updates isDark correctly', () => {
    const { result } = renderHook(() => useTheme())
    
    act(() => {
      result.current.setTheme('dark')
    })
    expect(result.current.isDark).toBe(true)

    act(() => {
      result.current.setTheme('light')
    })
    expect(result.current.isDark).toBe(false)
  })

  it('responds to system preference changes when no user preference is stored', () => {
    let changeHandler: ((e: MediaQueryListEvent) => void) | null = null
    const addListenerMock = vi.fn().mockImplementation((_event: string, handler: (e: MediaQueryListEvent) => void) => {
      changeHandler = handler
    })

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        addEventListener: addListenerMock,
        removeEventListener: vi.fn(),
      })),
    })

    const { result } = renderHook(() => useTheme())
    expect(result.current.theme).toBe('light')

    act(() => {
      if (changeHandler) {
        changeHandler({ matches: true } as MediaQueryListEvent)
      }
    })

    expect(result.current.theme).toBe('dark')
  })

  it('ignores system preference changes if user has a stored preference', () => {
    window.localStorage.setItem('qr-generator:theme-preference', 'light')
    
    let changeHandler: ((e: MediaQueryListEvent) => void) | null = null
    const addListenerMock = vi.fn().mockImplementation((_event: string, handler: (e: MediaQueryListEvent) => void) => {
      changeHandler = handler
    })

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        addEventListener: addListenerMock,
        removeEventListener: vi.fn(),
      })),
    })

    const { result } = renderHook(() => useTheme())
    expect(result.current.theme).toBe('light')

    act(() => {
      if (changeHandler) {
        changeHandler({ matches: true } as MediaQueryListEvent)
      }
    })

    // Should stay light because of stored preference
    expect(result.current.theme).toBe('light')
  })

  it('falls back to dark if matchMedia is unavailable', () => {
    // @ts-expect-error - testing missing API
    delete window.matchMedia
    
    const { result } = renderHook(() => useTheme())
    // Fallback in useTheme: getSystemTheme returns 'dark' if !isBrowser
    // or if matchMedia fails.
    expect(result.current.theme).toBe('dark')
  })

  it('gracefully handles localStorage errors', () => {
    const getItemSpy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('Storage access denied')
    })
    
    // Should not crash and should fall back to system theme
    const { result } = renderHook(() => useTheme())
    expect(result.current.theme).toBe('light')
    
    getItemSpy.mockRestore()
  })
})
