// Loose phone shape: optional leading +, then at least three of digit / space /
// hyphen / parens / dot. Deliberately permissive — number formats vary by country
// and the goal is to reject obvious garbage, not to enforce E.164.
export const PHONE_REGEX = /^\+?(?=.*\d)[\d\s\-().]{3,}$/

/**
 * Normalizes a user-entered phone number to a leading `+` and digits only: spaces,
 * hyphens, parens, and dots are stripped, because many scanner apps and OS dial/SMS
 * intents choke on formatting characters in the number and silently fail. Returns
 * `null` for an empty or implausible number (fails PHONE_REGEX, or has no digit once
 * stripped) so callers can treat it the same as empty input.
 */
export function normalizePhone(raw: string): string | null {
  const trimmed = raw.trim()
  if (!trimmed || !PHONE_REGEX.test(trimmed)) return null

  const normalized = trimmed.replace(/[^\d+]/g, '')
  if (!/\d/.test(normalized)) return null

  return normalized
}
