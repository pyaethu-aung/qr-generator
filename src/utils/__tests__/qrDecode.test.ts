import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import jsQR from 'jsqr'
import {
  decodeImageData,
  isBarcodeDetectorSupported,
  decodeWithBarcodeDetector,
} from '../qrDecode'

vi.mock('jsqr', () => ({ default: vi.fn() }))

const mockedJsQR = vi.mocked(jsQR)

function fakeImageData(): ImageData {
  return {
    data: new Uint8ClampedArray(4),
    width: 1,
    height: 1,
    colorSpace: 'srgb',
  }
}

describe('decodeImageData', () => {
  beforeEach(() => mockedJsQR.mockReset())

  it('returns the decoded string when jsQR finds a code', () => {
    mockedJsQR.mockReturnValue({ data: 'https://example.com' } as ReturnType<typeof jsQR>)
    expect(decodeImageData(fakeImageData())).toBe('https://example.com')
  })

  it('returns null when jsQR finds nothing', () => {
    mockedJsQR.mockReturnValue(null)
    expect(decodeImageData(fakeImageData())).toBeNull()
  })

  it('passes attemptBoth so inverted codes are decoded', () => {
    mockedJsQR.mockReturnValue(null)
    decodeImageData(fakeImageData())
    expect(mockedJsQR).toHaveBeenCalledWith(
      expect.any(Uint8ClampedArray),
      1,
      1,
      { inversionAttempts: 'attemptBoth' },
    )
  })
})

describe('BarcodeDetector wrapper', () => {
  const original = (globalThis as Record<string, unknown>).BarcodeDetector

  afterEach(() => {
    if (original === undefined) {
      delete (globalThis as Record<string, unknown>).BarcodeDetector
    } else {
      ;(globalThis as Record<string, unknown>).BarcodeDetector = original
    }
  })

  it('reports unsupported when the global is absent', () => {
    delete (globalThis as Record<string, unknown>).BarcodeDetector
    expect(isBarcodeDetectorSupported()).toBe(false)
  })

  /** Installs a stub `BarcodeDetector` whose `detect` resolves/rejects as given. */
  function stubDetector(detect: () => Promise<unknown>) {
    ;(globalThis as Record<string, unknown>).BarcodeDetector = class {
      detect = detect
    }
    return detect
  }

  it('reports supported and decodes the first result', async () => {
    const detect = stubDetector(vi.fn().mockResolvedValue([{ rawValue: 'scanned-value' }]))

    expect(isBarcodeDetectorSupported()).toBe(true)
    const source = {} as ImageBitmapSource
    await expect(decodeWithBarcodeDetector(source)).resolves.toBe('scanned-value')
    expect(detect).toHaveBeenCalledWith(source)
  })

  it('returns null when the detector finds no codes', async () => {
    stubDetector(vi.fn().mockResolvedValue([]))
    await expect(decodeWithBarcodeDetector({} as ImageBitmapSource)).resolves.toBeNull()
  })

  it('returns null (not throw) when detection rejects', async () => {
    stubDetector(vi.fn().mockRejectedValue(new Error('boom')))
    await expect(decodeWithBarcodeDetector({} as ImageBitmapSource)).resolves.toBeNull()
  })

  it('returns null from decode when the global is absent', async () => {
    delete (globalThis as Record<string, unknown>).BarcodeDetector
    await expect(decodeWithBarcodeDetector({} as ImageBitmapSource)).resolves.toBeNull()
  })
})
