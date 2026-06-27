import { useState, useCallback } from 'react'
import {
  loadScanHistory,
  saveScanHistoryEntry,
  clearScanHistory,
  type ScanHistoryEntry,
  type NewScanHistoryEntry,
} from '../utils/scanHistory'

export type { ScanHistoryEntry }

export interface UseScanHistoryReturn {
  history: ScanHistoryEntry[]
  addEntry: (entry: NewScanHistoryEntry) => void
  clear: () => void
}

export function useScanHistory(): UseScanHistoryReturn {
  const [history, setHistory] = useState<ScanHistoryEntry[]>(loadScanHistory)

  const addEntry = useCallback((entry: NewScanHistoryEntry) => {
    setHistory(saveScanHistoryEntry(entry))
  }, [])

  const clear = useCallback(() => {
    clearScanHistory()
    setHistory([])
  }, [])

  return { history, addEntry, clear }
}
