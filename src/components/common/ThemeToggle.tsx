import { useState } from 'react'
import { useThemeContext } from '../../hooks/ThemeProvider'
import { twMerge } from 'tailwind-merge'
import clsx from 'clsx'
import { Toast } from './Toast'
import { useLocaleContext } from '../../hooks/LocaleProvider'

export function ThemeToggle() {
  const { theme } = useThemeContext()
  const { translate } = useLocaleContext()
  const isDark = theme === 'dark'
  const [showToast, setShowToast] = useState(false)

  return (
    <div className="relative">
      <button
        type="button"
        onMouseEnter={() => setShowToast(true)}
        onMouseLeave={() => setShowToast(false)}
        className={twMerge(
          clsx(
            'relative inline-flex h-9 w-9 items-center justify-center rounded-lg border transition-all duration-300',
            'border-slate-200 bg-white text-slate-900',
            'dark:border-white/10 dark:bg-white/5 dark:text-white',
            // Disabled styles
            'opacity-50 cursor-not-allowed',
            // Default focus ring for accessibility even if disabled logic prevents action
            'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500'
          )
        )}
        aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
        aria-disabled="true"
      >
        <span className="sr-only">Toggle theme</span>
        <span className={clsx('text-lg transition-transform duration-500', isDark ? 'rotate-0' : 'rotate-[360deg]')}>
          {isDark ? '☀️' : '🌙'}
        </span>
      </button>
      
      <Toast 
        message={translate('common.comingSoon')} 
        isVisible={showToast} 
      />
    </div>
  )
}
