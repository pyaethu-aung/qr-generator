import { useCallback, useEffect, useRef, useState } from 'react'
import type { ShareMethod, SharePayload, ShareRequest } from '../types/qr'
import {
  canShareFiles,
  copyPayloadToClipboard,
  createSharePayload,
  downloadPayload,
  isMobileDevice,
  payloadToFile,
  supportsClipboardImage,
  supportsNavigatorShare,
} from '../utils/share'

const SHARE_METHOD: ShareMethod = 'navigator-share'
const CLIPBOARD_METHOD: ShareMethod = 'clipboard'
const DOWNLOAD_METHOD: ShareMethod = 'download'

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
  method: ShareMethod,
  status: ShareRequest['status'],
  targetSupported: boolean,
  errorMessage?: string,
): ShareRequest => ({
  method,
  targetSupported,
  status,
  errorMessage,
})

export const useQRShare = () => {
  const [shareRequest, setShareRequest] = useState<ShareRequest | null>(null)
  const shareInFlight = useRef(false)

  // Instrumentation for SC-005: Monitor "cannot share QR" rate
  // In a real app, this would send data to an analytics/logging service (e.g. Sentry, Datadog)
  useEffect(() => {
    if (
      shareRequest?.status === 'shared' ||
      shareRequest?.status === 'failed' ||
      shareRequest?.status === 'canceled'
    ) {
      // Placeholder for actual observability service call
      console.log('[Observation] Share outcome:', {
        method: shareRequest.method,
        status: shareRequest.status,
        error: shareRequest.errorMessage,
        isTechnicalFailure: shareRequest.status === 'failed',
      })
    }
  }, [shareRequest])

  const isSharing = shareRequest?.status === 'pending'

  const share = useCallback(async (canvasElement: HTMLCanvasElement | null) => {
    if (shareInFlight.current) {
      return
    }

    const attemptClipboardFallback = async (payload: SharePayload): Promise<boolean> => {
      if (!supportsClipboardImage()) {
        return false
      }

      setShareRequest(buildRequest(CLIPBOARD_METHOD, 'pending', true))
      await copyPayloadToClipboard(payload)
      setShareRequest(buildRequest(CLIPBOARD_METHOD, 'shared', true))

      return true
    }

    const triggerDownloadFallback = (payload: SharePayload) => {
      setShareRequest(buildRequest(DOWNLOAD_METHOD, 'shared', true))
      downloadPayload(payload)
    }

    const handleFallback = async (payload: SharePayload) => {
      const clipboardAvailable = await attemptClipboardFallback(payload)
      if (!clipboardAvailable) {
        triggerDownloadFallback(payload)
      }
    }

    shareInFlight.current = true

    try {
      const payload = await createSharePayload(canvasElement)
      const file = payloadToFile(payload)
      const navigatorAvailable = supportsNavigatorShare()
      const targetSupported = navigatorAvailable && (canShareFiles([file]) || isMobileDevice())

      if (!targetSupported) {
        setShareRequest(
          buildRequest(SHARE_METHOD, 'failed', false, 'Native share is not available'),
        )
        await handleFallback(payload)
        return
      }

      setShareRequest(buildRequest(SHARE_METHOD, 'pending', true))

      const shareFn =
        typeof navigator.share === 'function' ? navigator.share.bind(navigator) : undefined
      if (typeof shareFn !== 'function') {
        setShareRequest(
          buildRequest(SHARE_METHOD, 'failed', false, 'Navigator share function is unavailable'),
        )
        await handleFallback(payload)
        return
      }

      await shareFn({ files: [file] })

      setShareRequest(buildRequest(SHARE_METHOD, 'shared', true))
    } catch (error) {
      const maybeError = error as Error
      const status =
        maybeError?.name === 'AbortError' || maybeError?.name === 'NotAllowedError'
          ? 'canceled'
          : 'failed'

      setShareRequest(buildRequest(SHARE_METHOD, status, true, normalizeErrorMessage(error)))
    } finally {
      shareInFlight.current = false
    }
  }, [])

  return { share, shareRequest, isSharing }
}
