import { useState, useId, useMemo } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { Input } from '../../common/Input'
import { Callout } from '../../common/Callout'
import { useLocaleContext } from '../../../hooks/LocaleProvider'
import { buildVEventString, isEndBeforeStart, VEVENT_PAYLOAD_WARN } from '../../../utils/vevent'
import type { VEventConfig } from '../../../types/qr'

interface VEventFormProps {
  config: VEventConfig
  onSummaryChange: (v: string) => void
  onStartChange: (v: string) => void
  onEndChange: (v: string) => void
  onAllDayChange: (v: boolean) => void
  onLocationChange: (v: string) => void
  onDescriptionChange: (v: string) => void
}

/**
 * Calendar event (vEvent) form: title plus start/end, with all-day switching the
 * native pickers from datetime-local to date. Native inputs are deliberate — the
 * platform's own date picker (especially on phones) beats any custom calendar for
 * this audience. The end field is optional; when present it must not precede the
 * start, enforced both by the picker's `min` and by an inline error for values
 * typed past it. Description mirrors the email form's collapsible optional block,
 * including its long-payload warning, so the two modes feel like one tool.
 */
export function VEventForm({
  config,
  onSummaryChange,
  onStartChange,
  onEndChange,
  onAllDayChange,
  onLocationChange,
  onDescriptionChange,
}: VEventFormProps) {
  const { translate } = useLocaleContext()
  const hintId = useId()
  const allDayCheckboxId = useId()
  const descriptionId = useId()
  const descriptionToggleId = useId()
  const descriptionRegionId = useId()
  // Starts open when a description already exists, but the user can still
  // collapse it afterwards — the content is kept in state, only hidden.
  const [descriptionOpen, setDescriptionOpen] = useState(!!config.description)

  const endError = isEndBeforeStart(config)

  const payloadLength = useMemo(() => buildVEventString(config).length, [config])
  const isPayloadLong = payloadLength > VEVENT_PAYLOAD_WARN

  return (
    <div className="flex flex-col gap-4">
      <p id={hintId} className="text-xs text-text-secondary">
        {translate('controls.veventModeHint')}
      </p>

      <Input
        label={translate('controls.veventSummaryLabel')}
        placeholder={translate('controls.veventSummaryPlaceholder')}
        aria-describedby={hintId}
        value={config.summary}
        onChange={(e) => onSummaryChange(e.target.value)}
        autoComplete="off"
        required
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label={translate('controls.veventStartLabel')}
          type={config.allDay ? 'date' : 'datetime-local'}
          value={config.start}
          onChange={(e) => onStartChange(e.target.value)}
          required
        />
        <Input
          label={translate('controls.veventEndLabel')}
          type={config.allDay ? 'date' : 'datetime-local'}
          value={config.end}
          onChange={(e) => onEndChange(e.target.value)}
          min={config.start || undefined}
          error={endError ? translate('controls.veventEndError') : undefined}
        />
      </div>

      <div className="flex items-center gap-2.5">
        <input
          id={allDayCheckboxId}
          type="checkbox"
          checked={config.allDay}
          onChange={(e) => onAllDayChange(e.target.checked)}
          className="h-4 w-4 rounded border-border-strong accent-action cursor-pointer"
        />
        <label
          htmlFor={allDayCheckboxId}
          className="flex min-h-[44px] items-center text-sm text-text-primary cursor-pointer select-none"
        >
          {translate('controls.veventAllDayLabel')}
        </label>
      </div>

      <Input
        label={translate('controls.veventLocationLabel')}
        placeholder={translate('controls.veventLocationPlaceholder')}
        value={config.location}
        onChange={(e) => onLocationChange(e.target.value)}
        autoComplete="off"
      />

      {/* Description — collapsible, optional */}
      <div className="flex flex-col gap-2">
        <button
          type="button"
          id={descriptionToggleId}
          onClick={() => setDescriptionOpen((prev) => !prev)}
          className="flex min-h-[44px] items-center justify-between w-full text-sm font-medium text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring rounded"
          aria-expanded={descriptionOpen}
          aria-controls={descriptionRegionId}
        >
          <span>{translate('controls.veventDescriptionLabel')}</span>
          {descriptionOpen ? (
            <ChevronUp size={15} aria-hidden className="text-action" />
          ) : (
            <ChevronDown size={15} aria-hidden className="text-action" />
          )}
        </button>
        {descriptionOpen && (
          <div id={descriptionRegionId}>
            <textarea
              id={descriptionId}
              aria-labelledby={descriptionToggleId}
              rows={3}
              placeholder={translate('controls.veventDescriptionPlaceholder')}
              value={config.description}
              onChange={(e) => onDescriptionChange(e.target.value)}
              className="block w-full resize-none rounded-lg border border-border-strong bg-surface-inset px-3 py-2 text-sm text-text-primary shadow-sm placeholder:text-text-disabled focus:border-focus-ring focus:outline-none focus:ring-2 focus:ring-focus-ring"
            />
          </div>
        )}
      </div>

      {isPayloadLong && <Callout>{translate('controls.veventPayloadWarning')}</Callout>}
    </div>
  )
}
