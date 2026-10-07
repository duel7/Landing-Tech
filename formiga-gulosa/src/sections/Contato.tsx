import { AnimatePresence, motion } from 'motion/react'
import { ArrowUpRight, MapPin, Phone } from 'lucide-react'
import { useId, useMemo, useState, type ReactNode } from 'react'
import { Parallax, useTilt } from '../components/Motion'
import { MaskLines, Reveal } from '../components/Reveal'
import { InstagramIcon, Sparkle, WhatsAppIcon } from '../components/Sweets'
import { linkWhatsapp, links, site } from '../config/site'
import './contato.css'

const OCASIOES = ['Aniversário', 'Chá de bebê', 'Chá revelação', 'Batizado', 'Casamento', 'Outra comemoração']

function formatarData(iso: string) {
  const [a, m, d] = iso.split('-')
  return a && m && d ? `${d}/${m}/${a}` : ''
}

function hojeISO() {
  const h = new Date()
  const p = (n: number) => String(n).padStart(2, '0')
  return `${h.getFullYear()}-${p(h.getMonth() + 1)}-${p(h.getDate())}`
}

export function Contato() {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '')
  const [ocasiao, setOcasiao] = useState('')
  const [data, setData] = useState('')
  const [convidados, setConvidados] = useState(30)
  const [mexeuConvidados, setMexeuConvidados] = useState(false)
  const [ideia, setIdeia] = useState('')
  const [nome, setNome] = useState('')

  const camadas = [Boolean(ocasiao), Boolean(data), mexeuConvidados, ideia.trim().length > 2]
  const completas = camadas.filter(Boolean).length

  const mensagem = useMemo(() => {
    const linhas: string[] = [site.whatsapp.mensagem]
    const itens: string[] = []
    if (ocasiao) itens.push(`• Ocasião: ${ocasiao}`)
    if (data) itens.push(`• Data da festa: ${formatarData(data)}`)
    if (mexeuConvidados) itens.push(`• Convidados: cerca de ${convidados}${convidados >= 200 ? ' ou mais' : ''}`)
    if (ideia.trim()) itens.push(`• Tema e ideia: ${ideia.trim()}`)
    if (itens.length) linhas.push('', 'Sobre a minha festa:', ...itens)
    if (nome.trim()) linhas.push('', `Meu nome é ${nome.trim()}.`)
    return linhas.join('\n')
  }, [ocasiao, data, convidados, mexeuConvidados, ideia, nome])

  return (
    <section id="contato" className="ped" aria-labelledby="ped-titulo" data-esconde-flutuante>
      <div className="scallop" aria-hidden="true" />

      <div className="container ped__grid">
        <div className="ped__side">
          <div className="ped__head">
            <Reveal>
              <p className="eyebrow">Contato</p>
            </Reveal>
            <h2 id="ped-titulo" className="display title-l ped__title">
              <MaskLines
                lines={[
                  'Monte o seu',
                  <>
                    pedido <em className="script gold-text ped__script">aqui</em>
                  </>,
                ]}
              />
            </h2>
            <Reveal delay={0.15}>
              <p className="lead">
                Preencha o que já souber: a mensagem fica pronta para enviar pelo WhatsApp. Nada é enviado antes de você
                tocar no botão.
              </p>
            </Reveal>
          </div>
          <Parallax speed={18} className="ped__cake">
            <Fatia camadas={camadas} />
            <p className="ped__progress" aria-live="polite">
              {completas === 4 ? (
                <span className="note">a cereja do bolo!</span>
              ) : (
                <>
                  <strong>{completas}</strong> de 4 camadas
                </>
              )}
            </p>
          </Parallax>
        </div>

        <form className="ped__form" onSubmit={(e) => e.preventDefault()} aria-describedby={`${uid}-ajuda`}>
          <p id={`${uid}-ajuda`} className="sr-only">
            Todos os campos são opcionais. A mensagem é montada abaixo e enviada pelo WhatsApp.
          </p>

          <fieldset className={`ped-field ${camadas[0] ? 'is-done' : ''}`}>
            <legend>
              <span className="ped-field__num">01</span> Qual é a ocasião?
            </legend>
            <div className="ped-chips">
              {OCASIOES.map((o) => (
                <label key={o} className="ped-chip">
                  <input
                    type="radio"
                    name={`${uid}-ocasiao`}
                    value={o}
                    checked={ocasiao === o}
                    onChange={() => setOcasiao(o)}
                    onClick={() => ocasiao === o && setOcasiao('')}
                  />
                  <span>{o}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="ped-row">
            <div className={`ped-field ${camadas[1] ? 'is-done' : ''}`}>
              <label htmlFor={`${uid}-data`} className="ped-field__label">
                <span className="ped-field__num">02</span> Data da festa
              </label>
              <input
                id={`${uid}-data`}
                type="date"
                className="ped-input"
                min={hojeISO()}
                value={data}
                onChange={(e) => setData(e.target.value)}
              />
            </div>

            <div className={`ped-field ${camadas[2] ? 'is-done' : ''}`}>
              <label htmlFor={`${uid}-conv`} className="ped-field__label">
                <span className="ped-field__num">03</span> Convidados
              </label>
              <div className="ped-range">
                <input
                  id={`${uid}-conv`}
                  type="range"
                  min={10}
                  max={200}
                  step={5}
                  value={convidados}
                  onChange={(e) => {
                    setConvidados(Number(e.target.value))
                    setMexeuConvidados(true)
                  }}
                  aria-valuetext={mexeuConvidados ? `cerca de ${convidados} pessoas` : 'ainda não informado'}
                  style={{ ['--p' as string]: `${((convidados - 10) / 190) * 100}%` }}
                />
                <output htmlFor={`${uid}-conv`} className="ped-range__out">
                  {mexeuConvidados ? (
                    <>
                      cerca de <strong>{convidados}</strong>
                      {convidados >= 200 ? '+' : ''} pessoas
                    </>
                  ) : (
                    'arraste para escolher'
                  )}
                </output>
              </div>
            </div>
          </div>

          <div className={`ped-field ${camadas[3] ? 'is-done' : ''}`}>
            <label htmlFor={`${uid}-ideia`} className="ped-field__label">
              <span className="ped-field__num">04</span> Tema e ideia
            </label>
            <textarea
              id={`${uid}-ideia`}
              className="ped-input ped-input--area"
              rows={3}
              maxLength={400}
              placeholder="Ex.: tema jardim, tons de rosa e dourado, nome da aniversariante…"
              value={ideia}
              onChange={(e) => setIdeia(e.target.value)}
            />
          </div>

          <div className="ped-field">
            <label htmlFor={`${uid}-nome`} className="ped-field__label">
              Seu nome <span className="ped-field__opt">(opcional)</span>
            </label>
            <input
              id={`${uid}-nome`}
              type="text"
              className="ped-input"
              autoComplete="given-name"
              maxLength={60}
              placeholder="Como podemos te chamar?"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />
          </div>

          <div className="ped-note">
            <p className="ped-note__title">Sua mensagem</p>
            <p className="ped-note__text">{mensagem}</p>
            <a
              className="btn btn--gold ped-note__send"
              href={linkWhatsapp(mensagem)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span>Enviar pelo WhatsApp</span>
              <span className="btn__icon">
                <WhatsAppIcon size={15} />
              </span>
              <span className="sr-only"> (abre o WhatsApp com a mensagem pronta)</span>
            </a>
          </div>
        </form>
      </div>

      <div className="container">
        <ul className="ped-contacts">
          {[
            {
              href: linkWhatsapp(),
              externo: true,
              icon: <WhatsAppIcon size={22} />,
              rotulo: 'WhatsApp',
              valor: site.whatsapp.exibicao,
              acao: 'Conversar agora',
            },
            {
              href: links.telefone,
              externo: false,
              icon: <Phone size={21} strokeWidth={1.5} />,
              rotulo: 'Telefone',
              valor: site.telefone.exibicao,
              acao: 'Ligar',
            },
            {
              href: site.instagram.link,
              externo: true,
              icon: <InstagramIcon size={21} />,
              rotulo: 'Instagram',
              valor: site.instagram.usuario,
              acao: 'Ver o perfil',
              tipo: 'insta',
            },
            {
              href: links.comoChegar,
              externo: true,
              icon: <MapPin size={21} strokeWidth={1.5} />,
              rotulo: 'Endereço',
              valor: `${site.endereco.rua} · ${site.endereco.bairro}`,
              acao: 'Como chegar',
            },
          ].map((c, i) => (
            <motion.li
              key={c.rotulo}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '0px 0px -8% 0px' }}
              transition={{ duration: 0.8, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
            >
              <CartaoContato {...c} />
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  )
}

/** Cartão de contato: inclina de leve com o cursor. */
function CartaoContato({
  href,
  externo,
  icon,
  rotulo,
  valor,
  acao,
  tipo,
}: {
  href: string
  externo: boolean
  icon: ReactNode
  rotulo: string
  valor: string
  acao: string
  tipo?: string
}) {
  const tilt = useTilt(5)
  return (
    <motion.a
      className={`ped-contact ${tipo ? `ped-contact--${tipo}` : ''}`}
      href={href}
      target={externo ? '_blank' : undefined}
      rel={externo ? 'noopener noreferrer' : undefined}
      style={tilt.ativo ? { rotateX: tilt.rotateX, rotateY: tilt.rotateY } : undefined}
      {...tilt.handlers}
    >
      <span className="ped-contact__icon">{icon}</span>
      <span className="ped-contact__body">
        <span className="ped-contact__label">{rotulo}</span>
        <span className="ped-contact__value">{valor}</span>
      </span>
      <span className="ped-contact__cta">
        {acao} <ArrowUpRight size={14} strokeWidth={1.8} aria-hidden="true" />
      </span>
      {externo && <span className="sr-only"> (abre em nova aba)</span>}
    </motion.a>
  )
}

/* ---------- fatia de bolo: cada campo preenchido vira uma camada ---------- */

const CAMADAS = [
  { y: 296, h: 70, cor: '#efd8c2', nome: 'Ocasião' },
  { y: 278, h: 18, cor: '#e6abaa', nome: 'Data' },
  { y: 210, h: 68, cor: '#6e4642', nome: 'Convidados' },
  { y: 184, h: 26, cor: '#f8e6e1', nome: 'Tema' },
]

function Fatia({ camadas }: { camadas: boolean[] }) {
  const todas = camadas.every(Boolean)
  return (
    <svg
      className="fatia"
      viewBox="0 0 400 420"
      role="img"
      aria-label={`Fatia de bolo com ${camadas.filter(Boolean).length} de 4 camadas`}
    >
      {/* prato */}
      <ellipse cx="190" cy="378" rx="168" ry="18" fill="#fffaf8" stroke="#c99a43" strokeWidth="1.4" />
      <ellipse cx="190" cy="376" rx="140" ry="12" fill="none" stroke="#ecd6d0" />

      {/* contornos vazios */}
      {CAMADAS.map((c) => (
        <rect
          key={c.nome}
          x="60"
          y={c.y}
          width="240"
          height={c.h}
          fill="rgba(255,255,255,.35)"
          stroke="#c9aaa3"
          strokeDasharray="4 5"
        />
      ))}
      <path d="M60 184 L92 160 H332 L300 184 Z" fill="rgba(255,255,255,.35)" stroke="#c9aaa3" strokeDasharray="4 5" />
      <path d="M300 184 L332 160 V342 L300 366 Z" fill="rgba(255,255,255,.2)" stroke="#c9aaa3" strokeDasharray="4 5" />

      {/* camadas que caem no lugar */}
      {CAMADAS.map((c, i) => (
        <AnimatePresence key={c.nome}>
          {camadas[i] && (
            <motion.g
              initial={{ y: -60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -30, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 18 }}
            >
              {/* lateral (profundidade) */}
              <path
                d={`M300 ${c.y} L332 ${c.y - 24} V${c.y - 24 + c.h} L300 ${c.y + c.h} Z`}
                fill={c.cor}
                style={{ filter: 'brightness(.86)' }}
              />
              <rect x="60" y={c.y} width="240" height={c.h} fill={c.cor} />
              {i === 0 || i === 2 ? (
                <g fill={i === 2 ? '#5a3633' : '#e3c7ae'} opacity="0.8">
                  {Array.from({ length: 22 }, (_, k) => (
                    <circle
                      key={k}
                      cx={70 + ((k * 47) % 225)}
                      cy={c.y + 10 + ((k * 23) % (c.h - 18))}
                      r={1.6 + (k % 3) * 0.6}
                    />
                  ))}
                </g>
              ) : null}
              {i === 3 && (
                <>
                  <path d="M60 184 L92 160 H332 L300 184 Z" fill="#fbeeea" />
                  <path
                    d="M60 208 Q66 208 66 216 Q66 224 71 224 Q76 224 76 214 Q76 208 90 208 Q100 208 100 220 Q100 230 106 230 Q112 230 112 216 Q112 208 140 208 Q150 208 150 216 Q150 222 155 222 Q160 222 160 212 Q160 208 196 208 Q206 208 206 222 Q206 232 212 232 Q218 232 218 216 Q218 208 250 208 Q260 208 260 214 Q260 220 265 220 Q270 220 270 212 Q270 208 300 208 V210 H60 Z"
                    fill="#e6abaa"
                  />
                  {[
                    [110, 168, '#e4c06c', 20],
                    [150, 174, '#b4636c', -30],
                    [196, 166, '#6e4642', 60],
                    [240, 172, '#e4c06c', -10],
                    [280, 166, '#d4456a', 40],
                    [130, 178, '#e6abaa', 75],
                    [220, 178, '#e4c06c', -55],
                    [300, 170, '#6e4642', 15],
                  ].map(([x, y, cor, r], k) => (
                    <rect
                      key={k}
                      x={Number(x) - 5}
                      y={Number(y) - 1.4}
                      width="10"
                      height="2.8"
                      rx="1.4"
                      fill={String(cor)}
                      transform={`rotate(${r} ${x} ${y})`}
                    />
                  ))}
                </>
              )}
            </motion.g>
          )}
        </AnimatePresence>
      ))}

      {/* cereja quando tudo estiver preenchido */}
      <AnimatePresence>
        {todas && (
          <motion.g
            initial={{ y: -120, opacity: 0, rotate: -20 }}
            animate={{ y: 0, opacity: 1, rotate: 0 }}
            exit={{ y: -60, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 180, damping: 12 }}
            style={{ originX: '200px', originY: '150px' }}
          >
            <path
              d="M200 146 C202 128 210 116 226 108"
              fill="none"
              stroke="#5d3b1f"
              strokeWidth="2.6"
              strokeLinecap="round"
            />
            <path d="M216 112 C224 102 238 104 242 110 C232 116 224 116 216 112 Z" fill="#6f8f4c" />
            <circle cx="198" cy="152" r="16" fill="#c8243f" />
            <ellipse cx="192" cy="146" rx="4.5" ry="2.8" fill="#fff" opacity="0.5" transform="rotate(-35 192 146)" />
          </motion.g>
        )}
      </AnimatePresence>

      {/* chamadas numeradas (como na referência) */}
      {CAMADAS.map((c, i) => {
        const y = c.y + c.h / 2 - (i === 3 ? 6 : 0)
        return (
          <g key={c.nome} className={`fatia__callout ${camadas[i] ? 'is-done' : ''}`}>
            <line x1="338" y1={y} x2="380" y2={y} />
            <circle cx="384" cy={y} r="3.4" />
          </g>
        )
      })}

      {todas && (
        <g>
          <foreignObject x="20" y="96" width="40" height="40">
            <Sparkle size={22} />
          </foreignObject>
          <foreignObject x="300" y="110" width="40" height="40">
            <Sparkle size={16} />
          </foreignObject>
        </g>
      )}
    </svg>
  )
}
