import { Button } from '../../common/Button'
import { Input } from '../../common/Input'
import type { QRErrorCorrectionLevel } from '../../../types/qr'

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
  placeholder = 'Enter URL or text',
  correctionLabel = 'Error Correction',
  foregroundLabel = 'Foreground',
  backgroundLabel = 'Background',
  generateLabel = 'Generate QR Code',
  downloadsTitle = 'Download Formats',
  downloadPngLabel = 'Download PNG',
  downloadSvgLabel = 'Download SVG',
  correctionOptions = [
    { value: 'L', label: 'Low (7%)' },
    { value: 'M', label: 'Medium (15%)' },
    { value: 'Q', label: 'Quartile (25%)' },
    { value: 'H', label: 'High (30%)' },
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
}: QRControlsProps) {
  return (
    <div className="flex flex-col gap-6 w-full rounded-2xl border border-border-subtle bg-surface-raised/40 p-4 sm:p-6">
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
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-text-primary">{correctionLabel}</label>
            <select
              className="block w-full rounded-lg border border-border-strong bg-surface px-3 py-2 text-sm text-text-primary shadow-sm focus:border-focus-ring focus:outline-none focus:ring-2 focus:ring-focus-ring disabled:bg-action-disabled disabled:text-text-disabled"
              value={ecLevel}
              onChange={(e) => onEcLevelChange(e.target.value as QRErrorCorrectionLevel)}
              disabled={isGenerating}
              aria-label={correctionLabel}
            >
              {correctionOptions.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-text-primary">{eyeShapeLabel}</label>
              <select
                className="block w-full rounded-lg border border-border-strong bg-surface px-3 py-2 text-sm text-text-primary shadow-sm focus:border-focus-ring focus:outline-none focus:ring-2 focus:ring-focus-ring disabled:bg-action-disabled disabled:text-text-disabled"
                value={eyeShape}
                onChange={(e) => onEyeShapeChange(e.target.value as import('../../../types/qr').QREyeShape)}
                disabled={isGenerating}
                role="combobox"
                aria-label={eyeShapeLabel}
              >
                {eyeShapeOptions.map(({ value, label }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-text-primary">{pixelPatternLabel}</label>
              <select
                className="block w-full rounded-lg border border-border-strong bg-surface px-3 py-2 text-sm text-text-primary shadow-sm focus:border-focus-ring focus:outline-none focus:ring-2 focus:ring-focus-ring disabled:bg-action-disabled disabled:text-text-disabled"
                value={pixelPattern}
                onChange={(e) => onPixelPatternChange(e.target.value as import('../../../types/qr').QRPixelPattern)}
                disabled={isGenerating}
                role="combobox"
                aria-label={pixelPatternLabel}
              >
                {pixelPatternOptions.map(({ value, label }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {isRiskyPattern && (
            <div className="flex items-start justify-between rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 shadow-sm dark:border-amber-900/50 dark:bg-amber-900/20 dark:text-amber-200" role="alert">
              <div className="flex items-start gap-2">
                <svg className="h-5 w-5 shrink-0 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
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
                  className="ml-4 shrink-0 rounded-md p-1 text-amber-500 hover:bg-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 dark:hover:bg-amber-900/50 dark:focus:ring-offset-surface"
                  aria-label="Dismiss warning"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
            </div>
          )}

          <div className="flex flex-wrap gap-4">
            <div className="min-w-[120px] flex-1 flex flex-col gap-1">
              <label className="text-sm font-medium text-text-primary">{foregroundLabel}</label>
              <div className="flex items-center gap-2">
                <div className="relative w-10 h-8 sm:w-12 sm:h-9 overflow-hidden rounded-md border border-border-strong shadow-sm">
                  <input
                    type="color"
                    value={fgColor}
                    onChange={(e) => onFgColorChange(e.target.value)}
                    disabled={isGenerating}
                    className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] p-0 cursor-pointer border-0"
                  />
                </div>
                <span className="text-xs text-text-secondary font-mono uppercase truncate max-w-[3rem] sm:max-w-[4rem]">
                  {fgColor}
                </span>
              </div>
            </div>

            <div className="min-w-[120px] flex-1 flex flex-col gap-1">
              <label className="text-sm font-medium text-text-primary">{backgroundLabel}</label>
              <div className="flex items-center gap-2">
                <div className="relative w-10 h-8 sm:w-12 sm:h-9 overflow-hidden rounded-md border border-border-strong shadow-sm">
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => onBgColorChange(e.target.value)}
                    disabled={isGenerating}
                    className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] p-0 cursor-pointer border-0"
                  />
                </div>
                <span className="text-xs text-text-secondary font-mono uppercase truncate max-w-[3rem] sm:max-w-[4rem]">
                  {bgColor}
                </span>
              </div>
            </div>
          </div>
        </div>

        <Button
          variant="primary"
          onClick={onGenerate}
          disabled={!canGenerate || isGenerating}
          loading={isGenerating}
          fullWidth
        >
          {generateLabel}
        </Button>
      </div>

      {(onDownloadPng || onDownloadSvg) && (
        <div className="pt-6 border-t border-border-subtle flex flex-col gap-3">
          <h3 className="text-sm font-medium text-text-secondary">{downloadsTitle}</h3>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3">
            {onDownloadPng && (
              <Button
                variant="secondary"
                size="sm"
                onClick={onDownloadPng}
                disabled={!canDownload || isGenerating}
                fullWidth
              >
                {downloadPngLabel}
              </Button>
            )}
            {onDownloadSvg && (
              <Button
                variant="secondary"
                size="sm"
                onClick={onDownloadSvg}
                disabled={!canDownload || isGenerating}
                fullWidth
              >
                {downloadSvgLabel}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
