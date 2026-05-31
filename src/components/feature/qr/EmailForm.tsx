import { useState, useId, useMemo } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { Input } from '../../common/Input'
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
  const [bodyOpen, setBodyOpen] = useState(false)
  const [toError, setToError] = useState<string | undefined>()

  const hasBody = !!config.body

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
      <p className="text-xs text-text-secondary">{translate('controls.emailModeHint')}</p>
      <Input
        label={translate('controls.emailToLabel')}
        placeholder={translate('controls.emailToPlaceholder')}
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
          className="flex items-center justify-between w-full text-sm font-medium text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring rounded"
          aria-expanded={bodyOpen || hasBody}
          aria-controls={bodyRegionId}
        >
          <span>{translate('controls.emailBodyLabel')}</span>
          {bodyOpen || hasBody ? (
            <ChevronUp size={15} aria-hidden className="text-action" />
          ) : (
            <ChevronDown size={15} aria-hidden className="text-action" />
          )}
        </button>
        {(bodyOpen || hasBody) && (
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
        <div className="flex items-start gap-2 rounded-lg border border-warning-border bg-warning-surface px-3 py-2.5 text-sm text-warning" role="alert">
          <svg className="mt-0.5 h-4 w-4 shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden>
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span>{translate('controls.emailPayloadWarning')}</span>
        </div>
      )}
    </div>
  )
}
