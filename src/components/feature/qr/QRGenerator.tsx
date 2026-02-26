import { QRControls } from './QRControls'
import { QRPreview } from './QRPreview'
import { useQRGenerator } from '../../../hooks/useQRGenerator'
import { useLocaleContext } from '../../../hooks/LocaleProvider'

export const QRGenerator = () => {
  const {
    config,
    inputValue,
    setInputValue,
    inputEcLevel,
    setInputEcLevel,
    inputFgColor,
    setInputFgColor,
    inputBgColor,
    setInputBgColor,
    generateQRCode,
    isGenerating,
    downloadPng,
    downloadSvg,
    inputError,
    canGenerate,
  } = useQRGenerator()

  const { translate } = useLocaleContext()

  return (
    <section className="relative isolate overflow-hidden px-2 pb-12 pt-8 sm:px-6 lg:px-8">
      {/* Decorative gradients (FR-005 exceptions) */}
      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-20 dark:opacity-60">
        <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-sky-400/10 to-transparent blur-3xl dark:from-sky-400/40" />
        <div className="absolute right-1/3 top-6 h-64 w-64 rounded-full bg-fuchsia-500/10 blur-3xl dark:bg-fuchsia-500/40" />
        <div className="absolute left-0 bottom-6 h-72 w-72 rounded-full bg-indigo-500/10 blur-[120px] dark:bg-indigo-500/30" />
      </div>

      <div className="relative mx-auto max-w-6xl space-y-6">
        <div className="text-center px-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-action">
            {translate('hero.badge')}
          </p>
          <h2 className="mt-2 text-2xl font-bold text-text-primary transition-colors sm:text-4xl">
            {translate('hero.title')}
          </h2>
          <p className="mt-2 text-sm text-text-secondary transition-colors sm:text-base">{translate('hero.subtitle')}</p>
        </div>

        <div className="rounded-[32px] border border-border-strong bg-surface-overlay p-4 sm:p-6 shadow-2xl backdrop-blur-xl w-full max-w-full overflow-hidden transition-all">
          <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-10">
            <div className="space-y-5">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-text-secondary">
                  {translate('config.sectionLabel')}
                </p>
                <h3 className="text-2xl font-semibold text-text-primary">
                  {translate('config.sectionTitle')}
                </h3>
              </div>
              <QRControls
                value={inputValue}
                onValueChange={setInputValue}
                ecLevel={inputEcLevel}
                onEcLevelChange={setInputEcLevel}
                fgColor={inputFgColor}
                onFgColorChange={setInputFgColor}
                bgColor={inputBgColor}
                onBgColorChange={setInputBgColor}
                onGenerate={generateQRCode}
                isGenerating={isGenerating}
                onDownloadPng={() => void downloadPng()}
                onDownloadSvg={() => void downloadSvg()}
                canDownload={!!config.value}
                inputError={inputError ?? undefined}
                canGenerate={canGenerate}
              />
            </div>

            <div className="space-y-5">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-text-secondary">
                  {translate('preview.sectionLabel')}
                </p>
                <h3 className="text-2xl font-semibold text-text-primary">
                  {translate('preview.sectionTitle')}
                </h3>
              </div>
              <div className="flex flex-1 items-center justify-center rounded-2xl border border-border-subtle bg-surface-inset p-4 sm:p-6 shadow-inner transition-colors">
                <QRPreview {...config} className="w-full max-w-full" style={{ width: '100%', height: 'auto', maxWidth: '100%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
