import { AnimatePresence, motion } from 'motion/react'
import { ArrowLeft, ArrowRight, X } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Picture } from '../components/Picture'
import { WhatsAppIcon } from '../components/Sweets'
import { linkWhatsapp, site } from '../config/site'
import { rotuloFoto, type Foto } from '../lib/fotos'
import { useEscape, useFocusTrap } from '../lib/hooks'
import { liberarRolagem, travarRolagem } from '../lib/scroll'
import './lightbox.css'

const num = (n: number) => String(n).padStart(2, '0')

const slide = {
  entra: (d: number) => ({ opacity: 0, x: d * 80, scale: 0.97 }),
  centro: { opacity: 1, x: 0, scale: 1 },
  sai: (d: number) => ({ opacity: 0, x: d * -80, scale: 0.97 }),
}

/** Visualização ampliada do mostruário: teclado (← → Esc), arrastar no celular e foco preso no diálogo. */
export function Lightbox({ fotos, indice, fechar }: { fotos: Foto[]; indice: number | null; fechar: () => void }) {
  const aberto = indice !== null
  const [atual, setAtual] = useState(indice ?? 0)
  const [direcao, setDirecao] = useState(1)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (indice !== null) setAtual(indice)
  }, [indice])

  useEffect(() => {
    if (!aberto) return
    travarRolagem()
    return () => liberarRolagem()
  }, [aberto])

  useFocusTrap(ref, aberto)
  useEscape(aberto, fechar)

  const ir = useCallback(
    (passo: number) => {
      setDirecao(passo)
      setAtual((a) => (a + passo + fotos.length) % fotos.length)
    },
    [fotos.length],
  )

  useEffect(() => {
    if (!aberto) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') ir(1)
      if (e.key === 'ArrowLeft') ir(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [aberto, ir])

  const foto = fotos[atual]
  if (typeof document === 'undefined') return null

  return createPortal(
    <AnimatePresence>
      {aberto && foto && (
        <motion.div
          ref={ref}
          className="lb"
          role="dialog"
          aria-modal="true"
          aria-label={`Mostruário: ${rotuloFoto(foto)}, foto ${atual + 1} de ${fotos.length}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
          data-lenis-prevent
        >
          <div className="lb__backdrop" onClick={fechar} aria-hidden="true" />

          <div className="lb__top">
            <p className="lb__count" aria-live="polite">
              <span>{num(atual + 1)}</span> / {num(fotos.length)}
            </p>
            <button type="button" className="lb__close" onClick={fechar} data-autofocus>
              <span>Fechar</span>
              <span className="lb__close-icon" aria-hidden="true">
                <X size={18} strokeWidth={1.6} />
              </span>
            </button>
          </div>

          <div className="lb__stage">
            <AnimatePresence initial={false} custom={direcao} mode="popLayout">
              <motion.figure
                key={foto.id}
                className="lb__figure"
                custom={direcao}
                variants={slide}
                initial="entra"
                animate="centro"
                exit="sai"
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                drag={fotos.length > 1 ? 'x' : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.5}
                onDragEnd={(_, info) => {
                  if (info.offset.x < -70 || info.velocity.x < -400) ir(1)
                  else if (info.offset.x > 70 || info.velocity.x > 400) ir(-1)
                }}
              >
                <Picture
                  picture={foto.picture}
                  alt={foto.alt}
                  sizes="(max-width: 767px) 94vw, 80vw"
                  className="lb__picture"
                  loading="eager"
                  draggable={false}
                />
              </motion.figure>
            </AnimatePresence>

            {fotos.length > 1 && (
              <>
                <button
                  type="button"
                  className="lb__nav lb__nav--prev"
                  onClick={() => ir(-1)}
                  aria-label="Foto anterior"
                >
                  <ArrowLeft size={20} strokeWidth={1.5} />
                </button>
                <button type="button" className="lb__nav lb__nav--next" onClick={() => ir(1)} aria-label="Próxima foto">
                  <ArrowRight size={20} strokeWidth={1.5} />
                </button>
              </>
            )}
          </div>

          <div className="lb__caption">
            <div>
              {foto.categoria && <p className="lb__cat">{foto.categoria}</p>}
              <p className="lb__title">{foto.titulo ?? `Criação ${num(foto.numero)}`}</p>
              {foto.descricao && <p className="lb__desc">{foto.descricao}</p>}
            </div>
            <a
              className="btn btn--gold btn--small"
              href={linkWhatsapp(
                `Olá! Vi no site da ${site.nome} a ${foto.titulo ? `criação "${foto.titulo}"` : `criação nº ${num(foto.numero)}`} do mostruário e gostaria de encomendar um bolo parecido.`,
              )}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span>Quero um parecido</span>
              <span className="btn__icon">
                <WhatsAppIcon size={14} />
              </span>
              <span className="sr-only"> (abre o WhatsApp)</span>
            </a>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
