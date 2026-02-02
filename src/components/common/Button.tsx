import type { ButtonHTMLAttributes, PropsWithChildren } from 'react'
import clsx from 'clsx'
import { twMerge } from 'tailwind-merge'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost'
export type ButtonSize = 'md' | 'sm'

export interface ButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'color' | 'className'>, PropsWithChildren {
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
  className?: string
  loading?: boolean
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-indigo-600 text-white shadow-sm transition-all duration-300 hover:bg-indigo-500 active:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 dark:bg-sky-600 dark:hover:bg-sky-500 dark:active:bg-sky-700 dark:focus-visible:outline-sky-500',
  secondary:
    'bg-white text-slate-900 border border-slate-200 shadow-sm transition-all duration-300 hover:bg-slate-50 active:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500 dark:bg-slate-900 dark:text-white dark:border-white/10 dark:hover:bg-slate-800 dark:active:bg-slate-700',
  ghost: 'bg-transparent text-slate-900 transition-colors duration-300 hover:bg-slate-100 active:bg-slate-200 dark:text-slate-300 dark:hover:bg-white/5 dark:active:bg-white/10',
}

const sizeStyles: Record<ButtonSize, string> = {
  md: 'h-11 px-4 text-sm',
  sm: 'h-9 px-3 text-sm',
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  className,
  disabled,
  type = 'button',
  ...props
}: ButtonProps) {
  const composed = twMerge(
    clsx(
      'inline-flex items-center justify-center rounded-lg font-medium transition-colors duration-150',
      'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-white',
      variantStyles[variant],
      sizeStyles[size],
      {
        'w-full': fullWidth,
        'opacity-60 cursor-not-allowed': disabled || loading,
      },
      className,
    ),
  )

  return (
    <button type={type} className={composed} disabled={disabled || loading} {...props}>
      {loading ? <span className="animate-pulse">Loading...</span> : children}
    </button>
  )
}

export default Button
