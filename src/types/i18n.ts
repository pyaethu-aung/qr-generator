import type { LocaleRegistry } from '../data/i18n'

export type SupportedLocale = keyof LocaleRegistry

export interface LocaleMetadata {
  code: SupportedLocale
  name: string
  toggleLabel: string
  switchTo: Record<SupportedLocale, string>
}

export interface SeoMetadata {
  title: string
  description: string
  ogTitle: string
  ogDescription: string
  ogType: string
  canonical: string
  twitterCard: string
  twitterTitle: string
  twitterDescription: string
}

export interface LayoutStrings {
  headerTitle: string
  headerSubtitle: string
  navLabel: string
  themeToggleToLight: string
  themeToggleToDark: string
  footerNote: string
}

export interface HeroStrings {
  badge: string
  title: string
  subtitle: string
}

export interface ConfigStrings {
  sectionLabel: string
  sectionTitle: string
  helper: string
}

export interface ControlStrings {
  contentLabel: string
  contentPlaceholder: string
  correctionLabel: string
  correctionHint: string
  foregroundLabel: string
  backgroundLabel: string
  generate: string
  downloadsTitle: string
  downloadPng: string
  downloadSvg: string
  downloadSuccess: string
  correctionLow: string
  correctionMedium: string
  correctionQuartile: string
  correctionHigh: string
  correctionTooltip: string
  dismissWarningAriaLabel: string
  contentModeText: string
  contentModeWifi: string
  wifiSsidLabel: string
  wifiSsidPlaceholder: string
  wifiPasswordLabel: string
  wifiPasswordPlaceholder: string
  wifiSecurityLabel: string
  wifiHiddenLabel: string
  wifiSecurityWpa: string
  wifiSecurityWep: string
  wifiSecurityNone: string
  wifiCorrectionHint: string
  wifiShowPassword: string
  wifiHidePassword: string
  contentModeVCard: string
  vcardFirstNameLabel: string
  vcardFirstNamePlaceholder: string
  vcardLastNameLabel: string
  vcardLastNamePlaceholder: string
  vcardPhoneLabel: string
  vcardPhonePlaceholder: string
  vcardEmailLabel: string
  vcardEmailPlaceholder: string
  vcardProfessionalLabel: string
  vcardCompanyLabel: string
  vcardCompanyPlaceholder: string
  vcardJobTitleLabel: string
  vcardJobTitlePlaceholder: string
  vcardWebsiteLabel: string
  vcardWebsitePlaceholder: string
  vcardCorrectionHint: string
  contentModeEmail: string
  emailToLabel: string
  emailToPlaceholder: string
  emailSubjectLabel: string
  emailSubjectPlaceholder: string
  emailBodyLabel: string
  emailBodyPlaceholder: string
  emailCorrectionHint: string
}

export interface PreviewStrings {
  sectionLabel: string
  sectionTitle: string
  placeholder: string
  ariaValue: string
  ariaPlaceholder: string
  shareButtonLabel: string
  shareStatusSharing: string
  shareStatusShared: string
  shareStatusClipboard: string
  shareStatusDownloaded: string
  shareStatusFailed: string
  shareStatusCanceled: string
  shareStatusPermissionDenied: string
}

export interface CommonStrings {
  comingSoon: string
}

export interface LocaleConfig {
  locale: LocaleMetadata
  common: CommonStrings
  seo: SeoMetadata
  layout: LayoutStrings
  hero: HeroStrings
  config: ConfigStrings
  controls: ControlStrings
  preview: PreviewStrings
}

export type TranslationKey =
  | 'locale.toggleLabel'
  | `locale.switchTo.${SupportedLocale}`
  | 'common.comingSoon'
  | 'seo.title'
  | 'seo.description'
  | 'seo.ogTitle'
  | 'seo.ogDescription'
  | 'seo.ogType'
  | 'seo.canonical'
  | 'seo.twitterCard'
  | 'seo.twitterTitle'
  | 'seo.twitterDescription'
  | 'layout.headerTitle'
  | 'layout.headerSubtitle'
  | 'layout.navLabel'
  | 'layout.themeToggleToLight'
  | 'layout.themeToggleToDark'
  | 'layout.footerNote'
  | 'hero.badge'
  | 'hero.title'
  | 'hero.subtitle'
  | 'config.sectionLabel'
  | 'config.sectionTitle'
  | 'config.helper'
  | 'controls.contentLabel'
  | 'controls.contentPlaceholder'
  | 'controls.correctionLabel'
  | 'controls.correctionHint'
  | 'controls.foregroundLabel'
  | 'controls.backgroundLabel'
  | 'controls.generate'
  | 'controls.downloadsTitle'
  | 'controls.downloadPng'
  | 'controls.downloadSvg'
  | 'controls.downloadSuccess'
  | 'controls.correctionLow'
  | 'controls.correctionMedium'
  | 'controls.correctionQuartile'
  | 'controls.correctionHigh'
  | 'controls.correctionTooltip'
  | 'controls.dismissWarningAriaLabel'
  | 'controls.contentModeText'
  | 'controls.contentModeWifi'
  | 'controls.wifiSsidLabel'
  | 'controls.wifiSsidPlaceholder'
  | 'controls.wifiPasswordLabel'
  | 'controls.wifiPasswordPlaceholder'
  | 'controls.wifiSecurityLabel'
  | 'controls.wifiHiddenLabel'
  | 'controls.wifiSecurityWpa'
  | 'controls.wifiSecurityWep'
  | 'controls.wifiSecurityNone'
  | 'controls.wifiCorrectionHint'
  | 'controls.wifiShowPassword'
  | 'controls.wifiHidePassword'
  | 'controls.contentModeVCard'
  | 'controls.vcardFirstNameLabel'
  | 'controls.vcardFirstNamePlaceholder'
  | 'controls.vcardLastNameLabel'
  | 'controls.vcardLastNamePlaceholder'
  | 'controls.vcardPhoneLabel'
  | 'controls.vcardPhonePlaceholder'
  | 'controls.vcardEmailLabel'
  | 'controls.vcardEmailPlaceholder'
  | 'controls.vcardProfessionalLabel'
  | 'controls.vcardCompanyLabel'
  | 'controls.vcardCompanyPlaceholder'
  | 'controls.vcardJobTitleLabel'
  | 'controls.vcardJobTitlePlaceholder'
  | 'controls.vcardWebsiteLabel'
  | 'controls.vcardWebsitePlaceholder'
  | 'controls.vcardCorrectionHint'
  | 'controls.contentModeEmail'
  | 'controls.emailToLabel'
  | 'controls.emailToPlaceholder'
  | 'controls.emailSubjectLabel'
  | 'controls.emailSubjectPlaceholder'
  | 'controls.emailBodyLabel'
  | 'controls.emailBodyPlaceholder'
  | 'controls.emailCorrectionHint'
  | 'preview.sectionLabel'
  | 'preview.shareStatusSharing'
  | 'preview.shareStatusShared'
  | 'preview.shareStatusClipboard'
  | 'preview.shareStatusDownloaded'
  | 'preview.shareStatusFailed'
  | 'preview.shareStatusCanceled'
  | 'preview.shareStatusPermissionDenied'
  | 'preview.sectionTitle'
  | 'preview.placeholder'
  | 'preview.ariaValue'
  | 'preview.ariaPlaceholder'
  | 'preview.shareButtonLabel'
