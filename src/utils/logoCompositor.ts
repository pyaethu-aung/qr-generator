function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = src
  })
}

/**
 * Composites a logo centered on an existing canvas context with a white
 * backing disc for legibility over dark QR modules.
 */
export async function compositeLogoOnCanvas(
  ctx: CanvasRenderingContext2D,
  logoDataUrl: string,
  logoSizePct: number,
  canvasSize: number,
): Promise<void> {
  const logoImg = await loadImage(logoDataUrl)
  const logoPx = Math.round(canvasSize * (logoSizePct / 100))
  const cx = canvasSize / 2
  const cy = canvasSize / 2
  const logoRadius = logoPx / 2
  const backingRadius = logoRadius + Math.max(4, Math.round(logoRadius * 0.1))

  ctx.save()

  ctx.fillStyle = '#FFFFFF'
  ctx.beginPath()
  ctx.arc(cx, cy, backingRadius, 0, Math.PI * 2)
  ctx.fill()

  ctx.beginPath()
  ctx.arc(cx, cy, logoRadius, 0, Math.PI * 2)
  ctx.clip()
  ctx.drawImage(logoImg, cx - logoRadius, cy - logoRadius, logoPx, logoPx)

  ctx.restore()
}

/**
 * Rasterizes a logo to a PNG data URL at 2x the target render size.
 * Used to embed a correctly-sized logo in SVG exports without carrying
 * the full source image resolution.
 */
export async function rasterizeLogoForSvg(
  logoDataUrl: string,
  renderPx: number,
): Promise<string> {
  const scale = 2
  const size = Math.round(renderPx * scale)
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas 2D context unavailable')
  const img = await loadImage(logoDataUrl)
  ctx.drawImage(img, 0, 0, size, size)
  return canvas.toDataURL('image/png')
}
