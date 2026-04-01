import { useState, useEffect } from 'react'
import type { QRDesignConfig, QREyeShape, QRPixelPattern } from '../types/qr'

const DESIGN_STORAGE_KEY = 'qr-generator-design-config'

const DEFAULT_DESIGN_CONFIG: QRDesignConfig = {
  eyeShape: 'Square',
  pixelPattern: 'Square',
}

export function useQRDesign() {
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

  // Risky pattern flagging will be fleshed out in Phase 4 (US2)
  const isRiskyPattern = false 

  return {
    designConfig,
    setDesignConfig,
    setEyeShape,
    setPixelPattern,
    isRiskyPattern
  }
}
