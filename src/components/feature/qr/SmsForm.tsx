import { useState, useId, useMemo } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { Input } from '../../common/Input'
import { Callout } from '../../common/Callout'
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
  const hintId = useId()
  const [messageOpen, setMessageOpen] = useState(false)
  const [numberError, setNumberError] = useState<string | undefined>()
  const [touched, setTouched] = useState(false)

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
      <p id={hintId} className="text-xs text-text-secondary">{translate('controls.smsModeHint')}</p>
      <Input
        label={translate('controls.smsNumberLabel')}
        placeholder={translate('controls.smsNumberPlaceholder')}
        aria-describedby={hintId}
        value={config.number}
        onChange={(e) => {
          const v = e.target.value
          onNumberChange(v)
          // Once the field has been blurred at least once, keep validating live so the
          // error clears the instant the number becomes valid (and returns if broken again).
          if (touched) validateNumber(v)
          else if (numberError) setNumberError(undefined)
        }}
        onBlur={(e) => { setTouched(true); validateNumber(e.target.value) }}
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
          className="flex min-h-[44px] items-center justify-between w-full text-sm font-medium text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring rounded"
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
        <Callout>{translate('controls.smsPayloadWarning')}</Callout>
      )}
    </div>
  )
}
