import { AnimatePresence, motion, useMotionValue, useScroll, useTransform, type MotionValue } from 'motion/react'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Ant } from '../components/Ant'
import { Button } from '../components/Button'
import { Picture } from '../components/Picture'
import { EASE, MaskLines, Reveal } from '../components/Reveal'
import { Brigadeiro, Sparkle } from '../components/Sweets'
import { linkWhatsapp, site } from '../config/site'
import type { Categoria } from '../content/bolos'
import { fotos, rotuloFoto, type Foto } from '../lib/fotos'
import { useDesktop, useIsScrolling, useReducedMotionPref } from '../lib/hooks'
import { Lightbox } from './Lightbox'
import './mostruario.css'

const ALTURAS = [0.9, 0.68, 0.8, 0.62, 0.86, 0.72]
const num = (n: number) => String(n).padStart(2, '0')

export function Mostruario() {
  const desktop = useDesktop()
  const reduzir = useReducedMotionPref()
  const [filtro, setFiltro] = useState<Categoria | 'todas'>('todas')
  const [aberta, setAberta] = useState<number | null>(null)

  const categorias = useMemo(
    () => Array.from(new Set(fotos.map((f) => f.categoria).filter((c): c is Categoria => Boolean(c)))),
    [],
  )
  const lista = filtro === 'todas' ? fotos : fotos.filter((f) => f.categoria === filtro)

  const cabecalho = (
    <Cabecalho
      categorias={categorias}
      filtro={filtro}
      setFiltro={setFiltro}
      total={lista.length}
      vazio={!fotos.length}
    />
  )

  let conteudo: ReactNode
  if (!fotos.length) conteudo = <VitrineVazia cabecalho={cabecalho} />
  else if (desktop && !reduzir && lista.length >= 3)
    conteudo = <TrilhoFixo lista={lista} abrir={setAberta} cabecalho={cabecalho} chave={filtro} />
  else conteudo = <Carrossel lista={lista} abrir={setAberta} cabecalho={cabecalho} />

  return (
    <section id="mostruario" className="vit" aria-labelledby="vit-titulo">
      <div className="scallop" aria-hidden="true" />
      {conteudo}
      <Lightbox fotos={lista} indice={aberta} fechar={() => setAberta(null)} />
    </section>
  )
}

function Cabecalho({
  categorias,
  filtro,
  setFiltro,
  total,
  vazio,
}: {
  categorias: Categoria[]
  filtro: Categoria | 'todas'
  setFiltro: (c: Categoria | 'todas') => void
  total: number
  vazio: boolean
}) {
  return (
    <div className="container vit__head">
      <div className="vit__heading">
        <Reveal>
          <p className="eyebrow">Vitrine da Formiga</p>
        </Reveal>
        <h2 id="vit-titulo" className="display title-l vit__title">
          <MaskLines lines={['Mostruário']} />
        </h2>
        <Reveal delay={0.2} className="vit__note">
          <p className="note">feitos com carinho, um a um</p>
        </Reveal>
      </div>

      {!vazio && (
        <Reveal delay={0.15} className="vit__tools">
          {categorias.length >= 2 && (
            <div className="vit__filters" role="group" aria-label="Filtrar por categoria">
              {(['todas', ...categorias] as const).map((c) => (
                <button key={c} type="button" className="chip" aria-pressed={filtro === c} onClick={() => setFiltro(c)}>
                  {c === 'todas' ? 'Todas' : c}
                </button>
              ))}
            </div>
          )}
          <p className="vit__count">
            <span>{num(total)}</span> {total === 1 ? 'criação' : 'criações'}
            <span className="vit__hint"> · clique para ampliar</span>
          </p>
        </Reveal>
      )}
    </div>
  )
}

/* ---------- item da vitrine ---------- */

function Item({ foto, i, abrir }: { foto: Foto; i: number; abrir: (i: number) => void }) {
  const ar = Math.min(1.45, Math.max(0.62, foto.proporcao))
  const forma = ar < 0.95 ? (i % 3 === 2 ? 'is-oval' : 'is-arch') : 'is-round'
  return (
    <motion.li
      className="vit-item"
      style={{ ['--hf' as string]: ALTURAS[i % ALTURAS.length], ['--ar' as string]: ar }}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.8, delay: (i % 4) * 0.06, ease: EASE }}
    >
      <button
        type="button"
        className="vit-item__btn"
        onClick={() => abrir(i)}
        data-cursor="ver"
        aria-label={`Ampliar foto: ${rotuloFoto(foto)}`}
      >
        <span className={`vit-item__frame ${forma}`}>
          <Picture
            picture={foto.picture}
            alt={foto.alt}
            sizes="(max-width: 1023px) 78vw, 40vw"
            objectPosition={foto.enquadramento}
            draggable={false}
          />
          <span className="vit-item__veil" aria-hidden="true">
            <Sparkle size={16} color="#fff" />
          </span>
        </span>
      </button>
      <span className="vit-item__tag" aria-hidden="true">
        <span className="vit-item__num">nº {num(foto.numero)}</span>
        <span className="vit-item__label">{rotuloFoto(foto)}</span>
      </span>
    </motion.li>
  )
}

function CartaoFinal() {
  return (
    <li className="vit-end">
      <div className="vit-end__card">
        <Brigadeiro size={56} />
        <p className="note">gostou?</p>
        <p className="vit-end__text">Cada bolo é feito sob encomenda, a partir da sua ideia.</p>
        <Button href="#contato" small>
          Montar meu pedido
        </Button>
      </div>
    </li>
  )
}

/* ---------- desktop: a vitrine desliza para o lado enquanto a página rola ---------- */

function TrilhoFixo({
  lista,
  abrir,
  cabecalho,
  chave,
}: {
  lista: Foto[]
  abrir: (i: number) => void
  cabecalho: ReactNode
  chave: string
}) {
  const fora = useRef<HTMLDivElement>(null)
  const trilho = useRef<HTMLUListElement>(null)
  const [distancia, setDistancia] = useState(0)
  const rolando = useIsScrolling()

  useLayoutEffect(() => {
    const el = trilho.current
    if (!el) return
    const medir = () => setDistancia(Math.max(0, el.scrollWidth - window.innerWidth))
    medir()
    const ro = new ResizeObserver(medir)
    ro.observe(el)
    window.addEventListener('resize', medir)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', medir)
    }
  }, [lista])

  const { scrollYProgress } = useScroll({ target: fora, offset: ['start start', 'end end'] })
  const x = useTransform(scrollYProgress, (v) => -v * distancia)

  return (
    <div ref={fora} className="vit-pin" style={{ height: `calc(100svh + ${distancia}px)` }}>
      <div className="vit-pin__sticky">
        {cabecalho}
        <div className="vit-pin__viewport">
          <AnimatePresence mode="popLayout">
            <motion.ul key={chave} ref={trilho} className="vit-track" style={{ x }}>
              {lista.map((f, i) => (
                <Item key={f.id} foto={f} i={i} abrir={abrir} />
              ))}
              <CartaoFinal />
            </motion.ul>
          </AnimatePresence>
          <Prateleira progresso={scrollYProgress} andando={rolando} />
        </div>
      </div>
    </div>
  )
}

/* ---------- celular e tablet: carrossel de deslizar ---------- */

function Carrossel({ lista, abrir, cabecalho }: { lista: Foto[]; abrir: (i: number) => void; cabecalho: ReactNode }) {
  const ref = useRef<HTMLUListElement>(null)
  const progresso = useMotionValue(0)
  const [andando, setAndando] = useState(false)
  const timer = useRef(0)

  const onScroll = () => {
    const el = ref.current
    if (!el) return
    const max = el.scrollWidth - el.clientWidth
    progresso.set(max > 0 ? el.scrollLeft / max : 0)
    setAndando(true)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setAndando(false), 160)
  }

  const passo = (dir: number) => {
    const el = ref.current
    if (!el) return
    const item = el.querySelector<HTMLElement>('.vit-item')
    el.scrollBy({ left: dir * ((item?.offsetWidth ?? 280) + 16), behavior: 'smooth' })
  }

  return (
    <div className="vit-car">
      {cabecalho}
      <div className="vit-car__viewport">
        <ul ref={ref} className="vit-track vit-track--scroll" onScroll={onScroll}>
          {lista.map((f, i) => (
            <Item key={f.id} foto={f} i={i} abrir={abrir} />
          ))}
          <CartaoFinal />
        </ul>
        <Prateleira progresso={progresso} andando={andando} />
      </div>
      <div className="container vit-car__controls">
        <button type="button" className="round-btn" onClick={() => passo(-1)} aria-label="Ver criações anteriores">
          <ArrowLeft size={18} strokeWidth={1.5} />
        </button>
        <button type="button" className="round-btn" onClick={() => passo(1)} aria-label="Ver próximas criações">
          <ArrowRight size={18} strokeWidth={1.5} />
        </button>
      </div>
    </div>
  )
}

/** Prateleira de vidro com friso dourado; a formiga atravessa conforme o progresso. */
function Prateleira({ progresso, andando }: { progresso: MotionValue<number>; andando: boolean }) {
  const left = useTransform(progresso, (v) => `calc(${v} * (100% - 56px))`)
  return (
    <div className="shelf" aria-hidden="true">
      <motion.span className="shelf__ant" style={{ left }}>
        <Ant size={46} walking={andando} carrying="brigadeiro" />
      </motion.span>
    </div>
  )
}

/* ---------- ainda sem fotos ---------- */

function VitrineVazia({ cabecalho }: { cabecalho: ReactNode }) {
  return (
    <div className="vit-empty">
      {cabecalho}
      <div className="container">
        <div className="vit-empty__case">
          <div className="vit-empty__domes" aria-hidden="true">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="vit-empty__dome"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: 0.15 * i, ease: EASE }}
              >
                <span className="vit-empty__knob" />
              </motion.span>
            ))}
          </div>
          <div className="shelf shelf--static" aria-hidden="true">
            <span className="shelf__ant shelf__ant--loop">
              <Ant size={46} walking carrying="brigadeiro" />
            </span>
          </div>
          <Reveal className="vit-empty__text" delay={0.2}>
            <p className="note">a vitrine está sendo arrumada</p>
            <p>
              Em breve, as criações da Formiga Gulosa aparecem aqui. Enquanto isso, peça pelo WhatsApp fotos de bolos
              que já saíram da nossa cozinha.
            </p>
            <Button
              href={linkWhatsapp(
                `Olá! Vi o site da ${site.nome} e gostaria de ver fotos de bolos que vocês já fizeram.`,
              )}
              external
              icon="whatsapp"
            >
              Pedir fotos pelo WhatsApp
            </Button>
          </Reveal>
        </div>
      </div>
    </div>
  )
}
