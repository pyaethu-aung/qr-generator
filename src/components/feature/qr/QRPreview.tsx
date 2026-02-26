import { useRef, useCallback, useId, forwardRef } from 'react'
import { QRCodeCanvas } from 'qrcode.react'
import { useLocaleContext } from '../../../hooks/LocaleProvider'
import { useQRShare } from '../../../hooks/useQRShare'
import { useExportState } from '../../../hooks/useExportState'
import { exportPng } from '../../../utils/export/pngExporter'
import { exportSvg } from '../../../utils/export/svgExporter'
import { exportPdf } from '../../../utils/export/pdfExporter'
import { downloadBlob } from '../../../utils/download'
import { generateFilename } from '../../../utils/export/exportCalculations'
import { ExportModal } from '../../common/ExportModal'
import type { QRConfig } from '../../../types/qr'
import type { TranslationKey } from '../../../types/i18n'

export interface QRPreviewProps extends QRConfig {
  className?: string
  style?: React.CSSProperties
}

export const QRPreview = forwardRef<HTMLCanvasElement, QRPreviewProps>(
  ({ value, ecLevel, fgColor, bgColor, size = 256, className, style }, forwardedRef) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null)
    const { translate } = useLocaleContext()
    const { share, isSharing, shareRequest } = useQRShare()
    const { state: exportState, openModal, closeModal, setFormat, setDimension, setDpi, startExport, exportSuccess, exportError } = useExportState()

    const ariaPlaceholder = translate('preview.ariaPlaceholder')
    const ariaValueTemplate = translate('preview.ariaValue')
    const shareButtonLabel = translate('preview.shareButtonLabel')
    const placeholderCopy = translate('preview.placeholder')

    const handleExport = useCallback(async () => {
      if (!value) return

      try {
        startExport()

        if (exportState.format === 'png') {
          if (!canvasRef.current) throw new Error('Canvas not ready')
          const blob = await exportPng(canvasRef.current, exportState.dimension)
          const filename = generateFilename('png', 'qrcode', exportState.dimension)
          downloadBlob(blob, filename)
          exportSuccess()
          setTimeout(() => closeModal(), 500)
        } else if (exportState.format === 'svg') {
          const blob = await exportSvg(value, {
            value,
            ecLevel,
            fgColor,
            bgColor,
            margin: 0,
          })
          const filename = generateFilename('svg', 'qrcode')
          downloadBlob(blob, filename)
          exportSuccess()
          setTimeout(() => closeModal(), 500)
        } else if (exportState.format === 'pdf') {
          const blob = await exportPdf(value, {
            value,
            ecLevel,
            fgColor,
            bgColor,
            margin: 0,
            dpi: exportState.dpi,
            dimension: exportState.dimension,
          })
          const filename = generateFilename('pdf', 'qrcode', exportState.dimension, exportState.dpi)
          downloadBlob(blob, filename)
          exportSuccess()
          setTimeout(() => closeModal(), 500)
        }
      } catch (error) {
        exportError(
          error instanceof Error ? error.message : translate('preview.shareStatusFailed'),
        )
      }
    }, [exportState.format, exportState.dimension, exportState.dpi, value, ecLevel, fgColor, bgColor, translate, startExport, exportSuccess, exportError, closeModal])

    const assignForwardedRef = useCallback(
      (node: HTMLCanvasElement | null) => {
        if (typeof forwardedRef === 'function') {
          forwardedRef(node)
        } else if (forwardedRef && typeof forwardedRef === 'object') {
          ; (forwardedRef as { current: HTMLCanvasElement | null }).current = node
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
    const isDownloadDisabled = !value || exportState.isExporting
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

    const downloadButton = (
      <button
        type="button"
        data-testid="download-qr-button"
        disabled={isDownloadDisabled}
        aria-label={translate('controls.downloadPng' as TranslationKey)}
        onClick={openModal}
        className={`w-full rounded-full px-4 py-2 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${value
          ? 'border border-border-strong bg-transparent text-text-primary focus-visible:ring-focus-ring hover:bg-action hover:text-action-fg'
          : 'border border-border-subtle bg-surface-inset text-text-disabled cursor-not-allowed'
          } ${isDownloadDisabled ? 'cursor-not-allowed opacity-70' : ''}`}
      >
        {translate('controls.downloadPng' as TranslationKey)}
      </button>
    )

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
        className={`w-full rounded-full px-4 py-2 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${value
          ? 'border border-action bg-action text-action-fg focus-visible:ring-focus-ring hover:bg-action/90'
          : 'border border-border-subtle bg-surface-inset text-text-disabled cursor-not-allowed'
          } ${isShareDisabled ? 'cursor-not-allowed opacity-70' : ''} ${isSharing ? 'cursor-wait' : ''
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
        className="text-sm text-text-secondary"
      >
        {shareStatusMessage}
      </p>
    ) : null

    const shareControls = (
      <div className="mt-4 w-full flex flex-col gap-2">
        <div className="grid grid-cols-2 gap-2">
          {downloadButton}
          {shareButton}
        </div>
        {shareStatusElement}
      </div>
    )

    return (
      <>
        <div
          style={style}
          className={`flex flex-col items-center p-3 sm:p-4 bg-surface-raised rounded-lg shadow-sm border border-border-strong w-full ${className ?? ''}`}
        >
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

        <ExportModal
          isOpen={exportState.isOpen}
          format={exportState.format}
          dimension={exportState.dimension}
          dpi={exportState.dpi}
          isExporting={exportState.isExporting}
          error={exportState.error}
          onClose={closeModal}
          onFormatChange={setFormat}
          onDimensionChange={setDimension}
          onDpiChange={setDpi}
          onExport={() => void handleExport()}
          title={translate('controls.downloadsTitle' as TranslationKey)}
          exportButtonLabel={translate('controls.generate' as TranslationKey)}
          cancelButtonLabel={translate('locale.toggleLabel' as TranslationKey)}
          dimensionLabel={translate('controls.correctionLabel' as TranslationKey)}
          dpiLabel={translate('controls.correctionLabel' as TranslationKey)}
          formatLabels={{
            png: translate('controls.downloadPng' as TranslationKey),
            svg: translate('controls.downloadSvg' as TranslationKey),
            pdf: translate('controls.downloadPng' as TranslationKey),
          }}
          formatDescriptions={{
            png: translate('controls.downloadPng' as TranslationKey),
            svg: translate('controls.downloadSvg' as TranslationKey),
            pdf: translate('controls.downloadPng' as TranslationKey),
          }}
        />
      </>
    )
  },
)

QRPreview.displayName = 'QRPreview'
