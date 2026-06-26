import { test, expect } from '@playwright/test'

// Smoke + visual capture of the Generate view. Runs once per project
// (desktop/mobile x light/dark). The full-page screenshots and the recorded
// video are the deliverable; CI uploads them per PR. Tighten the assertions
// with data-testid hooks as the suite grows. See e2e/README.md.
test('Generate view loads and produces a QR code', async ({ page }, testInfo) => {
  await page.goto('/')

  const generate = page.getByRole('button', { name: /generate/i })
  await expect(generate).toBeVisible()
  await page.screenshot({ path: testInfo.outputPath('01-initial.png'), fullPage: true })

  // Primary flow: enter a value and generate a code, then wait for the
  // rendered canvas (deterministic; avoids the flaky networkidle wait).
  await page.getByRole('textbox').first().fill('https://example.com')
  await generate.click()
  const qr = page.getByTestId('qr-code-canvas')
  await expect(qr).toBeVisible()
  await expect(qr).toHaveAttribute('data-value', 'https://example.com')
  await page.screenshot({ path: testInfo.outputPath('02-generated.png'), fullPage: true })
})
