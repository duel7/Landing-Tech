import type { SVGProps } from 'react'

/** Marca: gota em traço com a linha d'água em verde. */
export function LogoMark({ title, ...props }: SVGProps<SVGSVGElement> & { title?: string }) {
  return (
    <svg viewBox="0 0 64 64" role={title ? 'img' : undefined} aria-hidden={title ? undefined : true} {...props}>
      {title ? <title>{title}</title> : null}
      <defs>
        <linearGradient id="logo-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#42E8E0" />
          <stop offset="1" stopColor="#087CF0" />
        </linearGradient>
      </defs>
      <path
        d="M32 6c8.6 11 15.8 19.9 15.8 28.6A15.8 15.8 0 0 1 16.2 34.6C16.2 25.9 23.4 17 32 6Z"
        fill="none"
        stroke="url(#logo-g)"
        strokeWidth="3.6"
        strokeLinejoin="round"
      />
      <path d="M22.4 37.4c3.2-2.5 6.4-2.5 9.6 0s6.4 2.5 9.6 0" fill="none" stroke="#42D982" strokeWidth="3.4" strokeLinecap="round" />
    </svg>
  )
}

export function Logo({ className = '' }: { className?: string }) {
  return (
    <span className={`logo ${className}`}>
      <LogoMark className="logo__mark" />
      <span className="logo__text">
        Gota<span className="logo__thin">Tech</span>
      </span>
    </span>
  )
}

export function ArrowDown(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" {...props}>
      <path d="M10 3v13M5 11l5 5 5-5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function ArrowUp(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" {...props}>
      <path d="M10 17V4M5 9l5-5 5 5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/** Definições SVG reutilizadas pelo CSS (recorte em forma de gota). */
export function SvgDefs() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true" focusable="false">
      <defs>
        <clipPath id="clip-drop" clipPathUnits="objectBoundingBox">
          <path d="M.5 0C.62.2.86.4.86.64A.36.36 0 0 1 .14.64C.14.4.38.2.5 0Z" />
        </clipPath>
      </defs>
    </svg>
  )
}
