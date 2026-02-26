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
    'bg-action text-action-fg shadow-sm transition-all hover:bg-action/90 active:bg-action/80 focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2',
  secondary:
    'bg-surface-raised text-text-primary border border-border-strong shadow-sm transition-all hover:bg-surface-raised/80 active:bg-surface-inset',
  ghost: 'bg-transparent text-text-primary transition-colors hover:bg-surface-inset active:bg-surface-inset/80',
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
      'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-focus-ring focus-visible:ring-offset-surface',
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
