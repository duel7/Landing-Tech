import * as THREE from 'three'

// Medidas da maquete (unidades arbitrárias, próximas de metros). Servem apenas à
// composição visual — não são dimensões do projeto, que a pesquisa não define.

export const WALL_H = 2.7
export const HOUSE_W = 7
export const HOUSE_D = 4.6
export const RISE = 1.25
export const OVER_Z = 0.45
export const OVER_X = 0.35

export const TAN = RISE / (HOUSE_D / 2)
export const COS = 1 / Math.sqrt(1 + TAN * TAN)
export const SIN = TAN * COS
export const RIDGE_Y = WALL_H + RISE
export const EAVE_Z = HOUSE_D / 2 + OVER_Z
export const EAVE_Y = WALL_H - OVER_Z * TAN
export const ROOF_X = HOUSE_W / 2 + OVER_X
export const SLOPE_LEN = EAVE_Z / COS
export const roofY = (z: number) => RIDGE_Y - Math.abs(z) * TAN

export const TILE_W = 0.25
export const TILE_ROW = 0.34

export const GUTTER_R = 0.1
export const GUTTER_Z = EAVE_Z + 0.07
export const GUTTER_Y = EAVE_Y - 0.06
export const PIPE_R = 0.052
export const DOWN_X = 3.66

export const TANK = { x: 6.15, z: 2.45, r: 0.82, base: 0.16, h: 1.6 }
export const TANK_TOP = TANK.base + TANK.h + 0.1
export const FILTER = { x: 4.78, y: 2.0, z: GUTTER_Z, len: 0.5, r: 0.16 }
export const GARDEN = { x: 4.35, z: 4.45, w: 1.7, d: 0.72, h: 0.34 }
export const BUCKET = { x: TANK.x, z: TANK.z + TANK.r + 0.3 }
// Poste atrás do reservatório: contraluz na chuva junto ao sistema.
export const LAMP = { x: 8.5, z: 0.1, h: 3.8, hx: -0.62, hz: 0.5 }

/** Polilinha com cantos arredondados (curvas de joelho de tubulação). */
export function roundedPath(points: THREE.Vector3[], radius: number) {
  const path = new THREE.CurvePath<THREE.Vector3>()
  let prev = points[0].clone()
  for (let i = 1; i < points.length - 1; i++) {
    const a = points[i - 1]
    const b = points[i]
    const c = points[i + 1]
    const inDir = b.clone().sub(a)
    const outDir = c.clone().sub(b)
    const r = Math.min(radius, inDir.length() / 2, outDir.length() / 2)
    const p1 = b.clone().sub(inDir.normalize().multiplyScalar(r))
    const p2 = b.clone().add(outDir.normalize().multiplyScalar(r))
    if (prev.distanceTo(p1) > 1e-4) path.add(new THREE.LineCurve3(prev, p1))
    path.add(new THREE.QuadraticBezierCurve3(p1, b.clone(), p2))
    prev = p2
  }
  path.add(new THREE.LineCurve3(prev, points[points.length - 1].clone()))
  return path
}

/** Amostra uma curva em pontos igualmente espaçados (para partículas e brilho). */
export function samplePath(curve: THREE.Curve<THREE.Vector3>, count = 256) {
  const pts = curve.getSpacedPoints(count - 1)
  const arr = new Float32Array(count * 3)
  pts.forEach((p, i) => p.toArray(arr, i * 3))
  return { points: arr, count, length: curve.getLength() }
}

export type Sampled = ReturnType<typeof samplePath>

export function pointOn(s: Sampled, t: number, out: THREE.Vector3) {
  const f = Math.min(0.99999, Math.max(0, t)) * (s.count - 1)
  const i = Math.floor(f)
  const k = f - i
  const a = i * 3
  const b = a + 3
  out.set(
    s.points[a] + (s.points[b] - s.points[a]) * k,
    s.points[a + 1] + (s.points[b + 1] - s.points[a + 1]) * k,
    s.points[a + 2] + (s.points[b + 2] - s.points[a + 2]) * k,
  )
  return out
}

const v = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z)
const OUTLET_Y = GUTTER_Y - 0.04
const RUN_Y = 2.02

// Percurso principal: calha frontal → condutor vertical → filtro → reservatório.
export const mainRoute = roundedPath(
  [
    v(DOWN_X, OUTLET_Y, GUTTER_Z),
    v(DOWN_X, RUN_Y, GUTTER_Z),
    v(FILTER.x - FILTER.len / 2 - 0.02, RUN_Y - 0.01, GUTTER_Z),
    v(FILTER.x + FILTER.len / 2 + 0.02, RUN_Y - 0.03, GUTTER_Z),
    v(TANK.x, RUN_Y - 0.06, GUTTER_Z),
    v(TANK.x, TANK_TOP - 0.06, GUTTER_Z),
  ],
  0.14,
)

// Trecho da calha dos fundos, que desce e corre junto à parede lateral até o tê.
export const backRoute = roundedPath(
  [
    v(DOWN_X, OUTLET_Y, -GUTTER_Z),
    v(DOWN_X, RUN_Y + 0.08, -GUTTER_Z),
    v(DOWN_X, RUN_Y + 0.02, GUTTER_Z - 0.1),
  ],
  0.14,
)

// Água correndo dentro das calhas, em direção ao condutor.
export const frontGutterFlow = new THREE.LineCurve3(v(-ROOF_X, GUTTER_Y - 0.03, GUTTER_Z), v(DOWN_X, GUTTER_Y - 0.03, GUTTER_Z))
export const backGutterFlow = new THREE.LineCurve3(v(-ROOF_X, GUTTER_Y - 0.03, -GUTTER_Z), v(DOWN_X, GUTTER_Y - 0.03, -GUTTER_Z))

// Reaproveitamento (linhas de distribuição mostradas na etapa 05).
export const irrigationRoute = roundedPath(
  [
    v(TANK.x - TANK.r * 0.72, 0.3, TANK.z + TANK.r * 0.62),
    v(TANK.x - TANK.r * 0.95, 0.05, TANK.z + TANK.r * 0.95),
    v(GARDEN.x + GARDEN.w / 2 - 0.1, 0.05, GARDEN.z - GARDEN.d / 2 - 0.12),
    v(GARDEN.x + GARDEN.w / 2 - 0.25, GARDEN.h + 0.08, GARDEN.z - 0.05),
  ],
  0.2,
)

export const toiletRoute = roundedPath(
  [
    v(TANK.x - TANK.r * 0.9, 0.25, TANK.z - TANK.r * 0.35),
    v(TANK.x - TANK.r - 0.3, 0.03, TANK.z - TANK.r * 0.4),
    v(HOUSE_W / 2 + 0.6, 0.03, 0.4),
    v(HOUSE_W / 2 + 0.02, 0.03, 0.4),
    v(HOUSE_W / 2 + 0.02, 1.0, 0.4),
  ],
  0.22,
)

export const FAUCET = { x: TANK.x, y: 0.5, z: TANK.z + TANK.r + 0.16 }
export const faucetStream = new THREE.LineCurve3(v(FAUCET.x, FAUCET.y - 0.1, FAUCET.z + 0.02), v(FAUCET.x, 0.18, FAUCET.z + 0.02))

/** Fração do percurso principal em que fica o filtro (para o preenchimento parar nele). */
export const FILTER_T = (() => {
  const pts = mainRoute.getSpacedPoints(400)
  let best = 0
  let bestD = Infinity
  pts.forEach((p, i) => {
    const d = Math.abs(p.x - FILTER.x) + Math.abs(p.y - FILTER.y)
    if (d < bestD) {
      bestD = d
      best = i / 400
    }
  })
  return best
})()

/** Pontos de interesse usados por rótulos e câmera. */
export const anchors = {
  filter: v(FILTER.x, FILTER.y + 0.3, FILTER.z),
  tank: v(TANK.x, TANK_TOP + 0.35, TANK.z),
  garden: v(GARDEN.x, GARDEN.h + 0.55, GARDEN.z),
  cleaning: v(BUCKET.x + 0.55, 0.55, BUCKET.z + 0.45),
  toilets: v(HOUSE_W / 2 + 0.05, 1.95, -0.25),
}
