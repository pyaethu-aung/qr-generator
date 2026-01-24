import { SharePayload } from '../types/qr'

const SHARE_FILENAME = 'qr-code.png'

const captureCanvasBlob = (canvas: HTMLCanvasElement): Promise<Blob> =>
  new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob)
      } else {
        reject(new Error('Failed to generate QR blob'))
      }
    }, 'image/png')
  })

const ensureCanvas = (element: HTMLCanvasElement | null): HTMLCanvasElement => {
  if (!element) {
    throw new Error('QR canvas reference is missing')
  }
  return element
}

export const createSharePayload = async (canvasElement: HTMLCanvasElement | null): Promise<SharePayload> => {
  const canvas = ensureCanvas(canvasElement)
  const blob = await captureCanvasBlob(canvas)

  return {
    blob,
    filename: SHARE_FILENAME,
    lastUpdated: new Date(),
  }
}

export const payloadToFile = (payload: SharePayload): File =>
  new File([payload.blob], payload.filename, {
    type: payload.blob.type || 'image/png',
  })

export const isSharePayload = (value: unknown): value is SharePayload =>
  typeof value === 'object' && value !== null && 'blob' in value && 'filename' in value
