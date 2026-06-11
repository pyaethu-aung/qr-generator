import { useState, useId, useMemo } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { Input } from '../../common/Input'
import { Callout } from '../../common/Callout'
import { useLocaleContext } from '../../../hooks/LocaleProvider'
import { buildEmailString, EMAIL_REGEX } from '../../../utils/email'
import type { EmailConfig } from '../../../types/qr'

const EMAIL_PAYLOAD_WARN = 300

interface EmailFormProps {
  config: EmailConfig
  onToChange: (v: string) => void
  onSubjectChange: (v: string) => void
  onBodyChange: (v: string) => void
}

export function EmailForm({ config, onToChange, onSubjectChange, onBodyChange }: EmailFormProps) {
  const { translate } = useLocaleContext()
  const bodyId = useId()
  const bodyToggleId = useId()
  const bodyRegionId = useId()
  const hintId = useId()
  // Starts open when a message already exists, but the user can still
  // collapse it afterwards — the content is kept in state, only hidden.
  const [bodyOpen, setBodyOpen] = useState(!!config.body)
  const [toError, setToError] = useState<string | undefined>()

  const payloadLength = useMemo(() => buildEmailString(config).length, [config])
  const isPayloadLong = payloadLength > EMAIL_PAYLOAD_WARN

  const validateEmail = (value: string) => {
    const trimmed = value.trim()
    if (!trimmed) { setToError(undefined); return }
    const valid = EMAIL_REGEX.test(trimmed)
    setToError(valid ? undefined : translate('controls.emailToError'))
  }

  return (
    <div className="flex flex-col gap-4">
      <p id={hintId} className="text-xs text-text-secondary">{translate('controls.emailModeHint')}</p>
      <Input
        label={translate('controls.emailToLabel')}
        placeholder={translate('controls.emailToPlaceholder')}
        aria-describedby={hintId}
        value={config.to}
        onChange={(e) => { onToChange(e.target.value); if (toError) setToError(undefined) }}
        onBlur={(e) => validateEmail(e.target.value)}
        error={toError}
        type="email"
        autoComplete="email"
        required
      />
      <Input
        label={translate('controls.emailSubjectLabel')}
        placeholder={translate('controls.emailSubjectPlaceholder')}
        value={config.subject}
        onChange={(e) => onSubjectChange(e.target.value)}
        autoComplete="off"
      />

      {/* Message — collapsible, optional */}
      <div className="flex flex-col gap-2">
        <button
          type="button"
          id={bodyToggleId}
          onClick={() => setBodyOpen(prev => !prev)}
          className="flex min-h-[44px] items-center justify-between w-full text-sm font-medium text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring rounded"
          aria-expanded={bodyOpen}
          aria-controls={bodyRegionId}
        >
          <span>{translate('controls.emailBodyLabel')}</span>
          {bodyOpen ? (
            <ChevronUp size={15} aria-hidden className="text-action" />
          ) : (
            <ChevronDown size={15} aria-hidden className="text-action" />
          )}
        </button>
        {bodyOpen && (
          <div id={bodyRegionId}>
            <textarea
              id={bodyId}
              aria-labelledby={bodyToggleId}
              rows={3}
              placeholder={translate('controls.emailBodyPlaceholder')}
              value={config.body}
              onChange={(e) => onBodyChange(e.target.value)}
              className="block w-full resize-none rounded-lg border border-border-strong bg-surface-inset px-3 py-2 text-sm text-text-primary shadow-sm placeholder:text-text-disabled focus:border-focus-ring focus:outline-none focus:ring-2 focus:ring-focus-ring"
            />
          </div>
        )}
      </div>

      {isPayloadLong && (
        <Callout>{translate('controls.emailPayloadWarning')}</Callout>
      )}
    </div>
  )
}
