import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { INPUT_LENGTH_LIMIT, useQRGenerator } from '../useQRGenerator'
import * as downloadUtils from '../../utils/download'
import * as qrShapeRenderer from '../../utils/qrShapeRenderer'
import * as svgExporter from '../../utils/export/svgExporter'
import type { QRDesignConfig } from '../../types/qr'

const DEFAULT_DESIGN_CONFIG: QRDesignConfig = { eyeShape: 'Square', pixelPattern: 'Square' }

vi.spyOn(downloadUtils, 'downloadBlob').mockImplementation(() => {})

vi.spyOn(qrShapeRenderer, 'generateQRPaths').mockReturnValue({
  dataPath: 'M0,0',
  eyesPath: 'M0,0',
  eyeBgPath: 'M0,0',
  size: 21,
})

vi.spyOn(svgExporter, 'exportSvg').mockResolvedValue(
  new Blob(['<svg/>'], { type: 'image/svg+xml' }),
)

// Stub canvas and Image so the PNG render path completes in jsdom
const fakeBlob = new Blob(['fake-png'], { type: 'image/png' })
HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
  clearRect: vi.fn(),
  drawImage: vi.fn(),
})
HTMLCanvasElement.prototype.toBlob = vi.fn().mockImplementation((cb: BlobCallback) => cb(fakeBlob))

class FakeImage {
  onload: (() => void) | null = null
  onerror: ((e: unknown) => void) | null = null
  set src(_: string) {
    setTimeout(() => this.onload?.(), 0)
  }
}
vi.stubGlobal('Image', FakeImage)

describe('useQRGenerator', () => {
  const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

  beforeEach(() => {
    vi.clearAllMocks()
    // Re-apply stubs cleared by clearAllMocks
    vi.spyOn(downloadUtils, 'downloadBlob').mockImplementation(() => {})
    vi.spyOn(qrShapeRenderer, 'generateQRPaths').mockReturnValue({
      dataPath: 'M0,0',
      eyesPath: 'M0,0',
      eyeBgPath: 'M0,0',
      size: 21,
    })
    vi.spyOn(svgExporter, 'exportSvg').mockResolvedValue(
      new Blob(['<svg/>'], { type: 'image/svg+xml' }),
    )
    HTMLCanvasElement.prototype.toBlob = vi.fn().mockImplementation((cb: BlobCallback) => cb(fakeBlob))
  })

  afterEach(() => {
    consoleErrorSpy.mockClear()
  })

  it('should initialize with default states', () => {
    const { result } = renderHook(() => useQRGenerator())

    expect(result.current.inputValue).toBe('')
    expect(result.current.config.value).toBe('')
    expect(result.current.isGenerating).toBe(false)
  })

  it('should update inputValue and generate config', () => {
    const { result } = renderHook(() => useQRGenerator())

    act(() => {
      result.current.setInputValue('test-value')
    })

    expect(result.current.inputValue).toBe('test-value')
    // Config should not update yet
    expect(result.current.config.value).toBe('')

    act(() => {
      result.current.generateQRCode()
    })

    expect(result.current.config.value).toBe('test-value')
  })

  it('should surface validation errors for inputs that exceed the limit', () => {
    const { result } = renderHook(() => useQRGenerator())
    const longValue = 'a'.repeat(INPUT_LENGTH_LIMIT + 1)

    act(() => {
      result.current.setInputValue(longValue)
    })

    expect(result.current.inputError).toBe(`Input too long (max ${INPUT_LENGTH_LIMIT} characters)`)
    expect(result.current.canGenerate).toBe(false)
  })

  it('should not generate QR code when validation fails', () => {
    const { result } = renderHook(() => useQRGenerator())
    const longValue = 'a'.repeat(INPUT_LENGTH_LIMIT + 1)

    act(() => {
      result.current.setInputValue(longValue)
    })

    act(() => {
      result.current.generateQRCode()
    })

    expect(result.current.config.value).toBe('')
    expect(result.current.inputError).toBe(`Input too long (max ${INPUT_LENGTH_LIMIT} characters)`)
  })

  it('should generate PNG download with custom design config', async () => {
    const { result } = renderHook(() => useQRGenerator())

    act(() => {
      result.current.setInputValue('test-qr')
    })
    act(() => {
      result.current.generateQRCode()
    })

    await act(async () => {
      await result.current.downloadPng(DEFAULT_DESIGN_CONFIG)
    })

    expect(qrShapeRenderer.generateQRPaths).toHaveBeenCalledWith(
      'test-qr',
      expect.any(String),
      DEFAULT_DESIGN_CONFIG.eyeShape,
      DEFAULT_DESIGN_CONFIG.pixelPattern,
    )
    expect(downloadUtils.downloadBlob).toHaveBeenCalled()
  })

  it('should generate SVG download with custom design config', async () => {
    const { result } = renderHook(() => useQRGenerator())

    act(() => {
      result.current.setInputValue('test-qr')
    })
    act(() => {
      result.current.generateQRCode()
    })

    await act(async () => {
      await result.current.downloadSvg(DEFAULT_DESIGN_CONFIG)
    })

    expect(svgExporter.exportSvg).toHaveBeenCalledWith(
      'test-qr',
      expect.objectContaining({ designConfig: DEFAULT_DESIGN_CONFIG }),
    )
    expect(downloadUtils.downloadBlob).toHaveBeenCalled()
  })

  it('should not download if no value is set', async () => {
    const { result } = renderHook(() => useQRGenerator())

    await act(async () => {
      await result.current.downloadPng(DEFAULT_DESIGN_CONFIG)
      await result.current.downloadSvg(DEFAULT_DESIGN_CONFIG)
    })

    expect(qrShapeRenderer.generateQRPaths).not.toHaveBeenCalled()
    expect(svgExporter.exportSvg).not.toHaveBeenCalled()
  })

  it('should handle PNG download errors gracefully', async () => {
    const { result } = renderHook(() => useQRGenerator())

    vi.spyOn(qrShapeRenderer, 'generateQRPaths').mockImplementation(() => {
      throw new Error('Generation failed')
    })

    act(() => {
      result.current.setInputValue('fail')
    })
    act(() => {
      result.current.generateQRCode()
    })

    await act(async () => {
      await result.current.downloadPng(DEFAULT_DESIGN_CONFIG)
    })

    expect(consoleErrorSpy).toHaveBeenCalled()
  })
})
