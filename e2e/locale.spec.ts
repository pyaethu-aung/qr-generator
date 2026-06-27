import { test, expect } from '@playwright/test'
import type { Page } from '@playwright/test'

const html = (page: Page) => page.locator('html')

// ── Locale switcher: English → Burmese → Spanish ────────────────────────────

test('Locale: cycles through English, Burmese, and Spanish', async ({ page }) => {
  await page.goto('/')

  // Default locale is English.
  await expect(page.getByRole('heading', { name: 'Sculpt standout QR codes' })).toBeVisible()
  await expect(html(page)).toHaveAttribute('lang', 'en')

  // First click: English → Burmese. The existing Burmese locale stays intact.
  await page.getByRole('button', { name: 'Switch to Burmese' }).click()
  await expect(html(page)).toHaveAttribute('lang', 'my')

  // Second click: Burmese → Spanish. Burmese ships no Spanish switch label, so
  // the button text falls back to the English "Switch to Spanish" copy.
  await page.getByRole('button', { name: 'Switch to Spanish' }).click()
  await expect(html(page)).toHaveAttribute('lang', 'es')

  // Spanish copy renders across the hero and the tab chrome.
  await expect(page.getByRole('heading', { name: 'Crea códigos QR que destacan' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Escanear' })).toBeVisible()

  // Third click wraps back around to English.
  await page.getByRole('button', { name: 'Cambiar a inglés' }).click()
  await expect(html(page)).toHaveAttribute('lang', 'en')
})

// ── Spanish preference persists across a reload ─────────────────────────────

test('Locale: Spanish selection persists across reload', async ({ page }) => {
  await page.goto('/')

  await page.getByRole('button', { name: 'Switch to Burmese' }).click()
  await page.getByRole('button', { name: 'Switch to Spanish' }).click()
  await expect(html(page)).toHaveAttribute('lang', 'es')

  await page.reload()

  await expect(html(page)).toHaveAttribute('lang', 'es')
  await expect(page.getByRole('heading', { name: 'Crea códigos QR que destacan' })).toBeVisible()
})
