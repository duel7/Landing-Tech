import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { MeshReflectorMaterial } from '@react-three/drei'
import * as THREE from 'three'
import { canopyGeometry, pavingTexture } from './geometry'
import { GARDEN, HOUSE_D, LAMP } from './layout'
import { revealPlane, sc } from './sceneState'

const clip = [revealPlane]

const hash = (n: number) => {
  const s = Math.sin(n * 91.3458) * 47453.5453
  return s - Math.floor(s)
}

// Bruma da chuva: mesma cor no horizonte do céu e na névoa da cena.
export const FOG_HEX = '#0a283a'

export function Sky() {
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        depthWrite: false,
        fog: false,
        uniforms: {
          uAmbient: { value: 0 },
          uTop: { value: new THREE.Color('#020b13') },
          uHorizon: { value: new THREE.Color(FOG_HEX) },
          uGlow: { value: new THREE.Color('#0d4a5a') },
        },
        vertexShader: /* glsl */ `
          varying vec3 vDir;
          void main(){ vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }
        `,
        fragmentShader: /* glsl */ `
          varying vec3 vDir; uniform float uAmbient; uniform vec3 uTop, uHorizon, uGlow;
          void main(){
            float h = vDir.y;
            vec3 col = mix(uHorizon, uTop, smoothstep(0.02, 0.6, h));
            // brilho difuso logo acima do horizonte (cidade distante sob a chuva)
            col += uGlow * exp(-pow((h - 0.12) * 5.0, 2.0)) * 0.12 * smoothstep(0.0, 0.06, h);
            gl_FragColor = vec4(col * (0.35 + 0.65 * uAmbient), 1.0);
            #include <tonemapping_fragment>
            #include <colorspace_fragment>
          }
        `,
      }),
    [],
  )
  useFrame(() => {
    mat.uniforms.uAmbient.value = sc.ambient
  })
  return (
    <mesh material={mat} renderOrder={-10}>
      <sphereGeometry args={[60, 32, 16]} />
    </mesh>
  )
}

export function Ground({ reflect }: { reflect: boolean }) {
  const paving = useMemo(() => {
    const t = pavingTexture()
    t.repeat.set(64, 64)
    return t
  }, [])
  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[220, 220]} />
        {reflect ? (
          <MeshReflectorMaterial
            map={paving}
            blur={[320, 90]}
            resolution={768}
            mixBlur={1}
            mixStrength={4.5}
            mixContrast={1.1}
            roughness={0.62}
            depthScale={0.9}
            minDepthThreshold={0.3}
            maxDepthThreshold={1.5}
            color="#9db3bf"
            metalness={0.3}
            mirror={0.75}
          />
        ) : (
          <meshStandardMaterial map={paving} color="#a3b8c4" roughness={0.45} metalness={0.2} envMapIntensity={1.4} />
        )}
      </mesh>
    </group>
  )
}

// gramados à esquerda e nos fundos, longe da área pavimentada
const PATCHES: { x: number; z: number; w: number; d: number }[] = [
  { x: -9.6, z: 0.5, w: 9, d: 18 },
  { x: 1.5, z: -7.6, w: 20, d: 6.2 },
]

function Lawn({ count }: { count: number }) {
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#123a2c', roughness: 0.95 }), [])
  const grass = useMemo(() => {
    const blade = new THREE.ConeGeometry(0.018, 0.22, 3)
    blade.translate(0, 0.11, 0)
    const mesh = new THREE.InstancedMesh(blade, new THREE.MeshStandardMaterial({ color: '#1f6047', roughness: 0.9 }), count)
    const m = new THREE.Matrix4()
    const q = new THREE.Quaternion()
    const e = new THREE.Euler()
    const color = new THREE.Color()
    let i = 0
    let n = 0
    while (i < count && n < count * 4) {
      n++
      const p = PATCHES[Math.floor(hash(n) * PATCHES.length)]
      const x = p.x + (hash(n * 3.1) - 0.5) * p.w
      const z = p.z + (hash(n * 7.7) - 0.5) * p.d
      e.set((hash(n * 1.3) - 0.5) * 0.5, hash(n * 2.9) * 6.28, (hash(n * 5.3) - 0.5) * 0.5)
      q.setFromEuler(e)
      const s = 0.6 + hash(n * 9.1) * 0.9
      m.compose(new THREE.Vector3(x, 0.02, z), q, new THREE.Vector3(s, s, s))
      mesh.setMatrixAt(i, m)
      color.setHSL(0.42 + hash(n * 4.4) * 0.05, 0.45, 0.16 + hash(n * 6.6) * 0.12)
      mesh.setColorAt(i, color)
      i++
    }
    mesh.count = i
    mesh.receiveShadow = true
    return mesh
  }, [count])
  return (
    <group>
      {PATCHES.map((p, i) => (
        <mesh key={i} material={mat} rotation-x={-Math.PI / 2} position={[p.x, 0.012, p.z]} receiveShadow>
          <planeGeometry args={[p.w, p.d]} />
        </mesh>
      ))}
      <primitive object={grass} />
    </group>
  )
}

const TREES = [
  { x: 11.2, z: -1.6, h: 2.2, s: 1.15, seed: 8 },
  { x: 13.6, z: 2.4, h: 2.6, s: 1.35, seed: 9 },
  { x: -6.6, z: -1.8, h: 2.3, s: 1.25, seed: 1 },
  { x: -5.2, z: -5.2, h: 2.8, s: 1.45, seed: 2 },
  { x: -8.6, z: 3.1, h: 2.0, s: 1.05, seed: 3 },
  { x: 1.6, z: -6.8, h: 3.0, s: 1.6, seed: 4 },
  { x: 9.4, z: -3.9, h: 2.4, s: 1.3, seed: 5 },
  { x: -2.6, z: -8.5, h: 2.6, s: 1.3, seed: 7 },
]

function Trees() {
  const parts = useMemo(() => {
    const trunk = new THREE.MeshStandardMaterial({ color: '#3a3128', roughness: 0.9, clippingPlanes: clip })
    const leaves = ['#14523d', '#1b6a4c', '#0f4434', '#226f4f'].map(
      (c) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.82, flatShading: true, clippingPlanes: clip }),
    )
    return {
      trunk,
      leaves,
      geos: TREES.map((t) => canopyGeometry(t.seed, t.s)),
    }
  }, [])
  return (
    <group>
      {TREES.map((t, i) => (
        <group key={i} position={[t.x, 0, t.z]}>
          <mesh material={parts.trunk} position={[0, t.h / 2, 0]} castShadow>
            <cylinderGeometry args={[0.07, 0.12, t.h, 7]} />
          </mesh>
          <mesh geometry={parts.geos[i]} material={parts.leaves[i % parts.leaves.length]} position={[0, t.h + 0.35 * t.s, 0]} castShadow receiveShadow />
        </group>
      ))}
    </group>
  )
}

function Shrubs() {
  const mats = useMemo(
    () =>
      ['#1a5a43', '#237556', '#2f8a5f', '#164a38'].map(
        (c) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.85, flatShading: true, clippingPlanes: clip }),
      ),
    [],
  )
  const items = useMemo(() => {
    const list: { p: [number, number, number]; r: number; m: number }[] = []
    // junto à fachada
    ;[-3.1, -2.75, -1.1, 1.05, 2.9].forEach((x, i) => list.push({ p: [x, 0.22, HOUSE_D / 2 + 0.4], r: 0.28 + hash(i) * 0.12, m: i % 4 }))
    // canteiro (irrigação)
    for (let i = 0; i < 9; i++) {
      const x = GARDEN.x - GARDEN.w / 2 + 0.18 + (i / 8) * (GARDEN.w - 0.36)
      const z = GARDEN.z + (hash(i * 3) - 0.5) * 0.3
      list.push({ p: [x, GARDEN.h + 0.1 + hash(i) * 0.06, z], r: 0.13 + hash(i * 7) * 0.1, m: (i + 1) % 4 })
    }
    // fundos
    ;[-4.6, -4.2, 4.3, 4.8].forEach((x, i) => list.push({ p: [x, 0.3, -3.4 - hash(i) * 0.6], r: 0.42 + hash(i * 5) * 0.2, m: (i + 2) % 4 }))
    return list
  }, [])
  return (
    <group>
      {items.map((s, i) => (
        <mesh key={i} material={mats[s.m]} position={s.p} scale={[1, 0.85, 1]} castShadow receiveShadow>
          <icosahedronGeometry args={[s.r, 1]} />
        </mesh>
      ))}
    </group>
  )
}

function Planter() {
  const wood = useMemo(() => new THREE.MeshStandardMaterial({ color: '#4a3a2c', roughness: 0.8, clippingPlanes: clip }), [])
  const soil = useMemo(() => new THREE.MeshStandardMaterial({ color: '#2a2019', roughness: 1, clippingPlanes: clip }), [])
  return (
    <group position={[GARDEN.x, 0, GARDEN.z]}>
      <mesh material={wood} position={[0, GARDEN.h / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[GARDEN.w, GARDEN.h, GARDEN.d]} />
      </mesh>
      <mesh material={soil} position={[0, GARDEN.h + 0.004, 0]} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[GARDEN.w - 0.08, GARDEN.d - 0.08]} />
      </mesh>
    </group>
  )
}

function LampPost() {
  const head = useRef<THREE.MeshStandardMaterial>(null)
  const spot = useRef<THREE.SpotLight>(null)
  const cone = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        toneMapped: false,
        uniforms: { uOn: { value: 0 } },
        vertexShader: /* glsl */ `
          varying vec2 vUv; varying vec3 vN; varying vec3 vV;
          void main(){
            vUv = uv;
            vec4 wp = modelMatrix * vec4(position,1.0);
            vN = normalize(mat3(modelMatrix) * normal);
            vV = normalize(cameraPosition - wp.xyz);
            gl_Position = projectionMatrix * viewMatrix * wp;
          }
        `,
        fragmentShader: /* glsl */ `
          varying vec2 vUv; varying vec3 vN; varying vec3 vV; uniform float uOn;
          void main(){
            float edge = pow(abs(dot(vN, vV)), 1.6);
            float fall = pow(vUv.y, 1.4);
            float a = edge * fall * 0.14 * uOn;
            gl_FragColor = vec4(vec3(0.72, 0.9, 1.0) * a, 1.0);
          }
        `,
      }),
    [],
  )
  const headPos = useMemo(() => new THREE.Vector3(LAMP.hx, LAMP.h - 0.06, LAMP.hz), [])
  const armAngle = Math.atan2(-LAMP.hz, LAMP.hx)
  const armLen = Math.hypot(LAMP.hx, LAMP.hz)
  const target = useMemo(() => {
    const o = new THREE.Object3D()
    o.position.set(LAMP.hx * 3.2, -LAMP.h, LAMP.hz * 3.2)
    return o
  }, [])
  useFrame(() => {
    if (head.current) head.current.emissiveIntensity = sc.lamp * 6
    if (spot.current) spot.current.intensity = sc.lamp * 60
    cone.uniforms.uOn.value = sc.lamp
  })
  const metal = useMemo(() => new THREE.MeshStandardMaterial({ color: '#1c262c', roughness: 0.5, metalness: 0.7 }), [])
  return (
    <group position={[LAMP.x, 0, LAMP.z]}>
      <mesh material={metal} position={[0, LAMP.h / 2, 0]} castShadow>
        <cylinderGeometry args={[0.04, 0.06, LAMP.h, 10]} />
      </mesh>
      <mesh material={metal} position={[LAMP.hx / 2, LAMP.h - 0.02, LAMP.hz / 2]} rotation={[0, armAngle, Math.PI / 2]}>
        <cylinderGeometry args={[0.025, 0.025, armLen, 8]} />
      </mesh>
      <group position={headPos} rotation-y={armAngle}>
        <mesh material={metal}>
          <boxGeometry args={[0.36, 0.06, 0.2]} />
        </mesh>
        <mesh position={[0, -0.035, 0]} rotation-x={Math.PI / 2}>
          <planeGeometry args={[0.3, 0.15]} />
          <meshStandardMaterial ref={head} color="#000" emissive="#d9f0ff" emissiveIntensity={0} side={THREE.DoubleSide} toneMapped={false} />
        </mesh>
        {/* feixe volumétrico simulado */}
        <mesh material={cone} position={[0, -1.9, 0]}>
          <cylinderGeometry args={[0.12, 1.55, 3.7, 40, 1, true]} />
        </mesh>
      </group>
      <group position={headPos}>
        <primitive object={target} />
        <spotLight ref={spot} color="#cfe9ff" angle={0.66} penumbra={0.8} distance={14} decay={1.6} intensity={0} target={target} />
      </group>
    </group>
  )
}

export function Nature({ grass }: { grass: number }) {
  return (
    <group>
      <Lawn count={grass} />
      <Trees />
      <Shrubs />
      <Planter />
      <LampPost />
    </group>
  )
}
