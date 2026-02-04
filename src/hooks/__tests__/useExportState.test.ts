import { describe, expect, it } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useExportState, exportReducer } from '../useExportState'
import { INITIAL_EXPORT_STATE } from '../../types/export'
import type { ExportState } from '../../types/export'

describe('exportReducer', () => {
  describe('OPEN_MODAL', () => {
    it('sets isOpen to true and resets error/progress', () => {
      const state: ExportState = {
        ...INITIAL_EXPORT_STATE,
        error: 'previous error',
        progress: 50,
      }
      const result = exportReducer(state, { type: 'OPEN_MODAL' })

      expect(result.isOpen).toBe(true)
      expect(result.error).toBeNull()
      expect(result.progress).toBe(0)
    })
  })

  describe('CLOSE_MODAL', () => {
    it('resets state but preserves format/dimension/dpi selections', () => {
      const state: ExportState = {
        isOpen: true,
        format: 'pdf',
        dimension: 2000,
        dpi: 300,
        isExporting: false,
        error: 'some error',
        progress: 100,
      }
      const result = exportReducer(state, { type: 'CLOSE_MODAL' })

      expect(result.isOpen).toBe(false)
      expect(result.format).toBe('pdf')
      expect(result.dimension).toBe(2000)
      expect(result.dpi).toBe(300)
      expect(result.error).toBeNull()
      expect(result.isExporting).toBe(false)
    })
  })

  describe('SET_FORMAT', () => {
    it('updates format and clears error', () => {
      const state: ExportState = {
        ...INITIAL_EXPORT_STATE,
        error: 'previous error',
      }
      const result = exportReducer(state, { type: 'SET_FORMAT', payload: 'svg' })

      expect(result.format).toBe('svg')
      expect(result.error).toBeNull()
    })
  })

  describe('SET_DIMENSION', () => {
    it('updates dimension and clears error', () => {
      const state: ExportState = {
        ...INITIAL_EXPORT_STATE,
        error: 'previous error',
      }
      const result = exportReducer(state, { type: 'SET_DIMENSION', payload: 2000 })

      expect(result.dimension).toBe(2000)
      expect(result.error).toBeNull()
    })
  })

  describe('SET_DPI', () => {
    it('updates dpi and clears error', () => {
      const state: ExportState = {
        ...INITIAL_EXPORT_STATE,
        error: 'previous error',
      }
      const result = exportReducer(state, { type: 'SET_DPI', payload: 300 })

      expect(result.dpi).toBe(300)
      expect(result.error).toBeNull()
    })
  })

  describe('START_EXPORT', () => {
    it('sets isExporting to true and resets error/progress', () => {
      const state: ExportState = {
        ...INITIAL_EXPORT_STATE,
        error: 'previous error',
        progress: 50,
      }
      const result = exportReducer(state, { type: 'START_EXPORT' })

      expect(result.isExporting).toBe(true)
      expect(result.error).toBeNull()
      expect(result.progress).toBe(0)
    })
  })

  describe('EXPORT_PROGRESS', () => {
    it('updates progress within bounds', () => {
      const result = exportReducer(INITIAL_EXPORT_STATE, {
        type: 'EXPORT_PROGRESS',
        payload: 50,
      })
      expect(result.progress).toBe(50)
    })

    it('clamps progress to 0 minimum', () => {
      const result = exportReducer(INITIAL_EXPORT_STATE, {
        type: 'EXPORT_PROGRESS',
        payload: -10,
      })
      expect(result.progress).toBe(0)
    })

    it('clamps progress to 100 maximum', () => {
      const result = exportReducer(INITIAL_EXPORT_STATE, {
        type: 'EXPORT_PROGRESS',
        payload: 150,
      })
      expect(result.progress).toBe(100)
    })
  })

  describe('EXPORT_SUCCESS', () => {
    it('sets isExporting to false and progress to 100', () => {
      const state: ExportState = {
        ...INITIAL_EXPORT_STATE,
        isExporting: true,
        progress: 80,
      }
      const result = exportReducer(state, { type: 'EXPORT_SUCCESS' })

      expect(result.isExporting).toBe(false)
      expect(result.progress).toBe(100)
      expect(result.error).toBeNull()
    })
  })

  describe('EXPORT_ERROR', () => {
    it('sets error and resets isExporting/progress', () => {
      const state: ExportState = {
        ...INITIAL_EXPORT_STATE,
        isExporting: true,
        progress: 50,
      }
      const result = exportReducer(state, {
        type: 'EXPORT_ERROR',
        payload: 'Export failed',
      })

      expect(result.isExporting).toBe(false)
      expect(result.error).toBe('Export failed')
      expect(result.progress).toBe(0)
    })
  })

  describe('RESET', () => {
    it('resets to initial state', () => {
      const state: ExportState = {
        isOpen: true,
        format: 'pdf',
        dimension: 2000,
        dpi: 300,
        isExporting: true,
        error: 'error',
        progress: 75,
      }
      const result = exportReducer(state, { type: 'RESET' })

      expect(result).toEqual(INITIAL_EXPORT_STATE)
    })
  })
})

describe('useExportState', () => {
  it('initializes with default state', () => {
    const { result } = renderHook(() => useExportState())

    expect(result.current.state).toEqual(INITIAL_EXPORT_STATE)
  })

  it('opens modal', () => {
    const { result } = renderHook(() => useExportState())

    act(() => {
      result.current.openModal()
    })

    expect(result.current.state.isOpen).toBe(true)
  })

  it('closes modal and preserves selections', () => {
    const { result } = renderHook(() => useExportState())

    act(() => {
      result.current.openModal()
      result.current.setFormat('pdf')
      result.current.setDimension(2000)
      result.current.setDpi(300)
    })

    act(() => {
      result.current.closeModal()
    })

    expect(result.current.state.isOpen).toBe(false)
    expect(result.current.state.format).toBe('pdf')
    expect(result.current.state.dimension).toBe(2000)
    expect(result.current.state.dpi).toBe(300)
  })

  it('handles full export flow', () => {
    const { result } = renderHook(() => useExportState())

    // Open modal and configure
    act(() => {
      result.current.openModal()
      result.current.setFormat('png')
      result.current.setDimension(1000)
    })

    expect(result.current.state.isOpen).toBe(true)
    expect(result.current.state.format).toBe('png')

    // Start export
    act(() => {
      result.current.startExport()
    })

    expect(result.current.state.isExporting).toBe(true)

    // Update progress
    act(() => {
      result.current.updateProgress(50)
    })

    expect(result.current.state.progress).toBe(50)

    // Complete export
    act(() => {
      result.current.exportSuccess()
    })

    expect(result.current.state.isExporting).toBe(false)
    expect(result.current.state.progress).toBe(100)
  })

  it('handles export error', () => {
    const { result } = renderHook(() => useExportState())

    act(() => {
      result.current.openModal()
      result.current.startExport()
    })

    act(() => {
      result.current.exportError('Network error')
    })

    expect(result.current.state.isExporting).toBe(false)
    expect(result.current.state.error).toBe('Network error')
  })

  it('resets to initial state', () => {
    const { result } = renderHook(() => useExportState())

    act(() => {
      result.current.openModal()
      result.current.setFormat('pdf')
      result.current.startExport()
    })

    act(() => {
      result.current.reset()
    })

    expect(result.current.state).toEqual(INITIAL_EXPORT_STATE)
  })
})
