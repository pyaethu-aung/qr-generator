import { useId, useRef, useState } from 'react'
import { Layers, Package, Check, Palette, Upload, FileText, Columns3, ChevronDown } from 'lucide-react'
import { parseBatchFile } from '../../../utils/batch/parseBatchFile'
import { parseBatchCsv, type ParsedBatchCsv } from '../../../utils/batch/parseBatchCsv'

import { PillGroup } from '../../common/PillGroup'
import { Callout } from '../../common/Callout'
import { useBatchGenerator, type BatchOutput } from '../../../hooks/useBatchGenerator'
import {
  LABEL_SHEET_PRESETS,
  getLabelPreset,
  type LabelPresetId,
} from '../../../utils/batch/labelSheetLayout'
import { useLocaleContext } from '../../../hooks/LocaleProvider'

// File formats are proper nouns: identical across locales, so they aren't translated.
// "Labels" is a word, so it carries a translation key (filled in per-render below).
const BASE_FORMAT_OPTIONS: { value: BatchOutput; label: string }[] = [
  { value: 'png', label: 'PNG' },
  { value: 'svg', label: 'SVG' },
  { value: 'pdf', label: 'PDF' },
]

// Page name + grid dimensions read the same in every locale, so preset labels aren't
// translated, matching the format pills.
const LAYOUT_OPTIONS: { value: LabelPresetId; label: string }[] = LABEL_SHEET_PRESETS.map(
  (preset) => ({ value: preset.id, label: preset.label }),
)

/** Sentinel for the "no filename column" choice (files named automatically from the value). */
const NO_FILENAME_COLUMN = -1

/** Newline-joins the non-empty cells of one CSV column for the values textarea. */
function columnToText(grid: ParsedBatchCsv, col: number): string {
  return grid.rows
    .map((row) => row[col] ?? '')
    .filter((cell) => cell.length > 0)
    .join('\n')
}

/**
 * Builds the value→filename map for the chosen columns. Keyed by value (matching the
 * textarea's dedup, where the first occurrence wins), so a row whose value cell is blank,
 * or whose filename cell is blank, contributes no override. Returns `null` when no
 * filename column is selected.
 */
function buildFilenameOverrides(
  grid: ParsedBatchCsv,
  valueCol: number,
  filenameCol: number,
): Record<string, string> | null {
  if (filenameCol === NO_FILENAME_COLUMN) return null
  const map: Record<string, string> = {}
  for (const row of grid.rows) {
    const value = row[valueCol] ?? ''
    const name = row[filenameCol] ?? ''
    if (!value || !name || value in map) continue
    map[value] = name
  }
  return map
}

/** Styled native select for column pickers — accessible by default, no popover machinery. */
function ColumnSelect({
  label,
  value,
  onChange,
  children,
}: {
  label: string
  value: number
  onChange: (value: number) => void
  children: React.ReactNode
}) {
  const id = useId()
  return (
    <div className="flex-1 space-y-1.5">
      <label htmlFor={id} className="block text-xs font-medium text-text-secondary">
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full appearance-none rounded-lg border border-border-strong bg-surface-inset py-2 pl-3 pr-9 text-sm text-text-primary transition-colors focus-visible:border-focus-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring/25"
        >
          {children}
        </select>
        <ChevronDown
          size={15}
          aria-hidden
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary"
        />
      </div>
    </div>
  )
}

export function BatchGenerator() {
  const { translate } = useLocaleContext()
  const {
    input,
    setInput,
    format,
    setFormat,
    labelPreset,
    setLabelPreset,
    captions,
    setCaptions,
    setFilenameOverrides,
    values,
    truncated,
    status,
    progress,
    errorCode,
    generate,
    maxLines,
  } = useBatchGenerator()

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [importedFileName, setImportedFileName] = useState<string | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  // The parsed CSV grid drives the column-mapping UI; null when no multi-column CSV is active.
  const [csvGrid, setCsvGrid] = useState<ParsedBatchCsv | null>(null)
  const [valueCol, setValueCol] = useState(0)
  const [filenameCol, setFilenameCol] = useState(NO_FILENAME_COLUMN)

  // Leaving mapping mode (manual edit, .txt import, or a single-column CSV) clears the grid
  // and any filename overrides so stale mappings never apply to edited values.
  function clearMapping() {
    setCsvGrid(null)
    setValueCol(0)
    setFilenameCol(NO_FILENAME_COLUMN)
    setFilenameOverrides(null)
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''

    const name = file.name.toLowerCase()
    if (!name.endsWith('.txt') && !name.endsWith('.csv')) {
      setFileError(translate('batch.importErrorType'))
      setImportedFileName(null)
      return
    }

    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = ev.target?.result
      if (typeof text !== 'string') {
        setFileError(translate('batch.importErrorRead'))
        setImportedFileName(null)
        return
      }

      // A multi-column CSV opens the mapping UI; everything else (one-column CSV or .txt)
      // takes the simple first-column / pass-through path with no mapping.
      if (name.endsWith('.csv')) {
        const grid = parseBatchCsv(text)
        if (grid.headers.length >= 2 && grid.rows.length > 0) {
          const text0 = columnToText(grid, 0)
          if (!text0.trim()) {
            setFileError(translate('batch.importErrorEmpty'))
            setImportedFileName(null)
            return
          }
          setCsvGrid(grid)
          setValueCol(0)
          setFilenameCol(NO_FILENAME_COLUMN)
          setFilenameOverrides(null)
          setInput(text0)
          setFileError(null)
          setImportedFileName(file.name)
          return
        }
      }

      const parsed = parseBatchFile(file.name, text)
      if (!parsed.trim()) {
        setFileError(translate('batch.importErrorEmpty'))
        setImportedFileName(null)
        return
      }
      clearMapping()
      setInput(parsed)
      setFileError(null)
      setImportedFileName(file.name)
    }
    reader.onerror = () => {
      setFileError(translate('batch.importErrorRead'))
      setImportedFileName(null)
    }
    reader.readAsText(file)
  }

  function handleValueColChange(col: number) {
    if (!csvGrid) return
    setValueCol(col)
    setInput(columnToText(csvGrid, col))
    setFilenameOverrides(buildFilenameOverrides(csvGrid, col, filenameCol))
  }

  function handleFilenameColChange(col: number) {
    if (!csvGrid) return
    setFilenameCol(col)
    setFilenameOverrides(buildFilenameOverrides(csvGrid, valueCol, col))
  }

  const textareaId = useId()
  const formatLabelId = useId()
  const layoutLabelId = useId()
  const captionsLabelId = useId()
  const isGenerating = status === 'generating'
  const isLabels = format === 'labels'

  const formatOptions = [
    ...BASE_FORMAT_OPTIONS,
    { value: 'labels' as BatchOutput, label: translate('batch.formatLabelsOption') },
  ]
  const captionOptions = [
    { value: 'on', label: translate('batch.captionsOn') },
    { value: 'off', label: translate('batch.captionsOff') },
  ]
  const selectedPreset = getLabelPreset(labelPreset)
  const perPageHint = translate('batch.perPageHint').replace(
    '{count}',
    String(selectedPreset.columns * selectedPreset.rows),
  )
  const count = values.length
  const canGenerate = count > 0 && !isGenerating
  const percent = progress.total ? Math.round((progress.completed / progress.total) * 100) : 0

  const countLabel = translate('batch.countLabel')
    .replace('{count}', String(count))
    .replace('{max}', String(maxLines))
  const truncatedWarning = translate('batch.truncatedWarning').replace('{max}', String(maxLines))
  const generatingStatus = translate('batch.generatingStatus')
    .replace('{completed}', String(progress.completed))
    .replace('{total}', String(progress.total))

  return (
    <section className="relative isolate overflow-x-hidden px-2 pb-12 sm:px-6 lg:px-8">
      <div className="relative mx-auto max-w-xl space-y-3">
        <div className="text-center pt-10 pb-4 px-6 sm:px-12">
          <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-text-secondary">
            {translate('batch.sectionLabel')}
          </p>
          <h2 className="mt-1.5 text-2xl font-bold text-text-primary sm:text-4xl">
            {translate('batch.title')}
          </h2>
          <p className="mt-2 text-sm text-text-secondary">{translate('batch.subtitle')}</p>
        </div>

        <div className="rounded-xl border border-border-strong bg-surface-overlay p-6 sm:p-8 shadow-lg space-y-5">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <label htmlFor={textareaId} className="text-sm font-semibold text-text-primary">
                {translate('batch.inputLabel')}
              </label>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isGenerating}
                className="flex items-center gap-1.5 rounded-md border border-border-subtle bg-surface-raised px-2.5 py-1 text-xs font-semibold text-text-secondary transition-colors hover:bg-surface-inset hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-1"
              >
                <Upload size={12} aria-hidden className="shrink-0" />
                {translate('batch.importButton')}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.csv"
                className="sr-only"
                aria-hidden="true"
                tabIndex={-1}
                onChange={handleFileChange}
              />
            </div>
            <textarea
              id={textareaId}
              value={input}
              onChange={(e) => {
                setInput(e.target.value)
                setImportedFileName(null)
                setFileError(null)
                clearMapping()
              }}
              disabled={isGenerating}
              rows={9}
              spellCheck={false}
              autoCapitalize="none"
              autoCorrect="off"
              placeholder={translate('batch.inputPlaceholder')}
              className="w-full resize-y rounded-lg border border-border-strong bg-surface-inset p-3 font-['Geist_Mono'] text-sm text-text-primary placeholder:text-text-disabled transition-colors focus-visible:border-focus-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring/25 disabled:opacity-50"
            />
            {fileError ? (
              <p className="flex items-center gap-1.5 text-xs text-error" role="alert">
                {fileError}
              </p>
            ) : importedFileName ? (
              <p className="flex items-center gap-1.5 text-xs text-text-secondary" aria-live="polite">
                <FileText size={12} aria-hidden className="shrink-0 text-action" />
                {translate('batch.importedFile').replace('{filename}', importedFileName)}
              </p>
            ) : (
              <p
                className={`text-xs ${count > 0 ? 'text-text-secondary' : 'text-text-disabled'}`}
                aria-live="polite"
              >
                {count > 0 ? countLabel : translate('batch.emptyHint')}
              </p>
            )}
          </div>

          {csvGrid && (
            <div className="space-y-3 rounded-lg border border-border-subtle bg-surface-raised p-4">
              <p className="flex items-center gap-1.5 text-sm font-semibold text-text-primary">
                <Columns3 size={15} aria-hidden className="shrink-0 text-action" />
                {translate('batch.csvMapTitle')}
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <ColumnSelect
                  label={translate('batch.csvMapValueLabel')}
                  value={valueCol}
                  onChange={handleValueColChange}
                >
                  {csvGrid.headers.map((header, i) => (
                    <option key={i} value={i}>
                      {header || `Column ${i + 1}`}
                    </option>
                  ))}
                </ColumnSelect>
                {!isLabels && (
                  <ColumnSelect
                    label={translate('batch.csvMapFilenameLabel')}
                    value={filenameCol}
                    onChange={handleFilenameColChange}
                  >
                    <option value={NO_FILENAME_COLUMN}>
                      {translate('batch.csvMapFilenameNone')}
                    </option>
                    {csvGrid.headers.map((header, i) => (
                      <option key={i} value={i}>
                        {header || `Column ${i + 1}`}
                      </option>
                    ))}
                  </ColumnSelect>
                )}
              </div>
              {!isLabels && (
                <p className="text-xs text-text-secondary">{translate('batch.csvMapHint')}</p>
              )}
            </div>
          )}

          {truncated && <Callout role="status">{truncatedWarning}</Callout>}

          <div className="space-y-2">
            <p id={formatLabelId} className="text-sm font-semibold text-text-primary">
              {translate('batch.formatLabel')}
            </p>
            <PillGroup<BatchOutput>
              aria-labelledby={formatLabelId}
              value={format}
              onChange={setFormat}
              options={formatOptions}
            />
          </div>

          {isLabels && (
            <div className="space-y-5">
              <div className="space-y-2">
                <p id={layoutLabelId} className="text-sm font-semibold text-text-primary">
                  {translate('batch.layoutLabel')}
                </p>
                <PillGroup<LabelPresetId>
                  aria-labelledby={layoutLabelId}
                  value={labelPreset}
                  onChange={setLabelPreset}
                  options={LAYOUT_OPTIONS}
                />
                <p className="text-xs text-text-secondary" aria-live="polite">
                  {perPageHint}
                </p>
              </div>

              <div className="space-y-2">
                <p id={captionsLabelId} className="text-sm font-semibold text-text-primary">
                  {translate('batch.captionsLabel')}
                </p>
                <PillGroup
                  aria-labelledby={captionsLabelId}
                  value={captions ? 'on' : 'off'}
                  onChange={(value) => setCaptions(value === 'on')}
                  options={captionOptions}
                />
              </div>
            </div>
          )}

          <p className="flex items-center gap-2 text-xs text-text-secondary">
            <Palette size={14} aria-hidden className="shrink-0" />
            <span>{translate('batch.designNote')}</span>
          </p>

          <button
            type="button"
            onClick={() => void generate()}
            disabled={!canGenerate}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-action px-6 text-sm font-semibold text-action-fg shadow-sm transition-colors hover:bg-action/90 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2"
          >
            {isGenerating ? (
              <>
                <Layers size={16} aria-hidden className="motion-safe:animate-pulse shrink-0" />
                <span>{generatingStatus}</span>
              </>
            ) : (
              <>
                <Package size={16} aria-hidden className="shrink-0" />
                <span>
                  {translate(isLabels ? 'batch.generateLabels' : 'batch.generateButton')}
                </span>
              </>
            )}
          </button>

          {isGenerating && (
            <div className="space-y-1.5">
              <div
                className="h-2 w-full overflow-hidden rounded-full bg-surface-inset"
                role="progressbar"
                aria-valuenow={percent}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={generatingStatus}
              >
                <div
                  className="h-full rounded-full bg-action transition-[width] duration-150 ease-out"
                  style={{ width: `${percent}%` }}
                />
              </div>
              <p role="status" aria-live="polite" className="text-center text-xs text-text-secondary">
                {generatingStatus}
              </p>
            </div>
          )}

          {status === 'success' && (
            <p
              role="status"
              aria-live="polite"
              className="flex items-center justify-center gap-1.5 text-sm font-medium text-action"
            >
              <Check size={15} aria-hidden className="shrink-0" />
              <span>
                {translate(isLabels ? 'batch.successStatusLabels' : 'batch.successStatus')}
              </span>
            </p>
          )}

          {status === 'error' && errorCode && (
            <Callout role="alert">
              {translate(errorCode === 'empty' ? 'batch.errorEmpty' : 'batch.errorRender')}
            </Callout>
          )}
        </div>
      </div>
    </section>
  )
}

export default BatchGenerator
