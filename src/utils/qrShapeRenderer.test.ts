import { describe, it, expect } from 'vitest'
import { parseQRCode, getEyeFramePath, getEyeCenterPath, getDataPath, generateQRPaths } from './qrShapeRenderer'
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

  it('[US1] eye FRAME paths render an outer ring (outer boundary + 5×5 hole) per shape', () => {
    // Top left eye at 0,0 size 10
    const square = getEyeFramePath('Square', 0, 0, 10);
    expect(square).toContain('M0,0')
    expect(square).toContain('h70') // outer 7 * 10
    expect(square).toContain('M10,10') // 5×5 hole inset 1 module
    expect(square).toContain('h50')    // hole 5 * 10
    // Frame excludes the dark 3×3 center
    expect(square).not.toContain('h30')

    const leaf = getEyeFramePath('Leaf', 0, 0, 10);
    expect(leaf).toContain('a15,15') // rounded corner arc on the leaf side

    const hexagon = getEyeFramePath('Hexagon', 0, 0, 10);
    expect(hexagon).toContain('M35,0') // pointy-top hexagon apex at x + 3.5*s

    const circle = getEyeFramePath('Circle', 0, 0, 10);
    expect(circle).toContain('a35,35') // outer circle radius 3.5 * 10
    expect(circle).toContain('a25,25') // hole circle radius 2.5 * 10
  })

  it('[US1] eye CENTER paths render the inner 3×3 dot per shape', () => {
    const square = getEyeCenterPath('Square', 0, 0, 10);
    expect(square).toContain('M20,20') // inset 2 modules
    expect(square).toContain('h30')    // 3 * 10

    const dot = getEyeCenterPath('Dot', 0, 0, 10);
    expect(dot).toContain('a15,15') // radius 1.5 * 10

    const diamond = getEyeCenterPath('Diamond', 0, 0, 10);
    expect(diamond).toContain('M35,20') // top vertex at (cx, y+2s)

    const rounded = getEyeCenterPath('Rounded', 0, 0, 10);
    expect(rounded).toContain('a7.5,7.5') // corner radius 0.75 * 10
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
     const paths = generateQRPaths('test render sequence', 'L', 'Hexagon', 'Dot', 'Dots', 10);
     expect(paths.size).toBeGreaterThan(20)
     expect(paths.eyeFramePath).toContain('M35,0') // Top left hexagon frame apex
     expect(paths.eyeCenterPath).toContain('a15,15') // Dot center radius 1.5 * 10
     // Ensure eye geometries and standard dot formats map appropriately
     expect(paths.dataPath).toContain('a4.5,4.5 0 1,0 0,9')
  })

  it('generateQRPaths includes eyeBgPath with three 8×8 background rects', () => {
    const { eyeBgPath, size } = generateQRPaths('test', 'M', 'Square', 'Diamond', 'Square', 10);
    expect(eyeBgPath).toContain('M0,0 h80 v80 h-80 Z');
    expect(eyeBgPath).toContain(`M${(size-8)*10},0`);
    expect(eyeBgPath).toContain(`M0,${(size-8)*10}`);
  })

  it('[US3] new eye FRAME shapes render correct outer/inner geometry', () => {
    const squareRound = getEyeFramePath('SquareRound', 0, 0, 10);
    expect(squareRound).toContain('M0,0')    // square outer start
    expect(squareRound).toContain('h70')     // outer 7 * 10
    expect(squareRound).toContain('a10,10') // rounded inner hole arc

    const roundSquare = getEyeFramePath('RoundSquare', 0, 0, 10);
    expect(roundSquare).toContain('a15,15') // rounded outer arc r=1.5*10
    expect(roundSquare).toContain('h50')    // square 5×5 inner hole h=5*10

    const diamond = getEyeFramePath('Diamond', 0, 0, 10);
    expect(diamond).toContain('M35,0')   // outer apex at x+3.5s=35
    expect(diamond).toContain('L70,35')  // outer right vertex at x+7s,y+3.5s
    expect(diamond).toContain('M35,10')  // inner apex at x+3.5s,y+s
  })

  it('[US3] new eye CENTER shapes render correct paths', () => {
    const star = getEyeCenterPath('Star', 0, 0, 10);
    expect(star.length).toBeGreaterThan(0)
    expect(star).toContain('M35,')  // top vertex of star at cx=x+3.5s=35

    const cross = getEyeCenterPath('Cross', 0, 0, 10);
    expect(cross).toContain('M30,20') // top-left of cross top arm: x+3s=30, y+2s=20
    expect(cross).toContain('h10')    // arm width = s = 10
  })
})
