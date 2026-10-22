import { Component, lazy, Suspense, useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { hero, site, steps } from '../content/site'
import { device } from '../lib/device'
import { gsap, scrollToTarget, ScrollTrigger } from '../lib/scroll'
import { activeStep, ramp, stage, STAGE_UNITS } from '../lib/stage'
import { ArrowDown } from '../components/Brand'
import { SystemDiagram } from './SystemDiagram'
import './stage.css'

const Scene = lazy(() => import('../three/Scene'))

class SceneBoundary extends Component<{ onError: () => void; children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch() {
    this.props.onError()
  }
  render() {
    return this.state.failed ? null : this.props.children
  }
}

const Check = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true">
    <path d="M3.5 8.4l2.8 2.8 6.2-6.4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

function Chars({ text, className }: { text: string; className?: string }) {
  return (
    <span className={className} aria-hidden="true">
      {Array.from(text).map((c, i) => (
        <span key={i} className="hero__char">
          {c}
        </span>
      ))}
    </span>
  )
}

export function Stage() {
  const root = useRef<HTMLElement>(null)
  const [mode, setMode] = useState<'3d' | '2d'>(device.webgl ? '3d' : '2d')
  const [ready, setReady] = useState(false)
  const [inView, setInView] = useState(true)
  const [step, setStep] = useState(0)
  const [introDone, setIntroDone] = useState(device.reducedMotion)
  const timeline = useRef<gsap.core.Timeline | null>(null)
  const started = useRef(false)
  const startIntro = useRef<() => void>(() => {})

  // Rolagem → estado da cena, etapa ativa e variáveis CSS do painel.
  useEffect(() => {
    const el = root.current
    if (!el) return
    let last = -1
    const st = ScrollTrigger.create({
      trigger: el,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        stage.progress = self.progress
        const s = Math.min(6, self.progress * STAGE_UNITS)
        stage.s = s
        const a = activeStep(s)
        if (a !== last) {
          last = a
          setStep(a)
        }
        el.classList.toggle('is-past-hero', s > 0.52)
        el.classList.toggle('is-in-system', s > 0.56)
        el.style.setProperty('--hero-out', ramp(s, 0.04, 0.5).toFixed(4))
        el.style.setProperty('--sys-in', ramp(s, 0.55, 0.9).toFixed(4))
        el.style.setProperty('--rail', Math.min(1, Math.max(0, (s - 1) / 4)).toFixed(4))
        el.style.setProperty('--fill', `${(Math.min(1, Math.max(0, (s - a + 0.3) / 0.95)) * 100).toFixed(1)}%`)
      },
    })
    const vis = ScrollTrigger.create({
      trigger: el,
      start: 'top bottom',
      end: 'bottom top',
      onToggle: (self) => {
        stage.inView = self.isActive
        setInView(self.isActive)
      },
    })
    return () => {
      st.kill()
      vis.kill()
    }
  }, [])

  // Ponteiro (normalizado na janela; o canvas ocupa a tela inteira).
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      stage.pointer.x = (e.clientX / window.innerWidth) * 2 - 1
      stage.pointer.y = -(e.clientY / window.innerHeight) * 2 + 1
      stage.pointer.active = e.pointerType === 'mouse'
    }
    const onLeave = () => (stage.pointer.active = false)
    window.addEventListener('pointermove', onMove, { passive: true })
    document.documentElement.addEventListener('pointerleave', onLeave)
    return () => {
      window.removeEventListener('pointermove', onMove)
      document.documentElement.removeEventListener('pointerleave', onLeave)
    }
  }, [])

  // Entrada: começa quando a cena estiver pronta (ou após um limite de espera).
  useEffect(() => {
    const el = root.current
    if (!el) return
    if (device.reducedMotion) {
      stage.intro = 1
      el.classList.add('is-revealed')
      return
    }
    const start = () => {
      if (started.current) return
      started.current = true
      const q = gsap.utils.selector(el)
      const tl = gsap.timeline({ onComplete: () => setIntroDone(true) })
      tl.to(stage, { intro: 1, duration: 5.6, ease: 'none' }, 0)
      tl.call(() => el.classList.add('is-revealed'), [], 0)
      tl.from(q('.hero__kicker'), { opacity: 0, y: 14, duration: 1, ease: 'power3.out' }, 2.1)
      tl.from(
        q('.hero__char'),
        { yPercent: 118, rotate: 6, opacity: 0, filter: 'blur(10px)', duration: 1.25, ease: 'expo.out', stagger: 0.055, clearProps: 'filter' },
        2.35,
      )
      tl.from(q('.hero__line > *'), { opacity: 0, y: 22, duration: 1.1, ease: 'power3.out', stagger: 0.14 }, 3.05)
      tl.from(q('.hero__support'), { opacity: 0, y: 16, duration: 1, ease: 'power3.out' }, 3.4)
      tl.from(q('.hero__cta'), { opacity: 0, y: 16, duration: 1, ease: 'power3.out' }, 3.6)
      tl.from(q('.hero__meta, .hero__scroll'), { opacity: 0, duration: 1.2, ease: 'power2.out' }, 4.1)
      timeline.current = tl
    }
    const fallback = window.setTimeout(start, mode === '2d' ? 120 : 2600)
    // Quem rola durante a entrada não espera por ela.
    const hurry = () => {
      if (timeline.current && timeline.current.progress() < 1) timeline.current.timeScale(4)
    }
    window.addEventListener('wheel', hurry, { passive: true })
    window.addEventListener('touchmove', hurry, { passive: true })
    window.addEventListener('keydown', hurry)
    startIntro.current = start
    return () => {
      window.clearTimeout(fallback)
      window.removeEventListener('wheel', hurry)
      window.removeEventListener('touchmove', hurry)
      window.removeEventListener('keydown', hurry)
    }
  }, [mode])

  const onReady = () => {
    setReady(true)
    startIntro.current()
  }

  const onError = () => {
    setMode('2d')
    stage.intro = 1
  }

  const explore = () => scrollToTarget('#sistema', { duration: 2.4 })
  const goStep = (k: number) => scrollToTarget(`#etapa-${k}`, { duration: 1.6 })

  return (
    <section
      ref={root}
      id="inicio"
      className="stage"
      data-ready={ready || mode === '2d' ? '' : undefined}
      data-intro-done={introDone ? '' : undefined}
      style={{ '--units': STAGE_UNITS } as CSSProperties}
      aria-label="Gota Tech — abertura e funcionamento do sistema"
    >
      <div className="stage__sticky">
        <div className="stage__poster" aria-hidden="true">
          <span className="stage__poster-rain" />
        </div>

        <div className={`stage__canvas ${mode === '3d' && ready ? 'is-visible' : ''}`}>
          {mode === '3d' ? (
            <SceneBoundary onError={onError}>
              <Suspense fallback={null}>
                <Scene tier={device.tier} reduced={device.reducedMotion} active={inView} onReady={onReady} onError={onError} />
              </Suspense>
            </SceneBoundary>
          ) : (
            <SystemDiagram step={step} />
          )}
        </div>
        <div className="stage__shade" aria-hidden="true" />

        {mode === '3d' && !ready ? (
          <div className="stage__loader" role="status">
            <span className="stage__loader-drop" aria-hidden="true" />
            <span className="mono">Preparando a cena 3D</span>
          </div>
        ) : null}

        <div className="stage__view">
          {/* ABERTURA */}
          <div className="hero">
            <div className="hero__inner">
              <p className="hero__kicker eyebrow">
                <span className="hero__kicker-drop" aria-hidden="true" />
                {site.subtitle}
              </p>
              <h1 className="hero__title" aria-label="Gota Tech">
                <Chars text="GOTA" className="hero__word" />
                <Chars text="TECH" className="hero__word hero__word--thin" />
              </h1>
              <p className="hero__line">
                <span>{hero.line1}</span> <em className="serif">{hero.line2}</em>
              </p>
              <p className="hero__support">{hero.support}</p>
              <a
                className="btn hero__cta"
                href="#sistema"
                onClick={(e) => {
                  e.preventDefault()
                  explore()
                }}
              >
                {hero.cta}
                <span className="btn__icon">
                  <ArrowDown />
                </span>
              </a>
            </div>
            <p className="hero__meta mono">
              Projeto de pesquisa · {site.school} · {site.city} — {site.stateShort}
            </p>
            <div className="hero__scroll" aria-hidden="true">
              <span className="mono">Role e acompanhe a água</span>
              <span className="hero__scroll-line">
                <i />
              </span>
            </div>
          </div>

          {/* O SISTEMA */}
          <div className="sys" aria-labelledby="sys-title">
            <div className="sys__panel">
              <h2 id="sys-title" className="eyebrow sys__eyebrow">
                <span className="eyebrow__index">01</span>
                <span className="eyebrow__rule" />O sistema em funcionamento
              </h2>
              <ol className="sys__steps">
                {steps.map((st, i) => {
                  const k = i + 1
                  const state = step === k ? 'is-active' : step > k ? 'is-done' : 'is-next'
                  return (
                    <li key={st.n} className={`sys__step ${state}`}>
                      <span className="sys__num" aria-hidden="true">
                        {st.n}
                      </span>
                      <h3 className="sys__title">
                        <span className="sr-only">Etapa {st.n}: </span>
                        {st.title}
                      </h3>
                      <p className="sys__text">{st.text}</p>
                    </li>
                  )
                })}
              </ol>
              <p className="sys__note mono">Visualização ilustrativa · fora de escala</p>
            </div>

            <nav className="sys__rail" aria-label="Etapas do sistema">
              <span className="sys__rail-track" aria-hidden="true">
                <span className="sys__rail-fill" />
              </span>
              <ol>
                {steps.map((st, i) => {
                  const k = i + 1
                  const state = step === k ? 'is-active' : step > k ? 'is-done' : ''
                  return (
                    <li key={st.n}>
                      <button
                        type="button"
                        className={`sys__node ${state}`}
                        tabIndex={step > 0 ? 0 : -1}
                        onClick={() => goStep(k)}
                        aria-current={step === k ? 'step' : undefined}
                        aria-label={`${st.n} ${st.title}${step > k ? ' (concluída)' : ''}`}
                      >
                        <span className="sys__node-dot">
                          <Check />
                        </span>
                        <span className="sys__node-label">
                          <span className="sys__node-n">{st.n}</span> {st.short}
                        </span>
                      </button>
                    </li>
                  )
                })}
              </ol>
            </nav>
          </div>
        </div>
      </div>

      <div className="stage__track" aria-hidden="true">
        <div className="stage__unit" data-nav-region="inicio" />
        <div className="stage__rest" data-nav-region="sistema">
          <span id="sistema" className="stage__anchor" style={{ '--k': 0 } as CSSProperties} />
          {steps.map((st, i) => (
            <span key={st.n} id={`etapa-${i + 1}`} className="stage__anchor" style={{ '--k': i + 0.08 } as CSSProperties} />
          ))}
        </div>
      </div>
    </section>
  )
}
