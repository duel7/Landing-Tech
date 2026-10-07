import { useEffect, useState, useSyncExternalStore } from 'react'

/** Lê uma media query e acompanha as mudanças. No servidor, devolve `false`. */
export function useMediaQuery(query: string) {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(query)
      mql.addEventListener('change', onChange)
      return () => mql.removeEventListener('change', onChange)
    },
    () => window.matchMedia(query).matches,
    () => false,
  )
}

/** Mouse/trackpad com hover — onde cursor e parallax de mouse fazem sentido. */
export const useFinePointer = () => useMediaQuery('(hover: hover) and (pointer: fine)')

export const useReducedMotionPref = () => useMediaQuery('(prefers-reduced-motion: reduce)')

export const useDesktop = () => useMediaQuery('(min-width: 1024px)')

/** Seção visível no momento, para marcar o item ativo da navegação. */
export function useActiveSection(ids: readonly string[]) {
  const [ativa, setAtiva] = useState<string>(ids[0])

  useEffect(() => {
    const calcular = () => {
      const linha = window.innerHeight * 0.38
      let atual = ids[0]
      for (const id of ids) {
        const el = document.getElementById(id)
        if (el && el.getBoundingClientRect().top <= linha) atual = id
      }
      setAtiva(atual)
    }
    let frame = 0
    const onScroll = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(calcular)
    }
    calcular()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [ids])

  return ativa
}

/** true enquanto a página está rolando (some ~160 ms depois de parar). */
export function useIsScrolling(delay = 160) {
  const [rolando, setRolando] = useState(false)
  useEffect(() => {
    let timer = 0
    const onScroll = () => {
      setRolando(true)
      window.clearTimeout(timer)
      timer = window.setTimeout(() => setRolando(false), delay)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.clearTimeout(timer)
      window.removeEventListener('scroll', onScroll)
    }
  }, [delay])
  return rolando
}

/** Fecha algo com a tecla Esc. */
export function useEscape(ativo: boolean, onEscape: () => void) {
  useEffect(() => {
    if (!ativo) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onEscape()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [ativo, onEscape])
}

const FOCAVEIS =
  'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), iframe, [tabindex]:not([tabindex="-1"])'

/** Mantém o foco do teclado dentro de um diálogo aberto. */
export function useFocusTrap(ref: React.RefObject<HTMLElement | null>, ativo: boolean) {
  useEffect(() => {
    if (!ativo || !ref.current) return
    const raiz = ref.current
    const anterior = document.activeElement as HTMLElement | null
    const primeiro = raiz.querySelector<HTMLElement>('[data-autofocus]') ?? raiz.querySelector<HTMLElement>(FOCAVEIS)
    primeiro?.focus({ preventScroll: true })

    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return
      const itens = Array.from(raiz.querySelectorAll<HTMLElement>(FOCAVEIS)).filter(
        (el) => el.offsetParent !== null || el === document.activeElement,
      )
      if (!itens.length) return
      const ini = itens[0]
      const fim = itens[itens.length - 1]
      if (e.shiftKey && document.activeElement === ini) {
        e.preventDefault()
        fim.focus()
      } else if (!e.shiftKey && document.activeElement === fim) {
        e.preventDefault()
        ini.focus()
      }
    }
    raiz.addEventListener('keydown', onKey)
    return () => {
      raiz.removeEventListener('keydown', onKey)
      anterior?.focus?.({ preventScroll: true })
    }
  }, [ref, ativo])
}
