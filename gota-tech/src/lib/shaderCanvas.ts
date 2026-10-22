// Canvas com um único shader de tela cheia (WebGL puro, sem dependências).
// Renderiza em resolução reduzida, só quando visível; com movimento reduzido,
// desenha um quadro estático. Retorna null se o WebGL não estiver disponível.

const VERT = `
attribute vec2 aPos;
void main(){ gl_Position = vec4(aPos, 0.0, 1.0); }
`

export function createShaderCanvas(canvas: HTMLCanvasElement, fragment: string, opts: { scale?: number; reduced?: boolean } = {}) {
  const gl = canvas.getContext('webgl', { antialias: false, alpha: false, premultipliedAlpha: false, powerPreference: 'low-power' })
  if (!gl || gl.isContextLost()) return null

  const compile = (type: number, src: string) => {
    const s = gl.createShader(type)!
    gl.shaderSource(s, src)
    gl.compileShader(s)
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.error('Gota Tech · shader:', gl.getShaderInfoLog(s))
      return null
    }
    return s
  }
  const vs = compile(gl.VERTEX_SHADER, VERT)
  const fs = compile(gl.FRAGMENT_SHADER, fragment)
  if (!vs || !fs) return null
  const prog = gl.createProgram()!
  gl.attachShader(prog, vs)
  gl.attachShader(prog, fs)
  gl.linkProgram(prog)
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null
  gl.useProgram(prog)

  const buf = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buf)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
  const loc = gl.getAttribLocation(prog, 'aPos')
  gl.enableVertexAttribArray(loc)
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)

  const uRes = gl.getUniformLocation(prog, 'uRes')
  const uTime = gl.getUniformLocation(prog, 'uTime')
  const uMouse = gl.getUniformLocation(prog, 'uMouse')

  const scale = opts.scale ?? 0.6
  const mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 }
  let raf = 0
  let running = false
  let start = performance.now()
  let lost = false

  const resize = () => {
    const rect = canvas.getBoundingClientRect()
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
    // limita a área renderizada (≈ 1,6 MP) — o efeito é suave, não precisa de mais
    const budget = Math.sqrt(1_600_000 / Math.max(1, rect.width * rect.height * dpr * dpr * scale * scale))
    const k = dpr * scale * Math.min(1, budget)
    canvas.width = Math.max(1, Math.round(rect.width * k))
    canvas.height = Math.max(1, Math.round(rect.height * k))
    gl.viewport(0, 0, canvas.width, canvas.height)
    if (!running) draw(opts.reduced ? 8 : (performance.now() - start) / 1000)
  }

  const draw = (t: number) => {
    if (lost) return
    mouse.x += (mouse.tx - mouse.x) * 0.04
    mouse.y += (mouse.ty - mouse.y) * 0.04
    gl.uniform2f(uRes, canvas.width, canvas.height)
    gl.uniform1f(uTime, t)
    gl.uniform2f(uMouse, mouse.x, mouse.y)
    gl.drawArrays(gl.TRIANGLES, 0, 3)
  }

  const loop = () => {
    if (!running) return
    draw((performance.now() - start) / 1000)
    raf = requestAnimationFrame(loop)
  }

  const onLost = (e: Event) => {
    e.preventDefault()
    lost = true
    running = false
  }
  canvas.addEventListener('webglcontextlost', onLost)

  resize()
  const ro = new ResizeObserver(resize)
  ro.observe(canvas)

  return {
    start() {
      if (running || opts.reduced || lost) return
      running = true
      start = performance.now() - 8000
      raf = requestAnimationFrame(loop)
    },
    stop() {
      running = false
      cancelAnimationFrame(raf)
    },
    setMouse(x: number, y: number) {
      mouse.tx = x
      mouse.ty = y
    },
    dispose() {
      running = false
      cancelAnimationFrame(raf)
      ro.disconnect()
      canvas.removeEventListener('webglcontextlost', onLost)
      // libera os recursos sem perder o contexto (o mesmo canvas pode ser reutilizado)
      gl.deleteBuffer(buf)
      gl.deleteProgram(prog)
      gl.deleteShader(vs)
      gl.deleteShader(fs)
    },
  }
}
