import Lenis from 'lenis'

/**
 * Rolagem suave (Lenis) só em telas com mouse e sem "reduzir movimento".
 * No toque, a rolagem nativa do aparelho é mais natural e mais rápida.
 */
let lenis: Lenis | null = null
let travas = 0

export function iniciarRolagemSuave() {
  const fino = window.matchMedia('(hover: hover) and (pointer: fine)').matches
  const reduzir = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (!fino || reduzir || lenis) return () => {}

  lenis = new Lenis({
    duration: 1.15,
    easing: (t) => 1 - Math.pow(1 - t, 4),
    wheelMultiplier: 0.95,
    anchors: false,
    autoRaf: true,
  })

  return () => {
    lenis?.destroy()
    lenis = null
  }
}

const alturaNav = () => parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 80

/** Leva até uma seção e passa o foco para ela (leitores de tela e teclado). */
export function irPara(id: string) {
  const alvo = id === 'topo' ? document.body : document.getElementById(id)
  if (!alvo) return
  const offset = id === 'inicio' || id === 'topo' ? 0 : -(alturaNav() - 2)

  const focar = () => {
    if (alvo instanceof HTMLElement && alvo !== document.body) {
      if (!alvo.hasAttribute('tabindex')) alvo.setAttribute('tabindex', '-1')
      alvo.focus({ preventScroll: true })
    }
  }

  if (lenis) {
    lenis.scrollTo(id === 'inicio' || id === 'topo' ? 0 : alvo, { offset, onComplete: focar })
  } else {
    const reduzir = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const top = id === 'inicio' || id === 'topo' ? 0 : alvo.getBoundingClientRect().top + window.scrollY + offset
    window.scrollTo({ top, behavior: reduzir ? 'auto' : 'smooth' })
    focar()
  }
  if (id !== 'topo' && history.replaceState) history.replaceState(null, '', `#${id}`)
}

/** Trava a rolagem da página (menu e galeria abertos). */
export function travarRolagem() {
  travas += 1
  lenis?.stop()
  document.body.classList.add('is-locked')
}

export function liberarRolagem() {
  travas = Math.max(0, travas - 1)
  if (travas > 0) return
  lenis?.start()
  document.body.classList.remove('is-locked')
}
