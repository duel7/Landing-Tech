/* Ilustrações em traço para os cards e etapas. Decorativas. */

type P = { size?: number; className?: string }

export function Paleta({ size = 64, className }: P) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" focusable="false">
      <circle cx="25" cy="27" r="13" fill="#e6abaa" />
      <circle cx="39" cy="27" r="13" fill="#e4c06c" opacity="0.92" />
      <circle cx="32" cy="39" r="13" fill="#6e4642" opacity="0.9" />
      <circle cx="32" cy="31" r="4.2" fill="#fff8f5" />
      <path
        d="M21 19 a8 8 0 0 1 6 -3"
        stroke="#fff"
        strokeWidth="1.6"
        fill="none"
        strokeLinecap="round"
        opacity="0.7"
      />
    </svg>
  )
}

export function SacoConfeitar({ size = 64, className }: P) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" focusable="false">
      <path
        d="M12 12 C22 8 34 9 44 15 L33 37 Z"
        fill="#f1d3ce"
        stroke="#b4636c"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <path d="M12 12 C16 18 20 22 25 25" stroke="#b4636c" strokeWidth="1" fill="none" opacity="0.5" />
      <path d="M31 34 L37 39 L35 42 L29 37 Z" fill="#c99a43" stroke="#8a5f17" strokeWidth="0.8" />
      <path
        d="M36 43 C34 47 37 49 40 48 C38 51 41 54 44 52 C43 55 47 57 50 55 C52 58 55 56 55 53 C51 52 48 49 47 46 C44 46 41 45 39 42 Z"
        fill="#fff8f5"
        stroke="#d9b9b1"
        strokeWidth="0.9"
      />
      <circle cx="51" cy="18" r="1.8" fill="#e4c06c" />
      <circle cx="56" cy="27" r="1.2" fill="#e6abaa" />
    </svg>
  )
}

export function Brilhos({ size = 64, className }: P) {
  const estrela = (x: number, y: number, r: number, cor: string) => (
    <path
      d={`M${x} ${y - r} C${x + r * 0.12} ${y - r * 0.12} ${x + r * 0.12} ${y - r * 0.12} ${x + r} ${y} C${x + r * 0.12} ${y + r * 0.12} ${x + r * 0.12} ${y + r * 0.12} ${x} ${y + r} C${x - r * 0.12} ${y + r * 0.12} ${x - r * 0.12} ${y + r * 0.12} ${x - r} ${y} C${x - r * 0.12} ${y - r * 0.12} ${x - r * 0.12} ${y - r * 0.12} ${x} ${y - r} Z`}
      fill={cor}
    />
  )
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" focusable="false">
      {estrela(28, 34, 17, '#e4c06c')}
      {estrela(46, 16, 8, '#e6abaa')}
      {estrela(48, 46, 5.5, '#c99a43')}
      <circle cx="14" cy="14" r="2" fill="#e6abaa" />
    </svg>
  )
}
