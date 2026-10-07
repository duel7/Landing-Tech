import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type HTMLMotionProps,
  type MotionValue,
} from 'motion/react'
import { useRef, type ReactNode } from 'react'
import { useFinePointer, useMediaQuery } from '../lib/hooks'

/**
 * Peças de movimento reutilizáveis. Todas usam só transform/opacity (aceleradas pela GPU)
 * e ficam paradas com "reduzir movimento". Nenhuma prende a rolagem: a página rola
 * normalmente e os elementos apenas reagem a ela.
 */

type ParallaxProps = HTMLMotionProps<'div'> & {
  /** Deslocamento vertical (px) entre a entrada e a saída da tela. Positivo = mais lento que a página. */
  speed?: number
  /** Deslocamento horizontal (px) no mesmo percurso. */
  drift?: number
  /** Escala na entrada → na saída. */
  scaleRange?: [number, number]
  /** Esmaece suavemente ao sair pelo topo da tela. */
  fadeOut?: boolean
  /** Desliga no celular (listas em que velocidades diferentes poderiam encostar um item no outro). */
  somenteDesktop?: boolean
  children?: ReactNode
}

export function Parallax({
  speed = 40,
  drift = 0,
  scaleRange,
  fadeOut = false,
  somenteDesktop = false,
  style,
  children,
  ...rest
}: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduzir = useReducedMotion()
  // no celular o movimento é mais curto (telas menores, rolagem com o dedo)
  const celular = useMediaQuery('(max-width: 767px)')
  const fator = celular ? (somenteDesktop ? 0 : 0.5) : 1
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], [speed * fator, -speed * fator])
  const x = useTransform(scrollYProgress, [0, 1], [drift * fator, -drift * fator])
  const scale = useTransform(scrollYProgress, [0, 0.5], scaleRange ?? [1, 1])
  const opacity = useTransform(scrollYProgress, [0.72, 0.98], [1, fadeOut ? 0.25 : 1])
  return (
    <motion.div ref={ref} style={reduzir ? style : { ...style, y, x, scale, opacity }} {...rest}>
      {children}
    </motion.div>
  )
}

/** Progresso (0→1) de um elemento atravessando a tela, para efeitos sob medida. */
export function useProgressoNaTela(
  offset: ['start end', 'end start'] | ['start end', 'center center'] = ['start end', 'end start'],
) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset })
  return { ref, progresso: scrollYProgress }
}

/** Botão "magnético": acompanha levemente o cursor quando ele se aproxima (só com mouse). */
export function Magnetic({
  children,
  strength = 0.32,
  className = '',
}: {
  children: ReactNode
  strength?: number
  className?: string
}) {
  const fino = useFinePointer()
  const reduzir = useReducedMotion()
  const x = useSpring(useMotionValue(0), { stiffness: 220, damping: 18, mass: 0.5 })
  const y = useSpring(useMotionValue(0), { stiffness: 220, damping: 18, mass: 0.5 })
  const ativo = fino && !reduzir

  return (
    <motion.span
      className={`magnetic ${className}`}
      style={ativo ? { x, y } : undefined}
      onPointerMove={(e) => {
        if (!ativo || e.pointerType !== 'mouse') return
        const r = e.currentTarget.getBoundingClientRect()
        x.set((e.clientX - (r.left + r.width / 2)) * strength)
        y.set((e.clientY - (r.top + r.height / 2)) * strength * 1.2)
      }}
      onPointerLeave={() => {
        x.set(0)
        y.set(0)
      }}
    >
      {children}
    </motion.span>
  )
}

/**
 * Inclinação 3D que segue o cursor sobre um elemento (cartões, redomas).
 * Retorna os valores de rotação e luz (0–1) para quem quiser mover reflexos e sombras.
 */
export function useTilt(maxGraus = 6) {
  const fino = useFinePointer()
  const reduzir = useReducedMotion()
  const px = useMotionValue(0.5)
  const py = useMotionValue(0.5)
  const sx = useSpring(px, { stiffness: 160, damping: 20 })
  const sy = useSpring(py, { stiffness: 160, damping: 20 })
  const rotateY = useTransform(sx, [0, 1], [-maxGraus, maxGraus])
  const rotateX = useTransform(sy, [0, 1], [maxGraus * 0.8, -maxGraus * 0.8])
  const ativo = fino && !reduzir

  const handlers = ativo
    ? {
        onPointerMove: (e: React.PointerEvent<HTMLElement>) => {
          if (e.pointerType !== 'mouse') return
          const r = e.currentTarget.getBoundingClientRect()
          px.set((e.clientX - r.left) / r.width)
          py.set((e.clientY - r.top) / r.height)
        },
        onPointerLeave: () => {
          px.set(0.5)
          py.set(0.5)
        },
      }
    : {}

  return { ativo, rotateX, rotateY, luzX: sx, luzY: sy, handlers }
}

/** Converte um MotionValue 0–1 em porcentagem CSS (para posicionar reflexos). */
export function usePorcentagem(v: MotionValue<number>) {
  return useTransform(v, (n) => `${n * 100}%`)
}
