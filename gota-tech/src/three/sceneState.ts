import * as THREE from 'three'
import { band, cameraParam, ramp, stage } from '../lib/stage'
import { FILTER_T } from './layout'

// Valores derivados a cada quadro a partir da rolagem (stage.s) e da entrada
// (stage.intro). Todos os componentes da cena leem daqui.
export const sc = {
  time: 0,
  /** relógio da água: congela com "reduzir movimento" */
  flowTime: 0,
  ambient: 0,
  motes: 0,
  reveal: 0,
  rain: 0,
  lamp: 0,
  windows: 0,
  roofFlow: 0,
  gutterFlow: 0,
  xray: 0,
  pipeFill: 0,
  backFill: 0,
  filter: 0,
  leaves: 0,
  tank: 0,
  level: 0,
  reuse: 0,
  reuseFill: 0,
  introCam: 0,
  camU: 0,
}

/** Plano de corte da revelação da arquitetura (sobe do chão ao telhado). */
export const revealPlane = new THREE.Plane(new THREE.Vector3(0, -1, 0), 0)
export const REVEAL_TOP = 4.4

const flicker = (i: number) => {
  // a luminária acende com duas piscadas rápidas
  if (i < 0.42) return 0
  if (i < 0.44) return 0.7
  if (i < 0.455) return 0.1
  if (i < 0.47) return 0.9
  if (i < 0.48) return 0.3
  return ramp(i, 0.48, 0.52) * 0.3 + 0.7
}

export function updateScene(dt: number, reduced: boolean) {
  const s = stage.s
  const i = stage.intro
  sc.time += dt
  if (!reduced) sc.flowTime += dt

  sc.ambient = ramp(i, 0, 0.22)
  sc.motes = ramp(i, 0.04, 0.3)
  sc.reveal = ramp(i, 0.1, 0.56)
  revealPlane.constant = -0.05 + sc.reveal * (REVEAL_TOP + 0.1)
  if (sc.reveal >= 1) revealPlane.constant = 100

  // chuva mais forte quando a câmera chega ao telhado
  sc.rain = ramp(i, 0.36, 0.6) * (0.72 + 0.28 * band(s, 0.5, 1.0, 1.8, 2.4))
  sc.lamp = flicker(i)
  sc.windows = ramp(i, 0.46, 0.62)
  sc.roofFlow = ramp(i, 0.5, 0.72) * (0.55 + 0.45 * band(s, 0.5, 1.0, 1.7, 2.3))
  sc.gutterFlow = ramp(i, 0.58, 0.8)

  sc.xray = ramp(s, 1.4, 1.9) * (1 - 0.55 * ramp(s, 4.6, 5.1))
  sc.pipeFill = s < 3 ? ramp(s, 1.45, 2.3) * FILTER_T : FILTER_T + ramp(s, 3.0, 3.75) * (1 - FILTER_T)
  sc.backFill = ramp(s, 1.5, 2.15)
  sc.filter = band(s, 2.2, 2.7, 3.5, 3.95)
  sc.leaves = ramp(s, 2.35, 3.1)
  sc.tank = ramp(s, 3.3, 3.8) * (1 - 0.45 * ramp(s, 4.9, 5.4))
  sc.level = 0.1 + 0.62 * ramp(s, 3.55, 4.6)
  sc.reuse = ramp(s, 4.5, 4.95)
  sc.reuseFill = ramp(s, 4.6, 5.25)

  sc.introCam = ramp(i, 0.1, 1)
  sc.camU = cameraParam(s)
  if (reduced) sc.camU = Math.round(sc.camU)
}
