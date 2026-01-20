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
  foregroundLabel: string
  backgroundLabel: string
  generate: string
  downloadsTitle: string
  downloadPng: string
  downloadSvg: string
  correctionLow: string
  correctionMedium: string
  correctionQuartile: string
  correctionHigh: string
}

export interface PreviewStrings {
  sectionLabel: string
  sectionTitle: string
  placeholder: string
  ariaValue: string
  ariaPlaceholder: string
}

export interface LocaleConfig {
  locale: LocaleMetadata
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
  | 'controls.foregroundLabel'
  | 'controls.backgroundLabel'
  | 'controls.generate'
  | 'controls.downloadsTitle'
  | 'controls.downloadPng'
  | 'controls.downloadSvg'
  | 'controls.correctionLow'
  | 'controls.correctionMedium'
  | 'controls.correctionQuartile'
  | 'controls.correctionHigh'
  | 'preview.sectionLabel'
  | 'preview.sectionTitle'
  | 'preview.placeholder'
  | 'preview.ariaValue'
  | 'preview.ariaPlaceholder'
