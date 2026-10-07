import { motion, useScroll, useTransform } from 'motion/react'
import { useMemo, useRef, useState, type ReactNode } from 'react'
import { Ant } from '../components/Ant'
import { Button } from '../components/Button'
import { Magnetic, Parallax, usePorcentagem, useTilt } from '../components/Motion'
import { Picture } from '../components/Picture'
import { BoloRecortado, RedomaFrente, RedomaFundo } from '../components/Redoma'
import { EASE, MaskLines, Reveal } from '../components/Reveal'
import { Brigadeiro } from '../components/Sweets'
import { linkWhatsapp, site } from '../config/site'
import type { Categoria } from '../content/bolos'
import { fotos, rotuloFoto, type Foto } from '../lib/fotos'
import { useIsScrolling, useMediaQuery } from '../lib/hooks'
import { Lightbox } from './Lightbox'
import './mostruario.css'

const num = (n: number) => String(n).padStart(2, '0')
/** Filtros só fazem sentido com uma vitrine maior. */
const MINIMO_PARA_FILTROS = 8

export function Mostruario() {
  const [filtro, setFiltro] = useState<Categoria | 'todas'>('todas')
  const [aberta, setAberta] = useState<number | null>(null)

  const categorias = useMemo(
    () => Array.from(new Set(fotos.map((f) => f.categoria).filter((c): c is Categoria => Boolean(c)))),
    [],
  )
  const lista = filtro === 'todas' ? fotos : fotos.filter((f) => f.categoria === filtro)

  return (
    <section id="mostruario" className="vit" aria-labelledby="vit-titulo">
      <div className="scallop" aria-hidden="true" />
      <Cabecalho
        categorias={fotos.length >= MINIMO_PARA_FILTROS ? categorias : []}
        filtro={filtro}
        setFiltro={setFiltro}
        total={lista.length}
        vazio={!fotos.length}
      />
      {fotos.length ? <Vitrine lista={lista} abrir={setAberta} /> : <VitrineVazia />}
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
    <Parallax speed={26} fadeOut className="container vit__head">
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
            <span className="vit__hint"> · toque para ver de perto</span>
          </p>
        </Reveal>
      )}
    </Parallax>
  )
}

/* ---------- a vitrine: redomas de vidro em prateleiras ---------- */

function Vitrine({ lista, abrir }: { lista: Foto[]; abrir: (i: number) => void }) {
  const celular = useMediaQuery('(max-width: 767px)')
  const colunas = celular ? 2 : 3
  const ref = useRef<HTMLDivElement>(null)
  const rolando = useIsScrolling()
  // a formiga atravessa a primeira prateleira enquanto a vitrine passa pela tela
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.85', 'end 0.35'] })
  const formigaX = useTransform(scrollYProgress, (v) => `calc(${Math.min(1, Math.max(0, v))} * (100% - 56px))`)

  // monta as prateleiras; o convite "gostou?" ocupa a última vaga livre
  const itens: (Foto | 'convite')[] = [...lista, 'convite']
  const prateleiras: (Foto | 'convite')[][] = []
  for (let i = 0; i < itens.length; i += colunas) prateleiras.push(itens.slice(i, i + colunas))

  return (
    <div ref={ref} className="container vit-case" style={{ ['--colunas' as string]: colunas }}>
      {prateleiras.map((linha, p) => (
        <Parallax key={`${colunas}-${p}`} speed={p % 2 ? 22 : 10} className="vit-shelf">
          <ul className="vit-shelf__itens">
            {linha.map((item, k) =>
              item === 'convite' ? (
                <Convite key="convite" />
              ) : (
                <Redomita key={item.id} foto={item} ordem={k} abrir={() => abrir(lista.indexOf(item))} />
              ),
            )}
          </ul>
          <motion.div
            className="shelf"
            aria-hidden="true"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, margin: '0px 0px -10% 0px' }}
            transition={{ duration: 1.3, ease: EASE }}
          >
            {p === 0 && (
              <motion.span className="shelf__ant" style={{ left: formigaX }}>
                <Ant size={42} walking={rolando} carrying="brigadeiro" />
              </motion.span>
            )}
          </motion.div>
        </Parallax>
      ))}
    </div>
  )
}

/** Uma redoma da vitrine: o bolo sobe para a prateleira e o vidro desce sobre ele. */
function Redomita({ foto, ordem, abrir }: { foto: Foto; ordem: number; abrir: () => void }) {
  const tilt = useTilt(7)
  const luzX = usePorcentagem(tilt.luzX)
  const luzY = usePorcentagem(tilt.luzY)
  const largo = (foto.recorteProporcao ?? foto.proporcao) > 1.15
  const atraso = ordem * 0.14

  return (
    <motion.li
      className={`vit-dome ${largo ? 'is-largo' : ''}`}
      initial="oculto"
      whileInView="visivel"
      viewport={{ once: true, amount: 0.35 }}
    >
      <motion.button
        type="button"
        className="vit-dome__btn"
        onClick={abrir}
        data-cursor="ver"
        aria-label={`Ver de perto: ${rotuloFoto(foto)}`}
        style={tilt.ativo ? { rotateX: tilt.rotateX, rotateY: tilt.rotateY } : undefined}
        {...tilt.handlers}
      >
        {foto.recorte ? (
          <span className="vit-dome__area">
            <motion.span
              className="vit-dome__camada"
              variants={{ oculto: { opacity: 0, y: -46 }, visivel: { opacity: 1, y: 0 } }}
              transition={{ duration: 1.1, delay: atraso + 0.35, ease: EASE }}
            >
              <RedomaFundo />
            </motion.span>
            <span className="redoma-palco vit-dome__palco">
              <motion.span
                className="vit-dome__camada"
                variants={{ oculto: { opacity: 0, y: 36 }, visivel: { opacity: 1, y: 0 } }}
                transition={{ duration: 0.95, delay: atraso, ease: EASE }}
              >
                <BoloRecortado foto={foto} sizes="(max-width: 767px) 44vw, (max-width: 1100px) 28vw, 330px" />
              </motion.span>
            </span>
            <motion.span
              className="vit-dome__camada"
              variants={{ oculto: { opacity: 0, y: -46 }, visivel: { opacity: 1, y: 0 } }}
              transition={{ duration: 1.1, delay: atraso + 0.35, ease: EASE }}
            >
              <RedomaFrente brilhos={false}>
                <motion.span className="vit-dome__luz" style={{ left: luzX, top: luzY }} />
              </RedomaFrente>
            </motion.span>
          </span>
        ) : (
          <span className="vit-dome__foto">
            <Picture
              picture={foto.picture}
              alt={foto.alt}
              sizes="(max-width: 767px) 44vw, 330px"
              objectPosition={foto.enquadramento}
            />
          </span>
        )}
      </motion.button>
      <span className="vit-tag" aria-hidden="true">
        <span className="vit-tag__num">nº {num(foto.numero)}</span>
        <span className="vit-tag__label">{rotuloFoto(foto)}</span>
      </span>
    </motion.li>
  )
}

function Convite() {
  return (
    <motion.li
      className="vit-end"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 1, delay: 0.3, ease: EASE }}
    >
      <div className="vit-end__card">
        <Brigadeiro size={52} />
        <p className="note">gostou?</p>
        <p className="vit-end__text">Cada bolo é feito sob encomenda, a partir da sua ideia.</p>
        <Magnetic>
          <Button href="#contato" small>
            Montar meu pedido
          </Button>
        </Magnetic>
      </div>
    </motion.li>
  )
}

/* ---------- ainda sem fotos ---------- */

function VitrineVazia(): ReactNode {
  return (
    <div className="vit-empty">
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
