import type { QRConfig } from '../types/qr'

export const DEFAULT_QR_CONFIG: QRConfig = {
  value: '',
  ecLevel: 'M',
  fgColor: '#000000',
  bgColor: '#ffffff',
}

export const QR_SIZE_DOWNLOAD = 1024

/**
 * Default frame accent color (terracotta `--color-action`). A concrete hex, not a
 * token: frame color is baked into the exported PNG/SVG, which can't read CSS vars,
 * and stays theme-independent so a download looks the same in light and dark UI.
 */
export const DEFAULT_FRAME_COLOR = '#A04D28'
