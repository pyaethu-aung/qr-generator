import { useState, useEffect } from 'react'
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

  // Persist to local storage upon change
  useEffect(() => {
    try {
      localStorage.setItem(DESIGN_STORAGE_KEY, JSON.stringify(designConfig))
    } catch {
      // Ignore if localStorage is unavailable
    }
  }, [designConfig])

  const setEyeShape = (eyeShape: QREyeShape) => {
    setDesignConfig(prev => ({ ...prev, eyeShape }))
  }

  const setPixelPattern = (pixelPattern: QRPixelPattern) => {
    setDesignConfig(prev => ({ ...prev, pixelPattern }))
  }

  // Risky pattern flagging for high density dots
  const matrixSize = getMatrixSize(value, ecLevel)
  const [isWarningDismissed, setIsWarningDismissed] = useState(false)
  
  // High density is defined as version 6+ (>40 modules) according to spec
  // We use 37+ to catch the boundary or >40 as 41x41 is V6.
  const isRiskyPattern = !isWarningDismissed && designConfig.pixelPattern === 'Dots' && matrixSize >= 41

  const dismissWarning = () => setIsWarningDismissed(true)

  // Reset dismissal if user changes pattern back and forth
  // Reset dismissal if user changes pattern back and forth
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
    dismissWarning
  }
}
