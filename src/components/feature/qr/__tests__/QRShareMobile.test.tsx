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

vi.mock('../../../../utils/share', () => {
  const createSharePayload = vi.fn() as MockedFunction<CreateSharePayloadFn>
  const payloadToFile = vi.fn() as MockedFunction<PayloadToFileFn>
  const supportsNavigatorShare = vi.fn<SupportsNavigatorShareFn>(() => true)
  const canShareFiles = vi.fn<CanShareFilesFn>(() => true)
  const supportsClipboardImage = vi.fn<SupportsClipboardImageFn>(() => false)
  const copyPayloadToClipboard = vi.fn<CopyPayloadToClipboardFn>(() => Promise.resolve())
  const downloadPayload = vi.fn<DownloadPayloadFn>(() => undefined)

  return {
    createSharePayload,
    payloadToFile,
    supportsNavigatorShare,
    canShareFiles,
    supportsClipboardImage,
    copyPayloadToClipboard,
    downloadPayload,
  }
})

let createSharePayloadMock: MockedFunction<CreateSharePayloadFn>
let payloadToFileMock: MockedFunction<PayloadToFileFn>
let supportsNavigatorShareMock: MockedFunction<SupportsNavigatorShareFn>
let canShareFilesMock: MockedFunction<CanShareFilesFn>
let supportsClipboardImageMock: MockedFunction<SupportsClipboardImageFn>
let copyPayloadToClipboardMock: MockedFunction<CopyPayloadToClipboardFn>
let downloadPayloadMock: MockedFunction<DownloadPayloadFn>

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

describe('QRShareMobile', () => {
  const mockBlob = new Blob(['mobile'], { type: 'image/png' })
  const mockFilename = 'qr-code.png'
  const mockPayload: SharePayload = {
    blob: mockBlob,
    filename: mockFilename,
    lastUpdated: new Date(0),
  }
  const mockFile = new File([mockBlob], mockFilename, {
    type: mockBlob.type,
  })
  const shareMock = vi.fn(() => Promise.resolve())
  const originalNavigatorShareDescriptor = Object.getOwnPropertyDescriptor(navigator, 'share')

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
      createSharePayloadMock.mockResolvedValue(mockPayload)
      payloadToFileMock.mockReturnValue(mockFile)
      supportsNavigatorShareMock.mockReturnValue(true)
      canShareFilesMock.mockReturnValue(true)
      supportsClipboardImageMock.mockReturnValue(false)
      copyPayloadToClipboardMock.mockResolvedValue(undefined)
      downloadPayloadMock.mockReturnValue(undefined)
      shareMock.mockResolvedValue(undefined)
      Object.defineProperty(navigator, 'share', {
        value: shareMock,
        configurable: true,
      })
    }),
  )

  afterEach(() => {
    vi.resetAllMocks()
    if (originalNavigatorShareDescriptor) {
      Object.defineProperty(navigator, 'share', originalNavigatorShareDescriptor)
    }
  })

  it('shares the preview QR when canShare({ files }) succeeds and respects size/colors', async () => {
    const size = 300
    const fgColor = '#ff00ff'
    const bgColor = '#00ffff'

    render(
      <LocaleProvider>
        <QRPreview
          value="https://example.com/mobile"
          ecLevel="M"
          fgColor={fgColor}
          bgColor={bgColor}
          size={size}
        />
      </LocaleProvider>,
    )

    const shareButton = screen.getByRole('button', { name: 'Share QR code' })
    await userEvent.click(shareButton)

    await waitFor(() => expect(shareMock).toHaveBeenCalledTimes(1))

    expect(canShareFilesMock).toHaveBeenCalledWith([mockFile])
    expect(copyPayloadToClipboardMock).not.toHaveBeenCalled()
    expect(downloadPayloadMock).not.toHaveBeenCalled()

    const canvasArg = createSharePayloadMock.mock.calls[0][0]
    expect(canvasArg).toBeInstanceOf(HTMLCanvasElement)
    expect(canvasArg?.width).toBe(size)
    expect(canvasArg?.height).toBe(size)
    expect(canvasArg?.getAttribute('data-fg')).toBe(fgColor)
    expect(canvasArg?.getAttribute('data-bg')).toBe(bgColor)
  })
})
