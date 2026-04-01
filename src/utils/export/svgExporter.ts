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
export async function exportSvg(value: string, config: SvgExportConfig): Promise<Blob> {
  if (!value) {
    throw new Error('Cannot export empty QR code')
  }

  try {
    const { dataPath, eyesPath, size } = generateQRPaths(
      value,
      config.ecLevel,
      config.designConfig.eyeShape,
      config.designConfig.pixelPattern
    );
    const viewBoxSize = size * 10;
    const marginSize = (config.margin ?? 0) * 10;
    const totalSize = viewBoxSize + 2 * marginSize;

    const svgString = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalSize} ${totalSize}" shape-rendering="crispEdges">
      <rect width="100%" height="100%" fill="${config.bgColor}" />
      <g transform="translate(${marginSize}, ${marginSize})">
        <path d="${dataPath}" fill="${config.fgColor}" />
        <path d="${eyesPath}" fill="${config.fgColor}" />
      </g>
    </svg>`

    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' })
    return blob
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    throw new Error(`Failed to export SVG: ${errorMessage}`)
  }
}
