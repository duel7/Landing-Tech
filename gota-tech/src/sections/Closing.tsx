import { useEffect, useMemo, useRef } from 'react'
import { closing, site } from '../content/site'
import { useReveal } from '../lib/reveal'
import { device } from '../lib/device'
import { createShaderCanvas } from '../lib/shaderCanvas'
import { scrollToTarget, ScrollTrigger } from '../lib/scroll'
import { ArrowUp, LogoMark } from '../components/Brand'
import './closing.css'

// Vista de baixo d'água: luz atravessando a superfície, cáusticas, feixes e partículas.
const FRAG = /* glsl */ `
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform vec2 uMouse;

float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

// rede de cáusticas: distorção iterativa de ondas senoidais
float caustics(vec2 p, float t){
  float acc = 0.0;
  vec2 q = p;
  for (int i = 0; i < 4; i++) {
    float fi = float(i);
    q += 0.32 * vec2(sin(q.y * 1.9 + t * 0.7 + fi * 1.3), cos(q.x * 1.7 - t * 0.6 + fi * 2.1));
    acc += abs(sin(q.x * 2.3 + t * 0.4) + cos(q.y * 2.1 - t * 0.3));
  }
  acc /= 4.0;
  return pow(clamp(1.0 - acc * 0.62, 0.0, 1.0), 5.0);
}

void main(){
  vec2 uv = gl_FragCoord.xy / uRes;
  float aspect = uRes.x / uRes.y;
  vec2 p = vec2((uv.x - 0.5) * aspect, uv.y);
  float t = uTime;

  // profundidade: claro perto da superfície (topo), profundo embaixo
  vec3 deep = vec3(0.012, 0.07, 0.11);
  vec3 mid = vec3(0.02, 0.2, 0.24);
  vec3 surf = vec3(0.16, 0.55, 0.52);
  vec3 col = mix(deep, mid, smoothstep(0.0, 0.75, uv.y));
  col = mix(col, surf, smoothstep(0.7, 1.05, uv.y) * 0.8);

  // feixes de luz partindo de um ponto acima da superfície
  vec2 src = vec2((uMouse.x - 0.5) * 0.35 * aspect, 1.35);
  vec2 d = p - src;
  float ang = atan(d.x, -d.y);
  float rays = 0.0;
  rays += 0.5 + 0.5 * sin(ang * 23.0 + t * 0.35);
  rays *= 0.5 + 0.5 * sin(ang * 37.0 - t * 0.27 + 1.7);
  rays = pow(rays, 2.0);
  float fall = smoothstep(1.35, 0.15, length(d)) * smoothstep(0.0, 0.6, uv.y + 0.1);
  col += vec3(0.35, 0.85, 0.75) * rays * fall * 0.22;

  // cáusticas, mais fortes perto da superfície
  float c = caustics(p * 3.2 + vec2(0.0, t * 0.05), t * 0.6);
  float c2 = caustics(p * 5.1 - vec2(t * 0.03, 0.0), t * 0.8 + 2.0);
  col += vec3(0.4, 1.0, 0.85) * (c * 0.55 + c2 * 0.3) * smoothstep(0.15, 1.0, uv.y);

  // partículas subindo
  vec2 g = vec2(p.x * 9.0, uv.y * 9.0 - t * 0.12);
  vec2 cellId = floor(g);
  vec2 f = fract(g) - 0.5;
  float h = hash(cellId);
  vec2 off = vec2(h - 0.5, fract(h * 13.7) - 0.5) * 0.6;
  float r = 0.03 + 0.04 * fract(h * 7.3);
  float bub = smoothstep(r, r * 0.3, length(f - off)) * step(0.55, h);
  col += vec3(0.6, 1.0, 0.95) * bub * 0.35 * smoothstep(0.0, 0.5, uv.y);

  // vinheta
  col *= 0.75 + 0.25 * smoothstep(1.3, 0.2, length(vec2((uv.x - 0.5) * 1.4, uv.y - 0.6)));
  // granulação leve
  col += (hash(gl_FragCoord.xy + t) - 0.5) * 0.012;
  gl_FragColor = vec4(col, 1.0);
}
`

/** Folhas de vitória-régia vistas de baixo, recortadas contra a superfície iluminada. */
function LilyPads() {
  const pads = useMemo(
    () => [
      { x: 120, y: 18, r: 120, a: 0.4 },
      { x: 300, y: -10, r: 80, a: 2.2 },
      { x: 455, y: 30, r: 46, a: 4.1 },
      { x: 1010, y: 4, r: 96, a: 1.3 },
      { x: 1230, y: 34, r: 140, a: 3.3 },
      { x: 1400, y: -6, r: 70, a: 5.4 },
    ],
    [],
  )
  return (
    <svg className="cl-pads" viewBox="0 0 1440 200" preserveAspectRatio="xMidYMin slice" aria-hidden="true">
      {pads.map((p, i) => {
        // círculo com um corte em "V", achatado pela perspectiva
        const notch = 0.22
        const a0 = p.a + notch
        const a1 = p.a - notch + Math.PI * 2
        const x0 = Math.cos(a0) * p.r
        const y0 = Math.sin(a0) * p.r
        const x1 = Math.cos(a1) * p.r
        const y1 = Math.sin(a1) * p.r
        const d = `M0 0 L${x0.toFixed(1)} ${y0.toFixed(1)} A${p.r} ${p.r} 0 1 1 ${x1.toFixed(1)} ${y1.toFixed(1)} Z`
        return (
          <g key={i} className="cl-pad" transform={`translate(${p.x} ${p.y}) scale(1 0.36)`} style={{ animationDelay: `${-i * 1.7}s` }}>
            <path d={d} />
          </g>
        )
      })}
    </svg>
  )
}

function Plants({ side }: { side: 'left' | 'right' }) {
  const blades = useMemo(() => {
    const out: { d: string; delay: number; w: number }[] = []
    for (let i = 0; i < 14; i++) {
      const x = 10 + i * 13 + Math.sin(i * 7.3) * 6
      const h = 150 + ((i * 53) % 9) * 22
      const bend = (Math.sin(i * 2.1) * 0.5 + 0.5) * 40 - 10
      out.push({
        d: `M${x} 420 C ${x + bend * 0.2} ${420 - h * 0.4}, ${x + bend * 0.8} ${420 - h * 0.7}, ${x + bend} ${420 - h}`,
        delay: -i * 0.37,
        w: 3 + (i % 3) * 2.5,
      })
    }
    return out
  }, [])
  return (
    <svg className={`cl-plants cl-plants--${side}`} viewBox="0 0 220 420" aria-hidden="true">
      {blades.map((b, i) => (
        <path key={i} d={b.d} strokeWidth={b.w} style={{ animationDelay: `${b.delay}s` }} />
      ))}
    </svg>
  )
}

export function Closing() {
  const ref = useRef<HTMLElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  useReveal(ref)

  useEffect(() => {
    const c = canvas.current
    const section = ref.current
    if (!c || !section) return
    const fx = createShaderCanvas(c, FRAG, { scale: device.tier === 'high' ? 0.7 : 0.45, reduced: device.reducedMotion })
    if (!fx) {
      section.classList.add('is-static')
      return
    }
    const st = ScrollTrigger.create({
      trigger: section,
      start: 'top bottom',
      end: 'bottom top',
      onToggle: (s) => (s.isActive ? fx.start() : fx.stop()),
    })
    const onMove = (e: PointerEvent) => fx.setMouse(e.clientX / window.innerWidth, 1 - e.clientY / window.innerHeight)
    section.addEventListener('pointermove', onMove)
    return () => {
      st.kill()
      section.removeEventListener('pointermove', onMove)
      fx.dispose()
    }
  }, [])

  return (
    <section ref={ref} id="encerramento" className="cl" aria-labelledby="cl-title">
      <canvas ref={canvas} className="cl__fx" aria-hidden="true" />
      <LilyPads />
      <Plants side="left" />
      <Plants side="right" />

      <div className="cl__inner">
        <LogoMark className="cl__mark" data-reveal />
        <h2 id="cl-title" className="cl__title" data-split>
          <span className="split-line">
            <span>{closing.line1}</span>
          </span>
          <span className="split-line">
            <span className="serif">{closing.line2}</span>
          </span>
        </h2>
        <p className="cl__brand" data-reveal="1">
          <span className="cl__word">GOTA</span>
          <span className="cl__word cl__word--thin">TECH</span>
        </p>
        <p className="cl__tagline" data-reveal="2">
          {closing.tagline}
        </p>
        <button type="button" className="btn cl__top" data-reveal="3" onClick={() => scrollToTarget(0, { duration: 2.8 })}>
          Voltar ao início
          <span className="btn__icon">
            <ArrowUp />
          </span>
        </button>
      </div>

      <footer className="cl__foot">
        <p className="mono">
          {site.school} · {site.city} — {site.stateShort}
        </p>
      </footer>
    </section>
  )
}
