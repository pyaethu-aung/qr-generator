import { render, screen, fireEvent } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ThemeToggle } from '../ThemeToggle'
import { ThemeProvider } from '../../../hooks/ThemeProvider'

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

describe('ThemeToggle', () => {
  beforeEach(() => {
    window.localStorage.clear()
    vi.clearAllMocks()
  })

  it('renders correctly', () => {
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    )
    expect(screen.getByRole('button')).toBeDefined()
  })

  it('toggles theme on click', () => {
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    )
    
    const button = screen.getByRole('button')
    // Default mock is light (matches: false)
    // Target icon should be moon 🌙
    expect(button.textContent).toContain('🌙')
    
    fireEvent.click(button)
    // After click it should be dark theme
    // Target icon should be sun ☀️
    expect(button.textContent).toContain('☀️')
  })

  it('has correct aria-label based on theme', () => {
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    )
    
    const button = screen.getByRole('button')
    // Starts in light theme
    expect(button.getAttribute('aria-label')).toBe('Switch to dark theme')
    
    fireEvent.click(button)
    // Switched to dark theme
    expect(button.getAttribute('aria-label')).toBe('Switch to light theme')
  })
})
