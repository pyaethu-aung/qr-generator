import { describe, it, expect } from 'vitest'
import { composeQrSvg } from '../qrSvgComposer'
import type { QRDesignConfig, QRFrameConfig } from '../../types/qr'

const design: QRDesignConfig = {
  eyeFrameShape: 'Square',
  eyeCenterShape: 'Square',
  eyeFrameColor: null,
  eyeCenterColor: null,
  pixelPattern: 'Square',
}

const base = {
  value: 'https://example.com',
  ecLevel: 'M' as const,
  fgColor: '#000000',
  bgColor: '#FFFFFF',
  design,
}

const frame: QRFrameConfig = { style: 'Banner', text: 'SCAN ME', color: '#A04D28', position: 'bottom' }

describe('composeQrSvg', () => {
  it('renders the bare QR for no frame, centered with a square viewBox', () => {
    const result = composeQrSvg(base)
    // viewBox is the QR matrix size times the cell size.
    expect(result.viewBox % 10).toBe(0)
    expect(result.logoCenter).toEqual({ x: result.viewBox / 2, y: result.viewBox / 2 })
    expect(result.logoBase).toBe(result.viewBox)
    expect(result.body).toContain('<rect')
    // bg rect + data + eyeBg + eyeFrame + eyeCenter
    expect(result.body.split('<path').length - 1).toBe(4)
    // No frame accent.
    expect(result.body).not.toContain('#A04D28')
  })

  it('treats explicit "None" the same as no frame', () => {
    const none = composeQrSvg({ ...base, frame: { ...frame, style: 'None' } })
    const bare = composeQrSvg(base)
    expect(none.viewBox).toBe(bare.viewBox)
    expect(none.body).toBe(bare.body)
  })

  it('grows the canvas and paints the frame when a style is set', () => {
    const bare = composeQrSvg(base)
    const framed = composeQrSvg({ ...base, frame })
    expect(framed.viewBox).toBeGreaterThan(bare.viewBox)
    expect(framed.body).toContain('#A04D28')
    // QR group is translated into place.
    expect(framed.body).toContain('transform="translate(')
  })

  it('centers the logo on the QR region, not the whole canvas', () => {
    const framed = composeQrSvg({ ...base, frame })
    // The logo base is the QR size, smaller than the framed canvas.
    expect(framed.logoBase).toBeLessThan(framed.viewBox)
    // And its center sits above the canvas center for a bottom caption.
    expect(framed.logoCenter.y).toBeLessThan(framed.viewBox / 2)
  })

  it('produces different geometry for different frame styles', () => {
    const banner = composeQrSvg({ ...base, frame: { ...frame, style: 'Banner' } })
    const card = composeQrSvg({ ...base, frame: { ...frame, style: 'Card' } })
    expect(banner.viewBox).not.toBe(card.viewBox)
  })
})
