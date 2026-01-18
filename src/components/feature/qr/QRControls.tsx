import { Button } from '../../common/Button'
import { Input } from '../../common/Input'
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
}: QRControlsProps) => {
  return (
    <div className="flex flex-col gap-6 w-full p-6 bg-white rounded-lg shadow-sm border border-gray-100">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <Input
            label="Content"
            placeholder="Enter text or URL"
            value={value}
            onChange={(e) => onValueChange(e.target.value)}
            disabled={isGenerating}
            fullWidth
          />
          <p className="text-xs text-slate-500">
            Enter the content you want to encode in the QR code.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-900">Correction Level</label>
            <select
              className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors disabled:bg-slate-100 disabled:text-slate-500"
              value={ecLevel}
              onChange={(e) => onEcLevelChange(e.target.value as QRErrorCorrectionLevel)}
              disabled={isGenerating}
            >
              <option value="L">Low (7%)</option>
              <option value="M">Medium (15%)</option>
              <option value="Q">Quartile (25%)</option>
              <option value="H">High (30%)</option>
            </select>
          </div>

          <div className="flex gap-4">
            <div className="flex-1 flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-900">Foreground</label>
              <div className="flex items-center gap-2">
                <div className="relative w-12 h-9 overflow-hidden rounded-md border border-slate-300 shadow-sm">
                  <input
                    type="color"
                    value={fgColor}
                    onChange={(e) => onFgColorChange(e.target.value)}
                    disabled={isGenerating}
                    className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] p-0 cursor-pointer border-0"
                  />
                </div>
                <span className="text-xs text-slate-500 font-mono uppercase truncate max-w-[4rem]">
                  {fgColor}
                </span>
              </div>
            </div>

            <div className="flex-1 flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-900">Background</label>
              <div className="flex items-center gap-2">
                <div className="relative w-12 h-9 overflow-hidden rounded-md border border-slate-300 shadow-sm">
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => onBgColorChange(e.target.value)}
                    disabled={isGenerating}
                    className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] p-0 cursor-pointer border-0"
                  />
                </div>
                <span className="text-xs text-slate-500 font-mono uppercase truncate max-w-[4rem]">
                  {bgColor}
                </span>
              </div>
            </div>
          </div>
        </div>

        <Button
          variant="primary"
          onClick={onGenerate}
          disabled={!value || isGenerating}
          loading={isGenerating}
          fullWidth
        >
          Generate QR Code
        </Button>
      </div>

      {(onDownloadPng || onDownloadSvg) && (
        <div className="pt-6 border-t border-slate-100 flex flex-col gap-3">
          <h3 className="text-sm font-medium text-slate-700">Downloads</h3>
          <div className="grid grid-cols-2 gap-3">
            {onDownloadPng && (
              <Button
                variant="secondary"
                size="sm"
                onClick={onDownloadPng}
                disabled={!canDownload || isGenerating}
              >
                Download PNG
              </Button>
            )}
            {onDownloadSvg && (
              <Button
                variant="secondary"
                size="sm"
                onClick={onDownloadSvg}
                disabled={!canDownload || isGenerating}
              >
                Download SVG
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
