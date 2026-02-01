import { Button } from '../../common/Button'
import { Input } from '../../common/Input'
import { useLocaleContext } from '../../../hooks/LocaleProvider'
import type { QRErrorCorrectionLevel } from '../../../types/qr'

interface QRControlsProps {
  value: string
  onValueChange: (value: string) => void
  ecLevel: QRErrorCorrectionLevel
  onEcLevelChange: (level: QRErrorCorrectionLevel) => void
  fgColor: string
  onFgColorChange: (color: string) => void
  bgColor: string
  onBgColorChange: (color: string) => void
  onGenerate: () => void
  isGenerating?: boolean
  onDownloadPng?: () => void
  onDownloadSvg?: () => void
  canDownload?: boolean
  inputError?: string
  canGenerate?: boolean
}

export const QRControls = ({
  value,
  onValueChange,
  ecLevel,
  onEcLevelChange,
  fgColor,
  onFgColorChange,
  bgColor,
  onBgColorChange,
  onGenerate,
  isGenerating = false,
  onDownloadPng,
  onDownloadSvg,
  canDownload = false,
  inputError,
  canGenerate = true,
}: QRControlsProps) => {
  const { translate } = useLocaleContext()

  const contentLabel = translate('controls.contentLabel')
  const contentPlaceholder = translate('controls.contentPlaceholder')
  const helperText = translate('config.helper')
  const correctionLabel = translate('controls.correctionLabel')
  const correctionOptions = [
    { value: 'L', label: translate('controls.correctionLow') },
    { value: 'M', label: translate('controls.correctionMedium') },
    { value: 'Q', label: translate('controls.correctionQuartile') },
    { value: 'H', label: translate('controls.correctionHigh') },
  ] as const
  const foregroundLabel = translate('controls.foregroundLabel')
  const backgroundLabel = translate('controls.backgroundLabel')
  const generateLabel = translate('controls.generate')
  const downloadsTitle = translate('controls.downloadsTitle')
  const downloadPngLabel = translate('controls.downloadPng')
  const downloadSvgLabel = translate('controls.downloadSvg')

  return (
    <div className="flex flex-col gap-6 w-full p-4 sm:p-6 bg-white rounded-lg shadow-sm border border-gray-100">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <Input
            label={contentLabel}
            placeholder={contentPlaceholder}
            value={value}
            onChange={(e) => onValueChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && canGenerate && !isGenerating) {
                onGenerate()
              }
            }}
            disabled={isGenerating}
            fullWidth
            error={inputError}
          />
          <p className="text-xs text-slate-500">{helperText}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-900">{correctionLabel}</label>
            <select
              className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors disabled:bg-slate-100 disabled:text-slate-500"
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
              <label className="text-sm font-medium text-slate-900">{foregroundLabel}</label>
              <div className="flex items-center gap-2">
                <div className="relative w-10 h-8 sm:w-12 sm:h-9 overflow-hidden rounded-md border border-slate-300 shadow-sm">
                  <input
                    type="color"
                    value={fgColor}
                    onChange={(e) => onFgColorChange(e.target.value)}
                    disabled={isGenerating}
                    className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] p-0 cursor-pointer border-0"
                  />
                </div>
                <span className="text-xs text-slate-500 font-mono uppercase truncate max-w-[3rem] sm:max-w-[4rem]">
                  {fgColor}
                </span>
              </div>
            </div>

            <div className="min-w-[120px] flex-1 flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-900">{backgroundLabel}</label>
              <div className="flex items-center gap-2">
                <div className="relative w-10 h-8 sm:w-12 sm:h-9 overflow-hidden rounded-md border border-slate-300 shadow-sm">
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => onBgColorChange(e.target.value)}
                    disabled={isGenerating}
                    className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] p-0 cursor-pointer border-0"
                  />
                </div>
                <span className="text-xs text-slate-500 font-mono uppercase truncate max-w-[3rem] sm:max-w-[4rem]">
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
        <div className="pt-6 border-t border-slate-100 flex flex-col gap-3">
          <h3 className="text-sm font-medium text-slate-700">{downloadsTitle}</h3>
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
