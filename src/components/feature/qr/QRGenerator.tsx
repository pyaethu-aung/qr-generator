import { QRControls } from './QRControls'
import { QRPreview } from './QRPreview'
import { useQRGenerator } from '../../../hooks/useQRGenerator'
import { useQRDesign } from '../../../hooks/useQRDesign'
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

  const {
    designConfig,
    inputEyeShape,
    inputPixelPattern,
    setEyeShape,
    setPixelPattern,
    isRiskyPattern,
    dismissWarning,
    commitDesignConfig,
    logoDataUrl,
    setLogoDataUrl,
    logoSize,
    setLogoSize,
    maxLogoSize,
  } = useQRDesign(inputValue, inputEcLevel)

  const handleGenerate = () => {
    commitDesignConfig()
    generateQRCode()
  }

  const { translate } = useLocaleContext()

  return (
    <section className="relative isolate overflow-hidden px-2 pb-12 sm:px-6 lg:px-8">
<div className="relative mx-auto max-w-6xl space-y-3">
        <div className="text-center pt-16 pb-8 px-6 sm:px-12">
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-text-primary">
            {translate('hero.badge')}
          </p>
          <h2 className="mt-2 text-2xl font-bold text-text-primary sm:text-4xl">
            {translate('hero.title')}
          </h2>
          <p className="mt-2 text-sm text-text-secondary sm:text-base">{translate('hero.subtitle')}</p>
        </div>

        <div className="rounded-xl border border-border-strong bg-surface-overlay p-8 shadow-2xl w-full max-w-full overflow-hidden">
          <div className="grid gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
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
                eyeShape={inputEyeShape}
                onEyeShapeChange={setEyeShape}
                pixelPattern={inputPixelPattern}
                onPixelPatternChange={setPixelPattern}
                designChangePending={inputEyeShape !== designConfig.eyeShape || inputPixelPattern !== designConfig.pixelPattern}
                isRiskyPattern={isRiskyPattern}
                onDismissWarning={dismissWarning}
                dismissWarningAriaLabel={translate('controls.dismissWarningAriaLabel')}
                logoDataUrl={logoDataUrl}
                onLogoChange={setLogoDataUrl}
                logoSize={logoSize}
                onLogoSizeChange={setLogoSize}
                maxLogoSize={maxLogoSize}
                onGenerate={handleGenerate}
                isGenerating={isGenerating}
                onDownloadPng={() => void downloadPng(designConfig, logoDataUrl, logoSize)}
                onDownloadSvg={() => void downloadSvg(designConfig, logoDataUrl, logoSize)}
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
              <QRPreview
                {...config}
                designConfig={designConfig}
                logoDataUrl={logoDataUrl}
                logoSize={logoSize}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
