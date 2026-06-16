import { useId } from 'react'
import { Layers, Package, Check, Palette } from 'lucide-react'

import { PillGroup } from '../../common/PillGroup'
import { Callout } from '../../common/Callout'
import { useBatchGenerator } from '../../../hooks/useBatchGenerator'
import type { BatchFormat } from '../../../utils/batch/buildBatchZip'
import { useLocaleContext } from '../../../hooks/LocaleProvider'

// QR file formats are proper nouns: identical across locales, so they aren't translated.
const FORMAT_OPTIONS: { value: BatchFormat; label: string }[] = [
  { value: 'png', label: 'PNG' },
  { value: 'svg', label: 'SVG' },
  { value: 'pdf', label: 'PDF' },
]

export function BatchGenerator() {
  const { translate } = useLocaleContext()
  const {
    input,
    setInput,
    format,
    setFormat,
    values,
    truncated,
    status,
    progress,
    errorCode,
    generate,
    maxLines,
  } = useBatchGenerator()

  const textareaId = useId()
  const formatLabelId = useId()
  const isGenerating = status === 'generating'
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
            <label htmlFor={textareaId} className="block text-sm font-semibold text-text-primary">
              {translate('batch.inputLabel')}
            </label>
            <textarea
              id={textareaId}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isGenerating}
              rows={9}
              spellCheck={false}
              autoCapitalize="none"
              autoCorrect="off"
              placeholder={translate('batch.inputPlaceholder')}
              className="w-full resize-y rounded-lg border border-border-strong bg-surface-inset p-3 font-['Geist_Mono'] text-sm text-text-primary placeholder:text-text-disabled transition-colors focus-visible:border-focus-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring/25 disabled:opacity-50"
            />
            <p
              className={`text-xs ${count > 0 ? 'text-text-secondary' : 'text-text-disabled'}`}
              aria-live="polite"
            >
              {count > 0 ? countLabel : translate('batch.emptyHint')}
            </p>
          </div>

          {truncated && <Callout role="status">{truncatedWarning}</Callout>}

          <div className="space-y-2">
            <p id={formatLabelId} className="text-sm font-semibold text-text-primary">
              {translate('batch.formatLabel')}
            </p>
            <PillGroup<BatchFormat>
              aria-labelledby={formatLabelId}
              value={format}
              onChange={setFormat}
              options={FORMAT_OPTIONS}
            />
          </div>

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
                <span>{translate('batch.generateButton')}</span>
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
              <span>{translate('batch.successStatus')}</span>
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
