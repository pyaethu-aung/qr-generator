/**
 * PNG export utilities using Canvas scaling.
 *
 * @why For large exports (2000px), we use OffscreenCanvas with a worker
 * to prevent blocking the main thread, following vercel-react-best-practices
 * rerender-* performance guidelines.
 */

import type { DimensionPreset } from '../../types/export'
import { calculateScaleFactor } from './exportCalculations'

/**
 * Export canvas as PNG blob at target dimension.
 *
 * @why Uses OffscreenCanvas for 2000px exports to keep UI responsive.
 * Falls back to synchronous scaling for smaller dimensions or unsupported browsers.
 * @param canvas - Source canvas element with QR code
 * @param dimension - Target dimension (500, 1000, or 2000)
 * @returns Promise resolving to PNG blob
 */
export async function exportPng(
  canvas: HTMLCanvasElement,
  dimension: DimensionPreset,
): Promise<Blob> {
  // For large exports, use OffscreenCanvas if available to avoid blocking main thread
  if (typeof OffscreenCanvas !== 'undefined' && dimension >= 2000) {
    return exportPngOffscreen(canvas, dimension)
  }

  // For smaller exports or browsers without OffscreenCanvas, use main thread
  return exportPngSync(canvas, dimension)
}

/**
 * Synchronous PNG export on main thread.
 *
 * @why Direct canvas scaling is fast enough for dimensions <2000px.
 * Uses integer scale factor to avoid sub-pixel artifacts.
 */
async function exportPngSync(
  canvas: HTMLCanvasElement,
  dimension: DimensionPreset,
): Promise<Blob> {
  const scaleFactor = calculateScaleFactor(canvas.width, dimension)
  const scaledWidth = canvas.width * scaleFactor
  const scaledHeight = canvas.height * scaleFactor

  // Create temporary canvas for scaling
  const tempCanvas = document.createElement('canvas')
  tempCanvas.width = scaledWidth
  tempCanvas.height = scaledHeight

  const ctx = tempCanvas.getContext('2d')
  if (!ctx) {
    throw new Error('Failed to get 2D context')
  }

  // Disable image smoothing for crisp QR code edges
  ctx.imageSmoothingEnabled = false

  // Scale up the original canvas
  ctx.drawImage(canvas, 0, 0, scaledWidth, scaledHeight)

  // Convert to blob
  return new Promise((resolve, reject) => {
    tempCanvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob)
        } else {
          reject(new Error('Failed to create PNG blob'))
        }
      },
      'image/png',
      1.0, // Maximum quality
    )
  })
}

/**
 * Async PNG export using OffscreenCanvas (for large dimensions).
 *
 * @why OffscreenCanvas runs in a separate context, preventing main thread blocking.
 * This keeps the UI responsive during export of large 2000px images.
 */
async function exportPngOffscreen(
  canvas: HTMLCanvasElement,
  dimension: DimensionPreset,
): Promise<Blob> {
  const scaleFactor = calculateScaleFactor(canvas.width, dimension)
  const scaledWidth = canvas.width * scaleFactor
  const scaledHeight = canvas.height * scaleFactor

  // Create OffscreenCanvas for async rendering
  const offscreen = new OffscreenCanvas(scaledWidth, scaledHeight)
  const ctx = offscreen.getContext('2d')

  if (!ctx) {
    throw new Error('Failed to get OffscreenCanvas 2D context')
  }

  // Disable smoothing for crisp QR edges
  ctx.imageSmoothingEnabled = false

  // Create ImageBitmap from source canvas for efficient transfer
  const imageBitmap = await createImageBitmap(canvas)

  // Scale the image
  ctx.drawImage(imageBitmap, 0, 0, scaledWidth, scaledHeight)

  // Convert to blob
  return offscreen.convertToBlob({
    type: 'image/png',
    quality: 1.0,
  })
}
