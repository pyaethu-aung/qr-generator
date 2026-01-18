import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useQRGenerator } from '../useQRGenerator'
import QRCode from 'qrcode'
import * as downloadUtils from '../../utils/download'

// Mock dependencies
vi.mock('qrcode', () => ({
  default: {
    toDataURL: vi.fn().mockResolvedValue(''),
    toString: vi.fn().mockResolvedValue(''),
  },
}))

const mockedQRCode = vi.mocked(QRCode, true)

vi.spyOn(downloadUtils, 'downloadBlob').mockImplementation(() => {})

describe('useQRGenerator', () => {
  const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

  beforeEach(() => {
    vi.clearAllMocks()
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

  it('should generate PNG download', async () => {
    const { result } = renderHook(() => useQRGenerator())

    // Setup fetch mock for blobs
    global.fetch = vi.fn().mockResolvedValue({
      blob: () => Promise.resolve(new Blob(['fake-png'], { type: 'image/png' })),
    } as Response)

    // Setup qrcode mock
    mockedQRCode.toDataURL.mockResolvedValue('data:image/png;base64,fake')

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

    expect(QRCode.toDataURL).toHaveBeenCalledWith(
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
    mockedQRCode.toString.mockResolvedValue('<svg>fake</svg>')

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

    expect(QRCode.toString).toHaveBeenCalledWith(
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

    expect(QRCode.toDataURL).not.toHaveBeenCalled()
    expect(QRCode.toString).not.toHaveBeenCalled()
  })

  it('should handle PNG download errors gracefully', async () => {
    const { result } = renderHook(() => useQRGenerator())

    mockedQRCode.toDataURL.mockRejectedValue(new Error('Generation failed'))

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
