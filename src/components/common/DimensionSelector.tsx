/**
 * DimensionSelector component for choosing export dimensions and DPI.
 *
 * @why Provides preset dimensions for consistent output sizes.
 * DPI selector only shown for PDF format (affects print quality).
 */

import type { DimensionPreset, DpiPreset, ExportFormat } from '../../types/export'
import { DIMENSION_PRESETS, DPI_PRESETS } from '../../types/export'

export interface DimensionSelectorProps {
  dimension: DimensionPreset
  dpi: DpiPreset
  format: ExportFormat
  onDimensionChange: (dimension: DimensionPreset) => void
  onDpiChange: (dpi: DpiPreset) => void
  disabled?: boolean
  dimensionLabel: string
  dpiLabel: string
}

/**
 * Dimension and DPI selector with preset buttons.
 *
 * @why Button group pattern for mutually exclusive selection.
 * DPI only relevant for PDF format (affects print size).
 */
export function DimensionSelector({
  dimension,
  dpi,
  format,
  onDimensionChange,
  onDpiChange,
  disabled = false,
  dimensionLabel,
  dpiLabel,
}: DimensionSelectorProps) {
  return (
    <div className="space-y-4">
      {/* Dimension presets - hide for SVG (resolution-independent) */}
      {format !== 'svg' && (
      <div>
        <label
          id="dimension-label"
          className="block text-sm font-semibold text-slate-900 dark:text-white mb-3"
        >
          {dimensionLabel}
        </label>
        <div
          role="group"
          aria-labelledby="dimension-label"
          className="grid grid-cols-3 gap-2"
        >
          {DIMENSION_PRESETS.map((preset) => {
            const isSelected = dimension === preset.value

            return (
              <button
                key={preset.value}
                type="button"
                onClick={() => onDimensionChange(preset.value)}
                disabled={disabled}
                aria-label={`${preset.label} - ${preset.description}`}
                className={`px-4 py-3 text-center rounded-lg border-2 transition-all ${
                  isSelected
                    ? 'border-slate-900 dark:border-sky-500 bg-slate-50 dark:bg-sky-900/20'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-900'
                } ${
                  disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                }`}
              >
                <div className="text-base font-semibold text-slate-900 dark:text-white">
                  {preset.label}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {preset.description}
                </div>
              </button>
            )
          })}
        </div>
      </div>
      )}

      {/* DPI selector - only for PDF */}
      {format === 'pdf' && (
        <div>
          <label
            id="dpi-label"
            className="block text-sm font-semibold text-slate-900 dark:text-white mb-3"
          >
            {dpiLabel}
          </label>
          <div
            role="group"
            aria-labelledby="dpi-label"
            className="grid grid-cols-3 gap-2"
          >
            {DPI_PRESETS.map((preset) => {
              const isSelected = dpi === preset.value

              return (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => onDpiChange(preset.value)}
                  disabled={disabled}
                  aria-label={`${preset.label} - ${preset.description}`}
                  className={`px-3 py-2.5 text-center rounded-lg border-2 transition-all ${
                    isSelected
                      ? 'border-slate-900 dark:border-sky-500 bg-slate-50 dark:bg-sky-900/20'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-900'
                  } ${
                    disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                  }`}
                >
                  <div className="text-sm font-semibold text-slate-900 dark:text-white">
                    {preset.label}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {preset.description}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
