export type QRErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H'

export interface QRConfig {
  value: string
  ecLevel: QRErrorCorrectionLevel
  fgColor: string
  bgColor: string
  size?: number
}
