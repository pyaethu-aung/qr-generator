import { useState, useEffect, useCallback } from 'react'
import type {
  QRDesignConfig,
  QRErrorCorrectionLevel,
  QREyeShape,
  QREyeFrameShape,
  QREyeCenterShape,
  QRPixelPattern,
} from '../types/qr'
import { getMatrixSize } from '../utils/qrShapeRenderer'

const EC_LOGO_MAX: Record<QRErrorCorrectionLevel, number> = { L: 7, M: 15, Q: 25, H: 30 }

const DESIGN_STORAGE_KEY = 'qr-generator-design-config'

const DEFAULT_DESIGN_CONFIG: QRDesignConfig = {
  eyeFrameShape: 'Square',
  eyeCenterShape: 'Square',
  eyeFrameColor: null,
  eyeCenterColor: null,
  pixelPattern: 'Square',
}

// Maps the legacy single `eyeShape` to the split frame/center shapes.
const LEGACY_EYE_SHAPE_MAP: Record<QREyeShape, { frame: QREyeFrameShape; center: QREyeCenterShape }> = {
  Square: { frame: 'Square', center: 'Square' },
  Rounded: { frame: 'Rounded', center: 'Rounded' },
  Leaf: { frame: 'Leaf', center: 'Square' },
  Hexagon: { frame: 'Hexagon', center: 'Square' },
  Diamond: { frame: 'Square', center: 'Diamond' },
}

/**
 * Reads the stored design config, migrating the pre-split `{ eyeShape }` shape into the
 * new `{ eyeFrameShape, eyeCenterShape, eyeFrameColor, eyeCenterColor }` model. Returns
 * the default config when nothing valid is stored.
 */
function loadDesignConfig(): QRDesignConfig {
  try {
    const stored = localStorage.getItem(DESIGN_STORAGE_KEY)
    if (!stored) return DEFAULT_DESIGN_CONFIG
    const parsed = JSON.parse(stored) as Partial<QRDesignConfig> & { eyeShape?: QREyeShape }

    // Legacy shape present and not yet migrated → split it.
    if (parsed.eyeShape && !parsed.eyeFrameShape) {
      const mapped = LEGACY_EYE_SHAPE_MAP[parsed.eyeShape] ?? LEGACY_EYE_SHAPE_MAP.Square
      return {
        eyeFrameShape: mapped.frame,
        eyeCenterShape: mapped.center,
        eyeFrameColor: null,
        eyeCenterColor: null,
        pixelPattern: parsed.pixelPattern ?? 'Square',
      }
    }

    return {
      eyeFrameShape: parsed.eyeFrameShape ?? DEFAULT_DESIGN_CONFIG.eyeFrameShape,
      eyeCenterShape: parsed.eyeCenterShape ?? DEFAULT_DESIGN_CONFIG.eyeCenterShape,
      eyeFrameColor: parsed.eyeFrameColor ?? null,
      eyeCenterColor: parsed.eyeCenterColor ?? null,
      pixelPattern: parsed.pixelPattern ?? DEFAULT_DESIGN_CONFIG.pixelPattern,
    }
  } catch {
    return DEFAULT_DESIGN_CONFIG
  }
}

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

  const matrixSize = getMatrixSize(value, ecLevel)
  const [isWarningDismissed, setIsWarningDismissed] = useState(false)
  const RISKY_PATTERNS = new Set<QRPixelPattern>(['Dots', 'Vertical'])
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
    isRiskyPattern,
    dismissWarning,
    logoDataUrl,
    setLogoDataUrl,
    logoSize,
    setLogoSize,
    maxLogoSize,
  }
}
