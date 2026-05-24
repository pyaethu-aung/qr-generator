import { useRef, useState, useId } from 'react'
import { Zap, Download, ChevronDown, Upload, X } from 'lucide-react'
import { Input } from '../../common/Input'
import { Tooltip } from '../../common/Tooltip'
import type { QRErrorCorrectionLevel } from '../../../types/qr'

function loadImageFromUrl(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      const ctx = canvas.getContext('2d')
      if (!ctx) { reject(new Error('canvas unavailable')); return }
      try {
        ctx.drawImage(img, 0, 0)
        resolve(canvas.toDataURL('image/png'))
      } catch {
        reject(new Error('CORS not permitted'))
      }
    }
    img.onerror = () => reject(new Error('load failed'))
    img.src = url
  })
}

export interface QRControlsProps {
  value: string
  onValueChange: (value: string) => void
  ecLevel: QRErrorCorrectionLevel
  onEcLevelChange: (level: QRErrorCorrectionLevel) => void
  fgColor: string
  onFgColorChange: (color: string) => void
  bgColor: string
  onBgColorChange: (color: string) => void
  onGenerate: () => void
  isGenerating: boolean
  onDownloadPng?: () => void
  onDownloadSvg?: () => void
  canDownload: boolean
  inputError?: string
  canGenerate: boolean
  // Logo
  logoDataUrl?: string | null
  onLogoChange?: (dataUrl: string | null) => void
  logoSize?: number
  onLogoSizeChange?: (size: number) => void
  maxLogoSize?: number
  // Locale-aware labels
  placeholder?: string
  correctionLabel?: string
  foregroundLabel?: string
  backgroundLabel?: string
  generateLabel?: string
  downloadsTitle?: string
  downloadPngLabel?: string
  downloadSvgLabel?: string
  correctionOptions?: { value: QRErrorCorrectionLevel; label: string }[]
  eyeShape: import('../../../types/qr').QREyeShape
  onEyeShapeChange: (shape: import('../../../types/qr').QREyeShape) => void
  pixelPattern: import('../../../types/qr').QRPixelPattern
  onPixelPatternChange: (pattern: import('../../../types/qr').QRPixelPattern) => void
  eyeShapeLabel?: string
  pixelPatternLabel?: string
  eyeShapeOptions?: { value: import('../../../types/qr').QREyeShape; label: string }[]
  pixelPatternOptions?: { value: import('../../../types/qr').QRPixelPattern; label: string }[]
  isRiskyPattern?: boolean
  onDismissWarning?: () => void
  correctionTooltip?: string
  correctionTooltipAriaLabel?: string
  dismissWarningAriaLabel?: string
  correctionHint?: string
  designChangePending?: boolean
  applyDesignHint?: string
  logoLabel?: string
  logoSizeLabel?: string
  logoUploadHint?: string
  logoUploadAriaLabel?: string
  logoUrlAriaLabel?: string
  logoPasteUrl?: string
  logoRemoveLabel?: string
  logoErrorFormat?: string
  logoErrorUrl?: string
  logoTransparencyHint?: string
  logoSizeCapHint?: string
}

export function QRControls({
  value,
  onValueChange,
  ecLevel,
  onEcLevelChange,
  fgColor,
  onFgColorChange,
  bgColor,
  onBgColorChange,
  onGenerate,
  isGenerating,
  onDownloadPng,
  onDownloadSvg,
  canDownload,
  inputError,
  canGenerate,
  logoDataUrl,
  onLogoChange,
  logoSize,
  onLogoSizeChange,
  maxLogoSize,
  placeholder = 'Enter URL or text',
  correctionLabel = 'Error Correction',
  foregroundLabel = 'Foreground',
  backgroundLabel = 'Background',
  generateLabel = 'Generate QR Code',
  downloadPngLabel = 'Download PNG',
  downloadSvgLabel = 'Download SVG',
  correctionOptions = [
    { value: 'L', label: 'L 7%' },
    { value: 'M', label: 'M 15%' },
    { value: 'Q', label: 'Q 25%' },
    { value: 'H', label: 'H 30%' },
  ],
  eyeShape,
  onEyeShapeChange,
  pixelPattern,
  onPixelPatternChange,
  eyeShapeLabel = 'Eye Shape',
  pixelPatternLabel = 'Pixel Pattern',
  eyeShapeOptions = [
    { value: 'Square', label: 'Square' },
    { value: 'Rounded', label: 'Rounded' },
    { value: 'Diamond', label: 'Diamond' },
    { value: 'Leaf', label: 'Leaf' },
    { value: 'Hexagon', label: 'Hexagon' },
  ],
  pixelPatternOptions = [
    { value: 'Square', label: 'Square' },
    { value: 'Dots', label: 'Dots' },
  ],
  isRiskyPattern,
  onDismissWarning,
  correctionTooltip = 'How much of the QR code can be covered or damaged and still scan. Low gives a compact code; High lets you overlay a logo at the cost of a denser pattern.',
  correctionTooltipAriaLabel = 'About error correction',
  dismissWarningAriaLabel = 'Dismiss warning',
  correctionHint = 'Higher levels survive more damage and support larger logos.',
  designChangePending = false,
  applyDesignHint = 'Click Generate to preview with this design.',
  logoLabel = 'Logo',
  logoSizeLabel = 'Logo Size',
  logoUploadHint = 'Click or drop image',
  logoUploadAriaLabel = 'Upload logo image — press Enter or Space to browse files, or drag and drop',
  logoUrlAriaLabel = 'Logo image URL',
  logoPasteUrl = 'or paste a URL',
  logoRemoveLabel = 'Remove logo',
  logoErrorFormat = 'Please select an image file',
  logoErrorUrl = 'Could not load image from URL',
  logoTransparencyHint = 'PNG or SVG works best for transparent logos',
  logoSizeCapHint = 'Size capped at {max}% for this error correction level — switch to H for up to 30%',
}: QRControlsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [showUrlInput, setShowUrlInput] = useState(false)
  const [logoError, setLogoError] = useState<string | undefined>()
  const [logoFilename, setLogoFilename] = useState<string | undefined>()
  const [isDragOver, setIsDragOver] = useState(false)
  const [isLoadingLogo, setIsLoadingLogo] = useState(false)

  const eyeShapeId = useId()
  const pixelPatternLabelId = useId()
  const fgColorId = useId()
  const bgColorId = useId()
  const logoSizeId = useId()
  const logoFileId = useId()

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setLogoError(logoErrorFormat)
      return
    }
    setLogoError(undefined)
    setLogoFilename(file.name)
    const reader = new FileReader()
    reader.onload = (ev) => {
      const result = ev.target?.result
      if (typeof result === 'string') {
        onLogoChange?.(result)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    processFile(file)
    e.target.value = ''
  }

  const handleUrlSubmit = async (url: string) => {
    const trimmed = url.trim()
    if (!trimmed) return
    setIsLoadingLogo(true)
    setLogoError(undefined)
    try {
      const dataUrl = await loadImageFromUrl(trimmed)
      const filename = trimmed.split('/').pop()?.split('?')[0] || 'logo'
      setLogoFilename(filename)
      setShowUrlInput(false)
      onLogoChange?.(dataUrl)
    } catch {
      setLogoError(logoErrorUrl)
    } finally {
      setIsLoadingLogo(false)
    }
  }

  const handleRemove = () => {
    setLogoFilename(undefined)
    setLogoError(undefined)
    setShowUrlInput(false)
    onLogoChange?.(null)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) processFile(file)
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex flex-col gap-4">
        <Input
          label="Link / Text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && canGenerate && !isGenerating) {
              onGenerate()
            }
          }}
          error={inputError}
          disabled={isGenerating}
        />

        <div className="space-y-4">
          {/* EC Level pill row */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-medium text-text-primary">{correctionLabel}</span>
              <Tooltip content={correctionTooltip} ariaLabel={correctionTooltipAriaLabel} />
            </div>
            <div className="flex gap-2" role="group" aria-label={correctionLabel}>
              {correctionOptions.map(({ value: optValue, label }) => (
                <button
                  key={optValue}
                  type="button"
                  aria-pressed={ecLevel === optValue}
                  onClick={() => onEcLevelChange(optValue)}
                  disabled={isGenerating}
                  className={`flex h-11 flex-1 items-center justify-center rounded-full px-3 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                    ecLevel === optValue
                      ? 'bg-action text-action-fg font-semibold'
                      : 'bg-surface-inset text-text-primary hover:bg-surface-raised'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <p className="text-xs text-text-secondary">{correctionHint}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Eye Shape styled select */}
            <div className="flex flex-col gap-1">
              <label htmlFor={eyeShapeId} className="text-sm font-medium text-text-primary">{eyeShapeLabel}</label>
              <div className="relative">
                <select
                  id={eyeShapeId}
                  className="block h-11 w-full appearance-none rounded-lg border border-border-subtle bg-surface-inset px-3 pr-8 text-sm text-text-primary shadow-sm focus:border-focus-ring focus:outline-none focus:ring-2 focus:ring-focus-ring disabled:bg-action-disabled disabled:text-text-disabled"
                  value={eyeShape}
                  onChange={(e) => onEyeShapeChange(e.target.value as import('../../../types/qr').QREyeShape)}
                  disabled={isGenerating}
                >
                  {eyeShapeOptions.map(({ value: optValue, label }) => (
                    <option key={optValue} value={optValue}>
                      {label}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={16}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary"
                  aria-hidden
                />
              </div>
            </div>

            {/* Pixel Pattern pill toggle */}
            <div className="flex flex-col gap-1">
              <label id={pixelPatternLabelId} className="text-sm font-medium text-text-primary">{pixelPatternLabel}</label>
              <div className="flex gap-2" role="group" aria-labelledby={pixelPatternLabelId}>
                {pixelPatternOptions.map(({ value: optValue, label }) => (
                  <button
                    key={optValue}
                    type="button"
                    aria-pressed={pixelPattern === optValue}
                    onClick={() => onPixelPatternChange(optValue)}
                    disabled={isGenerating}
                    className={`flex h-11 flex-1 items-center justify-center rounded-full px-3 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                      pixelPattern === optValue
                        ? 'bg-action text-action-fg font-semibold'
                        : 'bg-surface-inset text-text-primary hover:bg-surface-raised'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {designChangePending && (
            <p className="text-xs text-text-secondary" role="status">
              {applyDesignHint}
            </p>
          )}

          {isRiskyPattern && (
            <div className="flex items-start justify-between rounded-lg border border-warning-border bg-warning-surface p-3 text-sm text-warning shadow-sm" role="alert">
              <div className="flex items-start gap-2">
                <svg className="h-5 w-5 shrink-0 text-warning" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div className="flex flex-col">
                  <strong className="font-semibold block">Readability Risk</strong>
                  <span className="opacity-90">High density shapes may affect camera readability.</span>
                </div>
              </div>
              {onDismissWarning && (
                <button
                  onClick={onDismissWarning}
                  className="ml-4 shrink-0 rounded-md p-1 text-warning hover:bg-warning-border/20 focus:outline-none focus:ring-2 focus:ring-warning focus:ring-offset-2"
                  aria-label={dismissWarningAriaLabel}
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
            </div>
          )}

          {/* Color pickers — 44px inset boxes */}
          <div className="flex flex-wrap gap-4">
            <div className="min-w-[120px] flex-1 flex flex-col gap-1">
              <label htmlFor={fgColorId} className="text-sm font-medium text-text-primary">{foregroundLabel}</label>
              <div className="relative flex h-11 items-center gap-3 rounded-lg bg-surface-inset px-3 focus-within:ring-2 focus-within:ring-focus-ring focus-within:outline-none">
                <div className="h-5 w-5 shrink-0 rounded-full border border-border-strong" style={{ backgroundColor: fgColor }} />
                <span className="text-sm font-medium uppercase font-['Geist_Mono'] text-text-primary truncate">
                  {fgColor}
                </span>
                <input
                  id={fgColorId}
                  type="color"
                  value={fgColor}
                  onChange={(e) => onFgColorChange(e.target.value)}
                  disabled={isGenerating}
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0 focus:outline-none"
                />
              </div>
            </div>

            <div className="min-w-[120px] flex-1 flex flex-col gap-1">
              <label htmlFor={bgColorId} className="text-sm font-medium text-text-primary">{backgroundLabel}</label>
              <div className="relative flex h-11 items-center gap-3 rounded-lg bg-surface-inset px-3 focus-within:ring-2 focus-within:ring-focus-ring focus-within:outline-none">
                <div className="h-5 w-5 shrink-0 rounded-full border border-border-strong" style={{ backgroundColor: bgColor }} />
                <span className="text-sm font-medium uppercase font-['Geist_Mono'] text-text-primary truncate">
                  {bgColor}
                </span>
                <input
                  id={bgColorId}
                  type="color"
                  value={bgColor}
                  onChange={(e) => onBgColorChange(e.target.value)}
                  disabled={isGenerating}
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Logo upload */}
          {onLogoChange && (
            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium text-text-primary">{logoLabel}</p>

              {logoDataUrl ? (
                <div className="flex items-center gap-3 rounded-lg bg-surface-inset px-3 h-11">
                  <img
                    src={logoDataUrl}
                    alt=""
                    className="h-7 w-7 shrink-0 rounded-full object-cover border border-border-subtle"
                  />
                  <span className="flex-1 truncate text-sm font-medium text-text-primary">
                    {logoFilename || 'Logo'}
                  </span>
                  <button
                    type="button"
                    onClick={handleRemove}
                    aria-label={logoRemoveLabel}
                    className="shrink-0 rounded p-1 text-text-secondary hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
                  >
                    <X size={14} aria-hidden />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor={logoFileId}
                    aria-label={logoUploadAriaLabel}
                    onDragOver={(e) => { e.preventDefault(); setIsDragOver(true) }}
                    onDragLeave={() => setIsDragOver(false)}
                    onDrop={handleDrop}
                    onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); fileInputRef.current?.click() } }}
                    tabIndex={0}
                    className={`flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed text-sm transition-colors ${
                      isDragOver
                        ? 'border-action bg-action/5 text-action'
                        : 'border-border-subtle bg-surface-inset text-text-secondary hover:border-action hover:text-text-primary'
                    }`}
                  >
                    {isLoadingLogo ? (
                      <span className="h-4 w-4 motion-safe:animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden />
                    ) : (
                      <Upload size={15} aria-hidden />
                    )}
                    {isLoadingLogo ? 'Loading…' : logoUploadHint}
                  </label>
                  <input
                    id={logoFileId}
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="absolute opacity-0 w-px h-px"
                    onChange={handleFileChange}
                    tabIndex={-1}
                  />

                  {!showUrlInput ? (
                    <button
                      type="button"
                      onClick={() => setShowUrlInput(true)}
                      className="self-start text-xs text-action hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-action rounded"
                    >
                      {logoPasteUrl}
                    </button>
                  ) : (
                    <input
                      type="url"
                      placeholder="https://…"
                      aria-label={logoUrlAriaLabel}
                      className="h-9 w-full rounded-lg border border-border-strong bg-surface px-3 text-sm text-text-primary placeholder:text-text-disabled focus:border-focus-ring focus:outline-none focus:ring-2 focus:ring-focus-ring"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') void handleUrlSubmit(e.currentTarget.value)
                        if (e.key === 'Escape') setShowUrlInput(false)
                      }}
                      onBlur={(e) => { if (e.target.value) void handleUrlSubmit(e.target.value) }}
                      autoFocus
                    />
                  )}
                </div>
              )}

              {logoError && (
                <p className="text-xs text-error" role="alert">{logoError}</p>
              )}

              {logoDataUrl && logoSize !== undefined && maxLogoSize !== undefined && onLogoSizeChange && (
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label htmlFor={logoSizeId} className="text-sm font-medium text-text-primary">{logoSizeLabel}</label>
                    <span className="text-sm tabular-nums text-text-secondary">{logoSize}%</span>
                  </div>
                  <input
                    id={logoSizeId}
                    type="range"
                    min={5}
                    max={maxLogoSize}
                    value={logoSize}
                    onChange={(e) => onLogoSizeChange(Number(e.target.value))}
                    className="h-1.5 w-full cursor-pointer accent-action"
                  />
                  {logoSize >= maxLogoSize && maxLogoSize < 30 ? (
                    <p className="text-xs text-text-secondary" role="status">
                      {logoSizeCapHint.replace('{max}', String(maxLogoSize))}
                    </p>
                  ) : (
                    <p className="text-xs text-text-secondary">{logoTransparencyHint}</p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Generate button — full-width, 48px, rounded-full, zap icon */}
        <button
          type="button"
          onClick={onGenerate}
          disabled={!canGenerate || isGenerating}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-action px-6 text-sm font-semibold text-action-fg transition-colors hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isGenerating ? (
            <span className="h-4 w-4 motion-safe:animate-spin rounded-full border-2 border-action-fg border-t-transparent" />
          ) : (
            <Zap size={18} aria-hidden />
          )}
          {generateLabel}
        </button>

        {/* Download buttons — inline below Generate, no divider */}
        {(onDownloadPng || onDownloadSvg) && (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3">
            {onDownloadPng && (
              <button
                type="button"
                onClick={onDownloadPng}
                disabled={!canDownload || isGenerating}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-full border border-border-subtle bg-surface-raised px-4 text-sm font-medium text-text-primary transition-colors hover:bg-surface-inset focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Download size={16} aria-hidden />
                {downloadPngLabel}
              </button>
            )}
            {onDownloadSvg && (
              <button
                type="button"
                onClick={onDownloadSvg}
                disabled={!canDownload || isGenerating}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-full border border-border-subtle bg-surface-raised px-4 text-sm font-medium text-text-primary transition-colors hover:bg-surface-inset focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Download size={16} aria-hidden />
                {downloadSvgLabel}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
