import { useLocaleContext } from '../../hooks/LocaleProvider'
import type { SupportedLocale, TranslationKey } from '../../types/i18n'

const toggleLocale = (current: SupportedLocale): SupportedLocale => (current === 'en' ? 'my' : 'en')

export function LanguageToggle() {
  const { locale, setLocale, translate } = useLocaleContext()
  const nextLocale = toggleLocale(locale)
  const ariaLabel = translate((`locale.switchTo.${nextLocale}`) as TranslationKey)

  return (
    <div className="fixed top-4 right-4 z-50">
      <button
        type="button"
        className="rounded-full border border-white/30 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:border-white hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400"
        aria-label={ariaLabel}
        onClick={() => setLocale(nextLocale)}
      >
        {translate('locale.toggleLabel')}
      </button>
    </div>
  )
}