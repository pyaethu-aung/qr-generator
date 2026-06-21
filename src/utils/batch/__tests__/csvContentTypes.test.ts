import { describe, it, expect } from 'vitest'
import {
  buildCsvValues,
  autoMapColumns,
  defaultFixedValues,
  getCsvContentType,
  NO_COLUMN,
} from '../csvContentTypes'
import type { ParsedBatchCsv } from '../parseBatchCsv'

function grid(headers: string[], rows: string[][]): ParsedBatchCsv {
  return { headers, rows }
}

describe('getCsvContentType', () => {
  it('returns the matching type and falls back to text for an unknown id', () => {
    expect(getCsvContentType('wifi').id).toBe('wifi')
    // @ts-expect-error exercising the runtime fallback for an unknown id
    expect(getCsvContentType('nope').id).toBe('text')
  })
})

describe('autoMapColumns', () => {
  it('seeds the text value field to the first column when no header matches', () => {
    const g = grid(['url', 'name'], [['https://a.com', 'A']])
    expect(autoMapColumns(g, getCsvContentType('text'))).toEqual({ value: 0 })
  })

  it('wires structured fields to columns whose header matches the field key', () => {
    const g = grid(['SSID', 'Pass Word', 'extra'], [['Net', 'pw', 'x']])
    // "SSID" -> ssid; "Pass Word" normalizes to "password"; unmatched optional fields stay unmapped.
    const cols = autoMapColumns(g, getCsvContentType('wifi'))
    expect(cols.ssid).toBe(0)
    expect(cols.password).toBe(1)
  })

  it('leaves unmatched structured fields unmapped (not column 0)', () => {
    const g = grid(['a', 'b'], [['x', 'y']])
    expect(autoMapColumns(g, getCsvContentType('email')).to).toBe(NO_COLUMN)
  })
})

describe('defaultFixedValues', () => {
  it('returns enum/toggle defaults and ignores column fields', () => {
    expect(defaultFixedValues(getCsvContentType('wifi'))).toEqual({
      security: 'WPA',
      hidden: 'false',
    })
    expect(defaultFixedValues(getCsvContentType('crypto'))).toEqual({ network: 'bitcoin' })
  })
})

describe('buildCsvValues', () => {
  it('encodes the text value column verbatim', () => {
    const g = grid(['url'], [['https://a.com'], ['https://b.com']])
    const { values } = buildCsvValues(g, {
      type: 'text',
      columns: { value: 0 },
      fixed: {},
      filenameCol: NO_COLUMN,
    })
    expect(values).toEqual(['https://a.com', 'https://b.com'])
  })

  it('builds a single, intact vCard payload per row (the multi-line fix)', () => {
    const g = grid(
      ['first', 'last', 'phone'],
      [['Aung', 'Aung', '+95912345678']],
    )
    const { values } = buildCsvValues(g, {
      type: 'vcard',
      columns: { firstName: 0, lastName: 1, phone: 2 },
      fixed: {},
      filenameCol: NO_COLUMN,
    })
    // One row -> exactly one payload, even though it contains newlines.
    expect(values).toHaveLength(1)
    expect(values[0]).toContain('\n')
    expect(values[0].startsWith('BEGIN:VCARD')).toBe(true)
    expect(values[0].trimEnd().endsWith('END:VCARD')).toBe(true)
  })

  it('builds a WiFi payload from columns plus fixed enum/toggle values', () => {
    const g = grid(['ssid', 'pw'], [['Yoma-Guest', 'welcome123']])
    const { values } = buildCsvValues(g, {
      type: 'wifi',
      columns: { ssid: 0, password: 1 },
      fixed: { security: 'WPA', hidden: 'true' },
      filenameCol: NO_COLUMN,
    })
    expect(values).toEqual(['WIFI:T:WPA;S:Yoma-Guest;P:welcome123;H:true;;'])
  })

  it('skips rows missing a required field', () => {
    const g = grid(['ssid'], [['Net-A'], [''], ['Net-B']])
    const { values } = buildCsvValues(g, {
      type: 'wifi',
      columns: { ssid: 0 },
      fixed: { security: 'nopass', hidden: 'false' },
      filenameCol: NO_COLUMN,
    })
    expect(values).toEqual(['WIFI:T:nopass;S:Net-A;;', 'WIFI:T:nopass;S:Net-B;;'])
  })

  it('returns no values when a required column is unmapped', () => {
    const g = grid(['a'], [['x']])
    const { values } = buildCsvValues(g, {
      type: 'tel',
      columns: { number: NO_COLUMN },
      fixed: {},
      filenameCol: NO_COLUMN,
    })
    expect(values).toEqual([])
  })

  it('maps filename overrides keyed by the built payload, first occurrence winning', () => {
    const g = grid(
      ['lat', 'lng', 'name'],
      [
        ['16.8', '96.1', 'yangon'],
        ['16.8', '96.1', 'dup'],
        ['21.0', '105.8', 'hanoi'],
      ],
    )
    const { values, filenameOverrides } = buildCsvValues(g, {
      type: 'geo',
      columns: { latitude: 0, longitude: 1 },
      fixed: {},
      filenameCol: 2,
    })
    // One entry per row (the hook's dedupeAndCap collapses duplicates downstream)...
    expect(values).toEqual(['geo:16.8,96.1', 'geo:16.8,96.1', 'geo:21,105.8'])
    // ...but the override map keeps only the first filename for a repeated value.
    expect(filenameOverrides).toEqual({ 'geo:16.8,96.1': 'yangon', 'geo:21,105.8': 'hanoi' })
  })

  it('returns null overrides when no filename column is mapped', () => {
    const g = grid(['url'], [['https://a.com']])
    const { filenameOverrides } = buildCsvValues(g, {
      type: 'text',
      columns: { value: 0 },
      fixed: {},
      filenameCol: NO_COLUMN,
    })
    expect(filenameOverrides).toBeNull()
  })
})
