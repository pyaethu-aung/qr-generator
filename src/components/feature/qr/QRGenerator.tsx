import { QRControls } from './QRControls'
import { QRPreview } from './QRPreview'
import { useQRGenerator } from '../../../hooks/useQRGenerator'

export const QRGenerator = () => {
  const { config, inputValue, setInputValue, generateQRCode, isGenerating } = useQRGenerator()

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl mx-auto px-4 py-8">
      <div className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold text-slate-800">Configuration</h2>
        <QRControls
          value={inputValue}
          onValueChange={setInputValue}
          onGenerate={generateQRCode}
          isGenerating={isGenerating}
        />
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold text-slate-800">Preview</h2>
        <div className="flex items-start justify-center p-6 bg-slate-50 rounded-xl border border-slate-200 min-h-[400px]">
          <QRPreview {...config} />
        </div>
      </div>
    </div>
  )
}
