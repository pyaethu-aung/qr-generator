import { useCallback, useEffect, useState } from 'react'
import type { Theme } from '../types/theme'

const STORAGE_KEY = 'qr-generator:theme-preference'
const isBrowser = typeof window !== 'undefined'

export function useTheme() {
  const getSystemTheme = useCallback((): Theme => {
    if (!isBrowser || !window.matchMedia) return 'dark'
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }, [])

  // TODO: Revert to dynamic theme logic when sticky dark theme is no longer needed
  // Original logic was: dynamic state from localStorage or system theme.
  const [theme, setThemeState] = useState<Theme>('dark')

  /*
  const [theme, setThemeState] = useState<Theme>(() => {
    if (!isBrowser) return 'dark'
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored === 'light' || stored === 'dark') return stored as Theme
    } catch (e) {
      console.warn('[theme] Could not read from localStorage', e)
    }
    return getSystemTheme()
  })
  */

  useEffect(() => {
    if (!isBrowser || !window.matchMedia) return

    // TODO: Revert to dynamic theme logic when sticky dark theme is no longer needed
    // Effectively disabling the system preference listener for now
    /*
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e: MediaQueryListEvent) => {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (!stored) {
        setThemeState(e.matches ? 'dark' : 'light')
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
    */
  }, [])

  const setTheme = useCallback((newTheme: Theme) => {
    // TODO: Revert to dynamic theme logic when sticky dark theme is no longer needed
    // Forcing 'dark' regardless of input
    console.warn('[theme] Theme switching is currently disabled.')
    setThemeState('dark')
    if (isBrowser) {
      // We still update storage to 'dark' to ensure it sticks if we revert logic later
      localStorage.setItem(STORAGE_KEY, 'dark')
    }
  }, [])

  const toggleTheme = useCallback(() => {
     // TODO: Revert to dynamic theme logic when sticky dark theme is no longer needed
     // Disabled toggle action
     console.warn('[theme] Theme toggling is currently disabled.')
    // setTheme(theme === 'light' ? 'dark' : 'light')
  }, [theme, setTheme])

  return {
    theme,
    setTheme,
    toggleTheme,
    isDark: true // Force true
  }
}
