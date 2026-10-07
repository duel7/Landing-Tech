import { motion } from 'motion/react'
import { Quote } from 'lucide-react'
import { MaskLines, Reveal } from '../components/Reveal'
import { depoimentos } from '../content/bolos'
import './depoimentos.css'

/** Só aparece quando houver depoimentos reais em src/content/bolos.ts. */
export function Depoimentos() {
  if (!depoimentos.length) return null
  return (
    <section className="dep" aria-labelledby="dep-titulo">
      <div className="container dep__grid">
        <div>
          <Reveal>
            <p className="eyebrow">Quem já provou</p>
          </Reveal>
          <h2 id="dep-titulo" className="display title-m dep__title">
            <MaskLines lines={['Palavras', <>doces</>]} />
          </h2>
        </div>
        <ul className="dep__list">
          {depoimentos.map((d, i) => (
            <motion.li
              key={d.autor + i}
              className="dep__card"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
            >
              <figure>
                <Quote size={22} strokeWidth={1.3} aria-hidden="true" className="dep__quote" />
                <blockquote>{d.texto}</blockquote>
                <figcaption>
                  <strong>{d.autor}</strong>
                  {d.ocasiao && <span> · {d.ocasiao}</span>}
                </figcaption>
              </figure>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  )
}
