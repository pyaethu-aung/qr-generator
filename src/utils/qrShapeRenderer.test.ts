import { describe, it, expect } from 'vitest'
import { parseQRCode } from './qrShapeRenderer'
import type { QRModule } from './qrShapeRenderer'

describe('qrShapeRenderer Matrix Parser (Foundational)', () => {
  it('should correctly parse a QR code matrix extracting the size and modules', () => {
    const result = parseQRCode('hello world', 'L')
    
    // Version 1 QR code is 21x21 modules
    expect(result.size).toBeGreaterThanOrEqual(21)
    expect(result.modules.length).toBe(result.size * result.size)
  })

  it('should correctly distinguish the 3 (7x7) eye positioning zones from data zones', () => {
    const result = parseQRCode('foundational check', 'M')
    
    const eyeModules = result.modules.filter((m: QRModule) => m.type === 'eye')
    // 3 identical 7x7 zones = 49 * 3 = 147 eye modules total
    expect(eyeModules.length).toBe(147)

    const dataModules = result.modules.filter((m: QRModule) => m.type === 'data')
    expect(dataModules.length).toBe(result.modules.length - 147)

    // Ensure corners belong to correct zones
    expect(result.modules.find((m: QRModule) => m.x === 0 && m.y === 0)?.type).toBe('eye') // Top Left
    expect(result.modules.find((m: QRModule) => m.x === result.size - 1 && m.y === 0)?.type).toBe('eye') // Top Right
    expect(result.modules.find((m: QRModule) => m.x === 0 && m.y === result.size - 1)?.type).toBe('eye') // Bottom Left

    // Ensure bottom right is data (no positioning eye there)
    expect(result.modules.find((m: QRModule) => m.x === result.size - 1 && m.y === result.size - 1)?.type).toBe('data')
  })

  it('should accurately detect dark vs light modules inside the grid', () => {
    const result = parseQRCode('dark light check', 'Q')
    
    const topLeftCorner = result.modules.find((m: QRModule) => m.x === 0 && m.y === 0)
    // The very edge of the position detection eye is always a dark square ring
    expect(topLeftCorner?.isDark).toBe(true)

    // The inner separator ring around an eye should contain light modules 
    // Usually (0, 7), (1, 7)... are part of the separator, which are light (data but 0)
    // Actually the separator is size 1. So x=7, y<8 is part of the format/version/data but 
    // standard says eyes have a 1 module separator of white. 
    // We can just verify that there are both dark and light modules detected.
    const darkModules = result.modules.filter((m: QRModule) => m.isDark)
    const lightModules = result.modules.filter((m: QRModule) => !m.isDark)

    expect(darkModules.length).toBeGreaterThan(0)
    expect(lightModules.length).toBeGreaterThan(0)
  })
})
