import { useEffect, useRef, useState } from 'react'
import { application, reuses, site } from '../content/site'
import { useReveal } from '../lib/reveal'
import { device } from '../lib/device'
import { ScrollTrigger } from '../lib/scroll'
import { SchoolIllustration } from './SchoolIllustration'
import './application.css'

const ICONS = [
  // irrigação: broto com gota
  <svg key="a" viewBox="0 0 32 32" aria-hidden="true">
    <path d="M16 28V15" />
    <path d="M16 18c-5 0-8-3-8-8 5 0 8 3 8 8Z" />
    <path d="M16 15c0-4 3-7 8-7 0 4-3 7-8 7Z" />
    <path d="M25 19c1.4 1.8 2.4 3.2 2.4 4.6a2.4 2.4 0 0 1-4.8 0c0-1.4 1-2.8 2.4-4.6Z" />
  </svg>,
  // limpeza: piso com ondas
  <svg key="b" viewBox="0 0 32 32" aria-hidden="true">
    <path d="M4 24h24" />
    <path d="M6 19c2-1.6 4-1.6 6 0s4 1.6 6 0 4-1.6 6 0" />
    <path d="M10 13c2-1.6 4-1.6 6 0s4 1.6 6 0" />
    <path d="M16 4c1.6 2 2.8 3.6 2.8 5a2.8 2.8 0 0 1-5.6 0c0-1.4 1.2-3 2.8-5Z" />
  </svg>,
  // descargas: caixa acoplada estilizada
  <svg key="c" viewBox="0 0 32 32" aria-hidden="true">
    <rect x="9" y="4" width="14" height="8" rx="2" />
    <path d="M7 14h18c0 6-4 9-9 9s-9-3-9-9Z" />
    <path d="M12 23l-1 5h10l-1-5" />
  </svg>,
]

export function Application() {
  const ref = useRef<HTMLElement>(null)
  const [hover, setHover] = useState<number | null>(null)
  const [auto, setAuto] = useState<number>(0)
  const [inView, setInView] = useState(false)
  useReveal(ref)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const st = ScrollTrigger.create({ trigger: el, start: 'top 70%', end: 'bottom 30%', onToggle: (s) => setInView(s.isActive) })
    return () => st.kill()
  }, [])

  // Sem interação, os três usos se revezam em destaque.
  useEffect(() => {
    if (!inView || hover !== null || device.reducedMotion) return
    const t = window.setInterval(() => setAuto((a) => (a + 1) % 3), 2800)
    return () => window.clearInterval(t)
  }, [inView, hover])

  const active = hover ?? (inView && !device.reducedMotion ? auto : null)

  return (
    <section ref={ref} id="aplicacao" className="section app" data-nav-region="aplicacao" aria-labelledby="app-title">
      <div className="app__light" aria-hidden="true" />
      <div className="container app__grid">
        <div className="app__text">
          <p className="eyebrow" data-reveal>
            <span className="eyebrow__index">03</span>
            <span className="eyebrow__rule" />
            Aplicação na escola
          </p>
          <h2 id="app-title" className="h2 app__title" data-split>
            <span className="split-line">
              <span>Escola Municipal</span>
            </span>
            <span className="split-line">
              <span>
                <em className="serif">Anne Frank</em>
              </span>
            </span>
          </h2>
          <p className="app__place mono" data-reveal>
            {site.city} · {site.state}
          </p>
          <blockquote className="app__quote" data-reveal="1">
            <p>“{application.quote}”</p>
          </blockquote>

          <ol className="app__uses" aria-label="Possibilidades de uso da água captada">
            {reuses.map((u, i) => (
              <li key={u.key} data-reveal={i + 1}>
                <button
                  type="button"
                  className={`use ${active === i ? 'is-active' : ''}`}
                  onMouseEnter={() => setHover(i)}
                  onMouseLeave={() => setHover(null)}
                  onFocus={() => setHover(i)}
                  onBlur={() => setHover(null)}
                  onClick={() => setHover(i)}
                  aria-pressed={active === i}
                >
                  <span className="use__n mono">{i + 1}</span>
                  <span className="use__icon">{ICONS[i]}</span>
                  <span className="use__text">
                    <span className="use__title">{u.title}</span>
                    {u.note ? <span className="use__note">{u.note}</span> : null}
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </div>

        <figure className="app__figure" data-reveal="1">
          <SchoolIllustration active={active} />
          <figcaption className="mono">Ilustração conceitual</figcaption>
        </figure>
      </div>
    </section>
  )
}
