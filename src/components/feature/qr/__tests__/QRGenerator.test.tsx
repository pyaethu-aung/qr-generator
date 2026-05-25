import { render, screen, fireEvent, act } from '@testing-library/react'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import type { ReactElement } from 'react'
import { LocaleProvider } from '../../../../hooks/LocaleProvider'
import { QRGenerator } from '../QRGenerator'

describe('QRGenerator Integration', () => {
  const renderWithProviders = (ui: ReactElement) => render(<LocaleProvider>{ui}</LocaleProvider>)

  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should render the generator layout', () => {
    renderWithProviders(<QRGenerator />)
    expect(screen.getByText('Configuration')).toBeInTheDocument()
    expect(screen.getByText('Preview')).toBeInTheDocument()
  })

  it('should show placeholder initially', () => {
    renderWithProviders(<QRGenerator />)
    expect(screen.getByRole('img', { name: /qr code placeholder/i })).toBeInTheDocument()
    expect(screen.queryByTestId('qr-code-canvas')).not.toBeInTheDocument()
  })

  it('should not render a Generate button', () => {
    renderWithProviders(<QRGenerator />)
    expect(screen.queryByRole('button', { name: /generate qr code/i })).not.toBeInTheDocument()
  })

  it('should show QR code after typing input and debounce delay', () => {
    renderWithProviders(<QRGenerator />)

    const input = screen.getByLabelText(/Link \/ Text/i)
    fireEvent.change(input, { target: { value: 'https://example.com' } })

    // Canvas should not appear before the debounce fires
    expect(screen.queryByTestId('qr-code-canvas')).not.toBeInTheDocument()

    // Advance past the 300ms debounce
    act(() => {
      vi.advanceTimersByTime(300)
    })

    const qrCode = screen.getByTestId('qr-code-canvas')
    expect(qrCode).toBeInTheDocument()
    expect(qrCode).toHaveAttribute('data-value', 'https://example.com')

    // Placeholder gone
    expect(screen.queryByRole('img', { name: /qr code placeholder/i })).not.toBeInTheDocument()
  })

  it('renders accessible preview aria labels after input debounce', () => {
    renderWithProviders(<QRGenerator />)

    const input = screen.getByLabelText(/Link \/ Text/i)
    fireEvent.change(input, { target: { value: 'keyboard.com' } })

    act(() => {
      vi.advanceTimersByTime(300)
    })

    expect(
      screen.getByRole('img', { name: /qr code for value: keyboard.com/i }),
    ).toBeInTheDocument()
  })

  it('updates the live preview when settings change without re-typing', () => {
    renderWithProviders(<QRGenerator />)

    const input = screen.getByLabelText(/Link \/ Text/i)
    fireEvent.change(input, { target: { value: 'https://example.com' } })

    act(() => {
      vi.advanceTimersByTime(300)
    })

    expect(screen.getByTestId('qr-code-canvas')).toHaveAttribute('data-value', 'https://example.com')

    // Changing EC level should not remove the preview — no Generate click needed
    fireEvent.click(screen.getByRole('button', { name: 'Max (30%)' }))

    expect(screen.getByTestId('qr-code-canvas')).toBeInTheDocument()
  })
})
