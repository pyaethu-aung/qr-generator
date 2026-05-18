import qrcode from 'qrcode'

export type QRModuleType = 'eye' | 'data'

export interface QRModule {
  x: number
  y: number
  isDark: boolean
  type: QRModuleType
}

export interface ParsedQR {
  size: number
  modules: QRModule[]
}

export function getMatrixSize(value: string, ecLevel: 'L' | 'M' | 'Q' | 'H'): number {
  if (!value) return 21;
  const qr = qrcode.create(value, { errorCorrectionLevel: ecLevel })
  return qr.modules.size;
}

/**
 * Parses raw `qrcode` module matrix into a 2D-aware list specifying coordinate locations,
 * module type (positional 'eye' vs standard 'data'), and light/dark status.
 */
export function parseQRCode(value: string, ecLevel: 'L' | 'M' | 'Q' | 'H'): ParsedQR {
  // Use qrcode to generate the raw binary matrix
  const qr = qrcode.create(value, { errorCorrectionLevel: ecLevel })
  const size = qr.modules.size
  const data = qr.modules.data
  
  const modules: QRModule[] = []

  // Iterate over 1D bit array calculating 2D coords
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const isDark = !!data[y * size + x]
      
      // Calculate if the module falls within the 3 standard QR alignment corners
      // Standard format defines position detection patterns as 7x7 squares located at corners
      const isTopLeftEye = x < 7 && y < 7
      const isTopRightEye = x >= size - 7 && y < 7
      const isBottomLeftEye = x < 7 && y >= size - 7
      
      const type: QRModuleType = (isTopLeftEye || isTopRightEye || isBottomLeftEye) ? 'eye' : 'data'

      modules.push({ x, y, isDark, type })
    }
  }

  return { size, modules }
}

export function getEyePath(shape: import('../types/qr').QREyeShape, x: number, y: number, cellSize: number): string {
  const s = cellSize;
  // All eye paths use even-odd fill rule (declared on the <path> element).
  // Subpaths must be ordered: outer frame → separator gap → inner center.
  // The even-odd rule automatically punches holes at every alternating subpath,
  // creating the mandatory 3-layer eye structure without needing to think about
  // individual winding directions.

  // Square: outer 7×7 → white 5×5 gap → dark 3×3 center
  const squarePath =
    `M${x},${y} h${7*s} v${7*s} h-${7*s} Z ` +
    `M${x+s},${y+s} h${5*s} v${5*s} h-${5*s} Z ` +
    `M${x+2*s},${y+2*s} h${3*s} v${3*s} h-${3*s} Z`;

  if (shape === 'Rounded') {
    // Rounded: outer 7×7 (r=1.5s) → white 5×5 gap (r=s) → dark 3×3 center as circle (r=1.5s)
    return (
      `M${x+1.5*s},${y} h${4*s} a${1.5*s},${1.5*s} 0 0 1 ${1.5*s},${1.5*s} v${4*s} a${1.5*s},${1.5*s} 0 0 1 -${1.5*s},${1.5*s} h-${4*s} a${1.5*s},${1.5*s} 0 0 1 -${1.5*s},-${1.5*s} v-${4*s} a${1.5*s},${1.5*s} 0 0 1 ${1.5*s},-${1.5*s} Z ` +
      `M${x+2*s},${y+s} h${3*s} a${s},${s} 0 0 1 ${s},${s} v${3*s} a${s},${s} 0 0 1 -${s},${s} h-${3*s} a${s},${s} 0 0 1 -${s},-${s} v-${3*s} a${s},${s} 0 0 1 ${s},-${s} Z ` +
      `M${x+2*s},${y+3.5*s} a${1.5*s},${1.5*s} 0 1 0 ${3*s},0 a${1.5*s},${1.5*s} 0 1 0 -${3*s},0 Z`
    );
  }

  if (shape === 'Diamond') {
    const cx = x + 3.5*s;
    const cy = y + 3.5*s;
    // outer diamond → white diamond gap (1 module inset) → dark 3×3-equiv center (2 modules inset)
    return (
      `M${cx},${y} L${x+7*s},${cy} L${cx},${y+7*s} L${x},${cy} Z ` +
      `M${cx},${y+s} L${x+6*s},${cy} L${cx},${y+6*s} L${x+s},${cy} Z ` +
      `M${cx},${y+2*s} L${x+5*s},${cy} L${cx},${y+5*s} L${x+2*s},${cy} Z`
    );
  }

  if (shape === 'Leaf') {
    // Top-left sharp, bottom-right rounded outer → white gap inner → dark center
    return (
      `M${x},${y} h${5.5*s} a${1.5*s},${1.5*s} 0 0 1 ${1.5*s},${1.5*s} v${5.5*s} h-${5.5*s} a${1.5*s},${1.5*s} 0 0 1 -${1.5*s},-${1.5*s} Z ` +
      `M${x+s},${y+s} h${4*s} a${s},${s} 0 0 1 ${s},${s} v${4*s} h-${4*s} a${s},${s} 0 0 1 -${s},-${s} Z ` +
      `M${x+2*s},${y+2*s} h${2.5*s} a${0.5*s},${0.5*s} 0 0 1 ${0.5*s},${0.5*s} v${2.5*s} h-${2.5*s} a${0.5*s},${0.5*s} 0 0 1 -${0.5*s},-${0.5*s} Z`
    );
  }

  if (shape === 'Hexagon') {
    const cx = x + 3.5*s;
    // Pointy-top hexagon: side vertices at H/4 and 3H/4 of each layer's height.
    // outer 7s tall: sides at 1.75s, 5.25s. gap 5s tall (y+s..y+6s): sides at y+2.25s, y+4.75s.
    // inner 3s tall (y+2s..y+5s): sides at y+2.75s, y+4.25s.
    return (
      `M${cx},${y} L${x+7*s},${y+1.75*s} L${x+7*s},${y+5.25*s} L${cx},${y+7*s} L${x},${y+5.25*s} L${x},${y+1.75*s} Z ` +
      `M${cx},${y+s} L${x+6*s},${y+2.25*s} L${x+6*s},${y+4.75*s} L${cx},${y+6*s} L${x+s},${y+4.75*s} L${x+s},${y+2.25*s} Z ` +
      `M${cx},${y+2*s} L${x+5*s},${y+2.75*s} L${x+5*s},${y+4.25*s} L${cx},${y+5*s} L${x+2*s},${y+4.25*s} L${x+2*s},${y+2.75*s} Z`
    );
  }

  return squarePath;
}

export function getDataPath(pattern: import('../types/qr').QRPixelPattern, x: number, y: number, cellSize: number): string {
  const s = cellSize;
  if (pattern === 'Dots') {
    return `M${x + 0.5 * s},${y} a${0.5 * s},${0.5 * s} 0 1,0 0,${s} a${0.5 * s},${0.5 * s} 0 1,0 0,-${s} `;
  }
  return `M${x},${y} h${s} v${s} h-${s} Z `;
}

export function generateQRPaths(value: string, ecLevel: 'L'|'M'|'Q'|'H', eyeShape: import('../types/qr').QREyeShape, pattern: import('../types/qr').QRPixelPattern, cellSize: number = 10) {
  const parsed = parseQRCode(value, ecLevel);
  const size = parsed.size;
  
  let dataPath = '';
  parsed.modules.forEach(m => {
    if (m.isDark && m.type === 'data') {
      dataPath += getDataPath(pattern, m.x * cellSize, m.y * cellSize, cellSize);
    }
  });

  // Calculate standard 3 eyes locations strictly at top-left, top-right, bottom-left
  const eyesPath =
    getEyePath(eyeShape, 0, 0, cellSize) + ' ' +
    getEyePath(eyeShape, (size - 7) * cellSize, 0, cellSize) + ' ' +
    getEyePath(eyeShape, 0, (size - 7) * cellSize, cellSize);

  // 8×8 background rects (eye zone + 1-module separator) per eye position.
  // Separator modules are always white per QR spec, so covering them is safe.
  // Rendered between data and eye paths to ensure clean visual separation for
  // non-rectangular eye shapes whose transparent corners would otherwise expose
  // adjacent dark timing/format-info modules.
  const c = cellSize;
  const eyeBgPath =
    `M0,0 h${8*c} v${8*c} h-${8*c} Z ` +
    `M${(size-8)*c},0 h${8*c} v${8*c} h-${8*c} Z ` +
    `M0,${(size-8)*c} h${8*c} v${8*c} h-${8*c} Z`;

  return { dataPath, eyesPath, eyeBgPath, size };
}
