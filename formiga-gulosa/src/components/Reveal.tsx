import { motion, type HTMLMotionProps } from 'motion/react'
import type { ReactNode } from 'react'

export const EASE = [0.22, 1, 0.36, 1] as const

const viewport = { once: true, margin: '0px 0px -12% 0px' }

type RevealProps = HTMLMotionProps<'div'> & { delay?: number; y?: number; x?: number; scale?: number }

/** Aparece suavemente ao entrar na tela. */
export function Reveal({ children, delay = 0, y = 28, x = 0, scale = 1, ...rest }: RevealProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y, x, scale }}
      whileInView={{ opacity: 1, y: 0, x: 0, scale: 1 }}
      viewport={viewport}
      transition={{ duration: 0.95, delay, ease: EASE }}
      {...rest}
    >
      {children}
    </motion.div>
  )
}

/**
 * Título em linhas que sobem de dentro de uma máscara, uma depois da outra.
 * A detecção de "entrou na tela" fica na máscara (visível), não no texto escondido.
 */
export function MaskLines({
  lines,
  delay = 0,
  stagger = 0.1,
  animateOnMount = false,
}: {
  lines: ReactNode[]
  delay?: number
  stagger?: number
  animateOnMount?: boolean
}) {
  return (
    <>
      {lines.map((linha, i) => (
        <motion.span
          className="line-mask"
          key={i}
          initial="oculta"
          {...(animateOnMount ? { animate: 'visivel' } : { whileInView: 'visivel', viewport })}
        >
          <motion.span
            variants={{
              oculta: { y: '108%' },
              visivel: { y: '0%', transition: { duration: 1.05, delay: delay + i * stagger, ease: EASE } },
            }}
          >
            {linha}
          </motion.span>
        </motion.span>
      ))}
    </>
  )
}
