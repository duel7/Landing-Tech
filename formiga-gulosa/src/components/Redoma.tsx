import { motion, type MotionStyle } from 'motion/react'
import type { ReactNode } from 'react'
import type { Foto } from '../lib/fotos'
import { Picture } from './Picture'
import { Sparkle } from './Sweets'
import './redoma.css'

/*
 * Redoma de vidro em três camadas, para o bolo ficar DENTRO do vidro:
 *
 *   vidro de trás (tom e brilho interno)   → RedomaFundo
 *   bolo recortado em PNG + sombra          → BoloRecortado
 *   vidro da frente (reflexos, aro, pegador) → RedomaFrente
 *
 * Cada camada é posicionada pelo componente pai, sobre a mesma área, para poderem
 * reagir ao mouse e à rolagem em profundidades diferentes.
 */

export function RedomaFundo({ className = '', style }: { className?: string; style?: MotionStyle }) {
  return <motion.span className={`redoma-fundo ${className}`} style={style} aria-hidden="true" />
}

export function RedomaFrente({
  className = '',
  style,
  brilhos = true,
  children,
}: {
  className?: string
  style?: MotionStyle
  brilhos?: boolean
  children?: ReactNode
}) {
  return (
    <motion.span className={`redoma-frente ${className}`} style={style} aria-hidden="true">
      <span className="redoma-frente__aro" />
      <span className="redoma-frente__reflexo" />
      <span className="redoma-frente__varredura" />
      <span className="redoma-frente__pegador" />
      {brilhos && (
        <>
          <span className="redoma-frente__brilho redoma-frente__brilho--1">
            <Sparkle size={14} color="#fff" />
          </span>
          <span className="redoma-frente__brilho redoma-frente__brilho--2">
            <Sparkle size={10} color="var(--gold-bright)" />
          </span>
        </>
      )}
      {children}
    </motion.span>
  )
}

/**
 * Bolo recortado, apoiado no fundo da redoma, com sombra de contato.
 * `--ar` (proporção do recorte) define o tamanho que cabe sem encostar no vidro.
 */
export function BoloRecortado({
  foto,
  sizes,
  priority = false,
  className = '',
  style,
}: {
  foto: Foto
  sizes: string
  priority?: boolean
  className?: string
  style?: MotionStyle
}) {
  if (!foto.recorte) return null
  return (
    <motion.span
      className={`bolo-recortado ${className}`}
      style={{ ['--ar' as string]: foto.recorteProporcao ?? 1, ...style }}
    >
      <span className="bolo-recortado__sombra" aria-hidden="true" />
      <Picture picture={foto.recorte} alt={foto.alt} sizes={sizes} priority={priority} draggable={false} />
    </motion.span>
  )
}
