import { useMemo, useRef } from 'react'
import { importance } from '../content/site'
import { useReveal } from '../lib/reveal'
import './importance.css'

/** Gota com água em movimento: economia de água potável. */
function DropArt() {
  return (
    <svg viewBox="0 0 400 500" className="art art--drop" aria-hidden="true">
      <defs>
        <clipPath id="imp-drop">
          <path d="M200 46C268 140 336 222 336 312a136 136 0 0 1-272 0c0-90 68-172 136-266Z" />
        </clipPath>
        <linearGradient id="imp-liquid" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#42E8E0" />
          <stop offset="1" stopColor="#087CF0" />
        </linearGradient>
        <radialGradient id="imp-glow" cx="0.5" cy="0.62" r="0.5">
          <stop offset="0" stopColor="#087CF0" stopOpacity="0.45" />
          <stop offset="1" stopColor="#087CF0" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="400" height="500" fill="url(#imp-glow)" />
      <g clipPath="url(#imp-drop)">
        <g className="art-drop__level">
          <path className="art-drop__wave art-drop__wave--back" d="M-400 250 q50 -16 100 0 t100 0 t100 0 t100 0 t100 0 t100 0 t100 0 t100 0 t100 0 V520 H-400 Z" />
          <path className="art-drop__wave" d="M-400 258 q50 -12 100 0 t100 0 t100 0 t100 0 t100 0 t100 0 t100 0 t100 0 t100 0 V520 H-400 Z" />
        </g>
        {[0, 1, 2, 3, 4].map((i) => (
          <circle key={i} className="art-drop__bubble" cx={140 + i * 30} cy={430} r={3 + (i % 3)} style={{ animationDelay: `${i * 0.7}s` }} />
        ))}
      </g>
      <path className="art-drop__outline" d="M200 46C268 140 336 222 336 312a136 136 0 0 1-272 0c0-90 68-172 136-266Z" />
      <path className="art-drop__shine" d="M118 300c0-40 18-82 46-124" />
    </svg>
  )
}

/** Curvas de nível e um rio: preservação dos recursos naturais. */
function ContourArt() {
  const rings = useMemo(() => {
    const out: string[] = []
    for (let k = 0; k < 10; k++) {
      const base = 22 + k * 25
      const pts: string[] = []
      for (let i = 0; i <= 120; i++) {
        const a = (i / 120) * Math.PI * 2
        const r = base * (1 + 0.13 * Math.sin(3 * a + k * 0.45) + 0.06 * Math.sin(5 * a + 1.3 + k * 0.2))
        pts.push(`${(330 + Math.cos(a) * r * 1.35).toFixed(1)},${(200 + Math.sin(a) * r * 0.78).toFixed(1)}`)
      }
      out.push(`M${pts.join('L')}Z`)
    }
    return out
  }, [])
  return (
    <svg viewBox="0 0 640 380" className="art art--contour" aria-hidden="true">
      {rings.map((d, i) => (
        <path key={i} d={d} pathLength={1} className="art-contour__ring" style={{ '--i': i } as React.CSSProperties} />
      ))}
      <path className="art-contour__river" pathLength={1} d="M-10 330C90 300 120 230 210 236S330 300 410 250 520 120 650 96" />
      <path className="art-contour__flow" d="M-10 330C90 300 120 230 210 236S330 300 410 250 520 120 650 96" />
      <g className="art-contour__leaf" transform="translate(470 286) rotate(-24)">
        <path d="M0 -26C16 -14 16 12 0 26C-16 12 -16 -14 0 -26Z" />
        <path d="M0 -22V24" />
      </g>
    </svg>
  )
}

/** Uma gota e ondas que alcançam a comunidade: consciência ambiental. */
function RippleArt() {
  const dots = useMemo(() => {
    const list: { x: number; y: number; d: number }[] = []
    let n = 0
    for (let ring = 0; ring < 4; ring++) {
      const count = 6 + ring * 4
      for (let i = 0; i < count; i++) {
        const a = (i / count) * Math.PI * 2 + ring * 0.5 + Math.sin(n * 7.1) * 0.12
        const r = 62 + ring * 40 + Math.sin(n * 3.7) * 8
        list.push({ x: 200 + Math.cos(a) * r, y: 200 + Math.sin(a) * r, d: r })
        n++
      }
    }
    return list
  }, [])
  return (
    <svg viewBox="0 0 400 400" className="art art--ripple" aria-hidden="true">
      {[0, 1, 2, 3].map((i) => (
        <circle key={i} className="art-ripple__ring" cx="200" cy="200" r="190" style={{ animationDelay: `${i * 1.1}s` }} />
      ))}
      {dots.map((p, i) => (
        <circle key={i} className="art-ripple__dot" cx={p.x} cy={p.y} r="4.2" style={{ animationDelay: `${(p.d / 190) * 4.4 * 0.62}s` }} />
      ))}
      <path className="art-ripple__drop" d="M200 168c9 12 17 22 17 33a17 17 0 0 1-34 0c0-11 8-21 17-33Z" />
    </svg>
  )
}

export function Importance() {
  const ref = useRef<HTMLElement>(null)
  useReveal(ref)
  const [a, b, c] = importance.pillars
  return (
    <section ref={ref} id="sustentabilidade" className="section imp" data-theme="light" data-nav-region="sustentabilidade" aria-labelledby="imp-title">
      <div className="container imp__head">
        <p className="eyebrow imp__eyebrow" data-reveal>
          <span className="eyebrow__index">02</span>
          <span className="eyebrow__rule" />
          Sustentabilidade
        </p>
        <h2 id="imp-title" className="h2 imp__title" data-split>
          <span className="split-line">
            <span>Cada gota</span>
          </span>
          <span className="split-line">
            <span>
              <em className="serif">conta</em>
              <span className="drop-dot" aria-hidden="true" />
            </span>
          </span>
        </h2>
        <p className="lead imp__text" data-reveal="1">
          {importance.text}
        </p>
      </div>

      <div className="container imp__pillars">
        <article className="pillar pillar--a" data-reveal data-inview>
          <figure className="pillar__art">
            <DropArt />
          </figure>
          <div className="pillar__cap">
            <span className="pillar__n serif">i.</span>
            <h3 className="pillar__title">{a.title}</h3>
          </div>
        </article>

        <article className="pillar pillar--b" data-reveal="1" data-inview>
          <div className="pillar__cap">
            <span className="pillar__n serif">ii.</span>
            <h3 className="pillar__title">{b.title}</h3>
          </div>
          <figure className="pillar__art">
            <ContourArt />
          </figure>
        </article>

        <article className="pillar pillar--c" data-reveal="2" data-inview>
          <figure className="pillar__art">
            <RippleArt />
          </figure>
          <div className="pillar__cap">
            <span className="pillar__n serif">iii.</span>
            <h3 className="pillar__title">{c.title}</h3>
          </div>
        </article>
      </div>
    </section>
  )
}
