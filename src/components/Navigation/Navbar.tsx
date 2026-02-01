import { useState } from 'react'
import { useLocaleContext } from '../../hooks/LocaleProvider'
import { LanguageToggle } from '../common/LanguageToggle'
import { HamburgerMenu } from './HamburgerMenu'

export function Navbar() {
  const { translate } = useLocaleContext()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="relative z-50 border-b border-white/10 bg-slate-950/70 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 py-3 sm:py-5 sm:px-6 lg:px-8 flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 sm:gap-3 text-lg sm:text-xl font-semibold text-white">
            <span className="text-xl sm:text-2xl">✨</span>
            {translate('layout.headerTitle')}
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-300">{translate('layout.headerSubtitle')}</p>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:block">
          <LanguageToggle />
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden">
          <HamburgerMenu isOpen={isMenuOpen} onClick={() => setIsMenuOpen(!isMenuOpen)} />
        </div>
      </div>

      {/* Mobile Navigation Overlay */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 border-b border-white/10 bg-slate-900 shadow-2xl animate-in slide-in-from-top duration-200">
          <div className="px-4 py-6 space-y-4">
            <div className="flex flex-col gap-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                {translate('locale.toggleLabel')}
              </h3>
              <div className="flex justify-start">
                <LanguageToggle />
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
