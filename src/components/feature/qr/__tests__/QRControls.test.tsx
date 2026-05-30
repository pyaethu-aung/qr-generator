import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import type { ComponentProps } from 'react'
import { LocaleProvider } from '../../../../hooks/LocaleProvider'
import { QRControls } from '../QRControls'

type QRControlsProps = ComponentProps<typeof QRControls>

const setup = (overrides: Partial<QRControlsProps> = {}) => {
  const onValueChange = vi.fn<(value: string) => void>()
  const onEcLevelChange = vi.fn<(level: QRControlsProps['ecLevel']) => void>()
  const onFgColorChange = vi.fn<(color: string) => void>()
  const onBgColorChange = vi.fn<(color: string) => void>()
  const onEyeShapeChange = vi.fn<QRControlsProps['onEyeShapeChange']>()
  const onPixelPatternChange = vi.fn<QRControlsProps['onPixelPatternChange']>()

  const baseProps: QRControlsProps = {
    value: '',
    ecLevel: 'M',
    eyeShape: 'Square',
    pixelPattern: 'Square',
    fgColor: '#000000',
    bgColor: '#ffffff',
    onValueChange,
    onEcLevelChange,
    onEyeShapeChange,
    onPixelPatternChange,
    onFgColorChange,
    onBgColorChange,
    canDownload: false,
  }

  const utils = render(
    <LocaleProvider>
      <QRControls {...baseProps} {...overrides} />
    </LocaleProvider>,
  )

  return {
    ...utils,
    onValueChange,
    onEcLevelChange,
    onEyeShapeChange,
    onPixelPatternChange,
    onFgColorChange,
    onBgColorChange,
  }
}

describe('QRControls configuration updates', () => {
  it('calls onValueChange when the input text changes', () => {
    const { onValueChange } = setup()

    fireEvent.change(screen.getByLabelText(/Link \/ Text/i), {
      target: { value: 'https://example.com' },
    })

    expect(onValueChange).toHaveBeenCalledWith('https://example.com')
  })

  it('calls onEcLevelChange when an EC Level pill button is clicked', () => {
    const { onEcLevelChange } = setup()

    fireEvent.click(screen.getByRole('button', { name: 'Max (30%)' }))

    expect(onEcLevelChange).toHaveBeenCalledWith('H')
  })

  it('marks the active EC Level pill with aria-pressed=true', () => {
    setup({ ecLevel: 'M' })

    const activeButton = screen.getByRole('button', { name: 'Medium (15%)' })
    expect(activeButton).toHaveAttribute('aria-pressed', 'true')

    const inactiveButton = screen.getByRole('button', { name: 'Low (7%)' })
    expect(inactiveButton).toHaveAttribute('aria-pressed', 'false')
  })

  it('[US1] calls onEyeShapeChange when an eye shape swatch is clicked', () => {
    const { onEyeShapeChange } = setup()

    fireEvent.click(screen.getByRole('button', { name: 'Hexagon' }))

    expect(onEyeShapeChange).toHaveBeenCalledWith('Hexagon')
  })

  it('[US2] calls onPixelPatternChange when a pixel pattern pill is clicked', () => {
    const { onPixelPatternChange } = setup()

    fireEvent.click(screen.getByRole('button', { name: 'Dots' }))

    expect(onPixelPatternChange).toHaveBeenCalledWith('Dots')
  })

  it('marks the active pixel pattern pill with aria-pressed=true', () => {
    setup({ eyeShape: 'Rounded', pixelPattern: 'Square' })

    // Use getByRole within the Pixel Pattern group to disambiguate from eye shape swatches
    const pixelGroup = screen.getByRole('group', { name: 'Pixel Pattern' })
    const activeButton = pixelGroup.querySelector('[aria-pressed="true"]')
    expect(activeButton).toHaveTextContent('Square')
  })

  it('calls color change handlers when pickers are used', () => {
    const { container, onFgColorChange, onBgColorChange } = setup()

    const colorInputs = Array.from(container.querySelectorAll('input[type="color"]'))
    expect(colorInputs).toHaveLength(2)

    fireEvent.change(colorInputs[0], { target: { value: '#ff0000' } })
    fireEvent.change(colorInputs[1], { target: { value: '#00ff00' } })

    expect(onFgColorChange).toHaveBeenCalledWith('#ff0000')
    expect(onBgColorChange).toHaveBeenCalledWith('#00ff00')
  })

  it('renders inline error when provided', () => {
    setup({ inputError: 'Input too long' })

    expect(screen.getByText('Input too long')).toBeInTheDocument()
  })

  it('renders download buttons with download icons when handlers provided', () => {
    const onDownloadPng = vi.fn()
    const onDownloadSvg = vi.fn()
    setup({ onDownloadPng, onDownloadSvg, canDownload: true })

    const pngButton = screen.getByRole('button', { name: /Download PNG/i })
    const svgButton = screen.getByRole('button', { name: /Download SVG/i })

    expect(pngButton.querySelector('svg')).toBeInTheDocument()
    expect(svgButton.querySelector('svg')).toBeInTheDocument()
  })

  it('does not render a "Download Formats" section divider', () => {
    const onDownloadPng = vi.fn()
    const onDownloadSvg = vi.fn()
    setup({ onDownloadPng, onDownloadSvg })

    expect(screen.queryByText('Download Formats')).not.toBeInTheDocument()
  })

  it('does not render a Generate button', () => {
    setup()

    expect(screen.queryByRole('button', { name: /Generate QR Code/i })).not.toBeInTheDocument()
  })
})
