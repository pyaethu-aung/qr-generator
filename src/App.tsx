import { useEffect } from 'react'

import { QRGenerator } from './components/feature/qr/QRGenerator'
import './App.css'
import { useLocaleContext } from './hooks/LocaleProvider'
import { applySeoMetadata } from './utils/metadata'

function App() {
  const { translate, seo } = useLocaleContext()

  useEffect(() => {
    applySeoMetadata(seo)
  }, [seo])

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <div className="relative isolate overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.25),_transparent_45%)]" />
        <header className="relative z-10 border-b border-white/10 bg-slate-950/70 backdrop-blur-md">
          <div className="max-w-6xl mx-auto px-4 py-5 sm:px-6 lg:px-8">
            <h1 className="flex items-center gap-3 text-xl font-semibold text-white">
              <span className="text-2xl">✨</span>
              {translate('layout.headerTitle')}
            </h1>
            <p className="mt-1 text-sm text-slate-300">{translate('layout.headerSubtitle')}</p>
          </div>
        </header>

        <main className="relative z-10 py-12 sm:py-16 lg:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <QRGenerator />
          </div>
        </main>

        <footer className="relative z-10 border-t border-white/5 py-8 text-center text-sm text-slate-400">
          <p>{translate('layout.footerNote')}</p>
        </footer>
      </div>
    </div>
  )
}

export default App
