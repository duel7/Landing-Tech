import { motion, useMotionValueEvent, useScroll, useTransform } from 'motion/react'
import { ArrowRight } from 'lucide-react'
import { useRef, useState } from 'react'
import { Ant } from '../components/Ant'
import { MaskLines, Reveal } from '../components/Reveal'
import { useIsScrolling, useReducedMotionPref } from '../lib/hooks'
import './processo.css'

const etapas = [
  {
    titulo: 'Você apresenta sua ideia',
    texto: 'Conte a ocasião, o tema e o que imaginou. Vale foto de referência, cor preferida, personagem.',
  },
  { titulo: 'Definimos o tema', texto: 'Juntos, acertamos cores, detalhes e o estilo da decoração.' },
  { titulo: 'A criação ganha forma', texto: 'O bolo é montado e decorado à mão, camada por camada.' },
  { titulo: 'Pronto para o grande momento', texto: 'Seu bolo fica pronto para a comemoração, do jeito combinado.' },
]

export function Processo() {
  const ref = useRef<HTMLElement>(null)
  const reduzir = useReducedMotionPref()
  const rolando = useIsScrolling()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.7', 'end 0.75'] })
  const [ativas, setAtivas] = useState(reduzir ? 4 : 0)
  const antX = useTransform(scrollYProgress, (v) => `calc(${Math.min(1, v)} * (100% - 40px))`)
  const antY = useTransform(scrollYProgress, (v) => `calc(${Math.min(1, v)} * (100% - 40px))`)

  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    if (reduzir) return
    const n = [0.04, 0.3, 0.55, 0.8].filter((limite) => v >= limite).length
    setAtivas((atual) => Math.max(atual, n))
  })

  return (
    <section ref={ref} id="como-funciona" className="proc dark" aria-labelledby="proc-titulo">
      <div className="proc__curve" aria-hidden="true">
        <svg viewBox="0 0 1440 90" preserveAspectRatio="none" focusable="false">
          <path d="M0 90 V40 C260 4 520 0 760 30 C1000 60 1220 70 1440 20 V90 Z" fill="var(--cacao)" />
        </svg>
      </div>

      <div className="container proc__grid">
        <div className="proc__intro">
          <Reveal>
            <p className="eyebrow">Como funciona</p>
          </Reveal>
          <h2 id="proc-titulo" className="display title-l proc__title">
            <MaskLines
              lines={[
                'Da ideia',
                <>
                  à <em className="script gold-text proc__script">festa</em>
                </>,
              ]}
            />
          </h2>
          <Reveal delay={0.2}>
            <p className="lead">Role e veja a sua ideia virar bolo, em quatro passos.</p>
          </Reveal>
          <Reveal delay={0.3} className="proc__scroll">
            <span className="proc__scroll-line" aria-hidden="true" />
            <span>Role</span>
          </Reveal>
        </div>

        <div className="proc__steps">
          <div className="proc__path" aria-hidden="true">
            <motion.span className="proc__ant proc__ant--h" style={{ left: antX }}>
              <Ant size={40} walking={rolando && ativas < 4} carrying="brigadeiro" />
            </motion.span>
            <motion.span className="proc__ant proc__ant--v" style={{ top: antY }}>
              <Ant size={42} walking={rolando && ativas < 4} carrying="brigadeiro" />
            </motion.span>
          </div>

          <ol className="proc__list">
            {etapas.map((e, i) => {
              const ativa = i < ativas
              return (
                <li key={e.titulo} className={`proc-step ${ativa ? 'is-active' : ''}`}>
                  <div className="proc-step__art">
                    <EtapaArte etapa={i} ativa={ativa} />
                    {i < etapas.length - 1 && (
                      <span className="proc-step__arrow" aria-hidden="true">
                        <ArrowRight size={18} strokeWidth={1.2} />
                      </span>
                    )}
                  </div>
                  <span className="proc-step__mark" aria-hidden="true" />
                  <p className="proc-step__num">{String(i + 1).padStart(2, '0')}</p>
                  <h3 className="proc-step__title">{e.titulo}</h3>
                  <p className="proc-step__text">{e.texto}</p>
                </li>
              )
            })}
          </ol>
        </div>
      </div>
    </section>
  )
}

/* ---------- ilustrações das etapas: o bolo vai nascendo ---------- */

const ease = [0.65, 0, 0.35, 1] as const

function Traco({
  d,
  ativa,
  delay = 0,
  dashed = false,
  cor = 'var(--gold-bright)',
  largura = 1.4,
}: {
  d: string
  ativa: boolean
  delay?: number
  dashed?: boolean
  cor?: string
  largura?: number
}) {
  if (dashed)
    return (
      <motion.path
        d={d}
        fill="none"
        stroke={cor}
        strokeWidth={largura}
        strokeDasharray="4 5"
        strokeLinecap="round"
        initial={{ opacity: 0 }}
        animate={{ opacity: ativa ? 1 : 0.18 }}
        transition={{ duration: 0.9, delay }}
      />
    )
  return (
    <motion.path
      d={d}
      fill="none"
      stroke={cor}
      strokeWidth={largura}
      strokeLinecap="round"
      strokeLinejoin="round"
      initial={{ pathLength: 0, opacity: 0.25 }}
      animate={ativa ? { pathLength: 1, opacity: 1 } : { pathLength: 0.0001, opacity: 0.25 }}
      transition={{ duration: 1.3, delay, ease }}
    />
  )
}

function Preenche({
  d,
  ativa,
  delay = 0,
  fill,
  opacity = 1,
}: {
  d: string
  ativa: boolean
  delay?: number
  fill: string
  opacity?: number
}) {
  return (
    <motion.path
      d={d}
      fill={fill}
      initial={{ opacity: 0 }}
      animate={{ opacity: ativa ? opacity : 0 }}
      transition={{ duration: 0.9, delay }}
    />
  )
}

const BASE = 'M50 132 V96 Q50 92 54 92 H146 Q150 92 150 96 V132 Z'
const TOPO = 'M70 92 V64 Q70 60 74 60 H126 Q130 60 130 64 V92 Z'
const CALDA =
  'M69 60 H131 V69 Q128 69 128 75 Q128 80 125 80 Q122 80 122 74 Q122 70 117 70 Q113 70 113 78 Q113 84 110 84 Q107 84 107 76 Q107 70 101 70 Q96 70 96 75 Q96 80 93 80 Q90 80 90 74 Q90 70 85 70 Q81 70 81 77 Q81 83 78 83 Q75 83 75 76 Q75 70 69 70 Z'
const CALDA_BASE =
  'M49 92 H151 V100 Q148 100 148 106 Q148 110 145 110 Q142 110 142 104 Q142 100 136 100 Q132 100 132 107 Q132 112 129 112 Q126 112 126 106 Q126 100 118 100 H84 Q76 100 76 106 Q76 112 73 112 Q70 112 70 107 Q70 100 64 100 Q60 100 60 105 Q60 110 57 110 Q54 110 54 104 Q54 100 49 100 Z'

function Boleira({ ativa }: { ativa: boolean }) {
  return (
    <g>
      <Traco d="M28 134 A72 6 0 0 0 172 134 A72 6 0 0 0 28 134 Z" ativa={ativa} />
      <Traco d="M90 140 C94 148 95 152 94 158 M110 140 C106 148 105 152 106 158" ativa={ativa} delay={0.2} />
      <Traco d="M74 160 A26 4 0 0 0 126 160 A26 4 0 0 0 74 160 Z" ativa={ativa} delay={0.3} />
    </g>
  )
}

function EtapaArte({ etapa, ativa }: { etapa: number; ativa: boolean }) {
  return (
    <svg viewBox="0 0 200 170" className="proc-art" aria-hidden="true" focusable="false">
      <Boleira ativa={ativa} />

      {etapa === 0 && (
        <g>
          <Traco d={BASE} ativa={ativa} dashed delay={0.3} />
          <Traco d={TOPO} ativa={ativa} dashed delay={0.5} />
          {/* lápis desenhando */}
          <Traco
            d="M150 22 L176 48 L170 54 L144 28 Z M144 28 L138 20 L150 22 M176 48 L180 52 L174 58 L170 54"
            ativa={ativa}
            delay={0.6}
          />
          {/* balão de ideia */}
          <Traco
            d="M30 30 Q30 16 46 16 H70 Q84 16 84 30 Q84 42 70 42 H52 L42 52 L44 42 Q30 42 30 30 Z"
            ativa={ativa}
            delay={0.8}
            cor="var(--rose)"
          />
          <Preenche
            d="M57 33 C51 29 50 25 53 23.5 C55 22.5 56.6 23.6 57 24.8 C57.5 23.6 59 22.5 61 23.5 C64 25 63 29 57 33 Z"
            ativa={ativa}
            delay={1.4}
            fill="var(--rose)"
          />
        </g>
      )}

      {etapa === 1 && (
        <g>
          <Preenche d={BASE} ativa={ativa} fill="rgba(241,211,206,.14)" delay={0.6} />
          <Preenche d={TOPO} ativa={ativa} fill="rgba(241,211,206,.14)" delay={0.7} />
          <Traco d={BASE} ativa={ativa} delay={0.2} />
          <Traco d={TOPO} ativa={ativa} delay={0.45} />
          {/* amostras de cor */}
          <Preenche d="M34 52 m-9 0 a9 9 0 1 0 18 0 a9 9 0 1 0 -18 0" ativa={ativa} fill="#e6abaa" delay={0.9} />
          <Preenche d="M50 34 m-9 0 a9 9 0 1 0 18 0 a9 9 0 1 0 -18 0" ativa={ativa} fill="#e4c06c" delay={1.05} />
          <Preenche d="M70 22 m-9 0 a9 9 0 1 0 18 0 a9 9 0 1 0 -18 0" ativa={ativa} fill="#fff1ec" delay={1.2} />
          <Traco d="M152 40 Q160 30 170 34 M160 52 Q170 48 176 56" ativa={ativa} delay={1.1} cor="var(--rose)" />
        </g>
      )}

      {etapa === 2 && (
        <g>
          <Preenche d={BASE} ativa={ativa} fill="#f1d3ce" opacity={0.9} delay={0.3} />
          <Preenche d={TOPO} ativa={ativa} fill="#f6e2dd" opacity={0.95} delay={0.45} />
          <Preenche d={CALDA} ativa={ativa} fill="#e6abaa" delay={0.9} />
          <Traco d={BASE} ativa={ativa} delay={0.1} />
          <Traco d={TOPO} ativa={ativa} delay={0.25} />
          {/* saco de confeitar */}
          <Traco d="M176 10 L146 44 L138 38 L170 6 Z M146 44 L140 52 L136 46 L138 38" ativa={ativa} delay={0.7} />
          <Preenche
            d="M132 52 Q128 58 134 58 Q131 62 137 61 Q138 56 136 52 Z"
            ativa={ativa}
            fill="#fff8f5"
            delay={1.3}
          />
        </g>
      )}

      {etapa === 3 && (
        <g>
          <motion.ellipse
            cx="100"
            cy="80"
            rx="80"
            ry="60"
            fill="url(#proc-brilho)"
            initial={{ opacity: 0 }}
            animate={{ opacity: ativa ? 1 : 0 }}
            transition={{ duration: 1.2 }}
          />
          <defs>
            <radialGradient id="proc-brilho">
              <stop offset="0" stopColor="rgba(228,192,108,.28)" />
              <stop offset="1" stopColor="rgba(228,192,108,0)" />
            </radialGradient>
          </defs>
          <Preenche d={BASE} ativa={ativa} fill="#f1d3ce" delay={0.2} />
          <Preenche d={TOPO} ativa={ativa} fill="#f8e7e3" delay={0.3} />
          <Preenche d={CALDA_BASE} ativa={ativa} fill="#e6abaa" delay={0.5} />
          <Preenche d={CALDA} ativa={ativa} fill="#6e4642" delay={0.6} />
          <Traco d={BASE} ativa={ativa} delay={0.05} />
          <Traco d={TOPO} ativa={ativa} delay={0.15} />
          {/* brigadeiros no topo */}
          {[82, 100, 118].map((x, i) => (
            <g key={x}>
              <Preenche
                d={`M${x - 6} 59 H${x + 6} L${x + 4.5} 63 H${x - 4.5} Z`}
                ativa={ativa}
                fill="#d4456a"
                delay={0.9 + i * 0.12}
              />
              <Preenche
                d={`M${x} 53 m-6 0 a6 6 0 1 0 12 0 a6 6 0 1 0 -12 0`}
                ativa={ativa}
                fill="#3a1e17"
                delay={0.9 + i * 0.12}
              />
            </g>
          ))}
          {/* topo de coração */}
          <Traco d="M100 46 V24" ativa={ativa} delay={1.2} />
          <Preenche
            d="M100 26 C91 20 90 13 94 11 C96.6 9.6 98.8 11 100 13 C101.2 11 103.4 9.6 106 11 C110 13 109 20 100 26 Z"
            ativa={ativa}
            fill="var(--gold-bright)"
            delay={1.35}
          />
          {/* brilhos */}
          {[
            [38, 46, 6],
            [164, 40, 7],
            [160, 100, 4.5],
            [36, 104, 4],
          ].map(([x, y, r], i) => (
            <Preenche
              key={i}
              d={`M${x} ${y - r} Q${x} ${y} ${x + r} ${y} Q${x} ${y} ${x} ${y + r} Q${x} ${y} ${x - r} ${y} Q${x} ${y} ${x} ${y - r} Z`}
              ativa={ativa}
              fill="var(--gold-bright)"
              delay={1.4 + i * 0.1}
            />
          ))}
        </g>
      )}
    </svg>
  )
}
