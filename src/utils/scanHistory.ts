import type { DecodedContentType } from './qrClassify'

/**
 * One decoded QR code remembered from the Scan view. Mirrors the generate-side
 * {@link import('./history').HistoryEntry} but holds no thumbnail or design: a scan only ever
 * yields a string, so an entry carries the decoded `value`, its classified `type` (for the
 * badge), and the usual id/savedAt/label bookkeeping.
 */
export interface ScanHistoryEntry {
  id: string
  savedAt: number
  label: string
  value: string
  type: DecodedContentType
}

const SCAN_HISTORY_KEY = 'qr-generator:scan-history'
export const SCAN_HISTORY_MAX_ENTRIES = 8
const LABEL_MAX = 40
const CONTENT_TYPES: readonly DecodedContentType[] = [
  'url',
  'wifi',
  'vcard',
  'email',
  'sms',
  'tel',
  'geo',
  'vevent',
  'crypto',
  'text',
]

function makeLabel(value: string): string {
  const trimmed = value.trim()
  return trimmed.length > LABEL_MAX ? `${trimmed.slice(0, LABEL_MAX)}…` : trimmed
}

function isValidEntry(e: unknown): e is ScanHistoryEntry {
  if (!e || typeof e !== 'object') return false
  const entry = e as Partial<ScanHistoryEntry>
  return (
    typeof entry.id === 'string' &&
    typeof entry.savedAt === 'number' &&
    typeof entry.label === 'string' &&
    typeof entry.value === 'string' && entry.value.length > 0 &&
    CONTENT_TYPES.includes(entry.type as DecodedContentType)
  )
}

export function loadScanHistory(): ScanHistoryEntry[] {
  try {
    const raw = localStorage.getItem(SCAN_HISTORY_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(isValidEntry)
  } catch {
    return []
  }
}

export type NewScanHistoryEntry = Omit<ScanHistoryEntry, 'id' | 'savedAt' | 'label'>

export function saveScanHistoryEntry(entry: NewScanHistoryEntry): ScanHistoryEntry[] {
  const newEntry: ScanHistoryEntry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    savedAt: Date.now(),
    label: makeLabel(entry.value),
    ...entry,
  }
  const existing = loadScanHistory()
  const deduped = existing.filter(e => e.value !== entry.value)
  const updated = [newEntry, ...deduped].slice(0, SCAN_HISTORY_MAX_ENTRIES)
  try {
    localStorage.setItem(SCAN_HISTORY_KEY, JSON.stringify(updated))
  } catch {
    // Ignore if localStorage is unavailable
  }
  return updated
}

export function clearScanHistory(): void {
  try {
    localStorage.removeItem(SCAN_HISTORY_KEY)
  } catch {
    // Ignore if localStorage is unavailable
  }
}
