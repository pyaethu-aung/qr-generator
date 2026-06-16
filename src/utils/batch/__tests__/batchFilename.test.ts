import { describe, it, expect } from 'vitest'
import { batchFilename, slugifyValue } from '../batchFilename'

describe('slugifyValue', () => {
  it('strips the URL scheme and www prefix', () => {
    expect(slugifyValue('https://www.example.com/menu')).toBe('example-com-menu')
    expect(slugifyValue('HTTP://Example.com')).toBe('example-com')
  })

  it('lowercases and collapses runs of unsafe characters to single hyphens', () => {
    expect(slugifyValue('Hello, World!!  Foo')).toBe('hello-world-foo')
  })

  it('trims leading and trailing hyphens', () => {
    expect(slugifyValue('***start end***')).toBe('start-end')
  })

  it('clamps overly long values', () => {
    const slug = slugifyValue('a'.repeat(100))
    expect(slug.length).toBeLessThanOrEqual(40)
  })

  it('falls back to "qr" when nothing usable remains', () => {
    expect(slugifyValue('!!!')).toBe('qr')
    expect(slugifyValue('   ')).toBe('qr')
  })
})

describe('batchFilename', () => {
  it('prefixes a 1-based, zero-padded ordinal and the extension', () => {
    const used = new Set<string>()
    expect(batchFilename('https://example.com', 0, 'png', used)).toBe('001-example-com.png')
    expect(batchFilename('https://example.com/two', 1, 'svg', used)).toBe('002-example-com-two.svg')
  })

  it('disambiguates colliding names with a numeric suffix', () => {
    const used = new Set<string>()
    // Same ordinal + same slug would collide; the suffix keeps names unique.
    const first = batchFilename('!!!', 0, 'pdf', used)
    const second = batchFilename('???', 0, 'pdf', used)
    expect(first).toBe('001-qr.pdf')
    expect(second).toBe('001-qr-2.pdf')
    expect(used.has('001-qr.pdf')).toBe(true)
    expect(used.has('001-qr-2.pdf')).toBe(true)
  })
})
