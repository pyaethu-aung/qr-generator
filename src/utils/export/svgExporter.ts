/**
 * SVG Export Utility
 *
 * @why Server-side QR generation using `qrcode` package provides SVG string output
 * with full color preservation and infinite scalability. Following React best practices
 * by keeping UI-independent logic in utilities.
 */

import type { QRConfig, QRDesignConfig } from '../../types/qr'
import { generateQRPaths } from '../qrShapeRenderer'

export interface SvgExportConfig extends QRConfig {
  margin?: number
  designConfig: QRDesignConfig
}

/**
 * Export QR code as SVG blob with color preservation.
 *
 * @param value - QR code content
 * @param config - QR configuration with colors and error correction
 * @returns Promise resolving to SVG Blob
 * @throws Error if SVG generation fails
 *
 * @why SVG format provides infinite scalability for vector editors and print.
 * Uses `qrcode` package's toString with 'svg' type for standards-compliant output.
 */
export function exportSvg(
  value: string,
  config: SvgExportConfig
): Promise<Blob> {
  if (!value) {
    return Promise.reject(new Error('Cannot export empty QR code'))
  }

  const {
    margin = 4,
    ecLevel = 'M',
    fgColor = '#000000',
    bgColor = '#FFFFFF',
    designConfig = { eyeShape: 'Square', pixelPattern: 'Square' },
  } = config

  // SVG parameters
  const cellSize = 10
  const { dataPath, eyesPath, size } = generateQRPaths(
    value,
    ecLevel,
    designConfig.eyeShape,
    designConfig.pixelPattern,
    cellSize
  )

  const viewboxSize = size * cellSize + margin * 2 * cellSize

  // Embed the custom geometric path
  const svgString = `<?xml version="1.0" encoding="utf-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${viewboxSize} ${viewboxSize}" shape-rendering="crispEdges">
<rect width="100%" height="100%" fill="${bgColor}"/>
<path fill="${fgColor}" transform="translate(${margin * cellSize}, ${margin * cellSize})" d="${dataPath}" />
<path fill="${fgColor}" fill-rule="evenodd" transform="translate(${margin * cellSize}, ${margin * cellSize})" d="${eyesPath}" />
</svg>`

  const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' })
  return Promise.resolve(blob)
}
