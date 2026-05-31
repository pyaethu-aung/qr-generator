import type { ReactNode } from 'react'

export interface PillOption<T extends string = string> {
  value: T
  label: string
  icon?: ReactNode
}

export interface PillGroupProps<T extends string = string> {
  options: PillOption<T>[]
  value: T
  onChange: (value: T) => void
  /** h-9 (36px) for mode switchers with icons; h-11 (44px) default */
  size?: 'sm' | 'md'
  'aria-label'?: string
  'aria-labelledby'?: string
}

export function PillGroup<T extends string>({
  options,
  value,
  onChange,
  size = 'md',
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
}: PillGroupProps<T>) {
  const hasIcons = options.some((o) => o.icon != null)

  return (
    <div
      className="flex gap-2 overflow-x-auto scrollbar-none"
      role="group"
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={value === option.value}
          onClick={(e) => { onChange(option.value); e.currentTarget.scrollIntoView({ block: 'nearest', inline: 'nearest' }) }}
          className={[
            'flex flex-1 items-center justify-center rounded-full px-3 text-sm whitespace-nowrap transition-colors',
            size === 'sm' ? 'h-9' : 'h-11',
            hasIcons ? 'gap-1.5' : '',
            value === option.value
              ? 'bg-action text-action-fg font-semibold'
              : 'bg-surface-inset text-text-primary hover:bg-surface-raised',
          ].filter(Boolean).join(' ')}
        >
          {option.icon}
          {option.label}
        </button>
      ))}
    </div>
  )
}

export default PillGroup
