export type QRErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H'

export interface QRConfig {
  value: string
  ecLevel: QRErrorCorrectionLevel
  fgColor: string
  bgColor: string
  size?: number
}

export interface SharePayload {
  blob: Blob
  filename: 'qr-code.png'
  lastUpdated: Date
}

export type ShareMethod = 'navigator-share' | 'download' | 'clipboard'

export interface ShareRequest {
  method: ShareMethod
  targetSupported: boolean
  status: 'pending' | 'shared' | 'canceled' | 'failed'
  errorMessage?: string
}
