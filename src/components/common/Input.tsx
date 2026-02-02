import type { InputHTMLAttributes } from 'react'
import { forwardRef, useId } from 'react'
import clsx from 'clsx'
import { twMerge } from 'tailwind-merge'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  helperText?: string
  error?: string
  fullWidth?: boolean
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, helperText, error, fullWidth = true, className, id, disabled, ...props }, ref) => {
    const generatedId = useId()
    const inputId = id || props.name || generatedId

    const inputClass = twMerge(
      clsx(
        'block rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm placeholder:text-slate-500 transition-all duration-300',
        'dark:border-white/10 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500',
        'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500',
        'dark:focus:ring-sky-500 dark:focus:border-sky-500',
        fullWidth && 'w-full',
        disabled && 'bg-slate-100 text-slate-500 cursor-not-allowed dark:bg-slate-800 dark:text-slate-400',
        error && 'border-red-300 focus:ring-red-500 focus:border-red-500 dark:border-red-500',
        className,
      ),
    )

    return (
      <div className={twMerge(clsx('flex flex-col gap-1', fullWidth && 'w-full'))}>
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors duration-300">
            {label}
          </label>
        )}
        <input id={inputId} ref={ref} className={inputClass} disabled={disabled} {...props} />
        {error ? (
          <span className="text-sm text-red-600 dark:text-red-400">{error}</span>
        ) : (
          helperText && <span className="text-sm text-slate-500 dark:text-slate-400">{helperText}</span>
        )}
      </div>
    )
  },
)

Input.displayName = 'Input'

export default Input
