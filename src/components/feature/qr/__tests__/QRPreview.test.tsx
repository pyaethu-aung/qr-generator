import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { LocaleProvider } from '../../../../hooks/LocaleProvider'
import { QRPreview } from '../QRPreview'

describe('QRPreview', () => {
  const defaultProps = {
    value: '',
    ecLevel: 'M' as const,
    fgColor: '#000000',
    bgColor: '#ffffff',
    designConfig: {
      eyeShape: 'Square' as const,
      pixelPattern: 'Square' as const,
    },
  }

  it('renders placeholder when value is empty', () => {
    render(
      <LocaleProvider>
        <QRPreview {...defaultProps} value="" />
      </LocaleProvider>,
    )

    expect(screen.getByText('QR preview')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'QR Code Placeholder' })).toBeInTheDocument()
  })

  it('renders a disabled share button while no QR is generated', () => {
    render(
      <LocaleProvider>
        <QRPreview {...defaultProps} value="" />
      </LocaleProvider>,
    )

    const shareButton = screen.getByRole('button', { name: 'Share QR code' })
    expect(shareButton).toBeDisabled()
    expect(shareButton).toHaveAttribute('aria-disabled', 'true')
    expect(shareButton).not.toHaveAttribute('aria-describedby')
  })

  it('renders share button with a share-2 icon', () => {
    render(
      <LocaleProvider>
        <QRPreview {...defaultProps} value="" />
      </LocaleProvider>,
    )

    const shareButton = screen.getByRole('button', { name: 'Share QR code' })
    expect(shareButton.querySelector('svg')).toBeInTheDocument()
  })

  it('renders the share button below the preview area (not inside it)', () => {
    const { container } = render(
      <LocaleProvider>
        <QRPreview {...defaultProps} value="" />
      </LocaleProvider>,
    )

    const previewBox = container.querySelector('.bg-surface-inset.rounded-lg.border')
    const shareButton = screen.getByRole('button', { name: 'Share QR code' })
    expect(previewBox).toBeInTheDocument()
    expect(previewBox?.contains(shareButton)).toBe(false)
  })

  it('does not render a download button inside the preview', () => {
    render(
      <LocaleProvider>
        <QRPreview {...defaultProps} value="" />
      </LocaleProvider>,
    )

    expect(screen.queryByTestId('download-qr-button')).not.toBeInTheDocument()
  })

  it('renders QR code canvas when value is provided', () => {
    render(
      <LocaleProvider>
        <QRPreview {...defaultProps} value="https://example.com" />
      </LocaleProvider>,
    )

    expect(screen.queryByText('Enter text to generate')).not.toBeInTheDocument()

    const qrCode = screen.getByTestId('qr-code-canvas')
    expect(qrCode).toBeInTheDocument()
    expect(qrCode).toHaveAttribute('aria-label', 'QR Code for value: https://example.com')

    const shareButton = screen.getByRole('button', { name: 'Share QR code' })
    expect(shareButton).toBeEnabled()
    expect(shareButton).toHaveAttribute('aria-disabled', 'false')
    expect(shareButton).not.toHaveAttribute('aria-describedby')
  })

  it('applies foreground and background colors correctly', () => {
    const customProps = {
      ...defaultProps,
      value: 'Test Color',
      fgColor: '#FF0000',
      bgColor: '#0000FF',
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
    expect(canvas).toHaveAttribute('width', '128')
    expect(canvas).toHaveAttribute('height', '128')
  })

  it('handles forwardedRef as a function', () => {
    const ref = vi.fn()
    render(
      <LocaleProvider>
        <QRPreview {...defaultProps} value="https://example.com" ref={ref} />
      </LocaleProvider>,
    )
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLCanvasElement))
  })

  it('handles forwardedRef as an object', () => {
    const ref = { current: null }
    render(
      <LocaleProvider>
        <QRPreview {...defaultProps} value="https://example.com" ref={ref} />
      </LocaleProvider>,
    )
    expect(ref.current).toBeInstanceOf(HTMLCanvasElement)
  })
})
