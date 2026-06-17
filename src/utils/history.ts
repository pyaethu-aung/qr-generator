import type { QRErrorCorrectionLevel } from '../types/qr'

export interface HistoryEntry {
  id: string
  savedAt: number
  label: string
  value: string
  thumbnailDataUrl: string
  fgColor: string
  bgColor: string
  ecLevel: QRErrorCorrectionLevel
}

const HISTORY_KEY = 'qr-generator:history'
export const HISTORY_MAX_ENTRIES = 8
const LABEL_MAX = 40
const HEX_RE = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/
const EC_LEVELS: readonly QRErrorCorrectionLevel[] = ['L', 'M', 'Q', 'H']

function makeLabel(value: string): string {
  const trimmed = value.trim()
  return trimmed.length > LABEL_MAX ? `${trimmed.slice(0, LABEL_MAX)}…` : trimmed
}

function isValidEntry(e: unknown): e is HistoryEntry {
  if (!e || typeof e !== 'object') return false
  const entry = e as Partial<HistoryEntry>
  return (
    typeof entry.id === 'string' &&
    typeof entry.savedAt === 'number' &&
    typeof entry.label === 'string' &&
    typeof entry.value === 'string' && entry.value.length > 0 &&
    typeof entry.thumbnailDataUrl === 'string' && entry.thumbnailDataUrl.startsWith('data:') &&
    typeof entry.fgColor === 'string' && HEX_RE.test(entry.fgColor) &&
    typeof entry.bgColor === 'string' && HEX_RE.test(entry.bgColor) &&
    EC_LEVELS.includes(entry.ecLevel as QRErrorCorrectionLevel)
  )
}

export function loadHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(isValidEntry)
  } catch {
    return []
  }
}

export type NewHistoryEntry = Omit<HistoryEntry, 'id' | 'savedAt' | 'label'>

export function saveHistoryEntry(entry: NewHistoryEntry): HistoryEntry[] {
  const newEntry: HistoryEntry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    savedAt: Date.now(),
    label: makeLabel(entry.value),
    ...entry,
  }
  const existing = loadHistory()
  const deduped = existing.filter(e => e.value !== entry.value)
  const updated = [newEntry, ...deduped].slice(0, HISTORY_MAX_ENTRIES)
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated))
  } catch {
    // Ignore if localStorage is unavailable
  }
  return updated
}

export function clearHistory(): void {
  try {
    localStorage.removeItem(HISTORY_KEY)
  } catch {
    // Ignore if localStorage is unavailable
  }
}
