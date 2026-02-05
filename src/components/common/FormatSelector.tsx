/**
 * FormatSelector component for choosing export format.
 *
 * @why Radio group pattern for mutually exclusive selection with proper
 * ARIA attributes per web-design-guidelines.
 */

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

/**
 * Format selector with radio group semantics.
 *
 * @why Using role="radiogroup" with aria-label for screen reader accessibility.
 * Visual checkmark indicator for selected state.
 */
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
        className="block text-sm font-semibold text-slate-900 dark:text-white mb-3"
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
              className={`w-full px-4 py-3 text-left rounded-lg border-2 transition-all ${
                isSelected
                  ? 'border-slate-900 dark:border-sky-500 bg-slate-50 dark:bg-sky-900/20'
                  : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-900'
              } ${
                disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-slate-900 dark:text-white uppercase">
                      {format}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {config.mimeType}
                    </span>
                  </div>
                  <p
                    id={`format-desc-${format}`}
                    className="text-xs text-slate-600 dark:text-slate-400"
                  >
                    {formatDescriptions[format]}
                  </p>
                </div>
                {/* Selected indicator */}
                {isSelected && (
                  <svg
                    className="w-5 h-5 text-slate-900 dark:text-sky-500 flex-shrink-0"
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
