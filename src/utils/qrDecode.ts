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

/**
 * Longest-edge pixel sizes the jsQR fallback is attempted at, largest first. jsQR's locator
 * fails on oversized inputs — a multi-megapixel photo of a QR reads nothing at full size but
 * decodes once scaled down (an iPhone HEIC at 4032px finds no code; the same shot at ~640px
 * decodes) — so the upload/camera glue retries at progressively smaller sizes until one reads.
 */
export const JSQR_DECODE_EDGES = [1024, 800, 640, 512, 400, 300]

/**
 * The distinct longest-edge targets to try for a source whose longest edge is `longest`, in
 * descending order. Targets larger than the source are clamped to its size (jsQR is never
 * asked to upscale) and the resulting duplicates removed — so a small, clean upload decodes
 * once at native size while a large photo fans out across scales.
 */
export function getDecodeEdges(longest: number): number[] {
  const edges: number[] = []
  for (const target of JSQR_DECODE_EDGES) {
    const edge = Math.min(target, longest)
    if (edge > 0 && !edges.includes(edge)) edges.push(edge)
  }
  return edges
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
