import { useCallback, useMemo, useState, useEffect, useRef } from 'react'
import type { QRDesignConfig, QRErrorCorrectionLevel, QRFrameConfig } from '../types/qr'
import { DEFAULT_QR_CONFIG, QR_SIZE_DOWNLOAD } from '../data/defaults'
import { downloadBlob } from '../utils/download'
import { composeQrSvg } from '../utils/qrSvgComposer'
import { exportSvg } from '../utils/export/svgExporter'
import { compositeLogoOnCanvas } from '../utils/logoCompositor'

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

  const [inputEcLevel, setInputEcLevel] = useState<QRErrorCorrectionLevel>(
    DEFAULT_QR_CONFIG.ecLevel,
  )
  const [inputFgColor, setInputFgColor] = useState<string>(DEFAULT_QR_CONFIG.fgColor)
  const [inputBgColor, setInputBgColor] = useState<string>(DEFAULT_QR_CONFIG.bgColor)
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
      const { body, viewBox, logoCenter, logoBase } = composeQrSvg({
        value: effectiveInput,
        ecLevel: inputEcLevel,
        fgColor: inputFgColor,
        bgColor: inputBgColor,
        design: designConfig,
        frame: frameConfig,
      })
      const svgString = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${viewBox} ${viewBox}" width="${QR_SIZE_DOWNLOAD}" height="${QR_SIZE_DOWNLOAD}">${body}</svg>`

      const canvas = document.createElement('canvas')
      canvas.width = QR_SIZE_DOWNLOAD
      canvas.height = QR_SIZE_DOWNLOAD
      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('Could not get canvas context')

      await new Promise<void>((resolve, reject) => {
        const img = new Image()
        img.onload = () => {
          ctx.drawImage(img, 0, 0, QR_SIZE_DOWNLOAD, QR_SIZE_DOWNLOAD)
          resolve()
        }
        img.onerror = reject
        img.src = 'data:image/svg+xml;utf8,' + encodeURIComponent(svgString)
      })

      if (logoDataUrl) {
        const scale = QR_SIZE_DOWNLOAD / viewBox
        await compositeLogoOnCanvas(ctx, logoDataUrl, logoSize, QR_SIZE_DOWNLOAD, {
          centerX: logoCenter.x * scale,
          centerY: logoCenter.y * scale,
          baseSize: logoBase * scale,
        })
      }

      const blob = await new Promise<Blob>((resolve, reject) =>
        canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob failed'))), 'image/png'),
      )

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
