import en from './en.json'
import my from './my.json'

export const locales = {
  en,
  my,
} as const

export type SupportedLocale = keyof typeof locales
export const defaultLocale: SupportedLocale = 'en'
