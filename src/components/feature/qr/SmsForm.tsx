import { useState, useId, useMemo } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { Input } from '../../common/Input'
import { useLocaleContext } from '../../../hooks/LocaleProvider'
import { buildSmsString, SMS_PHONE_REGEX } from '../../../utils/sms'
import type { SmsConfig } from '../../../types/qr'

const SMS_PAYLOAD_WARN = 200

interface SmsFormProps {
  config: SmsConfig
  onNumberChange: (v: string) => void
  onMessageChange: (v: string) => void
}

export function SmsForm({ config, onNumberChange, onMessageChange }: SmsFormProps) {
  const { translate } = useLocaleContext()
  const messageId = useId()
  const messageToggleId = useId()
  const messageRegionId = useId()
  const [messageOpen, setMessageOpen] = useState(false)
  const [numberError, setNumberError] = useState<string | undefined>()

  const hasMessage = !!config.message

  const payloadLength = useMemo(() => buildSmsString(config).length, [config])
  const isPayloadLong = payloadLength > SMS_PAYLOAD_WARN

  const validateNumber = (value: string) => {
    const trimmed = value.trim()
    if (!trimmed) { setNumberError(undefined); return }
    const valid = SMS_PHONE_REGEX.test(trimmed)
    setNumberError(valid ? undefined : translate('controls.smsNumberError'))
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs text-text-secondary">{translate('controls.smsModeHint')}</p>
      <Input
        label={translate('controls.smsNumberLabel')}
        placeholder={translate('controls.smsNumberPlaceholder')}
        value={config.number}
        onChange={(e) => { onNumberChange(e.target.value); if (numberError) setNumberError(undefined) }}
        onBlur={(e) => validateNumber(e.target.value)}
        error={numberError}
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        required
      />

      {/* Message — collapsible, optional */}
      <div className="flex flex-col gap-2">
        <button
          type="button"
          id={messageToggleId}
          onClick={() => setMessageOpen(prev => !prev)}
          className="flex items-center justify-between w-full text-sm font-medium text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring rounded"
          aria-expanded={messageOpen || hasMessage}
          aria-controls={messageRegionId}
        >
          <span>{translate('controls.smsMessageLabel')}</span>
          {messageOpen || hasMessage ? (
            <ChevronUp size={15} aria-hidden className="text-action" />
          ) : (
            <ChevronDown size={15} aria-hidden className="text-action" />
          )}
        </button>
        {(messageOpen || hasMessage) && (
          <div id={messageRegionId}>
            <textarea
              id={messageId}
              aria-labelledby={messageToggleId}
              rows={3}
              placeholder={translate('controls.smsMessagePlaceholder')}
              value={config.message}
              onChange={(e) => onMessageChange(e.target.value)}
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
          <span>{translate('controls.smsPayloadWarning')}</span>
        </div>
      )}
    </div>
  )
}
