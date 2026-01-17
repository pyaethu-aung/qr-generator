import { Button } from '../../common/Button'
import { Input } from '../../common/Input'

interface QRControlsProps {
  value: string
  onValueChange: (value: string) => void
  onGenerate: () => void
  isGenerating?: boolean
}

export const QRControls = ({
  value,
  onValueChange,
  onGenerate,
  isGenerating = false,
}: QRControlsProps) => {
  return (
    <div className="flex flex-col gap-4 w-full p-6 bg-white rounded-lg shadow-sm border border-gray-100">
      <div className="flex flex-col gap-1">
        <Input
          label="Content"
          placeholder="Enter text or URL"
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
          disabled={isGenerating}
          fullWidth
        />
        <p className="text-xs text-gray-500">
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
  )
}
