import { useRef, useCallback, useId, useState } from 'react'
import { Share2, Download, Check } from 'lucide-react'

import { QRControls } from './QRControls'
import { QRPreview } from './QRPreview'
import { useQRGenerator } from '../../../hooks/useQRGenerator'
import { useQRDesign } from '../../../hooks/useQRDesign'
import { useQRShare } from '../../../hooks/useQRShare'
import { useWiFiConfig } from '../../../hooks/useWiFiConfig'
import { useLocaleContext } from '../../../hooks/LocaleProvider'
import type { QRContentMode } from '../../../types/qr'

export const QRGenerator = () => {
  const [contentMode, setContentMode] = useState<QRContentMode>('text')
  const { wifiConfig, wifiString, setSsid, setPassword, setSecurity, setHidden } = useWiFiConfig()

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
    recentDownload,
  } = useQRGenerator(contentMode === 'wifi' ? wifiString : undefined)

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

  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const { share, isSharing, shareRequest } = useQRShare()
  const shareStatusId = useId()

  const handleShareClick = useCallback(() => {
    void share(canvasRef.current)
  }, [share])

  const isShareDisabled = !liveValue || isSharing

  const shareStatusMessage = (() => {
    if (!shareRequest) return undefined
    switch (shareRequest.status) {
      case 'shared':
        if (shareRequest.method === 'clipboard') return translate('preview.shareStatusClipboard')
        if (shareRequest.method === 'download') return translate('preview.shareStatusDownloaded')
        return translate('preview.shareStatusShared')
      case 'failed':
        return shareRequest.errorMessage ?? translate('preview.shareStatusFailed')
      default:
        return undefined
    }
  })()

  const actionStatusMessage = shareStatusMessage ?? (recentDownload ? translate('controls.downloadSuccess') : undefined)

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

        <div className="rounded-xl border border-border-strong bg-surface-overlay p-8 shadow-lg w-full max-w-full overflow-hidden">
          <div className="grid gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <div className="order-2 md:order-1 space-y-5">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-text-secondary">
                  {translate('config.sectionLabel')}
                </p>
                <h3 className="mt-0.5 text-2xl font-bold text-text-primary">
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
                correctionHint={translate('controls.correctionHint')}
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
                inputError={inputError ?? undefined}
                contentMode={contentMode}
                onContentModeChange={setContentMode}
                contentModeTextLabel={translate('controls.contentModeText')}
                contentModeWifiLabel={translate('controls.contentModeWifi')}
                wifiConfig={wifiConfig}
                onWifiSsidChange={setSsid}
                onWifiPasswordChange={setPassword}
                onWifiSecurityChange={setSecurity}
                onWifiHiddenChange={setHidden}
                wifiCorrectionHint={translate('controls.wifiCorrectionHint')}
              />
            </div>

            <div className="order-1 md:order-2 space-y-5">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-text-secondary">
                  {translate('preview.sectionLabel')}
                </p>
                <h3 className="mt-0.5 text-2xl font-bold text-text-primary">
                  {translate('preview.sectionTitle')}
                </h3>
              </div>
              <QRPreview
                ref={canvasRef}
                value={liveValue}
                ecLevel={inputEcLevel}
                fgColor={inputFgColor}
                bgColor={inputBgColor}
                designConfig={designConfig}
                logoDataUrl={logoDataUrl}
                logoSize={logoSize}
                size={300}
              />
            </div>
          </div>

          {/* Unified action row */}
          <div className="mt-8 border-t border-border-subtle pt-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => void downloadPng(designConfig, logoDataUrl, logoSize)}
                disabled={!canDownload}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-border-subtle bg-surface-raised px-4 text-sm font-medium text-text-primary transition-colors hover:bg-surface-inset focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {recentDownload === 'png' ? <Check size={16} aria-hidden className="text-action" /> : <Download size={16} aria-hidden />}
                {translate('controls.downloadPng')}
              </button>
              <button
                type="button"
                onClick={() => void downloadSvg(designConfig, logoDataUrl, logoSize)}
                disabled={!canDownload}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-border-subtle bg-surface-raised px-4 text-sm font-medium text-text-primary transition-colors hover:bg-surface-inset focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {recentDownload === 'svg' ? <Check size={16} aria-hidden className="text-action" /> : <Download size={16} aria-hidden />}
                {translate('controls.downloadSvg')}
              </button>
              <button
                type="button"
                data-testid="share-qr-button"
                disabled={isShareDisabled}
                aria-label={translate('preview.shareButtonLabel')}
                aria-busy={isSharing}
                aria-disabled={isShareDisabled}
                aria-describedby={actionStatusMessage ? shareStatusId : undefined}
                onClick={handleShareClick}
                className={`flex h-11 w-full items-center justify-center gap-2 rounded-xl border px-4 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
                  liveValue
                    ? 'border-border-subtle bg-surface-raised text-text-primary focus-visible:ring-focus-ring hover:bg-surface-inset'
                    : 'border-border-subtle bg-surface-inset text-text-disabled'
                } ${isShareDisabled ? 'cursor-not-allowed opacity-70' : ''} ${isSharing ? 'cursor-wait' : ''}`}
              >
                <Share2 size={16} aria-hidden />
                {translate('preview.shareButtonLabel')}
              </button>
            </div>
            {actionStatusMessage && (
              <p
                role="status"
                aria-live="polite"
                id={shareStatusId}
                className="mt-3 text-sm text-text-secondary text-center"
              >
                {actionStatusMessage}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
