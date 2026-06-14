import { renderHook, act, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useQrScanner } from '../useQrScanner'
import * as qrDecode from '../../utils/qrDecode'

vi.mock('../../utils/qrDecode', async (importActual) => ({
  // Keep the pure scale-target helper real; only the impure decoders are stubbed.
  ...(await importActual<typeof import('../../utils/qrDecode')>()),
  isBarcodeDetectorSupported: vi.fn(() => true),
  decodeWithBarcodeDetector: vi.fn(),
  decodeImageData: vi.fn(),
}))

const mockedDecode = vi.mocked(qrDecode)

// Controllable fake <img>: src setter resolves onload (or onerror) on a microtask.
let imageShouldFail = false
let imageWidth = 0
let imageHeight = 0
class FakeImage {
  onload: (() => void) | null = null
  onerror: (() => void) | null = null
  naturalWidth = imageWidth
  naturalHeight = imageHeight
  set src(_value: string) {
    queueMicrotask(() => (imageShouldFail ? this.onerror?.() : this.onload?.()))
  }
}

/** Stubs the canvas 2D context so sourceToImageData can extract pixels under jsdom. */
function stubCanvas() {
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
    drawImage: vi.fn(),
    getImageData: (_x: number, _y: number, w: number, h: number) => ({
      data: new Uint8ClampedArray(w * h * 4),
      width: w,
      height: h,
      colorSpace: 'srgb' as const,
    }),
  } as unknown as CanvasRenderingContext2D)
}

function imageFile(type = 'image/png'): File {
  return new File(['x'], 'qr.png', { type })
}

beforeEach(() => {
  imageShouldFail = false
  imageWidth = 0
  imageHeight = 0
  mockedDecode.isBarcodeDetectorSupported.mockReturnValue(true)
  mockedDecode.decodeWithBarcodeDetector.mockReset()
  mockedDecode.decodeImageData.mockReset()
  vi.stubGlobal('Image', FakeImage)
  vi.stubGlobal('URL', {
    createObjectURL: vi.fn(() => 'blob:fake'),
    revokeObjectURL: vi.fn(),
  })
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('useQrScanner — file upload', () => {
  it('rejects a non-image file', async () => {
    const { result } = renderHook(() => useQrScanner())
    await act(async () => {
      await result.current.scanFile(new File(['x'], 'note.txt', { type: 'text/plain' }))
    })
    expect(result.current.error).toBe('unsupported-file')
    expect(result.current.decoded).toBeNull()
  })

  it('decodes a value from an image file', async () => {
    mockedDecode.decodeWithBarcodeDetector.mockResolvedValue('https://example.com')
    const { result } = renderHook(() => useQrScanner())
    await act(async () => {
      await result.current.scanFile(imageFile())
    })
    expect(result.current.decoded).toBe('https://example.com')
    expect(result.current.error).toBeNull()
  })

  it('reports no-code when nothing decodes', async () => {
    mockedDecode.decodeWithBarcodeDetector.mockResolvedValue(null)
    mockedDecode.decodeImageData.mockReturnValue(null)
    const { result } = renderHook(() => useQrScanner())
    await act(async () => {
      await result.current.scanFile(imageFile())
    })
    expect(result.current.error).toBe('no-code')
  })

  it('retries the decoder at smaller scales for an oversized image', async () => {
    // No BarcodeDetector → library fallback; a 4032px photo only reads once downscaled.
    mockedDecode.isBarcodeDetectorSupported.mockReturnValue(false)
    imageWidth = 4032
    imageHeight = 3024
    stubCanvas()
    // Fail the first two scales (1024, 800), decode on the third (640).
    mockedDecode.decodeImageData
      .mockReturnValueOnce(null)
      .mockReturnValueOnce(null)
      .mockReturnValueOnce('scaled-value')

    const { result } = renderHook(() => useQrScanner())
    await act(async () => {
      await result.current.scanFile(imageFile())
    })

    expect(result.current.decoded).toBe('scaled-value')
    expect(mockedDecode.decodeImageData).toHaveBeenCalledTimes(3)
  })

  it('decodes an upload via createImageBitmap, downscaling for quality', async () => {
    mockedDecode.isBarcodeDetectorSupported.mockReturnValue(false)
    stubCanvas()
    const close = vi.fn()
    const createImageBitmap = vi.fn(
      (_blob: Blob, opts?: { resizeWidth?: number; resizeHeight?: number }) =>
        Promise.resolve(
          opts?.resizeWidth
            ? { width: opts.resizeWidth, height: opts.resizeHeight, close }
            : { width: 4032, height: 3024, close },
        ),
    )
    vi.stubGlobal('createImageBitmap', createImageBitmap)
    // Fail the first two scales, decode on the third.
    mockedDecode.decodeImageData
      .mockReturnValueOnce(null)
      .mockReturnValueOnce(null)
      .mockReturnValueOnce('bitmap-value')

    const { result } = renderHook(() => useQrScanner())
    await act(async () => {
      await result.current.scanFile(imageFile())
    })

    expect(result.current.decoded).toBe('bitmap-value')
    expect(mockedDecode.decodeImageData).toHaveBeenCalledTimes(3)
    // Resized decodes request high-quality, EXIF-correct bitmaps.
    expect(createImageBitmap).toHaveBeenCalledWith(
      expect.any(File),
      expect.objectContaining({ resizeQuality: 'high', imageOrientation: 'from-image' }),
    )
  })

  it('falls back to the <img> path when createImageBitmap throws', async () => {
    mockedDecode.isBarcodeDetectorSupported.mockReturnValue(false)
    imageWidth = 300
    imageHeight = 300
    stubCanvas()
    vi.stubGlobal('createImageBitmap', vi.fn().mockRejectedValue(new Error('bad format')))
    mockedDecode.decodeImageData.mockReturnValue('img-fallback')

    const { result } = renderHook(() => useQrScanner())
    await act(async () => {
      await result.current.scanFile(imageFile())
    })

    expect(result.current.decoded).toBe('img-fallback')
  })

  it('reports decode-failed when the image cannot load', async () => {
    imageShouldFail = true
    const { result } = renderHook(() => useQrScanner())
    await act(async () => {
      await result.current.scanFile(imageFile())
    })
    expect(result.current.error).toBe('decode-failed')
  })

  it('clears state on reset', async () => {
    mockedDecode.decodeWithBarcodeDetector.mockResolvedValue('value')
    const { result } = renderHook(() => useQrScanner())
    await act(async () => {
      await result.current.scanFile(imageFile())
    })
    expect(result.current.decoded).toBe('value')
    act(() => result.current.reset())
    expect(result.current.decoded).toBeNull()
    expect(result.current.error).toBeNull()
  })
})

describe('useQrScanner — camera', () => {
  function attachVideo(result: { current: ReturnType<typeof useQrScanner> }) {
    const video = {
      srcObject: null as MediaStream | null,
      videoWidth: 0,
      videoHeight: 0,
      play: vi.fn().mockResolvedValue(undefined),
    }
    result.current.videoRef.current = video as unknown as HTMLVideoElement
    return video
  }

  it('reports camera-unsupported when getUserMedia is missing', async () => {
    vi.stubGlobal('navigator', {})
    const { result } = renderHook(() => useQrScanner())
    await act(async () => {
      await result.current.startCamera()
    })
    expect(result.current.error).toBe('camera-unsupported')
  })

  it('reports camera-denied when permission is refused', async () => {
    const getUserMedia = vi.fn().mockRejectedValue(
      Object.assign(new Error('denied'), { name: 'NotAllowedError' }),
    )
    vi.stubGlobal('navigator', { mediaDevices: { getUserMedia } })
    const { result } = renderHook(() => useQrScanner())
    await act(async () => {
      await result.current.startCamera()
    })
    expect(result.current.error).toBe('camera-denied')
    expect(result.current.isCameraActive).toBe(false)
  })

  it('starts the stream and decodes a frame, then stops', async () => {
    const stop = vi.fn()
    const stream = { getTracks: () => [{ stop }] } as unknown as MediaStream
    const getUserMedia = vi.fn().mockResolvedValue(stream)
    vi.stubGlobal('navigator', { mediaDevices: { getUserMedia } })
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
      queueMicrotask(() => cb(0))
      return 1
    })
    vi.stubGlobal('cancelAnimationFrame', vi.fn())
    mockedDecode.decodeWithBarcodeDetector.mockResolvedValue('frame-value')

    const { result } = renderHook(() => useQrScanner())
    attachVideo(result)
    await act(async () => {
      await result.current.startCamera()
    })
    await waitFor(() => expect(result.current.decoded).toBe('frame-value'))
    expect(stop).toHaveBeenCalled()
    expect(result.current.isCameraActive).toBe(false)
  })

  it('stops tracks on explicit stopCamera', async () => {
    const stop = vi.fn()
    const stream = { getTracks: () => [{ stop }] } as unknown as MediaStream
    const getUserMedia = vi.fn().mockResolvedValue(stream)
    vi.stubGlobal('navigator', { mediaDevices: { getUserMedia } })
    // Keep the scan loop idle so the stream stays open until we stop it.
    vi.stubGlobal('requestAnimationFrame', () => 1)
    vi.stubGlobal('cancelAnimationFrame', vi.fn())

    const { result } = renderHook(() => useQrScanner())
    attachVideo(result)
    await act(async () => {
      await result.current.startCamera()
    })
    expect(result.current.isCameraActive).toBe(true)
    act(() => result.current.stopCamera())
    expect(stop).toHaveBeenCalled()
    expect(result.current.isCameraActive).toBe(false)
  })
})
