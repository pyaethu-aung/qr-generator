import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { LocaleProvider } from '../../../../hooks/LocaleProvider'
import { BatchGenerator } from '../BatchGenerator'
import type { UseBatchGeneratorReturn } from '../../../../hooks/useBatchGenerator'

const setInput = vi.fn()
const setFormat = vi.fn()
const setLabelPreset = vi.fn()
const setCaptions = vi.fn()
const setFilenameOverrides = vi.fn()
const generate = vi.fn()

let state: UseBatchGeneratorReturn

vi.mock('../../../../hooks/useBatchGenerator', () => ({
  useBatchGenerator: () => state,
}))

function makeState(over: Partial<UseBatchGeneratorReturn> = {}): UseBatchGeneratorReturn {
  return {
    input: '',
    setInput,
    format: 'png',
    setFormat,
    labelPreset: 'a4-3x7',
    setLabelPreset,
    captions: true,
    setCaptions,
    filenameOverrides: null,
    setFilenameOverrides,
    values: [],
    total: 0,
    truncated: false,
    status: 'idle',
    progress: { completed: 0, total: 0 },
    errorCode: null,
    generate,
    maxLines: 200,
    ...over,
  }
}

function setup() {
  render(
    <LocaleProvider>
      <BatchGenerator />
    </LocaleProvider>,
  )
}

beforeEach(() => {
  setInput.mockReset()
  setFormat.mockReset()
  setLabelPreset.mockReset()
  setCaptions.mockReset()
  setFilenameOverrides.mockReset()
  generate.mockReset()
  state = makeState()
})

describe('BatchGenerator', () => {
  it('shows the empty hint and disables generate with no values', () => {
    setup()
    expect(screen.getByText(/add one link or line of text per row/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /generate zip/i })).toBeDisabled()
  })

  it('shows a live count once there are values', () => {
    state = makeState({ input: 'a\nb', values: ['a', 'b'], total: 2 })
    setup()
    expect(screen.getByText(/2 of 200 codes/i)).toBeInTheDocument()
  })

  it('enables generate and fires it on click', () => {
    state = makeState({ values: ['a'], total: 1 })
    setup()
    const button = screen.getByRole('button', { name: /generate zip/i })
    expect(button).toBeEnabled()
    fireEvent.click(button)
    expect(generate).toHaveBeenCalledTimes(1)
  })

  it('routes the textarea through setInput', () => {
    setup()
    fireEvent.change(screen.getByLabelText(/your list/i), { target: { value: 'x' } })
    expect(setInput).toHaveBeenCalledWith('x')
  })

  it('switches format through the pill group', () => {
    setup()
    fireEvent.click(screen.getByRole('button', { name: 'SVG' }))
    expect(setFormat).toHaveBeenCalledWith('svg')
  })

  it('hides the label-sheet controls unless the labels format is active', () => {
    setup()
    expect(screen.queryByText(/sheet layout/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/captions under each code/i)).not.toBeInTheDocument()
  })

  it('reveals layout and caption controls and re-labels the button in labels mode', () => {
    state = makeState({ values: ['VEH-001'], total: 1, format: 'labels' })
    setup()
    expect(screen.getByText(/sheet layout/i)).toBeInTheDocument()
    expect(screen.getByText(/captions under each code/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /generate label sheet/i })).toBeEnabled()

    fireEvent.click(screen.getByRole('button', { name: 'Letter · 3×6' }))
    expect(setLabelPreset).toHaveBeenCalledWith('letter-3x6')
    fireEvent.click(screen.getByRole('button', { name: 'Off' }))
    expect(setCaptions).toHaveBeenCalledWith(false)
  })

  it('shows the per-page count for the selected layout', () => {
    state = makeState({ values: ['a'], total: 1, format: 'labels', labelPreset: 'a4-3x7' })
    setup()
    // a4-3x7 = 3 columns x 7 rows = 21 codes per page
    expect(screen.getByText(/21 codes per page/i)).toBeInTheDocument()
  })

  it('confirms label-sheet success with the PDF wording', () => {
    state = makeState({ values: ['a'], format: 'labels', status: 'success' })
    setup()
    expect(screen.getByText(/label sheet pdf download should start/i)).toBeInTheDocument()
  })

  it('warns when the input was truncated', () => {
    state = makeState({ values: ['a'], total: 250, truncated: true })
    setup()
    expect(screen.getByText(/only the first 200 codes/i)).toBeInTheDocument()
  })

  it('renders a progress bar while generating', () => {
    state = makeState({ values: ['a', 'b'], status: 'generating', progress: { completed: 1, total: 2 } })
    setup()
    const bar = screen.getByRole('progressbar')
    expect(bar).toHaveAttribute('aria-valuenow', '50')
    expect(screen.getByRole('button', { name: /generating code 1 of 2/i })).toBeDisabled()
  })

  it('confirms success', () => {
    state = makeState({ values: ['a'], status: 'success' })
    setup()
    expect(screen.getByText(/your zip download should start/i)).toBeInTheDocument()
  })

  it('shows the empty error', () => {
    state = makeState({ status: 'error', errorCode: 'empty' })
    setup()
    expect(screen.getByText(/add at least one link or line/i)).toBeInTheDocument()
  })

  it('shows the render error', () => {
    state = makeState({ values: ['a'], status: 'error', errorCode: 'render-failed' })
    setup()
    expect(screen.getByText(/something went wrong while generating/i)).toBeInTheDocument()
  })

  describe('CSV column mapping', () => {
    const CSV = 'url,vehicle_id\nhttps://a.com,TRUCK-1\nhttps://b.com,TRUCK-2'

    function uploadCsv(content = CSV) {
      const input = document.querySelector('input[type="file"]') as HTMLInputElement
      const file = new File([content], 'fleet.csv', { type: 'text/csv' })
      fireEvent.change(input, { target: { files: [file] } })
    }

    it('opens the mapping UI for a multi-column CSV and seeds the first column as the value', async () => {
      setup()
      uploadCsv()
      await waitFor(() => expect(screen.getByText(/map csv columns/i)).toBeInTheDocument())
      // First column ("url") becomes the value list.
      expect(setInput).toHaveBeenLastCalledWith('https://a.com\nhttps://b.com')
    })

    it('builds filename overrides when a filename column is chosen', async () => {
      setup()
      uploadCsv()
      await waitFor(() => expect(screen.getByLabelText(/filename column/i)).toBeInTheDocument())
      fireEvent.change(screen.getByLabelText(/filename column/i), { target: { value: '1' } })
      expect(setFilenameOverrides).toHaveBeenLastCalledWith({
        'https://a.com': 'TRUCK-1',
        'https://b.com': 'TRUCK-2',
      })
    })

    it('re-maps the value list when the value column changes', async () => {
      setup()
      uploadCsv()
      await waitFor(() => expect(screen.getByLabelText(/qr value column/i)).toBeInTheDocument())
      fireEvent.change(screen.getByLabelText(/qr value column/i), { target: { value: '1' } })
      expect(setInput).toHaveBeenLastCalledWith('TRUCK-1\nTRUCK-2')
    })

    it('does not open the mapping UI for a single-column CSV', async () => {
      setup()
      uploadCsv('https://a.com\nhttps://b.com')
      await waitFor(() => expect(setInput).toHaveBeenCalled())
      expect(screen.queryByText(/map csv columns/i)).not.toBeInTheDocument()
    })

    it('clears mapping when the textarea is edited manually', async () => {
      setup()
      uploadCsv()
      await waitFor(() => expect(screen.getByText(/map csv columns/i)).toBeInTheDocument())
      fireEvent.change(screen.getByLabelText(/your list/i), { target: { value: 'manual' } })
      expect(setFilenameOverrides).toHaveBeenLastCalledWith(null)
      expect(screen.queryByText(/map csv columns/i)).not.toBeInTheDocument()
    })
  })
})
