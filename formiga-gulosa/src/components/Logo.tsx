import logo from '../assets/marca/formiga-gulosa-logo.png?w=112;224;420;688&format=avif;webp&as=picture'
import { Picture } from './Picture'

/** Logo oficial, apenas recortada no círculo original (sem alterações). */
export function Logo({
  sizes,
  className = '',
  priority = false,
}: {
  sizes: string
  className?: string
  priority?: boolean
}) {
  return (
    <Picture
      picture={logo}
      alt="Formiga Gulosa — Confeitaria artesanal"
      sizes={sizes}
      className={`logo ${className}`}
      priority={priority}
    />
  )
}
