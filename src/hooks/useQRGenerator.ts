import { useCallback, useMemo, useState } from 'react'
import QRCode from 'qrcode'
import type { QRConfig, QRErrorCorrectionLevel } from '../types/qr'
import { DEFAULT_QR_CONFIG, QR_SIZE_DOWNLOAD } from '../data/defaults'
import { downloadBlob } from '../utils/download'

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
  downloadPng: () => Promise<void>
  downloadSvg: () => Promise<void>
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

  const downloadPng = useCallback(async () => {
    if (!config.value) return

    const downloadConfig = {
      value: config.value,
      ecLevel: inputEcLevel,
      fgColor: inputFgColor,
      bgColor: inputBgColor,
    }

    try {
      // Generate the Data URL using the 'qrcode' library (headless)
      // This doesn't rely on the rendered DOM component
      const dataUrl = await QRCode.toDataURL(downloadConfig.value, {
        errorCorrectionLevel: downloadConfig.ecLevel,
        color: {
          dark: downloadConfig.fgColor,
          light: downloadConfig.bgColor,
        },
        width: QR_SIZE_DOWNLOAD,
        margin: 1,
      })

      // Convert Data URL to Blob
      const res = await fetch(dataUrl)
      const blob = await res.blob()

      downloadBlob(blob, `qr-code-${Date.now()}.png`)
    } catch (err) {
      console.error('Failed to generate PNG', err)
    }
  }, [config.value, inputEcLevel, inputFgColor, inputBgColor])

  const downloadSvg = useCallback(async () => {
    if (!config.value) return

    const downloadConfig = {
      value: config.value,
      ecLevel: inputEcLevel,
      fgColor: inputFgColor,
      bgColor: inputBgColor,
    }

    try {
      // Generate SVG string using 'qrcode' library
      // eslint-disable-next-line @typescript-eslint/no-base-to-string
      const svgString = await QRCode.toString(downloadConfig.value, {
        type: 'svg',
        errorCorrectionLevel: downloadConfig.ecLevel,
        color: {
          dark: downloadConfig.fgColor,
          light: downloadConfig.bgColor,
        },
        width: QR_SIZE_DOWNLOAD,
        margin: 1,
      })

      const blob = new Blob([svgString], { type: 'image/svg+xml' })
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
