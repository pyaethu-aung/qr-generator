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
            className="block text-sm font-semibold text-text-primary mb-3"
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
                  className={`px-4 py-3 text-center rounded-lg border-2 ${isSelected
                    ? 'border-action bg-action/10'
                    : 'border-border-strong bg-surface-raised hover:border-action/60'
                    } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                    } focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2`}
                >
                  <div className="text-base font-semibold text-text-primary">
                    {preset.label}
                  </div>
                  <div className="text-xs text-text-secondary mt-1">
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
            className="block text-sm font-semibold text-text-primary mb-3"
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
                  className={`px-3 py-2.5 text-center rounded-lg border-2 ${isSelected
                    ? 'border-action bg-action/10'
                    : 'border-border-strong bg-surface-raised hover:border-action/60'
                    } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                    } focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2`}
                >
                  <div className="text-sm font-semibold text-text-primary">
                    {preset.label}
                  </div>
                  <div className="text-xs text-text-secondary mt-0.5">
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
