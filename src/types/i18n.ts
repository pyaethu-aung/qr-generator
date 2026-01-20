import type { locales } from '../data/i18n'

/**
 * Supported locale codes derived from locale config files.
 * Maps to en.json, my.json, etc.
 */
export type SupportedLocale = keyof typeof locales

/**
 * Locale metadata structure for each supported language.
 */
export interface LocaleMetadata {
  code: SupportedLocale
  name: string
  nativeName: string
  direction: 'ltr' | 'rtl'
}

/**
 * SEO metadata structure for Open Graph and Twitter tags.
 */
export interface SeoMetadata {
  title: string
  description: string
  ogTitle: string
  ogDescription: string
  ogType: string
  twitterCard: string
  twitterTitle: string
  twitterDescription: string
}

/**
 * Layout strings for header, footer, and navigation.
 */
export interface LayoutStrings {
  appName: string
  tagline: string
  footer: string
}

/**
 * Hero section strings (main heading and subheading).
 */
export interface HeroStrings {
  heading: string
  subheading: string
}

/**
 * Configuration panel strings (labels, placeholders, validation).
 */
export interface ConfigStrings {
  urlLabel: string
  urlPlaceholder: string
  urlError: string
  sizeLabel: string
  colorLabel: string
  bgColorLabel: string
}

/**
 * Control button strings (generate, download, reset).
 */
export interface ControlStrings {
  generateButton: string
  downloadButton: string
  resetButton: string
  generatingButton: string
}

/**
 * Preview area strings (loading, error states).
 */
export interface PreviewStrings {
  loadingMessage: string
  errorMessage: string
  emptyMessage: string
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
 * Example: getCopy('en', 'hero.heading')
 */
export type TranslationKey =
  | 'seo.title'
  | 'seo.description'
  | 'seo.ogTitle'
  | 'seo.ogDescription'
  | 'seo.ogType'
  | 'seo.twitterCard'
  | 'seo.twitterTitle'
  | 'seo.twitterDescription'
  | 'layout.appName'
  | 'layout.tagline'
  | 'layout.footer'
  | 'hero.heading'
  | 'hero.subheading'
  | 'config.urlLabel'
  | 'config.urlPlaceholder'
  | 'config.urlError'
  | 'config.sizeLabel'
  | 'config.colorLabel'
  | 'config.bgColorLabel'
  | 'controls.generateButton'
  | 'controls.downloadButton'
  | 'controls.resetButton'
  | 'controls.generatingButton'
  | 'preview.loadingMessage'
  | 'preview.errorMessage'
  | 'preview.emptyMessage'
