import { useId } from 'react'

/* Pequenos doces desenhados em vetor. Todos são decorativos (aria-hidden). */

type SvgProps = { size?: number; className?: string; style?: React.CSSProperties }

const useUid = () => useId().replace(/[^a-zA-Z0-9_-]/g, '')

const GRANULADOS = [
  [13, 10, 20],
  [19, 7, -35],
  [25, 9.5, 60],
  [29, 14, -15],
  [10, 15, 75],
  [16, 13, -60],
  [22, 13.5, 10],
  [27, 19.5, 45],
  [12, 20.5, -25],
  [18, 18.5, 85],
  [23, 21.5, -50],
  [30.5, 9.5, 30],
  [8, 11, -70],
  [20, 24, 25],
  [15, 24.5, -80],
  [26, 24, 5],
] as const

export function Brigadeiro({ size = 40, className, style }: SvgProps) {
  const id = useUid()
  return (
    <svg
      className={className}
      style={style}
      width={size}
      height={size}
      viewBox="0 0 40 40"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <radialGradient id={`${id}-b`} cx="36%" cy="30%" r="72%">
          <stop offset="0" stopColor="#80503c" />
          <stop offset="0.5" stopColor="#4a271c" />
          <stop offset="1" stopColor="#24100b" />
        </radialGradient>
        <linearGradient id={`${id}-f`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f17d9b" />
          <stop offset="1" stopColor="#b9365a" />
        </linearGradient>
      </defs>
      <ellipse cx="20" cy="37.6" rx="13" ry="1.8" fill="rgba(43,23,22,.18)" />
      <path d="M5.5 23 H34.5 L30.6 36.4 H9.4 Z" fill={`url(#${id}-f)`} />
      {[9, 13, 17, 21, 25, 29].map((x, i) => (
        <path
          key={x}
          d={`M${x + 0.5} 23.4 L${x + (i - 2.5) * 0.35 + 0.8} 36`}
          stroke="#a02a4b"
          strokeWidth="0.7"
          opacity="0.6"
        />
      ))}
      <path
        d="M5.5 23 C8 25 11 22.6 13.6 24.6 C16.2 22.6 18.8 25 20 23.4 C22 25 24.6 22.6 26.6 24.6 C29 22.6 32 25 34.5 23 Z"
        fill="#f28ea8"
      />
      <circle cx="20" cy="16.5" r="13" fill={`url(#${id}-b)`} />
      {GRANULADOS.map(([x, y, r], i) => (
        <rect
          key={i}
          x={x - 1.6}
          y={y - 0.55}
          width="3.2"
          height="1.1"
          rx="0.55"
          fill={i % 4 === 0 ? '#a77457' : '#170805'}
          transform={`rotate(${r} ${x} ${y})`}
        />
      ))}
      <ellipse cx="14.5" cy="10" rx="4" ry="2.2" fill="#fff" opacity="0.12" transform="rotate(-28 14.5 10)" />
    </svg>
  )
}

export function Sprinkle({
  color = 'var(--gold-bright)',
  length = 18,
  rotate = 0,
  className,
  style,
}: { color?: string; length?: number; rotate?: number } & Omit<SvgProps, 'size'>) {
  const t = length * 0.3
  return (
    <svg
      className={className}
      style={{ ...style, rotate: `${rotate}deg` }}
      width={length}
      height={t}
      viewBox={`0 0 ${length} ${t}`}
      aria-hidden="true"
      focusable="false"
    >
      <rect width={length} height={t} rx={t / 2} fill={color} />
      <rect
        x={t * 0.6}
        y={t * 0.22}
        width={length - t * 1.6}
        height={t * 0.22}
        rx={t * 0.11}
        fill="#fff"
        opacity="0.4"
      />
    </svg>
  )
}

export function Pearl({
  size = 14,
  tone = 'cream',
  className,
  style,
}: SvgProps & { tone?: 'cream' | 'gold' | 'rose' }) {
  const id = useUid()
  const cores = {
    cream: ['#ffffff', '#f6e3de', '#d9b9b1'],
    gold: ['#fff4cf', '#e4c06c', '#a77a22'],
    rose: ['#ffe9ee', '#eaa3b2', '#b9617a'],
  }[tone]
  return (
    <svg
      className={className}
      style={style}
      width={size}
      height={size}
      viewBox="0 0 20 20"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <radialGradient id={`${id}-p`} cx="35%" cy="30%" r="70%">
          <stop offset="0" stopColor={cores[0]} />
          <stop offset="0.55" stopColor={cores[1]} />
          <stop offset="1" stopColor={cores[2]} />
        </radialGradient>
      </defs>
      <circle cx="10" cy="10" r="9" fill={`url(#${id}-p)`} />
      <circle cx="7" cy="6.6" r="2.2" fill="#fff" opacity="0.85" />
    </svg>
  )
}

export function Cherry({ size = 36, className, style }: SvgProps) {
  const id = useUid()
  return (
    <svg
      className={className}
      style={style}
      width={size}
      height={size}
      viewBox="0 0 40 40"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <radialGradient id={`${id}-c`} cx="35%" cy="35%" r="70%">
          <stop offset="0" stopColor="#ef5a6f" />
          <stop offset="0.6" stopColor="#b51d38" />
          <stop offset="1" stopColor="#6e0d20" />
        </radialGradient>
      </defs>
      <path d="M19 20 C19.5 12 23 6 30 3" fill="none" stroke="#5d3b1f" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M26 5.6 C29.5 2 34.6 2.6 36 5 C32 7 28.6 7 26 5.6 Z" fill="#6f8f4c" />
      <circle cx="18" cy="27" r="10.5" fill={`url(#${id}-c)`} />
      <ellipse cx="14" cy="23" rx="3" ry="1.8" fill="#fff" opacity="0.5" transform="rotate(-35 14 23)" />
    </svg>
  )
}

export function Strawberry({ size = 38, className, style }: SvgProps) {
  const id = useUid()
  const sementes = [
    [15, 17],
    [21, 15.5],
    [27, 17.5],
    [12.5, 23],
    [18.5, 22],
    [24.5, 22.5],
    [30, 23.5],
    [15.5, 28.5],
    [21.5, 28],
    [27, 29],
    [18.5, 33.5],
    [24, 34],
  ]
  return (
    <svg
      className={className}
      style={style}
      width={size}
      height={size}
      viewBox="0 0 42 42"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <radialGradient id={`${id}-s`} cx="38%" cy="32%" r="75%">
          <stop offset="0" stopColor="#f2697a" />
          <stop offset="0.6" stopColor="#d22d48" />
          <stop offset="1" stopColor="#8f1429" />
        </radialGradient>
      </defs>
      <path
        d="M21 39.5 C12 35 7.5 25 9.5 17.5 C11 12.5 16 11.8 21 12.6 C26 11.8 31 12.5 32.5 17.5 C34.5 25 30 35 21 39.5 Z"
        fill={`url(#${id}-s)`}
      />
      {sementes.map(([x, y]) => (
        <ellipse key={`${x}-${y}`} cx={x} cy={y} rx="0.7" ry="1.1" fill="#f6d77f" />
      ))}
      <path
        d="M21 13.5 C17 13.6 13.5 11.6 12 8.6 C15.4 9.4 17.6 9.6 19.6 9.2 C18.6 6.6 19.4 4.6 21 3 C22.6 4.6 23.4 6.6 22.4 9.2 C24.4 9.6 26.6 9.4 30 8.6 C28.5 11.6 25 13.6 21 13.5 Z"
        fill="#5f8a3f"
      />
    </svg>
  )
}

export function Sparkle({ size = 18, className, style, color = 'var(--gold-bright)' }: SvgProps & { color?: string }) {
  return (
    <svg
      className={className}
      style={style}
      width={size}
      height={size}
      viewBox="0 0 20 20"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M10 0 C10.8 6.2 13.8 9.2 20 10 C13.8 10.8 10.8 13.8 10 20 C9.2 13.8 6.2 10.8 0 10 C6.2 9.2 9.2 6.2 10 0 Z"
        fill={color}
      />
    </svg>
  )
}

export function Heart({ size = 18, className, style, color = 'var(--rose)' }: SvgProps & { color?: string }) {
  return (
    <svg
      className={className}
      style={style}
      width={size}
      height={size}
      viewBox="0 0 24 22"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M12 21 C3.5 15 1 10.2 1.6 6.4 C2.2 2.8 5.2 1 8.1 1.5 C9.9 1.8 11.2 3 12 4.4 C12.8 3 14.1 1.8 15.9 1.5 C18.8 1 21.8 2.8 22.4 6.4 C23 10.2 20.5 15 12 21 Z"
        fill={color}
      />
    </svg>
  )
}

/* -------- Ícones da marca -------- */

export function WhatsAppIcon({ size = 18, className }: { size?: number; className?: string }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      fill="currentColor"
    >
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.84 9.84 0 0 0 12.04 2Zm0 18.15h-.01a8.23 8.23 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.23 8.25-8.23 2.2 0 4.27.86 5.83 2.42a8.18 8.18 0 0 1 2.41 5.83c0 4.54-3.7 8.22-8.24 8.22Zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.13-.15.17-.25.25-.42.08-.17.04-.31-.02-.43-.06-.13-.56-1.35-.76-1.84-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.22.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.14-1.18-.06-.1-.22-.16-.47-.28Z" />
    </svg>
  )
}

export function InstagramIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.4" cy="6.6" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}
