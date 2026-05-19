import { useCallback, useMemo, useState } from 'react'
import type { QRConfig, QRDesignConfig, QRErrorCorrectionLevel } from '../types/qr'
import { DEFAULT_QR_CONFIG, QR_SIZE_DOWNLOAD } from '../data/defaults'
import { downloadBlob } from '../utils/download'
import { generateQRPaths } from '../utils/qrShapeRenderer'
import { exportSvg } from '../utils/export/svgExporter'

export const INPUT_LENGTH_LIMIT = 2000

export interface UseQRGeneratorReturn {
  config: QRConfig
  inputValue: string
  setInputValue: (value: string) => void
  inputEcLevel: QRErrorCorrectionLevel
  setInputEcLevel: (level: QRErrorCorrectionLevel) => void
  inputFgColor: string
  setInputFgColor: (color: string) => void
  inputBgColor: string
  setInputBgColor: (color: string) => void
  generateQRCode: () => void
  isGenerating: boolean
  downloadPng: (designConfig: QRDesignConfig) => Promise<void>
  downloadSvg: (designConfig: QRDesignConfig) => Promise<void>
  inputError?: string
  canGenerate: boolean
}

export const useQRGenerator = (): UseQRGeneratorReturn => {
  // config holds the current configuration for the displayed QR code
  const [config, setConfig] = useState<QRConfig>(DEFAULT_QR_CONFIG)

  // inputValue holds the text in the input field
  const [inputValue, setInputValueState] = useState<string>('')
  const [inputError, setInputError] = useState<string | undefined>()

  // Input states for customization (not applied until Generate is clicked)
  const [inputEcLevel, setInputEcLevel] = useState<QRErrorCorrectionLevel>(
    DEFAULT_QR_CONFIG.ecLevel,
  )
  const [inputFgColor, setInputFgColor] = useState<string>(DEFAULT_QR_CONFIG.fgColor)
  const [inputBgColor, setInputBgColor] = useState<string>(DEFAULT_QR_CONFIG.bgColor)

  const [isGenerating, setIsGenerating] = useState<boolean>(false)

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

  const canGenerate = useMemo(
    () => Boolean(inputValue.trim()) && !inputError,
    [inputError, inputValue],
  )

  const generateQRCode = useCallback(() => {
    if (!inputValue.trim()) {
      setInputError(undefined)
      return
    }

    const validationError = getValidationError(inputValue)
    if (validationError) {
      setInputError(validationError)
      return
    }

    setInputError(undefined)
    setIsGenerating(true)

    setConfig((prev) => ({
      ...prev,
      value: inputValue,
      ecLevel: inputEcLevel,
      fgColor: inputFgColor,
      bgColor: inputBgColor,
    }))

    setIsGenerating(false)
  }, [getValidationError, inputBgColor, inputEcLevel, inputFgColor, inputValue])

  const downloadPng = useCallback(async (designConfig: QRDesignConfig) => {
    if (!config.value) return

    try {
      const { dataPath, eyesPath, eyeBgPath, size: matrixSize } = generateQRPaths(
        config.value,
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

      const blob = await new Promise<Blob>((resolve, reject) =>
        canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob failed'))), 'image/png'),
      )

      downloadBlob(blob, `qr-code-${Date.now()}.png`)
    } catch (err) {
      console.error('Failed to generate PNG', err)
    }
  }, [config.value, inputEcLevel, inputFgColor, inputBgColor])

  const downloadSvg = useCallback(async (designConfig: QRDesignConfig) => {
    if (!config.value) return

    try {
      const blob = await exportSvg(config.value, {
        value: config.value,
        ecLevel: inputEcLevel,
        fgColor: inputFgColor,
        bgColor: inputBgColor,
        designConfig,
      })
      downloadBlob(blob, `qr-code-${Date.now()}.svg`)
    } catch (err) {
      console.error('Failed to generate SVG', err)
    }
  }, [config.value, inputEcLevel, inputFgColor, inputBgColor])

  return {
    config,
    inputValue,
    setInputValue,
    inputEcLevel,
    setInputEcLevel,
    inputFgColor,
    setInputFgColor,
    inputBgColor,
    setInputBgColor,
    generateQRCode,
    isGenerating,
    downloadPng,
    downloadSvg,
    inputError,
    canGenerate,
  }
}
