import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../../utils/batch/buildBatchZip', () => ({
  buildBatchZip: vi.fn(() => Promise.resolve(new Blob(['zip'], { type: 'application/zip' }))),
}))
vi.mock('../../utils/download', () => ({ downloadBlob: vi.fn() }))

import { useBatchGenerator } from '../useBatchGenerator'
import { buildBatchZip } from '../../utils/batch/buildBatchZip'
import { downloadBlob } from '../../utils/download'

describe('useBatchGenerator', () => {
  const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(buildBatchZip).mockResolvedValue(new Blob(['zip'], { type: 'application/zip' }))
  })

  it('starts idle with the png format and no codes', () => {
    const { result } = renderHook(() => useBatchGenerator())
    expect(result.current.status).toBe('idle')
    expect(result.current.format).toBe('png')
    expect(result.current.values).toEqual([])
  })

  it('restores a persisted input on mount', () => {
    localStorage.setItem('qr-generator:batch:input', 'https://restored.com')
    const { result } = renderHook(() => useBatchGenerator())
    expect(result.current.input).toBe('https://restored.com')
    expect(result.current.values).toEqual(['https://restored.com'])
  })

  it('derives unique, capped values from the input', () => {
    const { result } = renderHook(() => useBatchGenerator())
    act(() => result.current.setInput('a\na\nb\n  \nc'))
    expect(result.current.values).toEqual(['a', 'b', 'c'])
    expect(result.current.total).toBe(3)
  })

  it('reports an empty error when generating with no usable input', async () => {
    const { result } = renderHook(() => useBatchGenerator())
    act(() => result.current.setInput('   '))
    await act(async () => {
      await result.current.generate()
    })
    expect(result.current.status).toBe('error')
    expect(result.current.errorCode).toBe('empty')
    expect(buildBatchZip).not.toHaveBeenCalled()
  })

  it('builds a zip and downloads it on success', async () => {
    const { result } = renderHook(() => useBatchGenerator())
    act(() => result.current.setInput('https://a.com\nhttps://b.com'))
    await act(async () => {
      await result.current.generate()
    })
    const arg = vi.mocked(buildBatchZip).mock.calls[0][0]
    expect(arg.values).toEqual(['https://a.com', 'https://b.com'])
    expect(arg.format).toBe('png')
    expect(typeof arg.design.ecLevel).toBe('string')
    expect(typeof arg.design.fgColor).toBe('string')
    expect(typeof arg.design.bgColor).toBe('string')
    expect(downloadBlob).toHaveBeenCalledTimes(1)
    expect(vi.mocked(downloadBlob).mock.calls[0][1]).toMatch(/^qr-batch-2-.*\.zip$/)
    expect(result.current.status).toBe('success')
  })

  it('surfaces a render error when the zip build throws', async () => {
    vi.mocked(buildBatchZip).mockRejectedValueOnce(new Error('boom'))
    const { result } = renderHook(() => useBatchGenerator())
    act(() => result.current.setInput('https://a.com'))
    await act(async () => {
      await result.current.generate()
    })
    expect(result.current.status).toBe('error')
    expect(result.current.errorCode).toBe('render-failed')
    expect(consoleErrorSpy).toHaveBeenCalled()
  })

  it('resets a finished run when the format changes', async () => {
    const { result } = renderHook(() => useBatchGenerator())
    act(() => result.current.setInput('https://a.com'))
    await act(async () => {
      await result.current.generate()
    })
    expect(result.current.status).toBe('success')
    act(() => result.current.setFormat('svg'))
    expect(result.current.status).toBe('idle')
    expect(result.current.format).toBe('svg')
  })
})
