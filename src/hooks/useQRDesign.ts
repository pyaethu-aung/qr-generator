import { useState, useEffect, useCallback } from 'react'
import type { QRDesignConfig, QRErrorCorrectionLevel, QREyeShape, QRPixelPattern } from '../types/qr'
import { getMatrixSize } from '../utils/qrShapeRenderer'

const EC_LOGO_MAX: Record<QRErrorCorrectionLevel, number> = { L: 7, M: 15, Q: 25, H: 30 }

const DESIGN_STORAGE_KEY = 'qr-generator-design-config'

const DEFAULT_DESIGN_CONFIG: QRDesignConfig = {
  eyeShape: 'Square',
  pixelPattern: 'Square',
}

export function useQRDesign(value: string = '', ecLevel: 'L' | 'M' | 'Q' | 'H' = 'M') {
  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null)
  const [logoSizeState, setLogoSizeState] = useState(20)

  const maxLogoSize = EC_LOGO_MAX[ecLevel]
  const logoSize = Math.min(logoSizeState, maxLogoSize)

  const setLogoSize = useCallback((size: number) => {
    setLogoSizeState(Math.min(size, EC_LOGO_MAX[ecLevel]))
  }, [ecLevel])

  const [designConfig, setDesignConfig] = useState<QRDesignConfig>(() => {
    try {
      const stored = localStorage.getItem(DESIGN_STORAGE_KEY)
      if (stored) {
        return JSON.parse(stored) as QRDesignConfig
      }
    } catch {
      // Fallback to default if JSON parse fails
    }
    return DEFAULT_DESIGN_CONFIG
  })

  useEffect(() => {
    try {
      localStorage.setItem(DESIGN_STORAGE_KEY, JSON.stringify(designConfig))
    } catch {
      // Ignore if localStorage is unavailable
    }
  }, [designConfig])

  const setEyeShape = useCallback((eyeShape: QREyeShape) => {
    setDesignConfig(prev => ({ ...prev, eyeShape }))
  }, [])

  const setPixelPattern = useCallback((pixelPattern: QRPixelPattern) => {
    setDesignConfig(prev => ({ ...prev, pixelPattern }))
  }, [])

  const matrixSize = getMatrixSize(value, ecLevel)
  const [isWarningDismissed, setIsWarningDismissed] = useState(false)
  const isRiskyPattern = !isWarningDismissed && designConfig.pixelPattern === 'Dots' && matrixSize >= 41

  const dismissWarning = () => setIsWarningDismissed(true)

  // Reset dismissal when pixel pattern changes
  const [prevPattern, setPrevPattern] = useState(designConfig.pixelPattern)
  if (prevPattern !== designConfig.pixelPattern) {
    setIsWarningDismissed(false)
    setPrevPattern(designConfig.pixelPattern)
  }

  return {
    designConfig,
    setDesignConfig,
    setEyeShape,
    setPixelPattern,
    isRiskyPattern,
    dismissWarning,
    logoDataUrl,
    setLogoDataUrl,
    logoSize,
    setLogoSize,
    maxLogoSize,
  }
}
