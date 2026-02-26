import { useThemeContext } from '../../hooks/ThemeProvider'
import { twMerge } from 'tailwind-merge'
import clsx from 'clsx'

export function ThemeToggle() {
  const { theme, toggleTheme } = useThemeContext()
  const isDark = theme === 'dark'

  return (
    <div className="relative">
      <button
        type="button"
        onClick={toggleTheme}
        className={twMerge(
          clsx(
            'relative inline-flex h-9 w-9 items-center justify-center rounded-lg border transition-colors',
            'border-border-strong bg-surface-raised text-text-primary',
            'focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2'
          )
        )}
        aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      >
        <span className="sr-only">Toggle theme</span>
        <span className={clsx('text-lg transition-transform duration-500', isDark ? 'rotate-0' : 'rotate-[360deg]')}>
          {isDark ? '☀️' : '🌙'}
        </span>
      </button>
    </div>
  )
}
