import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { LocaleProvider } from '../../../../hooks/LocaleProvider'
import { EmailForm } from '../EmailForm'
import type { EmailConfig } from '../../../../types/qr'

const defaultConfig: EmailConfig = {
  to: '',
  subject: '',
  body: '',
}

const setup = (config: EmailConfig = defaultConfig, overrides: Partial<{
  onToChange: (v: string) => void
  onSubjectChange: (v: string) => void
  onBodyChange: (v: string) => void
}> = {}) => {
  const handlers = {
    onToChange: overrides.onToChange ?? vi.fn(),
    onSubjectChange: overrides.onSubjectChange ?? vi.fn(),
    onBodyChange: overrides.onBodyChange ?? vi.fn(),
  }

  const utils = render(
    <LocaleProvider>
      <EmailForm config={config} {...handlers} />
    </LocaleProvider>
  )

  return { ...utils, ...handlers }
}

describe('EmailForm', () => {
  it('renders To, Subject, and Message fields', () => {
    setup()
    expect(screen.getByLabelText(/^To$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Subject/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Message/i)).toBeInTheDocument()
  })

  it('calls onToChange when To is typed', () => {
    const { onToChange } = setup()
    fireEvent.change(screen.getByLabelText(/^To$/i), { target: { value: 'jane@example.com' } })
    expect(onToChange).toHaveBeenCalledWith('jane@example.com')
  })

  it('calls onSubjectChange when Subject is typed', () => {
    const { onSubjectChange } = setup()
    fireEvent.change(screen.getByLabelText(/Subject/i), { target: { value: 'Hello' } })
    expect(onSubjectChange).toHaveBeenCalledWith('Hello')
  })

  it('calls onBodyChange when Message is typed', () => {
    const { onBodyChange } = setup()
    fireEvent.change(screen.getByLabelText(/Message/i), { target: { value: 'Hi there' } })
    expect(onBodyChange).toHaveBeenCalledWith('Hi there')
  })

  it('reflects config values in inputs', () => {
    setup({ to: 'jane@example.com', subject: 'Hello', body: 'Hi' })
    expect(screen.getByLabelText(/^To$/i)).toHaveValue('jane@example.com')
    expect(screen.getByLabelText(/Subject/i)).toHaveValue('Hello')
    expect(screen.getByLabelText(/Message/i)).toHaveValue('Hi')
  })

  it('To field has type email', () => {
    setup()
    expect(screen.getByLabelText(/^To$/i)).toHaveAttribute('type', 'email')
  })

  it('Message field is a textarea', () => {
    setup()
    expect(screen.getByLabelText(/Message/i).tagName).toBe('TEXTAREA')
  })
})
