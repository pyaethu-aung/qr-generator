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
  const onGenerate = vi.fn<() => void>()

  const baseProps: QRControlsProps = {
    value: '',
    ecLevel: 'M',
    fgColor: '#000000',
    bgColor: '#ffffff',
    onValueChange,
    onEcLevelChange,
    onFgColorChange,
    onBgColorChange,
    onGenerate,
    isGenerating: false,
    canDownload: false,
    canGenerate: true,
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
    onFgColorChange,
    onBgColorChange,
    onGenerate,
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

  it('calls onEcLevelChange when the correction level changes', () => {
    const { onEcLevelChange } = setup()

    fireEvent.change(screen.getByRole('combobox'), {
      target: { value: 'H' },
    })

    expect(onEcLevelChange).toHaveBeenCalledWith('H')
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

  it('triggers onGenerate when Enter key is pressed in the content input', () => {
    const { onGenerate } = setup({ canGenerate: true, isGenerating: false })

    fireEvent.keyDown(screen.getByLabelText(/Link \/ Text/i), {
      key: 'Enter',
      code: 'Enter',
      charCode: 13,
    })

    expect(onGenerate).toHaveBeenCalledTimes(1)
  })

  it('does not trigger onGenerate when Enter is pressed but generation is disabled', () => {
    const { onGenerate } = setup({ canGenerate: false })

    fireEvent.keyDown(screen.getByLabelText(/Link \/ Text/i), {
      key: 'Enter',
    })

    expect(onGenerate).not.toHaveBeenCalled()
  })
})
