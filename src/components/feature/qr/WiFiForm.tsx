import { useState, useId } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { Input } from '../../common/Input'
import { PillGroup } from '../../common/PillGroup'
import { useLocaleContext } from '../../../hooks/LocaleProvider'
import type { WiFiConfig, WiFiSecurity } from '../../../types/qr'

interface WiFiFormProps {
  config: WiFiConfig
  onSsidChange: (ssid: string) => void
  onPasswordChange: (password: string) => void
  onSecurityChange: (security: WiFiSecurity) => void
  onHiddenChange: (hidden: boolean) => void
}

export function WiFiForm({ config, onSsidChange, onPasswordChange, onSecurityChange, onHiddenChange }: WiFiFormProps) {
  const { translate } = useLocaleContext()
  const [showPassword, setShowPassword] = useState(false)
  const securityLabelId = useId()
  const hiddenCheckboxId = useId()
  const passwordId = useId()

  const securityOptions: { value: WiFiSecurity; label: string }[] = [
    { value: 'WPA', label: translate('controls.wifiSecurityWpa') },
    { value: 'WEP', label: translate('controls.wifiSecurityWep') },
    { value: 'nopass', label: translate('controls.wifiSecurityNone') },
  ]

  return (
    <div className="flex flex-col gap-4">
      <Input
        label={translate('controls.wifiSsidLabel')}
        placeholder={translate('controls.wifiSsidPlaceholder')}
        value={config.ssid}
        onChange={(e) => onSsidChange(e.target.value)}
        autoComplete="off"
      />

      {/* Security type pills */}
      <div className="flex flex-col gap-1">
        <label id={securityLabelId} className="text-sm font-medium text-text-primary">
          {translate('controls.wifiSecurityLabel')}
        </label>
        <PillGroup
          options={securityOptions}
          value={config.security}
          onChange={onSecurityChange}
          aria-labelledby={securityLabelId}
        />
        {config.security === 'WEP' && (
          <div className="flex items-start gap-2 rounded-lg border border-warning-border bg-warning-surface px-3 py-2.5 text-sm text-warning" role="alert">
            <svg className="mt-0.5 h-4 w-4 shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden>
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span>{translate('controls.wifiWepWarning')}</span>
          </div>
        )}
      </div>

      {config.security !== 'nopass' && (
        <div className="flex flex-col gap-1">
          <label htmlFor={passwordId} className="text-sm font-medium text-text-primary">
            {translate('controls.wifiPasswordLabel')}
          </label>
          <div className="relative">
            <input
              id={passwordId}
              type={showPassword ? 'text' : 'password'}
              placeholder={translate('controls.wifiPasswordPlaceholder')}
              value={config.password}
              onChange={(e) => onPasswordChange(e.target.value)}
              autoComplete="off"
              className="block h-11 w-full rounded-lg border border-border-strong bg-surface-inset px-3 pr-10 text-sm text-text-primary placeholder:text-text-disabled focus:border-focus-ring focus:outline-none focus:ring-2 focus:ring-focus-ring"
            />
            <button
              type="button"
              aria-label={showPassword ? translate('controls.wifiHidePassword') : translate('controls.wifiShowPassword')}
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring rounded"
            >
              {showPassword ? <EyeOff size={16} aria-hidden /> : <Eye size={16} aria-hidden />}
            </button>
          </div>
          <p className="text-xs text-text-secondary">{translate('controls.wifiPasswordHint')}</p>
        </div>
      )}

      {/* Hidden network checkbox */}
      <label htmlFor={hiddenCheckboxId} className="flex items-center gap-2.5 cursor-pointer select-none">
        <input
          id={hiddenCheckboxId}
          type="checkbox"
          checked={config.hidden}
          onChange={(e) => onHiddenChange(e.target.checked)}
          className="h-4 w-4 rounded border-border-strong accent-action cursor-pointer"
        />
        <span className="text-sm text-text-primary">{translate('controls.wifiHiddenLabel')}</span>
      </label>
    </div>
  )
}
