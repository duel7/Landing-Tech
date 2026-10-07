import { motion, useReducedMotion } from 'motion/react'
import './dividers.css'

const L = 1440
const BASE = 26

// [centro x, largura, comprimento] de cada gota de calda
const GOTAS: [number, number, number][] = [
  [52, 22, 58],
  [150, 30, 104],
  [236, 18, 46],
  [338, 26, 84],
  [452, 34, 122],
  [560, 20, 54],
  [668, 28, 94],
  [770, 22, 62],
  [880, 36, 118],
  [988, 20, 50],
  [1090, 28, 90],
  [1196, 22, 70],
  [1304, 32, 110],
  [1398, 18, 44],
]

function gota(x: number, w: number, len: number) {
  const r = w / 2
  const s = w * 0.42
  const b = BASE
  const pescoco = r * 0.78
  return [
    `M${x - r - s} ${b - 2}`,
    `L${x + r + s} ${b - 2}`,
    `C${x + r} ${b - 2} ${x + pescoco} ${b + s * 0.4} ${x + pescoco} ${b + s}`,
    `Q${x + pescoco} ${b + len * 0.62} ${x + r} ${b + len - r}`,
    `A${r} ${r} 0 0 1 ${x - r} ${b + len - r}`,
    `Q${x - pescoco} ${b + len * 0.62} ${x - pescoco} ${b + s}`,
    `C${x - pescoco} ${b + s * 0.4} ${x - r} ${b - 2} ${x - r - s} ${b - 2}`,
    'Z',
  ].join(' ')
}

function faixa() {
  let d = `M0 0 H${L} V${BASE}`
  for (let x = L; x > 0; x -= 120) {
    d += ` C${x - 30} ${BASE + 3} ${x - 90} ${BASE - 3} ${x - 120} ${BASE}`
  }
  return d + ' Z'
}

/**
 * Borda de calda de chocolate: a seção escura "escorre" sobre a clara.
 * As gotas se alongam devagar quando entram na tela.
 */
export function Drip({ color = 'var(--cacao)', className = '' }: { color?: string; className?: string }) {
  const reduzir = useReducedMotion()
  return (
    <div className={`drip ${className}`} aria-hidden="true">
      <svg viewBox={`0 0 ${L} 150`} preserveAspectRatio="xMidYMin slice" focusable="false">
        <path d={faixa()} fill={color} />
        {GOTAS.map(([x, w, len], i) => (
          <motion.g
            key={x}
            initial={reduzir ? false : { scaleY: 0.35 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: true, margin: '0px 0px -8% 0px' }}
            transition={{ duration: 1.8 + (i % 4) * 0.25, delay: (i % 5) * 0.08, ease: [0.22, 1, 0.36, 1] }}
            style={{ originY: 0 }}
          >
            <path d={gota(x, w, len)} fill={color} />
            <path
              d={`M${x - w * 0.18} ${BASE + w * 0.5} L${x - w * 0.18} ${BASE + len - w * 0.62}`}
              stroke="rgba(255,255,255,.09)"
              strokeWidth={Math.max(2, w * 0.14)}
              strokeLinecap="round"
            />
          </motion.g>
        ))}
      </svg>
    </div>
  )
}

/** Curva suave entre a abertura clara e a faixa escura (como na referência). */
export function Wave({ color = 'var(--cacao)', className = '' }: { color?: string; className?: string }) {
  return (
    <div className={`wave ${className}`} aria-hidden="true">
      <svg viewBox="0 0 1440 120" preserveAspectRatio="none" focusable="false">
        <path d="M0 120 V74 C210 22 470 6 760 40 C1010 70 1210 104 1440 58 V120 Z" fill={color} />
      </svg>
    </div>
  )
}
