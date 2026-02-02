import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, beforeEach } from 'vitest'

import App from './App'
import { LocaleProvider } from './hooks/LocaleProvider'
import { ThemeProvider } from './hooks/ThemeProvider'
import { locales } from './data/i18n'
import { vi } from 'vitest'

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

describe('App integration', () => {
  beforeEach(() => {
    window.localStorage.clear()
    vi.clearAllMocks()
  })

  it('updates UI copy and metadata when the language toggle switches to Burmese', async () => {
    const user = userEvent.setup()

    render(
      <ThemeProvider>
        <LocaleProvider>
          <App />
        </LocaleProvider>
      </ThemeProvider>,
    )

    expect(screen.getByRole('heading', { name: /sculpt standout qr codes/i })).toBeInTheDocument()
    expect(document.documentElement.lang).toBe(locales.en.locale.code)
    expect(document.title).toBe(locales.en.seo.title)

    const toggle = screen.getByRole('button', { name: locales.en.locale.switchTo.my })
    await user.click(toggle)

    await waitFor(() => {
      expect(document.documentElement.lang).toBe(locales.my.locale.code)
      expect(screen.getByRole('heading', { name: locales.my.hero.title })).toBeInTheDocument()

      const descriptionMeta = document.querySelector('meta[name="description"]')
      const ogDescriptionMeta = document.querySelector('meta[property="og:description"]')

      expect(descriptionMeta).not.toBeNull()
      expect(ogDescriptionMeta).not.toBeNull()

      if (!descriptionMeta || !ogDescriptionMeta) {
        throw new Error('SEO meta tags did not render for Burmese locale')
      }

      expect(descriptionMeta).toHaveAttribute('content', locales.my.seo.description)
      expect(ogDescriptionMeta).toHaveAttribute('content', locales.my.seo.ogDescription)
    })
  })

  it('applies the toggle and metadata updates within 1 second', async () => {
    const user = userEvent.setup()
    render(
      <ThemeProvider>
        <LocaleProvider>
          <App />
        </LocaleProvider>
      </ThemeProvider>,
    )

    const toggle = screen.getByRole('button', { name: locales.en.locale.switchTo.my })
    const startTime = performance.now()

    await user.click(toggle)

    await waitFor(
      () => {
        expect(document.documentElement.lang).toBe(locales.my.locale.code)
        expect(document.title).toBe(locales.my.seo.title)
      },
      { timeout: 1000 },
    )

    const duration = performance.now() - startTime
    expect(duration).toBeLessThanOrEqual(1000)
  })

  it('derives initial locale from localStorage on load', () => {
    window.localStorage.setItem('qr-generator:locale-preference', 'my')

    render(
      <ThemeProvider>
        <LocaleProvider>
          <App />
        </LocaleProvider>
      </ThemeProvider>,
    )

    expect(document.documentElement.lang).toBe('my')
    expect(screen.getByRole('heading', { name: locales.my.hero.title })).toBeInTheDocument()
    expect(document.title).toBe(locales.my.seo.title)
  })
})
