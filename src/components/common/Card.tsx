import type { HTMLAttributes, PropsWithChildren } from 'react'
import clsx from 'clsx'
import { twMerge } from 'tailwind-merge'

export interface CardProps extends PropsWithChildren<HTMLAttributes<HTMLDivElement>> {
  elevated?: boolean
  padded?: boolean
}

export function Card({ children, className, elevated = true, padded = true, ...props }: CardProps) {
  const composed = twMerge(
    clsx(
      'rounded-xl ring-1 ring-slate-200 bg-white',
      elevated && 'shadow-sm',
      padded && 'p-6',
      className,
    ),
  )

  return (
    <div className={composed} {...props}>
      {children}
    </div>
  )
}

export default Card
