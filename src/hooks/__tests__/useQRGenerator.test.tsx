import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import type { MockedFunction } from 'vitest'
import { INPUT_LENGTH_LIMIT, useQRGenerator } from '../useQRGenerator'
import * as downloadUtils from '../../utils/download'

type ToDataURLArgs = [string, { width: number; margin: number }]
type ToStringArgs = [string, { type: 'svg'; width: number; margin: number }]
type ToDataURL = (...args: ToDataURLArgs) => Promise<string>
type ToString = (...args: ToStringArgs) => Promise<string>
type QRCodeMockModule = {
  default: {
    toDataURL: MockedFunction<ToDataURL>
    toString: MockedFunction<ToString>
  }
}

let toDataURLMock: MockedFunction<ToDataURL>
let toStringMock: MockedFunction<ToString>

// Mock dependencies
vi.mock('qrcode', () => ({
  default: {
    toDataURL: vi.fn<ToDataURL>(),
    toString: vi.fn<ToString>(),
  },
}))

vi.spyOn(downloadUtils, 'downloadBlob').mockImplementation(() => {})

describe('useQRGenerator', () => {
  const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

  beforeEach(async () => {
    vi.clearAllMocks()
    const qrcodeModule = (await import('qrcode')) as unknown as QRCodeMockModule
    toDataURLMock = qrcodeModule.default.toDataURL
    toStringMock = qrcodeModule.default.toString
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

  it('should generate PNG download', async () => {
    const { result } = renderHook(() => useQRGenerator())

    // Setup fetch mock for blobs
    global.fetch = vi.fn().mockResolvedValue({
      blob: () => Promise.resolve(new Blob(['fake-png'], { type: 'image/png' })),
    } as Response)

    // Setup qrcode mock
    toDataURLMock.mockResolvedValue('data:image/png;base64,fake')

    // 1. Set Value
    act(() => {
      result.current.setInputValue('test-qr')
    })

    // 2. Generate (must be separate act to ensure state update propagates)
    act(() => {
      result.current.generateQRCode()
    })

    // 3. Trigger Download
    await act(async () => {
      await result.current.downloadPng()
    })

    expect(toDataURLMock).toHaveBeenCalledWith(
      'test-qr',
      expect.objectContaining({
        width: 1024,
        margin: 1,
      }),
    )
    expect(global.fetch).toHaveBeenCalledWith('data:image/png;base64,fake')
    expect(downloadUtils.downloadBlob).toHaveBeenCalled()
  })

  it('should generate SVG download', async () => {
    const { result } = renderHook(() => useQRGenerator())

    // Setup qrcode mock
    toStringMock.mockResolvedValue('<svg>fake</svg>')

    // 1. Set Value
    act(() => {
      result.current.setInputValue('test-qr')
    })

    // 2. Generate
    act(() => {
      result.current.generateQRCode()
    })

    // 3. Trigger Download
    await act(async () => {
      await result.current.downloadSvg()
    })

    expect(toStringMock).toHaveBeenCalledWith(
      'test-qr',
      expect.objectContaining({
        type: 'svg',
        width: 1024,
        margin: 1,
      }),
    )
    expect(downloadUtils.downloadBlob).toHaveBeenCalled()
  })

  it('should not download if no value is set', async () => {
    const { result } = renderHook(() => useQRGenerator())

    await act(async () => {
      await result.current.downloadPng()
      await result.current.downloadSvg()
    })

    expect(toDataURLMock).not.toHaveBeenCalled()
    expect(toStringMock).not.toHaveBeenCalled()
  })

  it('should handle PNG download errors gracefully', async () => {
    const { result } = renderHook(() => useQRGenerator())

    toDataURLMock.mockRejectedValue(new Error('Generation failed'))

    act(() => {
      result.current.setInputValue('fail')
    })

    act(() => {
      result.current.generateQRCode()
    })

    await act(async () => {
      await result.current.downloadPng()
    })

    expect(consoleErrorSpy).toHaveBeenCalled()
  })
})
