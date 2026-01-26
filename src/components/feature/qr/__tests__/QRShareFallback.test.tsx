import { forwardRef } from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, beforeEach, afterEach, vi, type MockedFunction } from 'vitest'
import { LocaleProvider } from '../../../../hooks/LocaleProvider'
import { QRPreview } from '../QRPreview'
import type { SharePayload } from '../../../../types/qr'

type CreateSharePayloadFn = (canvas: HTMLCanvasElement | null) => Promise<SharePayload>
type PayloadToFileFn = (payload: SharePayload) => File
type SupportsNavigatorShareFn = () => boolean
type CanShareFilesFn = (files: File[]) => boolean
type SupportsClipboardImageFn = () => boolean
type CopyPayloadToClipboardFn = (payload: SharePayload) => Promise<void>
type DownloadPayloadFn = (payload: SharePayload) => void
type IsMobileDeviceFn = () => boolean

vi.mock('../../../../utils/share', () => {
  const createSharePayload = vi.fn() as MockedFunction<CreateSharePayloadFn>
  const payloadToFile = vi.fn() as MockedFunction<PayloadToFileFn>
  const supportsNavigatorShare = vi.fn<SupportsNavigatorShareFn>(() => false)
  const canShareFiles = vi.fn<CanShareFilesFn>(() => false)
  const supportsClipboardImage = vi.fn<SupportsClipboardImageFn>(() => false)
  const copyPayloadToClipboard = vi.fn<CopyPayloadToClipboardFn>(() => Promise.resolve())
  const downloadPayload = vi.fn<DownloadPayloadFn>(() => undefined)
  const isMobileDevice = vi.fn<IsMobileDeviceFn>(() => false)

  return {
    createSharePayload,
    payloadToFile,
    supportsNavigatorShare,
    canShareFiles,
    supportsClipboardImage,
    copyPayloadToClipboard,
    downloadPayload,
    isMobileDevice,
  }
})

vi.mock('qrcode.react', () => {
  interface QRCodeMockProps {
    value: string
    fgColor?: string
    bgColor?: string
    size?: number
  }

  const QRCodeMock = forwardRef<HTMLCanvasElement, QRCodeMockProps>(
    ({ value, fgColor, bgColor, size }, ref) => (
      <canvas
        ref={ref}
        data-testid="qr-code-canvas"
        data-value={value}
        data-fg={fgColor ?? ''}
        data-bg={bgColor ?? ''}
        width={size ?? 0}
        height={size ?? 0}
        role="img"
        aria-label={`QR Code for value: ${value}`}
      />
    ),
  )

  return {
    QRCodeCanvas: QRCodeMock,
  }
})

let createSharePayloadMock: MockedFunction<CreateSharePayloadFn>
let payloadToFileMock: MockedFunction<PayloadToFileFn>
let supportsNavigatorShareMock: MockedFunction<SupportsNavigatorShareFn>
let canShareFilesMock: MockedFunction<CanShareFilesFn>
let supportsClipboardImageMock: MockedFunction<SupportsClipboardImageFn>
let copyPayloadToClipboardMock: MockedFunction<CopyPayloadToClipboardFn>
let downloadPayloadMock: MockedFunction<DownloadPayloadFn>
let isMobileDeviceMock: MockedFunction<IsMobileDeviceFn>

describe('QRShareFallback', () => {
  const mockBlob = new Blob(['PNG'], { type: 'image/png' })
  const mockFilename = 'qr-code.png'
  const mockPayload: SharePayload = {
    blob: mockBlob,
    filename: mockFilename,
    lastUpdated: new Date(0),
  }
  const mockFile = new File([mockBlob], mockFilename, { type: mockBlob.type })

  beforeEach(() =>
    vi.importMock('../../../../utils/share').then((shareModule) => {
      const resolvedModule = shareModule as typeof import('../../../../utils/share')
      createSharePayloadMock = vi.mocked(resolvedModule.createSharePayload)
      payloadToFileMock = vi.mocked(resolvedModule.payloadToFile)
      supportsNavigatorShareMock = vi.mocked(resolvedModule.supportsNavigatorShare)
      canShareFilesMock = vi.mocked(resolvedModule.canShareFiles)
      supportsClipboardImageMock = vi.mocked(resolvedModule.supportsClipboardImage)
      copyPayloadToClipboardMock = vi.mocked(resolvedModule.copyPayloadToClipboard)
      downloadPayloadMock = vi.mocked(resolvedModule.downloadPayload)
      isMobileDeviceMock = vi.mocked(resolvedModule.isMobileDevice)
      createSharePayloadMock.mockResolvedValue(mockPayload)
      payloadToFileMock.mockReturnValue(mockFile)
      supportsNavigatorShareMock.mockReturnValue(false)
      canShareFilesMock.mockReturnValue(false)
      supportsClipboardImageMock.mockReturnValue(false)
      isMobileDeviceMock.mockReturnValue(false)
      copyPayloadToClipboardMock.mockResolvedValue(undefined)
      downloadPayloadMock.mockReturnValue(undefined)
    }),
  )

  afterEach(() => {
    vi.resetAllMocks()
  })

  it('copies QR payload to clipboard when native share is unavailable', async () => {
    supportsClipboardImageMock.mockReturnValue(true)

    render(
      <LocaleProvider>
        <QRPreview
          value="https://example.com"
          ecLevel="M"
          fgColor="#000000"
          bgColor="#ffffff"
          size={200}
        />
      </LocaleProvider>,
    )

    const shareButton = screen.getByRole('button', { name: 'Share QR code' })
    await userEvent.click(shareButton)

    await waitFor(() => expect(copyPayloadToClipboardMock).toHaveBeenCalledWith(mockPayload))
    expect(downloadPayloadMock).not.toHaveBeenCalled()
  })

  it('downloads QR payload when clipboard fallback is not supported', async () => {
    supportsClipboardImageMock.mockReturnValue(false)

    render(
      <LocaleProvider>
        <QRPreview
          value="https://example.com"
          ecLevel="M"
          fgColor="#000000"
          bgColor="#ffffff"
          size={200}
        />
      </LocaleProvider>,
    )

    const shareButton = screen.getByRole('button', { name: 'Share QR code' })
    await userEvent.click(shareButton)

    await waitFor(() => expect(downloadPayloadMock).toHaveBeenCalledWith(mockPayload))
    expect(copyPayloadToClipboardMock).not.toHaveBeenCalled()
  })

  const capabilityMatrix = [
    {
      title: 'falls back to clipboard when native share is unavailable',
      supportsNavigatorShare: false,
      canShareFiles: false,
      clipboardAvailable: true,
      expectClipboard: true,
    },
    {
      title: 'falls back to download when native share is unavailable and clipboard unsupported',
      supportsNavigatorShare: false,
      canShareFiles: false,
      clipboardAvailable: false,
      expectClipboard: false,
    },
    {
      title: 'falls back to clipboard when native share cannot share files',
      supportsNavigatorShare: true,
      canShareFiles: false,
      clipboardAvailable: true,
      expectClipboard: true,
    },
    {
      title:
        'falls back to download when native share cannot share files and clipboard unsupported',
      supportsNavigatorShare: true,
      canShareFiles: false,
      clipboardAvailable: false,
      expectClipboard: false,
    },
  ] as const

  describe('capability matrix for fallbacks', () => {
    capabilityMatrix.forEach((scenario) => {
      it(scenario.title, async () => {
        supportsNavigatorShareMock.mockReturnValue(scenario.supportsNavigatorShare)
        canShareFilesMock.mockReturnValue(scenario.canShareFiles)
        supportsClipboardImageMock.mockReturnValue(scenario.clipboardAvailable)
        isMobileDeviceMock.mockReturnValue(false)

        render(
          <LocaleProvider>
            <QRPreview
              value="https://example.com"
              ecLevel="M"
              fgColor="#000000"
              bgColor="#ffffff"
              size={200}
            />
          </LocaleProvider>,
        )

        const shareButton = screen.getByRole('button', { name: 'Share QR code' })
        await userEvent.click(shareButton)

        if (scenario.expectClipboard) {
          await waitFor(() => expect(copyPayloadToClipboardMock).toHaveBeenCalledWith(mockPayload))
          expect(downloadPayloadMock).not.toHaveBeenCalled()
        } else {
          await waitFor(() => expect(downloadPayloadMock).toHaveBeenCalledWith(mockPayload))
          expect(copyPayloadToClipboardMock).not.toHaveBeenCalled()
        }
      })
    })
  })

  describe('Permission denied handling', () => {
    afterEach(() => {
      vi.unstubAllGlobals()
    })

    it('automatically triggers download fallback when navigator.share permission is denied', async () => {
      supportsNavigatorShareMock.mockReturnValue(true)
      canShareFilesMock.mockReturnValue(true)
      supportsClipboardImageMock.mockReturnValue(false) // Force download fallback

      const notAllowedError = new Error('Permission denied')
      notAllowedError.name = 'NotAllowedError'
      const shareSpy = vi.fn().mockRejectedValue(notAllowedError)
      vi.stubGlobal('navigator', {
        ...global.navigator,
        share: shareSpy,
      })

      render(
        <LocaleProvider>
          <QRPreview
            value="https://example.com"
            ecLevel="M"
            fgColor="#000000"
            bgColor="#ffffff"
            size={200}
          />
        </LocaleProvider>,
      )

      const shareButton = screen.getByRole('button', { name: 'Share QR code' })
      await userEvent.click(shareButton)

      // Verify that it eventually reaches the 'shared' state via fallback
      await waitFor(() => {
        expect(screen.getByTestId('share-status')).toHaveTextContent(/QR code downloaded/i)
      })

      expect(downloadPayloadMock).toHaveBeenCalledWith(mockPayload)

      // Persistence check: Subsequent attempts should skip navigator.share
      shareSpy.mockClear()
      downloadPayloadMock.mockClear()

      await userEvent.click(shareButton)

      await waitFor(() => {
        expect(downloadPayloadMock).toHaveBeenCalledWith(mockPayload)
      })
      expect(shareSpy).not.toHaveBeenCalled()
    })

    it('remembers blocked permission state and uses fallback immediately', async () => {
      supportsNavigatorShareMock.mockReturnValue(true)
      canShareFilesMock.mockReturnValue(true)
      supportsClipboardImageMock.mockReturnValue(true)

      const notAllowedError = new Error('Permission denied')
      notAllowedError.name = 'NotAllowedError'
      const shareSpy = vi.fn().mockRejectedValue(notAllowedError)
      vi.stubGlobal('navigator', {
        ...global.navigator,
        share: shareSpy,
      })

      render(
        <LocaleProvider>
          <QRPreview value="test" ecLevel="M" fgColor="#000" bgColor="#fff" />
        </LocaleProvider>,
      )

      const shareButton = screen.getByRole('button', { name: 'Share QR code' })

      // First attempt: Navigator share is called, fails with NotAllowedError, triggers clipboard fallback
      await userEvent.click(shareButton)
      await waitFor(() => expect(shareSpy).toHaveBeenCalled())
      await waitFor(() => expect(copyPayloadToClipboardMock).toHaveBeenCalled())

      // Reset mocks for second attempt
      shareSpy.mockClear()
      copyPayloadToClipboardMock.mockClear()

      // Second attempt: Navigator share should be skipped (persistent block)
      await userEvent.click(shareButton)
      await waitFor(() => expect(copyPayloadToClipboardMock).toHaveBeenCalled())
      expect(shareSpy).not.toHaveBeenCalled()
    })
  })
})
