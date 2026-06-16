/**
 * Turns the raw textarea contents of the Batch tab into a clean list of QR values:
 * one per non-empty line, trimmed, de-duplicated (a repeated link makes one code, not
 * two), and capped. Reports the pre-cap unique count so the UI can show "N of MAX" and
 * warn when input was truncated.
 */

/** Upper bound on codes per batch run — keeps a single run responsive and the ZIP sane. */
export const BATCH_MAX_LINES = 200

export interface ParsedBatchInput {
  /** Unique, trimmed, non-empty lines, capped at {@link BATCH_MAX_LINES}. */
  values: string[]
  /** Unique non-empty line count before the cap (drives the live count + over-cap warning). */
  total: number
  /** True when more than {@link BATCH_MAX_LINES} unique lines were supplied and `values` was truncated. */
  truncated: boolean
}

export function parseBatchInput(raw: string): ParsedBatchInput {
  const seen = new Set<string>()
  const unique: string[] = []

  for (const line of raw.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || seen.has(trimmed)) continue
    seen.add(trimmed)
    unique.push(trimmed)
  }

  return {
    values: unique.slice(0, BATCH_MAX_LINES),
    total: unique.length,
    truncated: unique.length > BATCH_MAX_LINES,
  }
}
