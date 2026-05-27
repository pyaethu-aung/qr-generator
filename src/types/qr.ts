export type QRErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H'

export type QRContentMode = 'text' | 'wifi' | 'vcard' | 'email'

export interface EmailConfig {
  to: string
  subject: string
  body: string
}

export type WiFiSecurity = 'WPA' | 'WEP' | 'nopass'

export interface WiFiConfig {
  ssid: string
  password: string
  security: WiFiSecurity
  hidden: boolean
}

export interface VCardConfig {
  firstName: string
  lastName: string
  phone: string
  email: string
  company: string
  jobTitle: string
  website: string
}

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

export type QREyeShape = 'Square' | 'Rounded' | 'Diamond' | 'Leaf' | 'Hexagon'
export type QRPixelPattern = 'Square' | 'Dots'

export interface QRDesignConfig {
  eyeShape: QREyeShape
  pixelPattern: QRPixelPattern
}
