import { useState, useId } from 'react'

interface TooltipProps {
  content: string
}

export function Tooltip({ content }: TooltipProps) {
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
        className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-surface-inset text-[10px] font-semibold text-text-secondary hover:bg-surface-raised focus:outline-none focus:ring-2 focus:ring-focus-ring focus:ring-offset-1"
        aria-label="About error correction"
      >
        ?
      </button>
      {visible && (
        <div
          id={id}
          role="tooltip"
          className="absolute top-1/2 left-full -translate-y-1/2 ml-2 w-64 rounded-lg border border-border-subtle bg-surface-raised p-3 text-xs leading-relaxed text-text-secondary shadow-md z-50"
        >
          {content}
        </div>
      )}
    </div>
  )
}
