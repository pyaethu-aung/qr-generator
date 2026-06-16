import { useCallback, useMemo, useState, useEffect, useRef } from 'react'
import type { QRDesignConfig, QRErrorCorrectionLevel, QRFrameConfig } from '../types/qr'
import { downloadBlob } from '../utils/download'
import { exportSvg } from '../utils/export/svgExporter'
import { renderQrPngBlob } from '../utils/export/pngRenderer'
import { getHydratedAppearance } from '../utils/shareConfig'
import { loadPersistedAppearance, persistAppearance } from '../utils/persistedAppearance'

export const INPUT_LENGTH_LIMIT = 2000

const TEXT_DRAFT_KEY = 'qr-generator:draft:text'

function loadTextDraft(): string {
  try {
    return localStorage.getItem(TEXT_DRAFT_KEY) ?? ''
  } catch {
    return ''
  }
}

function getValidationErrorStatic(value: string): string | undefined {
  if (value.length > INPUT_LENGTH_LIMIT) {
    return `Input too long (max ${INPUT_LENGTH_LIMIT} characters)`
  }
  return undefined
}

export interface UseQRGeneratorReturn {
  liveValue: string
  inputValue: string
  setInputValue: (value: string) => void
  inputEcLevel: QRErrorCorrectionLevel
  setInputEcLevel: (level: QRErrorCorrectionLevel) => void
  inputFgColor: string
  setInputFgColor: (color: string) => void
  inputBgColor: string
  setInputBgColor: (color: string) => void
  downloadPng: (designConfig: QRDesignConfig, frameConfig?: QRFrameConfig, logoDataUrl?: string | null, logoSize?: number) => Promise<void>
  downloadSvg: (designConfig: QRDesignConfig, frameConfig?: QRFrameConfig, logoDataUrl?: string | null, logoSize?: number) => Promise<void>
  inputError?: string
  canDownload: boolean
  recentDownload: 'png' | 'svg' | null
  isPending: boolean
}

export const useQRGenerator = (externalValue?: string): UseQRGeneratorReturn => {
  const [inputValue, setInputValueState] = useState<string>(loadTextDraft)
  const [inputError, setInputError] = useState<string | undefined>(() =>
    getValidationErrorStatic(inputValue),
  )
  const [liveValue, setLiveValue] = useState<string>('')

  // Initial appearance precedence: a shared `#c=` link wins, then the last-persisted
  // appearance, then defaults. Persisting fg/bg/EC lets the Batch tab inherit the look.
  const sharedAppearance = getHydratedAppearance()
  const persistedAppearance = loadPersistedAppearance()
  const [inputEcLevel, setInputEcLevel] = useState<QRErrorCorrectionLevel>(
    sharedAppearance?.ecLevel ?? persistedAppearance.ecLevel,
  )
  const [inputFgColor, setInputFgColor] = useState<string>(sharedAppearance?.fgColor ?? persistedAppearance.fgColor)
  const [inputBgColor, setInputBgColor] = useState<string>(sharedAppearance?.bgColor ?? persistedAppearance.bgColor)
  const [recentDownload, setRecentDownload] = useState<'png' | 'svg' | null>(null)
  const downloadTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // When externalValue is set (wifi mode), it overrides the text input value
  const effectiveInput = externalValue !== undefined ? externalValue : inputValue
  const effectiveError = externalValue !== undefined ? undefined : inputError

  useEffect(() => {
    return () => {
      if (downloadTimerRef.current) clearTimeout(downloadTimerRef.current)
    }
  }, [])

  const setInputValue = useCallback((value: string) => {
    setInputValueState(value)
    setInputError(getValidationErrorStatic(value))
  }, [])

  // Persist the text draft so a refresh or tab discard doesn't lose it.
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(TEXT_DRAFT_KEY, inputValue)
      } catch {
        // Ignore if localStorage is unavailable
      }
    }, 400)
    return () => clearTimeout(timer)
  }, [inputValue])

  // Persist the appearance triple (debounced) so the Batch tab inherits the current look.
  useEffect(() => {
    const timer = setTimeout(() => {
      persistAppearance({ fgColor: inputFgColor, bgColor: inputBgColor, ecLevel: inputEcLevel })
    }, 400)
    return () => clearTimeout(timer)
  }, [inputFgColor, inputBgColor, inputEcLevel])

  // Debounce the text field — 300 ms for valid input, 0 ms to clear on invalid/empty
  useEffect(() => {
    const effective = effectiveInput.trim() && !effectiveError ? effectiveInput : ''
    const delay = effective ? 300 : 0
    const timer = setTimeout(() => setLiveValue(effective), delay)
    return () => clearTimeout(timer)
  }, [effectiveInput, effectiveError])

  const canDownload = useMemo(
    () => Boolean(effectiveInput.trim()) && !effectiveError,
    [effectiveError, effectiveInput],
  )

  const isPending = Boolean(effectiveInput.trim()) && !effectiveError && liveValue !== effectiveInput.trim()

  const downloadPng = useCallback(async (
    designConfig: QRDesignConfig,
    frameConfig?: QRFrameConfig,
    logoDataUrl?: string | null,
    logoSize = 20,
  ) => {
    if (!effectiveInput.trim()) return

    try {
      const blob = await renderQrPngBlob(effectiveInput, {
        ecLevel: inputEcLevel,
        fgColor: inputFgColor,
        bgColor: inputBgColor,
        designConfig,
        frameConfig,
        logoDataUrl,
        logoSize,
      })

      downloadBlob(blob, `qr-code-${Date.now()}.png`)
      if (downloadTimerRef.current) clearTimeout(downloadTimerRef.current)
      setRecentDownload('png')
      downloadTimerRef.current = setTimeout(() => setRecentDownload(null), 1500)
    } catch (err) {
      console.error('Failed to generate PNG', err)
    }
  }, [effectiveInput, inputEcLevel, inputFgColor, inputBgColor])

  const downloadSvg = useCallback(async (
    designConfig: QRDesignConfig,
    frameConfig?: QRFrameConfig,
    logoDataUrl?: string | null,
    logoSize = 20,
  ) => {
    if (!effectiveInput.trim()) return

    try {
      const blob = await exportSvg(effectiveInput, {
        value: effectiveInput,
        ecLevel: inputEcLevel,
        fgColor: inputFgColor,
        bgColor: inputBgColor,
        designConfig,
        frameConfig,
        logoDataUrl,
        logoSize,
      })
      downloadBlob(blob, `qr-code-${Date.now()}.svg`)
      if (downloadTimerRef.current) clearTimeout(downloadTimerRef.current)
      setRecentDownload('svg')
      downloadTimerRef.current = setTimeout(() => setRecentDownload(null), 1500)
    } catch (err) {
      console.error('Failed to generate SVG', err)
    }
  }, [effectiveInput, inputEcLevel, inputFgColor, inputBgColor])

  return {
    liveValue,
    inputValue,
    setInputValue,
    inputEcLevel,
    setInputEcLevel,
    inputFgColor,
    setInputFgColor,
    inputBgColor,
    setInputBgColor,
    downloadPng,
    downloadSvg,
    inputError,
    canDownload,
    isPending,
    recentDownload,
  }
}
