import { useState, useId } from 'react'

interface TooltipProps {
  content: string
  ariaLabel?: string
}

export function Tooltip({ content, ariaLabel = 'More information' }: TooltipProps) {
  const [visible, setVisible] = useState(false)
  const id = useId()

  return (
    <div className="relative inline-flex">
      <button
        type="button"
        aria-describedby={visible ? id : undefined}
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        onFocus={() => setVisible(true)}
        onBlur={() => setVisible(false)}
        className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-surface-inset text-[10px] font-semibold text-text-secondary hover:bg-surface-raised focus:outline-none focus:ring-2 focus:ring-focus-ring focus:ring-offset-1"
        aria-label={ariaLabel}
      >
        ?
      </button>
      {visible && (
        <div
          id={id}
          role="tooltip"
          className="absolute top-full right-0 mt-2 sm:top-1/2 sm:right-auto sm:left-full sm:-translate-y-1/2 sm:mt-0 sm:ml-2 w-64 max-w-[calc(100vw-1.5rem)] rounded-lg border border-border-subtle bg-surface-raised p-3 text-xs leading-relaxed text-text-secondary shadow-md z-50"
        >
          {content}
        </div>
      )}
    </div>
  )
}
