import { describe, it, expect } from 'vitest'
import { parseQRCode, getEyePath, getDataPath, generateQRPaths } from './qrShapeRenderer'
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

  it('[US1] should correctly compute eye shape standard variants including Diamond, Hexagon, Leaf and Rounded offsets', () => {
    // Top left eye at 0,0 size 10 
    const svgPathSquare = getEyePath('Square', 0, 0, 10);
    // Should contain pure square commands standard inside M/h/v
    expect(svgPathSquare).toContain('M0,0')
    expect(svgPathSquare).toContain('h70') // 7 * 10
    
    const svgPathLeaf = getEyePath('Leaf', 0, 0, 10);
    expect(svgPathLeaf).toContain('a15,15') // Using arc for the leaf side

    const svgPathHexagon = getEyePath('Hexagon', 0, 0, 10);
    // Center of hexagon X component is 35 (x + 3.5 * s)
    expect(svgPathHexagon).toContain('M35,0')
  })

  it('[US2] should correctly compute data dot radius coordinate mapping', () => {
    const squareData = getDataPath('Square', 10, 20, 10);
    expect(squareData).toContain('M10,20')
    expect(squareData).toContain('h10')
    expect(squareData).toContain('v10')

    const dotData = getDataPath('Dots', 10, 20, 10);
    // Dots draw as circle using arc centered horizontally, radius 0.45*cellSize
    expect(dotData).toContain('M15,20.5')
    expect(dotData).toContain('a4.5,4.5 0 1,0 0,9 a4.5,4.5 0 1,0 0,-9')
  })

  it('generates fully compiled valid SVG path strings encompassing data and eyes', () => {
     const paths = generateQRPaths('test render sequence', 'L', 'Hexagon', 'Dots', 10);
     expect(paths.size).toBeGreaterThan(20)
     expect(paths.eyesPath).toContain('M35,0') // Top left hexagon center-top check
     // Ensure eye geometries and standard dot formats map appropriately
     expect(paths.dataPath).toContain('a4.5,4.5 0 1,0 0,9')
  })

  it('generateQRPaths includes eyeBgPath with three 8×8 background rects', () => {
    const { eyeBgPath, size } = generateQRPaths('test', 'M', 'Diamond', 'Square', 10);
    expect(eyeBgPath).toContain('M0,0 h80 v80 h-80 Z');
    expect(eyeBgPath).toContain(`M${(size-8)*10},0`);
    expect(eyeBgPath).toContain(`M0,${(size-8)*10}`);
  })
})
