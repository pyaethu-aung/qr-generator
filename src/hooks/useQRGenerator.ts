import { useState, useCallback } from 'react'
import QRCode from 'qrcode'
import type { QRConfig } from '../types/qr'
import { DEFAULT_QR_CONFIG, QR_SIZE_DOWNLOAD } from '../data/defaults'
import { downloadBlob } from '../utils/download'

export const useQRGenerator = () => {
  // config holds the current configuration for the displayed QR code
  const [config, setConfig] = useState<QRConfig>(DEFAULT_QR_CONFIG)

  // inputValue holds the text in the input field, which might not be generated yet
  const [inputValue, setInputValue] = useState<string>('')

  const [isGenerating, setIsGenerating] = useState<boolean>(false)

  const generateQRCode = useCallback(() => {
    setIsGenerating(true)

    // Simulate a small delay for better UX (optional, but good for "feeling" of work)
    // or just set it immediately. Since it's client-side, it's instant.
    // We'll set it immediately for MVP performance goals.

    setConfig((prev) => ({
      ...prev,
      value: inputValue,
    }))

    setIsGenerating(false)
  }, [inputValue])

  const downloadPng = useCallback(async () => {
    if (!config.value) return

    try {
      // Generate the Data URL using the 'qrcode' library (headless)
      // This doesn't rely on the rendered DOM component
      const dataUrl = await QRCode.toDataURL(config.value, {
        errorCorrectionLevel: config.ecLevel,
        color: {
          dark: config.fgColor,
          light: config.bgColor,
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
  }, [config])

  const downloadSvg = useCallback(async () => {
    if (!config.value) return

    try {
      // Generate SVG string using 'qrcode' library
      const svgString = await QRCode.toString(config.value, {
        type: 'svg',
        errorCorrectionLevel: config.ecLevel,
        color: {
          dark: config.fgColor,
          light: config.bgColor,
        },
        width: QR_SIZE_DOWNLOAD,
        margin: 1,
      })

      const blob = new Blob([svgString], { type: 'image/svg+xml' })
      downloadBlob(blob, `qr-code-${Date.now()}.svg`)
    } catch (err) {
      console.error('Failed to generate SVG', err)
    }
  }, [config])

  return {
    config,
    inputValue,
    setInputValue,
    generateQRCode,
    isGenerating,
    downloadPng,
    downloadSvg,
  }
}
