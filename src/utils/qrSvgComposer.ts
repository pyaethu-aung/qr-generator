/**
 * Single source of truth for the QR + frame SVG. The canvas preview, PNG download,
 * and SVG export all build their output from this, so a frame looks identical
 * everywhere it ships. Returns the SVG body (no `<svg>` wrapper, no logo) plus the
 * geometry a caller needs to place a centered logo over the QR.
 */

import type { QRDesignConfig, QRErrorCorrectionLevel, QRFrameConfig } from '../types/qr'
import { generateQRPaths, getDataShapeRendering } from './qrShapeRenderer'
import { renderFrame } from './frameRenderer'

export interface ComposeQrOptions {
  value: string
  ecLevel: QRErrorCorrectionLevel
  fgColor: string
  bgColor: string
  design: QRDesignConfig
  frame?: QRFrameConfig
  cellSize?: number
}

export interface ComposedQr {
  /** SVG body: background rect, frame decoration, then the QR group. */
  body: string
  /** Square viewBox edge length in user units. */
  viewBox: number
  /** Center of the QR region in viewBox units — where a logo should sit. */
  logoCenter: { x: number; y: number }
  /** QR region edge length in viewBox units — a logo's size % is relative to this. */
  logoBase: number
}

const n = (v: number): number => Math.round(v * 1000) / 1000

export function composeQrSvg(opts: ComposeQrOptions): ComposedQr {
  const { value, ecLevel, fgColor, bgColor, design, frame, cellSize = 10 } = opts

  const { dataPath, eyeFramePath, eyeCenterPath, eyeBgPath, size } = generateQRPaths(
    value,
    ecLevel,
    design.eyeFrameShape,
    design.eyeCenterShape,
    design.pixelPattern,
    cellSize,
  )
  const Q = size * cellSize
  const dataShapeRendering = getDataShapeRendering(design.pixelPattern)
  const eyeFrameFill = design.eyeFrameColor ?? fgColor
  const eyeCenterFill = design.eyeCenterColor ?? fgColor

  const qrGroup = (tx: number, ty: number): string => {
    const open = tx || ty ? `<g transform="translate(${n(tx)},${n(ty)})">` : '<g>'
    return (
      open +
      `<path d="${dataPath}" fill="${fgColor}" shape-rendering="${dataShapeRendering}"/>` +
      `<path d="${eyeBgPath}" fill="${bgColor}"/>` +
      `<path d="${eyeFramePath}" fill="${eyeFrameFill}" fill-rule="evenodd"/>` +
      `<path d="${eyeCenterPath}" fill="${eyeCenterFill}"/>` +
      `</g>`
    )
  }

  // No frame: bare QR, byte-for-byte the same structure as before frames existed.
  if (!frame || frame.style === 'None') {
    return {
      body: `<rect width="${Q}" height="${Q}" fill="${bgColor}"/>` + qrGroup(0, 0),
      viewBox: Q,
      logoCenter: { x: Q / 2, y: Q / 2 },
      logoBase: Q,
    }
  }

  const { viewBox, qrBox, decoration } = renderFrame(frame.style, Q, frame.color, bgColor, frame.text, frame.position)
  return {
    body:
      `<rect width="${n(viewBox)}" height="${n(viewBox)}" fill="${bgColor}"/>` +
      decoration +
      qrGroup(qrBox.x, qrBox.y),
    viewBox,
    logoCenter: { x: qrBox.x + qrBox.size / 2, y: qrBox.y + qrBox.size / 2 },
    logoBase: qrBox.size,
  }
}
