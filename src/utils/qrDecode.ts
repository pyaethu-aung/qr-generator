import jsQR from 'jsqr'

/**
 * Decodes a QR code from raw pixel data using the jsQR library. Pure and synchronous —
 * the camera/upload glue is responsible for turning a frame or file into ImageData via a
 * canvas. `attemptBoth` lets jsQR find both dark-on-light and inverted codes. Returns the
 * decoded string, or null when no QR is found in the frame.
 */
export function decodeImageData(image: ImageData): string | null {
  const result = jsQR(image.data, image.width, image.height, {
    inversionAttempts: 'attemptBoth',
  })
  return result?.data ?? null
}

/** Minimal shape of a `BarcodeDetector` detection result (only the field we read). */
interface DetectedBarcodeLike {
  rawValue: string
}

interface BarcodeDetectorLike {
  detect(source: ImageBitmapSource): Promise<DetectedBarcodeLike[]>
}

interface BarcodeDetectorConstructor {
  new (options?: { formats?: string[] }): BarcodeDetectorLike
}

function getBarcodeDetectorCtor(): BarcodeDetectorConstructor | null {
  const ctor = (globalThis as { BarcodeDetector?: BarcodeDetectorConstructor }).BarcodeDetector
  return typeof ctor === 'function' ? ctor : null
}

/**
 * Whether the native `BarcodeDetector` API is present. When true it is the preferred
 * decode path (hardware-accelerated, more robust); jsQR is the fallback for browsers
 * that lack it (notably Safari and Firefox as of writing).
 */
export function isBarcodeDetectorSupported(): boolean {
  return getBarcodeDetectorCtor() !== null
}

/**
 * Decodes a QR code from any `ImageBitmapSource` (a video frame, canvas, or image bitmap)
 * using the native `BarcodeDetector`. Returns the first QR code's value, or null when the
 * API is unavailable, no code is found, or detection throws.
 */
export async function decodeWithBarcodeDetector(
  source: ImageBitmapSource,
): Promise<string | null> {
  const Ctor = getBarcodeDetectorCtor()
  if (!Ctor) return null
  try {
    const detector = new Ctor({ formats: ['qr_code'] })
    const results = await detector.detect(source)
    return results[0]?.rawValue ?? null
  } catch {
    return null
  }
}
