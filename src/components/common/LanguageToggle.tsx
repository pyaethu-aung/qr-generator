import { useLocaleContext } from '../../hooks/LocaleProvider'
import type { SupportedLocale, TranslationKey } from '../../types/i18n'

const toggleLocale = (current: SupportedLocale): SupportedLocale => (current === 'en' ? 'my' : 'en')

export function LanguageToggle() {
  const { locale, setLocale, translate } = useLocaleContext()
  const nextLocale = toggleLocale(locale)
  const ariaLabel = translate(`locale.switchTo.${nextLocale}` as TranslationKey)

  return (
    <button
      type="button"
      className="rounded-lg border border-black/10 bg-white/5 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-slate-900 transition hover:border-black/20 hover:bg-black/5 dark:border-white/30 dark:bg-white/5 dark:text-white dark:hover:border-white dark:hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500"
      aria-label={ariaLabel}
      onClick={() => setLocale(nextLocale)}
    >
      {translate('locale.toggleLabel')}
    </button>
  )
}
