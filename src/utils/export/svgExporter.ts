/**
 * SVG Export Utility
 *
 * @why Server-side QR generation using `qrcode` package provides SVG string output
 * with full color preservation and infinite scalability. Following React best practices
 * by keeping UI-independent logic in utilities.
 */

import QRCode from 'qrcode'
import type { QRConfig } from '../../types/qr'

export interface SvgExportConfig extends QRConfig {
  margin?: number
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
    // Generate SVG string using qrcode package
    // eslint-disable-next-line @typescript-eslint/no-base-to-string
    const svgString = await QRCode.toString(value, {
      type: 'svg',
      errorCorrectionLevel: config.ecLevel,
      margin: config.margin ?? 0,
      color: {
        dark: config.fgColor,
        light: config.bgColor,
      },
      // Ensure crisp rendering
      width: undefined, // SVG is resolution-independent
    })

    // Create blob from SVG string
    const blob = new Blob([svgString], { type: 'image/svg+xml' })
    return blob
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    throw new Error(`Failed to export SVG: ${errorMessage}`)
  }
}
