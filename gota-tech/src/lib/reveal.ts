import { useEffect, type RefObject } from 'react'
import { device } from './device'
import { gsap, ScrollTrigger } from './scroll'

/**
 * Entradas das seções:
 *  - `.split-line > span` sobem de dentro de uma máscara (títulos);
 *  - `[data-reveal]` surgem com leve deslocamento, em ordem;
 *  - `[data-inview]` recebem a classe `is-in` ao entrar na tela (animações em CSS).
 * Com "reduzir movimento", tudo já aparece no lugar.
 */
export function useReveal(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = ref.current
    if (!root) return
    const inview = Array.from(root.querySelectorAll<HTMLElement>('[data-inview]'))
    if (device.reducedMotion) {
      inview.forEach((el) => el.classList.add('is-in'))
      return
    }
    const triggers = inview.map((el) =>
      ScrollTrigger.create({ trigger: el, start: 'top 78%', once: true, onEnter: () => el.classList.add('is-in') }),
    )
    const ctx = gsap.context(() => {
      root.querySelectorAll<HTMLElement>('[data-split]').forEach((title) => {
        gsap.from(title.querySelectorAll('.split-line > span'), {
          yPercent: 112,
          rotate: 2.5,
          duration: 1.3,
          ease: 'expo.out',
          stagger: 0.09,
          scrollTrigger: { trigger: title, start: 'top 84%' },
        })
      })
      const items = gsap.utils.toArray<HTMLElement>('[data-reveal]', root)
      items.forEach((el) => {
        gsap.from(el, {
          opacity: 0,
          y: 34,
          duration: 1.1,
          ease: 'power3.out',
          delay: Number(el.dataset.reveal || 0) * 0.1,
          scrollTrigger: { trigger: el, start: 'top 88%' },
        })
      })
    }, root)
    return () => {
      ctx.revert()
      triggers.forEach((t) => t.kill())
    }
  }, [ref])
}
