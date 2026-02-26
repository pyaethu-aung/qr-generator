import type { ExportFormat } from '../../types/export'
import { FORMAT_CONFIGS } from '../../types/export'

export interface FormatSelectorProps {
  selected: ExportFormat
  onChange: (format: ExportFormat) => void
  disabled?: boolean
  formatLabels: Record<ExportFormat, string>
  formatDescriptions: Record<ExportFormat, string>
}

const FORMAT_OPTIONS: ExportFormat[] = ['png', 'svg', 'pdf']

export function FormatSelector({
  selected,
  onChange,
  disabled = false,
  formatLabels,
  formatDescriptions,
}: FormatSelectorProps) {
  return (
    <div>
      <label
        id="format-selector-label"
        className="block text-sm font-semibold text-text-primary mb-3"
      >
        {formatLabels[selected]} Format
      </label>
      <div
        role="radiogroup"
        aria-labelledby="format-selector-label"
        className="space-y-2"
      >
        {FORMAT_OPTIONS.map((format) => {
          const isSelected = selected === format
          const config = FORMAT_CONFIGS[format]

          return (
            <button
              key={format}
              type="button"
              role="radio"
              aria-checked={isSelected}
              aria-describedby={`format-desc-${format}`}
              onClick={() => onChange(format)}
              disabled={disabled}
              className={`w-full px-4 py-3 text-left rounded-lg border-2 transition-all ${isSelected
                ? 'border-action bg-action/10'
                : 'border-border-strong bg-surface-raised hover:border-action/60'
                } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                } focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-text-primary uppercase">
                      {format}
                    </span>
                    <span className="text-xs text-text-secondary">
                      {config.mimeType}
                    </span>
                  </div>
                  <p
                    id={`format-desc-${format}`}
                    className="text-xs text-text-secondary"
                  >
                    {formatDescriptions[format]}
                  </p>
                </div>
                {/* Selected indicator */}
                {isSelected && (
                  <svg
                    className="w-5 h-5 text-action flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
