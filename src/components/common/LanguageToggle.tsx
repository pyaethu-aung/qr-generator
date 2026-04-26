import { useLocaleContext } from '../../hooks/LocaleProvider'
import type { SupportedLocale } from '../../types/i18n'

const toggleLocale = (current: SupportedLocale): SupportedLocale => (current === 'en' ? 'my' : 'en')

export function LanguageToggle() {
  const { locale, setLocale, translate } = useLocaleContext()
  const nextLocale = toggleLocale(locale)
  const ariaLabel = translate(`locale.switchTo.${nextLocale}`)

  return (
    <button
      type="button"
      className="rounded-lg border border-border-subtle bg-surface-overlay px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-text-primary hover:border-border-strong hover:bg-surface-inset focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2"
      aria-label={ariaLabel}
      onClick={() => setLocale(nextLocale)}
    >
      {translate('locale.toggleLabel')}
    </button>
  )
}
