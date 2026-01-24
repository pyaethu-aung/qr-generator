import { useCallback, useRef, useState } from 'react'
import type { ShareMethod, ShareRequest } from '../types/qr'
import {
  canShareFiles,
  createSharePayload,
  payloadToFile,
  supportsNavigatorShare,
} from '../utils/share'

const SHARE_METHOD: ShareMethod = 'navigator-share'

const normalizeErrorMessage = (value: unknown): string | undefined => {
  if (value instanceof Error) {
    return value.message
  }

  if (typeof value === 'string') {
    return value
  }

  return undefined
}

const buildRequest = (
  status: ShareRequest['status'],
  targetSupported: boolean,
  errorMessage?: string,
): ShareRequest => ({
  method: SHARE_METHOD,
  targetSupported,
  status,
  errorMessage,
})

export const useQRShare = () => {
  const [shareRequest, setShareRequest] = useState<ShareRequest | null>(null)
  const shareInFlight = useRef(false)

  const isSharing = shareRequest?.status === 'pending'

  const share = useCallback(async (canvasElement: HTMLCanvasElement | null) => {
    if (shareInFlight.current) {
      return
    }

    shareInFlight.current = true

    try {
      const payload = await createSharePayload(canvasElement)
      const file = payloadToFile(payload)
      const navigatorAvailable = supportsNavigatorShare()
      const targetSupported = navigatorAvailable && canShareFiles([file])

      if (!targetSupported) {
        setShareRequest(buildRequest('failed', false, 'Native share is not available'))
        return
      }

      setShareRequest(buildRequest('pending', true))

      const shareFn =
        typeof navigator.share === 'function' ? navigator.share.bind(navigator) : undefined
      if (typeof shareFn !== 'function') {
        setShareRequest(buildRequest('failed', false, 'Navigator share function is unavailable'))
        return
      }

      await shareFn({ files: [file] })

      setShareRequest(buildRequest('shared', true))
    } catch (error) {
      const maybeError = error as Error
      const status =
        maybeError?.name === 'AbortError' || maybeError?.name === 'NotAllowedError'
          ? 'canceled'
          : 'failed'

      setShareRequest(buildRequest(status, true, normalizeErrorMessage(error)))
    } finally {
      shareInFlight.current = false
    }
  }, [])

  return { share, shareRequest, isSharing }
}
