import { useCallback, useMemo, useState, useEffect, useRef } from 'react'
import type { QRDesignConfig, QRErrorCorrectionLevel, QRFrameConfig } from '../types/qr'
import { downloadBlob } from '../utils/download'
import { exportSvg } from '../utils/export/svgExporter'
import { renderQrPngBlob } from '../utils/export/pngRenderer'
import { getHydratedAppearance } from '../utils/shareConfig'
import { loadPersistedAppearance, persistAppearance } from '../utils/persistedAppearance'
import { getCapacityStatus } from '../utils/qrCapacity'

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
  inputTransparentBg: boolean
  setInputTransparentBg: (v: boolean) => void
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
  const [inputTransparentBg, setInputTransparentBg] = useState<boolean>(persistedAppearance.transparentBg)
  const [recentDownload, setRecentDownload] = useState<'png' | 'svg' | null>(null)
  const downloadTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // When externalValue is set (wifi mode), it overrides the text input value
  const effectiveInput = externalValue !== undefined ? externalValue : inputValue
  const effectiveError = externalValue !== undefined ? undefined : inputError

  // Content past the QR capacity for the active level cannot be encoded — qrcode.create
  // throws on it. Treat it like a validation failure so the preview clears to its
  // placeholder and downloads disable, instead of the generator crashing. The capacity
  // counter under the field is what tells the user the count is over the limit.
  const isOverCapacity = useMemo(
    () => getCapacityStatus(effectiveInput, inputEcLevel).isOverLimit,
    [effectiveInput, inputEcLevel],
  )
  const isBlocked = Boolean(effectiveError) || isOverCapacity

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
      persistAppearance({ fgColor: inputFgColor, bgColor: inputBgColor, ecLevel: inputEcLevel, transparentBg: inputTransparentBg })
    }, 400)
    return () => clearTimeout(timer)
  }, [inputFgColor, inputBgColor, inputEcLevel, inputTransparentBg])

  // Debounce the text field — 300 ms for valid input, 0 ms to clear on invalid/empty
  useEffect(() => {
    const effective = effectiveInput.trim() && !isBlocked ? effectiveInput : ''
    const delay = effective ? 300 : 0
    const timer = setTimeout(() => setLiveValue(effective), delay)
    return () => clearTimeout(timer)
  }, [effectiveInput, isBlocked])

  const canDownload = useMemo(
    () => Boolean(effectiveInput.trim()) && !isBlocked,
    [isBlocked, effectiveInput],
  )

  const isPending = Boolean(effectiveInput.trim()) && !isBlocked && liveValue !== effectiveInput.trim()

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
        transparentBg: inputTransparentBg,
      })

      downloadBlob(blob, `qr-code-${Date.now()}.png`)
      if (downloadTimerRef.current) clearTimeout(downloadTimerRef.current)
      setRecentDownload('png')
      downloadTimerRef.current = setTimeout(() => setRecentDownload(null), 1500)
    } catch (err) {
      console.error('Failed to generate PNG', err)
    }
  }, [effectiveInput, inputEcLevel, inputFgColor, inputBgColor, inputTransparentBg])

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
        transparentBg: inputTransparentBg,
      })
      downloadBlob(blob, `qr-code-${Date.now()}.svg`)
      if (downloadTimerRef.current) clearTimeout(downloadTimerRef.current)
      setRecentDownload('svg')
      downloadTimerRef.current = setTimeout(() => setRecentDownload(null), 1500)
    } catch (err) {
      console.error('Failed to generate SVG', err)
    }
  }, [effectiveInput, inputEcLevel, inputFgColor, inputBgColor, inputTransparentBg])

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
    inputTransparentBg,
    setInputTransparentBg,
    downloadPng,
    downloadSvg,
    inputError,
    canDownload,
    isPending,
    recentDownload,
  }
}
