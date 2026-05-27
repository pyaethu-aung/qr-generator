import { useId } from 'react'
import { Input } from '../../common/Input'
import { useLocaleContext } from '../../../hooks/LocaleProvider'
import type { EmailConfig } from '../../../types/qr'

interface EmailFormProps {
  config: EmailConfig
  onToChange: (v: string) => void
  onSubjectChange: (v: string) => void
  onBodyChange: (v: string) => void
}

export function EmailForm({ config, onToChange, onSubjectChange, onBodyChange }: EmailFormProps) {
  const { translate } = useLocaleContext()
  const bodyId = useId()

  return (
    <div className="flex flex-col gap-4">
      <Input
        label={translate('controls.emailToLabel')}
        placeholder={translate('controls.emailToPlaceholder')}
        value={config.to}
        onChange={(e) => onToChange(e.target.value)}
        type="email"
        autoComplete="email"
      />
      <Input
        label={translate('controls.emailSubjectLabel')}
        placeholder={translate('controls.emailSubjectPlaceholder')}
        value={config.subject}
        onChange={(e) => onSubjectChange(e.target.value)}
        autoComplete="off"
      />
      <div className="flex flex-col gap-1">
        <label htmlFor={bodyId} className="text-sm font-medium text-text-primary">
          {translate('controls.emailBodyLabel')}
        </label>
        <textarea
          id={bodyId}
          rows={4}
          placeholder={translate('controls.emailBodyPlaceholder')}
          value={config.body}
          onChange={(e) => onBodyChange(e.target.value)}
          className="block w-full resize-none rounded-lg border border-border-strong bg-surface-inset px-3 py-2 text-sm text-text-primary shadow-sm placeholder:text-text-disabled focus:border-focus-ring focus:outline-none focus:ring-2 focus:ring-focus-ring"
        />
      </div>
    </div>
  )
}
