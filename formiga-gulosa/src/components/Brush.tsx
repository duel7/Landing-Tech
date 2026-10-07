import { useId } from 'react'

/**
 * Pincelada em aquarela rosada, como a que fica atrás do nome na logo.
 * O contorno irregular vem de um filtro de ruído aplicado a formas simples.
 */
export function Brush({ className, style }: { className?: string; style?: React.CSSProperties }) {
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, '')
  return (
    <svg
      className={className}
      style={style}
      viewBox="0 0 640 260"
      aria-hidden="true"
      focusable="false"
      preserveAspectRatio="none"
    >
      <defs>
        <filter id={`${id}-f`} x="-10%" y="-20%" width="120%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.018 0.09" numOctaves="3" seed="7" />
          <feDisplacementMap in="SourceGraphic" scale="26" />
          <feGaussianBlur stdDeviation="0.6" />
        </filter>
        <linearGradient id={`${id}-g`} x1="0" y1="0" x2="1" y2="0.3">
          <stop offset="0" stopColor="#efc0bd" stopOpacity="0.15" />
          <stop offset="0.25" stopColor="#ebb0ae" stopOpacity="0.7" />
          <stop offset="0.7" stopColor="#e7a6a6" stopOpacity="0.8" />
          <stop offset="1" stopColor="#f1c7c3" stopOpacity="0.2" />
        </linearGradient>
      </defs>
      <g filter={`url(#${id}-f)`}>
        <path
          d="M30 120 C140 60 330 44 500 70 C580 82 628 110 600 140 C520 196 300 214 120 190 C40 178 -6 150 30 120 Z"
          fill={`url(#${id}-g)`}
        />
        <path
          d="M80 96 C210 70 380 66 540 96 C470 104 300 104 150 118 C110 122 70 112 80 96 Z"
          fill="#f5d4d0"
          opacity="0.7"
        />
        <path
          d="M110 176 C250 160 420 158 560 150 C500 176 360 198 200 196 C150 195 110 188 110 176 Z"
          fill="#e39c9f"
          opacity="0.35"
        />
      </g>
      <g stroke="#e5a2a3" strokeLinecap="round" fill="none" opacity="0.35">
        <path d="M60 210 C220 196 400 192 590 176" strokeWidth="2" />
        <path d="M40 62 C190 40 370 34 520 50" strokeWidth="1.4" />
        <path d="M150 226 C280 218 420 214 520 206" strokeWidth="1" />
      </g>
    </svg>
  )
}
