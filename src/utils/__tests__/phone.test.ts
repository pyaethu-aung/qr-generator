import { describe, it, expect } from 'vitest'
import { PHONE_REGEX, normalizePhone } from '../phone'

describe('normalizePhone', () => {
  it('returns null for empty or whitespace-only input', () => {
    expect(normalizePhone('')).toBeNull()
    expect(normalizePhone('   ')).toBeNull()
  })

  it('returns null when the input has no digits', () => {
    expect(normalizePhone('---()')).toBeNull()
  })

  it('returns null when the input is too short', () => {
    expect(normalizePhone('12')).toBeNull()
  })

  it('keeps a leading + and strips spaces, hyphens, parens, and dots', () => {
    expect(normalizePhone('+1 (555) 123-4567')).toBe('+15551234567')
    expect(normalizePhone('09.123.456.789')).toBe('09123456789')
  })

  it('trims surrounding whitespace', () => {
    expect(normalizePhone('  +15551234567  ')).toBe('+15551234567')
  })
})

describe('PHONE_REGEX', () => {
  it('accepts international and locally formatted numbers', () => {
    expect(PHONE_REGEX.test('+15551234567')).toBe(true)
    expect(PHONE_REGEX.test('+1 (555) 123-4567')).toBe(true)
    expect(PHONE_REGEX.test('095123456')).toBe(true)
  })

  it('rejects letters and empty / digitless input', () => {
    expect(PHONE_REGEX.test('call me')).toBe(false)
    expect(PHONE_REGEX.test('   ')).toBe(false)
    expect(PHONE_REGEX.test('()-.')).toBe(false)
  })
})
