import { useRef, useCallback, useId, useState, useEffect } from 'react'
import { Share2, Download, Check, Link2 } from 'lucide-react'

import { QRControls } from './QRControls'
import { QRPreview } from './QRPreview'
import { QRHistory } from './QRHistory'
import { QRPresets } from './QRPresets'
import { useQRGenerator } from '../../../hooks/useQRGenerator'
import { useQRDesign } from '../../../hooks/useQRDesign'
import { useQRShare } from '../../../hooks/useQRShare'
import { useQRHistory } from '../../../hooks/useQRHistory'
import { useQRPresets } from '../../../hooks/useQRPresets'
import type { HistoryEntry } from '../../../hooks/useQRHistory'
import type { PresetEntry } from '../../../hooks/useQRPresets'
import { PRESETS_MAX } from '../../../utils/presets'
import { renderQrPngBlob } from '../../../utils/export/pngRenderer'
import { DEFAULT_DESIGN_CONFIG } from '../../../utils/persistedDesign'
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
import { buildShareUrl, type ShareContentData } from '../../../utils/shareConfig'
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

export interface QRGeneratorProps {
  /**
   * A value round-tripped from the scanner. Each scan bumps `token`; the effect below
   * applies the seed once per token by switching to Text mode and loading the raw string.
   */
  seed?: { value: string; token: number }
}

export const QRGenerator = ({ seed }: QRGeneratorProps = {}) => {
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
    inputTransparentBg,
    setInputTransparentBg,
    downloadPng,
    downloadSvg,
    inputError,
    canDownload,
    recentDownload,
    isPending,
  } = useQRGenerator(contentMode === 'wifi' ? wifiString : contentMode === 'vcard' ? vcardString : contentMode === 'email' ? emailString : contentMode === 'sms' ? smsString : contentMode === 'tel' ? telString : contentMode === 'geo' ? geoString : contentMode === 'vevent' ? veventString : contentMode === 'crypto' ? cryptoString : undefined)

  const {
    designConfig,
    setDesignConfig,
    setEyeFrameShape,
    setEyeCenterShape,
    setEyeFrameColor,
    setEyeCenterColor,
    setPixelPattern,
    setFgGradient,
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
    applyFrameConfig,
    frameTextLimit,
  } = useQRDesign(inputValue, inputEcLevel)

  const { translate } = useLocaleContext()
  const { history, addEntry, clear: clearHistory } = useQRHistory()
  const { presets, save: savePreset, remove: removePreset } = useQRPresets()

  // Apply a scanner round-trip once per token: load the raw decoded string into Text mode.
  const lastSeedToken = useRef(0)
  useEffect(() => {
    if (!seed || seed.token === lastSeedToken.current) return
    lastSeedToken.current = seed.token
    setContentMode('text')
    setInputValue(seed.value)
  }, [seed, setInputValue])

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

  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'error'>('idle')
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => () => {
    if (copyTimerRef.current) clearTimeout(copyTimerRef.current)
  }, [])

  const handleCopyLink = useCallback(async () => {
    const content: ShareContentData =
      contentMode === 'wifi' ? wifiConfig
        : contentMode === 'vcard' ? vcardConfig
          : contentMode === 'email' ? emailConfig
            : contentMode === 'sms' ? smsConfig
              : contentMode === 'tel' ? telConfig
                : contentMode === 'geo' ? geoConfig
                  : contentMode === 'vevent' ? veventConfig
                    : contentMode === 'crypto' ? cryptoConfig
                      : inputValue
    const url = buildShareUrl({
      mode: contentMode,
      content,
      ecLevel: inputEcLevel,
      fgColor: inputFgColor,
      bgColor: inputBgColor,
      design: designConfig,
      frame: frameConfig,
    })
    if (copyTimerRef.current) clearTimeout(copyTimerRef.current)
    try {
      await navigator.clipboard.writeText(url)
      setCopyState('copied')
    } catch {
      setCopyState('error')
    }
    copyTimerRef.current = setTimeout(() => setCopyState('idle'), 2000)
  }, [contentMode, wifiConfig, vcardConfig, emailConfig, smsConfig, telConfig, geoConfig, veventConfig, cryptoConfig, inputValue, inputEcLevel, inputFgColor, inputBgColor, designConfig, frameConfig])

  const captureHistoryEntry = useCallback(async () => {
    if (!liveValue) return
    try {
      const blob = await renderQrPngBlob(liveValue, {
        ecLevel: inputEcLevel,
        fgColor: inputFgColor,
        bgColor: inputBgColor,
        designConfig: DEFAULT_DESIGN_CONFIG,
        size: 128,
      })
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(blob)
      })
      addEntry({ value: liveValue, fgColor: inputFgColor, bgColor: inputBgColor, ecLevel: inputEcLevel, thumbnailDataUrl: dataUrl })
    } catch {
      // best-effort — never block the download
    }
  }, [liveValue, inputEcLevel, inputFgColor, inputBgColor, addEntry])

  const handleRestore = useCallback((entry: HistoryEntry) => {
    setContentMode('text')
    setInputValue(entry.value)
    setInputFgColor(entry.fgColor)
    setInputBgColor(entry.bgColor)
    setInputEcLevel(entry.ecLevel)
  }, [setInputValue, setInputFgColor, setInputBgColor, setInputEcLevel])

  const handleApplyPreset = useCallback((preset: PresetEntry) => {
    setInputFgColor(preset.fgColor)
    setInputBgColor(preset.bgColor)
    setInputTransparentBg(preset.transparentBg)
    setInputEcLevel(preset.ecLevel)
    setDesignConfig(preset.designConfig)
    applyFrameConfig(preset.frameConfig)
  }, [setInputFgColor, setInputBgColor, setInputTransparentBg, setInputEcLevel, setDesignConfig, applyFrameConfig])

  const handleSavePreset = useCallback((name: string) => {
    savePreset({
      name,
      fgColor: inputFgColor,
      bgColor: inputBgColor,
      transparentBg: inputTransparentBg,
      ecLevel: inputEcLevel,
      designConfig,
      frameConfig,
    })
  }, [savePreset, inputFgColor, inputBgColor, inputTransparentBg, inputEcLevel, designConfig, frameConfig])

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

  const actionStatusMessage =
    shareStatusMessage
    ?? (recentDownload ? translate('controls.downloadSuccess') : undefined)
    ?? (copyState === 'copied' ? translate('controls.copyLinkSuccess') : undefined)
    ?? (copyState === 'error' ? translate('controls.copyLinkError') : undefined)

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
                capacityUsageLabel={translate('controls.capacityUsage')}
                capacityNearLimitLabel={translate('controls.capacityNearLimit')}
                capacityOverLimitLabel={translate('controls.capacityOverLimit')}
                fgColor={inputFgColor}
                onFgColorChange={setInputFgColor}
                bgColor={inputBgColor}
                onBgColorChange={setInputBgColor}
                transparentBg={inputTransparentBg}
                onTransparentBgChange={setInputTransparentBg}
                bgTransparentLabel={translate('controls.bgTransparentLabel')}
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
                fgGradient={designConfig.fgGradient}
                onFgGradientChange={setFgGradient}
                fillTypeLabel={translate('controls.fillTypeLabel')}
                fillSolidLabel={translate('controls.fillSolid')}
                fillLinearLabel={translate('controls.fillLinear')}
                fillRadialLabel={translate('controls.fillRadial')}
                gradientStartLabel={translate('controls.gradientStartLabel')}
                gradientEndLabel={translate('controls.gradientEndLabel')}
                gradientDirectionLabel={translate('controls.gradientDirectionLabel')}
                gradientDirectionLabels={{
                  'to-t': translate('controls.gradientDirTop'),
                  'to-tr': translate('controls.gradientDirTopRight'),
                  'to-r': translate('controls.gradientDirRight'),
                  'to-br': translate('controls.gradientDirBottomRight'),
                  'to-b': translate('controls.gradientDirBottom'),
                  'to-bl': translate('controls.gradientDirBottomLeft'),
                  'to-l': translate('controls.gradientDirLeft'),
                  'to-tl': translate('controls.gradientDirTopLeft'),
                }}
                customizedLabel={translate('controls.customized')}
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
                  Circle: translate('controls.frameStyleCircle'),
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
                  onClick={() => { void downloadPng(designConfig, frameConfig, logoDataUrl, logoSize); void captureHistoryEntry() }}
                  disabled={!canDownload}
                  className="flex h-11 w-full items-center justify-center gap-1.5 rounded-xl border border-border-subtle bg-surface-raised px-3 text-sm font-medium text-text-primary transition-colors hover:bg-surface-inset focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {recentDownload === 'png' ? <Check size={15} aria-hidden className="text-action shrink-0" /> : <Download size={15} aria-hidden className="shrink-0" />}
                  <span className="truncate">{translate('controls.downloadPng')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => { void downloadSvg(designConfig, frameConfig, logoDataUrl, logoSize); void captureHistoryEntry() }}
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
              <div className="space-y-1.5">
                <button
                  type="button"
                  onClick={() => void handleCopyLink()}
                  disabled={!canDownload}
                  className="flex h-11 w-full items-center justify-center gap-1.5 rounded-xl border border-border-subtle bg-surface-raised px-3 text-sm font-medium text-text-primary transition-colors hover:bg-surface-inset focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {copyState === 'copied' ? <Check size={15} aria-hidden className="text-action shrink-0" /> : <Link2 size={15} aria-hidden className="shrink-0" />}
                  <span className="truncate">{copyState === 'copied' ? translate('controls.copyLinkSuccess') : translate('controls.copyLink')}</span>
                </button>
                <p className="text-xs text-text-secondary text-center">
                  {translate('controls.copyLinkHint')}
                </p>
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
        <QRPresets
          presets={presets}
          onApply={handleApplyPreset}
          onDelete={removePreset}
          onSave={handleSavePreset}
          maxPresets={PRESETS_MAX}
          sectionLabel={translate('presets.sectionLabel')}
          emptyHint={translate('presets.emptyHint')}
          saveButton={translate('presets.saveButton')}
          savedLabel={translate('presets.savedLabel')}
          saveNamePlaceholder={translate('presets.saveNamePlaceholder')}
          saveNameAriaLabel={translate('presets.saveNameAriaLabel')}
          saveConfirmAriaLabel={translate('presets.saveConfirmAriaLabel')}
          saveCancelAriaLabel={translate('presets.saveCancelAriaLabel')}
          deleteAriaLabel={translate('presets.deleteAriaLabel')}
          confirmDeleteAriaLabel={translate('presets.confirmDeleteAriaLabel')}
          appliedLabel={translate('presets.appliedLabel')}
        />
        <QRHistory
          history={history}
          onRestore={handleRestore}
          onClear={clearHistory}
          sectionLabel={translate('history.sectionLabel')}
          clearAriaLabel={translate('history.clearAriaLabel')}
        />
      </div>
    </section>
  )
}
