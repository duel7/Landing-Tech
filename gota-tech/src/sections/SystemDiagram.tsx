import { useMemo } from 'react'
import './diagram.css'

/**
 * Alternativa 2D à cena 3D (sem WebGL ou após erro): corte lateral do sistema,
 * com as mesmas etapas destacadas conforme a rolagem.
 */
export function SystemDiagram({ step }: { step: number }) {
  const rain = useMemo(
    () =>
      Array.from({ length: 90 }, (_, i) => {
        const x = 200 + ((i * 137) % 1300)
        const y = ((i * 89) % 420) - 60
        return { x, y, d: ((i * 53) % 100) / 100 }
      }),
    [],
  )
  const tiles = useMemo(() => Array.from({ length: 14 }, (_, i) => i), [])

  return (
    <div className={`diagram is-step-${step}`}>
      <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid meet" role="img" aria-labelledby="diagram-title">
        <title id="diagram-title">
          Corte esquemático: o telhado recebe a chuva, as calhas conduzem a água pelos tubos até o filtro e o reservatório, de onde ela segue
          para usos não potáveis.
        </title>
        <defs>
          <linearGradient id="dg-water" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#42E8E0" />
            <stop offset="1" stopColor="#087CF0" />
          </linearGradient>
          <filter id="dg-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="5" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <clipPath id="dg-tank">
            <rect x="1232" y="622" width="176" height="136" rx="12" />
          </clipPath>
        </defs>

        <g className="dg-rain">
          {rain.map((r, i) => (
            <line key={i} x1={r.x} y1={r.y} x2={r.x - 8} y2={r.y + 34} style={{ animationDelay: `${-r.d * 0.9}s` }} />
          ))}
        </g>

        {/* chão */}
        <line className="dg-ground" x1="120" y1="760" x2="1600" y2="760" />
        <g className="dg-hatch">
          {Array.from({ length: 48 }, (_, i) => (
            <line key={i} x1={140 + i * 30} y1="764" x2={124 + i * 30} y2="780" />
          ))}
        </g>

        {/* casa (vista do oitão) */}
        <g className="dg-house">
          <rect x="380" y="510" width="500" height="250" />
          <rect className="dg-win" x="440" y="580" width="120" height="90" />
          <rect className="dg-win" x="700" y="580" width="120" height="90" />
          <path className="dg-wc" d="M760 720 h40 v-26 h-34 z" />
        </g>
        <g className="dg-roof">
          <path d="M318 526 L630 332 L942 526 L928 534 L630 350 L332 534 Z" />
          {tiles.map((i) => (
            <line key={`l${i}`} x1={318 + i * 22} y1={526 - i * 13.6} x2={332 + i * 22} y2={534 - i * 13.6} />
          ))}
          {tiles.map((i) => (
            <line key={`r${i}`} x1={942 - i * 22} y1={526 - i * 13.6} x2={928 - i * 22} y2={534 - i * 13.6} />
          ))}
        </g>
        <g className="dg-roofflow">
          <path d="M622 344 L330 526" />
          <path d="M638 344 L930 526" />
        </g>

        {/* calhas */}
        <g className="dg-gutter">
          <path d="M300 528 a16 16 0 0 0 32 0" />
          <path d="M928 528 a16 16 0 0 0 32 0" />
        </g>

        {/* condutores e filtro */}
        <path className="dg-pipe" d="M944 544 V585 H1320 V622" />
        <path className="dg-pipe dg-pipe--back" d="M316 544 V600 H380" />
        <path className="dg-flow dg-flow--main" d="M944 544 V585 H1320 V622" />
        <g className="dg-filter">
          <rect x="1060" y="563" width="92" height="44" rx="10" />
          <path className="dg-mesh" d="M1072 571 V599 M1084 571 V599 M1096 571 V599 M1108 571 V599 M1120 571 V599 M1132 571 V599 M1144 571 V599" />
          <g className="dg-leaves">
            <ellipse cx="1074" cy="578" rx="7" ry="3.5" transform="rotate(-30 1074 578)" />
            <ellipse cx="1078" cy="592" rx="6" ry="3" transform="rotate(25 1078 592)" />
            <ellipse cx="1069" cy="586" rx="5" ry="2.6" transform="rotate(70 1069 586)" />
          </g>
          <circle className="dg-focus" cx="1106" cy="585" r="70" />
        </g>

        {/* reservatório */}
        <g className="dg-tank">
          <rect x="1230" y="620" width="180" height="140" rx="14" />
          <g clipPath="url(#dg-tank)">
            <rect className="dg-level" x="1230" y="620" width="180" height="140" fill="url(#dg-water)" />
          </g>
          <path className="dg-ribs" d="M1230 655 h180 M1230 690 h180 M1230 725 h180" />
          <rect x="1244" y="608" width="152" height="14" rx="6" />
          <path className="dg-faucet" d="M1410 732 h18 v10" />
        </g>

        {/* reaproveitamento */}
        <g className="dg-reuse">
          <path d="M1428 746 V758" />
          <path d="M1410 750 C1450 750 1470 752 1490 742" />
          <path d="M1232 752 C1150 790 900 790 800 716" />
          <rect className="dg-bed" x="1478" y="726" width="94" height="34" rx="4" />
          <circle className="dg-plant" cx="1500" cy="716" r="14" />
          <circle className="dg-plant" cx="1526" cy="710" r="18" />
          <circle className="dg-plant" cx="1552" cy="718" r="12" />
          <path className="dg-bucket" d="M1414 760 l4 -22 h22 l4 22 z" />
        </g>

        <g className="dg-labels">
          <text x="236" y="512">calha</text>
          <text x="1048" y="548">filtro</text>
          <text x="1240" y="806">reservatório</text>
          <text className="dg-green" x="1470" y="806">irrigação</text>
          <text className="dg-green" x="1360" y="840">limpeza</text>
          <text className="dg-green" x="690" y="806">descargas sanitárias</text>
        </g>
      </svg>
    </div>
  )
}
