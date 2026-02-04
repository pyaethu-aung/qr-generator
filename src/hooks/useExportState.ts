/**
 * Export state management hook using useReducer.
 *
 * @why Using useReducer provides predictable state transitions and makes
 * the complex export flow easier to test and debug. The reducer pattern
 * also enables easy state serialization for debugging.
 */

import { useReducer, useCallback } from 'react'
import type {
  ExportState,
  ExportAction,
  ExportFormat,
  DimensionPreset,
  DpiPreset,
} from '../types/export'
import { INITIAL_EXPORT_STATE } from '../types/export'

/**
 * Reducer function for export state management.
 *
 * @why Using a switch statement with exhaustive type checking ensures
 * all action types are handled. TypeScript will error if a new action
 * type is added but not handled here.
 */
export function exportReducer(state: ExportState, action: ExportAction): ExportState {
  switch (action.type) {
    case 'OPEN_MODAL':
      return {
        ...state,
        isOpen: true,
        error: null,
        progress: 0,
      }

    case 'CLOSE_MODAL':
      return {
        ...INITIAL_EXPORT_STATE,
        // Preserve user's last selections for convenience
        format: state.format,
        dimension: state.dimension,
        dpi: state.dpi,
      }

    case 'SET_FORMAT':
      return {
        ...state,
        format: action.payload,
        error: null,
      }

    case 'SET_DIMENSION':
      return {
        ...state,
        dimension: action.payload,
        error: null,
      }

    case 'SET_DPI':
      return {
        ...state,
        dpi: action.payload,
        error: null,
      }

    case 'START_EXPORT':
      return {
        ...state,
        isExporting: true,
        error: null,
        progress: 0,
      }

    case 'EXPORT_PROGRESS':
      return {
        ...state,
        progress: Math.min(100, Math.max(0, action.payload)),
      }

    case 'EXPORT_SUCCESS':
      return {
        ...state,
        isExporting: false,
        progress: 100,
        error: null,
      }

    case 'EXPORT_ERROR':
      return {
        ...state,
        isExporting: false,
        error: action.payload,
        progress: 0,
      }

    case 'RESET':
      return INITIAL_EXPORT_STATE

    default:
      return state
  }
}

/**
 * Hook for managing export modal state.
 *
 * @why Encapsulating the reducer in a hook provides a clean API with
 * memoized action dispatchers for consumers.
 * @returns State and action dispatchers for the export modal
 */
export function useExportState() {
  const [state, dispatch] = useReducer(exportReducer, INITIAL_EXPORT_STATE)

  const openModal = useCallback(() => {
    dispatch({ type: 'OPEN_MODAL' })
  }, [])

  const closeModal = useCallback(() => {
    dispatch({ type: 'CLOSE_MODAL' })
  }, [])

  const setFormat = useCallback((format: ExportFormat) => {
    dispatch({ type: 'SET_FORMAT', payload: format })
  }, [])

  const setDimension = useCallback((dimension: DimensionPreset) => {
    dispatch({ type: 'SET_DIMENSION', payload: dimension })
  }, [])

  const setDpi = useCallback((dpi: DpiPreset) => {
    dispatch({ type: 'SET_DPI', payload: dpi })
  }, [])

  const startExport = useCallback(() => {
    dispatch({ type: 'START_EXPORT' })
  }, [])

  const updateProgress = useCallback((progress: number) => {
    dispatch({ type: 'EXPORT_PROGRESS', payload: progress })
  }, [])

  const exportSuccess = useCallback(() => {
    dispatch({ type: 'EXPORT_SUCCESS' })
  }, [])

  const exportError = useCallback((error: string) => {
    dispatch({ type: 'EXPORT_ERROR', payload: error })
  }, [])

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' })
  }, [])

  return {
    state,
    dispatch,
    // Convenience action dispatchers
    openModal,
    closeModal,
    setFormat,
    setDimension,
    setDpi,
    startExport,
    updateProgress,
    exportSuccess,
    exportError,
    reset,
  }
}
