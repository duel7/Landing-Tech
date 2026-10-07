import { motion, useScroll, useTransform, type MotionValue } from 'motion/react'
import { CakeSlice, HandHeart, Palette } from 'lucide-react'
import { useRef, useState } from 'react'
import { Ant } from '../components/Ant'
import { Button } from '../components/Button'
import { Drip } from '../components/Dividers'
import { Picture } from '../components/Picture'
import { MaskLines, Reveal } from '../components/Reveal'
import { Brigadeiro, Pearl, Sprinkle } from '../components/Sweets'
import { linkWhatsapp } from '../config/site'
import { fotoDestaque, fotos, type Foto } from '../lib/fotos'
import { useFinePointer } from '../lib/hooks'
import './sobre.css'

// Para a seção Sobre, uma foto diferente da que está na abertura.
const fotoSobre = fotos.find((f) => f.id !== fotoDestaque?.id)

const diferenciais = [
  { icon: HandHeart, titulo: 'Feito à mão', texto: 'Decoração artesanal, detalhe por detalhe' },
  { icon: Palette, titulo: 'Personalizado', texto: 'Tema, cores e acabamentos combinados' },
  { icon: CakeSlice, titulo: 'Bolos e doces', texto: 'Para a mesa da sua festa' },
]

export function Sobre() {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const marcaX = useTransform(scrollYProgress, [0, 1], ['6%', '-22%'])
  const giro = useTransform(scrollYProgress, [0.1, 0.9], [-40, 220])

  return (
    <section ref={ref} id="sobre" className="sobre grain" aria-labelledby="sobre-titulo">
      <Drip />
      <motion.span className="sobre__mark" style={{ x: marcaX }} aria-hidden="true">
        Artesanal
      </motion.span>

      <div className="container sobre__grid">
        <Reveal className="sobre__visual" y={50}>
          {fotoSobre ? <PratoFoto foto={fotoSobre} /> : <Bandeja giro={giro} />}
        </Reveal>

        <div className="sobre__content">
          <Reveal>
            <p className="eyebrow">Sobre a Formiga Gulosa</p>
          </Reveal>
          <h2 id="sobre-titulo" className="display title-m sobre__title">
            <MaskLines lines={['Confeitaria', 'artesanal']} />
          </h2>
          <Reveal delay={0.15}>
            <p className="sobre__tagline">Personalizada. Feita à mão. Do jeito da sua festa.</p>
          </Reveal>
          <Reveal delay={0.25}>
            <p className="sobre__text">
              A Formiga Gulosa é uma confeitaria artesanal de Itabuna, dedicada a bolos personalizados e doces. Cada
              encomenda começa com uma conversa — a ocasião, o tema, as cores — e o bolo é pensado a partir daí.
            </p>
            <p className="sobre__text">
              A decoração é feita à mão, detalhe por detalhe, para que o bolo chegue à mesa com a cara de quem vai
              comemorar.
            </p>
          </Reveal>
          <Reveal delay={0.35}>
            <Button href={linkWhatsapp()} external icon="whatsapp" className="sobre__cta">
              Conversar sobre o meu bolo
            </Button>
          </Reveal>
        </div>

        <ul className="sobre__features">
          {diferenciais.map(({ icon: Icon, titulo, texto }, i) => (
            <motion.li
              key={titulo}
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '0px 0px -10% 0px' }}
              transition={{ duration: 0.9, delay: 0.2 + i * 0.12, ease: [0.22, 1, 0.36, 1] }}
            >
              <span className="sobre__icon" aria-hidden="true">
                <Icon size={22} strokeWidth={1.3} />
              </span>
              <span>
                <strong>{titulo}</strong>
                <span>{texto}</span>
              </span>
            </motion.li>
          ))}
        </ul>
      </div>

      <svg className="sobre__cherries" viewBox="0 0 200 180" aria-hidden="true" focusable="false">
        <g fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round">
          <motion.path
            d="M40 170 C70 120 96 80 150 40 M150 40 C120 60 104 92 100 128 M150 40 C150 72 140 100 128 126"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 2, ease: 'easeInOut' }}
          />
          <motion.path
            d="M150 40 C166 22 186 18 196 24 C186 36 168 42 150 40 Z"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, delay: 1, ease: 'easeInOut' }}
          />
        </g>
        <circle cx="96" cy="140" r="13" fill="currentColor" opacity="0.18" />
        <circle cx="126" cy="138" r="12" fill="currentColor" opacity="0.18" />
      </svg>
    </section>
  )
}

/* Foto real num prato de porcelana, com lupa para ver os detalhes. */
function PratoFoto({ foto }: { foto: Foto }) {
  const fino = useFinePointer()
  const [lupa, setLupa] = useState<{ x: number; y: number; w: number; h: number } | null>(null)

  return (
    <figure className="prato">
      <div
        className="prato__frame"
        onPointerMove={(e) => {
          if (!fino) return
          const r = e.currentTarget.getBoundingClientRect()
          setLupa({ x: e.clientX - r.left, y: e.clientY - r.top, w: r.width, h: r.height })
        }}
        onPointerLeave={() => setLupa(null)}
        data-cursor={fino ? 'lupa' : undefined}
      >
        <Picture
          picture={foto.picture}
          alt={foto.alt}
          sizes="(max-width: 1023px) 80vw, 480px"
          objectPosition={foto.enquadramento}
        />
        {lupa && <Lupa foto={foto} {...lupa} />}
      </div>
      <figcaption className="note prato__note">
        {fino ? 'passe o mouse e veja os detalhes' : 'feito à mão, detalhe por detalhe'}
      </figcaption>
    </figure>
  )
}

const LENTE = 170
const ZOOM = 2.4

/** Lente circular que amplia o ponto da foto sob o mouse (a foto está em object-fit: cover). */
function Lupa({ foto, x, y, w, h }: { foto: Foto; x: number; y: number; w: number; h: number }) {
  const escala = Math.max(w / foto.proporcao, h) // altura exibida quando a largura natural = proporção
  const dw = escala * foto.proporcao
  const dh = escala
  const ox = (w - dw) / 2
  const oy = (h - dh) / 2
  return (
    <span
      className="prato__lupa"
      aria-hidden="true"
      style={{
        left: x,
        top: y,
        width: LENTE,
        height: LENTE,
        backgroundImage: `url(${foto.picture.img.src})`,
        backgroundSize: `${dw * ZOOM}px ${dh * ZOOM}px`,
        backgroundPosition: `${-((x - ox) * ZOOM - LENTE / 2)}px ${-((y - oy) * ZOOM - LENTE / 2)}px`,
      }}
    />
  )
}

/* Sem fotos ainda: uma bandeja de docinhos que gira com a rolagem (como um prato giratório). */
function Bandeja({ giro }: { giro: MotionValue<number> }) {
  const rot = useTransform(giro, (v) => `${v}deg`)
  const docinhos = Array.from({ length: 8 }, (_, i) => i)
  const confeitos = [
    [32, 22, 30, 'var(--rose)'],
    [70, 30, -20, 'var(--gold-bright)'],
    [76, 70, 60, '#6e4642'],
    [26, 74, -50, 'var(--gold-bright)'],
    [50, 12, 80, 'var(--cherry)'],
    [86, 48, 10, 'var(--rose)'],
    [14, 46, 40, '#6e4642'],
    [52, 88, -30, 'var(--rose)'],
  ] as const

  return (
    <div className="tray">
      <div className="tray__scene">
        <motion.div className="tray__plate" style={{ ['--rot' as string]: rot }}>
          <svg className="tray__doily" viewBox="0 0 400 400" aria-hidden="true" focusable="false">
            <path d={rendinha(200, 200, 196, 182, 40)} fill="#fffaf8" stroke="#ead3cd" strokeWidth="1.2" />
            {Array.from({ length: 40 }, (_, i) => {
              const a = (i / 40) * Math.PI * 2
              return <circle key={i} cx={200 + Math.cos(a) * 172} cy={200 + Math.sin(a) * 172} r="3.2" fill="#f1ded9" />
            })}
            <circle cx="200" cy="200" r="158" fill="none" stroke="#efdcd7" strokeWidth="1" strokeDasharray="2 5" />
            <circle cx="200" cy="200" r="146" fill="#fbf0ec" stroke="#c99a43" strokeWidth="1.6" />
            <circle cx="200" cy="200" r="140" fill="none" stroke="#e8cfc8" strokeWidth="1" />
          </svg>
          <div className="tray__sprinkles" aria-hidden="true">
            {confeitos.map(([x, y, r, c], i) => (
              <span key={i} style={{ left: `${x}%`, top: `${y}%` }}>
                <Sprinkle length={14} rotate={r} color={c} />
              </span>
            ))}
            <span style={{ left: '62%', top: '20%' }}>
              <Pearl size={9} tone="gold" />
            </span>
            <span style={{ left: '22%', top: '60%' }}>
              <Pearl size={8} />
            </span>
          </div>
          {docinhos.map((i) => (
            <span key={i} className="tray__item" style={{ ['--a' as string]: `${i * 45}deg` }}>
              <span className="tray__bill">
                <Brigadeiro size={58} />
              </span>
            </span>
          ))}
          <span className="tray__item tray__item--center">
            <span className="tray__bill">
              <Ant size={74} carrying="coracao" />
            </span>
          </span>
        </motion.div>
      </div>
      <p className="tray__hint" aria-hidden="true">
        <span className="tray__hint-arrow">⟲</span> role para girar <span className="tray__hint-arrow">⟳</span>
      </p>
    </div>
  )
}

/** Contorno recortado de toalhinha de renda (círculo com ondinhas). */
function rendinha(cx: number, cy: number, rFora: number, rDentro: number, n: number) {
  let d = ''
  for (let i = 0; i <= n; i++) {
    const a0 = (i / n) * Math.PI * 2
    const a1 = ((i + 0.5) / n) * Math.PI * 2
    const a2 = ((i + 1) / n) * Math.PI * 2
    const p0 = [cx + Math.cos(a0) * rDentro, cy + Math.sin(a0) * rDentro]
    const c = [cx + Math.cos(a1) * (rFora + 6), cy + Math.sin(a1) * (rFora + 6)]
    const p2 = [cx + Math.cos(a2) * rDentro, cy + Math.sin(a2) * rDentro]
    d += i === 0 ? `M${p0[0].toFixed(1)} ${p0[1].toFixed(1)}` : ''
    if (i < n) d += ` Q${c[0].toFixed(1)} ${c[1].toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`
  }
  return d + ' Z'
}
