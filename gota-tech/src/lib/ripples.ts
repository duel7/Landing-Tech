// Superfície d'água em canvas 2D: simulação de ondas em grade de baixa resolução,
// ampliada com suavização. Reage ao ponteiro e a gotas aleatórias.

type Options = {
  reduced: boolean
  /** cores da água: fundo superior, fundo inferior e brilho (RGB 0–255) */
  top: [number, number, number]
  bottom: [number, number, number]
  light: [number, number, number]
}

export function createRipples(canvas: HTMLCanvasElement, opts: Options) {
  const ctx = canvas.getContext('2d', { alpha: false })
  if (!ctx) return null
  const sim = document.createElement('canvas')
  const sctx = sim.getContext('2d')!
  let sw = 0
  let sh = 0
  let cell = 4
  let a = new Float32Array(0)
  let b = new Float32Array(0)
  let img: ImageData | null = null
  let raf = 0
  let running = false
  let nextDrop = 0
  let last = { x: -1, y: -1 }

  const resize = () => {
    const rect = canvas.getBoundingClientRect()
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = Math.max(1, Math.round(rect.width * dpr))
    canvas.height = Math.max(1, Math.round(rect.height * dpr))
    cell = Math.max(3, Math.round(rect.width / 380))
    sw = Math.max(16, Math.ceil(rect.width / cell))
    sh = Math.max(16, Math.ceil(rect.height / cell))
    sim.width = sw
    sim.height = sh
    a = new Float32Array(sw * sh)
    b = new Float32Array(sw * sh)
    img = sctx.createImageData(sw, sh)
    // pinta o fundo uma vez (útil com movimento reduzido)
    render()
  }

  const disturb = (cssX: number, cssY: number, radius: number, strength: number) => {
    const cx = Math.round(cssX / cell)
    const cy = Math.round(cssY / cell)
    const r = Math.max(1, Math.round(radius / cell))
    for (let y = -r; y <= r; y++) {
      for (let x = -r; x <= r; x++) {
        const px = cx + x
        const py = cy + y
        if (px < 1 || py < 1 || px >= sw - 1 || py >= sh - 1) continue
        const d = Math.sqrt(x * x + y * y) / r
        if (d <= 1) a[py * sw + px] += strength * (Math.cos(d * Math.PI) * 0.5 + 0.5)
      }
    }
  }

  const step = () => {
    for (let y = 1; y < sh - 1; y++) {
      const row = y * sw
      for (let x = 1; x < sw - 1; x++) {
        const i = row + x
        const v = (a[i - 1] + a[i + 1] + a[i - sw] + a[i + sw]) * 0.5 - b[i]
        b[i] = v * 0.982
      }
    }
    const t = a
    a = b
    b = t
  }

  function render() {
    if (!img) return
    const d = img.data
    const [tr, tg, tb] = opts.top
    const [br, bg, bb] = opts.bottom
    const [lr, lg, lb] = opts.light
    for (let y = 0; y < sh; y++) {
      const k = y / sh
      const r0 = tr + (br - tr) * k
      const g0 = tg + (bg - tg) * k
      const b0 = tb + (bb - tb) * k
      const row = y * sw
      for (let x = 0; x < sw; x++) {
        const i = row + x
        const dx = x > 0 && x < sw - 1 ? a[i - 1] - a[i + 1] : 0
        const dy = y > 0 && y < sh - 1 ? a[i - sw] - a[i + sw] : 0
        const s = (dx * 0.7 + dy) * 0.9
        const hi = s > 0 ? Math.min(0.85, s / 140) : 0
        const lo = s < 0 ? Math.min(1, -s / 200) : 0
        const o = i * 4
        d[o] = r0 + (lr - r0) * hi - r0 * lo * 0.5
        d[o + 1] = g0 + (lg - g0) * hi - g0 * lo * 0.5
        d[o + 2] = b0 + (lb - b0) * hi - b0 * lo * 0.5
        d[o + 3] = 255
      }
    }
    sctx.putImageData(img, 0, 0)
    ctx!.imageSmoothingEnabled = true
    ctx!.imageSmoothingQuality = 'high'
    ctx!.drawImage(sim, 0, 0, canvas.width, canvas.height)
  }

  const loop = (t: number) => {
    if (!running) return
    if (t > nextDrop) {
      const rect = canvas.getBoundingClientRect()
      disturb(Math.random() * rect.width, Math.random() * rect.height, 8 + Math.random() * 8, 160 + Math.random() * 140)
      nextDrop = t + 500 + Math.random() * 900
    }
    step()
    render()
    raf = requestAnimationFrame(loop)
  }

  const onMove = (e: PointerEvent) => {
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    if (Math.hypot(x - last.x, y - last.y) < 10) return
    last = { x, y }
    disturb(x, y, 8, 90)
  }

  const onDown = (e: PointerEvent) => {
    const rect = canvas.getBoundingClientRect()
    disturb(e.clientX - rect.left, e.clientY - rect.top, 16, 520)
  }

  resize()
  const ro = new ResizeObserver(resize)
  ro.observe(canvas)

  return {
    target: canvas,
    start() {
      if (running || opts.reduced) return
      running = true
      raf = requestAnimationFrame(loop)
    },
    stop() {
      running = false
      cancelAnimationFrame(raf)
    },
    bindPointer(el: HTMLElement) {
      if (opts.reduced) return () => {}
      el.addEventListener('pointermove', onMove)
      el.addEventListener('pointerdown', onDown)
      return () => {
        el.removeEventListener('pointermove', onMove)
        el.removeEventListener('pointerdown', onDown)
      }
    },
    dispose() {
      running = false
      cancelAnimationFrame(raf)
      ro.disconnect()
    },
  }
}
