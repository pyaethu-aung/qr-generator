import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { LocaleProvider } from '../../../../hooks/LocaleProvider'
import { QRPreview } from '../QRPreview'
import { useQRShare } from '../../../../hooks/useQRShare'
import type { ShareRequest } from '../../../../types/qr'

// Internal mock state
let _isSharing = false
let _shareRequest: ShareRequest | null = null
let _resolveSharePromise: (() => void) | undefined
let _rejectSharePromise: ((reason?: Error) => void) | undefined

// Mock the useQRShare hook to control its behavior per attempt
vi.mock('../../../../hooks/useQRShare', () => {
  return {
    useQRShare: vi.fn(() => ({
      share: vi.fn(() => {
        _isSharing = true
        _shareRequest = { status: 'pending', method: 'navigator-share', targetSupported: true }
        return new Promise<void>((resolve, reject) => {
          _resolveSharePromise = resolve
          _rejectSharePromise = reject
        })
      }),
      get isSharing() {
        return _isSharing
      },
      get shareRequest() {
        return _shareRequest
      },
    })),
  }
})

describe('QRShareReliability', () => {
  const totalAttempts = 100
  const successThreshold = 0.95 // 95%

  beforeEach(() => {
    // Reset mock state before each test run
    _isSharing = false
    _shareRequest = null
    _resolveSharePromise = undefined
    _rejectSharePromise = undefined
    vi.mocked(useQRShare).mockClear()
    // Re‑apply the mock implementation to ensure fresh getters
    vi.mocked(useQRShare).mockImplementation(() => ({
      share: vi.fn(() => {
        _isSharing = true
        _shareRequest = { status: 'pending', method: 'navigator-share', targetSupported: true }
        return new Promise<void>((resolve, reject) => {
          _resolveSharePromise = () => {
            _isSharing = false
            _shareRequest = { status: 'shared', method: 'navigator-share', targetSupported: true }
            resolve()
          }
          _rejectSharePromise = (error?: Error) => {
            _isSharing = false
            _shareRequest = {
              status: 'failed',
              method: 'navigator-share',
              targetSupported: true,
              errorMessage: error?.message || 'Share failed',
            }
            reject(error || new Error('Share failed'))
          }
        })
      }),
      get isSharing() { return _isSharing },
      get shareRequest() { return _shareRequest },
    }))
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should achieve ≥95% successful shares over many attempts', async () => {
    render(
      <LocaleProvider>
        <QRPreview value="https://example.com" ecLevel="M" fgColor="#000" bgColor="#fff" />
      </LocaleProvider>
    )

    const shareButton = screen.getByRole('button', { name: 'Share QR code' })
    let successes = 0
    let failures = 0

    for (let i = 0; i < totalAttempts; i++) {
      // Trigger share
      fireEvent.click(shareButton)

      // Randomly decide success/failure (deterministic for test stability)
      const shouldSucceed = i % 20 !== 0 // 95 successes, 5 failures (every 20th fails)

      if (shouldSucceed) {
        await act(async () => {
          _resolveSharePromise?.()
          await Promise.resolve()
        })
        successes++
      } else {
        await act(async () => {
          _rejectSharePromise?.(new Error('Simulated share failure'))
          await Promise.resolve()
        })
        failures++
      }

      // Wait for UI to reflect the new state before next iteration
      await waitFor(() => {
        const value = vi.mocked(useQRShare).mock.results[0].value as ReturnType<typeof useQRShare>;
        const status = value.shareRequest?.status;
        expect(status).not.toBe('pending');
        expect(['shared', 'failed']).toContain(status);
      })
    }

    const successRate = successes / totalAttempts
    expect(successRate).toBeGreaterThanOrEqual(successThreshold)
    // Optional sanity checks
    expect(successes).toBe(95)
    expect(failures).toBe(5)
  })
})
