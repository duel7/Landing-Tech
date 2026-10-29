import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { anchors } from './layout'
import { sc } from './sceneState'

type LabelDef = {
  at: THREE.Vector3
  code?: string
  title: string
  sub?: string
  tone: 'cyan' | 'green'
  /** direção da caixa em relação ao ponto */
  dir: 'ne' | 'nw' | 'se' | 'sw'
  alpha: () => number
}

const LABELS: LabelDef[] = [
  { at: anchors.filter, code: '03', title: 'Filtro', tone: 'cyan', dir: 'se', alpha: () => sc.filter },
  { at: anchors.tank, code: '04', title: 'Reservatório', tone: 'cyan', dir: 'nw', alpha: () => sc.tank * (1 - sc.reuse) },
  { at: anchors.garden, title: 'Irrigação de plantas', tone: 'green', dir: 'nw', alpha: () => sc.reuse * sc.reuseFill },
  { at: anchors.cleaning, title: 'Limpeza de áreas externas', tone: 'green', dir: 'se', alpha: () => sc.reuse * sc.reuseFill },
  {
    at: anchors.toilets,
    title: 'Descargas sanitárias',
    tone: 'green',
    dir: 'nw',
    alpha: () => sc.reuse * sc.reuseFill,
  },
]

function build(def: LabelDef) {
  const el = document.createElement('div')
  el.className = `scene-label scene-label--${def.tone} scene-label--${def.dir}`
  el.setAttribute('aria-hidden', 'true')
  const dot = document.createElement('span')
  dot.className = 'scene-label__dot'
  const line = document.createElement('span')
  line.className = 'scene-label__line'
  const box = document.createElement('span')
  box.className = 'scene-label__box'
  if (def.code) {
    const c = document.createElement('span')
    c.className = 'scene-label__code'
    c.textContent = def.code
    box.appendChild(c)
  }
  const t = document.createElement('span')
  t.className = 'scene-label__title'
  t.textContent = def.title
  box.appendChild(t)
  if (def.sub) {
    const s = document.createElement('span')
    s.className = 'scene-label__sub'
    s.textContent = def.sub
    box.appendChild(s)
  }
  el.append(dot, line, box)
  return el
}

/**
 * Rótulos em HTML ancorados em pontos da cena. São elementos comuns, criados uma
 * vez e reposicionados a cada quadro pela projeção da câmera.
 */
export function Labels() {
  const { gl, camera, size } = useThree()
  const els = useRef<HTMLDivElement[]>([])
  const last = useRef<string[]>([])
  const v = useMemo(() => new THREE.Vector3(), [])

  useEffect(() => {
    const host = gl.domElement.parentElement
    if (!host) return
    const layer = document.createElement('div')
    layer.className = 'scene-labels'
    els.current = LABELS.map((def) => {
      const el = build(def)
      layer.appendChild(el)
      return el
    })
    last.current = LABELS.map(() => '')
    host.appendChild(layer)
    return () => layer.remove()
  }, [gl])

  useFrame(() => {
    LABELS.forEach((def, i) => {
      const el = els.current[i]
      if (!el) return
      const a = Math.round(def.alpha() * 100) / 100
      v.copy(def.at).project(camera)
      const onScreen = v.z < 1 && Math.abs(v.x) < 1.2 && Math.abs(v.y) < 1.2
      const show = a > 0.01 && onScreen
      const x = Math.round((v.x * 0.5 + 0.5) * size.width)
      const y = Math.round((-v.y * 0.5 + 0.5) * size.height + (1 - a) * 10)
      // perto das bordas, a caixa vira para o lado de dentro da tela
      const v0 = def.dir[0]
      let h = def.dir[1]
      if (x > size.width * 0.66) h = 'w'
      else if (x < size.width * 0.34) h = 'e'
      const dir = v0 + h
      const key = show ? `${x}|${y}|${a}|${dir}` : 'off'
      if (key === last.current[i]) return
      last.current[i] = key
      el.className = `scene-label scene-label--${def.tone} scene-label--${dir}`
      el.style.visibility = show ? 'visible' : 'hidden'
      el.style.opacity = String(a)
      el.style.transform = `translate3d(${x}px, ${y}px, 0)`
    })
  })

  return null
}
