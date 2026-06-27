import { Globe } from 'lucide-react'
import { useLocaleContext } from '../../hooks/LocaleProvider'
import { localeCodes } from '../../data/i18n'
import type { SupportedLocale } from '../../types/i18n'

const nextLocaleAfter = (current: SupportedLocale): SupportedLocale => {
  const index = localeCodes.indexOf(current)
  return localeCodes[(index + 1) % localeCodes.length]
}

export function LanguageToggle() {
  const { locale, setLocale, translate } = useLocaleContext()
  const nextLocale = nextLocaleAfter(locale)
  const ariaLabel = translate(`locale.switchTo.${nextLocale}`)

  return (
    <button
      type="button"
      className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border-subtle bg-surface-raised text-text-secondary transition-colors hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2"
      aria-label={ariaLabel}
      onClick={() => setLocale(nextLocale)}
    >
      <Globe size={18} aria-hidden />
    </button>
  )
}
