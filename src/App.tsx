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
      <SEOHead />
      <Navbar />

      <main className="relative z-10 py-8 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <QRGenerator />
        </div>
      </main>

      <footer className="relative z-10 border-t border-border-subtle py-8 text-center text-sm text-text-secondary">
        <p>{translate('layout.footerNote')}</p>
      </footer>
    </Layout>
  )
}

export default App
