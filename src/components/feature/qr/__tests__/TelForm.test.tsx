import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { LocaleProvider } from '../../../../hooks/LocaleProvider'
import { TelForm } from '../TelForm'
import type { TelConfig } from '../../../../types/qr'

const defaultConfig: TelConfig = {
  number: '',
}

const setup = (config: TelConfig = defaultConfig, overrides: Partial<{
  onNumberChange: (v: string) => void
}> = {}) => {
  const handlers = {
    onNumberChange: overrides.onNumberChange ?? vi.fn(),
  }

  const utils = render(
    <LocaleProvider>
      <TelForm config={config} {...handlers} />
    </LocaleProvider>
  )

  return { ...utils, ...handlers }
}

describe('TelForm', () => {
  it('renders the phone number field', () => {
    setup()
    expect(screen.getByRole('textbox', { name: /phone number/i })).toBeInTheDocument()
  })

  it('calls onNumberChange when the number is typed', () => {
    const { onNumberChange } = setup()
    fireEvent.change(screen.getByRole('textbox', { name: /phone number/i }), { target: { value: '+15551234567' } })
    expect(onNumberChange).toHaveBeenCalledWith('+15551234567')
  })

  it('reflects the config value in the input', () => {
    setup({ number: '+15551234567' })
    expect(screen.getByRole('textbox', { name: /phone number/i })).toHaveValue('+15551234567')
  })

  it('phone number field has type tel', () => {
    setup()
    expect(screen.getByRole('textbox', { name: /phone number/i })).toHaveAttribute('type', 'tel')
  })

  it('shows a validation error on blur with an invalid number', () => {
    setup({ number: 'call me' })
    fireEvent.blur(screen.getByRole('textbox', { name: /phone number/i }))
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('clears the number error on change after a blur error', () => {
    setup({ number: 'call me' })
    const numberInput = screen.getByRole('textbox', { name: /phone number/i })
    fireEvent.blur(numberInput)
    expect(screen.getByRole('alert')).toBeInTheDocument()
    fireEvent.change(numberInput, { target: { value: '+15551234567' } })
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})
