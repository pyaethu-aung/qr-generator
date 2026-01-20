import en from './en.json'
import my from './my.json'

import type { LocaleConfig, TranslationKey } from '../../types/i18n'

const localeRegistry = {
  en: en as LocaleConfig,
  my: my as LocaleConfig,
} as const

export const locales = localeRegistry
export type LocaleRegistry = typeof localeRegistry
export type SupportedLocale = keyof LocaleRegistry
export const defaultLocale: SupportedLocale = 'en'
export const localeCodes = Object.keys(localeRegistry) as SupportedLocale[]

const missingTranslationLog = new Set<string>()

function resolveTranslation(locale: SupportedLocale, key: TranslationKey): string | undefined {
  const segments = key.split('.')
  let current: unknown = locales[locale]

  for (const segment of segments) {
    if (current && typeof current === 'object' && segment in current) {
      current = (current as Record<string, unknown>)[segment]
    } else {
      return undefined
    }
  }

  return typeof current === 'string' ? current : undefined
}

function logMissingTranslation(locale: SupportedLocale, key: TranslationKey) {
  if (locale === defaultLocale) return

  const logToken = `${locale}:${key}`
  if (!missingTranslationLog.has(logToken)) {
    missingTranslationLog.add(logToken)
    console.warn(`[i18n] Missing translation for "${key}" in ${locale}; falling back to ${defaultLocale}`)
  }
}

export function getCopy(locale: SupportedLocale, key: TranslationKey): string {
  const localizedCopy = resolveTranslation(locale, key)
  if (localizedCopy) {
    return localizedCopy
  }

  logMissingTranslation(locale, key)
  return resolveTranslation(defaultLocale, key) ?? ''
}
