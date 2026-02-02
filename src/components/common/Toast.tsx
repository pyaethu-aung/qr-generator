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
          'min-w-max rounded-lg bg-slate-800 px-3 py-1.5',
          'text-xs font-medium text-white shadow-lg shadow-black/10',
          'transition-all duration-200 ease-out origin-bottom',
          isVisible
            ? 'translate-y-0 opacity-100 scale-100'
            : 'translate-y-2 opacity-0 scale-95 pointer-events-none'
        ),
        className
      )}
      role="tooltip"
      aria-hidden={!isVisible}
    >
      {message}
      {/* Arrow */}
      <div className="absolute top-full left-1/2 -ml-1 h-2 w-2 -translate-y-1 bg-slate-800 rotate-45" />
    </div>
  )
}
