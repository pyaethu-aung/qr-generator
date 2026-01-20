import type { LocaleRegistry } from '../data/i18n'

/**
 * Supported locale codes derived from locale config files.
 */
export type SupportedLocale = keyof LocaleRegistry

/**
 * Locale metadata structure for each supported language.
 */
export interface LocaleMetadata {
  code: SupportedLocale
  name: string
  toggleLabel: string
  switchTo: Record<SupportedLocale, string>
}

/**
 * SEO metadata structure for the document.
 */
export interface SeoMetadata {
  title: string
  description: string
  ogTitle: string
  ogDescription: string
  canonical: string
}

/**
 * Layout strings for header, footer, and subtitles.
 */
export interface LayoutStrings {
  headerTitle: string
  headerSubtitle: string
  footerNote: string
}

/**
 * Hero section strings.
 */
export interface HeroStrings {
  badge: string
  title: string
  subtitle: string
}

/**
 * Configuration panel strings.
 */
export interface ConfigStrings {
  sectionLabel: string
  sectionTitle: string
  helper: string
}

/**
 * Control button and download strings.
 */
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
}

/**
 * Preview panel strings.
 */
export interface PreviewStrings {
  sectionLabel: string
  sectionTitle: string
  placeholder: string
  ariaValue: string
  ariaPlaceholder: string
}

/**
 * Complete locale configuration structure.
 */
export interface LocaleConfig {
  locale: LocaleMetadata
  seo: SeoMetadata
  layout: LayoutStrings
  hero: HeroStrings
  config: ConfigStrings
  controls: ControlStrings
  preview: PreviewStrings
}

/**
 * Translation key paths for type-safe lookups.
 */
export type TranslationKey =
  | 'locale.toggleLabel'
  | `locale.switchTo.${SupportedLocale}`
  | 'seo.title'
  | 'seo.description'
  | 'seo.ogTitle'
  | 'seo.ogDescription'
  | 'seo.canonical'
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
  | 'preview.sectionLabel'
  | 'preview.sectionTitle'
  | 'preview.placeholder'
  | 'preview.ariaValue'
  | 'preview.ariaPlaceholder'
