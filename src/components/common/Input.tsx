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
        'block rounded-lg border border-border-strong bg-surface px-3 py-2 text-sm text-text-primary shadow-sm placeholder:text-text-secondary',
        'focus:outline-none focus:ring-2 focus:ring-focus-ring focus:border-focus-ring',
        fullWidth && 'w-full',
        disabled && 'bg-action-disabled text-text-disabled cursor-not-allowed',
        error && 'border-error-border focus:ring-error focus:border-error',
        className,
      ),
    )

    return (
      <div className={twMerge(clsx('flex flex-col gap-1', fullWidth && 'w-full'))}>
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-text-primary">
            {label}
          </label>
        )}
        <input id={inputId} ref={ref} className={inputClass} disabled={disabled} {...props} />
        {error ? (
          <span className="text-sm text-error">{error}</span>
        ) : (
          helperText && <span className="text-sm text-text-secondary">{helperText}</span>
        )}
      </div>
    )
  },
)

Input.displayName = 'Input'

export default Input
