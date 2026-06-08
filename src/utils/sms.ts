import type { SmsConfig } from '../types/qr'

// Loose phone shape: optional leading +, then at least three of digit / space /
// hyphen / parens / dot. Deliberately permissive — number formats vary by country
// and the goal is to reject obvious garbage, not to enforce E.164.
export const SMS_PHONE_REGEX = /^\+?(?=.*\d)[\d\s\-().]{3,}$/

/**
 * Builds an `SMSTO:number:message` payload — the de-facto QR convention (zxing) that
 * dedicated scanner apps recognize as a send-SMS intent, pre-filling the messaging app.
 * The number is normalized to a leading `+` and digits only: spaces, hyphens, parens, and
 * dots are stripped, because many scanner apps and OS SMS intents choke on formatting
 * characters in the number and silently fail to pre-fill the recipient. The visible input
 * keeps the user's formatting; only the encoded payload is normalized. SMSTO is a plain
 * colon-delimited format, not a URI, so the message is not percent-encoded. Returns '' for
 * an empty or implausible number so callers treat it the same as an empty text field.
 */
export function buildSmsString(config: SmsConfig): string {
  const raw = config.number.trim()
  if (!raw || !SMS_PHONE_REGEX.test(raw)) return ''

  const number = raw.replace(/[^\d+]/g, '')
  if (!/\d/.test(number)) return ''

  const message = config.message.trim()
  return message ? `SMSTO:${number}:${message}` : `SMSTO:${number}`
}
