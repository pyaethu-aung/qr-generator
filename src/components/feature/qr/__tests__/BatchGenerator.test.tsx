import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { LocaleProvider } from '../../../../hooks/LocaleProvider'
import { BatchGenerator } from '../BatchGenerator'
import type { UseBatchGeneratorReturn } from '../../../../hooks/useBatchGenerator'

const setInput = vi.fn()
const setFormat = vi.fn()
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
})
