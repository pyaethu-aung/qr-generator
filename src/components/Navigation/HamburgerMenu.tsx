import { Menu, X } from 'lucide-react'

interface HamburgerMenuProps {
  isOpen: boolean
  onClick: () => void
}

export function HamburgerMenu({ isOpen, onClick }: HamburgerMenuProps) {
  return (
    <button
      type="button"
      className="inline-flex items-center justify-center p-2 rounded-md text-slate-300 hover:text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 transition-colors"
      onClick={onClick}
      aria-expanded={isOpen}
    >
      <span className="sr-only">{isOpen ? 'Close main menu' : 'Open main menu'}</span>
      {isOpen ? (
        <X className="block h-6 w-6" aria-hidden="true" />
      ) : (
        <Menu className="block h-6 w-6" aria-hidden="true" />
      )}
    </button>
  )
}
