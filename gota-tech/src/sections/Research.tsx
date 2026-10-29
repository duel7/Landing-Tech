import { useEffect, useRef } from 'react'
import { methodology } from '../content/site'
import { useReveal } from '../lib/reveal'
import { device } from '../lib/device'
import { ScrollTrigger } from '../lib/scroll'
import './research.css'

export function Research() {
  const ref = useRef<HTMLElement>(null)
  const line = useRef<HTMLDivElement>(null)
  useReveal(ref)

  // A linha acompanha a leitura (não indica andamento do projeto).
  useEffect(() => {
    const el = line.current
    if (!el) return
    const steps = Array.from(el.querySelectorAll<HTMLElement>('.tl__step'))
    const apply = (p: number) => {
      el.style.setProperty('--p', p.toFixed(4))
      steps.forEach((s, i) => s.classList.toggle('is-reached', p >= i / (steps.length - 1) - 0.001))
    }
    if (device.reducedMotion) {
      apply(1)
      return
    }
    const st = ScrollTrigger.create({
      trigger: el,
      start: 'top 75%',
      end: 'bottom 45%',
      scrub: true,
      onUpdate: (self) => apply(self.progress),
    })
    return () => st.kill()
  }, [])

  return (
    <section ref={ref} id="pesquisa" className="section rs" data-theme="light" data-nav-region="pesquisa" aria-labelledby="rs-title">
      <div className="container rs__head">
        <p className="eyebrow" data-reveal>
          <span className="eyebrow__index">05</span>
          <span className="eyebrow__rule" />
          Metodologia
        </p>
        <h2 id="rs-title" className="h2 rs__title" data-split>
          <span className="split-line">
            <span>Pesquisa e</span>
          </span>
          <span className="split-line">
            <span>
              <em className="serif">desenvolvimento</em>
            </span>
          </span>
        </h2>
      </div>

      <div className="container">
        <div ref={line} className="tl" data-reveal>
          <div className="tl__track" aria-hidden="true">
            <span className="tl__fill" />
          </div>
          <ol className="tl__steps">
            {methodology.map((text, i) => {
              const conditional = i === methodology.length - 1
              return (
                <li key={i} className={`tl__step ${conditional ? 'tl__step--cond' : ''}`}>
                  <span className="tl__node" aria-hidden="true" />
                  <span className="tl__n mono">{String(i + 1).padStart(2, '0')}</span>
                  <p className="tl__text">{text}</p>
                </li>
              )
            })}
          </ol>
        </div>
      </div>
    </section>
  )
}
