import { useId } from 'react'
import './ant.css'

export type Carga = 'brigadeiro' | 'cereja' | 'coracao' | 'granulado' | 'perola' | 'nenhuma'

interface AntProps {
  size?: number
  walking?: boolean
  carrying?: Carga
  /** Velocidade do passo em segundos (menor = mais rápido). */
  speed?: number
  className?: string
  style?: React.CSSProperties
  /** Texto para leitores de tela; sem ele a formiga é decorativa. */
  title?: string
}

// Patas no chão: [quadril x, quadril y, caminho, grupo do passo]
const PATAS_FUNDO: [number, number, string, 'a' | 'b'][] = [
  [37, 35, 'M37 35 L33 42 L31 51.5 L29 51.5', 'b'],
  [40, 36, 'M40 36 L43.5 43 L44.5 51.5 L46.5 51.5', 'a'],
]
const PATAS_FRENTE: [number, number, string, 'a' | 'b'][] = [
  [36, 35, 'M36 35 L29.5 41 L25.5 51.5 L23.2 51.5', 'a'],
  [39, 36.5, 'M39 36.5 L39.5 43.5 L37 51.5 L34.8 51.5', 'b'],
]
// Sem carga, o par da frente também apoia no chão.
const PATAS_LIVRES: [number, number, string, 'a' | 'b'][] = [
  [43, 34, 'M43 34 L50.5 40 L54.5 51.5 L56.8 51.5', 'a'],
  [42, 35, 'M42 35 L47 42.5 L48.5 51.5 L50.5 51.5', 'b'],
]

const GRANULADO_BOLA = [
  [33.4, 6.8, 30],
  [36.6, 4.6, -40],
  [40.1, 6.2, 75],
  [34.9, 10.1, -10],
  [38.4, 8.9, 50],
  [41.2, 9.6, -60],
  [32.6, 9.4, 80],
  [37.5, 12, 15],
] as const

/**
 * A formiga da logo — cabeça redonda, olho grande, chapéu de confeiteiro e um doce
 * nas patas — redesenhada em vetor para andar pelo site.
 */
export function Ant({
  size = 48,
  walking = false,
  carrying = 'brigadeiro',
  speed = 0.42,
  className = '',
  style,
  title,
}: AntProps) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '')
  const carregando = carrying !== 'nenhuma'
  const decorativa = !title

  return (
    <svg
      className={`ant ${walking ? 'is-walking' : ''} ${className}`}
      width={size}
      height={(size * 56) / 72}
      viewBox="0 0 72 56"
      style={{ ['--ant-speed' as string]: `${speed}s`, ...style }}
      aria-hidden={decorativa || undefined}
      role={decorativa ? undefined : 'img'}
      focusable="false"
    >
      {title && <title>{title}</title>}
      <defs>
        <radialGradient id={`${uid}-corpo`} cx="35%" cy="30%" r="75%">
          <stop offset="0" stopColor="#5a4644" />
          <stop offset="0.45" stopColor="#221817" />
          <stop offset="1" stopColor="#120c0b" />
        </radialGradient>
        <radialGradient id={`${uid}-choc`} cx="38%" cy="32%" r="70%">
          <stop offset="0" stopColor="#7a4a37" />
          <stop offset="0.55" stopColor="#43231a" />
          <stop offset="1" stopColor="#25110c" />
        </radialGradient>
        <linearGradient id={`${uid}-forma`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f07796" />
          <stop offset="1" stopColor="#c23a5e" />
        </linearGradient>
      </defs>

      <ellipse className="ant__shadow" cx="38" cy="52.6" rx="20" ry="1.6" />

      <g
        className="ant__legs"
        fill="none"
        stroke="#1b1312"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {PATAS_FUNDO.map(([x, y, d, g]) => (
          <path
            key={d}
            className={`ant__leg ant__leg--${g}`}
            d={d}
            style={{ transformOrigin: `${x}px ${y}px` }}
            opacity="0.7"
          />
        ))}
        {!carregando &&
          PATAS_LIVRES.map(([x, y, d, g]) => (
            <path key={d} className={`ant__leg ant__leg--${g}`} d={d} style={{ transformOrigin: `${x}px ${y}px` }} />
          ))}
      </g>

      <g className="ant__body">
        {/* carga levantada pelas patas da frente */}
        {carregando && (
          <g className="ant__load">
            <path
              d="M41 30.5 L37.5 22 L35.2 17.4"
              fill="none"
              stroke="#1b1312"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M43.5 30 L42.6 22 L40.2 17.4"
              fill="none"
              stroke="#1b1312"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {carrying === 'brigadeiro' && (
              <g>
                <circle cx="37.2" cy="8.6" r="6.4" fill={`url(#${uid}-choc)`} />
                {GRANULADO_BOLA.map(([x, y, r], i) => (
                  <rect
                    key={i}
                    x={x - 0.9}
                    y={y - 0.32}
                    width="1.8"
                    height="0.64"
                    rx="0.32"
                    fill={i % 3 ? '#1a0a07' : '#9b6a50'}
                    transform={`rotate(${r} ${x} ${y})`}
                  />
                ))}
                <path d="M30.6 12.6 H43.8 L41.7 18.2 H32.7 Z" fill={`url(#${uid}-forma)`} />
                <path
                  d="M33.6 12.8 L34.4 18 M36.3 12.8 L36.6 18 M39 12.8 L38.8 18 M41.6 12.8 L41 18"
                  stroke="#a52c4d"
                  strokeWidth="0.45"
                  opacity="0.7"
                />
              </g>
            )}
            {carrying === 'cereja' && (
              <g>
                <path
                  d="M38 8 C38.5 4 40.5 1.6 43.6 0.9"
                  fill="none"
                  stroke="#5b3b22"
                  strokeWidth="0.9"
                  strokeLinecap="round"
                />
                <path d="M41.2 2.2 C43.6 0.6 46 1.4 46.4 2.7 C44.2 3.6 42.6 3.3 41.2 2.2 Z" fill="#6f8f4c" />
                <circle cx="37.6" cy="12.4" r="5.4" fill="#c8243f" />
                <ellipse
                  cx="35.8"
                  cy="10.8"
                  rx="1.6"
                  ry="1"
                  fill="#fff"
                  opacity="0.55"
                  transform="rotate(-30 35.8 10.8)"
                />
              </g>
            )}
            {carrying === 'coracao' && (
              <path
                d="M37.6 18 C31 13.4 30.6 8.4 33.4 6.6 C35.4 5.3 37.1 6.6 37.6 8 C38.2 6.6 39.9 5.3 41.9 6.6 C44.7 8.4 44.2 13.4 37.6 18 Z"
                fill="#e56f8f"
                stroke="#c0466a"
                strokeWidth="0.6"
              />
            )}
            {carrying === 'granulado' && (
              <rect x="30" y="13" width="16" height="3.6" rx="1.8" fill="#e4c06c" transform="rotate(-14 38 14.8)" />
            )}
            {carrying === 'perola' && (
              <g>
                <circle cx="37.6" cy="12" r="5" fill="#fbf1ee" stroke="#e7cfc9" strokeWidth="0.5" />
                <circle cx="35.9" cy="10.4" r="1.5" fill="#fff" />
              </g>
            )}
          </g>
        )}

        {/* abdômen, cintura, tórax */}
        <ellipse cx="17.5" cy="35.5" rx="13.2" ry="9.4" transform="rotate(-12 17.5 35.5)" fill={`url(#${uid}-corpo)`} />
        <path
          d="M9.5 31.5 C14 29 20 28.6 25 30.2"
          fill="none"
          stroke="#5c4846"
          strokeWidth="0.7"
          opacity="0.6"
          strokeLinecap="round"
        />
        <circle cx="31.8" cy="34" r="3.1" fill={`url(#${uid}-corpo)`} />
        <ellipse cx="38.8" cy="32" rx="6.8" ry="5" transform="rotate(-10 38.8 32)" fill={`url(#${uid}-corpo)`} />

        {/* patas da frente (no chão) */}
        <g fill="none" stroke="#1b1312" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          {PATAS_FRENTE.map(([x, y, d, g]) => (
            <path key={d} className={`ant__leg ant__leg--${g}`} d={d} style={{ transformOrigin: `${x}px ${y}px` }} />
          ))}
        </g>

        {/* antenas */}
        <g className="ant__antennae" fill="none" stroke="#1b1312" strokeWidth="1.1" strokeLinecap="round">
          <path d="M55 17.6 C56.6 12.6 59 9.8 63 8.8" />
          <path d="M58 19.6 C61.2 15.8 64 14.6 67.4 15" />
          <circle cx="63.3" cy="8.7" r="1.35" fill="#1b1312" stroke="none" />
          <circle cx="67.6" cy="15" r="1.35" fill="#1b1312" stroke="none" />
        </g>

        {/* cabeça */}
        <circle cx="52.4" cy="25.4" r="9.2" fill={`url(#${uid}-corpo)`} />
        <g className="ant__eye">
          <circle cx="55" cy="24.4" r="4.3" fill="#fff" />
          <circle cx="56" cy="24.6" r="2.35" fill="#120c0b" />
          <circle cx="56.8" cy="23.6" r="0.85" fill="#fff" />
        </g>

        {/* chapéu de confeiteiro */}
        <g transform="rotate(-14 50 15)">
          <rect x="45.4" y="14.2" width="9.4" height="3.6" rx="1" fill="#fff" stroke="#e6d6d2" strokeWidth="0.5" />
          <circle cx="46.8" cy="12.4" r="3" fill="#fff" />
          <circle cx="50.2" cy="10.9" r="3.6" fill="#fff" />
          <circle cx="53.5" cy="12.5" r="2.9" fill="#fff" />
          <path d="M46 14.4 C48 13.4 52 13.4 54.2 14.4" fill="none" stroke="#eadad6" strokeWidth="0.5" />
        </g>
      </g>
    </svg>
  )
}
