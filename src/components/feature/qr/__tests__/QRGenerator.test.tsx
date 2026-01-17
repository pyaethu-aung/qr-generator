import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { QRGenerator } from '../QRGenerator'

// Mock qrcode.react simply to avoid canvas/DOM issues and verify props
vi.mock('qrcode.react', () => ({
  QRCodeSVG: ({ value }: { value: string }) => (
    <div data-testid="qr-code-svg" data-value={value}>
      QR Code: {value}
    </div>
  ),
}))

describe('QRGenerator Integration', () => {
  it('should render the generator layout', () => {
    render(<QRGenerator />)
    expect(screen.getByText('Configuration')).toBeInTheDocument()
    expect(screen.getByText('Preview')).toBeInTheDocument()
  })

  it('should show placeholder initially', () => {
    render(<QRGenerator />)
    expect(screen.getByRole('img', { name: /qr code placeholder/i })).toBeInTheDocument()
    expect(screen.queryByTestId('qr-code-svg')).not.toBeInTheDocument()
  })

  it('should generate QR code when user inputs text and clicks generate', async () => {
    render(<QRGenerator />)

    // User types into input
    const input = screen.getByLabelText(/content/i)
    fireEvent.change(input, { target: { value: 'https://example.com' } })
    expect(input).toHaveValue('https://example.com')

    // Click generate button
    const generateBtn = screen.getByRole('button', { name: /generate qr code/i })
    expect(generateBtn).not.toBeDisabled()
    fireEvent.click(generateBtn)

    // Verify QR code appears
    await waitFor(() => {
      const qrCode = screen.getByTestId('qr-code-svg')
      expect(qrCode).toBeInTheDocument()
      expect(qrCode).toHaveAttribute('data-value', 'https://example.com')
    })

    // Verify placeholder is gone
    expect(screen.queryByRole('img', { name: /qr code placeholder/i })).not.toBeInTheDocument()
  })
})
