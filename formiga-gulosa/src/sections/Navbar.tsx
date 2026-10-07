import { AnimatePresence, motion } from 'motion/react'
import { MapPin, Phone } from 'lucide-react'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Ant } from '../components/Ant'
import { Logo } from '../components/Logo'
import { WhatsAppIcon } from '../components/Sweets'
import { linkWhatsapp, links, secoes, site } from '../config/site'
import { useActiveSection, useEscape, useFocusTrap } from '../lib/hooks'
import { irPara, liberarRolagem, travarRolagem } from '../lib/scroll'
import './navbar.css'

const ids = secoes.map((s) => s.id)

export function Navbar({ menuAberto, setMenuAberto }: { menuAberto: boolean; setMenuAberto: (v: boolean) => void }) {
  const [rolou, setRolou] = useState(false)
  const ativa = useActiveSection(ids)

  useEffect(() => {
    const onScroll = () => setRolou(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <motion.header
        className={`nav ${rolou ? 'is-scrolled' : ''}`}
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
      >
        <div className="container nav__inner">
          <a href="#inicio" className="nav__brand" aria-label="Formiga Gulosa, voltar ao início">
            <Logo sizes="56px" className="nav__logo" priority />
            <span className="nav__brand-text" aria-hidden="true">
              <strong>Formiga Gulosa</strong>
              <small>Confeitaria artesanal</small>
            </span>
          </a>

          <NavLinks ativa={ativa} />

          <a className="btn btn--small nav__cta" href={linkWhatsapp()} target="_blank" rel="noopener noreferrer">
            <span>Encomendar</span>
            <span className="btn__icon">
              <WhatsAppIcon size={14} />
            </span>
            <span className="sr-only"> pelo WhatsApp (abre em nova aba)</span>
          </a>

          <button
            type="button"
            className={`nav__toggle ${menuAberto ? 'is-open' : ''}`}
            aria-expanded={menuAberto}
            aria-controls="menu-celular"
            onClick={() => setMenuAberto(!menuAberto)}
          >
            <span className="nav__toggle-label">{menuAberto ? 'Fechar' : 'Menu'}</span>
            <span className="nav__toggle-icon" aria-hidden="true">
              <span />
              <span />
            </span>
          </button>
        </div>
      </motion.header>

      <MobileMenu aberto={menuAberto} fechar={() => setMenuAberto(false)} ativa={ativa} />
    </>
  )
}

/** Links da navegação. Uma formiguinha caminha até o item da seção atual. */
function NavLinks({ ativa }: { ativa: string }) {
  const listaRef = useRef<HTMLUListElement>(null)
  const [pos, setPos] = useState({ x: 0, pronto: false })
  const [andando, setAndando] = useState(false)
  const [paraEsquerda, setParaEsquerda] = useState(false)
  const anterior = useRef(0)

  useLayoutEffect(() => {
    const medir = () => {
      const lista = listaRef.current
      const link = lista?.querySelector<HTMLElement>(`[data-id="${ativa}"]`)
      if (!lista || !link) return
      const x = link.offsetLeft + link.offsetWidth / 2
      setParaEsquerda(x < anterior.current)
      anterior.current = x
      setPos({ x, pronto: true })
    }
    medir()
    window.addEventListener('resize', medir)
    document.fonts?.ready.then(medir)
    return () => window.removeEventListener('resize', medir)
  }, [ativa])

  return (
    <nav className="nav__links" aria-label="Principal">
      <ul ref={listaRef}>
        {secoes.map((s) => (
          <li key={s.id}>
            <a href={`#${s.id}`} data-id={s.id} aria-current={ativa === s.id ? 'location' : undefined}>
              {s.rotulo}
            </a>
          </li>
        ))}
        <motion.li
          className="nav__ant"
          aria-hidden="true"
          initial={false}
          animate={{ x: pos.x, opacity: pos.pronto ? 1 : 0 }}
          transition={{ x: { duration: 0.9, ease: [0.45, 0, 0.25, 1] }, opacity: { duration: 0.3 } }}
          onAnimationStart={() => setAndando(true)}
          onAnimationComplete={() => setAndando(false)}
        >
          <span style={{ display: 'block', transform: paraEsquerda ? 'scaleX(-1)' : undefined }}>
            <Ant size={24} walking={andando} carrying="brigadeiro" speed={0.3} />
          </span>
        </motion.li>
      </ul>
    </nav>
  )
}

function MobileMenu({ aberto, fechar, ativa }: { aberto: boolean; fechar: () => void; ativa: string }) {
  const ref = useRef<HTMLDivElement>(null)
  useFocusTrap(ref, aberto)
  useEscape(aberto, fechar)

  useEffect(() => {
    if (!aberto) return
    travarRolagem()
    return () => liberarRolagem()
  }, [aberto])

  const navegar = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault()
    fechar()
    window.setTimeout(() => irPara(id), 380)
  }

  return (
    <AnimatePresence>
      {aberto && (
        <motion.div
          ref={ref}
          id="menu-celular"
          className="mmenu grain"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          initial={{ clipPath: 'circle(0% at calc(100% - 44px) 34px)' }}
          animate={{ clipPath: 'circle(150% at calc(100% - 44px) 34px)' }}
          exit={{ clipPath: 'circle(0% at calc(100% - 44px) 34px)' }}
          transition={{ duration: 0.7, ease: [0.65, 0, 0.35, 1] }}
          data-lenis-prevent
        >
          <div className="mmenu__top">
            <span className="eyebrow">Menu</span>
            <button type="button" className="mmenu__close" onClick={fechar} data-autofocus>
              Fechar
              <span aria-hidden="true" className="mmenu__x" />
            </button>
          </div>

          <nav aria-label="Menu principal">
            <ol className="mmenu__list">
              {secoes.map((s, i) => (
                <motion.li
                  key={s.id}
                  initial={{ opacity: 0, y: 34 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.25 + i * 0.07, ease: [0.22, 1, 0.36, 1] }}
                >
                  <a
                    href={`#${s.id}`}
                    onClick={(e) => navegar(e, s.id)}
                    aria-current={ativa === s.id ? 'location' : undefined}
                    className={ativa === s.id ? 'is-active' : ''}
                  >
                    <span className="mmenu__num">{String(i + 1).padStart(2, '0')}</span>
                    <span className="mmenu__label">{s.rotulo}</span>
                    {ativa === s.id && <Ant size={34} carrying="brigadeiro" className="mmenu__ant" />}
                  </a>
                </motion.li>
              ))}
            </ol>
          </nav>

          <motion.div
            className="mmenu__actions"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.62, ease: [0.22, 1, 0.36, 1] }}
          >
            <a className="btn btn--gold mmenu__wa" href={linkWhatsapp()} target="_blank" rel="noopener noreferrer">
              <span>Encomendar pelo WhatsApp</span>
              <span className="btn__icon">
                <WhatsAppIcon size={15} />
              </span>
            </a>
            <div className="mmenu__row">
              <a className="mmenu__chip" href={site.telefone.link}>
                <Phone size={16} strokeWidth={1.7} aria-hidden="true" /> Ligar
              </a>
              <a className="mmenu__chip" href={links.comoChegar} target="_blank" rel="noopener noreferrer">
                <MapPin size={16} strokeWidth={1.7} aria-hidden="true" /> Como chegar
              </a>
            </div>
            <p className="mmenu__addr">
              {site.endereco.rua} · {site.endereco.bairro}
              <br />
              {site.endereco.cidade} - {site.endereco.uf}
            </p>
          </motion.div>

          <div className="mmenu__trail" aria-hidden="true">
            <Ant size={30} walking carrying="cereja" className="mmenu__walker" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
