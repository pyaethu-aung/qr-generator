import { QRCodeSVG } from 'qrcode.react'
import { useLocaleContext } from '../../../hooks/LocaleProvider'
import type { QRConfig } from '../../../types/qr'

interface QRPreviewProps extends QRConfig {
  className?: string
  size?: number
}

export const QRPreview = ({
  value,
  ecLevel,
  fgColor,
  bgColor,
  size = 256,
  className,
}: QRPreviewProps) => {
  const { translate } = useLocaleContext()
  const placeholderCopy = translate('preview.placeholder')
  const ariaPlaceholder = translate('preview.ariaPlaceholder')
  const ariaValueTemplate = translate('preview.ariaValue')

  const formatValueLabel = (label: string, data: Record<string, string>) =>
    label.replace(/\{(\w+)\}/g, (_, key) => {
      const token = key as keyof Record<string, string>
      return data[token] ?? ''
    })

  // If no value is provided, we can either render nothing or a placeholder.
  // For this MVP, we'll render nothing if empty to keep it clean,
  // or the QRCodeSVG will handle empty string by generating a default or empty QR.
  // qrcode.react might throw or warn on empty string, so let's handle it.
  if (!value) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-100 text-gray-400 rounded-lg border-2 border-dashed border-gray-300 ${className}`}
        style={{ width: size, height: size }}
        role="img"
        aria-label={ariaPlaceholder}
      >
        <span className="text-sm">{placeholderCopy}</span>
      </div>
    )
  }

  return (
    <div
      className={`inline-block p-4 bg-white rounded-lg shadow-sm border border-gray-200 ${className ?? ''}`}
    >
      <QRCodeSVG
        value={value}
        size={size}
        level={ecLevel}
        fgColor={fgColor}
        bgColor={bgColor}
        marginSize={0}
        role="img"
        aria-label={formatValueLabel(ariaValueTemplate, { value })}
      />
    </div>
  )
}
