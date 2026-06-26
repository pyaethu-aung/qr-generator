import { useState, useEffect, useCallback } from 'react'
import type {
  QRDesignConfig,
  QRErrorCorrectionLevel,
  QREyeFrameShape,
  QREyeCenterShape,
  QRPixelPattern,
  QRGradient,
  QRFrameConfig,
  QRFrameStyle,
  QRFramePosition,
} from '../types/qr'
import { getMatrixSize } from '../utils/qrShapeRenderer'
import {
  DESIGN_STORAGE_KEY,
  FRAME_STORAGE_KEY,
  FRAME_TEXT_LIMIT,
  loadDesignConfig,
  loadFrameConfig,
} from '../utils/persistedDesign'

const EC_LOGO_MAX: Record<QRErrorCorrectionLevel, number> = { L: 7, M: 15, Q: 25, H: 30 }

const RISKY_PATTERNS = new Set<QRPixelPattern>(['Dots', 'Vertical', 'Horizontal'])

export function useQRDesign(value: string = '', ecLevel: 'L' | 'M' | 'Q' | 'H' = 'M') {
  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null)
  const [logoSizeState, setLogoSizeState] = useState(20)

  const maxLogoSize = EC_LOGO_MAX[ecLevel]
  const logoSize = Math.min(logoSizeState, maxLogoSize)

  const setLogoSize = useCallback((size: number) => {
    setLogoSizeState(Math.min(size, EC_LOGO_MAX[ecLevel]))
  }, [ecLevel])

  const [designConfig, setDesignConfig] = useState<QRDesignConfig>(loadDesignConfig)

  useEffect(() => {
    try {
      localStorage.setItem(DESIGN_STORAGE_KEY, JSON.stringify(designConfig))
    } catch {
      // Ignore if localStorage is unavailable
    }
  }, [designConfig])

  const setEyeFrameShape = useCallback((eyeFrameShape: QREyeFrameShape) => {
    setDesignConfig(prev => ({ ...prev, eyeFrameShape }))
  }, [])

  const setEyeCenterShape = useCallback((eyeCenterShape: QREyeCenterShape) => {
    setDesignConfig(prev => ({ ...prev, eyeCenterShape }))
  }, [])

  const setEyeFrameColor = useCallback((eyeFrameColor: string | null) => {
    setDesignConfig(prev => ({ ...prev, eyeFrameColor }))
  }, [])

  const setEyeCenterColor = useCallback((eyeCenterColor: string | null) => {
    setDesignConfig(prev => ({ ...prev, eyeCenterColor }))
  }, [])

  const setPixelPattern = useCallback((pixelPattern: QRPixelPattern) => {
    setDesignConfig(prev => ({ ...prev, pixelPattern }))
  }, [])

  const setFgGradient = useCallback((fgGradient: QRGradient | null) => {
    setDesignConfig(prev => ({ ...prev, fgGradient }))
  }, [])

  const [frameConfig, setFrameConfig] = useState<QRFrameConfig>(loadFrameConfig)

  useEffect(() => {
    try {
      localStorage.setItem(FRAME_STORAGE_KEY, JSON.stringify(frameConfig))
    } catch {
      // Ignore if localStorage is unavailable
    }
  }, [frameConfig])

  const setFrameStyle = useCallback((style: QRFrameStyle) => {
    setFrameConfig(prev => ({ ...prev, style }))
  }, [])

  const setFrameText = useCallback((text: string) => {
    setFrameConfig(prev => ({ ...prev, text: text.slice(0, FRAME_TEXT_LIMIT) }))
  }, [])

  const setFrameColor = useCallback((color: string) => {
    setFrameConfig(prev => ({ ...prev, color }))
  }, [])

  const setFramePosition = useCallback((position: QRFramePosition) => {
    setFrameConfig(prev => ({ ...prev, position }))
  }, [])

  const applyFrameConfig = useCallback((config: QRFrameConfig) => {
    setFrameConfig(config)
  }, [])

  const matrixSize = getMatrixSize(value, ecLevel)
  const [isWarningDismissed, setIsWarningDismissed] = useState(false)
  const isRiskyPattern = !isWarningDismissed && RISKY_PATTERNS.has(designConfig.pixelPattern) && matrixSize >= 41

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
    setEyeFrameShape,
    setEyeCenterShape,
    setEyeFrameColor,
    setEyeCenterColor,
    setPixelPattern,
    setFgGradient,
    isRiskyPattern,
    dismissWarning,
    logoDataUrl,
    setLogoDataUrl,
    logoSize,
    setLogoSize,
    maxLogoSize,
    frameConfig,
    setFrameStyle,
    setFrameText,
    setFrameColor,
    setFramePosition,
    applyFrameConfig,
    frameTextLimit: FRAME_TEXT_LIMIT,
  }
}
