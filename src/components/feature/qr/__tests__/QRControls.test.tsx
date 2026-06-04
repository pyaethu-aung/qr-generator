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
  const onEyeFrameShapeChange = vi.fn<QRControlsProps['onEyeFrameShapeChange']>()
  const onEyeCenterShapeChange = vi.fn<QRControlsProps['onEyeCenterShapeChange']>()
  const onEyeFrameColorChange = vi.fn<QRControlsProps['onEyeFrameColorChange']>()
  const onEyeCenterColorChange = vi.fn<QRControlsProps['onEyeCenterColorChange']>()
  const onPixelPatternChange = vi.fn<QRControlsProps['onPixelPatternChange']>()

  const baseProps: QRControlsProps = {
    value: '',
    ecLevel: 'M',
    eyeFrameShape: 'Square',
    eyeCenterShape: 'Square',
    eyeFrameColor: null,
    eyeCenterColor: null,
    pixelPattern: 'Square',
    fgColor: '#000000',
    bgColor: '#ffffff',
    onValueChange,
    onEcLevelChange,
    onEyeFrameShapeChange,
    onEyeCenterShapeChange,
    onEyeFrameColorChange,
    onEyeCenterColorChange,
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
    onEyeFrameShapeChange,
    onEyeCenterShapeChange,
    onEyeFrameColorChange,
    onEyeCenterColorChange,
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

    fireEvent.click(screen.getByRole('button', { name: 'Highest (30%)' }))

    expect(onEcLevelChange).toHaveBeenCalledWith('H')
  })

  it('marks the active EC Level pill with aria-pressed=true', () => {
    setup({ ecLevel: 'M' })

    const activeButton = screen.getByRole('button', { name: 'Medium (15%)' })
    expect(activeButton).toHaveAttribute('aria-pressed', 'true')

    const inactiveButton = screen.getByRole('button', { name: 'Low (7%)' })
    expect(inactiveButton).toHaveAttribute('aria-pressed', 'false')
  })

  it('[US1] calls onEyeFrameShapeChange when an eye border swatch is clicked', () => {
    const { onEyeFrameShapeChange } = setup()

    fireEvent.click(screen.getByRole('button', { name: 'Hexagon frame' }))

    expect(onEyeFrameShapeChange).toHaveBeenCalledWith('Hexagon')
  })

  it('[US1] calls onEyeCenterShapeChange when an eye center swatch is clicked', () => {
    const { onEyeCenterShapeChange } = setup()

    fireEvent.click(screen.getByRole('button', { name: 'Dot center' }))

    expect(onEyeCenterShapeChange).toHaveBeenCalledWith('Dot')
  })

  it('border and center shape pickers are independent groups', () => {
    setup({ eyeFrameShape: 'Circle', eyeCenterShape: 'Diamond' })

    const borderGroup = screen.getByRole('group', { name: 'Eye Border' })
    const centerGroup = screen.getByRole('group', { name: 'Eye Center' })

    expect(borderGroup.querySelector('[aria-pressed="true"]')).toHaveAttribute('aria-label', 'Circle frame')
    expect(centerGroup.querySelector('[aria-pressed="true"]')).toHaveAttribute('aria-label', 'Diamond center')
  })

  it('reveals "Match foreground" reset only after an eye color is set, and reverts to inherit', () => {
    const { rerender, onEyeFrameColorChange } = setup()

    // Inherit by default → no reset link
    expect(screen.queryByRole('button', { name: 'Match foreground' })).not.toBeInTheDocument()

    rerender(
      <LocaleProvider>
        <QRControls
          value=""
          ecLevel="M"
          eyeFrameShape="Square"
          eyeCenterShape="Square"
          eyeFrameColor="#ff0000"
          eyeCenterColor={null}
          pixelPattern="Square"
          fgColor="#000000"
          bgColor="#ffffff"
          onValueChange={vi.fn()}
          onEcLevelChange={vi.fn()}
          onEyeFrameShapeChange={vi.fn()}
          onEyeCenterShapeChange={vi.fn()}
          onEyeFrameColorChange={onEyeFrameColorChange}
          onEyeCenterColorChange={vi.fn()}
          onPixelPatternChange={vi.fn()}
          onFgColorChange={vi.fn()}
          onBgColorChange={vi.fn()}
        />
      </LocaleProvider>,
    )

    const reset = screen.getByRole('button', { name: 'Match foreground' })
    fireEvent.click(reset)
    expect(onEyeFrameColorChange).toHaveBeenCalledWith(null)
  })

  it('[US2] calls onPixelPatternChange when a pixel pattern pill is clicked', () => {
    const { onPixelPatternChange } = setup()

    fireEvent.click(screen.getByRole('button', { name: 'Dots pattern' }))

    expect(onPixelPatternChange).toHaveBeenCalledWith('Dots')
  })

  it('marks the active pixel pattern swatch with aria-pressed=true', () => {
    setup({ eyeFrameShape: 'Rounded', pixelPattern: 'Square' })

    const pixelGroup = screen.getByRole('group', { name: 'Pixel Pattern' })
    const activeButton = pixelGroup.querySelector('[aria-pressed="true"]')
    expect(activeButton).toHaveAttribute('aria-label', 'Square pattern')
  })

  it('calls color change handlers when pickers are used', () => {
    const { container, onFgColorChange, onBgColorChange, onEyeFrameColorChange, onEyeCenterColorChange } = setup()

    // Foreground, Background, Eye Border, Eye Center
    const colorInputs = Array.from(container.querySelectorAll('input[type="color"]'))
    expect(colorInputs).toHaveLength(4)

    fireEvent.change(colorInputs[0], { target: { value: '#ff0000' } })
    fireEvent.change(colorInputs[1], { target: { value: '#00ff00' } })
    fireEvent.change(colorInputs[2], { target: { value: '#0000ff' } })
    fireEvent.change(colorInputs[3], { target: { value: '#abcdef' } })

    expect(onFgColorChange).toHaveBeenCalledWith('#ff0000')
    expect(onBgColorChange).toHaveBeenCalledWith('#00ff00')
    expect(onEyeFrameColorChange).toHaveBeenCalledWith('#0000ff')
    expect(onEyeCenterColorChange).toHaveBeenCalledWith('#abcdef')
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

describe('color contrast warning', () => {
  it('does not show a warning when contrast is good (dark on light)', () => {
    setup({ fgColor: '#000000', bgColor: '#ffffff' })

    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('shows a "Contrast Risk" warning when fg/bg contrast ratio is below 3:1', () => {
    // #cccccc on #ffffff ≈ 1.6:1 — well below threshold
    setup({ fgColor: '#cccccc', bgColor: '#ffffff' })

    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByText('Contrast Risk')).toBeInTheDocument()
  })

  it('shows an "Inverted Colors" warning when fg is lighter than bg with good contrast', () => {
    // #ffffff on #000000 is 21:1 but inverted
    setup({ fgColor: '#ffffff', bgColor: '#000000' })

    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByText('Inverted Colors')).toBeInTheDocument()
  })

  it('hides the warning after the dismiss button is clicked', () => {
    setup({ fgColor: '#cccccc', bgColor: '#ffffff' })

    fireEvent.click(screen.getByRole('button', { name: 'Dismiss contrast warning' }))

    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('resets dismissal and shows warning again when colors change', () => {
    const { rerender } = setup({ fgColor: '#cccccc', bgColor: '#ffffff' })

    fireEvent.click(screen.getByRole('button', { name: 'Dismiss contrast warning' }))
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()

    rerender(
      <LocaleProvider>
        <QRControls
          value=""
          ecLevel="M"
          eyeFrameShape="Square"
          eyeCenterShape="Square"
          eyeFrameColor={null}
          eyeCenterColor={null}
          pixelPattern="Square"
          fgColor="#dddddd"
          bgColor="#ffffff"
          onValueChange={vi.fn()}
          onEcLevelChange={vi.fn()}
          onEyeFrameShapeChange={vi.fn()}
          onEyeCenterShapeChange={vi.fn()}
          onEyeFrameColorChange={vi.fn()}
          onEyeCenterColorChange={vi.fn()}
          onPixelPatternChange={vi.fn()}
          onFgColorChange={vi.fn()}
          onBgColorChange={vi.fn()}
        />
      </LocaleProvider>,
    )

    expect(screen.getByRole('alert')).toBeInTheDocument()
  })
})
