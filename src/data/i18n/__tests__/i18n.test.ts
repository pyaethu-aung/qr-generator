import { describe, expect, it, vi } from 'vitest'
import en from '../en.json'

type Mutable<T> = { -readonly [K in keyof T]: Mutable<T[K]> }
const localeKey = 'hero.title' as const

async function loadModule() {
  vi.resetModules()
  return import('../index')
}

describe('i18n resolver', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('falls back to English and logs missing translations once', async () => {
    const module = await loadModule()
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const originalHeading = module.locales.my.hero.title
    const heroStrings = module.locales.my.hero as Mutable<typeof module.locales.my.hero>

    try {
      heroStrings.title = ''
      const heading = module.getCopy('my', localeKey)
      expect(heading).toBe(en.hero.title)
      expect(consoleSpy).toHaveBeenCalledTimes(1)
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining(localeKey))
    } finally {
      heroStrings.title = originalHeading
    }
  })

  it('logs once per unique locale key pair', async () => {
    const module = await loadModule()
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const originalHeading = module.locales.my.hero.title
    const heroStrings = module.locales.my.hero as Mutable<typeof module.locales.my.hero>

    try {
      heroStrings.title = ''
      module.getCopy('my', localeKey)
      module.getCopy('my', localeKey)
      expect(consoleSpy).toHaveBeenCalledTimes(1)
    } finally {
      heroStrings.title = originalHeading
    }
  })
})
