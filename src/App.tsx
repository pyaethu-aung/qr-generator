import { useEffect } from 'react'

import { QRGenerator } from './components/feature/qr/QRGenerator'
import './App.css'
import { useLocaleContext } from './hooks/LocaleProvider'
import { applySeoMetadata } from './utils/metadata'
import { Navbar } from './components/Navigation/Navbar'
import { Layout } from './components/Layout/Layout'
import SEOHead from './components/common/SEOHead'

function App() {
  const { translate, seo } = useLocaleContext()

  useEffect(() => {
    applySeoMetadata(seo)
  }, [seo])

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
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <QRGenerator />
        </div>
      </main>

      <footer className="relative z-10 h-16 border-t border-border-subtle py-6 text-center text-sm text-text-secondary">
        <p>{translate('layout.footerNote')}</p>
      </footer>
    </Layout>
  )
}

export default App
