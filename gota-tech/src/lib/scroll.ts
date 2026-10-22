import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { device } from './device'

gsap.registerPlugin(ScrollTrigger)

let lenis: Lenis | null = null

// Rolagem suave sincronizada com o relógio do GSAP: o ScrollTrigger lê a mesma
// posição que o Lenis desenha, sem atraso entre a página e as animações.
export function initScroll() {
  if (lenis || device.reducedMotion) return lenis
  lenis = new Lenis({
    duration: 1.15,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    touchMultiplier: 1.4,
  })
  lenis.on('scroll', ScrollTrigger.update)
  gsap.ticker.add((time) => lenis?.raf(time * 1000))
  gsap.ticker.lagSmoothing(0)
  return lenis
}

export function getLenis() {
  return lenis
}

/** Rola até um elemento (ou posição) com uma curva suave; cai para o nativo sem Lenis. */
export function scrollToTarget(target: string | HTMLElement | number, opts: { duration?: number; offset?: number } = {}) {
  const el = typeof target === 'string' ? document.querySelector<HTMLElement>(target) : target
  if (el === null) return
  const offset = opts.offset ?? 0
  if (lenis) {
    lenis.scrollTo(el as HTMLElement | number, {
      offset,
      duration: opts.duration ?? 1.6,
      easing: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
    })
    return
  }
  const top = typeof el === 'number' ? el : el.getBoundingClientRect().top + window.scrollY + offset
  window.scrollTo({ top, behavior: device.reducedMotion ? 'auto' : 'smooth' })
}

export function lockScroll(lock: boolean) {
  if (lenis) {
    if (lock) lenis.stop()
    else lenis.start()
  }
  document.documentElement.style.overflow = lock ? 'hidden' : ''
}

export { gsap, ScrollTrigger }
