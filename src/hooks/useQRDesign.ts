import { useState, useEffect, useCallback } from 'react'
import type { QRDesignConfig, QREyeShape, QRPixelPattern } from '../types/qr'

const DESIGN_STORAGE_KEY = 'qr-generator-design-config'

const DEFAULT_DESIGN_CONFIG: QRDesignConfig = {
  eyeShape: 'Square',
  pixelPattern: 'Square',
}

import { getMatrixSize } from '../utils/qrShapeRenderer'

export function useQRDesign(value: string = '', ecLevel: 'L' | 'M' | 'Q' | 'H' = 'M') {
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

  // Pending states — not applied to preview until commitDesignConfig() is called
  const [inputEyeShape, setInputEyeShape] = useState<QREyeShape>(designConfig.eyeShape)
  const [inputPixelPattern, setInputPixelPattern] = useState<QRPixelPattern>(designConfig.pixelPattern)

  // Persist committed config to local storage
  useEffect(() => {
    try {
      localStorage.setItem(DESIGN_STORAGE_KEY, JSON.stringify(designConfig))
    } catch {
      // Ignore if localStorage is unavailable
    }
  }, [designConfig])

  const setEyeShape = (eyeShape: QREyeShape) => setInputEyeShape(eyeShape)
  const setPixelPattern = (pixelPattern: QRPixelPattern) => setInputPixelPattern(pixelPattern)

  const commitDesignConfig = useCallback(() => {
    setDesignConfig({ eyeShape: inputEyeShape, pixelPattern: inputPixelPattern })
  }, [inputEyeShape, inputPixelPattern])

  // Risky pattern flagging for high density dots — uses pending pattern so warning shows immediately
  const matrixSize = getMatrixSize(value, ecLevel)
  const [isWarningDismissed, setIsWarningDismissed] = useState(false)

  // High density is defined as version 6+ (>40 modules) according to spec
  const isRiskyPattern = !isWarningDismissed && inputPixelPattern === 'Dots' && matrixSize >= 41

  const dismissWarning = () => setIsWarningDismissed(true)

  // Reset dismissal when pending pattern changes
  const [prevPattern, setPrevPattern] = useState(inputPixelPattern)
  if (prevPattern !== inputPixelPattern) {
    setIsWarningDismissed(false)
    setPrevPattern(inputPixelPattern)
  }

  return {
    designConfig,
    setDesignConfig,
    inputEyeShape,
    inputPixelPattern,
    setEyeShape,
    setPixelPattern,
    commitDesignConfig,
    isRiskyPattern,
    dismissWarning
  }
}
