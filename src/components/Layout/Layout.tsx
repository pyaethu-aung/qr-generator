import type { ReactNode } from 'react'

interface LayoutProps {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen max-w-full overflow-x-hidden transition-colors duration-300">
      <div className="relative isolate overflow-hidden min-h-screen">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.15),_transparent_45%)] dark:bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.25),_transparent_45%)]" />
        {children}
      </div>
    </div>
  )
}
