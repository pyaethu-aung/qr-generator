import { useCallback, useMemo, useState, useEffect, useRef } from 'react'
import type { QRDesignConfig, QRErrorCorrectionLevel } from '../types/qr'
import { DEFAULT_QR_CONFIG, QR_SIZE_DOWNLOAD } from '../data/defaults'
import { downloadBlob } from '../utils/download'
import { generateQRPaths } from '../utils/qrShapeRenderer'
import { exportSvg } from '../utils/export/svgExporter'
import { compositeLogoOnCanvas } from '../utils/logoCompositor'

export const INPUT_LENGTH_LIMIT = 2000

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
  downloadPng: (designConfig: QRDesignConfig, logoDataUrl?: string | null, logoSize?: number) => Promise<void>
  downloadSvg: (designConfig: QRDesignConfig, logoDataUrl?: string | null, logoSize?: number) => Promise<void>
  inputError?: string
  canDownload: boolean
  recentDownload: 'png' | 'svg' | null
}

export const useQRGenerator = (): UseQRGeneratorReturn => {
  const [inputValue, setInputValueState] = useState<string>('')
  const [inputError, setInputError] = useState<string | undefined>()
  const [liveValue, setLiveValue] = useState<string>('')

  const [inputEcLevel, setInputEcLevel] = useState<QRErrorCorrectionLevel>(
    DEFAULT_QR_CONFIG.ecLevel,
  )
  const [inputFgColor, setInputFgColor] = useState<string>(DEFAULT_QR_CONFIG.fgColor)
  const [inputBgColor, setInputBgColor] = useState<string>(DEFAULT_QR_CONFIG.bgColor)
  const [recentDownload, setRecentDownload] = useState<'png' | 'svg' | null>(null)
  const downloadTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (downloadTimerRef.current) clearTimeout(downloadTimerRef.current)
    }
  }, [])

  const getValidationError = useCallback((value: string) => {
    if (value.length > INPUT_LENGTH_LIMIT) {
      return `Input too long (max ${INPUT_LENGTH_LIMIT} characters)`
    }
    return undefined
  }, [])

  const setInputValue = useCallback(
    (value: string) => {
      setInputValueState(value)
      setInputError(getValidationError(value))
    },
    [getValidationError],
  )

  // Debounce the text field — 300 ms for valid input, 0 ms to clear on invalid/empty
  useEffect(() => {
    const effective = inputValue.trim() && !inputError ? inputValue : ''
    const delay = effective ? 300 : 0
    const timer = setTimeout(() => setLiveValue(effective), delay)
    return () => clearTimeout(timer)
  }, [inputValue, inputError])

  const canDownload = useMemo(
    () => Boolean(inputValue.trim()) && !inputError,
    [inputError, inputValue],
  )

  const downloadPng = useCallback(async (
    designConfig: QRDesignConfig,
    logoDataUrl?: string | null,
    logoSize = 20,
  ) => {
    if (!inputValue.trim()) return

    try {
      const { dataPath, eyesPath, eyeBgPath, size: matrixSize } = generateQRPaths(
        inputValue,
        inputEcLevel,
        designConfig.eyeShape,
        designConfig.pixelPattern,
      )
      const viewBoxSize = matrixSize * 10
      const dataShapeRendering = designConfig.pixelPattern === 'Dots' ? 'geometricPrecision' : 'crispEdges'
      const svgString = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${viewBoxSize} ${viewBoxSize}" width="${QR_SIZE_DOWNLOAD}" height="${QR_SIZE_DOWNLOAD}">
        <rect width="100%" height="100%" fill="${inputBgColor}" />
        <path d="${dataPath}" fill="${inputFgColor}" shape-rendering="${dataShapeRendering}" />
        <path d="${eyeBgPath}" fill="${inputBgColor}" />
        <path d="${eyesPath}" fill="${inputFgColor}" fill-rule="evenodd" />
      </svg>`

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
        await compositeLogoOnCanvas(ctx, logoDataUrl, logoSize, QR_SIZE_DOWNLOAD)
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
  }, [inputValue, inputEcLevel, inputFgColor, inputBgColor])

  const downloadSvg = useCallback(async (
    designConfig: QRDesignConfig,
    logoDataUrl?: string | null,
    logoSize = 20,
  ) => {
    if (!inputValue.trim()) return

    try {
      const blob = await exportSvg(inputValue, {
        value: inputValue,
        ecLevel: inputEcLevel,
        fgColor: inputFgColor,
        bgColor: inputBgColor,
        designConfig,
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
  }, [inputValue, inputEcLevel, inputFgColor, inputBgColor])

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
    recentDownload,
  }
}
