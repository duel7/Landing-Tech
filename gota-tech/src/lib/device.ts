// Capacidades do dispositivo, avaliadas uma vez na carga.
//
// Parâmetros de URL úteis para testes:
//   ?webgl=0        força a alternativa sem 3D
//   ?quality=low    força o perfil leve (sem reflexos, bloom ou sombras)
//   ?quality=high   força o perfil completo
//   ?motion=reduce  simula "reduzir movimento"
//   ?capture        câmera sem amortecimento e qualidade fixa (capturas automatizadas)
//   ?monitor=0      qualidade fixa, sem o ajuste automático (gravação quadro a quadro)

export type Tier = 'high' | 'low'

const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams()

function detectWebGL(): boolean {
  if (params.get('webgl') === '0') return false
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl')
    if (!gl) return false
    // Libera o contexto de teste para não ocupar um dos poucos disponíveis.
    ;(gl as WebGLRenderingContext).getExtension('WEBGL_lose_context')?.loseContext()
    return true
  } catch {
    return false
  }
}

function detectReducedMotion(): boolean {
  if (params.get('motion') === 'reduce') return true
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function detectTier(): Tier {
  const forced = params.get('quality')
  if (forced === 'low' || forced === 'high') return forced
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } }
  const coarse = window.matchMedia('(pointer: coarse)').matches
  const small = Math.min(window.innerWidth, window.innerHeight) < 700
  const cores = nav.hardwareConcurrency ?? 4
  const memory = nav.deviceMemory ?? 8
  if (nav.connection?.saveData) return 'low'
  if (coarse && small) return 'low'
  if (cores <= 4 || memory <= 4) return 'low'
  return 'high'
}

export const device = {
  webgl: typeof window !== 'undefined' ? detectWebGL() : false,
  reducedMotion: typeof window !== 'undefined' ? detectReducedMotion() : false,
  tier: (typeof window !== 'undefined' ? detectTier() : 'low') as Tier,
  touch: typeof window !== 'undefined' ? window.matchMedia('(pointer: coarse)').matches : false,
  /** ?capture — modo para capturas de tela automatizadas */
  capture: params.has('capture'),
  /** ajuste automático de qualidade conforme a taxa de quadros */
  monitor: !params.has('capture') && params.get('monitor') !== '0',
}
