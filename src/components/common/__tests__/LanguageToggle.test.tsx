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
  it('is focusable through keyboard navigation', async () => {
    const user = userEvent.setup()
    renderToggle()

    await user.tab()

    const toggle = screen.getByRole('button', { name: /switch to burmese/i })
    expect(toggle).toHaveFocus()
  })

  it('updates its accessible label to describe the next language', async () => {
    const user = userEvent.setup()
    renderToggle()

    const toggle = screen.getByRole('button', { name: /switch to burmese/i })
    await user.click(toggle)

    expect(toggle).toHaveAccessibleName(locales.my.locale.switchTo.en)
  })
})
