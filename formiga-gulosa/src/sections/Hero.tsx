import {
  AnimatePresence,
  motion,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from 'motion/react'
import { ArrowDown, ArrowRight, MapPin } from 'lucide-react'
import { useId, useRef, useState } from 'react'
import { Ant } from '../components/Ant'
import { Brush } from '../components/Brush'
import { Button } from '../components/Button'
import { Wave } from '../components/Dividers'
import { Logo } from '../components/Logo'
import { Picture } from '../components/Picture'
import { EASE, MaskLines } from '../components/Reveal'
import { Brigadeiro, Cherry, Heart, Pearl, Sparkle, Sprinkle, Strawberry, WhatsAppIcon } from '../components/Sweets'
import { linkWhatsapp } from '../config/site'
import { fotoDestaque, fotos, rotuloFoto, type Foto } from '../lib/fotos'
import { useFinePointer } from '../lib/hooks'
import './hero.css'

/** Deslocamento de uma camada conforme a posição do mouse (profundidade em px). */
function useCamada(mx: MotionValue<number>, my: MotionValue<number>, profundidade: number) {
  const x = useTransform(mx, (v) => v * profundidade)
  const y = useTransform(my, (v) => v * profundidade * 0.7)
  return { x, y }
}

const entrada = (delay: number, y = 24) => ({
  initial: { opacity: 0, y },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 1, delay, ease: EASE },
})

export function Hero() {
  const ref = useRef<HTMLElement>(null)
  const fino = useFinePointer()
  const mxRaw = useMotionValue(0)
  const myRaw = useMotionValue(0)
  const mx = useSpring(mxRaw, { stiffness: 60, damping: 18, mass: 0.8 })
  const my = useSpring(myRaw, { stiffness: 60, damping: 18, mass: 0.8 })

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const palcoY = useTransform(scrollYProgress, [0, 1], [0, 90])
  const textoY = useTransform(scrollYProgress, [0, 1], [0, -50])

  const [fotoAtual, setFotoAtual] = useState<Foto | undefined>(fotoDestaque)

  const onPointerMove = (e: React.PointerEvent) => {
    if (!fino || e.pointerType !== 'mouse') return
    const r = e.currentTarget.getBoundingClientRect()
    mxRaw.set(((e.clientX - r.left) / r.width) * 2 - 1)
    myRaw.set(((e.clientY - r.top) / r.height) * 2 - 1)
  }
  const onPointerLeave = () => {
    mxRaw.set(0)
    myRaw.set(0)
  }

  return (
    <section
      ref={ref}
      id="inicio"
      className="hero grain"
      aria-labelledby="hero-titulo"
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
    >
      <div className="hero__glow" aria-hidden="true" />

      <div className="container hero__grid">
        <motion.div className="hero__copy" style={{ y: textoY }}>
          <motion.p className="eyebrow hero__eyebrow" {...entrada(0.25, 12)}>
            Confeitaria artesanal · Itabuna - BA
          </motion.p>

          <h1 id="hero-titulo" className="hero__title">
            <span className="line-mask hero__pre">
              <motion.span
                initial={{ y: '110%' }}
                animate={{ y: '0%' }}
                transition={{ duration: 0.9, delay: 0.3, ease: EASE }}
              >
                Bolos personalizados
              </motion.span>
            </span>
            <span className="display hero__big">
              <MaskLines
                animateOnMount
                delay={0.42}
                stagger={0.12}
                lines={[
                  'com a cara',
                  <>
                    da sua <em className="script gold-text hero__festa">festa.</em>
                  </>,
                ]}
              />
            </span>
          </h1>

          <motion.p className="lead hero__lead" {...entrada(0.78)}>
            Cada bolo da Formiga Gulosa nasce da sua ideia: o tema, as cores e cada detalhe são pensados com você e
            feitos à mão, com carinho de confeitaria artesanal.
          </motion.p>

          <motion.div className="hero__ctas" {...entrada(0.9)}>
            <Button href="#mostruario">Ver nossos bolos</Button>
            <Button href={linkWhatsapp()} variant="ghost" icon="whatsapp" external>
              Falar pelo WhatsApp
            </Button>
          </motion.div>

          <motion.a href="#diferenciais" className="hero__scroll" {...entrada(1.15, 0)}>
            <span className="hero__scroll-circle" aria-hidden="true">
              <ArrowDown size={17} strokeWidth={1.5} />
            </span>
            <span>Role para explorar</span>
          </motion.a>
        </motion.div>

        <motion.div className="hero__stage-wrap" style={{ y: palcoY }}>
          <Palco mx={mx} my={my} foto={fotoAtual} />
        </motion.div>

        <Trilho fotoAtual={fotoAtual} setFotoAtual={setFotoAtual} />
      </div>

      <Wave />
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* Palco: redoma de vidro sobre a boleira, doces na mesa, formiga.      */
/* ------------------------------------------------------------------ */

function Palco({ mx, my, foto }: { mx: MotionValue<number>; my: MotionValue<number>; foto?: Foto }) {
  const fundo = useCamada(mx, my, -10)
  const redoma = useCamada(mx, my, 12)
  const boleira = useCamada(mx, my, 8)
  const mesa = useCamada(mx, my, 20)
  const ar = useCamada(mx, my, 34)
  const sombraX = useTransform(mx, (v) => v * -14)
  // a formiga entra pela mesa e para; enquanto anda, as patas se mexem
  const [formigaAndando, setFormigaAndando] = useState(true)

  return (
    <div className="stage">
      <motion.div className="stage__layer" style={fundo}>
        <motion.div
          className="stage__brush"
          initial={{ opacity: 0, scaleX: 0.4 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 1.4, delay: 0.2, ease: EASE }}
        >
          <Brush />
        </motion.div>
      </motion.div>

      {/* boleira: parte de trás do prato (atrás da redoma) */}
      <motion.div className="stage__layer" style={boleira}>
        <motion.div className="stage__stand" {...entrada(0.35, 40)}>
          <StandBack />
        </motion.div>
      </motion.div>

      {/* redoma */}
      <motion.div className="stage__layer" style={redoma}>
        <motion.div
          className="cloche"
          initial={{ opacity: 0, y: -36, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1.2, delay: 0.5, ease: EASE }}
        >
          <span className="cloche__knob" aria-hidden="true" />
          <div className={`cloche__glass ${foto ? 'has-photo' : ''}`}>
            <AnimatePresence mode="popLayout" initial={false}>
              {foto ? (
                <motion.div
                  key={foto.id}
                  className="cloche__photo"
                  initial={{ opacity: 0, scale: 1.08 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.9, ease: EASE }}
                >
                  <Picture
                    picture={foto.picture}
                    alt={foto.alt}
                    sizes="(max-width: 1023px) 70vw, 380px"
                    priority
                    objectPosition={foto.enquadramento}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="logo"
                  className="cloche__medal"
                  initial={{ opacity: 0, scale: 0.7, rotate: -10 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 90, damping: 14, delay: 0.85 }}
                >
                  <Logo sizes="(max-width: 1023px) 60vw, 340px" priority />
                </motion.div>
              )}
            </AnimatePresence>
            <span className="cloche__shine" aria-hidden="true" />
            <span className="cloche__twinkle cloche__twinkle--1" aria-hidden="true">
              <Sparkle size={14} color="#fff" />
            </span>
            <span className="cloche__twinkle cloche__twinkle--2" aria-hidden="true">
              <Sparkle size={10} color="var(--gold-bright)" />
            </span>
            <span className="cloche__twinkle cloche__twinkle--3" aria-hidden="true">
              <Sparkle size={12} color="#fff" />
            </span>
          </div>
        </motion.div>
      </motion.div>

      {/* boleira: frente do prato, pé e sombra */}
      <motion.div className="stage__layer" style={boleira}>
        <motion.div className="stage__stand" {...entrada(0.35, 40)}>
          <motion.span className="stage__shadow" style={{ x: sombraX }} />
          <StandFront />
        </motion.div>
      </motion.div>

      {/* doces sobre a mesa */}
      <motion.div className="stage__layer" style={mesa} aria-hidden="true">
        {[
          { c: <Brigadeiro size={46} />, cls: 'tb-1', d: 0.95 },
          { c: <Brigadeiro size={36} />, cls: 'tb-2', d: 1.02 },
          { c: <Cherry size={34} />, cls: 'tb-3', d: 1.1 },
          { c: <Strawberry size={38} />, cls: 'tb-4', d: 1.16 },
          { c: <Sprinkle length={16} rotate={24} color="var(--rose)" />, cls: 'tb-5', d: 1.2 },
          { c: <Sprinkle length={14} rotate={-40} color="var(--gold-bright)" />, cls: 'tb-6', d: 1.22 },
          { c: <Sprinkle length={13} rotate={70} color="#6e4642" />, cls: 'tb-7', d: 1.24 },
          { c: <Pearl size={11} tone="gold" />, cls: 'tb-8', d: 1.26 },
          { c: <Pearl size={9} />, cls: 'tb-9', d: 1.28 },
          { c: <Sprinkle length={12} rotate={-12} color="var(--cherry)" />, cls: 'tb-10', d: 1.3 },
        ].map(({ c, cls, d }) => (
          <motion.span
            key={cls}
            className={`stage__item ${cls}`}
            initial={{ opacity: 0, y: -26, scale: 0.6 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 14, delay: d }}
          >
            {c}
          </motion.span>
        ))}
        <motion.span
          className="stage__ant"
          initial={{ x: 150, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{
            x: { duration: 2.6, delay: 1.3, ease: [0.3, 0, 0.3, 1] },
            opacity: { duration: 0.4, delay: 1.3 },
          }}
          onAnimationComplete={() => setFormigaAndando(false)}
        >
          <span className="stage__ant-flip">
            <Ant size={54} walking={formigaAndando} carrying="brigadeiro" speed={0.36} />
          </span>
        </motion.span>
      </motion.div>

      {/* confeitos no ar */}
      <motion.div className="stage__layer" style={ar} aria-hidden="true">
        {[
          { c: <Sparkle size={20} />, cls: 'fl-1', d: 1.2 },
          { c: <Pearl size={14} tone="rose" />, cls: 'fl-2', d: 1.3 },
          { c: <Sprinkle length={18} rotate={-30} color="var(--gold-bright)" />, cls: 'fl-3', d: 1.35 },
          { c: <Heart size={15} />, cls: 'fl-4', d: 1.4 },
          { c: <Pearl size={10} tone="gold" />, cls: 'fl-5', d: 1.45 },
          { c: <Sprinkle length={14} rotate={50} color="var(--rose)" />, cls: 'fl-6', d: 1.5 },
        ].map(({ c, cls, d }) => (
          <motion.span
            key={cls}
            className={`stage__float ${cls}`}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 160, damping: 12, delay: d }}
          >
            <span className="stage__bob">{c}</span>
          </motion.span>
        ))}
      </motion.div>

      <Anotacao />
    </div>
  )
}

function Anotacao() {
  return (
    <div className="stage__note" aria-hidden="true">
      <motion.p
        className="note"
        initial={{ opacity: 0, rotate: -4, y: 8 }}
        animate={{ opacity: 1, rotate: -6, y: 0 }}
        transition={{ duration: 1, delay: 1.35, ease: EASE }}
      >
        feito à mão,
        <br />
        do jeitinho que
        <br />
        você imaginou
      </motion.p>
      <svg className="stage__note-arrow" viewBox="0 0 120 90" fill="none">
        <motion.path
          d="M100 6 C112 40 92 70 34 74 M34 74 L48 62 M34 74 L50 84"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.1, delay: 1.6, ease: EASE }}
        />
      </svg>
    </div>
  )
}

/* Boleira de porcelana com friso dourado: fundo e frente separados para a redoma "assentar" no prato. */
function StandBack() {
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, '')
  return (
    <svg className="stand stand--back" viewBox="0 0 460 170" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={`${id}-top`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#f3dfda" />
          <stop offset="0.45" stopColor="#fffaf8" />
          <stop offset="1" stopColor="#efd6d0" />
        </linearGradient>
      </defs>
      <ellipse cx="230" cy="22" rx="226" ry="20" fill={`url(#${id}-top)`} stroke="#c99a43" strokeWidth="1.6" />
      <ellipse cx="230" cy="22" rx="200" ry="15" fill="none" stroke="#e8cfc8" strokeWidth="1" />
    </svg>
  )
}

function StandFront() {
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, '')
  return (
    <svg className="stand stand--front" viewBox="0 0 460 170" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={`${id}-p`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#e9cbc4" />
          <stop offset="0.38" stopColor="#fffaf8" />
          <stop offset="0.62" stopColor="#f8e7e3" />
          <stop offset="1" stopColor="#dfbcb4" />
        </linearGradient>
        <linearGradient id={`${id}-top`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#f3dfda" />
          <stop offset="0.45" stopColor="#fffaf8" />
          <stop offset="1" stopColor="#efd6d0" />
        </linearGradient>
      </defs>
      {/* metade da frente do tampo */}
      <path d="M4 22 H456 A226 20 0 0 1 4 22 Z" fill={`url(#${id}-top)`} />
      <path d="M60 25 A170 15 0 0 0 400 25" fill="none" stroke="rgba(255,255,255,.9)" strokeWidth="2" />
      <path d="M60 26.5 A170 15 0 0 0 400 26.5" fill="none" stroke="rgba(185,138,46,.45)" strokeWidth="0.8" />
      {/* espessura do prato */}
      <path d="M4 22 A226 20 0 0 0 456 22 L452 31 A222 21 0 0 1 8 31 Z" fill={`url(#${id}-p)`} />
      <path d="M4 22 A226 20 0 0 0 456 22" fill="none" stroke="#c99a43" strokeWidth="1.6" />
      <path d="M8 31 A222 21 0 0 0 452 31" fill="none" stroke="#b98a2e" strokeWidth="1.2" opacity="0.8" />
      {/* coluna */}
      <path d="M196 50 C212 74 220 98 216 130 L244 130 C240 98 248 74 264 50 Z" fill={`url(#${id}-p)`} />
      <path
        d="M206 52 C218 76 224 100 222 128"
        fill="none"
        stroke="rgba(255,255,255,.85)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <ellipse cx="230" cy="78" rx="19" ry="3.6" fill="none" stroke="#c99a43" strokeWidth="1.2" />
      {/* pé */}
      <path d="M166 140 C176 128 200 126 230 126 C260 126 284 128 294 140 Z" fill={`url(#${id}-p)`} />
      <ellipse cx="230" cy="141" rx="66" ry="11" fill={`url(#${id}-p)`} stroke="#c99a43" strokeWidth="1.3" />
      <path d="M170 145 A66 11 0 0 0 290 145" fill="none" stroke="rgba(185,138,46,.5)" strokeWidth="0.8" />
    </svg>
  )
}

/* ------------------------------------------------------------------ */
/* Trilho lateral: troca a foto da redoma ou leva às seções.             */
/* ------------------------------------------------------------------ */

function Trilho({ fotoAtual, setFotoAtual }: { fotoAtual?: Foto; setFotoAtual: (f: Foto) => void }) {
  if (fotos.length >= 2) {
    const lista = fotos.slice(0, 4)
    return (
      <motion.aside className="rail" aria-label="Escolha uma criação para ver na redoma">
        <motion.p className="rail__title" {...entrada(0.6, 0)}>
          Criações
        </motion.p>
        <ul>
          {lista.map((f, i) => {
            const ativo = fotoAtual?.id === f.id
            return (
              <motion.li
                key={f.id}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.9, delay: 0.65 + i * 0.08, ease: EASE }}
              >
                <button
                  type="button"
                  className={`rail__item ${ativo ? 'is-active' : ''}`}
                  aria-pressed={ativo}
                  onClick={() => setFotoAtual(f)}
                >
                  <span className="rail__thumb">
                    <Picture picture={f.picture} alt="" sizes="56px" objectPosition={f.enquadramento} />
                  </span>
                  <span className="rail__label">{rotuloFoto(f)}</span>
                  <span className="rail__arrow" aria-hidden="true">
                    <ArrowRight size={14} strokeWidth={1.8} />
                  </span>
                </button>
              </motion.li>
            )
          })}
        </ul>
      </motion.aside>
    )
  }

  const atalhos = [
    { href: '#mostruario', label: 'Mostruário', icon: <Brigadeiro size={30} /> },
    { href: '#como-funciona', label: 'Como funciona', icon: <Cherry size={28} /> },
    { href: '#localizacao', label: 'Onde estamos', icon: <MapPin size={20} strokeWidth={1.6} /> },
    { href: '#contato', label: 'Monte seu pedido', icon: <WhatsAppIcon size={20} /> },
  ]
  return (
    <motion.aside className="rail" aria-label="Atalhos">
      <motion.p className="rail__title" {...entrada(0.6, 0)}>
        Por onde começar
      </motion.p>
      <ul>
        {atalhos.map((a, i) => (
          <motion.li
            key={a.href}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, delay: 0.65 + i * 0.08, ease: EASE }}
          >
            <a href={a.href} className={`rail__item ${i === 0 ? 'is-active' : ''}`}>
              <span className="rail__thumb rail__thumb--icon">{a.icon}</span>
              <span className="rail__label">{a.label}</span>
              <span className="rail__arrow" aria-hidden="true">
                <ArrowRight size={14} strokeWidth={1.8} />
              </span>
            </a>
          </motion.li>
        ))}
      </ul>
    </motion.aside>
  )
}
