import { useMemo } from 'react'

// Projeção isométrica simples: x desce para a direita, y desce para a esquerda, z sobe.
const S = 20
const OX = 330
const OY = 78
const C = Math.cos(Math.PI / 6)
type V3 = [number, number, number]
const P = (x: number, y: number, z: number): [number, number] => [OX + (x - y) * C * S, OY + (x + y) * 0.5 * S - z * S]
const pts = (...v: V3[]) => v.map((p) => P(...p).map((n) => n.toFixed(1)).join(',')).join(' ')
const path = (...v: V3[]) => 'M' + v.map((p) => P(...p).map((n) => n.toFixed(1)).join(' ')).join(' L')

type Box = { x: number; y: number; z?: number; w: number; d: number; h: number }

function IsoBox({ b, cls }: { b: Box; cls: string }) {
  const z0 = b.z ?? 0
  const x1 = b.x + b.w
  const y1 = b.y + b.d
  const z1 = z0 + b.h
  return (
    <g className={cls}>
      <polygon className="iso-top" points={pts([b.x, b.y, z1], [x1, b.y, z1], [x1, y1, z1], [b.x, y1, z1])} />
      <polygon className="iso-left" points={pts([b.x, y1, z0], [x1, y1, z0], [x1, y1, z1], [b.x, y1, z1])} />
      <polygon className="iso-right" points={pts([x1, b.y, z0], [x1, y1, z0], [x1, y1, z1], [x1, b.y, z1])} />
    </g>
  )
}

/** Bloco com telhado de duas águas (cumeeira ao longo de x). */
function Building({ b, rise, windows }: { b: Box; rise: number; windows: number[] }) {
  const x1 = b.x + b.w
  const y1 = b.y + b.d
  const z1 = b.h
  const ym = b.y + b.d / 2
  const o = 0.45
  return (
    <g className="iso-building">
      <IsoBox b={b} cls="iso-wall" />
      {windows.map((wx, i) => (
        <g key={i}>
          <polygon className="iso-window" points={pts([wx, y1, 1.0], [wx + 1.5, y1, 1.0], [wx + 1.5, y1, 2.35], [wx, y1, 2.35])} />
          <polygon className="iso-window-shine" points={pts([wx + 0.15, y1, 2.2], [wx + 0.6, y1, 2.2], [wx + 0.15, y1, 1.6])} />
        </g>
      ))}
      {/* oitão */}
      <polygon className="iso-gable" points={pts([x1, b.y, z1], [x1, y1, z1], [x1, ym, z1 + rise])} />
      {/* água de trás (aparece pouco) e da frente */}
      <polygon className="iso-roof-back" points={pts([b.x - o, b.y - o, z1 - 0.1], [x1 + o, b.y - o, z1 - 0.1], [x1 + o, ym, z1 + rise], [b.x - o, ym, z1 + rise])} />
      <polygon className="iso-roof" points={pts([b.x - o, y1 + o, z1 - 0.1], [x1 + o, y1 + o, z1 - 0.1], [x1 + o, ym, z1 + rise], [b.x - o, ym, z1 + rise])} />
      {/* linhas das telhas */}
      {Array.from({ length: Math.floor(b.w / 0.7) }, (_, i) => {
        const x = b.x - o + 0.35 + i * 0.7
        return <path key={i} className="iso-roof-line" d={path([x, y1 + o, z1 - 0.1], [x, ym, z1 + rise])} />
      })}
    </g>
  )
}

function Tree({ x, y, r }: { x: number; y: number; r: number }) {
  const [cx, cy] = P(x, y, 0)
  return (
    <g className="iso-tree">
      <ellipse className="iso-shadow" cx={cx} cy={cy} rx={r * S * 0.9} ry={r * S * 0.45} />
      <rect className="iso-trunk" x={cx - 2.5} y={cy - r * S * 1.6} width="5" height={r * S * 1.6} />
      <circle className="iso-crown" cx={cx} cy={cy - r * S * 1.9} r={r * S} />
      <circle className="iso-crown-hi" cx={cx - r * S * 0.3} cy={cy - r * S * 2.2} r={r * S * 0.45} />
    </g>
  )
}

export const USE_POINTS: V3[] = [
  [2.7, 10.4, 0.5],
  [11.5, 10.4, 0.1],
  [21.5, 3.5, 1.5],
]

export function SchoolIllustration({ active }: { active: number | null }) {
  const rain = useMemo(
    () =>
      Array.from({ length: 70 }, (_, i) => ({
        x: 40 + ((i * 131) % 800),
        y: ((i * 71) % 260) - 90,
        delay: ((i * 37) % 100) / 100,
      })),
    [],
  )
  const tank = { x: 17.6, y: 7.5, r: 1.05, h: 2.5 }
  const [tx, ty] = P(tank.x, tank.y, 0)
  const tTop = ty - tank.h * S
  const rx = tank.r * S * C * 1.15
  const ry = tank.r * S * 0.58

  // trajeto da água: calha → condutor → filtro → reservatório
  const capture = path([-0.4, 6.55, 3.05], [16.3, 6.55, 3.05], [16.3, 6.55, 2.85], [17.6, 6.55, 2.85], [17.6, 7.5, 2.85])
  const reuse = [
    path([17.6, 8.55, 0.05], [5.2, 8.55, 0.05], [2.7, 10.4, 0.05]),
    path([17.6, 8.55, 0.05], [17.6, 10.4, 0.05], [11.5, 10.4, 0.05]),
    path([18.65, 7.5, 0.05], [21.5, 7.5, 0.05], [21.5, 3.6, 0.05]),
  ]

  return (
    <svg className={`school ${active !== null ? `is-active-${active}` : ''}`} viewBox="20 -20 820 420" role="img" aria-labelledby="school-title school-desc">
      <title id="school-title">Ilustração conceitual da proposta na escola</title>
      <desc id="school-desc">
        O telhado do bloco de salas recebe a chuva; a calha leva a água por um filtro até um reservatório azul, de onde linhas verdes seguem
        para a horta (irrigação), o pátio (limpeza de áreas externas) e o bloco de sanitários (descargas).
      </desc>
      <defs>
        <linearGradient id="sc-ground" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#15503f" />
          <stop offset="1" stopColor="#0d3a2f" />
        </linearGradient>
        <linearGradient id="sc-tank" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#0a4fa3" />
          <stop offset="0.45" stopColor="#1677e0" />
          <stop offset="1" stopColor="#0a4590" />
        </linearGradient>
        <radialGradient id="sc-fade" cx="0.5" cy="0.5" r="0.6">
          <stop offset="0.6" stopColor="#fff" />
          <stop offset="1" stopColor="#000" />
        </radialGradient>
        <mask id="sc-mask">
          <rect x="20" y="-20" width="820" height="420" fill="url(#sc-fade)" />
        </mask>
      </defs>

      <g mask="url(#sc-mask)">
        <polygon className="iso-ground" points={pts([-5, -4, 0], [27, -4, 0], [27, 16, 0], [-5, 16, 0])} />
        {Array.from({ length: 16 }, (_, i) => (
          <path key={`gx${i}`} className="iso-grid" d={path([-5 + i * 2, -4, 0], [-5 + i * 2, 16, 0])} />
        ))}
        {Array.from({ length: 10 }, (_, i) => (
          <path key={`gy${i}`} className="iso-grid" d={path([-5, -4 + i * 2, 0], [27, -4 + i * 2, 0])} />
        ))}
      </g>

      {/* árvores ao fundo */}
      <Tree x={2} y={-2.6} r={1.2} />
      <Tree x={8} y={-3} r={1.5} />
      <Tree x={13.5} y={-2.4} r={1.1} />
      <Tree x={25.5} y={4.5} r={1.2} />
      <Tree x={-1.5} y={14} r={1.1} />

      {/* pátio e horta */}
      <polygon className="iso-court" points={pts([6.5, 7.6, 0], [16, 7.6, 0], [16, 13.2, 0], [6.5, 13.2, 0])} />
      {Array.from({ length: 9 }, (_, i) => (
        <path key={`c${i}`} className="iso-court-line" d={path([7.5 + i, 7.6, 0], [7.5 + i, 13.2, 0])} />
      ))}
      {[8.6, 10.6, 12.6].map((y) => (
        <IsoBox key={y} b={{ x: 0.4, y, w: 4.6, d: 1.1, h: 0.35 }} cls="iso-bed" />
      ))}
      {[8.6, 10.6, 12.6].flatMap((y) =>
        [0.9, 1.9, 2.9, 3.9].map((x) => {
          const [cx, cy] = P(x + 0.3, y + 0.55, 0.35)
          return <circle key={`${x}-${y}`} className="iso-plant" cx={cx} cy={cy - 5} r={6.5} />
        }),
      )}

      <Building b={{ x: 0, y: 0, w: 16, d: 6, h: 3.2 }} rise={1.6} windows={[1.0, 3.5, 6.0, 8.5, 11.0, 13.5]} />
      <Building b={{ x: 19, y: -0.5, w: 5, d: 4, h: 2.9 }} rise={1.0} windows={[19.8]} />

      {/* calha frontal */}
      <path className="iso-gutter" d={path([-0.45, 6.5, 3.08], [16.45, 6.5, 3.08])} />

      {/* reservatório */}
      <g className="iso-tank">
        <ellipse className="iso-shadow" cx={tx} cy={ty} rx={rx * 1.25} ry={ry * 1.25} />
        <path d={`M${tx - rx} ${tTop} V${ty} A${rx} ${ry} 0 0 0 ${tx + rx} ${ty} V${tTop} Z`} fill="url(#sc-tank)" />
        {[0.25, 0.5, 0.75].map((k) => (
          <path key={k} className="iso-tank-rib" d={`M${tx - rx} ${ty - tank.h * S * k} A${rx} ${ry} 0 0 0 ${tx + rx} ${ty - tank.h * S * k}`} />
        ))}
        <ellipse className="iso-tank-top" cx={tx} cy={tTop} rx={rx} ry={ry} />
      </g>

      {/* fluxos */}
      <path className="flow flow--capture" d={capture} />
      {reuse.map((d, i) => (
        <path key={i} className={`flow flow--reuse flow--r${i}`} d={d} />
      ))}
      {(() => {
        const [fx, fy] = P(17.0, 6.55, 2.85)
        return <rect className="iso-filter" x={fx - 9} y={fy - 7} width="18" height="14" rx="4" />
      })()}

      {/* chuva */}
      <g className="school-rain" aria-hidden="true">
        {rain.map((r, i) => (
          <line key={i} x1={r.x} y1={r.y} x2={r.x - 6} y2={r.y + 22} style={{ animationDelay: `${-r.delay}s` }} />
        ))}
      </g>

      {/* pontos de uso */}
      {USE_POINTS.map((p, i) => {
        const [cx, cy] = P(...p)
        return (
          <g key={i} className={`use-pin use-pin--${i}`} transform={`translate(${cx.toFixed(1)} ${cy.toFixed(1)})`}>
            <circle className="use-pin__pulse" r="22" />
            <circle className="use-pin__dot" r="13" />
            <text className="use-pin__n" y="4.5" textAnchor="middle">
              {i + 1}
            </text>
          </g>
        )
      })}
      {(() => {
        const [cx, cy] = P(17.0, 6.55, 2.85)
        return (
          <g className="iso-tag" transform={`translate(${cx - 64} ${cy - 34})`}>
            <rect width="58" height="20" rx="10" />
            <text x="29" y="14" textAnchor="middle">
              filtro
            </text>
          </g>
        )
      })()}
      <g className="iso-tag" transform={`translate(${tx - 54} ${ty + ry + 12})`}>
        <rect width="108" height="20" rx="10" />
        <text x="54" y="14" textAnchor="middle">
          reservatório
        </text>
      </g>
    </svg>
  )
}
