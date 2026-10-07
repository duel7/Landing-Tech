import { motion, useMotionValueEvent, useScroll, useSpring, useTransform } from 'motion/react'
import { useEffect, useState } from 'react'
import { secoes } from '../config/site'
import { useActiveSection, useIsScrolling } from '../lib/hooks'
import { irPara } from '../lib/scroll'
import { Ant } from './Ant'
import './scroll-progress.css'

const ids = secoes.map((s) => s.id)

/**
 * Trilha de confeitos na lateral: a formiga desce (ou sobe) junto com a página
 * e as paradas levam direto a cada seção. No celular, vira uma linha fina no topo.
 */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const progresso = useSpring(scrollYProgress, { stiffness: 140, damping: 28, mass: 0.4 })
  const topo = useTransform(progresso, (v) => `${v * 100}%`)
  const opacidade = useTransform(scrollYProgress, [0, 0.035, 0.07], [0, 0, 1])
  const esquerdaMobile = useTransform(progresso, (v) => `calc(${v} * (100% - 26px) + 4px)`)
  const rolando = useIsScrolling()
  const ativa = useActiveSection(ids)
  const [subindo, setSubindo] = useState(false)
  const [paradas, setParadas] = useState<number[]>([])

  useMotionValueEvent(scrollYProgress, 'change', (atual) => {
    const anterior = scrollYProgress.getPrevious() ?? atual
    if (Math.abs(atual - anterior) > 0.0005) setSubindo(atual < anterior)
  })

  useEffect(() => {
    const medir = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      setParadas(
        ids.map((id) => {
          const el = document.getElementById(id)
          return el && max > 0 ? Math.min(1, Math.max(0, (el.offsetTop - 70) / max)) : 0
        }),
      )
    }
    medir()
    const ro = new ResizeObserver(medir)
    ro.observe(document.body)
    return () => ro.disconnect()
  }, [])

  return (
    <>
      <motion.nav className="trail" aria-label="Progresso da página" style={{ opacity: opacidade }}>
        <div className="trail__track">
          <motion.span className="trail__fill" style={{ scaleY: progresso }} />
          {secoes.map((s, i) => (
            <button
              key={s.id}
              type="button"
              className={`trail__stop ${ativa === s.id ? 'is-active' : ''}`}
              style={{ top: `${(paradas[i] ?? 0) * 100}%` }}
              onClick={() => irPara(s.id)}
              aria-label={`Ir para ${s.rotulo}`}
              aria-current={ativa === s.id ? 'location' : undefined}
            >
              <span className="trail__label">{s.rotulo}</span>
            </button>
          ))}
          <motion.span className={`trail__ant ${subindo ? 'is-up' : ''}`} style={{ top: topo }}>
            <Ant size={30} walking={rolando} carrying="brigadeiro" />
          </motion.span>
        </div>
      </motion.nav>

      <div className="trail-mobile" aria-hidden="true">
        <motion.span className="trail-mobile__fill" style={{ scaleX: progresso }} />
        <motion.span
          className={`trail-mobile__ant ${subindo ? 'is-back' : ''}`}
          style={{ left: esquerdaMobile, opacity: opacidade }}
        >
          <Ant size={20} walking={rolando} carrying="brigadeiro" />
        </motion.span>
      </div>
    </>
  )
}
