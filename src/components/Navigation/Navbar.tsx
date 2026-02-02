import { useLocaleContext } from '../../hooks/LocaleProvider'
import { LanguageToggle } from '../common/LanguageToggle'
import { ThemeToggle } from '../common/ThemeToggle'

export function Navbar() {
  const { translate } = useLocaleContext()

  return (
    <header className="relative z-50 border-b border-black/5 bg-white/70 backdrop-blur-md transition-colors duration-300 dark:border-white/10 dark:bg-slate-950/70">
      <div className="max-w-6xl mx-auto px-4 py-3 sm:py-5 sm:px-6 lg:px-8 flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 sm:gap-3 text-lg sm:text-xl font-semibold text-slate-900 transition-colors duration-300 dark:text-white">
            <span className="text-xl sm:text-2xl">✨</span>
            {translate('layout.headerTitle')}
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 transition-colors duration-300 dark:text-slate-300">{translate('layout.headerSubtitle')}</p>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <LanguageToggle />
        </div>
      </div>
    </header>
  )
}
