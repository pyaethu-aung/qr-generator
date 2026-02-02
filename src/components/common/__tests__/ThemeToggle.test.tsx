import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { ThemeToggle } from '../ThemeToggle'
import { ThemeProvider } from '../../../hooks/ThemeProvider'
import { LocaleProvider } from '../../../hooks/LocaleProvider'

// Mock matchMedia
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

describe('ThemeToggle (Sticky Dark)', () => {
  beforeEach(() => {
    window.localStorage.clear()
    vi.clearAllMocks()
  })

  const renderWithProviders = (ui: React.ReactNode) => {
    return render(
      <LocaleProvider>
        <ThemeProvider>
          {ui}
        </ThemeProvider>
      </LocaleProvider>
    )
  }

  it('renders with disabled styles', () => {
    renderWithProviders(<ThemeToggle />)
    const button = screen.getByRole('button')
    
    // Check for disabled visual classes
    expect(button).toHaveClass('opacity-50')
    expect(button).toHaveClass('cursor-not-allowed')
    expect(button).toHaveAttribute('aria-disabled', 'true')
  })

  it('does NOT toggle theme on click (stays dark)', () => {
    renderWithProviders(<ThemeToggle />)
    const button = screen.getByRole('button')
    
    // Should be sun icon (indicating we are in dark mode looking to switch to light, 
    // or arguably if stuck in dark, maybe it should show sun? 
    // Current logic: isDark ? '☀️' : '🌙'. Since pinned to dark, it shows sun.)
    expect(button.textContent).toContain('☀️')
    
    fireEvent.click(button)
    
    // Should still be sun (dark mode)
    expect(button.textContent).toContain('☀️')
  })

  it('shows "Coming soon" toast on hover', async () => {
    renderWithProviders(<ThemeToggle />)
    const button = screen.getByRole('button')
    
    // Toast should not be visible initially (or not present in a way that suggests visibility)
    // My Toast component uses opacity-0 when hidden but is in DOM.
    // Let's query by text.
    const toastMessage = screen.queryByText('Coming soon')
    // It might be present in DOM but hidden. 
    // Testing-library's queryByText finds hidden elements too usually unless constrained.
    // But `Toast` has `opacity-0` when hidden.
    
    expect(toastMessage).toBeInTheDocument()
    // It's technically in the document, checking parent class or visibility might be triggered by styles.
    // Let's check styling if possible or aria-hidden.
    // The Toast wrapper has aria-hidden={!isVisible}
    
    // Initial state: hidden
    expect(toastMessage).toHaveAttribute('aria-hidden', 'true')

    // Hover
    fireEvent.mouseEnter(button)
    
    // Expect visible
    expect(toastMessage).toHaveAttribute('aria-hidden', 'false')
    expect(screen.getByText('Coming soon')).toBeVisible() // requires jest-dom style checks which might imply opacity > 0 logic if configured well, or just display != none.
    expect(toastMessage).toHaveClass('opacity-100')

    // Unhover
    fireEvent.mouseLeave(button)
    expect(toastMessage).toHaveAttribute('aria-hidden', 'true')
    expect(toastMessage).toHaveClass('opacity-0')
  })
})
