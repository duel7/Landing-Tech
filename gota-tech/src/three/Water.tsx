import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import {
  backGutterFlow,
  backRoute,
  COS,
  EAVE_Y,
  EAVE_Z,
  DOWN_X,
  faucetStream,
  frontGutterFlow,
  GUTTER_R,
  GUTTER_Y,
  GUTTER_Z,
  HOUSE_D,
  HOUSE_W,
  irrigationRoute,
  LAMP,
  mainRoute,
  PIPE_R,
  pointOn,
  RIDGE_Y,
  ROOF_X,
  samplePath,
  SIN,
  SLOPE_LEN,
  TAN,
  TANK,
  TANK_TOP,
  TILE_W,
  toiletRoute,
  type Sampled,
} from './layout'
import { REVEAL_TOP, revealPlane, sc } from './sceneState'
import { stage } from '../lib/stage'

const CYAN = new THREE.Color('#42E8E0')
const GREEN = new THREE.Color('#42D982')

function rand(n: number) {
  const s = Math.sin(n * 12.9898 + 78.233) * 43758.5453
  return s - Math.floor(s)
}

function instancedQuad(count: number, seedSize = 4) {
  const base = new THREE.PlaneGeometry(1, 1)
  const geo = new THREE.InstancedBufferGeometry()
  geo.index = base.index
  geo.setAttribute('position', base.getAttribute('position'))
  geo.setAttribute('uv', base.getAttribute('uv'))
  const seeds = new Float32Array(count * seedSize)
  for (let i = 0; i < seeds.length; i++) seeds[i] = rand(i + 1)
  geo.setAttribute('aSeed', new THREE.InstancedBufferAttribute(seeds, seedSize))
  geo.instanceCount = count
  // evita que a malha seja descartada por culling (as posições vêm do shader)
  geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 4, 0), 60)
  return geo
}

/* --------------------------------------------------------------------------
   Chuva
   -------------------------------------------------------------------------- */

export function Rain({ count }: { count: number }) {
  const { camera } = useThree()
  const geo = useMemo(() => instancedQuad(count), [count])
  const ray = useMemo(() => new THREE.Ray(), [])
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        toneMapped: false,
        uniforms: {
          uTime: { value: 0 },
          uIntensity: { value: 0 },
          uCenter: { value: new THREE.Vector3(2.5, 6.5, 1.5) },
          uSize: { value: new THREE.Vector3(30, 13, 24) },
          uWind: { value: new THREE.Vector2(-0.9, 0.35) },
          uRayO: { value: new THREE.Vector3() },
          uRayD: { value: new THREE.Vector3(0, 0, -1) },
          uRepel: { value: 0 },
          uLamp: { value: new THREE.Vector3(LAMP.x + LAMP.hx, LAMP.h, LAMP.z + LAMP.hz) },
          uLampOn: { value: 0 },
          uRoof: { value: new THREE.Vector4(ROOF_X, EAVE_Z, RIDGE_Y, TAN) },
          uTank: { value: new THREE.Vector4(TANK.x, TANK.z, TANK.r, TANK_TOP) },
        },
        vertexShader: /* glsl */ `
          uniform float uTime, uIntensity, uRepel, uLampOn;
          uniform vec3 uCenter, uSize, uRayO, uRayD, uLamp;
          uniform vec2 uWind;
          uniform vec4 uRoof, uTank;
          attribute vec4 aSeed;
          varying vec2 vUv; varying float vAlpha; varying float vLight;
          void main(){
            vUv = uv;
            float speed = 8.0 + aSeed.w * 4.0;
            float fall = uSize.y;
            float y = mod(aSeed.y * fall - uTime * speed, fall);
            vec3 p = uCenter + vec3((aSeed.x - 0.5) * uSize.x, y - fall * 0.5, (aSeed.z - 0.5) * uSize.z);
            p.xz += uWind * (fall - y) * 0.035;

            // o cursor abre um pequeno "guarda-chuva" na linha de visão
            float t = dot(p - uRayO, uRayD);
            vec3 c = uRayO + uRayD * t;
            vec3 off = p - c;
            float d = length(off);
            float r = 0.055 * max(t, 0.0); // tamanho constante na tela
            p += normalize(off + vec3(1e-4)) * max(0.0, r - d) * uRepel * step(0.0, t);

            float on = step(aSeed.w, uIntensity);
            // gotas que já atingiram o telhado ou o reservatório somem
            float roofY = uRoof.z - abs(p.z) * uRoof.w;
            float overRoof = step(abs(p.x), uRoof.x) * step(abs(p.z), uRoof.y);
            on *= 1.0 - overRoof * step(p.y, roofY);
            float overTank = step(length(p.xz - uTank.xy), uTank.z);
            on *= 1.0 - overTank * step(p.y, uTank.w);
            on *= step(0.0, p.y);

            vec3 dir = normalize(vec3(uWind.x * 0.035, -1.0, uWind.y * 0.035));
            vec3 toCam = normalize(cameraPosition - p);
            vec3 side = normalize(cross(dir, toCam));
            float len = 0.22 + aSeed.w * 0.26;
            vec3 pos = p + side * position.x * 0.011 + dir * position.y * len;
            vec4 mv = viewMatrix * vec4(pos, 1.0);
            gl_Position = projectionMatrix * mv;
            float depth = -mv.z;
            vAlpha = on * smoothstep(42.0, 10.0, depth) * smoothstep(0.4, 2.0, depth);
            float ld = length(p.xz - uLamp.xz);
            vLight = smoothstep(2.4, 0.0, ld) * step(p.y, uLamp.y) * uLampOn;
          }
        `,
        fragmentShader: /* glsl */ `
          varying vec2 vUv; varying float vAlpha; varying float vLight;
          void main(){
            float edge = 1.0 - abs(vUv.x * 2.0 - 1.0);
            float head = mix(0.2, 1.0, 1.0 - vUv.y);
            float a = vAlpha * edge * head * (0.13 + vLight * 0.8);
            vec3 col = mix(vec3(0.62, 0.86, 1.0), vec3(1.0, 0.98, 0.92), vLight);
            gl_FragColor = vec4(col, a);
          }
        `,
      }),
    [],
  )
  useFrame(() => {
    const u = mat.uniforms
    u.uTime.value = sc.flowTime
    u.uIntensity.value = sc.rain
    u.uLampOn.value = sc.lamp
    ray.origin.copy(camera.position)
    ray.direction.set(stage.pointer.x, stage.pointer.y, 0.5).unproject(camera).sub(camera.position).normalize()
    u.uRayO.value.copy(ray.origin)
    u.uRayD.value.copy(ray.direction)
    const target = stage.pointer.active ? 1 : 0
    u.uRepel.value += (target - u.uRepel.value) * 0.08
  })
  return <mesh geometry={geo} material={mat} frustumCulled={false} renderOrder={5} />
}

/* --------------------------------------------------------------------------
   Respingos (telhado e chão)
   -------------------------------------------------------------------------- */

export function Splashes({ count, surface }: { count: number; surface: 'roof' | 'ground' }) {
  const geo = useMemo(() => instancedQuad(count), [count])
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        toneMapped: false,
        uniforms: {
          uTime: { value: 0 },
          uIntensity: { value: 0 },
          uRoof: { value: new THREE.Vector4(ROOF_X, EAVE_Z, EAVE_Y, SLOPE_LEN) },
          uSC: { value: new THREE.Vector2(SIN, COS) },
          uHouse: { value: new THREE.Vector2(HOUSE_W / 2 + 0.6, HOUSE_D / 2 + 0.6) },
        },
        side: THREE.DoubleSide,
        defines: { ROOF: surface === 'roof' ? 1 : 0 },
        vertexShader: /* glsl */ `
          uniform float uTime, uIntensity; uniform vec4 uRoof; uniform vec2 uSC; uniform vec2 uHouse;
          attribute vec4 aSeed;
          varying vec2 vUv; varying float vLife; varying float vOn;
          float h(float n){ return fract(sin(n * 12.9898) * 43758.5453); }
          void main(){
            vUv = uv;
            float period = 0.5 + aSeed.x * 0.5;
            float tt = uTime / period + aSeed.y * 10.0;
            float cyc = floor(tt);
            vLife = fract(tt);
            float r1 = h(cyc * 1.7 + aSeed.z * 91.0);
            float r2 = h(cyc * 3.1 + aSeed.w * 37.0);
            vOn = step(aSeed.w, uIntensity);
            vec3 p; vec3 t1 = vec3(1.0, 0.0, 0.0); vec3 t2;
            float size;
          #if ROOF == 1
            float side = aSeed.z > 0.5 ? 1.0 : -1.0;
            float s = r2 * uRoof.w;
            p = vec3((r1 * 2.0 - 1.0) * uRoof.x, uRoof.z + s * uSC.x + 0.06, side * (uRoof.y - s * uSC.y));
            t2 = vec3(0.0, uSC.x, -side * uSC.y);
            size = 0.025 + vLife * 0.075;
          #else
            p = vec3(-9.0 + r1 * 22.0, 0.015, -6.0 + r2 * 14.0);
            vOn *= 1.0 - step(abs(p.x), uHouse.x) * step(abs(p.z), uHouse.y);
            t2 = vec3(0.0, 0.0, 1.0);
            size = 0.05 + vLife * 0.2;
          #endif
            vec3 pos = p + (t1 * position.x + t2 * position.y) * size;
            vec4 mv = viewMatrix * vec4(pos, 1.0);
            gl_Position = projectionMatrix * mv;
            vOn *= smoothstep(38.0, 12.0, -mv.z);
          }
        `,
        fragmentShader: /* glsl */ `
          varying vec2 vUv; varying float vLife; varying float vOn;
          void main(){
            float r = length(vUv * 2.0 - 1.0);
            float ring = smoothstep(0.14, 0.0, abs(r - 0.8));
            float a = ring * pow(1.0 - vLife, 1.5) * vOn * 0.32;
            gl_FragColor = vec4(vec3(0.7, 0.92, 1.0), a);
          }
        `,
      }),
    [surface],
  )
  useFrame(() => {
    mat.uniforms.uTime.value = sc.flowTime
    mat.uniforms.uIntensity.value = sc.rain * (surface === 'roof' ? 1 : 0.85)
  })
  return <mesh geometry={geo} material={mat} frustumCulled={false} renderOrder={4} />
}

/* --------------------------------------------------------------------------
   Filetes escorrendo pelos canais das telhas
   -------------------------------------------------------------------------- */

export function RoofStreaks({ count }: { count: number }) {
  const geo = useMemo(() => instancedQuad(count), [count])
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        toneMapped: false,
        uniforms: {
          uTime: { value: 0 },
          uIntensity: { value: 0 },
          uRoof: { value: new THREE.Vector4(ROOF_X, EAVE_Z, EAVE_Y, SLOPE_LEN) },
          uSC: { value: new THREE.Vector2(SIN, COS) },
          uTileW: { value: TILE_W },
        },
        side: THREE.DoubleSide,
        vertexShader: /* glsl */ `
          uniform float uTime, uIntensity, uTileW; uniform vec4 uRoof; uniform vec2 uSC;
          attribute vec4 aSeed;
          varying vec2 vUv; varying float vA;
          void main(){
            vUv = uv;
            float side = aSeed.w > 0.42 ? 1.0 : -1.0;
            float tiles = floor(uRoof.x * 2.0 / uTileW);
            float idx = floor(aSeed.x * tiles) + 1.0;
            float x = side > 0.0 ? -uRoof.x + idx * uTileW : uRoof.x - idx * uTileW;
            float t = fract(aSeed.y + uTime * (0.22 + aSeed.z * 0.2));
            float s = (1.0 - t) * uRoof.w; // distância a partir do beiral
            vec3 n = vec3(0.0, uSC.y, side * uSC.x);
            vec3 down = vec3(0.0, -uSC.x, side * uSC.y);
            vec3 p = vec3(x, uRoof.z + s * uSC.x, side * (uRoof.y - s * uSC.y)) + n * 0.035;
            vec3 across = vec3(1.0, 0.0, 0.0);
            float len = 0.2 + aSeed.z * 0.16;
            vec3 pos = p + across * position.x * 0.02 + down * position.y * len;
            gl_Position = projectionMatrix * viewMatrix * vec4(pos, 1.0);
            vA = smoothstep(0.0, 0.18, t) * smoothstep(1.0, 0.9, t) * step(aSeed.z, uIntensity);
          }
        `,
        fragmentShader: /* glsl */ `
          varying vec2 vUv; varying float vA;
          void main(){
            float edge = 1.0 - abs(vUv.x * 2.0 - 1.0);
            float head = pow(vUv.y, 2.4);
            gl_FragColor = vec4(vec3(0.5, 1.3, 1.4), vA * edge * head * 0.62);
          }
        `,
      }),
    [],
  )
  useFrame(() => {
    mat.uniforms.uTime.value = sc.flowTime
    mat.uniforms.uIntensity.value = sc.roofFlow
  })
  return <mesh geometry={geo} material={mat} frustumCulled={false} renderOrder={6} />
}

/* --------------------------------------------------------------------------
   Lâmina d'água correndo dentro das calhas
   -------------------------------------------------------------------------- */

export function GutterWater() {
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        toneMapped: false,
        uniforms: { uTime: { value: 0 }, uAlpha: { value: 0 }, uBoost: { value: 0 } },
        vertexShader: /* glsl */ `
          varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }
        `,
        fragmentShader: /* glsl */ `
          varying vec2 vUv; uniform float uTime, uAlpha, uBoost;
          void main(){
            float x = vUv.x * 60.0 - uTime * 7.0;
            float w = 0.5 + 0.5 * sin(x + sin(vUv.y * 9.0 + uTime * 2.0) * 1.5);
            float streak = smoothstep(0.55, 1.0, w);
            float edge = smoothstep(0.0, 0.3, vUv.y) * smoothstep(1.0, 0.7, vUv.y);
            float a = (0.18 + streak * 0.6) * edge * uAlpha * (1.0 + uBoost * 1.4);
            gl_FragColor = vec4(vec3(0.35, 1.25, 1.35), a);
          }
        `,
      }),
    [],
  )
  useFrame(() => {
    mat.uniforms.uTime.value = sc.flowTime
    mat.uniforms.uAlpha.value = sc.gutterFlow
    const s = stage.s
    mat.uniforms.uBoost.value = Math.max(0, Math.min(1, (s - 0.8) / 0.4)) * Math.max(0, Math.min(1, (2.4 - s) / 0.5))
  })
  const len = DOWN_X + ROOF_X
  return (
    <>
      {[GUTTER_Z, -GUTTER_Z].map((z) => (
        <mesh key={z} material={mat} position={[(-ROOF_X + DOWN_X) / 2, GUTTER_Y - GUTTER_R * 0.55, z]} rotation-x={-Math.PI / 2} renderOrder={6}>
          <planeGeometry args={[len, GUTTER_R * 1.5]} />
        </mesh>
      ))}
    </>
  )
}

/* --------------------------------------------------------------------------
   Brilho que acompanha a tubulação
   -------------------------------------------------------------------------- */

function makeGlowMaterial(color: THREE.Color) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    toneMapped: false,
    uniforms: { uFill: { value: 0 }, uTime: { value: 0 }, uAlpha: { value: 0 }, uColor: { value: color.clone() } },
    vertexShader: /* glsl */ `
      varying vec2 vUv; varying vec3 vN; varying vec3 vV;
      void main(){
        vUv = uv;
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vN = normalize(mat3(modelMatrix) * normal);
        vV = normalize(cameraPosition - wp.xyz);
        gl_Position = projectionMatrix * viewMatrix * wp;
      }
    `,
    fragmentShader: /* glsl */ `
      varying vec2 vUv; varying vec3 vN; varying vec3 vV;
      uniform float uFill, uTime, uAlpha; uniform vec3 uColor;
      void main(){
        float fres = pow(1.0 - abs(dot(vN, vV)), 2.2);
        float filled = smoothstep(uFill + 0.004, uFill - 0.03, vUv.x);
        float pulse = 0.55 + 0.45 * sin(vUv.x * 70.0 - uTime * 5.0);
        float front = exp(-pow((vUv.x - uFill) * 55.0, 2.0)) * step(0.002, uFill) * step(uFill, 0.995);
        float a = (fres * 0.85 + 0.12) * filled * pulse + front * 1.6;
        gl_FragColor = vec4(uColor * 1.6, a * uAlpha);
      }
    `,
  })
}

export function PipeGlow() {
  const geos = useMemo(
    () => ({
      main: new THREE.TubeGeometry(mainRoute, 220, PIPE_R * 1.75, 14, false),
      back: new THREE.TubeGeometry(backRoute, 140, PIPE_R * 1.75, 14, false),
      irr: new THREE.TubeGeometry(irrigationRoute, 120, 0.06, 10, false),
      wc: new THREE.TubeGeometry(toiletRoute, 140, 0.06, 10, false),
    }),
    [],
  )
  const mats = useMemo(
    () => ({ main: makeGlowMaterial(CYAN), back: makeGlowMaterial(CYAN), irr: makeGlowMaterial(GREEN), wc: makeGlowMaterial(GREEN) }),
    [],
  )
  useFrame(() => {
    const t = sc.flowTime
    Object.values(mats).forEach((m) => (m.uniforms.uTime.value = t))
    mats.main.uniforms.uFill.value = sc.pipeFill
    mats.main.uniforms.uAlpha.value = sc.xray
    mats.back.uniforms.uFill.value = sc.backFill
    mats.back.uniforms.uAlpha.value = sc.xray
    mats.irr.uniforms.uFill.value = sc.reuseFill
    mats.irr.uniforms.uAlpha.value = sc.reuse
    mats.wc.uniforms.uFill.value = sc.reuseFill
    mats.wc.uniforms.uAlpha.value = sc.reuse
  })
  return (
    <group renderOrder={7}>
      <mesh geometry={geos.main} material={mats.main} />
      <mesh geometry={geos.back} material={mats.back} />
      <mesh geometry={geos.irr} material={mats.irr} />
      <mesh geometry={geos.wc} material={mats.wc} />
    </group>
  )
}

/* --------------------------------------------------------------------------
   Partículas que percorrem o sistema
   -------------------------------------------------------------------------- */

type FlowDef = {
  path: Sampled
  count: number
  speed: number
  color: THREE.Color
  jitter: number
  size: number
  alpha: (t: number) => number
}

export function FlowParticles({ scale = 1 }: { scale?: number }) {
  const inlet = useMemo(
    () => samplePath(new THREE.LineCurve3(new THREE.Vector3(TANK.x, TANK_TOP - 0.08, GUTTER_Z), new THREE.Vector3(TANK.x, 0.22, GUTTER_Z)), 64),
    [],
  )
  const defs = useMemo<FlowDef[]>(() => {
    const gate = (t: number, fill: number) => THREE.MathUtils.clamp((fill - t) / 0.025, 0, 1)
    const n = (c: number) => Math.max(6, Math.round(c * scale))
    return [
      { path: samplePath(frontGutterFlow, 128), count: n(70), speed: 0.55, color: CYAN, jitter: 0.05, size: 0.55, alpha: () => sc.gutterFlow * 0.9 },
      { path: samplePath(backGutterFlow, 128), count: n(46), speed: 0.55, color: CYAN, jitter: 0.05, size: 0.55, alpha: () => sc.gutterFlow * 0.8 },
      { path: samplePath(mainRoute, 400), count: n(120), speed: 0.75, color: CYAN, jitter: PIPE_R * 0.55, size: 0.6, alpha: (t) => sc.xray * gate(t, sc.pipeFill) },
      { path: samplePath(backRoute, 200), count: n(46), speed: 0.75, color: CYAN, jitter: PIPE_R * 0.55, size: 0.6, alpha: (t) => sc.xray * gate(t, sc.backFill) },
      {
        path: inlet,
        count: n(30),
        speed: 1.4,
        color: CYAN,
        jitter: 0.02,
        size: 0.5,
        alpha: (t) => {
          const y = TANK_TOP - 0.08 - t * (TANK_TOP - 0.3)
          const surface = TANK.base + sc.level * TANK.h
          return sc.tank * (sc.pipeFill > 0.97 ? 1 : 0) * (y > surface ? 1 : 0)
        },
      },
      { path: samplePath(irrigationRoute, 200), count: n(44), speed: 0.6, color: GREEN, jitter: 0.02, size: 0.6, alpha: (t) => sc.reuse * gate(t, sc.reuseFill) },
      { path: samplePath(toiletRoute, 200), count: n(50), speed: 0.6, color: GREEN, jitter: 0.02, size: 0.6, alpha: (t) => sc.reuse * gate(t, sc.reuseFill) },
      { path: samplePath(faucetStream, 32), count: n(26), speed: 1.3, color: GREEN, jitter: 0.008, size: 0.45, alpha: () => sc.reuse * sc.reuseFill },
    ]
  }, [inlet, scale])

  const total = defs.reduce((a, d) => a + d.count, 0)
  const { geo, seeds } = useMemo(() => {
    const g = new THREE.BufferGeometry()
    const pos = new Float32Array(total * 3)
    const col = new Float32Array(total * 3)
    const alpha = new Float32Array(total)
    const size = new Float32Array(total)
    const sd = new Float32Array(total * 4)
    let k = 0
    defs.forEach((d) => {
      for (let i = 0; i < d.count; i++, k++) {
        d.color.toArray(col, k * 3)
        size[k] = d.size * (0.7 + rand(k * 3.3) * 0.6)
        sd[k * 4] = rand(k * 1.1)
        sd[k * 4 + 1] = rand(k * 2.7)
        sd[k * 4 + 2] = rand(k * 5.9)
        sd[k * 4 + 3] = rand(k * 8.3)
      }
    })
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    g.setAttribute('aColor', new THREE.BufferAttribute(col, 3))
    g.setAttribute('aAlpha', new THREE.BufferAttribute(alpha, 1))
    g.setAttribute('aSize', new THREE.BufferAttribute(size, 1))
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(2, 2, 0), 30)
    return { geo: g, seeds: sd }
  }, [defs, total])

  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        toneMapped: false,
        uniforms: { uScale: { value: 1 } },
        vertexShader: /* glsl */ `
          uniform float uScale;
          attribute vec3 aColor; attribute float aAlpha; attribute float aSize;
          varying vec3 vColor; varying float vAlpha;
          void main(){
            vColor = aColor; vAlpha = aAlpha;
            vec4 mv = modelViewMatrix * vec4(position, 1.0);
            gl_Position = projectionMatrix * mv;
            gl_PointSize = aSize * uScale / -mv.z;
          }
        `,
        fragmentShader: /* glsl */ `
          varying vec3 vColor; varying float vAlpha;
          void main(){
            vec2 c = gl_PointCoord * 2.0 - 1.0;
            float d = dot(c, c);
            float a = exp(-d * 3.2) * vAlpha;
            gl_FragColor = vec4(vColor * 1.8, a);
          }
        `,
      }),
    [],
  )

  const tmp = useMemo(() => new THREE.Vector3(), [])
  const { size: viewport, gl } = useThree()
  useFrame(() => {
    mat.uniforms.uScale.value = viewport.height * gl.getPixelRatio() * 0.06
    const pos = geo.getAttribute('position') as THREE.BufferAttribute
    const al = geo.getAttribute('aAlpha') as THREE.BufferAttribute
    const time = sc.flowTime
    let k = 0
    defs.forEach((d) => {
      const lenFactor = d.speed / Math.max(0.2, d.path.length)
      for (let i = 0; i < d.count; i++, k++) {
        const t = (seeds[k * 4] + time * lenFactor * (0.85 + seeds[k * 4 + 1] * 0.3)) % 1
        pointOn(d.path, t, tmp)
        const a = seeds[k * 4 + 2] * Math.PI * 2
        const r = d.jitter * Math.sqrt(seeds[k * 4 + 3])
        pos.setXYZ(k, tmp.x + Math.cos(a) * r * 0.3, tmp.y + Math.sin(a) * r, tmp.z + Math.cos(a) * r)
        const fade = Math.min(1, t * 12, (1 - t) * 12)
        al.setX(k, Math.max(0, d.alpha(t)) * fade)
      }
    })
    pos.needsUpdate = true
    al.needsUpdate = true
  })
  return <points geometry={geo} material={mat} frustumCulled={false} renderOrder={8} />
}

/* --------------------------------------------------------------------------
   Água dentro do reservatório (raio-x da etapa 04)
   -------------------------------------------------------------------------- */

export function TankWater() {
  const group = useRef<THREE.Group>(null)
  const body = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#0a62c2',
        emissive: '#0d7fd6',
        emissiveIntensity: 0.35,
        roughness: 0.2,
        transparent: true,
        opacity: 0.6,
        depthWrite: false,
      }),
    [],
  )
  const surface = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        toneMapped: false,
        uniforms: { uTime: { value: 0 }, uAlpha: { value: 0 }, uInlet: { value: new THREE.Vector2(0, (GUTTER_Z - TANK.z) / (TANK.r - 0.04)) } },
        vertexShader: /* glsl */ `
          varying vec2 vP; void main(){ vP = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }
        `,
        fragmentShader: /* glsl */ `
          varying vec2 vP; uniform float uTime, uAlpha; uniform vec2 uInlet;
          void main(){
            vec2 p = vP / ${(TANK.r - 0.04).toFixed(3)};
            float d = length(p - vec2(uInlet.x, -uInlet.y));
            float rings = 0.5 + 0.5 * sin(d * 34.0 - uTime * 6.0);
            rings *= smoothstep(1.2, 0.0, d);
            float rim = smoothstep(0.82, 1.0, length(p));
            vec3 col = mix(vec3(0.05, 0.42, 0.75), vec3(0.4, 1.3, 1.35), rings * 0.6 + rim * 0.5);
            gl_FragColor = vec4(col, (0.55 + rings * 0.3 + rim * 0.3) * uAlpha);
          }
        `,
      }),
    [],
  )
  const top = useRef<THREE.Mesh>(null)
  const column = useRef<THREE.Mesh>(null)
  useFrame(() => {
    const a = sc.tank
    if (group.current) group.current.visible = a > 0.01
    const h = Math.max(0.02, sc.level * TANK.h)
    if (column.current) {
      column.current.scale.y = h
      column.current.position.y = TANK.base + h / 2
    }
    if (top.current) top.current.position.y = TANK.base + h
    body.opacity = 0.55 * a
    surface.uniforms.uAlpha.value = a
    surface.uniforms.uTime.value = sc.flowTime
  })
  return (
    <group ref={group} position={[TANK.x, 0, TANK.z]} visible={false}>
      <mesh ref={column} material={body} renderOrder={2}>
        <cylinderGeometry args={[TANK.r - 0.04, TANK.r - 0.04, 1, 48, 1, true]} />
      </mesh>
      <mesh ref={top} material={surface} rotation-x={-Math.PI / 2} renderOrder={3}>
        <circleGeometry args={[TANK.r - 0.04, 48]} />
      </mesh>
    </group>
  )
}

/* --------------------------------------------------------------------------
   Partículas em suspensão (entrada) e plano de varredura da revelação
   -------------------------------------------------------------------------- */

export function Motes({ count }: { count: number }) {
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry()
    const p = new Float32Array(count * 3)
    const s = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      p[i * 3] = -10 + rand(i * 1.3) * 24
      p[i * 3 + 1] = 0.2 + rand(i * 2.1) * 7
      p[i * 3 + 2] = -8 + rand(i * 3.7) * 18
      s[i] = rand(i * 5.1)
    }
    g.setAttribute('position', new THREE.BufferAttribute(p, 3))
    g.setAttribute('aSeed', new THREE.BufferAttribute(s, 1))
    return g
  }, [count])
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        toneMapped: false,
        uniforms: { uTime: { value: 0 }, uAlpha: { value: 0 }, uScale: { value: 1 } },
        vertexShader: /* glsl */ `
          uniform float uTime, uScale; attribute float aSeed; varying float vA;
          void main(){
            vec3 p = position;
            p.x += sin(uTime * 0.2 + aSeed * 20.0) * 0.4;
            p.y += mod(uTime * (0.05 + aSeed * 0.06), 1.5) - 0.75;
            p.z += cos(uTime * 0.17 + aSeed * 13.0) * 0.4;
            vec4 mv = modelViewMatrix * vec4(p, 1.0);
            gl_Position = projectionMatrix * mv;
            gl_PointSize = (0.3 + aSeed * 0.5) * uScale / -mv.z;
            vA = smoothstep(30.0, 6.0, -mv.z) * (0.6 + 0.4 * sin(uTime * (0.6 + aSeed) + aSeed * 30.0));
          }
        `,
        fragmentShader: /* glsl */ `
          uniform float uAlpha; varying float vA;
          void main(){
            vec2 c = gl_PointCoord * 2.0 - 1.0;
            float a = exp(-dot(c,c) * 4.0) * vA * uAlpha * 0.55;
            gl_FragColor = vec4(vec3(0.55, 0.9, 1.0), a);
          }
        `,
      }),
    [],
  )
  const { size, gl } = useThree()
  useFrame(() => {
    mat.uniforms.uTime.value = sc.flowTime
    mat.uniforms.uAlpha.value = sc.motes
    mat.uniforms.uScale.value = size.height * gl.getPixelRatio() * 0.06
  })
  return <points geometry={geo} material={mat} frustumCulled={false} />
}

export function ScanSlice() {
  const ref = useRef<THREE.Mesh>(null)
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        toneMapped: false,
        side: THREE.DoubleSide,
        uniforms: { uAlpha: { value: 0 } },
        vertexShader: /* glsl */ `
          varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }
        `,
        fragmentShader: /* glsl */ `
          varying vec2 vUv; uniform float uAlpha;
          void main(){
            vec2 g = abs(fract(vUv * vec2(42.0, 30.0)) - 0.5);
            float grid = 1.0 - smoothstep(0.0, 0.05, min(g.x, g.y));
            vec2 e = min(vUv, 1.0 - vUv);
            float border = 1.0 - smoothstep(0.0, 0.01, min(e.x, e.y));
            float fade = smoothstep(0.0, 0.25, min(e.x, e.y) + 0.05);
            float a = (grid * 0.25 * fade + border * 0.9) * uAlpha;
            gl_FragColor = vec4(vec3(0.3, 1.2, 1.3), a);
          }
        `,
      }),
    [],
  )
  useFrame(() => {
    const r = sc.reveal
    const a = r > 0 && r < 1 ? Math.min(1, r * 8) * Math.min(1, (1 - r) * 6) : 0
    mat.uniforms.uAlpha.value = a
    if (ref.current) {
      ref.current.visible = a > 0.001
      ref.current.position.y = Math.min(REVEAL_TOP, revealPlane.constant)
    }
  })
  return (
    <mesh ref={ref} material={mat} rotation-x={-Math.PI / 2} position={[1.2, 0, 0.4]} visible={false} renderOrder={9}>
      <planeGeometry args={[12.6, 7.6]} />
    </mesh>
  )
}

/** Anéis pulsando nos pontos de reaproveitamento (etapa 05). */
export function ReuseRings({ points }: { points: THREE.Vector3[] }) {
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        toneMapped: false,
        uniforms: { uTime: { value: 0 }, uAlpha: { value: 0 } },
        vertexShader: /* glsl */ `
          varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }
        `,
        fragmentShader: /* glsl */ `
          varying vec2 vUv; uniform float uTime, uAlpha;
          void main(){
            float r = length(vUv * 2.0 - 1.0);
            float a = 0.0;
            for (int i = 0; i < 3; i++) {
              float ph = fract(uTime * 0.45 + float(i) / 3.0);
              a += smoothstep(0.05, 0.0, abs(r - ph)) * (1.0 - ph);
            }
            a += smoothstep(0.14, 0.08, r) * 0.6;
            gl_FragColor = vec4(vec3(0.35, 1.4, 0.8), a * uAlpha);
          }
        `,
      }),
    [],
  )
  useFrame(() => {
    mat.uniforms.uTime.value = sc.flowTime
    mat.uniforms.uAlpha.value = sc.reuse * sc.reuseFill
  })
  return (
    <>
      {points.map((p, i) => (
        <mesh key={i} material={mat} position={[p.x, 0.03, p.z]} rotation-x={-Math.PI / 2} renderOrder={9}>
          <planeGeometry args={[1.3, 1.3]} />
        </mesh>
      ))}
    </>
  )
}
