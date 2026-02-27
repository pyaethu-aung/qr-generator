import { render, screen, fireEvent } from '@testing-library/react'
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

describe('ThemeToggle (Restored)', () => {
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

  it('renders without disabled styles and has no toast', () => {
    renderWithProviders(<ThemeToggle />)
    const button = screen.getByRole('button')

    expect(button).not.toHaveClass('opacity-50')
    expect(button).not.toHaveClass('cursor-not-allowed')
    expect(button).not.toHaveAttribute('aria-disabled')

    // Toast should be gone
    expect(screen.queryByText('Coming soon')).not.toBeInTheDocument()
  })

  it('toggles theme on click', () => {
    renderWithProviders(<ThemeToggle />)
    const button = screen.getByRole('button')

    // Initial: light mode (system mocked as light, no storage)
    expect(button.textContent).toContain('🌙')

    fireEvent.click(button)

    // After click: dark mode
    expect(button.textContent).toContain('☀️')
    expect(window.document.documentElement.classList.contains('dark')).toBe(true)

    fireEvent.click(button)

    // After second click: light mode
    expect(button.textContent).toContain('🌙')
    expect(window.document.documentElement.classList.contains('dark')).toBe(false)
  })

  it('reflects theme from localStorage', () => {
    window.localStorage.setItem('qr-generator:theme-preference', 'dark')
    renderWithProviders(<ThemeToggle />)
    const button = screen.getByRole('button')

    expect(button.textContent).toContain('☀️')
    expect(window.document.documentElement.classList.contains('dark')).toBe(true)
  })
})
