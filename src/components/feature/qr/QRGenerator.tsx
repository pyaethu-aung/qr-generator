import { useRef, useCallback, useId, useState, useEffect } from 'react'
import { Share2, Download, Check } from 'lucide-react'

import { QRControls } from './QRControls'
import { QRPreview } from './QRPreview'
import { useQRGenerator } from '../../../hooks/useQRGenerator'
import { useQRDesign } from '../../../hooks/useQRDesign'
import { useQRShare } from '../../../hooks/useQRShare'
import { useWiFiConfig } from '../../../hooks/useWiFiConfig'
import { useVCardConfig } from '../../../hooks/useVCardConfig'
import { useEmailConfig } from '../../../hooks/useEmailConfig'
import { useSmsConfig } from '../../../hooks/useSmsConfig'
import { useTelConfig } from '../../../hooks/useTelConfig'
import { useGeoConfig } from '../../../hooks/useGeoConfig'
import { useVEventConfig } from '../../../hooks/useVEventConfig'
import { useCryptoConfig } from '../../../hooks/useCryptoConfig'
import { useLocaleContext } from '../../../hooks/LocaleProvider'
import { isEndBeforeStart } from '../../../utils/vevent'
import { isValidCryptoAddress } from '../../../utils/crypto'
import type { QRContentMode } from '../../../types/qr'

const CONTENT_MODE_KEY = 'qr-generator:draft:content-mode'
const CONTENT_MODES: readonly QRContentMode[] = ['text', 'wifi', 'vcard', 'email', 'sms', 'tel', 'geo', 'vevent', 'crypto']

function loadContentMode(): QRContentMode {
  try {
    const stored = localStorage.getItem(CONTENT_MODE_KEY) as QRContentMode | null
    return stored && CONTENT_MODES.includes(stored) ? stored : 'text'
  } catch {
    return 'text'
  }
}

export const QRGenerator = () => {
  const [contentMode, setContentMode] = useState<QRContentMode>(loadContentMode)
  const { wifiConfig, wifiString, setSsid, setPassword, setSecurity, setHidden } = useWiFiConfig()
  const { vcardConfig, vcardString, setFirstName, setLastName, setPhone, setEmail, setCompany, setJobTitle, setWebsite } = useVCardConfig()
  const { emailConfig, emailString, setTo, setSubject, setBody } = useEmailConfig()
  const { smsConfig, smsString, setNumber, setMessage } = useSmsConfig()
  const { telConfig, telString, setNumber: setTelNumber } = useTelConfig()
  const { geoConfig, geoString, setLatitude: setGeoLatitude, setLongitude: setGeoLongitude } = useGeoConfig()
  const { veventConfig, veventString, setSummary: setVEventSummary, setStart: setVEventStart, setEnd: setVEventEnd, setAllDay: setVEventAllDay, setLocation: setVEventLocation, setDescription: setVEventDescription } = useVEventConfig()
  const { cryptoConfig, cryptoString, setField: setCryptoField } = useCryptoConfig()

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
    isPending,
  } = useQRGenerator(contentMode === 'wifi' ? wifiString : contentMode === 'vcard' ? vcardString : contentMode === 'email' ? emailString : contentMode === 'sms' ? smsString : contentMode === 'tel' ? telString : contentMode === 'geo' ? geoString : contentMode === 'vevent' ? veventString : contentMode === 'crypto' ? cryptoString : undefined)

  const {
    designConfig,
    setEyeFrameShape,
    setEyeCenterShape,
    setEyeFrameColor,
    setEyeCenterColor,
    setPixelPattern,
    isRiskyPattern,
    dismissWarning,
    logoDataUrl,
    setLogoDataUrl,
    logoSize,
    setLogoSize,
    maxLogoSize,
    frameConfig,
    setFrameStyle,
    setFrameText,
    setFrameColor,
    setFramePosition,
    frameTextLimit,
  } = useQRDesign(inputValue, inputEcLevel)

  const { translate } = useLocaleContext()

  // Printed/dense modes need maximum damage tolerance
  useEffect(() => {
    if (contentMode !== 'text') setInputEcLevel('H')
  }, [contentMode, setInputEcLevel])

  // Return the user to the mode they last used.
  useEffect(() => {
    try {
      localStorage.setItem(CONTENT_MODE_KEY, contentMode)
    } catch {
      // Ignore if localStorage is unavailable
    }
  }, [contentMode])

  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const { share, isSharing, shareRequest } = useQRShare()
  const shareStatusId = useId()
  const [qrAnnouncement, setQrAnnouncement] = useState('')

  useEffect(() => {
    const text = liveValue ? translate('preview.qrUpdated') : ''
    const t = setTimeout(() => setQrAnnouncement(text), liveValue ? 500 : 0)
    return () => clearTimeout(t)
  }, [liveValue, translate])

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

  // When the event form knows exactly why no QR exists, the preview's empty
  // state says so — on phones the form and preview are a screen apart, so a
  // wordless dashed box would leave the cause and the effect disconnected.
  const previewPlaceholderHint = (() => {
    if (contentMode === 'vevent' && !veventString) {
      if (isEndBeforeStart(veventConfig)) return translate('controls.veventEndError')
      const hasSummary = !!veventConfig.summary.trim()
      const hasStart = !!veventConfig.start.trim()
      if (hasSummary && !hasStart) return translate('controls.veventNeedStartHint')
      if (!hasSummary && hasStart) return translate('controls.veventNeedTitleHint')
      const hasOptional = !!veventConfig.location.trim() || !!veventConfig.description.trim()
      if (!hasSummary && !hasStart && hasOptional) return translate('controls.veventNeedBothHint')
      return undefined
    }
    if (contentMode === 'crypto' && !cryptoString) {
      const addressFilled = !!cryptoConfig.address.trim()
      if (addressFilled && !isValidCryptoAddress(cryptoConfig.network, cryptoConfig.address)) {
        return cryptoConfig.network === 'bitcoin'
          ? translate('controls.cryptoAddressErrorBitcoin')
          : translate('controls.cryptoAddressErrorEthereum')
      }
      const hasOptional = !!cryptoConfig.amount.trim() || !!cryptoConfig.label.trim()
      if (!addressFilled && hasOptional) return translate('controls.cryptoAddressNeededHint')
      return undefined
    }
    return undefined
  })()

  return (
    <section className="relative isolate overflow-x-hidden px-2 pb-12 sm:px-6 lg:px-8">
      <span className="sr-only" aria-live="polite" aria-atomic="true">{qrAnnouncement}</span>
      <div className="relative mx-auto max-w-6xl space-y-3">
        <div className="text-center pt-10 pb-4 px-6 sm:px-12">
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-action">
            {translate('hero.badge')}
          </p>
          <h2 className="mt-1.5 text-2xl font-bold text-text-primary sm:text-4xl">
            {translate('hero.title')}
          </h2>
        </div>

        <div className="rounded-xl border border-border-strong bg-surface-overlay p-8 shadow-lg w-full max-w-full overflow-clip">
          <div className="grid gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <div className="order-2 md:order-1 space-y-5 min-w-0">
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
                hasContent={!!liveValue}
                ecLevel={inputEcLevel}
                onEcLevelChange={setInputEcLevel}
                fgColor={inputFgColor}
                onFgColorChange={setInputFgColor}
                bgColor={inputBgColor}
                onBgColorChange={setInputBgColor}
                correctionLabel={translate('controls.correctionLabel')}
                correctionHint={translate('controls.correctionHint')}
                correctionBelowRecommendedLabel={translate('controls.correctionBelowRecommended')}
                correctionOptions={[
                  { value: 'L', label: translate('controls.correctionLow') },
                  { value: 'M', label: translate('controls.correctionMedium') },
                  { value: 'Q', label: translate('controls.correctionQuartile') },
                  { value: 'H', label: translate('controls.correctionHigh') },
                ]}
                eyeFrameShape={designConfig.eyeFrameShape}
                onEyeFrameShapeChange={setEyeFrameShape}
                eyeCenterShape={designConfig.eyeCenterShape}
                onEyeCenterShapeChange={setEyeCenterShape}
                eyeFrameColor={designConfig.eyeFrameColor}
                onEyeFrameColorChange={setEyeFrameColor}
                eyeCenterColor={designConfig.eyeCenterColor}
                onEyeCenterColorChange={setEyeCenterColor}
                eyeFrameLabel={translate('controls.eyeFrameLabel')}
                eyeCenterLabel={translate('controls.eyeCenterLabel')}
                eyeFrameColorLabel={translate('controls.eyeFrameColorLabel')}
                eyeCenterColorLabel={translate('controls.eyeCenterColorLabel')}
                eyeColorMatchForegroundLabel={translate('controls.eyeColorMatchForeground')}
                pixelPattern={designConfig.pixelPattern}
                onPixelPatternChange={setPixelPattern}
                pixelPatternLabel={translate('controls.pixelPatternLabel')}
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
                contentTypeLabel={translate('controls.contentTypeLabel')}
                contentModeTextLabel={translate('controls.contentModeText')}
                contentModeWifiLabel={translate('controls.contentModeWifi')}
                wifiConfig={wifiConfig}
                onWifiSsidChange={setSsid}
                onWifiPasswordChange={setPassword}
                onWifiSecurityChange={setSecurity}
                onWifiHiddenChange={setHidden}
                wifiCorrectionHint={translate('controls.wifiCorrectionHint')}
                contentModeVCardLabel={translate('controls.contentModeVCard')}
                vcardConfig={vcardConfig}
                onVCardFirstNameChange={setFirstName}
                onVCardLastNameChange={setLastName}
                onVCardPhoneChange={setPhone}
                onVCardEmailChange={setEmail}
                onVCardCompanyChange={setCompany}
                onVCardJobTitleChange={setJobTitle}
                onVCardWebsiteChange={setWebsite}
                vcardCorrectionHint={translate('controls.vcardCorrectionHint')}
                contentModeEmailLabel={translate('controls.contentModeEmail')}
                emailConfig={emailConfig}
                onEmailToChange={setTo}
                onEmailSubjectChange={setSubject}
                onEmailBodyChange={setBody}
                emailCorrectionHint={translate('controls.emailCorrectionHint')}
                contentModeSmsLabel={translate('controls.contentModeSms')}
                smsConfig={smsConfig}
                onSmsNumberChange={setNumber}
                onSmsMessageChange={setMessage}
                smsCorrectionHint={translate('controls.smsCorrectionHint')}
                contentModeTelLabel={translate('controls.contentModeTel')}
                telConfig={telConfig}
                onTelNumberChange={setTelNumber}
                telCorrectionHint={translate('controls.telCorrectionHint')}
                contentModeGeoLabel={translate('controls.contentModeGeo')}
                geoConfig={geoConfig}
                onGeoLatitudeChange={setGeoLatitude}
                onGeoLongitudeChange={setGeoLongitude}
                geoCorrectionHint={translate('controls.geoCorrectionHint')}
                contentModeVEventLabel={translate('controls.contentModeVEvent')}
                veventConfig={veventConfig}
                onVEventSummaryChange={setVEventSummary}
                onVEventStartChange={setVEventStart}
                onVEventEndChange={setVEventEnd}
                onVEventAllDayChange={setVEventAllDay}
                onVEventLocationChange={setVEventLocation}
                onVEventDescriptionChange={setVEventDescription}
                veventCorrectionHint={translate('controls.veventCorrectionHint')}
                contentModeCryptoLabel={translate('controls.contentModeCrypto')}
                cryptoConfig={cryptoConfig}
                onCryptoChange={setCryptoField}
                cryptoCorrectionHint={translate('controls.cryptoCorrectionHint')}
                frameStyle={frameConfig.style}
                onFrameStyleChange={setFrameStyle}
                frameText={frameConfig.text}
                onFrameTextChange={setFrameText}
                frameColor={frameConfig.color}
                onFrameColorChange={setFrameColor}
                framePosition={frameConfig.position}
                onFramePositionChange={setFramePosition}
                frameTextLimit={frameTextLimit}
                frameLabel={translate('controls.frameLabel')}
                frameHintLabel={translate('controls.frameHint')}
                frameStyleHeadingLabel={translate('controls.frameStyleHeading')}
                frameTextLabel={translate('controls.frameTextLabel')}
                frameTextPlaceholder={translate('controls.frameTextPlaceholder')}
                frameTextHint={translate('controls.frameTextHint')}
                frameTextLimitReachedLabel={translate('controls.frameTextLimitReached')}
                frameColorLabel={translate('controls.frameColorLabel')}
                frameColorLowContrastLabel={translate('controls.frameColorLowContrast')}
                framePositionLabel={translate('controls.framePositionLabel')}
                framePositionTopLabel={translate('controls.framePositionTop')}
                framePositionBottomLabel={translate('controls.framePositionBottom')}
                frameStyleLabels={{
                  None: translate('controls.frameStyleNone'),
                  Banner: translate('controls.frameStyleBanner'),
                  Card: translate('controls.frameStyleCard'),
                  Ticket: translate('controls.frameStyleTicket'),
                  Label: translate('controls.frameStyleLabel'),
                  Bubble: translate('controls.frameStyleBubble'),
                  Ticks: translate('controls.frameStyleTicks'),
                  Photo: translate('controls.frameStylePhoto'),
                }}
              />
            </div>

            <div className="order-1 md:order-2 space-y-4 min-w-0">
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
                frameConfig={frameConfig}
                logoDataUrl={logoDataUrl}
                logoSize={logoSize}
                size={300}
                isPending={isPending}
                placeholderHint={previewPlaceholderHint}
              />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => void downloadPng(designConfig, frameConfig, logoDataUrl, logoSize)}
                  disabled={!canDownload}
                  className="flex h-11 w-full items-center justify-center gap-1.5 rounded-xl border border-border-subtle bg-surface-raised px-3 text-sm font-medium text-text-primary transition-colors hover:bg-surface-inset focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {recentDownload === 'png' ? <Check size={15} aria-hidden className="text-action shrink-0" /> : <Download size={15} aria-hidden className="shrink-0" />}
                  <span className="truncate">{translate('controls.downloadPng')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => void downloadSvg(designConfig, frameConfig, logoDataUrl, logoSize)}
                  disabled={!canDownload}
                  className="flex h-11 w-full items-center justify-center gap-1.5 rounded-xl border border-border-subtle bg-surface-raised px-3 text-sm font-medium text-text-primary transition-colors hover:bg-surface-inset focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {recentDownload === 'svg' ? <Check size={15} aria-hidden className="text-action shrink-0" /> : <Download size={15} aria-hidden className="shrink-0" />}
                  <span className="truncate">{translate('controls.downloadSvg')}</span>
                </button>
                <button
                  type="button"
                  data-testid="share-qr-button"
                  disabled={isShareDisabled}
                  aria-busy={isSharing}
                  aria-disabled={isShareDisabled}
                  aria-describedby={actionStatusMessage ? shareStatusId : undefined}
                  onClick={handleShareClick}
                  className={`flex h-11 w-full items-center justify-center gap-1.5 rounded-xl border px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
                    liveValue
                      ? 'border-border-subtle bg-surface-raised text-text-primary focus-visible:ring-focus-ring hover:bg-surface-inset'
                      : 'border-border-subtle bg-surface-inset text-text-disabled'
                  } ${isShareDisabled ? 'cursor-not-allowed opacity-50' : ''} ${isSharing ? 'cursor-wait' : ''}`}
                >
                  <Share2 size={15} aria-hidden className="shrink-0" />
                  <span className="truncate">{translate('preview.shareButtonLabel')}</span>
                </button>
              </div>
              {actionStatusMessage && (
                <p
                  role="status"
                  aria-live="polite"
                  id={shareStatusId}
                  className="text-sm text-text-secondary text-center"
                >
                  {actionStatusMessage}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
