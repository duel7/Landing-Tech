import { useEffect, useRef, useState, type MouseEvent } from 'react'
import { nav, site } from '../content/site'
import { lockScroll, scrollToTarget, ScrollTrigger } from '../lib/scroll'
import { Logo } from './Brand'
import './nav.css'

type NavId = (typeof nav)[number]['id']

export function goTo(id: string) {
  if (id === 'inicio') scrollToTarget(0, { duration: 2.2 })
  else scrollToTarget(`#${id}`, { duration: 1.8 })
}

export function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [light, setLight] = useState(false)
  const [active, setActive] = useState<NavId>('inicio')
  const [open, setOpen] = useState(false)
  const toggleRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  // Fundo com desfoque depois da primeira tela; tema claro sobre seções claras;
  // item ativo conforme a região visível.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })

    const triggers: ScrollTrigger[] = []
    const setup = () => {
      const navH = 40
      document.querySelectorAll<HTMLElement>('[data-theme="light"]').forEach((el) => {
        triggers.push(
          ScrollTrigger.create({
            trigger: el,
            start: `top top+=${navH}`,
            end: `bottom top+=${navH}`,
            onToggle: (self) => setLight(self.isActive),
          }),
        )
      })
      document.querySelectorAll<HTMLElement>('[data-nav-region]').forEach((el) => {
        const id = el.dataset.navRegion as NavId
        triggers.push(
          ScrollTrigger.create({
            trigger: el,
            start: 'top 55%',
            end: 'bottom 55%',
            onToggle: (self) => {
              if (self.isActive) setActive(id)
            },
          }),
        )
      })
    }
    // Espera as seções montarem (a cena 3D é carregada à parte).
    const t = window.setTimeout(setup, 60)
    return () => {
      window.clearTimeout(t)
      window.removeEventListener('scroll', onScroll)
      triggers.forEach((tr) => tr.kill())
    }
  }, [])

  // Menu mobile: trava a rolagem, Esc fecha, foco preso no painel.
  useEffect(() => {
    if (!open) return
    lockScroll(true)
    const panel = panelRef.current
    const focusables = () => Array.from(panel?.querySelectorAll<HTMLElement>('a, button') ?? [])
    focusables()[0]?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        toggleRef.current?.focus()
      }
      if (e.key === 'Tab') {
        const els = focusables()
        if (!els.length) return
        const first = els[0]
        const last = els[els.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      lockScroll(false)
    }
  }, [open])

  const onLink = (e: MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault()
    const wasOpen = open
    setOpen(false)
    // Com o menu aberto, espera a rolagem destravar antes de navegar.
    window.setTimeout(() => goTo(id), wasOpen ? 80 : 0)
  }

  return (
    <>
      <header className={`nav ${scrolled ? 'is-scrolled' : ''} ${light && !open ? 'is-light' : ''} ${open ? 'is-open' : ''}`}>
        <div className="nav__inner">
          <a className="nav__brand" href="#inicio" onClick={(e) => onLink(e, 'inicio')} aria-label={`${site.name}, voltar ao início`}>
            <Logo />
          </a>

          <nav className="nav__links" aria-label="Principal">
            <ul>
              {nav.map((item) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    className={active === item.id ? 'is-active' : ''}
                    aria-current={active === item.id ? 'location' : undefined}
                    onClick={(e) => onLink(e, item.id)}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <button
            ref={toggleRef}
            className="nav__toggle"
            type="button"
            aria-expanded={open}
            aria-controls="menu-mobile"
            onClick={() => setOpen((v) => !v)}
          >
            <span className="nav__toggle-label">{open ? 'Fechar' : 'Menu'}</span>
            <span className="nav__toggle-bars" aria-hidden="true">
              <span />
              <span />
            </span>
          </button>
        </div>
      </header>

      <div
        ref={panelRef}
        id="menu-mobile"
        className={`menu ${open ? 'is-open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        inert={!open}
      >
        <div className="menu__ripples" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <nav aria-label="Menu" className="menu__nav">
          <ol>
            {nav.map((item, i) => (
              <li key={item.id} style={{ '--i': i } as React.CSSProperties}>
                <a href={`#${item.id}`} onClick={(e) => onLink(e, item.id)} aria-current={active === item.id ? 'location' : undefined}>
                  <span className="menu__n">0{i + 1}</span>
                  <span className="menu__label">{item.label}</span>
                </a>
              </li>
            ))}
          </ol>
        </nav>
        <p className="menu__foot mono">
          {site.school} · {site.city} — {site.stateShort}
        </p>
      </div>
    </>
  )
}
