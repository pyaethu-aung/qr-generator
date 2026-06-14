import type {
  CryptoConfig,
  CryptoNetwork,
  EmailConfig,
  GeoConfig,
  QRContentMode,
  QRDesignConfig,
  QRErrorCorrectionLevel,
  QREyeCenterShape,
  QREyeFrameShape,
  QRFrameConfig,
  QRFramePosition,
  QRFrameStyle,
  QRPixelPattern,
  SmsConfig,
  TelConfig,
  VCardConfig,
  VEventConfig,
  WiFiConfig,
  WiFiSecurity,
} from '../types/qr'

/**
 * Shareable config URL. The full reproducible QR config (content + design, minus the
 * logo, which a data-URI would blow past any sane URL length) is encoded into a single
 * `#c=` hash param: a base64url of compact JSON. The hash keeps the config client-side
 * only — it is never sent to the GitHub Pages server or any analytics.
 *
 * SECURITY: the hash is fully attacker-controllable (someone sends you a link). Every
 * field is re-validated and sanitized on decode against a fixed schema before it can
 * reach component state — colors must match a strict hex pattern (they end up in SVG
 * `fill` attributes), enums must be known values, and free text is length-capped. A
 * malformed or hostile token decodes to `null` and is ignored.
 */

const SCHEMA_VERSION = 1
const HASH_PARAM = 'c'
const TEXT_MAX = 2000
const FRAME_TEXT_MAX = 24
const HEX_RE = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/

export const SHARE_CONTENT_MODES: readonly QRContentMode[] = [
  'text', 'wifi', 'vcard', 'email', 'sms', 'tel', 'geo', 'vevent', 'crypto',
]
const EC_LEVELS: readonly QRErrorCorrectionLevel[] = ['L', 'M', 'Q', 'H']
const EYE_FRAME_SHAPES: readonly QREyeFrameShape[] = ['Square', 'Rounded', 'Circle', 'Leaf', 'Hexagon', 'SquareRound', 'RoundSquare', 'Diamond']
const EYE_CENTER_SHAPES: readonly QREyeCenterShape[] = ['Square', 'Rounded', 'Dot', 'Diamond', 'Star', 'Cross']
const PIXEL_PATTERNS: readonly QRPixelPattern[] = ['Square', 'Dots', 'Rounded', 'Diamond', 'Vertical', 'Classy', 'Fluid', 'Horizontal']
const FRAME_STYLES: readonly QRFrameStyle[] = ['None', 'Banner', 'Card', 'Ticket', 'Label', 'Bubble', 'Ticks', 'Photo']
const FRAME_POSITIONS: readonly QRFramePosition[] = ['top', 'bottom']
const WIFI_SECURITY: readonly WiFiSecurity[] = ['WPA', 'WEP', 'nopass']
const CRYPTO_NETWORKS: readonly CryptoNetwork[] = ['bitcoin', 'ethereum']

// Defaults mirror the canonical ones in the per-mode hooks and data/defaults.ts; kept
// local so this module stays self-contained and the hooks need no new exports.
const DEFAULT_FRAME_COLOR = '#A04D28'
const DEFAULT_DESIGN: QRDesignConfig = {
  eyeFrameShape: 'Square', eyeCenterShape: 'Square', eyeFrameColor: null, eyeCenterColor: null, pixelPattern: 'Square',
}
const DEFAULT_FRAME: QRFrameConfig = { style: 'None', text: 'SCAN ME', color: DEFAULT_FRAME_COLOR, position: 'bottom' }

/** localStorage keys, mirroring the literals each hook restores from. */
const STORAGE_KEYS = {
  contentMode: 'qr-generator:draft:content-mode',
  text: 'qr-generator:draft:text',
  wifi: 'qr-generator:draft:wifi',
  vcard: 'qr-generator:draft:vcard',
  email: 'qr-generator:draft:email',
  sms: 'qr-generator:draft:sms',
  tel: 'qr-generator:draft:tel',
  geo: 'qr-generator:draft:geo',
  vevent: 'qr-generator:draft:vevent',
  crypto: 'qr-generator:draft:crypto',
  design: 'qr-generator-design-config',
  frame: 'qr-generator-frame-config',
} as const

/** The active mode's content: a raw string for text, or that mode's structured config. */
export type ShareContentData =
  | string | WiFiConfig | VCardConfig | EmailConfig | SmsConfig | TelConfig | GeoConfig | VEventConfig | CryptoConfig

export interface ShareAppearance {
  ecLevel: QRErrorCorrectionLevel
  fgColor: string
  bgColor: string
}

export interface ShareConfigInput {
  mode: QRContentMode
  content: ShareContentData
  ecLevel: QRErrorCorrectionLevel
  fgColor: string
  bgColor: string
  design: QRDesignConfig
  frame: QRFrameConfig
}

export interface DecodedShareConfig {
  mode: QRContentMode
  content: ShareContentData
  appearance: ShareAppearance
  design: QRDesignConfig
  frame: QRFrameConfig
}

// --- base64url over UTF-8 (TextEncoder keeps Burmese SSIDs / captions intact) ---

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function base64UrlToBytes(value: string): Uint8Array {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/')
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4)
  const binary = atob(padded)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i)
  return bytes
}

// --- field sanitizers ---

function asObject(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {}
}
function str(value: unknown, fallback = '', max = TEXT_MAX): string {
  return typeof value === 'string' ? value.slice(0, max) : fallback
}
function bool(value: unknown, fallback = false): boolean {
  return typeof value === 'boolean' ? value : fallback
}
function oneOf<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  return allowed.includes(value as T) ? (value as T) : fallback
}
function hex(value: unknown, fallback: string): string {
  return typeof value === 'string' && HEX_RE.test(value) ? value : fallback
}
function hexOrNull(value: unknown): string | null {
  return typeof value === 'string' && HEX_RE.test(value) ? value : null
}

function sanitizeContent(mode: QRContentMode, raw: unknown): ShareContentData {
  if (mode === 'text') return str(raw)
  const o = asObject(raw)
  switch (mode) {
    case 'wifi':
      return { ssid: str(o.ssid), password: str(o.password), security: oneOf(o.security, WIFI_SECURITY, 'WPA'), hidden: bool(o.hidden) }
    case 'vcard':
      return {
        firstName: str(o.firstName), lastName: str(o.lastName), phone: str(o.phone), email: str(o.email),
        company: str(o.company), jobTitle: str(o.jobTitle), website: str(o.website),
      }
    case 'email':
      return { to: str(o.to), subject: str(o.subject), body: str(o.body) }
    case 'sms':
      return { number: str(o.number), message: str(o.message) }
    case 'tel':
      return { number: str(o.number) }
    case 'geo':
      return { latitude: str(o.latitude), longitude: str(o.longitude) }
    case 'vevent':
      return {
        summary: str(o.summary), start: str(o.start), end: str(o.end),
        allDay: bool(o.allDay), location: str(o.location), description: str(o.description),
      }
    case 'crypto':
      return { network: oneOf(o.network, CRYPTO_NETWORKS, 'bitcoin'), address: str(o.address), amount: str(o.amount), label: str(o.label) }
    default:
      return ''
  }
}

function sanitizeDesign(raw: unknown): QRDesignConfig {
  const o = asObject(raw)
  return {
    eyeFrameShape: oneOf(o.eyeFrameShape, EYE_FRAME_SHAPES, DEFAULT_DESIGN.eyeFrameShape),
    eyeCenterShape: oneOf(o.eyeCenterShape, EYE_CENTER_SHAPES, DEFAULT_DESIGN.eyeCenterShape),
    eyeFrameColor: hexOrNull(o.eyeFrameColor),
    eyeCenterColor: hexOrNull(o.eyeCenterColor),
    pixelPattern: oneOf(o.pixelPattern, PIXEL_PATTERNS, DEFAULT_DESIGN.pixelPattern),
  }
}

function sanitizeFrame(raw: unknown): QRFrameConfig {
  const o = asObject(raw)
  return {
    style: oneOf(o.style, FRAME_STYLES, DEFAULT_FRAME.style),
    text: str(o.text, DEFAULT_FRAME.text, FRAME_TEXT_MAX),
    color: hex(o.color, DEFAULT_FRAME.color),
    position: oneOf(o.position, FRAME_POSITIONS, DEFAULT_FRAME.position),
  }
}

// --- encode / decode ---

interface SharePayload {
  v: number
  m: QRContentMode
  d: ShareContentData
  e: QRErrorCorrectionLevel
  f: string
  b: string
  g: QRDesignConfig
  r: QRFrameConfig
}

/** Encodes a config into the opaque `#c=` token (no leading `#c=`). */
export function encodeShareConfig(input: ShareConfigInput): string {
  const payload: SharePayload = {
    v: SCHEMA_VERSION,
    m: input.mode,
    d: input.content,
    e: input.ecLevel,
    f: input.fgColor,
    b: input.bgColor,
    g: input.design,
    r: input.frame,
  }
  return bytesToBase64Url(new TextEncoder().encode(JSON.stringify(payload)))
}

/** Decodes and fully sanitizes a token. Returns null for anything malformed or hostile. */
export function decodeShareConfig(token: string): DecodedShareConfig | null {
  if (!token) return null
  let parsed: unknown
  try {
    parsed = JSON.parse(new TextDecoder().decode(base64UrlToBytes(token)))
  } catch {
    return null
  }
  const p = asObject(parsed)
  if (p.v !== SCHEMA_VERSION) return null
  if (!SHARE_CONTENT_MODES.includes(p.m as QRContentMode)) return null
  const mode = p.m as QRContentMode
  return {
    mode,
    content: sanitizeContent(mode, p.d),
    appearance: {
      ecLevel: oneOf(p.e, EC_LEVELS, 'M'),
      fgColor: hex(p.f, '#000000'),
      bgColor: hex(p.b, '#ffffff'),
    },
    design: sanitizeDesign(p.g),
    frame: sanitizeFrame(p.r),
  }
}

/** Builds the full shareable URL. `base` defaults to the current page sans hash. */
export function buildShareUrl(input: ShareConfigInput, base?: string): string {
  const origin = base ?? `${window.location.origin}${window.location.pathname}${window.location.search}`
  return `${origin}#${HASH_PARAM}=${encodeShareConfig(input)}`
}

/** Reads `#c=` out of a raw hash string (`#c=...` or `c=...`). */
function readToken(hash: string): string | null {
  const cleaned = hash.startsWith('#') ? hash.slice(1) : hash
  const params = new URLSearchParams(cleaned)
  return params.get(HASH_PARAM)
}

// Appearance (EC / fg / bg) is not localStorage-backed, so it is cached here at
// startup and read directly by useQRGenerator's initial state.
let hydratedAppearance: ShareAppearance | null = null

/** The appearance seeded from a shared link this session, or null. */
export function getHydratedAppearance(): ShareAppearance | null {
  return hydratedAppearance
}

/**
 * Run once before render. If the URL carries a valid `#c=` config, write the active
 * mode's draft, content-mode, design, and frame into their existing localStorage keys
 * (other modes' drafts are left untouched), cache the appearance, then strip the hash.
 * The existing per-hook restore paths then pick everything up with no hook changes.
 */
export function hydrateShareConfig(
  storage: Pick<Storage, 'setItem'> = window.localStorage,
  hash: string = window.location.hash,
): DecodedShareConfig | null {
  const token = readToken(hash)
  if (token === null) return null

  const decoded = decodeShareConfig(token)
  if (decoded) {
    try {
      storage.setItem(STORAGE_KEYS.contentMode, decoded.mode)
      if (decoded.mode === 'text') {
        storage.setItem(STORAGE_KEYS.text, decoded.content as string)
      } else {
        storage.setItem(STORAGE_KEYS[decoded.mode], JSON.stringify(decoded.content))
      }
      storage.setItem(STORAGE_KEYS.design, JSON.stringify(decoded.design))
      storage.setItem(STORAGE_KEYS.frame, JSON.stringify(decoded.frame))
      hydratedAppearance = decoded.appearance
    } catch {
      // localStorage unavailable — appearance still applies; drafts fall back to default.
      hydratedAppearance = decoded.appearance
    }
  }

  // Strip our param whether or not it decoded, so a broken link doesn't linger.
  stripHash()
  return decoded
}

function stripHash(): void {
  try {
    const { history, location } = window
    if (history?.replaceState) {
      history.replaceState(null, '', `${location.pathname}${location.search}`)
    }
  } catch {
    // No history API (e.g. some test envs) — leaving the hash is harmless.
  }
}
