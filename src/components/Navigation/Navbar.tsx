import { useLocaleContext } from '../../hooks/LocaleProvider'
import { LanguageToggle } from '../common/LanguageToggle'

export function Navbar() {
  const { translate } = useLocaleContext()

  return (
    <header className="relative z-10 border-b border-white/10 bg-slate-950/70 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 py-3 sm:py-5 sm:px-6 lg:px-8 flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 sm:gap-3 text-lg sm:text-xl font-semibold text-white">
            <span className="text-xl sm:text-2xl">✨</span>
            {translate('layout.headerTitle')}
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-300">{translate('layout.headerSubtitle')}</p>
        </div>
        <div className="hidden md:block">
          <LanguageToggle />
        </div>
      </div>
    </header>
  )
}
