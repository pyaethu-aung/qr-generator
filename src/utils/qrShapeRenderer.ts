import qrcode from 'qrcode'

export type QRModuleType = 'eye' | 'data'

export interface QRModule {
  x: number
  y: number
  isDark: boolean
  type: QRModuleType
}

export interface ParsedQR {
  size: number
  modules: QRModule[]
}

/**
 * Parses raw `qrcode` module matrix into a 2D-aware list specifying coordinate locations,
 * module type (positional 'eye' vs standard 'data'), and light/dark status.
 */
export function parseQRCode(value: string, ecLevel: 'L' | 'M' | 'Q' | 'H'): ParsedQR {
  // Use qrcode to generate the raw binary matrix
  const qr = qrcode.create(value, { errorCorrectionLevel: ecLevel })
  const size = qr.modules.size
  const data = qr.modules.data
  
  const modules: QRModule[] = []

  // Iterate over 1D bit array calculating 2D coords
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const isDark = !!data[y * size + x]
      
      // Calculate if the module falls within the 3 standard QR alignment corners
      // Standard format defines position detection patterns as 7x7 squares located at corners
      const isTopLeftEye = x < 7 && y < 7
      const isTopRightEye = x >= size - 7 && y < 7
      const isBottomLeftEye = x < 7 && y >= size - 7
      
      const type: QRModuleType = (isTopLeftEye || isTopRightEye || isBottomLeftEye) ? 'eye' : 'data'

      modules.push({ x, y, isDark, type })
    }
  }

  return { size, modules }
}
