import { useState, useId } from 'react'
import { Input } from '../../common/Input'
import { useLocaleContext } from '../../../hooks/LocaleProvider'
import { TEL_PHONE_REGEX } from '../../../utils/tel'
import type { TelConfig } from '../../../types/qr'

interface TelFormProps {
  config: TelConfig
  onNumberChange: (v: string) => void
}

export function TelForm({ config, onNumberChange }: TelFormProps) {
  const { translate } = useLocaleContext()
  const hintId = useId()
  const [numberError, setNumberError] = useState<string | undefined>()
  const [touched, setTouched] = useState(false)

  const validateNumber = (value: string) => {
    const trimmed = value.trim()
    if (!trimmed) { setNumberError(undefined); return }
    const valid = TEL_PHONE_REGEX.test(trimmed)
    setNumberError(valid ? undefined : translate('controls.telNumberError'))
  }

  return (
    <div className="flex flex-col gap-4">
      <p id={hintId} className="text-xs text-text-secondary">{translate('controls.telModeHint')}</p>
      <Input
        label={translate('controls.telNumberLabel')}
        placeholder={translate('controls.telNumberPlaceholder')}
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
    </div>
  )
}
