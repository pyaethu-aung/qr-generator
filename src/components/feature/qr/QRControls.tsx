import { Button } from '../../common/Button'
import { Input } from '../../common/Input'

interface QRControlsProps {
  value: string
  onValueChange: (value: string) => void
  onGenerate: () => void
  isGenerating?: boolean
  onDownloadPng?: () => void
  onDownloadSvg?: () => void
  canDownload?: boolean
}

export const QRControls = ({
  value,
  onValueChange,
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
