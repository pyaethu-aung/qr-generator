import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useQRDesign } from '../useQRDesign'

describe('useQRDesign - logo state', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('initializes logoDataUrl as null and logoSize clamped to maxLogoSize', () => {
    const { result } = renderHook(() => useQRDesign('', 'M'))
    expect(result.current.logoDataUrl).toBeNull()
    expect(result.current.logoSize).toBeLessThanOrEqual(result.current.maxLogoSize)
  })

  it('caps logoSize to maxLogoSize when setLogoSize is called', () => {
    const { result } = renderHook(() => useQRDesign('', 'L'))
    act(() => {
      result.current.setLogoSize(30)
    })
    expect(result.current.logoSize).toBe(7) // L cap is 7%
  })

  it('exposes the correct maxLogoSize per EC level', () => {
    const { result: resultL } = renderHook(() => useQRDesign('', 'L'))
    const { result: resultM } = renderHook(() => useQRDesign('', 'M'))
    const { result: resultQ } = renderHook(() => useQRDesign('', 'Q'))
    const { result: resultH } = renderHook(() => useQRDesign('', 'H'))

    expect(resultL.current.maxLogoSize).toBe(7)
    expect(resultM.current.maxLogoSize).toBe(15)
    expect(resultQ.current.maxLogoSize).toBe(25)
    expect(resultH.current.maxLogoSize).toBe(30)
  })

  it('clamps existing logoSize when ecLevel changes to a lower cap', () => {
    type Props = { ecLevel: 'L' | 'M' | 'Q' | 'H' }
    const { result, rerender } = renderHook(
      ({ ecLevel }: Props) => useQRDesign('', ecLevel),
      { initialProps: { ecLevel: 'H' } },
    )

    act(() => {
      result.current.setLogoSize(28)
    })
    expect(result.current.logoSize).toBe(28)

    rerender({ ecLevel: 'L' })
    expect(result.current.logoSize).toBe(7)
  })

  it('stores and clears logoDataUrl via setLogoDataUrl', () => {
    const { result } = renderHook(() => useQRDesign('', 'M'))

    act(() => {
      result.current.setLogoDataUrl('data:image/png;base64,test')
    })
    expect(result.current.logoDataUrl).toBe('data:image/png;base64,test')

    act(() => {
      result.current.setLogoDataUrl(null)
    })
    expect(result.current.logoDataUrl).toBeNull()
  })
})

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
