import { useCallback, useEffect, useRef, useState } from 'react'
import {
  decodeImageData,
  decodeWithBarcodeDetector,
  getDecodeEdges,
  isBarcodeDetectorSupported,
} from '../utils/qrDecode'

/**
 * Why a decode attempt failed, mapped to a user-facing message by the component:
 * - `no-code` — the image or frame held no readable QR code
 * - `unsupported-file` — the dropped file was not an image
 * - `camera-denied` — the user blocked camera permission
 * - `camera-unsupported` — the browser exposes no usable camera API
 * - `decode-failed` — the file could not be loaded/processed at all
 */
export type ScanErrorCode =
  | 'no-code'
  | 'unsupported-file'
  | 'camera-denied'
  | 'camera-unsupported'
  | 'decode-failed'

export interface UseQrScannerReturn {
  /** The decoded string once a scan succeeds, or null. */
  decoded: string | null
  /** The latest failure, or null. */
  error: ScanErrorCode | null
  /** True while a still image is being decoded. */
  isDecoding: boolean
  /** True while the live camera stream is running. */
  isCameraActive: boolean
  /** Attach to the live-preview <video>; the hook drives its stream. */
  videoRef: React.RefObject<HTMLVideoElement | null>
  /** Decode a still image (upload or drop). */
  scanFile: (file: File) => Promise<void>
  /** Request the camera and begin scanning frames. */
  startCamera: () => Promise<void>
  /** Stop the camera and release the stream. */
  stopCamera: () => void
  /** Clear the current result/error so the scanner can be used again. */
  reset: () => void
}

/** Intrinsic [width, height] of a source, or [0, 0] before it has loaded. */
function sourceDimensions(source: HTMLImageElement | HTMLVideoElement): [number, number] {
  return source instanceof HTMLVideoElement
    ? [source.videoWidth, source.videoHeight]
    : [source.naturalWidth, source.naturalHeight]
}

/**
 * Draws a source onto a canvas scaled so its longest edge is `maxEdge` (never upscaling),
 * and returns the resulting ImageData, or null when the source has no size yet or the 2D
 * context is unavailable.
 */
function sourceToImageData(
  source: HTMLImageElement | HTMLVideoElement,
  canvas: HTMLCanvasElement,
  maxEdge: number,
): ImageData | null {
  const [sw, sh] = sourceDimensions(source)
  if (!sw || !sh) return null

  const scale = Math.min(1, maxEdge / Math.max(sw, sh))
  const width = Math.max(1, Math.round(sw * scale))
  const height = Math.max(1, Math.round(sh * scale))
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) return null
  ctx.drawImage(source, 0, 0, width, height)
  return ctx.getImageData(0, 0, width, height)
}

/**
 * Decodes a QR from an image/video source. Prefers the native BarcodeDetector (passing the
 * element straight through, which handles full-resolution input), then falls back to the
 * ZXing decoder over canvas-extracted ImageData, retrying at progressively smaller sizes —
 * the locator fails on oversized photos, so a downscaled pass is what actually reads them.
 * Returns the decoded string or null.
 */
async function decodeFromSource(
  source: HTMLImageElement | HTMLVideoElement,
  canvas: HTMLCanvasElement,
): Promise<string | null> {
  if (isBarcodeDetectorSupported()) {
    const value = await decodeWithBarcodeDetector(source)
    if (value) return value
  }
  const [sw, sh] = sourceDimensions(source)
  for (const edge of getDecodeEdges(Math.max(sw, sh))) {
    const imageData = sourceToImageData(source, canvas, edge)
    if (!imageData) return null
    const value = decodeImageData(imageData)
    if (value) return value
  }
  return null
}

/** Loads a File into an HTMLImageElement via an object URL, revoking it when done. */
function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Could not load image'))
    }
    img.src = url
  })
}

/** Draws an already-sized bitmap 1:1 onto a canvas and returns its ImageData, or null. */
function bitmapToImageData(bitmap: ImageBitmap, canvas: HTMLCanvasElement): ImageData | null {
  if (!bitmap.width || !bitmap.height) return null
  canvas.width = bitmap.width
  canvas.height = bitmap.height
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) return null
  ctx.drawImage(bitmap, 0, 0)
  return ctx.getImageData(0, 0, bitmap.width, bitmap.height)
}

/**
 * Decodes a still image File using createImageBitmap, which lets the browser decode the
 * source directly at each target size with high-quality resampling. This matters most on
 * iOS Safari: decoding a multi-megapixel photo at full size and squashing it with a single
 * canvas drawImage aliases the QR modules enough to defeat the decoder, whereas a bitmap
 * decoded straight to ~640px stays crisp. `imageOrientation: 'from-image'` also honors EXIF
 * rotation so portrait phone shots are not stretched. Prefers BarcodeDetector, then ZXing
 * per scale.
 */
async function decodeImageBitmap(file: File, canvas: HTMLCanvasElement): Promise<string | null> {
  const full = await createImageBitmap(file, { imageOrientation: 'from-image' })
  try {
    if (isBarcodeDetectorSupported()) {
      const value = await decodeWithBarcodeDetector(full)
      if (value) return value
    }
    const longest = Math.max(full.width, full.height)
    for (const edge of getDecodeEdges(longest)) {
      const scale = Math.min(1, edge / longest)
      let bitmap = full
      if (scale < 1) {
        bitmap = await createImageBitmap(file, {
          resizeWidth: Math.max(1, Math.round(full.width * scale)),
          resizeHeight: Math.max(1, Math.round(full.height * scale)),
          resizeQuality: 'high',
          imageOrientation: 'from-image',
        })
      }
      try {
        const imageData = bitmapToImageData(bitmap, canvas)
        const value = imageData ? decodeImageData(imageData) : null
        if (value) return value
      } finally {
        if (bitmap !== full) bitmap.close()
      }
    }
    return null
  } finally {
    full.close()
  }
}

/**
 * Decodes a still image File. Uses the createImageBitmap pipeline where available (needed
 * for reliable iOS Safari uploads), falling back to the <img> + canvas path for browsers
 * that lack it or when bitmap decoding throws (e.g. an unsupported format).
 */
async function decodeFile(file: File, canvas: HTMLCanvasElement): Promise<string | null> {
  if (typeof createImageBitmap === 'function') {
    try {
      return await decodeImageBitmap(file, canvas)
    } catch {
      // Fall through to the <img> path below.
    }
  }
  const img = await loadImageFromFile(file)
  return decodeFromSource(img, canvas)
}

/**
 * QR-decoding engine for the Scan view: decode a still image (upload/drop) or run a live
 * camera scan loop. The DOM/canvas/getUserMedia glue lives here; the actual decode is
 * delegated to the pure utils in qrDecode. Releases the camera stream on stop and unmount.
 */
export function useQrScanner(): UseQrScannerReturn {
  const [decoded, setDecoded] = useState<string | null>(null)
  const [error, setError] = useState<ScanErrorCode | null>(null)
  const [isDecoding, setIsDecoding] = useState(false)
  const [isCameraActive, setIsCameraActive] = useState(false)

  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const frameRef = useRef<number | null>(null)

  function getCanvas(): HTMLCanvasElement {
    canvasRef.current ??= document.createElement('canvas')
    return canvasRef.current
  }

  const stopCamera = useCallback(() => {
    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current)
      frameRef.current = null
    }
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    if (videoRef.current) videoRef.current.srcObject = null
    setIsCameraActive(false)
  }, [])

  const scanFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith('image/')) {
        setError('unsupported-file')
        return
      }
      stopCamera()
      setError(null)
      setDecoded(null)
      setIsDecoding(true)
      try {
        const value = await decodeFile(file, getCanvas())
        if (value) {
          setDecoded(value)
        } else {
          setError('no-code')
        }
      } catch {
        setError('decode-failed')
      } finally {
        setIsDecoding(false)
      }
    },
    [stopCamera],
  )

  const startCamera = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setError('camera-unsupported')
      return
    }
    setError(null)
    setDecoded(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      })
      streamRef.current = stream
      const video = videoRef.current
      if (!video) {
        stream.getTracks().forEach((track) => track.stop())
        return
      }
      video.srcObject = stream
      await video.play()
      setIsCameraActive(true)

      const tick = async () => {
        const current = videoRef.current
        if (!current || !streamRef.current) return
        const value = await decodeFromSource(current, getCanvas())
        if (value) {
          setDecoded(value)
          stopCamera()
          return
        }
        frameRef.current = requestAnimationFrame(() => void tick())
      }
      frameRef.current = requestAnimationFrame(() => void tick())
    } catch (err) {
      const name = (err as Error)?.name
      setError(name === 'NotAllowedError' || name === 'SecurityError' ? 'camera-denied' : 'camera-unsupported')
      stopCamera()
    }
  }, [stopCamera])

  const reset = useCallback(() => {
    setDecoded(null)
    setError(null)
  }, [])

  // Release the camera if the component unmounts mid-scan.
  useEffect(() => stopCamera, [stopCamera])

  return {
    decoded,
    error,
    isDecoding,
    isCameraActive,
    videoRef,
    scanFile,
    startCamera,
    stopCamera,
    reset,
  }
}
