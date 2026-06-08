import type { SmsConfig } from '../types/qr'

// Loose phone shape: optional leading +, then at least three of digit / space /
// hyphen / parens / dot. Deliberately permissive — number formats vary by country
// and the goal is to reject obvious garbage, not to enforce E.164.
export const SMS_PHONE_REGEX = /^\+?(?=.*\d)[\d\s\-().]{3,}$/

/**
 * Builds an `SMSTO:number:message` payload — the de-facto QR convention (zxing) that
 * dedicated scanner apps recognize as a send-SMS intent, pre-filling the messaging app.
 * The number is preserved as the user typed it (trimmed); SMSTO is a plain colon-delimited
 * format, not a URI, so no percent-encoding is applied. Returns '' for an empty or
 * implausible number so callers can treat it the same as an empty text field.
 */
export function buildSmsString(config: SmsConfig): string {
  const number = config.number.trim()
  if (!number || !SMS_PHONE_REGEX.test(number)) return ''

  const message = config.message.trim()
  return message ? `SMSTO:${number}:${message}` : `SMSTO:${number}`
}
