import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import App from './App'
import { LocaleProvider } from './hooks/LocaleProvider'
import { locales } from './data/i18n'

describe('App integration', () => {
  it('updates UI copy and metadata when the language toggle switches to Burmese', async () => {
    const user = userEvent.setup()

    render(
      <LocaleProvider>
        <App />
      </LocaleProvider>,
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
})
