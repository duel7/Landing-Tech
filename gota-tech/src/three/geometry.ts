import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { TILE_ROW, TILE_W } from './layout'

const hash = (a: number, b: number) => {
  const s = Math.sin(a * 127.1 + b * 311.7) * 43758.5453
  return s - Math.floor(s)
}

/**
 * Superfície de telhas cerâmicas: ondulação transversal (canais por onde a água
 * escorre), degrau de sobreposição a cada fiada e leve variação de cor por peça.
 * Local: x ao longo da cumeeira, y subindo a água do telhado, z para fora.
 */
export function tileRoofGeometry(width: number, length: number) {
  const tilesX = Math.round(width / TILE_W)
  const rows = Math.ceil(length / TILE_ROW)
  const segX = tilesX * 10
  const segY = rows * 7
  const geo = new THREE.PlaneGeometry(width, length, segX, segY)
  geo.translate(width / 2, length / 2, 0)
  const pos = geo.attributes.position as THREE.BufferAttribute
  const colors = new Float32Array(pos.count * 3)
  const base = new THREE.Color('#a8452e')
  const c = new THREE.Color()
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i)
    const y = pos.getY(i)
    const u = x / TILE_W
    const fu = u - Math.floor(u)
    const vRow = y / TILE_ROW
    const fv = vRow - Math.floor(vRow)
    // capa arredondada + degrau da fiada (a borda inferior de cada fiada fica mais alta)
    const hump = Math.pow(0.5 - 0.5 * Math.cos(fu * Math.PI * 2), 0.85) * 0.05
    const lap = (1 - fv) * 0.022 + (fv < 0.06 ? (0.06 - fv) * 0.25 : 0)
    pos.setZ(i, hump + lap)
    const h = hash(Math.floor(u + 0.5), Math.floor(vRow))
    c.copy(base).offsetHSL((h - 0.5) * 0.025, (h - 0.5) * 0.12, (h - 0.5) * 0.09)
    // os vales escurecem levemente (sujeira e umidade)
    const valley = 1 - (1 - Math.pow(0.5 - 0.5 * Math.cos(fu * Math.PI * 2), 0.6)) * 0.22
    c.multiplyScalar(valley)
    colors[i * 3] = c.r
    colors[i * 3 + 1] = c.g
    colors[i * 3 + 2] = c.b
  }
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  geo.computeVertexNormals()
  return geo
}

/** Reservatório de polietileno: corpo com nervuras horizontais e ombro arredondado. */
export function tankGeometry(r: number, h: number) {
  const pts: THREE.Vector2[] = [new THREE.Vector2(0, 0), new THREE.Vector2(r - 0.05, 0), new THREE.Vector2(r, 0.05)]
  const ribs = 5
  for (let i = 1; i <= ribs; i++) {
    const y = (h * 0.86 * i) / (ribs + 1) + 0.04
    pts.push(new THREE.Vector2(r, y - 0.05))
    pts.push(new THREE.Vector2(r + 0.02, y - 0.025))
    pts.push(new THREE.Vector2(r + 0.02, y + 0.025))
    pts.push(new THREE.Vector2(r, y + 0.05))
  }
  pts.push(new THREE.Vector2(r, h * 0.9))
  pts.push(new THREE.Vector2(r * 0.97, h * 0.96))
  pts.push(new THREE.Vector2(r * 0.88, h))
  pts.push(new THREE.Vector2(r * 0.86, h))
  pts.push(new THREE.Vector2(0, h))
  const geo = new THREE.LatheGeometry(pts, 72)
  geo.computeVertexNormals()
  return geo
}

/** Tampa levemente abaulada. */
export function lidGeometry(r: number) {
  const pts = [
    new THREE.Vector2(0, 0.12),
    new THREE.Vector2(r * 0.4, 0.115),
    new THREE.Vector2(r * 0.8, 0.08),
    new THREE.Vector2(r, 0.03),
    new THREE.Vector2(r, 0),
    new THREE.Vector2(0, 0),
  ]
  return new THREE.LatheGeometry(pts, 64)
}

/** Copa orgânica: icosaedros deformados unidos em uma só geometria. */
export function canopyGeometry(seed: number, scale = 1) {
  const parts: THREE.BufferGeometry[] = []
  const blobs = 3 + Math.floor(hash(seed, 1) * 2)
  for (let i = 0; i < blobs; i++) {
    const r = (0.55 + hash(seed, i + 2) * 0.45) * scale
    const g = new THREE.IcosahedronGeometry(r, 1)
    const p = g.attributes.position as THREE.BufferAttribute
    for (let k = 0; k < p.count; k++) {
      const n = 1 + (hash(p.getX(k) * 9 + seed, p.getY(k) * 7 + i) - 0.5) * 0.28
      p.setXYZ(k, p.getX(k) * n, p.getY(k) * n * 0.9, p.getZ(k) * n)
    }
    const a = (i / blobs) * Math.PI * 2 + seed
    g.translate(Math.cos(a) * 0.38 * scale, (hash(seed, i) - 0.3) * 0.5 * scale, Math.sin(a) * 0.38 * scale)
    parts.push(g.index ? g.toNonIndexed() : g)
  }
  const merged = mergeGeometries(parts)!
  merged.computeVertexNormals()
  return merged
}

/** Folha pequena (para o filtro e a vegetação de detalhe). */
export function leafGeometry(size = 0.06) {
  const s = new THREE.Shape()
  s.moveTo(0, -size)
  s.bezierCurveTo(size * 0.7, -size * 0.5, size * 0.6, size * 0.5, 0, size)
  s.bezierCurveTo(-size * 0.6, size * 0.5, -size * 0.7, -size * 0.5, 0, -size)
  return new THREE.ShapeGeometry(s, 6)
}

/** Textura de piso: placas de concreto com juntas e manchas de umidade. */
export function pavingTexture() {
  const size = 512
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#4a5a64'
  ctx.fillRect(0, 0, size, size)
  const cells = 4
  const cs = size / cells
  for (let i = 0; i < cells; i++) {
    for (let j = 0; j < cells; j++) {
      const h = hash(i, j)
      ctx.fillStyle = `hsl(200, 9%, ${30 + h * 7}%)`
      ctx.fillRect(i * cs + 2, j * cs + 2, cs - 4, cs - 4)
    }
  }
  for (let k = 0; k < 900; k++) {
    const x = hash(k, 3) * size
    const y = hash(k, 7) * size
    ctx.fillStyle = `rgba(10, 30, 40, ${hash(k, 11) * 0.12})`
    ctx.beginPath()
    ctx.arc(x, y, 2 + hash(k, 13) * 9, 0, Math.PI * 2)
    ctx.fill()
  }
  const tex = new THREE.CanvasTexture(canvas)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 8
  return tex
}

/** Etiqueta "água não potável" para o reservatório. */
export function labelTexture(text: string, sub: string) {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 160
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#f2f8fa'
  ctx.fillRect(0, 0, 512, 160)
  ctx.fillStyle = '#061b2b'
  ctx.font = '600 50px "Instrument Sans Variable", system-ui, sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText(text, 256, 78)
  ctx.font = '500 28px "JetBrains Mono Variable", ui-monospace, monospace'
  ctx.fillStyle = '#34505f'
  ctx.fillText(sub, 256, 124)
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 8
  return tex
}
