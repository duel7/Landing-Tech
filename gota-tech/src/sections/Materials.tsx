import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react'
import { components, type Component } from '../content/site'
import { useReveal } from '../lib/reveal'
import { device } from '../lib/device'
import { gsap } from '../lib/scroll'
import './materials.css'

type Key = Component['key']

// Deslocamento de cada peça na vista explodida (px no desenho).
const EXPLODE: Record<Key, [number, number]> = {
  calhas: [-70, -110],
  tubos: [-34, 46],
  filtro: [40, -140],
  reservatorio: [110, 96],
}

function Part({
  k,
  selected,
  onSelect,
  label,
  children,
}: {
  k: Key
  selected: Key
  onSelect: (k: Key) => void
  label: string
  children: React.ReactNode
}) {
  const [ox, oy] = EXPLODE[k]
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onSelect(k)
    }
  }
  return (
    <g
      className={`bp-part bp-part--${k} ${selected === k ? 'is-selected' : ''}`}
      style={{ '--ox': ox, '--oy': oy } as CSSProperties}
      tabIndex={0}
      role="button"
      aria-label={label}
      aria-pressed={selected === k}
      onMouseEnter={() => onSelect(k)}
      onFocus={() => onSelect(k)}
      onClick={() => onSelect(k)}
      onKeyDown={onKey}
    >
      {children}
    </g>
  )
}

function Tag({ x, y, code, title, anchor = 'start' }: { x: number; y: number; code: string; title: string; anchor?: 'start' | 'end' }) {
  return (
    <g className="bp-tag" transform={`translate(${x} ${y})`}>
      <g className="bp-tag__inner">
        <circle r="15" />
        <text className="bp-tag__code" y="5" textAnchor="middle">
          {code}
        </text>
        <text className="bp-tag__title" x={anchor === 'start' ? 26 : -26} y="5" textAnchor={anchor}>
          {title}
        </text>
      </g>
    </g>
  )
}

export function Materials() {
  const ref = useRef<HTMLElement>(null)
  const drawing = useRef<HTMLDivElement>(null)
  const [selected, setSelected] = useState<Key>('calhas')
  useReveal(ref)

  // Montagem conduzida pela rolagem: de peças separadas ao sistema conectado.
  useEffect(() => {
    const el = drawing.current
    if (!el) return
    if (device.reducedMotion) {
      el.style.setProperty('--asm', '1')
      return
    }
    const state = { asm: 0 }
    const tween = gsap.to(state, {
      asm: 1,
      ease: 'none',
      onUpdate: () => el.style.setProperty('--asm', state.asm.toFixed(4)),
      scrollTrigger: { trigger: el, start: 'top 85%', end: 'center 52%', scrub: 0.6 },
    })
    return () => {
      tween.scrollTrigger?.kill()
      tween.kill()
    }
  }, [])

  const current = components.find((c) => c.key === selected)!

  return (
    <section ref={ref} id="materiais" className="section bp" aria-labelledby="bp-title">
      <div className="container bp__head">
        <p className="eyebrow" data-reveal>
          <span className="eyebrow__index">04</span>
          <span className="eyebrow__rule" />
          Materiais e construção
        </p>
        <h2 id="bp-title" className="h2 bp__title" data-split>
          <span className="split-line">
            <span>Quatro peças,</span>
          </span>
          <span className="split-line">
            <span>
              <em className="serif">um percurso</em>
              <span className="drop-dot" aria-hidden="true" />
            </span>
          </span>
        </h2>
        <p className="lead bp__lead" data-reveal="1">
          Os componentes necessários para conduzir a água do telhado até o reservatório. Toque ou passe o cursor em cada peça.
        </p>
      </div>

      <div className="container bp__body">
        <div ref={drawing} className="bp__drawing" data-reveal style={{ '--asm': 0 } as CSSProperties}>
          <svg viewBox="0 0 1200 760" className="bp__svg" role="group" aria-label="Desenho técnico do sistema em vista explodida">
            <defs>
              <pattern id="bp-hatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                <line x1="0" y1="0" x2="0" y2="8" className="bp-hatch-line" />
              </pattern>
              <pattern id="bp-mesh" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M0 0H10M0 0V10" className="bp-mesh-line" />
              </pattern>
            </defs>

            {/* eixo de montagem e fluxo (aparece com as peças conectadas) */}
            <path className="bp-flow" d="M120 132 H530 V330 H1000 V430" />

            {/* A · Calhas */}
            <Part k="calhas" selected={selected} onSelect={setSelected} label="A, Calhas">
              <path className="bp-body" d="M80 104 H580 V118 Q580 158 548 158 H112 Q80 158 80 118 Z" />
              <path className="bp-line" d="M80 112 H580" />
              <path className="bp-thin" d="M96 120 Q96 146 116 146 H544 Q564 146 564 120" />
              <ellipse className="bp-body" cx="580" cy="131" rx="9" ry="27" />
              <rect className="bp-body" x="508" y="158" width="44" height="22" rx="3" />
              {/* detalhe da seção */}
              <g className="bp-detail" transform="translate(250 255)">
                <circle className="bp-dash" r="62" />
                <path className="bp-line bp-line--thick" d="M-40 -16 V2 A40 40 0 0 0 40 2 V-16" />
                <path className="bp-thin" d="M-48 -16 H-36 M36 -16 H48" />
                <text className="bp-note" y="88" textAnchor="middle">
                  seção · meia-cana
                </text>
              </g>
              <path className="bp-leader" d="M250 193 L250 160" />
              <Tag x={96} y={66} code="A" title="Calhas" />
            </Part>

            {/* B · Tubos e conexões */}
            <Part k="tubos" selected={selected} onSelect={setSelected} label="B, Tubos e conexões">
              <path className="bp-body" d="M519 180 H541 V300 Q541 319 560 319 H690 V341 H560 Q519 341 519 300 Z" />
              <path className="bp-body" d="M850 319 H990 Q1011 319 1011 340 V420 H989 V341 H850 Z" />
              <rect className="bp-body bp-fit" x="513" y="226" width="34" height="18" rx="2" />
              <rect className="bp-body bp-fit" x="600" y="313" width="18" height="34" rx="2" />
              <rect className="bp-body bp-fit" x="910" y="313" width="18" height="34" rx="2" />
              <rect className="bp-body bp-fit" x="983" y="372" width="34" height="18" rx="2" />
              <path className="bp-thin" d="M530 184 V300 Q530 330 560 330 H690 M850 330 H990 Q1000 330 1000 340 V418" />
              <Tag x={600} y={392} code="B" title="Tubos e conexões" />
            </Part>

            {/* C · Filtro */}
            <Part k="filtro" selected={selected} onSelect={setSelected} label="C, Filtro para folhas e partículas">
              <rect className="bp-body" x="690" y="296" width="160" height="68" rx="10" />
              <rect className="bp-body bp-cap" x="680" y="290" width="18" height="80" rx="4" />
              <rect className="bp-body bp-cap" x="842" y="290" width="18" height="80" rx="4" />
              <rect className="bp-body bp-cap" x="752" y="276" width="36" height="20" rx="3" />
              <rect className="bp-cut" x="712" y="308" width="116" height="44" rx="4" fill="url(#bp-mesh)" />
              <g className="bp-leaf">
                <path d="M724 318c8-6 18-4 22 4-8 6-18 4-22-4Z" />
                <path d="M738 340c6-8 16-8 20-1-6 7-16 8-20 1Z" />
                <path d="M762 325c7-5 15-3 18 3-7 5-15 4-18-3Z" />
              </g>
              <Tag x={770} y={226} code="C" title="Filtro" />
            </Part>

            {/* D · Reservatório */}
            <Part k="reservatorio" selected={selected} onSelect={setSelected} label="D, Reservatório adequado">
              <path className="bp-body bp-tank" d="M880 440 Q880 420 900 420 H1100 Q1120 420 1120 440 V672 Q1120 690 1100 690 H900 Q880 690 880 672 Z" />
              <path className="bp-thin" d="M880 490 H1120 M880 545 H1120 M880 600 H1120 M880 650 H1120" />
              <rect className="bp-body" x="896" y="406" width="208" height="16" rx="6" />
              <path className="bp-body" d="M1120 664 H1146 V678 H1138 V690 H1130 V678 H1120 Z" />
              {/* cotas sem valores: a pesquisa não define dimensões */}
              <g className="bp-dim">
                <path d="M1170 420 V690 M1162 420 H1178 M1162 690 H1178" />
                <text x="1188" y="560" transform="rotate(90 1188 560)" textAnchor="middle">
                  altura · a definir
                </text>
                <path d="M880 722 H1120 M880 714 V730 M1120 714 V730" />
                <text x="1000" y="748" textAnchor="middle">
                  diâmetro · a definir
                </text>
              </g>
              <Tag x={860} y={520} code="D" title="Reservatório" anchor="end" />
            </Part>

            {/* carimbo da prancha */}
            <g className="bp-stamp" transform="translate(60 640)">
              <rect width="330" height="84" />
              <path d="M0 30 H330 M200 30 V84" />
              <text x="14" y="21">
                GOTA TECH · CAPTAÇÃO PLUVIAL
              </text>
              <text x="14" y="52">
                Montagem
              </text>
              <text x="14" y="72">
                esquemática
              </text>
              <text x="214" y="52">
                Escala
              </text>
              <text x="214" y="72">
                sem escala
              </text>
            </g>
          </svg>
        </div>

        <aside className="bp__panel" aria-live="polite">
          <div className="bp__list" role="group" aria-label="Componentes">
            {components.map((c) => (
              <button
                key={c.key}
                type="button"
                aria-pressed={selected === c.key}
                className={`bp__chip ${selected === c.key ? 'is-selected' : ''}`}
                onClick={() => setSelected(c.key)}
                onMouseEnter={() => setSelected(c.key)}
              >
                <span className="bp__chip-code">{c.code}</span>
                {c.title}
              </button>
            ))}
          </div>
          <div className="bp__card" key={current.key}>
            <span className="bp__card-code" aria-hidden="true">
              {current.code}
            </span>
            <h3 className="bp__card-title">{current.title}</h3>
            <p className="bp__card-text">{current.text}</p>
            <dl className="bp__spec">
              <div>
                <dt className="mono">Função</dt>
                <dd>{current.fn}</dd>
              </div>
              <div>
                <dt className="mono">Especificações</dt>
                <dd>Definidas na elaboração da proposta</dd>
              </div>
            </dl>
          </div>
        </aside>
      </div>
    </section>
  )
}
