import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { ScanHistory } from '../ScanHistory'
import type { ScanHistoryEntry } from '../../../../hooks/useScanHistory'
import type { DecodedContentType } from '../../../../utils/qrClassify'

const typeLabel = (type: DecodedContentType) => type.toUpperCase()

const entry = (over: Partial<ScanHistoryEntry> = {}): ScanHistoryEntry => ({
  id: '1',
  savedAt: 1,
  label: 'https://example.com',
  value: 'https://example.com',
  type: 'url',
  ...over,
})

function setup(history: ScanHistoryEntry[], over: Partial<Parameters<typeof ScanHistory>[0]> = {}) {
  const onRestore = vi.fn()
  const onClear = vi.fn()
  render(
    <ScanHistory
      history={history}
      onRestore={onRestore}
      onClear={onClear}
      sectionLabel="Recently scanned"
      clearAriaLabel="Clear scan history"
      typeLabel={typeLabel}
      {...over}
    />,
  )
  return { onRestore, onClear }
}

describe('ScanHistory', () => {
  it('renders nothing when history is empty', () => {
    const { container } = render(
      <ScanHistory
        history={[]}
        onRestore={vi.fn()}
        onClear={vi.fn()}
        sectionLabel="Recently scanned"
        clearAriaLabel="Clear scan history"
        typeLabel={typeLabel}
      />,
    )
    expect(container).toBeEmptyDOMElement()
  })

  it('renders an entry with its label and type badge', () => {
    setup([entry()])
    expect(screen.getByText('Recently scanned')).toBeInTheDocument()
    expect(screen.getByText('https://example.com')).toBeInTheDocument()
    expect(screen.getByText('URL')).toBeInTheDocument()
  })

  it('calls onRestore with the entry when a row is clicked', () => {
    const { onRestore } = setup([entry({ value: 'restore-me', label: 'restore-me' })])
    fireEvent.click(screen.getByRole('button', { name: /restore-me/i }))
    expect(onRestore).toHaveBeenCalledWith(expect.objectContaining({ value: 'restore-me' }))
  })

  it('announces the restored entry to assistive tech', () => {
    setup([entry({ label: 'restored value' })])
    fireEvent.click(screen.getByRole('button', { name: /restored value/i }))
    expect(screen.getByText('restored value', { selector: '.sr-only' })).toBeInTheDocument()
  })

  it('calls onClear when the clear button is pressed', () => {
    const { onClear } = setup([entry()])
    fireEvent.click(screen.getByRole('button', { name: /clear scan history/i }))
    expect(onClear).toHaveBeenCalled()
  })

  it('shows distinct labels for differing content types', () => {
    setup([
      entry({ id: '1', type: 'wifi', value: 'WIFI:S:net;;', label: 'WIFI:S:net;;' }),
      entry({ id: '2', type: 'tel', value: 'tel:+100', label: 'tel:+100' }),
    ])
    expect(screen.getByText('WIFI')).toBeInTheDocument()
    expect(screen.getByText('TEL')).toBeInTheDocument()
  })
})
