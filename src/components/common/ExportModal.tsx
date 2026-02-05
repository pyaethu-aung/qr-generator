/**
 * ExportModal component for QR code export configuration.
 *
 * @why Following web-design-guidelines for accessibility:
 * - Focus trap inside modal
 * - Escape key to close
 * - ARIA attributes for screen readers
 * - Backdrop click to close
 */

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

/**
 * Export modal with focus trap and keyboard navigation.
 *
 * @why Portal ensures modal renders above all other content.
 * Ref tracking enables focus management for accessibility.
 */
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

  // Save focus on mount, restore on unmount for accessibility
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement
      // Focus first interactive element in modal
      const firstButton = modalRef.current?.querySelector('button')
      firstButton?.focus()
    } else if (previousFocusRef.current) {
      previousFocusRef.current.focus()
    }
  }, [isOpen])

  // Trap focus inside modal
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
        className="relative w-full max-w-md mx-4 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 p-6 transition-all duration-300"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2
            id="export-modal-title"
            className="text-xl font-semibold text-slate-900 dark:text-white"
          >
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={isExporting}
            aria-label="Close modal"
            className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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

        {/* Error display */}
        {error && (
          <div
            role="alert"
            className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 rounded-lg text-sm text-red-700 dark:text-red-400"
          >
            {error}
          </div>
        )}

        {/* Format Selector */}
        <div className="mb-6">
          <FormatSelector
            selected={format}
            onChange={onFormatChange}
            disabled={isExporting}
            formatLabels={formatLabels}
            formatDescriptions={formatDescriptions}
          />
        </div>

        {/* Dimension Selector */}
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

        {/* Actions */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isExporting}
            className="flex-1 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cancelButtonLabel}
          </button>
          <button
            type="button"
            onClick={onExport}
            disabled={isExporting}
            className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-slate-900 dark:bg-sky-600 rounded-lg hover:bg-slate-800 dark:hover:bg-sky-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
