import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { LocaleProvider } from '../../../../hooks/LocaleProvider'
import { QRPreview } from '../QRPreview'

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

  it('renders QR code SVG when value is provided', () => {
    render(
      <LocaleProvider>
        <QRPreview {...defaultProps} value="https://example.com" />
      </LocaleProvider>,
    )

    // The placeholder should be gone
    expect(screen.queryByText('Enter text to generate')).not.toBeInTheDocument()

    // We expect an SVG or generic role="img" with the correct aria label
    const qrCode = screen.getByRole('img', { name: 'QR Code for value: https://example.com' })
    expect(qrCode).toBeInTheDocument()

    // Check if it is an SVG (qrcode.react renders an svg element)
    expect(qrCode.tagName.toLowerCase()).toBe('svg')
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

    const svg = screen.getByRole('img', { name: 'QR Code for value: Test Color' })

    // Check for foreground path (Red)
    const fgPath = svg.querySelector('path[fill="#FF0000"]')
    expect(fgPath).toBeInTheDocument()

    // Check for background path/rect (Blue)
    const bgElement = svg.querySelector('[fill="#0000FF"]')
    expect(bgElement).toBeInTheDocument()
  })

  it('renders with custom size', () => {
    render(
      <LocaleProvider>
        <QRPreview {...defaultProps} value="Test Size" size={128} />
      </LocaleProvider>,
    )

    const svg = screen.getByRole('img', { name: 'QR Code for value: Test Size' })
    expect(svg).toHaveAttribute('height', '128')
    expect(svg).toHaveAttribute('width', '128')
  })
})
