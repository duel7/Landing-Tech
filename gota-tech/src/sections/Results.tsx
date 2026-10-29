import { useEffect, useRef } from 'react'
import { results } from '../content/site'
import { useReveal } from '../lib/reveal'
import { device } from '../lib/device'
import { createRipples } from '../lib/ripples'
import { ScrollTrigger } from '../lib/scroll'
import './results.css'

// Pequenos glifos abstratos — nenhum representa medição.
const GLYPHS = [
  <svg key="0" viewBox="0 0 64 64" aria-hidden="true">
    <path className="g-drop" d="M32 10c6 8 11 14 11 20a11 11 0 0 1-22 0c0-6 5-12 11-20Z" />
    <circle className="g-ring" cx="32" cy="46" r="14" />
  </svg>,
  <svg key="1" viewBox="0 0 64 64" aria-hidden="true">
    <circle className="g-ring" cx="24" cy="32" r="14" />
    <circle className="g-ring g-ring--late" cx="40" cy="32" r="14" />
  </svg>,
  <svg key="2" viewBox="0 0 64 64" aria-hidden="true">
    <path className="g-stem" d="M32 54V30" />
    <path className="g-leaf" d="M32 36c-8 0-13-5-13-13 8 0 13 5 13 13Z" />
    <path className="g-leaf g-leaf--late" d="M32 30c0-7 5-12 13-12 0 7-5 12-13 12Z" />
  </svg>,
  <svg key="3" viewBox="0 0 64 64" aria-hidden="true">
    <path className="g-wave" d="M6 26c6-5 12-5 18 0s12 5 18 0 12-5 18 0" />
    <path className="g-wave g-wave--late" d="M6 40c6-5 12-5 18 0s12 5 18 0 12-5 18 0" />
  </svg>,
]

export function Results() {
  const ref = useRef<HTMLElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  useReveal(ref)

  useEffect(() => {
    const c = canvas.current
    const section = ref.current
    if (!c || !section) return
    const water = createRipples(c, {
      reduced: device.reducedMotion,
      top: [6, 27, 43],
      bottom: [8, 44, 52],
      light: [120, 236, 228],
    })
    if (!water) return
    const unbind = water.bindPointer(section)
    const st = ScrollTrigger.create({
      trigger: section,
      start: 'top bottom',
      end: 'bottom top',
      onToggle: (s) => (s.isActive ? water.start() : water.stop()),
    })
    return () => {
      st.kill()
      unbind()
      water.dispose()
    }
  }, [])

  return (
    <section ref={ref} id="resultados" className="section out" aria-labelledby="out-title">
      <canvas ref={canvas} className="out__water" aria-hidden="true" />
      <div className="out__veil" aria-hidden="true" />
      <div className="container out__grid">
        <div className="out__head">
          <p className="eyebrow" data-reveal>
            <span className="eyebrow__index">06</span>
            <span className="eyebrow__rule" />
            Resultados esperados
          </p>
          <h2 id="out-title" className="h2 out__title" data-split>
            <span className="split-line">
              <span>O futuro começa</span>
            </span>
            <span className="split-line">
              <span>
                com uma <em className="serif">gota</em>
                <span className="drop-dot" aria-hidden="true" />
              </span>
            </span>
          </h2>
        </div>

        <ol className="out__list">
          {results.items.map((item, i) => (
            <li key={i} className="out__item" data-reveal={i} data-inview>
              <span className="out__glyph">{GLYPHS[i]}</span>
              <span className="out__n mono">{String(i + 1).padStart(2, '0')}</span>
              <p className="out__text">{item}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
