import { useState, useId } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { Input } from '../../common/Input'
import { useLocaleContext } from '../../../hooks/LocaleProvider'
import type { VCardConfig } from '../../../types/qr'

interface VCardFormProps {
  config: VCardConfig
  onFirstNameChange: (v: string) => void
  onLastNameChange: (v: string) => void
  onPhoneChange: (v: string) => void
  onEmailChange: (v: string) => void
  onCompanyChange: (v: string) => void
  onJobTitleChange: (v: string) => void
  onWebsiteChange: (v: string) => void
}

export function VCardForm({
  config,
  onFirstNameChange,
  onLastNameChange,
  onPhoneChange,
  onEmailChange,
  onCompanyChange,
  onJobTitleChange,
  onWebsiteChange,
}: VCardFormProps) {
  const { translate } = useLocaleContext()
  const [proOpen, setProOpen] = useState(false)
  const proToggleId = useId()
  const proRegionId = useId()

  const hasProfessionalData = config.company || config.jobTitle || config.website

  return (
    <div className="flex flex-col gap-4">
      {/* Name row */}
      <div className="grid grid-cols-2 gap-3">
        <Input
          label={translate('controls.vcardFirstNameLabel')}
          placeholder={translate('controls.vcardFirstNamePlaceholder')}
          value={config.firstName}
          onChange={(e) => onFirstNameChange(e.target.value)}
          autoComplete="given-name"
          required
          helperText={translate('controls.vcardNameHint')}
        />
        <Input
          label={translate('controls.vcardLastNameLabel')}
          placeholder={translate('controls.vcardLastNamePlaceholder')}
          value={config.lastName}
          onChange={(e) => onLastNameChange(e.target.value)}
          autoComplete="family-name"
        />
      </div>

      <Input
        label={translate('controls.vcardPhoneLabel')}
        placeholder={translate('controls.vcardPhonePlaceholder')}
        value={config.phone}
        onChange={(e) => onPhoneChange(e.target.value)}
        type="tel"
        autoComplete="tel"
      />

      <Input
        label={translate('controls.vcardEmailLabel')}
        placeholder={translate('controls.vcardEmailPlaceholder')}
        value={config.email}
        onChange={(e) => onEmailChange(e.target.value)}
        type="email"
        autoComplete="email"
      />

      {/* Professional details — collapsible */}
      <div className="flex flex-col gap-2">
        <button
          type="button"
          id={proToggleId}
          onClick={() => setProOpen(prev => !prev)}
          className="flex items-center justify-between w-full text-sm font-medium text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring rounded"
          aria-expanded={proOpen || !!hasProfessionalData}
          aria-controls={proRegionId}
        >
          <span>{translate('controls.vcardProfessionalLabel')}</span>
          {proOpen || hasProfessionalData ? (
            <ChevronUp size={15} aria-hidden className="text-action" />
          ) : (
            <ChevronDown size={15} aria-hidden className="text-action" />
          )}
        </button>

        {(proOpen || hasProfessionalData) && (
          <div id={proRegionId} className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              <Input
                label={translate('controls.vcardCompanyLabel')}
                placeholder={translate('controls.vcardCompanyPlaceholder')}
                value={config.company}
                onChange={(e) => onCompanyChange(e.target.value)}
                autoComplete="organization"
              />
              <Input
                label={translate('controls.vcardJobTitleLabel')}
                placeholder={translate('controls.vcardJobTitlePlaceholder')}
                value={config.jobTitle}
                onChange={(e) => onJobTitleChange(e.target.value)}
                autoComplete="organization-title"
              />
            </div>
            <Input
              label={translate('controls.vcardWebsiteLabel')}
              placeholder={translate('controls.vcardWebsitePlaceholder')}
              value={config.website}
              onChange={(e) => onWebsiteChange(e.target.value)}
              type="url"
              autoComplete="url"
            />
          </div>
        )}
      </div>
    </div>
  )
}
