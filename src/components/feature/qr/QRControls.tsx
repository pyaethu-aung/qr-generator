import { useRef, useState, useId } from 'react'
import { Download, Check, ChevronDown, ChevronUp, Upload, X, Wifi, Link, User, Mail, MessageSquare, Phone, MapPin, Calendar, Bitcoin } from 'lucide-react'
import { Input } from '../../common/Input'
import { Callout } from '../../common/Callout'
import { PillGroup } from '../../common/PillGroup'
import { Tooltip } from '../../common/Tooltip'
import { WiFiForm } from './WiFiForm'
import { VCardForm } from './VCardForm'
import { EmailForm } from './EmailForm'
import { SmsForm } from './SmsForm'
import { TelForm } from './TelForm'
import { GeoForm } from './GeoForm'
import { VEventForm } from './VEventForm'
import { CryptoForm } from './CryptoForm'
import { DEFAULT_FRAME_COLOR } from '../../../data/defaults'
import type { QRErrorCorrectionLevel, QRContentMode, WiFiConfig, WiFiSecurity, VCardConfig, EmailConfig, SmsConfig, TelConfig, GeoConfig, VEventConfig, CryptoConfig, QREyeFrameShape, QREyeCenterShape, QRPixelPattern, QRFrameStyle, QRFramePosition } from '../../../types/qr'

const FRAME_PATHS: Record<QREyeFrameShape, string> = {
  Square:      'M0,0 h28 v28 h-28 Z M4,4 h20 v20 h-20 Z',
  Rounded:     'M6,0 h16 a6,6 0 0 1 6,6 v16 a6,6 0 0 1 -6,6 h-16 a6,6 0 0 1 -6,-6 v-16 a6,6 0 0 1 6,-6 Z M8,4 h12 a4,4 0 0 1 4,4 v12 a4,4 0 0 1 -4,4 h-12 a4,4 0 0 1 -4,-4 v-12 a4,4 0 0 1 4,-4 Z',
  Circle:      'M0,14 a14,14 0 1 0 28,0 a14,14 0 1 0 -28,0 Z M4,14 a10,10 0 1 0 20,0 a10,10 0 1 0 -20,0 Z',
  Leaf:        'M0,0 h22 a6,6 0 0 1 6,6 v22 h-22 a6,6 0 0 1 -6,-6 Z M4,4 h16 a4,4 0 0 1 4,4 v16 h-16 a4,4 0 0 1 -4,-4 Z',
  Hexagon:     'M14,0 L28,7 L28,21 L14,28 L0,21 L0,7 Z M14,4 L24,9 L24,19 L14,24 L4,19 L4,9 Z',
  SquareRound: 'M0,0 h28 v28 h-28 Z M8,4 h12 a4,4 0 0 1 4,4 v12 a4,4 0 0 1 -4,4 h-12 a4,4 0 0 1 -4,-4 v-12 a4,4 0 0 1 4,-4 Z',
  RoundSquare: 'M6,0 h16 a6,6 0 0 1 6,6 v16 a6,6 0 0 1 -6,6 h-16 a6,6 0 0 1 -6,-6 v-16 a6,6 0 0 1 6,-6 Z M4,4 h20 v20 h-20 Z',
  Diamond:     'M14,0 L28,14 L14,28 L0,14 Z M14,4 L24,14 L14,24 L4,14 Z',
}

const CENTER_PATHS: Record<QREyeCenterShape, string> = {
  Square:  'M8,8 h12 v12 h-12 Z',
  Rounded: 'M11,8 h6 a3,3 0 0 1 3,3 v6 a3,3 0 0 1 -3,3 h-6 a3,3 0 0 1 -3,-3 v-6 a3,3 0 0 1 3,-3 Z',
  Dot:     'M8,14 a6,6 0 1 0 12,0 a6,6 0 1 0 -12,0 Z',
  Diamond: 'M14,8 L20,14 L14,20 L8,14 Z',
  Star:    'M14,6 L16.35,10.76 L21.61,11.53 L17.80,15.24 L18.70,20.47 L14,18 L9.30,20.47 L10.20,15.24 L6.39,11.53 L11.65,10.76 Z',
  Cross:   'M10,4 h8 v6 h6 v8 h-6 v6 h-8 v-6 h-6 v-8 h6 Z',
}

// Eye FRAME swatch — the outer ring only (outer boundary + 5×5 hole, even-odd).
function EyeFrameIcon({ shape, size = 18 }: { shape: QREyeFrameShape; size?: number }) {
  return (
    <svg viewBox="0 0 28 28" width={size} height={size} fill="currentColor" aria-hidden>
      <path d={FRAME_PATHS[shape]} fillRule="evenodd" />
    </svg>
  )
}

// Eye CENTER swatch — the inner dot only, drawn at the 3×3 zone scaled into the viewBox.
function EyeCenterIcon({ shape, size = 18 }: { shape: QREyeCenterShape; size?: number }) {
  return (
    <svg viewBox="0 0 28 28" width={size} height={size} fill="currentColor" aria-hidden>
      <path d={CENTER_PATHS[shape]} />
    </svg>
  )
}

function previewModulePath(pattern: QRPixelPattern, x: number, y: number): string {
  if (pattern === 'Dots')     return `M${x+4},${y+0.4} a3.6,3.6 0 1,0 0,7.2 a3.6,3.6 0 1,0 0,-7.2 Z`
  if (pattern === 'Rounded')  return `M${x+2.8},${y} h2.4 a2.8,2.8 0 0 1 2.8,2.8 v2.4 a2.8,2.8 0 0 1 -2.8,2.8 h-2.4 a2.8,2.8 0 0 1 -2.8,-2.8 v-2.4 a2.8,2.8 0 0 1 2.8,-2.8 Z`
  if (pattern === 'Diamond')  return `M${x+4},${y+0.8} L${x+7.2},${y+4} L${x+4},${y+7.2} L${x+0.8},${y+4} Z`
  if (pattern === 'Vertical') return `M${x+0.8},${y} h6.4 v8 h-6.4 Z`
  return `M${x},${y} h8 v8 h-8 Z`
}

// Pre-computed at module load, never changes at runtime.
// Classy, Fluid, and Horizontal use full-viewbox connected-run paths so their
// defining character (merging, asymmetric rounding, flat bars) reads at 18px.
// The remaining patterns use a 3×3 isolated-module grid (8px module, 2px gap, 28×28 box).
const PATTERN_PREVIEW_PATHS: Record<QRPixelPattern, string> = (() => {
  const pos = [0, 10, 20]
  const grid = (p: QRPixelPattern) => pos.flatMap(y => pos.map(x => previewModulePath(p, x, y))).join(' ')
  return {
    Square:     grid('Square'),
    Dots:       grid('Dots'),
    Rounded:    grid('Rounded'),
    Diamond:    grid('Diamond'),
    Vertical:   grid('Vertical'),
    // Connected-run: a 3-module horizontal run where internal edges merge.
    // Classy — TL and BR outer corners rounded only; TR and BL stay sharp.
    Classy:     'M1,13 a4,4 0 0 1 4,-4 h18 v6 a4,4 0 0 1 -4,4 h-18 v-6 Z',
    // Fluid — left and right ends fully rounded; a pill that shows both ends merge.
    Fluid:      'M1,14 a5,5 0 0 1 5,-5 h16 a5,5 0 0 1 5,5 a5,5 0 0 1 -5,5 h-16 a5,5 0 0 1 -5,-5 Z',
    // Horizontal — three clearly flat full-width bars (unambiguous contrast with Square).
    Horizontal: 'M1,2 h26 v7 h-26 Z M1,11 h26 v7 h-26 Z M1,20 h26 v7 h-26 Z',
  }
})()

// PIXEL PATTERN swatch — 3×3 grid of module previews (8px module, 2px gap, 28×28 total).
function PixelPatternIcon({ pattern, size = 18 }: { pattern: QRPixelPattern; size?: number }) {
  return (
    <svg viewBox="0 0 28 28" width={size} height={size} fill="currentColor" aria-hidden>
      <path d={PATTERN_PREVIEW_PATHS[pattern]} />
    </svg>
  )
}

// FRAME swatch — a schematic glyph: a faint QR proxy plus the frame's defining motif,
// both in currentColor (the motif full strength, the proxy dimmed) so the frame reads at 20px.
function FramePreviewIcon({ style, size = 20 }: { style: QRFrameStyle; size?: number }) {
  const proxy = <rect x="8" y="8" width="16" height="16" rx="2.5" opacity="0.32" />
  const motif = (() => {
    switch (style) {
      case 'Banner':
        return <>
          <rect x="7" y="4" width="18" height="15" rx="2" opacity="0.32" />
          <rect x="7" y="22" width="18" height="6" rx="3" />
        </>
      case 'Card':
        return <>
          <rect x="4" y="4" width="24" height="24" rx="3.5" fill="none" stroke="currentColor" strokeWidth="2" />
          <path d="M6 22 h20 v2 a2 2 0 0 1 -2 2 h-16 a2 2 0 0 1 -2 -2 Z" />
          <rect x="9" y="8" width="14" height="11" rx="1.5" opacity="0.32" />
        </>
      case 'Ticket':
        return <>
          <rect x="5" y="5" width="22" height="22" rx="3" fill="none" stroke="currentColor" strokeWidth="2" />
          <line x1="9" y1="21" x2="23" y2="21" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 1.6" strokeLinecap="round" />
          <circle cx="5" cy="21" r="2" fill="currentColor" />
          <circle cx="27" cy="21" r="2" fill="currentColor" />
          <rect x="9" y="8" width="14" height="10" rx="1.5" opacity="0.32" />
        </>
      case 'Label':
        return <>
          <rect x="8" y="9" width="16" height="14" rx="2" opacity="0.32" />
          <rect x="11" y="4" width="10" height="2.6" rx="1.3" />
          <rect x="7" y="25" width="18" height="4" rx="2" />
        </>
      case 'Bubble':
        return <>
          <rect x="7" y="4" width="18" height="15" rx="2" opacity="0.32" />
          <rect x="6" y="23" width="20" height="6" rx="3" />
          <path d="M13 23 L19 23 L16 20 Z" />
        </>
      case 'Ticks':
        return <>
          {proxy}
          <path d="M5 9 V5 H9 M23 5 H27 V9 M27 23 V27 H23 M9 27 H5 V23" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
        </>
      case 'Photo':
        return <>
          <rect x="4" y="4" width="24" height="24" rx="2.5" fill="none" stroke="currentColor" strokeWidth="2" />
          <rect x="9" y="8" width="14" height="11" rx="1" opacity="0.32" />
          <rect x="11" y="23" width="10" height="2.4" rx="1.2" />
        </>
      case 'None':
      default:
        return proxy
    }
  })()
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} fill="currentColor" aria-hidden>
      {motif}
    </svg>
  )
}

// Color picker for an eye part. A null value means "inherit the foreground color";
// the swatch then shows the foreground and a reset link is hidden. Touching the picker
// sets an explicit color; the reset link reverts to inherit (null).
function EyeColorField({
  id,
  label,
  color,
  fallbackColor,
  onChange,
  matchLabel,
}: {
  id: string
  label: string
  color: string | null
  fallbackColor: string
  onChange: (color: string | null) => void
  matchLabel: string
}) {
  const effective = color ?? fallbackColor
  const isInherited = color === null
  return (
    <div className="min-w-[120px] flex-1 flex flex-col gap-1">
      <div className="flex items-baseline justify-between gap-2">
        <label htmlFor={id} className="text-sm font-medium text-text-primary">{label}</label>
        {!isInherited && (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="text-xs text-action hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring rounded"
          >
            {matchLabel}
          </button>
        )}
      </div>
      <div className="relative flex h-11 items-center gap-3 rounded-lg bg-surface-inset px-3 focus-within:ring-2 focus-within:ring-focus-ring focus-within:outline-none">
        <div className="h-5 w-5 shrink-0 rounded-full border-2 border-border-strong" style={{ backgroundColor: effective }} />
        {isInherited ? (
          <span className="text-sm italic text-text-secondary truncate">{matchLabel}</span>
        ) : (
          <span className="text-sm font-medium uppercase font-['Geist_Mono'] text-text-primary truncate">{effective}</span>
        )}
        <input
          id={id}
          type="color"
          value={effective}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0 focus:outline-none"
        />
      </div>
    </div>
  )
}

function hexToLinear(c: number): number {
  const v = c / 255
  return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
}

function relativeLuminance(hex: string): number | null {
  const m = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex)
  if (!m) return null
  return 0.2126 * hexToLinear(parseInt(m[1], 16))
       + 0.7152 * hexToLinear(parseInt(m[2], 16))
       + 0.0722 * hexToLinear(parseInt(m[3], 16))
}

function wcagContrastRatio(hex1: string, hex2: string): number | null {
  const l1 = relativeLuminance(hex1)
  const l2 = relativeLuminance(hex2)
  if (l1 === null || l2 === null) return null
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  return (lighter + 0.05) / (darker + 0.05)
}

function loadImageFromUrl(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      const ctx = canvas.getContext('2d')
      if (!ctx) { reject(new Error('canvas unavailable')); return }
      try {
        ctx.drawImage(img, 0, 0)
        resolve(canvas.toDataURL('image/png'))
      } catch {
        reject(new Error('CORS not permitted'))
      }
    }
    img.onerror = () => reject(new Error('load failed'))
    img.src = url
  })
}

export interface QRControlsProps {
  value: string
  onValueChange: (value: string) => void
  ecLevel: QRErrorCorrectionLevel
  onEcLevelChange: (level: QRErrorCorrectionLevel) => void
  fgColor: string
  onFgColorChange: (color: string) => void
  bgColor: string
  onBgColorChange: (color: string) => void
  onDownloadPng?: () => void
  onDownloadSvg?: () => void
  canDownload?: boolean
  hasContent?: boolean
  inputError?: string
  // Logo
  logoDataUrl?: string | null
  onLogoChange?: (dataUrl: string | null) => void
  logoSize?: number
  onLogoSizeChange?: (size: number) => void
  maxLogoSize?: number
  // Locale-aware labels
  placeholder?: string
  correctionLabel?: string
  foregroundLabel?: string
  backgroundLabel?: string
  downloadPngLabel?: string
  downloadSvgLabel?: string
  correctionOptions?: { value: QRErrorCorrectionLevel; label: string }[]
  eyeFrameShape: QREyeFrameShape
  onEyeFrameShapeChange: (shape: QREyeFrameShape) => void
  eyeCenterShape: QREyeCenterShape
  onEyeCenterShapeChange: (shape: QREyeCenterShape) => void
  eyeFrameColor: string | null
  onEyeFrameColorChange: (color: string | null) => void
  eyeCenterColor: string | null
  onEyeCenterColorChange: (color: string | null) => void
  pixelPattern: import('../../../types/qr').QRPixelPattern
  onPixelPatternChange: (pattern: import('../../../types/qr').QRPixelPattern) => void
  eyeFrameLabel?: string
  eyeCenterLabel?: string
  eyeFrameColorLabel?: string
  eyeCenterColorLabel?: string
  eyeColorMatchForegroundLabel?: string
  pixelPatternLabel?: string
  eyeFrameOptions?: { value: QREyeFrameShape; label: string }[]
  eyeCenterOptions?: { value: QREyeCenterShape; label: string }[]
  pixelPatternOptions?: { value: import('../../../types/qr').QRPixelPattern; label: string }[]
  isRiskyPattern?: boolean
  onDismissWarning?: () => void
  correctionTooltip?: string
  correctionTooltipAriaLabel?: string
  dismissWarningAriaLabel?: string
  correctionHint?: string
  correctionBelowRecommendedLabel?: string
  downloadStatus?: 'png' | 'svg' | null
  downloadStatusMessage?: string
  // Content mode (text vs wifi)
  contentMode?: QRContentMode
  onContentModeChange?: (mode: QRContentMode) => void
  contentTypeLabel?: string
  contentModeTextLabel?: string
  contentModeWifiLabel?: string
  wifiConfig?: WiFiConfig
  onWifiSsidChange?: (ssid: string) => void
  onWifiPasswordChange?: (password: string) => void
  onWifiSecurityChange?: (security: WiFiSecurity) => void
  onWifiHiddenChange?: (hidden: boolean) => void
  wifiCorrectionHint?: string
  // vCard mode props
  contentModeVCardLabel?: string
  vcardConfig?: VCardConfig
  onVCardFirstNameChange?: (v: string) => void
  onVCardLastNameChange?: (v: string) => void
  onVCardPhoneChange?: (v: string) => void
  onVCardEmailChange?: (v: string) => void
  onVCardCompanyChange?: (v: string) => void
  onVCardJobTitleChange?: (v: string) => void
  onVCardWebsiteChange?: (v: string) => void
  vcardCorrectionHint?: string
  // Email mode props
  contentModeEmailLabel?: string
  emailConfig?: EmailConfig
  onEmailToChange?: (v: string) => void
  onEmailSubjectChange?: (v: string) => void
  onEmailBodyChange?: (v: string) => void
  emailCorrectionHint?: string
  // SMS mode props
  contentModeSmsLabel?: string
  smsConfig?: SmsConfig
  onSmsNumberChange?: (v: string) => void
  onSmsMessageChange?: (v: string) => void
  smsCorrectionHint?: string
  // Tel mode props
  contentModeTelLabel?: string
  telConfig?: TelConfig
  onTelNumberChange?: (v: string) => void
  telCorrectionHint?: string
  // Geo mode props
  contentModeGeoLabel?: string
  geoConfig?: GeoConfig
  onGeoLatitudeChange?: (v: string) => void
  onGeoLongitudeChange?: (v: string) => void
  geoCorrectionHint?: string
  // Calendar event (vEvent) mode props
  contentModeVEventLabel?: string
  veventConfig?: VEventConfig
  onVEventSummaryChange?: (v: string) => void
  onVEventStartChange?: (v: string) => void
  onVEventEndChange?: (v: string) => void
  onVEventAllDayChange?: (v: boolean) => void
  onVEventLocationChange?: (v: string) => void
  onVEventDescriptionChange?: (v: string) => void
  veventCorrectionHint?: string
  // Crypto (Bitcoin / Ethereum) mode props
  contentModeCryptoLabel?: string
  cryptoConfig?: CryptoConfig
  onCryptoChange?: <K extends keyof CryptoConfig>(key: K, value: CryptoConfig[K]) => void
  cryptoCorrectionHint?: string
  logoLabel?: string
  logoSizeLabel?: string
  logoUploadHint?: string
  logoUploadAriaLabel?: string
  logoUrlAriaLabel?: string
  logoPasteUrl?: string
  logoRemoveLabel?: string
  logoErrorFormat?: string
  logoErrorUrl?: string
  logoTransparencyHint?: string
  logoSizeCapHint?: string
  appearanceLabel?: string
  // Frame
  frameStyle?: QRFrameStyle
  onFrameStyleChange?: (style: QRFrameStyle) => void
  frameText?: string
  onFrameTextChange?: (text: string) => void
  frameColor?: string
  onFrameColorChange?: (color: string) => void
  framePosition?: QRFramePosition
  onFramePositionChange?: (position: QRFramePosition) => void
  frameTextLimit?: number
  frameLabel?: string
  frameHintLabel?: string
  frameStyleHeadingLabel?: string
  frameTextLabel?: string
  frameTextPlaceholder?: string
  frameTextHint?: string
  frameTextLimitReachedLabel?: string
  frameColorLabel?: string
  frameColorLowContrastLabel?: string
  framePositionLabel?: string
  framePositionTopLabel?: string
  framePositionBottomLabel?: string
  frameStyleLabels?: Record<QRFrameStyle, string>
}

export function QRControls({
  value,
  onValueChange,
  ecLevel,
  onEcLevelChange,
  fgColor,
  onFgColorChange,
  bgColor,
  onBgColorChange,
  onDownloadPng,
  onDownloadSvg,
  canDownload = false,
  hasContent = false,
  inputError,
  logoDataUrl,
  onLogoChange,
  logoSize,
  onLogoSizeChange,
  maxLogoSize,
  placeholder = 'Enter URL or text',
  correctionLabel = 'Scan Reliability',
  foregroundLabel = 'Foreground',
  backgroundLabel = 'Background',
  downloadPngLabel = 'Download PNG',
  downloadSvgLabel = 'Download SVG',
  correctionOptions = [
    { value: 'L', label: 'Low (7%)' },
    { value: 'M', label: 'Medium (15%)' },
    { value: 'Q', label: 'High (25%)' },
    { value: 'H', label: 'Highest (30%)' },
  ],
  eyeFrameShape,
  onEyeFrameShapeChange,
  eyeCenterShape,
  onEyeCenterShapeChange,
  eyeFrameColor,
  onEyeFrameColorChange,
  eyeCenterColor,
  onEyeCenterColorChange,
  pixelPattern,
  onPixelPatternChange,
  eyeFrameLabel = 'Corner Frame',
  eyeCenterLabel = 'Corner Dot',
  eyeFrameColorLabel = 'Corner Frame Color',
  eyeCenterColorLabel = 'Corner Dot Color',
  eyeColorMatchForegroundLabel = 'Match foreground',
  pixelPatternLabel = 'Pixel Pattern',
  eyeFrameOptions = [
    { value: 'Square', label: 'Square' },
    { value: 'Rounded', label: 'Rounded' },
    { value: 'Circle', label: 'Circle' },
    { value: 'Leaf', label: 'Leaf' },
    { value: 'Hexagon', label: 'Hexagon' },
    { value: 'SquareRound', label: 'Square Round' },
    { value: 'RoundSquare', label: 'Round Square' },
    { value: 'Diamond', label: 'Diamond' },
  ],
  eyeCenterOptions = [
    { value: 'Square', label: 'Square' },
    { value: 'Rounded', label: 'Rounded' },
    { value: 'Dot', label: 'Dot' },
    { value: 'Diamond', label: 'Diamond' },
    { value: 'Star', label: 'Star' },
    { value: 'Cross', label: 'Cross' },
  ],
  pixelPatternOptions = [
    { value: 'Square',     label: 'Square' },
    { value: 'Dots',       label: 'Dots' },
    { value: 'Rounded',    label: 'Rounded' },
    { value: 'Diamond',    label: 'Diamond' },
    { value: 'Classy',     label: 'Classy' },
    { value: 'Fluid',      label: 'Fluid' },
    { value: 'Vertical',   label: 'Vertical' },
    { value: 'Horizontal', label: 'Horizontal' },
  ],
  isRiskyPattern,
  onDismissWarning,
  correctionTooltip = 'How much of the QR code can be covered or damaged and still scan. Low gives a compact code; Highest lets you overlay a logo at the cost of a denser pattern.',
  correctionTooltipAriaLabel = 'About error correction',
  dismissWarningAriaLabel = 'Dismiss warning',
  correctionHint = 'Higher = survives damage and supports logos.',
  correctionBelowRecommendedLabel = 'Lower reliability can make this code harder to scan. Highest is recommended.',
  downloadStatus,
  downloadStatusMessage = 'Downloaded',
  contentMode = 'text',
  onContentModeChange,
  contentTypeLabel = 'Select content type',
  contentModeTextLabel = 'Link / Text',
  contentModeWifiLabel = 'Wi-Fi',
  wifiConfig,
  onWifiSsidChange,
  onWifiPasswordChange,
  onWifiSecurityChange,
  onWifiHiddenChange,
  wifiCorrectionHint = 'Printed codes scan best at Highest reliability.',
  contentModeVCardLabel = 'Contact',
  vcardConfig,
  onVCardFirstNameChange,
  onVCardLastNameChange,
  onVCardPhoneChange,
  onVCardEmailChange,
  onVCardCompanyChange,
  onVCardJobTitleChange,
  onVCardWebsiteChange,
  vcardCorrectionHint = 'Highest reliability recommended for contact cards.',
  contentModeEmailLabel = 'Email',
  emailConfig,
  onEmailToChange,
  onEmailSubjectChange,
  onEmailBodyChange,
  emailCorrectionHint = 'Highest reliability recommended for email codes.',
  contentModeSmsLabel = 'SMS',
  smsConfig,
  onSmsNumberChange,
  onSmsMessageChange,
  smsCorrectionHint = 'Set to Highest for the most reliable SMS scanning.',
  contentModeTelLabel = 'Phone',
  telConfig,
  onTelNumberChange,
  telCorrectionHint = 'Set to Highest for the most reliable scanning.',
  contentModeGeoLabel = 'Location',
  geoConfig,
  onGeoLatitudeChange,
  onGeoLongitudeChange,
  geoCorrectionHint = 'Set to Highest for the most reliable scanning.',
  contentModeVEventLabel = 'Event',
  veventConfig,
  onVEventSummaryChange,
  onVEventStartChange,
  onVEventEndChange,
  onVEventAllDayChange,
  onVEventLocationChange,
  onVEventDescriptionChange,
  veventCorrectionHint = 'Set to Highest for the most reliable scanning.',
  contentModeCryptoLabel = 'Crypto',
  cryptoConfig,
  onCryptoChange,
  cryptoCorrectionHint = 'Set to Highest for the most reliable scanning.',
  logoLabel = 'Logo',
  logoSizeLabel = 'Logo Size',
  logoUploadHint = 'Click or drop image',
  logoUploadAriaLabel = 'Upload logo image — press Enter or Space to browse files, or drag and drop',
  logoUrlAriaLabel = 'Logo image URL',
  logoPasteUrl = 'or paste a URL',
  logoRemoveLabel = 'Remove logo',
  logoErrorFormat = 'Please select an image file',
  logoErrorUrl = 'Could not load image from URL',
  logoTransparencyHint = 'PNG or SVG works best for transparent logos',
  logoSizeCapHint = 'Size capped at {max}% for this error correction level — switch to Highest for up to 30%',
  appearanceLabel = 'Appearance',
  frameStyle = 'None',
  onFrameStyleChange,
  frameText = '',
  onFrameTextChange,
  frameColor = DEFAULT_FRAME_COLOR,
  onFrameColorChange,
  framePosition = 'bottom',
  onFramePositionChange,
  frameTextLimit = 24,
  frameLabel = 'Frame',
  frameHintLabel = 'Wrap your code with a label like SCAN ME so people know to scan it.',
  frameStyleHeadingLabel = 'Style',
  frameTextLabel = 'Caption',
  frameTextPlaceholder = 'SCAN ME',
  frameTextHint = 'Shown on the frame. Leave empty for no caption.',
  frameTextLimitReachedLabel = 'Caption at maximum {max} characters.',
  frameColorLabel = 'Frame Color',
  frameColorLowContrastLabel = 'This frame color blends into the background. Pick a more contrasting color so the frame stays visible.',
  framePositionLabel = 'Caption Position',
  framePositionTopLabel = 'Top',
  framePositionBottomLabel = 'Bottom',
  frameStyleLabels = {
    None: 'None',
    Banner: 'Banner',
    Card: 'Card',
    Ticket: 'Ticket',
    Label: 'Label',
    Bubble: 'Bubble',
    Ticks: 'Corners',
    Photo: 'Photo',
  },
}: QRControlsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [showUrlInput, setShowUrlInput] = useState(false)
  const [logoError, setLogoError] = useState<string | undefined>()
  const [logoFilename, setLogoFilename] = useState<string | undefined>()
  const [isDragOver, setIsDragOver] = useState(false)
  const [isLoadingLogo, setIsLoadingLogo] = useState(false)
  const [isLogoOpen, setIsLogoOpen] = useState(false)
  const [isStyleOpen, setIsStyleOpen] = useState(() => {
    try { return localStorage.getItem('qr-generator-style-open') === 'true' } catch { return false }
  })
  const [isFrameOpen, setIsFrameOpen] = useState(() => {
    try { return localStorage.getItem('qr-generator-frame-open') === 'true' } catch { return false }
  })

  const pixelPatternLabelId = useId()
  const fgColorId = useId()
  const bgColorId = useId()
  const eyeFrameColorId = useId()
  const eyeCenterColorId = useId()
  const frameColorId = useId()
  const frameStyleLabelId = useId()
  const logoSizeId = useId()
  const logoFileId = useId()

  // Non-text modes force Highest on entry; if the user drops below it, the choice is
  // advised against. Drives both the amber caption and the amber active-pill treatment.
  const reliabilityBelowRecommended = contentMode !== 'text' && ecLevel !== 'H'

  const [dismissedColors, setDismissedColors] = useState<{ fg: string; bg: string } | null>(null)
  const fgLum = relativeLuminance(fgColor)
  const bgLum = relativeLuminance(bgColor)
  const colorContrast = wcagContrastRatio(fgColor, bgColor)
  const isLowContrast = colorContrast !== null && colorContrast < 3
  const isInvertedColors = !isLowContrast && fgLum !== null && bgLum !== null && fgLum > bgLum
  const isContrastDismissed = dismissedColors !== null && dismissedColors.fg === fgColor && dismissedColors.bg === bgColor
  const showContrastWarning = !isContrastDismissed && (isLowContrast || isInvertedColors)
  const contrastRatioLabel = colorContrast !== null ? `${colorContrast.toFixed(1)}:1` : null

  // The caption auto-contrasts against the frame fill; this guards the other pairing —
  // a frame color too close to the QR background renders an invisible frame.
  const frameBgContrast = wcagContrastRatio(frameColor, bgColor)
  const isFrameLowContrast = frameStyle !== 'None' && frameBgContrast !== null && frameBgContrast < 1.5

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setLogoError(logoErrorFormat)
      return
    }
    setLogoError(undefined)
    setLogoFilename(file.name)
    const reader = new FileReader()
    reader.onload = (ev) => {
      const result = ev.target?.result
      if (typeof result === 'string') {
        onLogoChange?.(result)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    processFile(file)
    e.target.value = ''
  }

  const handleUrlSubmit = async (url: string) => {
    const trimmed = url.trim()
    if (!trimmed) return
    setIsLoadingLogo(true)
    setLogoError(undefined)
    try {
      const dataUrl = await loadImageFromUrl(trimmed)
      const filename = trimmed.split('/').pop()?.split('?')[0] || 'logo'
      setLogoFilename(filename)
      setShowUrlInput(false)
      onLogoChange?.(dataUrl)
    } catch {
      setLogoError(logoErrorUrl)
    } finally {
      setIsLoadingLogo(false)
    }
  }

  const handleRemove = () => {
    setLogoFilename(undefined)
    setLogoError(undefined)
    setShowUrlInput(false)
    onLogoChange?.(null)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) processFile(file)
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex flex-col gap-4">
        {/* Content mode switcher */}
        {onContentModeChange && (
          <PillGroup
            options={[
              { value: 'text', label: contentModeTextLabel, icon: <Link size={13} aria-hidden /> },
              { value: 'wifi', label: contentModeWifiLabel, icon: <Wifi size={13} aria-hidden /> },
              { value: 'vcard', label: contentModeVCardLabel, icon: <User size={13} aria-hidden /> },
              { value: 'email', label: contentModeEmailLabel, icon: <Mail size={13} aria-hidden /> },
              { value: 'sms', label: contentModeSmsLabel, icon: <MessageSquare size={13} aria-hidden /> },
              { value: 'tel', label: contentModeTelLabel, icon: <Phone size={13} aria-hidden /> },
              { value: 'geo', label: contentModeGeoLabel, icon: <MapPin size={13} aria-hidden /> },
              { value: 'vevent', label: contentModeVEventLabel, icon: <Calendar size={13} aria-hidden /> },
              { value: 'crypto', label: contentModeCryptoLabel, icon: <Bitcoin size={13} aria-hidden /> },
            ]}
            value={contentMode}
            onChange={onContentModeChange}
            containerClassName="flex flex-wrap justify-center gap-2"
            itemClassName="grow-0 basis-[calc(50%-0.25rem)] lg:basis-[calc(33.333%-0.34rem)]"
            aria-label={contentTypeLabel}
          />
        )}

        {contentMode === 'wifi' && wifiConfig && onWifiSsidChange && onWifiPasswordChange && onWifiSecurityChange && onWifiHiddenChange ? (
          <WiFiForm
            config={wifiConfig}
            onSsidChange={onWifiSsidChange}
            onPasswordChange={onWifiPasswordChange}
            onSecurityChange={onWifiSecurityChange}
            onHiddenChange={onWifiHiddenChange}
          />
        ) : contentMode === 'vcard' && vcardConfig && onVCardFirstNameChange && onVCardLastNameChange && onVCardPhoneChange && onVCardEmailChange && onVCardCompanyChange && onVCardJobTitleChange && onVCardWebsiteChange ? (
          <VCardForm
            config={vcardConfig}
            onFirstNameChange={onVCardFirstNameChange}
            onLastNameChange={onVCardLastNameChange}
            onPhoneChange={onVCardPhoneChange}
            onEmailChange={onVCardEmailChange}
            onCompanyChange={onVCardCompanyChange}
            onJobTitleChange={onVCardJobTitleChange}
            onWebsiteChange={onVCardWebsiteChange}
          />
        ) : contentMode === 'email' && emailConfig && onEmailToChange && onEmailSubjectChange && onEmailBodyChange ? (
          <EmailForm
            config={emailConfig}
            onToChange={onEmailToChange}
            onSubjectChange={onEmailSubjectChange}
            onBodyChange={onEmailBodyChange}
          />
        ) : contentMode === 'sms' && smsConfig && onSmsNumberChange && onSmsMessageChange ? (
          <SmsForm
            config={smsConfig}
            onNumberChange={onSmsNumberChange}
            onMessageChange={onSmsMessageChange}
          />
        ) : contentMode === 'tel' && telConfig && onTelNumberChange ? (
          <TelForm
            config={telConfig}
            onNumberChange={onTelNumberChange}
          />
        ) : contentMode === 'geo' && geoConfig && onGeoLatitudeChange && onGeoLongitudeChange ? (
          <GeoForm
            config={geoConfig}
            onLatitudeChange={onGeoLatitudeChange}
            onLongitudeChange={onGeoLongitudeChange}
          />
        ) : contentMode === 'vevent' && veventConfig && onVEventSummaryChange && onVEventStartChange && onVEventEndChange && onVEventAllDayChange && onVEventLocationChange && onVEventDescriptionChange ? (
          <VEventForm
            config={veventConfig}
            onSummaryChange={onVEventSummaryChange}
            onStartChange={onVEventStartChange}
            onEndChange={onVEventEndChange}
            onAllDayChange={onVEventAllDayChange}
            onLocationChange={onVEventLocationChange}
            onDescriptionChange={onVEventDescriptionChange}
          />
        ) : contentMode === 'crypto' && cryptoConfig && onCryptoChange ? (
          <CryptoForm
            config={cryptoConfig}
            onChange={onCryptoChange}
          />
        ) : (
          <Input
            label={contentModeTextLabel}
            placeholder={placeholder}
            value={value}
            onChange={(e) => onValueChange(e.target.value)}
            error={inputError}
            inputMode="url"
            required
          />
        )}

        <div className={`space-y-4 transition-opacity duration-150 ${(contentMode === 'text' ? !value.trim() : !hasContent) ? 'opacity-40' : ''}`}>
          {contentMode !== 'text' && <hr className="border-border-subtle" />}
          {/* EC Level pill row */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-medium text-text-primary">{correctionLabel}</span>
              <Tooltip content={correctionTooltip} ariaLabel={correctionTooltipAriaLabel} />
            </div>
            <PillGroup
              options={correctionOptions}
              value={ecLevel}
              onChange={onEcLevelChange}
              activeClassName={reliabilityBelowRecommended ? 'bg-warning text-action-fg font-semibold' : undefined}
              aria-label={correctionLabel}
            />
            {/* Non-text modes force Highest on entry. If the user then lowers it, the
                static "Highest recommended" line would contradict the active choice, so
                surface a caution instead. aria-live (without role=status, which already
                belongs to the share/download region) announces the auto-set and later changes. */}
            <p
              aria-live="polite"
              className={`text-xs ${reliabilityBelowRecommended ? 'text-warning' : 'text-text-secondary'}`}
            >
              {reliabilityBelowRecommended
                ? correctionBelowRecommendedLabel
                : contentMode === 'wifi' ? wifiCorrectionHint : contentMode === 'vcard' ? vcardCorrectionHint : contentMode === 'email' ? emailCorrectionHint : contentMode === 'sms' ? smsCorrectionHint : contentMode === 'tel' ? telCorrectionHint : contentMode === 'geo' ? geoCorrectionHint : contentMode === 'vevent' ? veventCorrectionHint : contentMode === 'crypto' ? cryptoCorrectionHint : correctionHint}
            </p>
          </div>

          <hr className="border-border-subtle" />
          <button
            type="button"
            onClick={() => {
              const next = !isStyleOpen
              setIsStyleOpen(next)
              try { localStorage.setItem('qr-generator-style-open', String(next)) } catch { /* storage unavailable */ }
            }}
            className="flex min-h-[44px] items-center justify-between w-full text-sm font-medium text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring rounded"
            aria-expanded={isStyleOpen}
          >
            <span>{appearanceLabel}</span>
            {isStyleOpen ? (
              <ChevronUp size={12} aria-hidden className="text-text-secondary" />
            ) : (
              <ChevronDown size={12} aria-hidden className="text-text-secondary" />
            )}
          </button>

          {isStyleOpen && (<>
            <div className="flex flex-col gap-4">
              {/* Eye Border (frame) swatch grid */}
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium text-text-primary">{eyeFrameLabel}</span>
                <div role="group" aria-label={eyeFrameLabel} className="grid grid-cols-4 gap-1">
                  {eyeFrameOptions.map(({ value: optValue, label }) => (
                    <button
                      key={optValue}
                      type="button"
                      title={`${label} frame`}
                      aria-label={`${label} frame`}
                      aria-pressed={eyeFrameShape === optValue}
                      onClick={() => onEyeFrameShapeChange(optValue)}
                      className={`flex h-11 items-center justify-center rounded-lg border-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring ${
                        eyeFrameShape === optValue
                          ? 'border-action bg-surface-raised text-text-primary'
                          : 'border-transparent bg-surface-inset text-text-secondary hover:bg-surface-raised hover:text-text-primary'
                      }`}
                    >
                      <EyeFrameIcon shape={optValue} size={18} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Eye Center (ball) swatch grid */}
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium text-text-primary">{eyeCenterLabel}</span>
                <div role="group" aria-label={eyeCenterLabel} className="grid grid-cols-3 gap-1">
                  {eyeCenterOptions.map(({ value: optValue, label }) => (
                    <button
                      key={optValue}
                      type="button"
                      title={`${label} center`}
                      aria-label={`${label} center`}
                      aria-pressed={eyeCenterShape === optValue}
                      onClick={() => onEyeCenterShapeChange(optValue)}
                      className={`flex h-11 items-center justify-center rounded-lg border-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring ${
                        eyeCenterShape === optValue
                          ? 'border-action bg-surface-raised text-text-primary'
                          : 'border-transparent bg-surface-inset text-text-secondary hover:bg-surface-raised hover:text-text-primary'
                      }`}
                    >
                      <EyeCenterIcon shape={optValue} size={18} />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Pixel Pattern swatch grid */}
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium text-text-primary" id={pixelPatternLabelId}>{pixelPatternLabel}</span>
              <div role="group" aria-labelledby={pixelPatternLabelId} className="grid grid-cols-4 gap-1">
                {pixelPatternOptions.map(({ value: optValue, label }) => (
                  <button
                    key={optValue}
                    type="button"
                    title={`${label} pattern`}
                    aria-label={`${label} pattern`}
                    aria-pressed={pixelPattern === optValue}
                    onClick={() => onPixelPatternChange(optValue)}
                    className={`flex h-11 items-center justify-center rounded-lg border-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring ${
                      pixelPattern === optValue
                        ? 'border-action bg-surface-raised text-text-primary'
                        : 'border-transparent bg-surface-inset text-text-secondary hover:bg-surface-raised hover:text-text-primary'
                    }`}
                  >
                    <PixelPatternIcon pattern={optValue} size={18} />
                  </button>
                ))}
              </div>
              {(pixelPattern === 'Classy' || pixelPattern === 'Fluid') && (
                <p className="text-xs text-text-secondary">Merges touching modules into flowing shapes.</p>
              )}
            </div>

            {isRiskyPattern && (
              <Callout title="Readability Risk" onDismiss={onDismissWarning} dismissLabel={dismissWarningAriaLabel}>
                High density shapes may affect camera readability.
              </Callout>
            )}

            {/* Color pickers — 44px inset boxes */}
            <div className="flex flex-col gap-4">
              <div className="flex gap-4">
                <div className="min-w-[120px] flex-1 flex flex-col gap-1">
                  <label htmlFor={fgColorId} className="text-sm font-medium text-text-primary">{foregroundLabel}</label>
                  <div className="relative flex h-11 items-center gap-3 rounded-lg bg-surface-inset px-3 focus-within:ring-2 focus-within:ring-focus-ring focus-within:outline-none">
                    <div className="h-5 w-5 shrink-0 rounded-full border-2 border-border-strong" style={{ backgroundColor: fgColor }} />
                    <span className="text-sm font-medium uppercase font-['Geist_Mono'] text-text-primary truncate">
                      {fgColor}
                    </span>
                    <input
                      id={fgColorId}
                      type="color"
                      value={fgColor}
                      onChange={(e) => onFgColorChange(e.target.value)}
                      className="absolute inset-0 h-full w-full cursor-pointer opacity-0 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="min-w-[120px] flex-1 flex flex-col gap-1">
                  <label htmlFor={bgColorId} className="text-sm font-medium text-text-primary">{backgroundLabel}</label>
                  <div className="relative flex h-11 items-center gap-3 rounded-lg bg-surface-inset px-3 focus-within:ring-2 focus-within:ring-focus-ring focus-within:outline-none">
                    <div className="h-5 w-5 shrink-0 rounded-full border-2 border-border-strong" style={{ backgroundColor: bgColor }} />
                    <span className="text-sm font-medium uppercase font-['Geist_Mono'] text-text-primary truncate">
                      {bgColor}
                    </span>
                    <input
                      id={bgColorId}
                      type="color"
                      value={bgColor}
                      onChange={(e) => onBgColorChange(e.target.value)}
                      className="absolute inset-0 h-full w-full cursor-pointer opacity-0 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <EyeColorField
                  id={eyeFrameColorId}
                  label={eyeFrameColorLabel}
                  color={eyeFrameColor}
                  fallbackColor={fgColor}
                  onChange={onEyeFrameColorChange}
                  matchLabel={eyeColorMatchForegroundLabel}
                />

                <EyeColorField
                  id={eyeCenterColorId}
                  label={eyeCenterColorLabel}
                  color={eyeCenterColor}
                  fallbackColor={fgColor}
                  onChange={onEyeCenterColorChange}
                  matchLabel={eyeColorMatchForegroundLabel}
                />
              </div>
            </div>
          </>)}

          {/* Frame */}
          {onFrameStyleChange && (
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  const next = !isFrameOpen
                  setIsFrameOpen(next)
                  try { localStorage.setItem('qr-generator-frame-open', String(next)) } catch { /* storage unavailable */ }
                }}
                className="flex min-h-[44px] items-center justify-between w-full text-sm font-medium text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring rounded"
                aria-expanded={isFrameOpen}
              >
                <span className="flex items-center gap-2">
                  {frameLabel}
                  {frameStyle !== 'None' && (
                    <span className="rounded-full bg-surface-inset px-2 py-0.5 text-[11px] font-semibold text-text-primary">
                      {frameStyleLabels[frameStyle]}
                    </span>
                  )}
                </span>
                {isFrameOpen ? (
                  <ChevronUp size={12} aria-hidden className="text-text-secondary" />
                ) : (
                  <ChevronDown size={12} aria-hidden className="text-text-secondary" />
                )}
              </button>

              {isFrameOpen && (
                <div className="flex flex-col gap-4">
                  <p className="text-xs text-text-secondary">{frameHintLabel}</p>
                  <div className="flex flex-col gap-1">
                    <span id={frameStyleLabelId} className="text-sm font-medium text-text-primary">{frameStyleHeadingLabel}</span>
                    <div role="group" aria-labelledby={frameStyleLabelId} className="grid grid-cols-4 gap-1">
                      {(['None', 'Banner', 'Card', 'Ticket', 'Label', 'Bubble', 'Ticks', 'Photo'] as QRFrameStyle[]).map((style) => (
                        <button
                          key={style}
                          type="button"
                          title={frameStyleLabels[style]}
                          aria-label={frameStyleLabels[style]}
                          aria-pressed={frameStyle === style}
                          onClick={() => onFrameStyleChange(style)}
                          className={`flex h-16 flex-col items-center justify-center gap-1 rounded-lg border-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring ${
                            frameStyle === style
                              ? 'border-action bg-surface-raised text-text-primary'
                              : 'border-transparent bg-surface-inset text-text-secondary hover:bg-surface-raised hover:text-text-primary'
                          }`}
                        >
                          <FramePreviewIcon style={style} size={22} />
                          <span className="text-[11px] font-medium leading-tight">{frameStyleLabels[style]}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {frameStyle !== 'None' && (
                    <>
                      {onFrameTextChange && (
                        <div className="flex flex-col gap-1">
                          <Input
                            label={frameTextLabel}
                            placeholder={frameTextPlaceholder}
                            value={frameText}
                            onChange={(e) => onFrameTextChange(e.target.value)}
                            maxLength={frameTextLimit}
                          />
                          <div className="flex items-baseline justify-between gap-2">
                            <p className="text-xs text-text-secondary">{frameTextHint}</p>
                            <span className={`shrink-0 text-xs tabular-nums ${frameText.length >= frameTextLimit ? 'text-warning' : 'text-text-secondary'}`}>
                              {frameText.length}/{frameTextLimit}
                            </span>
                          </div>
                          {/* Announce only on reaching the cap — a per-keystroke live counter would spam */}
                          <span className="sr-only" role="status" aria-live="polite">
                            {frameText.length >= frameTextLimit ? frameTextLimitReachedLabel.replace('{max}', String(frameTextLimit)) : ''}
                          </span>
                        </div>
                      )}

                      <div className="flex gap-4">
                        {onFrameColorChange && (
                          <div className="min-w-[120px] flex-1 flex flex-col gap-1">
                            <label htmlFor={frameColorId} className="text-sm font-medium text-text-primary">{frameColorLabel}</label>
                            <div className="relative flex h-11 items-center gap-3 rounded-lg bg-surface-inset px-3 focus-within:ring-2 focus-within:ring-focus-ring focus-within:outline-none">
                              <div className="h-5 w-5 shrink-0 rounded-full border-2 border-border-strong" style={{ backgroundColor: frameColor }} />
                              <span className="text-sm font-medium uppercase font-['Geist_Mono'] text-text-primary truncate">{frameColor}</span>
                              <input
                                id={frameColorId}
                                type="color"
                                value={frameColor}
                                onChange={(e) => onFrameColorChange(e.target.value)}
                                className="absolute inset-0 h-full w-full cursor-pointer opacity-0 focus:outline-none"
                              />
                            </div>
                          </div>
                        )}

                        {onFramePositionChange && (
                          <div className="min-w-[120px] flex-1 flex flex-col gap-1">
                            <span className="text-sm font-medium text-text-primary">{framePositionLabel}</span>
                            <PillGroup
                              options={[
                                { value: 'top', label: framePositionTopLabel },
                                { value: 'bottom', label: framePositionBottomLabel },
                              ]}
                              value={framePosition}
                              onChange={onFramePositionChange}
                              aria-label={framePositionLabel}
                            />
                          </div>
                        )}
                      </div>

                      {isFrameLowContrast && (
                        <p role="status" className="text-xs text-warning">
                          {frameColorLowContrastLabel}
                        </p>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Logo upload */}
          {onLogoChange && (
            <div className="flex flex-col gap-2">

              <button
                type="button"
                onClick={() => setIsLogoOpen(prev => !prev)}
                className="flex min-h-[44px] items-center justify-between w-full text-sm font-medium text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring rounded"
                aria-expanded={isLogoOpen || !!logoDataUrl}
              >
                <span>{logoLabel}</span>
                {isLogoOpen || logoDataUrl ? (
                  <ChevronUp size={12} aria-hidden className="text-text-secondary" />
                ) : (
                  <ChevronDown size={12} aria-hidden className="text-text-secondary" />
                )}
              </button>

              {(isLogoOpen || logoDataUrl) && <>{logoDataUrl ? (
                <div className="flex items-center gap-3 rounded-lg bg-surface-inset px-3 h-11">
                  <img
                    src={logoDataUrl}
                    alt=""
                    className="h-7 w-7 shrink-0 rounded-full object-cover border border-border-subtle"
                  />
                  <span className="flex-1 truncate text-sm font-medium text-text-primary">
                    {logoFilename || 'Logo'}
                  </span>
                  <button
                    type="button"
                    onClick={handleRemove}
                    aria-label={logoRemoveLabel}
                    title={logoRemoveLabel}
                    className="shrink-0 rounded p-1 text-text-secondary hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
                  >
                    <X size={14} aria-hidden />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor={logoFileId}
                    role="button"
                    aria-label={logoUploadAriaLabel}
                    onDragOver={(e) => { e.preventDefault(); setIsDragOver(true) }}
                    onDragLeave={() => setIsDragOver(false)}
                    onDrop={handleDrop}
                    onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); fileInputRef.current?.click() } }}
                    tabIndex={0}
                    className={`flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed text-sm transition-colors ${
                      isDragOver
                        ? 'border-action bg-action/5 text-action'
                        : 'border-border-subtle bg-surface-inset text-text-secondary hover:border-action hover:text-text-primary'
                    }`}
                  >
                    {isLoadingLogo ? (
                      <span className="h-4 w-4 motion-safe:animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden />
                    ) : (
                      <Upload size={15} aria-hidden />
                    )}
                    {isLoadingLogo ? 'Loading…' : logoUploadHint}
                  </label>
                  <input
                    id={logoFileId}
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="absolute opacity-0 w-px h-px"
                    onChange={handleFileChange}
                    tabIndex={-1}
                  />

                  {!showUrlInput ? (
                    <button
                      type="button"
                      onClick={() => setShowUrlInput(true)}
                      className="self-start py-3 px-1 text-xs text-action hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action rounded"
                    >
                      {logoPasteUrl}
                    </button>
                  ) : (
                    <input
                      type="url"
                      placeholder="https://…"
                      aria-label={logoUrlAriaLabel}
                      className="h-11 w-full rounded-lg border border-border-strong bg-surface-inset px-3 text-sm text-text-primary placeholder:text-text-disabled focus:border-focus-ring focus:outline-none focus:ring-2 focus:ring-focus-ring"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') void handleUrlSubmit(e.currentTarget.value)
                        if (e.key === 'Escape') setShowUrlInput(false)
                      }}
                      onBlur={(e) => { if (e.target.value) void handleUrlSubmit(e.target.value) }}
                      autoFocus
                    />
                  )}
                </div>
              )}

              {logoError && (
                <p className="text-xs text-error" role="alert">{logoError}</p>
              )}

              {logoDataUrl && logoSize !== undefined && maxLogoSize !== undefined && onLogoSizeChange && (
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label htmlFor={logoSizeId} className="text-sm font-medium text-text-primary">{logoSizeLabel}</label>
                    <span className="text-sm tabular-nums text-text-secondary">{logoSize}%</span>
                  </div>
                  <input
                    id={logoSizeId}
                    type="range"
                    min={5}
                    max={maxLogoSize}
                    value={logoSize}
                    aria-valuetext={`${logoSize}%`}
                    onChange={(e) => onLogoSizeChange(Number(e.target.value))}
                    className="h-1.5 w-full cursor-pointer accent-action"
                  />
                  {logoSize >= maxLogoSize && maxLogoSize < 30 ? (
                    <p className="text-xs text-text-secondary" role="status">
                      {logoSizeCapHint.replace('{max}', String(maxLogoSize))}
                    </p>
                  ) : (
                    <p className="text-xs text-text-secondary">{logoTransparencyHint}</p>
                  )}
                </div>
              )}
              </>}
            </div>
          )}
        </div>

        {showContrastWarning && (
          <Callout
            title={isLowContrast ? 'Contrast Risk' : 'Inverted Colors'}
            onDismiss={() => setDismissedColors({ fg: fgColor, bg: bgColor })}
            dismissLabel="Dismiss contrast warning"
          >
            {isLowContrast
              ? `${contrastRatioLabel ? `${contrastRatioLabel}, low` : 'Low'} contrast may prevent scanners from reading the QR code. Try darkening your foreground or lightening your background.`
              : 'Light on dark may not be recognized by all scanners. Try swapping foreground and background colors.'}
          </Callout>
        )}

        {/* Download buttons */}
        {(onDownloadPng || onDownloadSvg) && (
          <div className="flex flex-col gap-2">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3">
              {onDownloadPng && (
                <button
                  type="button"
                  onClick={onDownloadPng}
                  disabled={!canDownload}
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-border-subtle bg-surface-raised px-4 text-sm font-medium text-text-primary transition-colors hover:bg-surface-inset focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {downloadStatus === 'png' ? (
                    <Check size={16} aria-hidden className="text-action" />
                  ) : (
                    <Download size={16} aria-hidden />
                  )}
                  {downloadPngLabel}
                </button>
              )}
              {onDownloadSvg && (
                <button
                  type="button"
                  onClick={onDownloadSvg}
                  disabled={!canDownload}
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-border-subtle bg-surface-raised px-4 text-sm font-medium text-text-primary transition-colors hover:bg-surface-inset focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {downloadStatus === 'svg' ? (
                    <Check size={16} aria-hidden className="text-action" />
                  ) : (
                    <Download size={16} aria-hidden />
                  )}
                  {downloadSvgLabel}
                </button>
              )}
            </div>
            {downloadStatus && (
              <p role="status" aria-live="polite" className="text-sm text-text-secondary text-center">
                {downloadStatusMessage}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
