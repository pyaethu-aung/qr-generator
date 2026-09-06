import { useEffect, useState, useCallback } from 'react'
import { ExternalLink, QrCode, ScanLine, Layers } from 'lucide-react'

import { QRGenerator } from './components/feature/qr/QRGenerator'
import { QRScanner } from './components/feature/qr/QRScanner'
import { BatchGenerator } from './components/feature/qr/BatchGenerator'
import { PillGroup } from './components/common/PillGroup'
import './App.css'
import { useLocaleContext } from './hooks/LocaleProvider'
import { applySeoMetadata } from './utils/metadata'
import { Navbar } from './components/Navigation/Navbar'
import { Layout } from './components/Layout/Layout'
import SEOHead from './components/common/SEOHead'

type AppView = 'generate' | 'batch' | 'scan'

function App() {
  const { translate, seo } = useLocaleContext()
  const [view, setView] = useState<AppView>('generate')
  // Bumping `token` re-applies the same value if the user scans it twice.
  const [seed, setSeed] = useState<{ value: string; token: number }>()

  useEffect(() => {
    applySeoMetadata(seo)
  }, [seo])

  const handleEditInGenerator = useCallback((value: string) => {
    setSeed((prev) => ({ value, token: (prev?.token ?? 0) + 1 }))
    setView('generate')
  }, [])

  return (
    <Layout>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-lg focus:bg-action focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-action-fg focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-focus-ring focus:ring-offset-2"
      >
        Skip to main content
      </a>
      <SEOHead />
      <Navbar />

      <main id="main-content" className="relative z-10">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex justify-center pt-6">
            <PillGroup<AppView>
              aria-label={translate('scan.tabsLabel')}
              value={view}
              onChange={setView}
              containerClassName="inline-flex gap-1 rounded-full bg-surface-inset p-1"
              itemClassName="grow-0"
              size="sm"
              options={[
                { value: 'generate', label: translate('scan.tabGenerate'), icon: <QrCode size={15} aria-hidden /> },
                { value: 'batch', label: translate('scan.tabBatch'), icon: <Layers size={15} aria-hidden /> },
                { value: 'scan', label: translate('scan.tabScan'), icon: <ScanLine size={15} aria-hidden /> },
              ]}
            />
          </div>
          <div hidden={view !== 'generate'}>
            <QRGenerator seed={seed} />
          </div>
          {view === 'batch' && <BatchGenerator />}
          {view === 'scan' && <QRScanner onEditInGenerator={handleEditInGenerator} />}
        </div>
      </main>

      <footer className="relative z-10 border-t border-border-subtle py-6 text-center text-sm text-text-secondary">
        <p className="flex items-center justify-center gap-3 flex-wrap">
          <span>{translate('layout.footerNote')}</span>
          <span className="text-border-strong select-none" aria-hidden>·</span>
          <a
            href="https://github.com/pyaethu-aung/qrcraft"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-text-secondary hover:text-text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring rounded"
          >
            <ExternalLink size={13} aria-hidden />
            GitHub
          </a>
        </p>
      </footer>
    </Layout>
  )
}

export default App
