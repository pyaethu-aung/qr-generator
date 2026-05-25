import { QRControls } from './QRControls'
import { QRPreview } from './QRPreview'
import { useQRGenerator } from '../../../hooks/useQRGenerator'
import { useQRDesign } from '../../../hooks/useQRDesign'
import { useLocaleContext } from '../../../hooks/LocaleProvider'

export const QRGenerator = () => {
  const {
    liveValue,
    inputValue,
    setInputValue,
    inputEcLevel,
    setInputEcLevel,
    inputFgColor,
    setInputFgColor,
    inputBgColor,
    setInputBgColor,
    downloadPng,
    downloadSvg,
    inputError,
    canDownload,
  } = useQRGenerator()

  const {
    designConfig,
    setEyeShape,
    setPixelPattern,
    isRiskyPattern,
    dismissWarning,
    logoDataUrl,
    setLogoDataUrl,
    logoSize,
    setLogoSize,
    maxLogoSize,
  } = useQRDesign(inputValue, inputEcLevel)

  const { translate } = useLocaleContext()

  return (
    <section className="relative isolate overflow-x-hidden px-2 pb-12 sm:px-6 lg:px-8">
      <div className="relative mx-auto max-w-6xl space-y-3">
        <div className="text-center pt-16 pb-8 px-6 sm:px-12">
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-action">
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
                correctionLabel={translate('controls.correctionLabel')}
                correctionOptions={[
                  { value: 'L', label: translate('controls.correctionLow') },
                  { value: 'M', label: translate('controls.correctionMedium') },
                  { value: 'Q', label: translate('controls.correctionQuartile') },
                  { value: 'H', label: translate('controls.correctionHigh') },
                ]}
                eyeShape={designConfig.eyeShape}
                onEyeShapeChange={setEyeShape}
                pixelPattern={designConfig.pixelPattern}
                onPixelPatternChange={setPixelPattern}
                isRiskyPattern={isRiskyPattern}
                onDismissWarning={dismissWarning}
                dismissWarningAriaLabel={translate('controls.dismissWarningAriaLabel')}
                logoDataUrl={logoDataUrl}
                onLogoChange={setLogoDataUrl}
                logoSize={logoSize}
                onLogoSizeChange={setLogoSize}
                maxLogoSize={maxLogoSize}
                onDownloadPng={() => void downloadPng(designConfig, logoDataUrl, logoSize)}
                onDownloadSvg={() => void downloadSvg(designConfig, logoDataUrl, logoSize)}
                canDownload={canDownload}
                inputError={inputError ?? undefined}
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
                value={liveValue}
                ecLevel={inputEcLevel}
                fgColor={inputFgColor}
                bgColor={inputBgColor}
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
