import { test, expect } from '@playwright/test'

// The live capacity counter under the text content field. It counts the content
// against the QR byte-mode capacity for the active error-correction level
// (Medium/2331 by default, Highest/1273, Low/2953), and warns as it fills up.

test('counter reflects content length and tracks the EC level', async ({ page }) => {
  await page.goto('/')

  const count = page.getByTestId('capacity-count')
  await page.getByRole('textbox').first().fill('hello')

  // 5 bytes against the default Medium capacity.
  await expect(count).toHaveText('5 / 2331')

  // Lowering reliability shrinks the capacity; raising it shrinks it further.
  await page.getByRole('button', { name: /Highest/ }).click()
  await expect(count).toHaveText('5 / 1273')

  await page.getByRole('button', { name: /Low/ }).click()
  await expect(count).toHaveText('5 / 2953')
})

test('counter warns near the limit and flags going over', async ({ page }) => {
  await page.goto('/')

  const count = page.getByTestId('capacity-count')
  const warning = page.getByTestId('capacity-warning')
  const textbox = page.getByRole('textbox').first()

  // Highest reliability gives the smallest capacity (1273), easiest to fill.
  await page.getByRole('button', { name: /Highest/ }).click()

  // Comfortably under: no warning shown.
  await textbox.fill('a'.repeat(100))
  await expect(warning).toHaveCount(0)

  // Within the warning band but still encodable: amber "Approaching limit".
  await textbox.fill('a'.repeat(1200))
  await expect(warning).toHaveText('Approaching limit')
  await expect(count).toHaveText('1200 / 1273')

  // Past capacity: "Over capacity".
  await textbox.fill('a'.repeat(1300))
  await expect(warning).toHaveText('Over capacity')
  await expect(count).toHaveText('1300 / 1273')
})
