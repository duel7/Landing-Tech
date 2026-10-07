import { motion } from 'motion/react'
import { ArrowRight } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { Brilhos, Paleta, SacoConfeitar } from '../components/Illustrations'
import { EASE, MaskLines, Reveal } from '../components/Reveal'
import { Brigadeiro, Heart } from '../components/Sweets'
import './diferenciais.css'

const itens: { titulo: string; script: string; texto: string; arte: ReactNode }[] = [
  {
    titulo: 'Personalização',
    script: 'do seu jeito',
    texto: 'Tema, cores e acabamentos combinados com você, para o bolo contar a história da sua festa.',
    arte: <Paleta size={58} />,
  },
  {
    titulo: 'Cuidado',
    script: 'nos detalhes',
    texto: 'Atenção a cada detalhe da decoração, um por um, até o bolo ficar do jeito combinado.',
    arte: <SacoConfeitar size={60} />,
  },
  {
    titulo: 'Criatividade',
    script: 'fora da fôrma',
    texto: 'Temas personalizados que ganham forma em cobertura, cor e confeito.',
    arte: <Brilhos size={58} />,
  },
  {
    titulo: 'Carinho',
    script: 'em cada pedaço',
    texto: 'Cada criação é feita para deixar a sua comemoração ainda mais especial.',
    arte: (
      <span className="dif-card__combo">
        <Brigadeiro size={50} />
        <Heart size={18} color="var(--cherry)" />
      </span>
    ),
  },
]

export function Diferenciais() {
  const [ativo, setAtivo] = useState(0)

  return (
    <section id="diferenciais" className="dif dark" aria-labelledby="dif-titulo">
      <svg className="dif__sprig" viewBox="0 0 220 320" aria-hidden="true" focusable="false">
        <g fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round">
          <path d="M30 310 C60 230 70 160 130 80 C150 54 170 36 196 20" />
          <path d="M70 210 C40 196 20 170 18 140 C46 150 64 176 70 210 Z" />
          <path d="M96 150 C120 128 150 124 176 132 C156 154 126 160 96 150 Z" />
          <path d="M120 106 C104 80 104 52 116 30 C134 52 132 82 120 106 Z" />
          <path d="M196 20 C186 36 182 52 186 70" />
          <circle cx="186" cy="80" r="11" />
          <path d="M196 20 C204 40 214 54 210 72" />
          <circle cx="208" cy="82" r="9" />
        </g>
      </svg>

      <div className="container dif__grid">
        <div className="dif__intro">
          <Reveal>
            <p className="eyebrow">O jeito Formiga</p>
          </Reveal>
          <h2 id="dif-titulo" className="display title-l dif__title">
            <MaskLines
              lines={[
                'Cada detalhe',
                <>
                  tem um <em className="script gold-text dif__script">porquê.</em>
                </>,
              ]}
            />
          </h2>
          <Reveal delay={0.2}>
            <p className="lead">É assim que um bolo ganha a cara de quem vai comemorar.</p>
          </Reveal>
        </div>

        <ul className="dif__cards">
          {itens.map((item, i) => {
            const isAtivo = ativo === i
            return (
              <motion.li
                key={item.titulo}
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '0px 0px -10% 0px' }}
                transition={{ duration: 1, delay: 0.1 + i * 0.1, ease: EASE }}
              >
                <button
                  type="button"
                  className={`dif-card ${isAtivo ? 'is-active' : ''}`}
                  onClick={() => setAtivo(i)}
                  onMouseEnter={() => setAtivo(i)}
                  onFocus={() => setAtivo(i)}
                >
                  <span className="dif-card__art">{item.arte}</span>
                  <span className="dif-card__title">{item.titulo}</span>
                  <span className="dif-card__script">{item.script}</span>
                  <span className="dif-card__desc">{item.texto}</span>
                  <span className="dif-card__arrow" aria-hidden="true">
                    <ArrowRight size={14} strokeWidth={1.8} />
                  </span>
                </button>
              </motion.li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
