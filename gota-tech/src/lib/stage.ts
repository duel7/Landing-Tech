// Estado compartilhado entre a rolagem (DOM) e a cena 3D.
// É um objeto mutável lido a cada quadro pela cena — nada aqui provoca
// renderização do React; o painel de etapas assina apenas a etapa ativa.

export const STEP_COUNT = 5
/** Unidades de rolagem da seção: 1 de abertura + 5 etapas + uma pausa final. */
export const STAGE_UNITS = 6.4

export const stage = {
  /** 0–1 ao longo da seção fixada (abertura + sistema). */
  progress: 0,
  /** Mesma posição em unidades: 0–1 abertura, k–k+1 etapa k. */
  s: 0,
  /** 0–1 da animação de entrada. */
  intro: 0,
  /** Ponteiro normalizado (-1 a 1). */
  pointer: { x: 0, y: 0, active: false },
  /** A seção está na tela? A cena pausa quando não está. */
  inView: true,
  /** Largura do painel de texto à esquerda, para deslocar o enquadramento (0–1 da tela). */
  frameShift: 0,
}

const clamp01 = (v: number) => Math.min(1, Math.max(0, v))
export const smooth = (t: number) => {
  const x = clamp01(t)
  return x * x * (3 - 2 * x)
}
export const easeInOut = (t: number) => {
  const x = clamp01(t)
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2
}
/** Rampa suave de 0 a 1 entre a e b. */
export const ramp = (v: number, a: number, b: number) => smooth((v - a) / (b - a))
/** Sobe entre a–b e desce entre c–d. */
export const band = (v: number, a: number, b: number, c: number, d: number) => ramp(v, a, b) * (1 - ramp(v, c, d))

/** Parâmetro contínuo da câmera (0 = abertura, 1–5 = poses das etapas), com pausas em cada etapa. */
export function cameraParam(s: number) {
  if (s <= 1) return easeInOut(s)
  const k = Math.min(Math.floor(s), STEP_COUNT)
  if (k >= STEP_COUNT) return STEP_COUNT
  const f = s - k
  const HOLD = 0.42
  return k + easeInOut((f - HOLD) / (1 - HOLD))
}

/** Etapa ativa para legendas e indicadores: 0 na abertura, 1–5 no sistema. */
export function activeStep(s: number) {
  if (s < 0.72) return 0
  return Math.min(STEP_COUNT, Math.max(1, Math.floor(s + 0.28)))
}
