import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { LanguageToggle } from '../LanguageToggle'
import { LocaleProvider } from '../../../hooks/LocaleProvider'
import { locales } from '../../../data/i18n'

const renderToggle = () =>
  render(
    <LocaleProvider>
      <LanguageToggle />
    </LocaleProvider>,
  )

describe('LanguageToggle', () => {
  it('renders a Globe SVG icon', () => {
    const { container } = renderToggle()
    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('is focusable through keyboard navigation', async () => {
    const user = userEvent.setup()
    renderToggle()

    await user.tab()

    const toggle = screen.getByRole('button', { name: /switch to burmese/i })
    expect(toggle).toHaveFocus()
  })

  it('has an accessible aria-label', () => {
    renderToggle()
    const toggle = screen.getByRole('button', { name: /switch to burmese/i })
    expect(toggle).toHaveAttribute('aria-label')
  })

  it('cycles English to Burmese to Spanish and back', async () => {
    const user = userEvent.setup()
    renderToggle()

    // Starts on English: next is Burmese.
    const toggle = screen.getByRole('button', { name: locales.en.locale.switchTo.my })
    await user.click(toggle)

    // Now on Burmese: next is Spanish. Burmese has no Spanish label, so the
    // aria-label falls back to the English copy.
    expect(toggle).toHaveAccessibleName(locales.en.locale.switchTo.es)
    await user.click(toggle)

    // Now on Spanish: next wraps back to English.
    expect(toggle).toHaveAccessibleName(locales.es.locale.switchTo.en)
    await user.click(toggle)

    // Back on English: next is Burmese again.
    expect(toggle).toHaveAccessibleName(locales.en.locale.switchTo.my)
  })
})
