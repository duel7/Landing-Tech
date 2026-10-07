import { AnimatePresence, motion } from 'motion/react'
import { Check, Copy } from 'lucide-react'
import { useState } from 'react'
import { Button } from '../components/Button'
import { Drip } from '../components/Dividers'
import { MaskLines, Reveal } from '../components/Reveal'
import { Brigadeiro } from '../components/Sweets'
import { enderecoCompleto, links, site } from '../config/site'
import './localizacao.css'

export function Localizacao() {
  const [copiado, setCopiado] = useState(false)

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(enderecoCompleto)
      setCopiado(true)
      window.setTimeout(() => setCopiado(false), 2400)
    } catch {
      window.prompt('Copie o endereço:', enderecoCompleto)
    }
  }

  const { endereco } = site
  const dados = [
    ['Endereço', endereco.rua],
    ['Bairro', endereco.bairro],
    ['CEP', endereco.cep],
    ['Cidade', endereco.cidade],
    ['Estado', endereco.estado],
    ...(site.horario ? [['Horário', site.horario]] : []),
  ]

  return (
    <section id="localizacao" className="loc grain" aria-labelledby="loc-titulo">
      <Drip />
      <div className="container loc__grid">
        <div className="loc__info">
          <Reveal>
            <p className="eyebrow">Localização</p>
          </Reveal>
          <h2 id="loc-titulo" className="display title-m loc__title">
            <MaskLines
              lines={[
                'O formigueiro',
                <>
                  fica <em className="script gold-text loc__script">aqui.</em>
                </>,
              ]}
            />
          </h2>
          <Reveal delay={0.15}>
            <p className="lead">
              A Formiga Gulosa fica em Itabuna, no bairro Góes Calmon. Para combinar a sua encomenda, chame no WhatsApp.
            </p>
          </Reveal>

          <Reveal delay={0.25}>
            <address className="loc__address">
              <dl>
                {dados.map(([rotulo, valor]) => (
                  <div key={rotulo}>
                    <dt>{rotulo}</dt>
                    <dd>{valor}</dd>
                  </div>
                ))}
              </dl>
            </address>
          </Reveal>

          <Reveal delay={0.35} className="loc__actions">
            <Button href={links.comoChegar} external icon="external">
              Como chegar
            </Button>
            <button type="button" className="btn btn--ghost" onClick={copiar}>
              <span aria-live="polite">{copiado ? 'Endereço copiado' : 'Copiar endereço'}</span>
              <span className="btn__icon">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={copiado ? 'ok' : 'copiar'}
                    initial={{ scale: 0.4, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.4, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    style={{ display: 'grid' }}
                  >
                    {copiado ? <Check size={14} strokeWidth={2} /> : <Copy size={14} strokeWidth={1.7} />}
                  </motion.span>
                </AnimatePresence>
              </span>
            </button>
          </Reveal>
        </div>

        <Reveal className="loc__map" y={60} delay={0.1}>
          <div className="loc__frame">
            <iframe
              title={`Mapa: ${site.nome}, ${enderecoCompleto}`}
              src={links.mapaEmbed}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
          <a
            className="loc__badge"
            href={links.mapa}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Abrir no Google Maps (abre em nova aba)"
          >
            <svg viewBox="0 0 120 120" className="loc__badge-ring" aria-hidden="true" focusable="false">
              <defs>
                <path id="loc-circulo" d="M60 60 m-44 0 a44 44 0 1 1 88 0 a44 44 0 1 1 -88 0" />
              </defs>
              <text>
                <textPath href="#loc-circulo" startOffset="0">
                  Itabuna · Bahia · Góes Calmon ·
                </textPath>
              </text>
            </svg>
            <span className="loc__badge-center">
              <Brigadeiro size={40} />
            </span>
          </a>
        </Reveal>
      </div>
    </section>
  )
}
