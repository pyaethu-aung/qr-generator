import { useEffect, useRef, useCallback, type KeyboardEvent } from 'react'
import { createPortal } from 'react-dom'
import type { ExportFormat, DimensionPreset, DpiPreset } from '../../types/export'
import { FormatSelector } from './FormatSelector'
import { DimensionSelector } from './DimensionSelector'

export interface ExportModalProps {
  isOpen: boolean
  format: ExportFormat
  dimension: DimensionPreset
  dpi: DpiPreset
  isExporting: boolean
  error: string | null
  onClose: () => void
  onFormatChange: (format: ExportFormat) => void
  onDimensionChange: (dimension: DimensionPreset) => void
  onDpiChange: (dpi: DpiPreset) => void
  onExport: () => void
  title: string
  exportButtonLabel: string
  cancelButtonLabel: string
  dimensionLabel: string
  dpiLabel: string
  formatLabels: Record<ExportFormat, string>
  formatDescriptions: Record<ExportFormat, string>
}

export function ExportModal({
  isOpen,
  format,
  dimension,
  dpi,
  isExporting,
  error,
  onClose,
  onFormatChange,
  onDimensionChange,
  onDpiChange,
  onExport,
  title,
  exportButtonLabel,
  cancelButtonLabel,
  dimensionLabel,
  dpiLabel,
  formatLabels,
  formatDescriptions,
}: ExportModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement
      const firstButton = modalRef.current?.querySelector('button')
      firstButton?.focus()
    } else if (previousFocusRef.current) {
      previousFocusRef.current.focus()
    }
  }, [isOpen])

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'Escape' && !isExporting) {
        onClose()
      }

      if (event.key === 'Tab') {
        const focusableElements = modalRef.current?.querySelectorAll(
          'button:not([disabled]), input:not([disabled]), select:not([disabled])',
        )
        if (!focusableElements || focusableElements.length === 0) return

        const firstElement = focusableElements[0] as HTMLElement
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

        if (event.shiftKey && document.activeElement === firstElement) {
          event.preventDefault()
          lastElement.focus()
        } else if (!event.shiftKey && document.activeElement === lastElement) {
          event.preventDefault()
          firstElement.focus()
        }
      }
    },
    [isExporting, onClose],
  )

  const handleBackdropClick = useCallback(() => {
    if (!isExporting) {
      onClose()
    }
  }, [isExporting, onClose])

  if (!isOpen) return null

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity duration-300"
      role="dialog"
      aria-modal="true"
      aria-labelledby="export-modal-title"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-md mx-4 bg-surface-raised rounded-2xl shadow-2xl border border-border-strong p-6"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        <div className="flex items-center justify-between mb-6">
          <h2
            id="export-modal-title"
            className="text-xl font-semibold text-text-primary"
          >
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={isExporting}
            aria-label="Close modal"
            className="p-2 text-text-secondary hover:text-text-primary rounded-lg hover:bg-surface-inset disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="sr-only"
        >
          {isExporting && 'Exporting QR code, please wait...'}
          {!isExporting && error && `Export failed: ${error}`}
        </div>

        {error && (
          <div
            role="alert"
            className="mb-4 p-3 bg-error-surface border border-error-border rounded-lg text-sm text-error"
          >
            {error}
          </div>
        )}

        <div className="mb-6">
          <FormatSelector
            selected={format}
            onChange={onFormatChange}
            disabled={isExporting}
            formatLabels={formatLabels}
            formatDescriptions={formatDescriptions}
          />
        </div>

        <div className="mb-6">
          <DimensionSelector
            dimension={dimension}
            dpi={dpi}
            format={format}
            onDimensionChange={onDimensionChange}
            onDpiChange={onDpiChange}
            disabled={isExporting}
            dimensionLabel={dimensionLabel}
            dpiLabel={dpiLabel}
          />
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isExporting}
            className="flex-1 px-4 py-2.5 text-sm font-semibold text-text-primary bg-surface-inset rounded-lg hover:bg-surface-inset/80 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cancelButtonLabel}
          </button>
          <button
            type="button"
            onClick={onExport}
            disabled={isExporting}
            className="flex-1 px-4 py-2.5 text-sm font-semibold text-action-fg bg-action rounded-lg hover:bg-action/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isExporting ? (
              <>
                <svg
                  className="animate-spin h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>Exporting...</span>
              </>
            ) : (
              exportButtonLabel
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
