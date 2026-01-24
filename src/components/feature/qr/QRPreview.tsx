import { QRCodeCanvas } from 'qrcode.react'
import { forwardRef } from 'react'
import { useLocaleContext } from '../../../hooks/LocaleProvider'
import type { QRConfig } from '../../../types/qr'

interface QRPreviewProps extends QRConfig {
  className?: string
  size?: number
}

export const QRPreview = forwardRef<HTMLCanvasElement, QRPreviewProps>(
  ({ value, ecLevel, fgColor, bgColor, size = 256, className }, ref) => {
    const { translate } = useLocaleContext()
    const placeholderCopy = translate('preview.placeholder')
    const ariaPlaceholder = translate('preview.ariaPlaceholder')
    const ariaValueTemplate = translate('preview.ariaValue')
    const shareButtonLabel = translate('preview.shareButtonLabel')

    const formatValueLabel = (label: string, data: Record<string, string>) =>
      label.replace(/\{(\w+)\}/g, (_, key) => {
        const token = key as keyof Record<string, string>
        return data[token] ?? ''
      })

    const shareButton = (
      <button
        type="button"
        data-testid="share-qr-button"
        disabled={!value}
        aria-label={shareButtonLabel}
        className={`w-full rounded-full px-4 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
          value
            ? 'border border-slate-900 bg-slate-900 text-white hover:bg-slate-800 focus-visible:ring-slate-900'
            : 'border border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
        }`}
      >
        {shareButtonLabel}
      </button>
    )

    if (!value) {
      return (
        <div className={`flex flex-col items-center ${className ?? ''}`} style={{ width: size }}>
          <div
            className="flex items-center justify-center bg-gray-100 text-gray-400 rounded-lg border-2 border-dashed border-gray-300"
            style={{ width: size, height: size }}
            role="img"
            aria-label={ariaPlaceholder}
          >
            <span className="text-sm">{placeholderCopy}</span>
          </div>
          <div className="mt-4 w-full">{shareButton}</div>
        </div>
      )
    }

    return (
      <div
        className={`inline-block p-4 bg-white rounded-lg shadow-sm border border-gray-200 ${className ?? ''}`}
      >
        <QRCodeCanvas
          ref={ref}
          value={value}
          size={size}
          level={ecLevel}
          fgColor={fgColor}
          bgColor={bgColor}
          marginSize={0}
          role="img"
          aria-label={formatValueLabel(ariaValueTemplate, { value })}
        />
        <div className="mt-4 w-full">{shareButton}</div>
      </div>
    )
  },
)

QRPreview.displayName = 'QRPreview'
