import { type ReactNode } from 'react'
import { twMerge } from 'tailwind-merge'
import clsx from 'clsx'

interface ToastProps {
  message: ReactNode
  isVisible: boolean
  className?: string
}

export function Toast({ message, isVisible, className }: ToastProps) {
  return (
    <div
      className={twMerge(
        clsx(
          'absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-50',
          'min-w-max rounded-lg bg-surface-raised px-3 py-1.5 border border-border-strong',
          'text-xs font-medium text-text-primary shadow-lg',
          'motion-safe:transition-all motion-safe:duration-200 motion-safe:ease-out motion-safe:origin-bottom',
          isVisible
            ? 'opacity-100 motion-safe:translate-y-0 motion-safe:scale-100'
            : 'opacity-0 pointer-events-none motion-safe:translate-y-2 motion-safe:scale-95'
        ),
        className
      )}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      {message}
      {/* Arrow */}
      <div className="absolute top-full left-1/2 -ml-1 h-2 w-2 -translate-y-1 bg-surface-raised border-r border-b border-border-strong rotate-45" />
    </div>
  )
}
