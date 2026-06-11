import { useState, useMemo } from 'react'
import type { VEventConfig } from '../types/qr'
import { buildVEventString, toAllDayValue, toTimedValue } from '../utils/vevent'

const DEFAULT_VEVENT_CONFIG: VEventConfig = {
  summary: '',
  start: '',
  end: '',
  allDay: false,
  location: '',
  description: '',
}

export interface UseVEventConfigReturn {
  veventConfig: VEventConfig
  veventString: string
  setSummary: (v: string) => void
  setStart: (v: string) => void
  setEnd: (v: string) => void
  setAllDay: (v: boolean) => void
  setLocation: (v: string) => void
  setDescription: (v: string) => void
}

export function useVEventConfig(): UseVEventConfigReturn {
  const [veventConfig, setVEventConfig] = useState<VEventConfig>(DEFAULT_VEVENT_CONFIG)

  const setSummary = (summary: string) => setVEventConfig((prev) => ({ ...prev, summary }))
  const setStart = (start: string) => setVEventConfig((prev) => ({ ...prev, start }))
  const setEnd = (end: string) => setVEventConfig((prev) => ({ ...prev, end }))
  const setLocation = (location: string) => setVEventConfig((prev) => ({ ...prev, location }))
  const setDescription = (description: string) =>
    setVEventConfig((prev) => ({ ...prev, description }))

  // Toggling all-day converts the date values in place so the chosen day survives
  // the format switch instead of the inputs blanking out (see toAllDayValue/toTimedValue).
  const setAllDay = (allDay: boolean) =>
    setVEventConfig((prev) =>
      allDay
        ? { ...prev, allDay, start: toAllDayValue(prev.start), end: toAllDayValue(prev.end) }
        : {
            ...prev,
            allDay,
            start: toTimedValue(prev.start, '09:00'),
            end: toTimedValue(prev.end, '10:00'),
          },
    )

  const veventString = useMemo(() => buildVEventString(veventConfig), [veventConfig])

  return {
    veventConfig,
    veventString,
    setSummary,
    setStart,
    setEnd,
    setAllDay,
    setLocation,
    setDescription,
  }
}
