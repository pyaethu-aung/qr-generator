import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { LocaleProvider } from '../../../../hooks/LocaleProvider'
import { QRPreview } from '../QRPreview'

vi.mock('qrcode.react', () => {
  const QRCodeMock = ({
    value,
    fgColor,
    bgColor,
    size,
  }: {
    value: string
    fgColor?: string
    bgColor?: string
    size?: number
  }) => (
    <div
      data-testid="qr-code-canvas"
      data-value={value}
      data-fg={fgColor ?? ''}
      data-bg={bgColor ?? ''}
      data-size={size?.toString() ?? ''}
      role="img"
      aria-label={`QR Code for value: ${value}`}
    >
      QR Code: {value}
    </div>
  )

  return {
    QRCodeCanvas: QRCodeMock,
  }
})

describe('QRPreview', () => {
  const defaultProps = {
    value: '',
    ecLevel: 'M' as const,
    fgColor: '#000000',
    bgColor: '#ffffff',
  }

  it('renders placeholder when value is empty', () => {
    render(
      <LocaleProvider>
        <QRPreview {...defaultProps} value="" />
      </LocaleProvider>,
    )

    expect(screen.getByText('Enter text to generate')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'QR Code Placeholder' })).toBeInTheDocument()
  })

  it('renders QR code canvas when value is provided', () => {
    render(
      <LocaleProvider>
        <QRPreview {...defaultProps} value="https://example.com" />
      </LocaleProvider>,
    )

    // The placeholder should be gone
    expect(screen.queryByText('Enter text to generate')).not.toBeInTheDocument()

    const qrCode = screen.getByTestId('qr-code-canvas')
    expect(qrCode).toBeInTheDocument()
    expect(qrCode).toHaveAttribute('aria-label', 'QR Code for value: https://example.com')
  })

  it('applies foreground and background colors correctly', () => {
    const customProps = {
      ...defaultProps,
      value: 'Test Color',
      fgColor: '#FF0000', // Red
      bgColor: '#0000FF', // Blue
    }

    render(
      <LocaleProvider>
        <QRPreview {...customProps} />
      </LocaleProvider>,
    )

    const canvas = screen.getByTestId('qr-code-canvas')
    expect(canvas).toHaveAttribute('data-fg', '#FF0000')
    expect(canvas).toHaveAttribute('data-bg', '#0000FF')
  })

  it('renders with custom size', () => {
    render(
      <LocaleProvider>
        <QRPreview {...defaultProps} value="Test Size" size={128} />
      </LocaleProvider>,
    )

    const canvas = screen.getByTestId('qr-code-canvas')
    expect(canvas).toHaveAttribute('data-size', '128')
  })
})
