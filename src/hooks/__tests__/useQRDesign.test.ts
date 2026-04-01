import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import { useQRDesign } from '../useQRDesign'

describe('useQRDesign', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('[US1] initializes with default Square config', () => {
    const { result } = renderHook(() => useQRDesign())
    expect(result.current.designConfig.eyeShape).toBe('Square')
    expect(result.current.designConfig.pixelPattern).toBe('Square')
  })

  it('[US1] updates eye shape and persists to localStorage', () => {
    const { result } = renderHook(() => useQRDesign())
    
    act(() => {
      result.current.setEyeShape('Leaf')
    })
    
    expect(result.current.designConfig.eyeShape).toBe('Leaf')
    const stored = JSON.parse(localStorage.getItem('qr-generator-design-config') || '{}')
    expect(stored.eyeShape).toBe('Leaf')
  })

  it('[US1] falls back to defaults if parsing localStorage fails', () => {
    localStorage.setItem('qr-generator-design-config', 'invalid-json')
    const { result } = renderHook(() => useQRDesign())
    expect(result.current.designConfig.eyeShape).toBe('Square')
  })
})
