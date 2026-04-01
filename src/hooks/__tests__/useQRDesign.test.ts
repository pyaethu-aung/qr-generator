import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useQRDesign } from '../useQRDesign'

describe('useQRDesign - isRiskyPattern', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('triggers isRiskyPattern when using Dots with a matrix size >= 41', () => {
    // Generate long string to force > 40 size (Version 6+)
    const denseValue = 'https://example.com/'.repeat(50)
    
    const { result } = renderHook(() => useQRDesign(denseValue, 'H'))
    
    // Default is Square, no risk
    expect(result.current.isRiskyPattern).toBe(false)
    
    // Switch to Dots
    act(() => {
      result.current.setPixelPattern('Dots')
    })
    
    // Should now be risky
    expect(result.current.isRiskyPattern).toBe(true)
  })
  
  it('does not trigger isRiskyPattern for low density Data', () => {
    const lightValue = 'A'
    
    const { result } = renderHook(() => useQRDesign(lightValue, 'L'))
    
    act(() => {
      result.current.setPixelPattern('Dots')
    })
    
    expect(result.current.isRiskyPattern).toBe(false)
  })

  it('can be dismissed', () => {
    const denseValue = 'https://example.com/'.repeat(50)
    const { result } = renderHook(() => useQRDesign(denseValue, 'H'))
    
    act(() => {
      result.current.setPixelPattern('Dots')
    })
    
    expect(result.current.isRiskyPattern).toBe(true)
    
    act(() => {
      result.current.dismissWarning()
    })
    
    expect(result.current.isRiskyPattern).toBe(false)
  })
})
