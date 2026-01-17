import { useState, useCallback } from 'react'
import type { QRConfig } from '../types/qr'
import { DEFAULT_QR_CONFIG } from '../data/defaults'

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

  return {
    config,
    inputValue,
    setInputValue,
    generateQRCode,
    isGenerating,
  }
}
