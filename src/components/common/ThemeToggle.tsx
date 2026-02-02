import { useThemeContext } from '../../hooks/ThemeProvider'
import { twMerge } from 'tailwind-merge'
import clsx from 'clsx'

export function ThemeToggle() {
  const { theme, toggleTheme } = useThemeContext()
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={twMerge(
        clsx(
          'relative inline-flex h-9 w-9 items-center justify-center rounded-lg border transition-all duration-300',
          'border-slate-200 bg-white text-slate-900 hover:bg-slate-50',
          'dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10',
          'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500'
        )
      )}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      title={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
    >
      <span className="sr-only">Toggle theme</span>
      <span className={clsx('text-lg transition-transform duration-500', isDark ? 'rotate-0' : 'rotate-[360deg]')}>
        {isDark ? '☀️' : '🌙'}
      </span>
    </button>
  )
}
