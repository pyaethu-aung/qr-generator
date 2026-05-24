import type { QRConfig, QRDesignConfig } from '../../types/qr'
import { generateQRPaths } from '../qrShapeRenderer'
import { rasterizeLogoForSvg } from '../logoCompositor'

export interface SvgExportConfig extends QRConfig {
  margin?: number
  designConfig: QRDesignConfig
  logoDataUrl?: string | null
  logoSize?: number
}

export async function exportSvg(
  value: string,
  config: SvgExportConfig
): Promise<Blob> {
  if (!value) {
    throw new Error('Cannot export empty QR code')
  }

  const {
    margin = 4,
    ecLevel = 'M',
    fgColor = '#000000',
    bgColor = '#FFFFFF',
    designConfig = { eyeShape: 'Square', pixelPattern: 'Square' },
    logoDataUrl,
    logoSize = 20,
  } = config

  const cellSize = 10
  const { dataPath, eyesPath, eyeBgPath, size } = generateQRPaths(
    value,
    ecLevel,
    designConfig.eyeShape,
    designConfig.pixelPattern,
    cellSize
  )

  const viewboxSize = size * cellSize + margin * 2 * cellSize
  const dataShapeRendering = designConfig.pixelPattern === 'Dots' ? 'geometricPrecision' : 'crispEdges'

  let logoSvgElements = ''
  if (logoDataUrl) {
    const logoRenderPx = Math.round(viewboxSize * logoSize / 100)
    const rasterizedDataUrl = await rasterizeLogoForSvg(logoDataUrl, logoRenderPx)
    const cx = viewboxSize / 2
    const cy = viewboxSize / 2
    const logoRadius = logoRenderPx / 2
    const backingRadius = logoRadius + Math.max(4, Math.round(logoRadius * 0.1))
    logoSvgElements = `<defs><clipPath id="logo-clip"><circle cx="${cx}" cy="${cy}" r="${logoRadius}"/></clipPath></defs>
<circle cx="${cx}" cy="${cy}" r="${backingRadius}" fill="#FFFFFF"/>
<image href="${rasterizedDataUrl}" x="${cx - logoRadius}" y="${cy - logoRadius}" width="${logoRenderPx}" height="${logoRenderPx}" clip-path="url(#logo-clip)"/>`
  }

  const svgString = `<?xml version="1.0" encoding="utf-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${viewboxSize} ${viewboxSize}">
<rect width="100%" height="100%" fill="${bgColor}"/>
<path fill="${fgColor}" shape-rendering="${dataShapeRendering}" transform="translate(${margin * cellSize}, ${margin * cellSize})" d="${dataPath}" />
<path fill="${bgColor}" transform="translate(${margin * cellSize}, ${margin * cellSize})" d="${eyeBgPath}" />
<path fill="${fgColor}" fill-rule="evenodd" transform="translate(${margin * cellSize}, ${margin * cellSize})" d="${eyesPath}" />
${logoSvgElements}</svg>`

  return new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' })
}
