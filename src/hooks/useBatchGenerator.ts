/**
 * State for the Batch tab: the pasted input, the chosen format, and the run lifecycle
 * (idle → generating → success | error) with per-code progress. On generate it reads the
 * user's current persisted design (appearance + design + frame) so every code matches the
 * single-QR preview, builds one ZIP, and triggers the download.
 */

import { useCallback, useEffect, useMemo, useState } from 'react'
import { downloadBlob } from '../utils/download'
import { parseBatchInput, BATCH_MAX_LINES } from '../utils/batch/parseBatchInput'
import { buildBatchZip, type BatchFormat, type BatchDesign } from '../utils/batch/buildBatchZip'
import { loadPersistedAppearance } from '../utils/persistedAppearance'
import { loadDesignConfig, loadFrameConfig } from '../utils/persistedDesign'

// The tab mounts on demand (so it re-reads the latest design each time it opens), which
// would otherwise drop a long pasted list on a tab switch. Persist the input so it survives.
const BATCH_INPUT_KEY = 'qr-generator:batch:input'

function loadBatchInput(): string {
  try {
    return localStorage.getItem(BATCH_INPUT_KEY) ?? ''
  } catch {
    return ''
  }
}

export type BatchStatus = 'idle' | 'generating' | 'success' | 'error'
export type BatchErrorCode = 'empty' | 'render-failed'

export interface BatchProgress {
  completed: number
  total: number
}

export interface UseBatchGeneratorReturn {
  input: string
  setInput: (value: string) => void
  format: BatchFormat
  setFormat: (format: BatchFormat) => void
  /** Unique, capped values that will be rendered. */
  values: string[]
  /** Unique non-empty line count before the cap. */
  total: number
  /** True when input exceeded the cap and was truncated. */
  truncated: boolean
  status: BatchStatus
  progress: BatchProgress
  errorCode: BatchErrorCode | null
  generate: () => Promise<void>
  maxLines: number
}

export function useBatchGenerator(): UseBatchGeneratorReturn {
  const [input, setInputState] = useState(loadBatchInput)
  const [format, setFormatState] = useState<BatchFormat>('png')
  const [status, setStatus] = useState<BatchStatus>('idle')
  const [progress, setProgress] = useState<BatchProgress>({ completed: 0, total: 0 })
  const [errorCode, setErrorCode] = useState<BatchErrorCode | null>(null)

  const { values, total, truncated } = useMemo(() => parseBatchInput(input), [input])

  // Persist the pasted list (debounced) so switching tabs and back doesn't lose it.
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(BATCH_INPUT_KEY, input)
      } catch {
        // Ignore if localStorage is unavailable
      }
    }, 400)
    return () => clearTimeout(timer)
  }, [input])

  // Editing input or switching format clears a finished run's success/error state.
  const setInput = useCallback((value: string) => {
    setInputState(value)
    setStatus((prev) => (prev === 'generating' ? prev : 'idle'))
    setErrorCode(null)
  }, [])

  const setFormat = useCallback((next: BatchFormat) => {
    setFormatState(next)
    setStatus((prev) => (prev === 'generating' ? prev : 'idle'))
    setErrorCode(null)
  }, [])

  const generate = useCallback(async () => {
    const { values: toRender } = parseBatchInput(input)
    if (toRender.length === 0) {
      setStatus('error')
      setErrorCode('empty')
      return
    }

    setStatus('generating')
    setErrorCode(null)
    setProgress({ completed: 0, total: toRender.length })

    try {
      const appearance = loadPersistedAppearance()
      const design: BatchDesign = {
        ecLevel: appearance.ecLevel,
        fgColor: appearance.fgColor,
        bgColor: appearance.bgColor,
        designConfig: loadDesignConfig(),
        frameConfig: loadFrameConfig(),
      }

      const blob = await buildBatchZip({
        values: toRender,
        format,
        design,
        onProgress: (completed, totalCount) => setProgress({ completed, total: totalCount }),
      })

      const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
      downloadBlob(blob, `qr-batch-${toRender.length}-${stamp}.zip`)
      setStatus('success')
    } catch (err) {
      console.error('Batch generation failed', err)
      setStatus('error')
      setErrorCode('render-failed')
    }
  }, [input, format])

  return {
    input,
    setInput,
    format,
    setFormat,
    values,
    total,
    truncated,
    status,
    progress,
    errorCode,
    generate,
    maxLines: BATCH_MAX_LINES,
  }
}
