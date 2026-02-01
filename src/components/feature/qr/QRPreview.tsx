import { QRCodeCanvas } from 'qrcode.react'
import { forwardRef, useCallback, useId, useRef } from 'react'
import { useQRShare } from '../../../hooks/useQRShare'
import { useLocaleContext } from '../../../hooks/LocaleProvider'
import type { QRConfig } from '../../../types/qr'

import type { CSSProperties } from 'react'

interface QRPreviewProps extends QRConfig {
  className?: string
  size?: number
  style?: CSSProperties
}

export const QRPreview = forwardRef<HTMLCanvasElement, QRPreviewProps>(
  ({ value, ecLevel, fgColor, bgColor, size = 256, className, style }, forwardedRef) => {
    const { translate } = useLocaleContext()
    const placeholderCopy = translate('preview.placeholder')
    const ariaPlaceholder = translate('preview.ariaPlaceholder')
    const ariaValueTemplate = translate('preview.ariaValue')
    const shareButtonLabel = translate('preview.shareButtonLabel')

    const { share, shareRequest, isSharing } = useQRShare()
    const canvasRef = useRef<HTMLCanvasElement | null>(null)

    const assignForwardedRef = useCallback(
      (node: HTMLCanvasElement | null) => {
        if (typeof forwardedRef === 'function') {
          forwardedRef(node)
        } else if (forwardedRef && typeof forwardedRef === 'object') {
          ;(forwardedRef as { current: HTMLCanvasElement | null }).current = node
        }
      },
      [forwardedRef],
    )

    const handleShareClick = useCallback(() => {
      void share(canvasRef.current)
    }, [share])

    const formatValueLabel = (label: string, data: Record<string, string>) =>
      label.replace(/\{(\w+)\}/g, (_, key) => {
        const token = key as keyof Record<string, string>
        return data[token] ?? ''
      })

    const isShareDisabled = !value || isSharing
    const shareStatusId = useId()
    const shareStatusMessage = (() => {
      if (!shareRequest) {
        return undefined
      }

      switch (shareRequest.status) {
        case 'pending':
          return translate('preview.shareStatusSharing')
        case 'shared':
          if (shareRequest.method === 'clipboard') {
            return translate('preview.shareStatusClipboard')
          }

          if (shareRequest.method === 'download') {
            return translate('preview.shareStatusDownloaded')
          }

          return translate('preview.shareStatusShared')
        case 'canceled':
          return translate('preview.shareStatusCanceled')
        case 'failed':
          return shareRequest.errorMessage ?? translate('preview.shareStatusFailed')
        default:
          return undefined
      }
    })()

    const shareButton = (
      <button
        type="button"
        data-testid="share-qr-button"
        disabled={isShareDisabled}
        aria-label={shareButtonLabel}
        aria-busy={isSharing}
        aria-disabled={isShareDisabled}
        aria-describedby={shareStatusMessage ? shareStatusId : undefined}
        onClick={handleShareClick}
        className={`w-full rounded-full px-4 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
          value
            ? 'border border-slate-900 bg-slate-900 text-white focus-visible:ring-slate-900'
            : 'border border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
        } ${isShareDisabled ? 'cursor-not-allowed opacity-70' : 'hover:bg-slate-800'} ${
          isSharing ? 'cursor-wait' : ''
        }`}
      >
        {shareButtonLabel}
      </button>
    )

    const shareStatusElement = shareStatusMessage ? (
      <p
        data-testid="share-status"
        role="status"
        aria-live="polite"
        id={shareStatusId}
        className="text-sm text-slate-500"
      >
        {shareStatusMessage}
      </p>
    ) : null

    const shareControls = (
      <div className="mt-4 w-full flex flex-col gap-2">
        {shareButton}
        {shareStatusElement}
      </div>
    )

    return (
      <div
        style={style}
        className={`flex flex-col items-center p-3 sm:p-4 bg-white rounded-lg shadow-sm border border-gray-200 w-full ${className ?? ''}`}
      >
        {!value ? (
          <div
            className="flex items-center justify-center bg-gray-100 text-gray-400 rounded-lg border-2 border-dashed border-gray-300"
            style={{ width: size, height: size }}
            role="img"
            aria-label={ariaPlaceholder}
          >
            <span className="text-sm">{placeholderCopy}</span>
          </div>
        ) : (
          <QRCodeCanvas
            ref={(node) => {
              canvasRef.current = node
              assignForwardedRef(node)
            }}
            value={value}
            size={size}
            level={ecLevel}
            fgColor={fgColor}
            bgColor={bgColor}
            marginSize={0}
            role="img"
            aria-label={formatValueLabel(ariaValueTemplate, { value })}
          />
        )}
        {shareControls}
      </div>
    )
  },
)

QRPreview.displayName = 'QRPreview'
