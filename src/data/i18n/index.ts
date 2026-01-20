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

export function getCopy(locale: SupportedLocale, key: TranslationKey): string {
  const [section, entry] = key.split('.') as [keyof LocaleConfig, string]
  const sectionValues = locales[locale][section]

  if (sectionValues && typeof sectionValues === 'object') {
    return (sectionValues as Record<string, string>)[entry] ?? ''
  }

  return ''
}
