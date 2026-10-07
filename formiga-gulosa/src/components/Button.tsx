import { ArrowRight, ArrowUpRight } from 'lucide-react'
import type { ReactNode } from 'react'
import { WhatsAppIcon } from './Sweets'

type Variant = 'dark' | 'ghost' | 'gold' | 'light' | 'line-light'

interface Props {
  href: string
  children: ReactNode
  variant?: Variant
  small?: boolean
  icon?: 'arrow' | 'external' | 'whatsapp' | 'none' | ReactNode
  className?: string
  /** Abre em nova aba (links externos). */
  external?: boolean
  ariaLabel?: string
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void
  cursor?: string
}

export function Button({
  href,
  children,
  variant = 'dark',
  small,
  icon = 'arrow',
  className = '',
  external,
  ariaLabel,
  onClick,
  cursor,
}: Props) {
  const variante = variant === 'dark' ? '' : `btn--${variant}`
  let iconeEl: ReactNode = null
  if (icon === 'arrow') iconeEl = <ArrowRight size={15} strokeWidth={1.8} aria-hidden="true" />
  else if (icon === 'external') iconeEl = <ArrowUpRight size={15} strokeWidth={1.8} aria-hidden="true" />
  else if (icon === 'whatsapp') iconeEl = <WhatsAppIcon size={15} />
  else if (icon !== 'none') iconeEl = icon

  return (
    <a
      href={href}
      className={`btn ${variante} ${small ? 'btn--small' : ''} ${className}`}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      aria-label={ariaLabel}
      onClick={onClick}
      data-cursor={cursor}
    >
      <span>{children}</span>
      {iconeEl && <span className="btn__icon">{iconeEl}</span>}
      {external && <span className="sr-only"> (abre em nova aba)</span>}
    </a>
  )
}
