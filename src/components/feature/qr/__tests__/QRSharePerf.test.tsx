import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { LocaleProvider } from '../../../../hooks/LocaleProvider'
import { QRPreview } from '../QRPreview'
import { useQRShare } from '../../../../hooks/useQRShare' // Import the mocked hook directly after vi.mock
import type { ShareRequest } from '../../../../types/qr'

// Internal state for the mock
let _isSharing = false
let _shareRequest: ShareRequest | null = null
let _resolveSharePromise: (() => void) | undefined
let _rejectSharePromise: ((reason?: Error) => void) | undefined

// Mock the useQRShare hook to control its behavior
vi.mock('../../../../hooks/useQRShare', () => {
  return {
    useQRShare: vi.fn(() => ({
      share: vi.fn(() => {
        _isSharing = true
        _shareRequest = { status: 'pending', method: 'clipboard', targetSupported: true }
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

describe('QRSharePerf', () => {
  beforeEach(() => {
    // Reset internal state for each test
    _isSharing = false
    _shareRequest = null
    _resolveSharePromise = undefined
    _rejectSharePromise = undefined

    // Reset the mock implementation itself, important for getters to re-evaluate
    vi.mocked(useQRShare).mockClear() // Clear previous calls to the hook
    // Re-apply the mock implementation to ensure a fresh state for the hook instance
    vi.mocked(useQRShare).mockImplementation(() => ({
      share: vi.fn(() => {
        _isSharing = true
        _shareRequest = { status: 'pending', method: 'clipboard', targetSupported: true }
        return new Promise<void>((resolve, reject) => {
          _resolveSharePromise = () => {
            _isSharing = false
            _shareRequest = { status: 'shared', method: 'clipboard', targetSupported: true }
            resolve()
          }
          _rejectSharePromise = (error?: Error) => {
            const rejectionError = error ?? new Error('Share failed')
            _isSharing = false
            _shareRequest = {
              status: 'failed',
              method: 'clipboard',
              targetSupported: true,
              errorMessage: rejectionError.message,
            }
            reject(rejectionError)
          }
        })
      }),
      get isSharing() {
        return _isSharing
      },
      get shareRequest() {
        return _shareRequest
      },
    }))
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  const defaultProps = {
    value: 'https://example.com',
    ecLevel: 'M' as const,
    fgColor: '#000000',
    bgColor: '#ffffff',
  }

  it('should complete share successfully', async () => {
    render(
      <LocaleProvider>
        <QRPreview {...defaultProps} />
      </LocaleProvider>,
    )

    const shareButton = screen.getByRole('button', { name: 'Share QR code' })
    fireEvent.click(shareButton)

    const hookInstance = vi.mocked(useQRShare).mock.results[0].value as ReturnType<typeof useQRShare>
    expect(hookInstance.share).toHaveBeenCalledWith(expect.any(HTMLCanvasElement))

    expect(hookInstance.isSharing).toBe(true)
    expect(hookInstance.shareRequest?.status).toBe('pending')

    // Manually resolve the promise and flush state updates
    await act(async () => {
      _resolveSharePromise?.()
      await Promise.resolve()
    })

    // Wait for the UI to update based on the state change
    await waitFor(() => {
      expect(hookInstance.isSharing).toBe(false)
      expect(hookInstance.shareRequest?.status).toBe('shared')
    })
  })

  // Test for share failure
  it('should handle share failure and update status', async () => {
    render(
      <LocaleProvider>
        <QRPreview {...defaultProps} />
      </LocaleProvider>,
    )

    const shareButton = screen.getByRole('button', { name: 'Share QR code' })
    fireEvent.click(shareButton)

        const hookInstance = vi.mocked(useQRShare).mock.results[0].value as ReturnType<typeof useQRShare>

        expect(hookInstance.isSharing).toBe(true)
    expect(hookInstance.shareRequest?.status).toBe('pending')

    const errorMessage = 'Share operation failed!'
    // Manually reject the promise and flush state updates
    await act(async () => {
      _rejectSharePromise?.(new Error(errorMessage))
      await Promise.resolve()
    })

    await waitFor(() => {
      expect(hookInstance.isSharing).toBe(false)
      expect(hookInstance.shareRequest?.status).toBe('failed')
      // Assuming QRPreview would display this error, you could assert its presence
    })
  })
})