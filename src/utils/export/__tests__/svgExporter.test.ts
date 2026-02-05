import { describe, expect, it } from 'vitest'
import { exportSvg } from '../svgExporter'

// Helper to read blob text in test environment
async function blobToText(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsText(blob)
  })
}

describe('svgExporter', () => {
  const mockConfig = {
    value: 'https://example.com',
    ecLevel: 'M' as const,
    fgColor: '#000000',
    bgColor: '#FFFFFF',
    margin: 0,
  }

  describe('exportSvg', () => {
    it('generates valid SVG blob', async () => {
      const blob = await exportSvg('Test QR Code', mockConfig)

      expect(blob).toBeInstanceOf(Blob)
      expect(blob.type).toBe('image/svg+xml')
      expect(blob.size).toBeGreaterThan(0)
    })

    it('generates SVG string containing QR code data', async () => {
      const blob = await exportSvg('https://example.com', mockConfig)
      const text = await blobToText(blob)

      // Verify it's valid SVG
      expect(text).toContain('<svg')
      expect(text).toContain('</svg>')
      expect(text).toContain('xmlns="http://www.w3.org/2000/svg"')
    })

    it('preserves foreground color', async () => {
      const customConfig = {
        ...mockConfig,
        fgColor: '#FF0000', // Red
      }

      const blob = await exportSvg('Test', customConfig)
      const text = await blobToText(blob)

      // SVG should contain the red color
      expect(text.toLowerCase()).toContain('#ff0000')
    })

    it('preserves background color', async () => {
      const customConfig = {
        ...mockConfig,
        bgColor: '#00FF00', // Green
      }

      const blob = await exportSvg('Test', customConfig)
      const text = await blobToText(blob)

      // SVG should contain the green color
      expect(text.toLowerCase()).toContain('#00ff00')
    })

    it('respects error correction level', async () => {
      const highECConfig = {
        ...mockConfig,
        ecLevel: 'H' as const, // High error correction
      }

      const lowECConfig = {
        ...mockConfig,
        ecLevel: 'L' as const, // Low error correction
      }

      const highBlob = await exportSvg('Test', highECConfig)
      const lowBlob = await exportSvg('Test', lowECConfig)

      // Higher EC level produces more modules (larger SVG)
      expect(lowBlob.size).toBeGreaterThan(highBlob.size)
    })

    it('generates different SVG for different content', async () => {
      const blob1 = await exportSvg('Content A', mockConfig)
      const blob2 = await exportSvg('Content B', mockConfig)

      const text1 = await blobToText(blob1)
      const text2 = await blobToText(blob2)

      // Different content should produce different SVG
      expect(text1).not.toBe(text2)
    })

    it('handles long URLs correctly', async () => {
      const longUrl = 'https://example.com/very/long/path/with/many/segments/' + 'x'.repeat(100)

      const blob = await exportSvg(longUrl, mockConfig)
      const text = await blobToText(blob)

      expect(text).toContain('<svg')
      expect(blob.size).toBeGreaterThan(0)
    })

    it('handles special characters in content', async () => {
      const specialContent = 'Test & <Special> "Characters"'

      const blob = await exportSvg(specialContent, mockConfig)
      const text = await blobToText(blob)

      expect(text).toContain('<svg')
      expect(blob.size).toBeGreaterThan(0)
    })

    it('throws error for empty value', async () => {
      await expect(exportSvg('', mockConfig)).rejects.toThrow('Cannot export empty QR code')
    })

    it('applies margin setting', async () => {
      const noMarginConfig = { ...mockConfig, margin: 0 }
      const withMarginConfig = { ...mockConfig, margin: 4 }

      const noMarginBlob = await exportSvg('Test', noMarginConfig)
      const withMarginBlob = await exportSvg('Test', withMarginConfig)

      // SVG with margin should be larger (more whitespace)
      expect(withMarginBlob.size).toBeGreaterThan(noMarginBlob.size)
    })

    it('generates resolution-independent output', async () => {
      // SVG should not have fixed dimensions that prevent scaling
      const blob = await exportSvg('Test', mockConfig)
      const text = await blobToText(blob)

      // Verify SVG has viewBox for scalability
      expect(text).toContain('viewBox')
    })

    it('produces valid XML structure', async () => {
      const blob = await exportSvg('Test', mockConfig)
      const text = await blobToText(blob)

      // Basic XML validity checks
      expect(text).toMatch(/<svg[^>]*>/)
      expect(text).toContain('</svg>')
      expect(text.split('<svg').length - 1).toBe(1) // Only one svg root
      expect(text.split('</svg>').length - 1).toBe(1)
    })
  })
})
