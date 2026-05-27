import type { VCardConfig } from '../types/qr'

function escapeVCardField(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;')
    .replace(/\n/g, '\\n')
}

export function buildVCardString(config: VCardConfig): string {
  const { firstName, lastName, phone, email, company, jobTitle, website } = config

  const fullName = [firstName.trim(), lastName.trim()].filter(Boolean).join(' ')
  if (!fullName) return ''

  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${escapeVCardField(fullName)}`,
    `N:${escapeVCardField(lastName.trim())};${escapeVCardField(firstName.trim())};;;`,
  ]

  if (phone.trim()) lines.push(`TEL;TYPE=CELL:${phone.trim()}`)
  if (email.trim()) lines.push(`EMAIL:${escapeVCardField(email.trim())}`)
  if (company.trim()) lines.push(`ORG:${escapeVCardField(company.trim())}`)
  if (jobTitle.trim()) lines.push(`TITLE:${escapeVCardField(jobTitle.trim())}`)
  if (website.trim()) lines.push(`URL:${website.trim()}`)

  lines.push('END:VCARD')

  return lines.join('\n')
}
