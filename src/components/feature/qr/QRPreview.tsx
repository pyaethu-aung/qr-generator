import { useRef, useCallback, useId, forwardRef } from 'react'
import { Share2 } from 'lucide-react'

import { useLocaleContext } from '../../../hooks/LocaleProvider'
import { useQRShare } from '../../../hooks/useQRShare'
import { generateQRPaths } from '../../../utils/qrShapeRenderer'
import type { QRConfig, QRDesignConfig } from '../../../types/qr'

export interface QRPreviewProps extends QRConfig {
  designConfig?: QRDesignConfig
  className?: string
  style?: React.CSSProperties
}

export const QRPreview = forwardRef<HTMLCanvasElement, QRPreviewProps>(
  ({ value, ecLevel, fgColor, bgColor, size = 220, designConfig = { eyeShape: 'Square', pixelPattern: 'Square' }, className, style }, forwardedRef) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null)
    const { translate } = useLocaleContext()
    const { share, isSharing, shareRequest } = useQRShare()

    const ariaPlaceholder = translate('preview.ariaPlaceholder')
    const ariaValueTemplate = translate('preview.ariaValue')
    const shareButtonLabel = translate('preview.shareButtonLabel')
    const placeholderCopy = translate('preview.placeholder')

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
      if (!shareRequest) return undefined
      switch (shareRequest.status) {
        case 'pending':
          return translate('preview.shareStatusSharing')
        case 'shared':
          if (shareRequest.method === 'clipboard') return translate('preview.shareStatusClipboard')
          if (shareRequest.method === 'download') return translate('preview.shareStatusDownloaded')
          return translate('preview.shareStatusShared')
        case 'canceled':
          return translate('preview.shareStatusCanceled')
        case 'failed':
          return shareRequest.errorMessage ?? translate('preview.shareStatusFailed')
        default:
          return undefined
      }
    })()

    return (
      <div className={`flex flex-col gap-4 ${className ?? ''}`} style={style}>
        {/* Tall inset preview box */}
        <div className="flex items-center justify-center md:h-[536px] rounded-lg border border-border-subtle bg-surface-inset">
          {!value ? (
            <div
              className="flex items-center justify-center bg-surface-inset text-text-disabled rounded-lg border-2 border-dashed border-border-subtle"
              style={{ width: size, height: size }}
              role="img"
              aria-label={ariaPlaceholder}
            >
              <span className="text-sm">{placeholderCopy}</span>
            </div>
          ) : (
            <div className="rounded-lg bg-white p-4">
              <canvas
                ref={(node) => {
                  canvasRef.current = node
                  assignForwardedRef(node)

                  if (node && value) {
                    const ctx = node.getContext('2d')
                    if (ctx) {
                      const { dataPath, eyesPath, size: matrixSize } = generateQRPaths(
                        value,
                        ecLevel,
                        designConfig.eyeShape,
                        designConfig.pixelPattern,
                      )
                      const viewBoxSize = matrixSize * 10
                      const svgString = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${viewBoxSize} ${viewBoxSize}" width="${size}" height="${size}">
                        <rect width="100%" height="100%" fill="${bgColor}" />
                        <path d="${dataPath}" fill="${fgColor}" shape-rendering="crispEdges" />
                        <path d="${eyesPath}" fill="${fgColor}" fill-rule="evenodd" />
                      </svg>`

                      const img = new Image()
                      img.onload = () => {
                        ctx.clearRect(0, 0, size, size)
                        ctx.drawImage(img, 0, 0, size, size)
                      }
                      img.src = 'data:image/svg+xml;utf8,' + encodeURIComponent(svgString)
                    }
                  }
                }}
                data-testid="qr-code-canvas"
                data-value={value}
                data-fg={fgColor}
                data-bg={bgColor}
                width={size}
                height={size}
                role="img"
                aria-label={formatValueLabel(ariaValueTemplate, { value })}
              />
            </div>
          )}
        </div>

        {/* Share button below the inset box */}
        <button
          type="button"
          data-testid="share-qr-button"
          disabled={isShareDisabled}
          aria-label={shareButtonLabel}
          aria-busy={isSharing}
          aria-disabled={isShareDisabled}
          aria-describedby={shareStatusMessage ? shareStatusId : undefined}
          onClick={handleShareClick}
          className={`flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
            value
              ? 'border-border-subtle bg-surface-raised text-text-primary focus-visible:ring-focus-ring hover:bg-surface-inset'
              : 'border-border-subtle bg-surface-inset text-text-disabled cursor-not-allowed'
          } ${isShareDisabled ? 'cursor-not-allowed opacity-70' : ''} ${isSharing ? 'cursor-wait' : ''}`}
        >
          <Share2 size={18} aria-hidden />
          {shareButtonLabel}
        </button>

        {shareStatusMessage && (
          <p
            data-testid="share-status"
            role="status"
            aria-live="polite"
            id={shareStatusId}
            className="text-sm text-text-secondary"
          >
            {shareStatusMessage}
          </p>
        )}
      </div>
    )
  },
)

QRPreview.displayName = 'QRPreview'
