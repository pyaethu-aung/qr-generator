import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import type { ReactElement } from 'react'
import { LocaleProvider } from '../../../../hooks/LocaleProvider'
import { QRGenerator } from '../QRGenerator'

describe('QRGenerator Integration', () => {
  const renderWithProviders = (ui: ReactElement) => render(<LocaleProvider>{ui}</LocaleProvider>)

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

  it('should generate QR code when user inputs text and clicks generate', async () => {
    renderWithProviders(<QRGenerator />)

    // User types into input
    const input = screen.getByLabelText(/Link \/ Text/i)
    fireEvent.change(input, { target: { value: 'https://example.com' } })
    expect(input).toHaveValue('https://example.com')

    // Click generate button
    const generateBtn = screen.getByRole('button', { name: /generate qr code/i })
    expect(generateBtn).not.toBeDisabled()
    fireEvent.click(generateBtn)

    // Verify QR code appears
    await waitFor(() => {
      const qrCode = screen.getByTestId('qr-code-canvas')
      expect(qrCode).toBeInTheDocument()
      expect(qrCode).toHaveAttribute('data-value', 'https://example.com')
    })

    // Verify placeholder is gone
    expect(screen.queryByRole('img', { name: /qr code placeholder/i })).not.toBeInTheDocument()
  })

  it('renders accessible preview aria labels after generation', async () => {
    renderWithProviders(<QRGenerator />)

    const input = screen.getByLabelText(/Link \/ Text/i)
    fireEvent.change(input, { target: { value: 'keyboard.com' } })
    const generateBtn = screen.getByRole('button', { name: /generate qr code/i })
    fireEvent.click(generateBtn)

    await waitFor(() => {
      expect(
        screen.getByRole('img', { name: /qr code for value: keyboard.com/i }),
      ).toBeInTheDocument()
    })
  })

  it('allows keyboard navigation to generate button and triggers via Enter', async () => {
    renderWithProviders(<QRGenerator />)
    const user = userEvent.setup()

    const input = screen.getByLabelText(/Link \/ Text/i)
    await user.click(input)
    await user.keyboard('https://kb.com')

    const generateBtn = screen.getByRole('button', { name: /generate qr code/i })
    let found = false
    for (let i = 0; i < 16; i += 1) {
      await user.tab()
      if (document.activeElement === generateBtn) {
        found = true
        break
      }
    }

    expect(found).toBe(true)
    await user.keyboard('{Enter}')

    await waitFor(() => {
      expect(screen.getByTestId('qr-code-canvas')).toBeInTheDocument()
    })
  })
})
