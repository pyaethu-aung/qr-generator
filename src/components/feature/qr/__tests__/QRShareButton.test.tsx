import { forwardRef } from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  describe,
  expect,
  it,
  beforeEach,
  afterEach,
  afterAll,
  vi,
  type MockedFunction,
} from 'vitest'
import { LocaleProvider } from '../../../../hooks/LocaleProvider'
import { QRPreview } from '../QRPreview'
import type { SharePayload } from '../../../../types/qr'

type CreateSharePayloadFn = (canvas: HTMLCanvasElement | null) => Promise<SharePayload>
type PayloadToFileFn = (payload: SharePayload) => File
type SupportsNavigatorShareFn = () => boolean
type CanShareFilesFn = (files: File[]) => boolean

vi.mock('../../../../utils/share', () => {
  const createSharePayload = vi.fn() as MockedFunction<CreateSharePayloadFn>
  const payloadToFile = vi.fn() as MockedFunction<PayloadToFileFn>
  const supportsNavigatorShare = vi.fn<SupportsNavigatorShareFn>(() => true)
  const canShareFiles = vi.fn<CanShareFilesFn>(() => true)

  return {
    createSharePayload,
    payloadToFile,
    supportsNavigatorShare,
    canShareFiles,
  }
})

let createSharePayloadMock: MockedFunction<CreateSharePayloadFn>
let payloadToFileMock: MockedFunction<PayloadToFileFn>
let supportsNavigatorShareMock: MockedFunction<SupportsNavigatorShareFn>
let canShareFilesMock: MockedFunction<CanShareFilesFn>

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

describe('QRShareButton', () => {
  const mockBlob = new Blob(['PNG'], { type: 'image/png' })
  const mockFilename = 'qr-code.png'
  const mockPayload: SharePayload = {
    blob: mockBlob,
    filename: mockFilename,
    lastUpdated: new Date(0),
  }
  const mockFile = new File([mockBlob], mockFilename, {
    type: mockBlob.type,
  })
  type NativeShareArgs = { files: File[] }
  type NativeShareFn = (args: NativeShareArgs) => Promise<void>
  const shareMock = vi.fn<NativeShareFn>(() => Promise.resolve())
  const originalNavigatorShareDescriptor = Object.getOwnPropertyDescriptor(navigator, 'share')

  beforeEach(() =>
    vi.importMock('../../../../utils/share').then((shareModule) => {
      const resolvedModule = shareModule as typeof import('../../../../utils/share')
      createSharePayloadMock = vi.mocked(resolvedModule.createSharePayload)
      payloadToFileMock = vi.mocked(resolvedModule.payloadToFile)
      supportsNavigatorShareMock = vi.mocked(resolvedModule.supportsNavigatorShare)
      canShareFilesMock = vi.mocked(resolvedModule.canShareFiles)
      createSharePayloadMock.mockResolvedValue(mockPayload)
      payloadToFileMock.mockReturnValue(mockFile)
      supportsNavigatorShareMock.mockReturnValue(true)
      canShareFilesMock.mockReturnValue(true)
      shareMock.mockResolvedValue(undefined)
      Object.defineProperty(navigator, 'share', {
        value: shareMock,
        configurable: true,
      })
    }),
  )

  afterEach(() => {
    vi.resetAllMocks()
  })

  afterAll(() => {
    if (originalNavigatorShareDescriptor) {
      Object.defineProperty(navigator, 'share', originalNavigatorShareDescriptor)
    }
  })

  it('shares the WYSIWYG QR canvas via navigator.share', async () => {
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

    await waitFor(() => expect(shareMock).toHaveBeenCalledTimes(1))
    expect(createSharePayloadMock).toHaveBeenCalledTimes(1)

    const canvasArg = createSharePayloadMock.mock.calls[0][0]
    expect(canvasArg).toBeInstanceOf(HTMLCanvasElement)
    expect(canvasArg?.width).toBe(200)
    expect(canvasArg?.height).toBe(200)

    expect(payloadToFileMock).toHaveBeenCalledWith(mockPayload)

    const shareArgument = shareMock.mock.calls[0][0]
    expect(shareArgument.files).toHaveLength(1)
    const [shareFile] = shareArgument.files
    expect(shareFile.name).toBe('qr-code.png')
    expect(shareFile.type).toBe('image/png')
  })
})
