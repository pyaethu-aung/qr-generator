import { QRCodeSVG } from 'qrcode.react'
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
        aria-label="QR Code Placeholder"
      >
        <span className="text-sm">Enter text to generate</span>
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
        aria-label={`QR Code for value: ${value}`}
      />
    </div>
  )
}
