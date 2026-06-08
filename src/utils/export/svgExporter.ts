import type { QRConfig, QRDesignConfig, QRFrameConfig } from '../../types/qr'
import { composeQrSvg } from '../qrSvgComposer'
import { rasterizeLogoForSvg } from '../logoCompositor'

export interface SvgExportConfig extends QRConfig {
  margin?: number
  designConfig: QRDesignConfig
  frameConfig?: QRFrameConfig
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
    designConfig = { eyeFrameShape: 'Square', eyeCenterShape: 'Square', eyeFrameColor: null, eyeCenterColor: null, pixelPattern: 'Square' },
    frameConfig,
    logoDataUrl,
    logoSize = 20,
  } = config

  const cellSize = 10
  const { body, viewBox, logoCenter, logoBase } = composeQrSvg({
    value,
    ecLevel,
    fgColor,
    bgColor,
    design: designConfig,
    frame: frameConfig,
    cellSize,
  })

  // Quiet-zone margin is only added for the bare QR. Framed output carries its own
  // padding, so a second margin would float it inside an oversized background.
  const hasFrame = Boolean(frameConfig && frameConfig.style !== 'None')
  const pad = hasFrame ? 0 : margin * cellSize
  const totalSize = viewBox + pad * 2

  let logoSvgElements = ''
  if (logoDataUrl) {
    const logoRenderPx = Math.round(logoBase * logoSize / 100)
    const rasterizedDataUrl = await rasterizeLogoForSvg(logoDataUrl, logoRenderPx)
    const cx = pad + logoCenter.x
    const cy = pad + logoCenter.y
    const logoRadius = logoRenderPx / 2
    const backingRadius = logoRadius + Math.max(4, Math.round(logoRadius * 0.1))
    logoSvgElements = `<defs><clipPath id="logo-clip"><circle cx="${cx}" cy="${cy}" r="${logoRadius}"/></clipPath></defs>
<circle cx="${cx}" cy="${cy}" r="${backingRadius}" fill="#FFFFFF"/>
<image href="${rasterizedDataUrl}" x="${cx - logoRadius}" y="${cy - logoRadius}" width="${logoRenderPx}" height="${logoRenderPx}" clip-path="url(#logo-clip)"/>`
  }

  const svgString = `<?xml version="1.0" encoding="utf-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalSize} ${totalSize}">
<rect width="100%" height="100%" fill="${bgColor}"/>
<g transform="translate(${pad}, ${pad})">${body}</g>
${logoSvgElements}</svg>`

  return new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' })
}
