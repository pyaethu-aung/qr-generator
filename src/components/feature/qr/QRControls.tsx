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
            >
              {correctionOptions.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

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
