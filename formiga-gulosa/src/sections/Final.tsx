import { ArrowUp, ArrowUpRight, MapPin, Phone } from 'lucide-react'
import type { ReactNode } from 'react'
import { Ant, type Carga } from '../components/Ant'
import { Logo } from '../components/Logo'
import { Magnetic, Parallax } from '../components/Motion'
import { MaskLines, Reveal } from '../components/Reveal'
import { InstagramIcon, Sprinkle, WhatsAppIcon } from '../components/Sweets'
import { linkWhatsapp, links, secoes, site } from '../config/site'
import { useReducedMotionPref } from '../lib/hooks'
import { irPara } from '../lib/scroll'
import './final.css'

const CONFEITOS = [
  [6, 0, 'var(--gold-bright)', 14],
  [14, 3.2, 'var(--rose)', 11],
  [23, 1.4, 'var(--gold-soft)', 16],
  [31, 5.1, 'var(--rose)', 12],
  [42, 2.2, 'var(--gold-bright)', 10],
  [55, 4.4, 'var(--rose)', 13],
  [63, 0.8, 'var(--gold-soft)', 15],
  [72, 3.6, 'var(--gold-bright)', 12],
  [81, 1.9, 'var(--rose)', 14],
  [89, 5.6, 'var(--gold-soft)', 11],
  [95, 2.8, 'var(--gold-bright)', 13],
  [48, 6.4, 'var(--rose)', 15],
] as const

const CARGAS: Carga[] = ['brigadeiro', 'cereja', 'coracao', 'granulado', 'perola']

/** CTA final + rodapé, numa mesma faixa escura (como na referência). */
export function Final() {
  return (
    <>
      <section className="final dark" aria-labelledby="final-titulo" data-esconde-flutuante>
        <div className="final__curve" aria-hidden="true">
          <svg viewBox="0 0 1440 90" preserveAspectRatio="none" focusable="false">
            <path d="M0 90 V50 C300 0 560 10 780 34 C1020 60 1220 56 1440 14 V90 Z" fill="var(--cacao)" />
          </svg>
        </div>

        <div className="final__confetti" aria-hidden="true">
          {CONFEITOS.map(([x, atraso, cor, tam], i) => (
            <span
              key={i}
              style={{ left: `${x}%`, animationDelay: `-${atraso * 2}s`, animationDuration: `${11 + (i % 4) * 2.5}s` }}
            >
              <Sprinkle length={tam} color={cor} rotate={i * 37} />
            </span>
          ))}
        </div>

        <div className="container final__inner">
          <Reveal>
            <p className="eyebrow final__eyebrow">Tem festa chegando?</p>
          </Reveal>
          <Parallax speed={18} scaleRange={[0.9, 1]}>
            <h2 id="final-titulo" className="display final__title">
              <MaskLines
                lines={[
                  'Onde tem festa,',
                  <>
                    tem <em className="script gold-text final__script">Formiga.</em>
                  </>,
                ]}
              />
            </h2>
          </Parallax>
          <Reveal delay={0.2}>
            <p className="lead final__lead">Conte a data e a ideia. A gente transforma em bolo.</p>
          </Reveal>
          <Reveal delay={0.3} className="final__cta-wrap">
            <Trilha lado="esq" />
            <Magnetic strength={0.22}>
              <a className="btn btn--gold final__cta" href={linkWhatsapp()} target="_blank" rel="noopener noreferrer">
                <span>Falar com a Formiga Gulosa</span>
                <span className="btn__icon">
                  <WhatsAppIcon size={16} />
                </span>
                <span className="sr-only"> pelo WhatsApp (abre em nova aba)</span>
              </a>
            </Magnetic>
            <Trilha lado="dir" />
          </Reveal>
          <Reveal delay={0.45}>
            <a className="final__insta" href={site.instagram.link} target="_blank" rel="noopener noreferrer">
              <span className="final__insta-icon" aria-hidden="true">
                <InstagramIcon size={16} />
              </span>
              <span>
                ou acompanhe as novidades em <strong>{site.instagram.usuario}</strong>
              </span>
              <span className="sr-only"> no Instagram (abre em nova aba)</span>
            </a>
          </Reveal>
        </div>
      </section>

      <footer className="footer dark" data-esconde-flutuante>
        <div className="container footer__grid">
          <div className="footer__brand">
            <Logo sizes="96px" className="footer__logo" />
            <div>
              <p className="footer__name">{site.nome}</p>
              <p className="footer__sub">{site.assinatura}</p>
              <p className="footer__desc">Bolos personalizados, doces e tortas, feitos à mão em Itabuna - BA.</p>
            </div>
          </div>

          <nav className="footer__col" aria-label="Rodapé">
            <p className="footer__title">Navegue</p>
            <ul>
              {secoes.map((s) => (
                <li key={s.id}>
                  <a className="text-link" href={`#${s.id}`}>
                    {s.rotulo}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="footer__col">
            <p className="footer__title">Fale com a gente</p>
            <ul>
              <FooterLink href={linkWhatsapp()} externo icon={<WhatsAppIcon size={16} />}>
                WhatsApp {site.whatsapp.exibicao}
              </FooterLink>
              <FooterLink href={links.telefone} icon={<Phone size={16} strokeWidth={1.6} />}>
                Telefone {site.telefone.exibicao}
              </FooterLink>
              <FooterLink href={site.instagram.link} externo icon={<InstagramIcon size={16} />}>
                Instagram {site.instagram.usuario}
              </FooterLink>
            </ul>
          </div>

          <div className="footer__col">
            <p className="footer__title">Onde estamos</p>
            <address className="footer__address">
              {site.endereco.rua}
              <br />
              {site.endereco.bairro}, {site.endereco.cidade} - {site.endereco.uf}
              <br />
              CEP {site.endereco.cep}
            </address>
            <a className="footer__map" href={links.comoChegar} target="_blank" rel="noopener noreferrer">
              <MapPin size={15} strokeWidth={1.6} aria-hidden="true" /> Como chegar
              <ArrowUpRight size={14} strokeWidth={1.8} aria-hidden="true" />
              <span className="sr-only"> (abre em nova aba)</span>
            </a>
          </div>
        </div>

        <div className="container footer__bottom">
          <p>
            © {new Date().getFullYear()} {site.nome}. Todos os direitos reservados.
          </p>
          <p className="footer__sign">
            <span className="script">feito com carinho</span>
            <Ant size={30} carrying="brigadeiro" />
          </p>
          <button type="button" className="footer__top" onClick={() => irPara('topo')}>
            <span>Voltar ao topo</span>
            <span className="footer__top-circle" aria-hidden="true">
              <ArrowUp size={17} strokeWidth={1.5} />
            </span>
          </button>
        </div>
      </footer>
    </>
  )
}

function FooterLink({
  href,
  externo,
  icon,
  children,
}: {
  href: string
  externo?: boolean
  icon: ReactNode
  children: ReactNode
}) {
  return (
    <li>
      <a
        className="footer__link"
        href={href}
        target={externo ? '_blank' : undefined}
        rel={externo ? 'noopener noreferrer' : undefined}
      >
        <span className="footer__link-icon" aria-hidden="true">
          {icon}
        </span>
        <span className="text-link">{children}</span>
        {externo && <span className="sr-only"> (abre em nova aba)</span>}
      </a>
    </li>
  )
}

/** Fila de formigas levando doces até o botão — a assinatura da marca. */
function Trilha({ lado }: { lado: 'esq' | 'dir' }) {
  const reduzir = useReducedMotionPref()
  const caminho = 'M-30 150 C80 150 120 96 230 104 C330 112 380 70 470 66'
  const duracao = 13
  return (
    <svg className={`trilha trilha--${lado}`} viewBox="0 0 480 170" aria-hidden="true" focusable="false">
      <path
        d={caminho}
        fill="none"
        stroke="rgba(228,192,108,.35)"
        strokeWidth="1.6"
        strokeDasharray="1 7"
        strokeLinecap="round"
      />
      {reduzir
        ? [
            [150, 108, -14],
            [330, 92, -10],
          ].map(([x, y, r], i) => (
            <g key={i} transform={`translate(${x - 22} ${y - 32}) rotate(${r} 22 32)`}>
              <Ant size={44} carrying={CARGAS[i]} />
            </g>
          ))
        : CARGAS.map((carga, i) => (
            <g key={carga}>
              <g transform="translate(-22 -32)">
                <Ant size={44} walking carrying={carga} speed={0.34} />
              </g>
              <animateMotion
                dur={`${duracao}s`}
                begin={`${-(i * duracao) / CARGAS.length}s`}
                repeatCount="indefinite"
                rotate="auto"
                path={caminho}
              />
              <animate
                attributeName="opacity"
                values="0;1;1;0"
                keyTimes="0;0.08;0.9;1"
                dur={`${duracao}s`}
                begin={`${-(i * duracao) / CARGAS.length}s`}
                repeatCount="indefinite"
              />
            </g>
          ))}
    </svg>
  )
}
