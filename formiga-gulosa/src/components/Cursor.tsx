import { motion, useMotionValue, useSpring } from 'motion/react'
import { useEffect, useState } from 'react'
import './cursor.css'

/**
 * Anel discreto que acompanha o mouse. Cresce sobre botões e, sobre as fotos,
 * mostra "ver". O cursor do sistema continua visível.
 */
export function Cursor() {
  const x = useMotionValue(-100)
  const y = useMotionValue(-100)
  const sx = useSpring(x, { stiffness: 520, damping: 40, mass: 0.6 })
  const sy = useSpring(y, { stiffness: 520, damping: 40, mass: 0.6 })
  const [modo, setModo] = useState<'base' | 'link' | 'rotulo'>('base')
  const [rotulo, setRotulo] = useState('')
  const [visivel, setVisivel] = useState(false)
  const [escuro, setEscuro] = useState(false)

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      x.set(e.clientX)
      y.set(e.clientY)
      setVisivel(true)
      const alvo = e.target as Element | null
      const comRotulo = alvo?.closest<HTMLElement>('[data-cursor]')
      if (comRotulo?.dataset.cursor) {
        setModo('rotulo')
        setRotulo(comRotulo.dataset.cursor)
      } else if (alvo?.closest('a, button, label, input, textarea, select, [role="button"]')) {
        setModo('link')
      } else {
        setModo('base')
      }
      setEscuro(Boolean(alvo?.closest('.dark')))
    }
    const onLeave = () => setVisivel(false)
    window.addEventListener('pointermove', onMove, { passive: true })
    document.documentElement.addEventListener('pointerleave', onLeave)
    return () => {
      window.removeEventListener('pointermove', onMove)
      document.documentElement.removeEventListener('pointerleave', onLeave)
    }
  }, [x, y])

  return (
    <motion.div
      className={`cursor cursor--${modo} ${escuro ? 'cursor--on-dark' : ''} ${visivel ? 'is-visible' : ''}`}
      style={{ x: sx, y: sy }}
      aria-hidden="true"
    >
      <span className="cursor__ring">{modo === 'rotulo' && <span className="cursor__label">{rotulo}</span>}</span>
    </motion.div>
  )
}
