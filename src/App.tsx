import { QRGenerator } from './components/feature/qr/QRGenerator'
import './App.css'

function App() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <span className="text-2xl">📱</span> QR Code Generator
          </h1>
        </div>
      </header>

      <main>
        <QRGenerator />
      </main>

      <footer className="py-8 text-center text-slate-400 text-sm">
        <p>Client-side only. No data is stored.</p>
      </footer>
    </div>
  )
}

export default App
