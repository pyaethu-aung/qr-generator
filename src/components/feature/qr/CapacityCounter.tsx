import { getCapacityStatus } from '../../../utils/qrCapacity'
import type { QRErrorCorrectionLevel } from '../../../types/qr'

export interface CapacityCounterProps {
  /** Current content of the text field. */
  value: string
  /** Active error-correction level — sets the capacity the content counts against. */
  ecLevel: QRErrorCorrectionLevel
  /** Screen-reader usage summary, with {used} and {max} placeholders. */
  usageLabel?: string
  /** Shown beside the count once content approaches the limit. */
  nearLimitLabel?: string
  /** Shown beside the count once content exceeds the limit. */
  overLimitLabel?: string
}

/**
 * A live count of how much of a QR code's capacity the content uses (e.g.
 * `42 / 2953`) for the active error-correction level. It turns amber as the
 * content nears the limit and red once it exceeds it — and because lowering the
 * correction level shrinks the capacity, the denominator updates with it.
 */
export function CapacityCounter({
  value,
  ecLevel,
  usageLabel = '{used} of {max} characters used',
  nearLimitLabel = 'Approaching limit',
  overLimitLabel = 'Over capacity',
}: CapacityCounterProps) {
  const { used, max, isNearLimit, isOverLimit } = getCapacityStatus(value, ecLevel)

  const tone = isOverLimit
    ? 'text-error'
    : isNearLimit
      ? 'text-warning'
      : 'text-text-secondary'

  // A word backs the colour so the limit is not signalled by colour alone.
  const warning = isOverLimit ? overLimitLabel : isNearLimit ? nearLimitLabel : null
  const srText = usageLabel.replace('{used}', String(used)).replace('{max}', String(max))

  return (
    <div className="flex items-center justify-end gap-2 text-xs">
      {warning && (
        <span className={`font-medium ${tone}`} data-testid="capacity-warning">
          {warning}
        </span>
      )}
      <span
        className={`font-['Geist_Mono'] tabular-nums ${tone}`}
        aria-hidden="true"
        data-testid="capacity-count"
      >
        {used} / {max}
      </span>
      <span className="sr-only">{srText}</span>
    </div>
  )
}

export default CapacityCounter
