import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import {
  backRoute,
  BUCKET,
  DOWN_X,
  FAUCET,
  FILTER,
  GUTTER_R,
  GUTTER_Y,
  GUTTER_Z,
  irrigationRoute,
  mainRoute,
  PIPE_R,
  ROOF_X,
  TANK,
  TANK_TOP,
} from './layout'
import { labelTexture, leafGeometry, lidGeometry, tankGeometry } from './geometry'
import { revealPlane, sc } from './sceneState'

const clip = [revealPlane]

function Gutter({ z, mat }: { z: number; mat: THREE.Material }) {
  const len = ROOF_X * 2 + 0.12
  const brackets = Math.floor(len / 0.9)
  return (
    <group position={[0, GUTTER_Y, z]}>
      <mesh material={mat} rotation-z={Math.PI / 2} castShadow>
        <cylinderGeometry args={[GUTTER_R, GUTTER_R, len, 28, 1, true, Math.PI, Math.PI]} />
      </mesh>
      {/* bordas enroladas */}
      {[-1, 1].map((side) => (
        <mesh key={side} material={mat} position={[0, 0, side * GUTTER_R]} rotation-z={Math.PI / 2}>
          <cylinderGeometry args={[0.012, 0.012, len, 6]} />
        </mesh>
      ))}
      {[-1, 1].map((side) => (
        <mesh key={`cap${side}`} material={mat} position={[(side * len) / 2, 0, 0]} rotation-y={side * (Math.PI / 2)}>
          <circleGeometry args={[GUTTER_R, 20, Math.PI, Math.PI]} />
        </mesh>
      ))}
      {Array.from({ length: brackets + 1 }, (_, i) => (
        <mesh key={i} material={mat} position={[-len / 2 + 0.2 + (i * (len - 0.4)) / brackets, -0.005, 0]} rotation={[Math.PI, Math.PI / 2, 0]}>
          <torusGeometry args={[GUTTER_R + 0.008, 0.008, 4, 16, Math.PI]} />
        </mesh>
      ))}
    </group>
  )
}

/** Luvas e joelhos ao longo do tubo: pequenos anéis orientados pela tangente. */
function Couplings({ curve, at, mat }: { curve: THREE.Curve<THREE.Vector3>; at: number[]; mat: THREE.Material }) {
  const items = useMemo(
    () =>
      at.map((t) => {
        const p = curve.getPointAt(t)
        const tan = curve.getTangentAt(t)
        const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), tan)
        return { p, q }
      }),
    [curve, at],
  )
  return (
    <>
      {items.map(({ p, q }, i) => (
        <mesh key={i} material={mat} position={p} quaternion={q} castShadow>
          <cylinderGeometry args={[PIPE_R * 1.28, PIPE_R * 1.28, 0.075, 18]} />
        </mesh>
      ))}
    </>
  )
}

export function Plumbing() {
  const m = useMemo(() => {
    const pvc = new THREE.MeshPhysicalMaterial({
      color: '#dfe7ea',
      roughness: 0.32,
      clearcoat: 0.6,
      clearcoatRoughness: 0.2,
      transparent: true,
      clippingPlanes: clip,
    })
    const gutter = new THREE.MeshPhysicalMaterial({
      color: '#d7e0e4',
      roughness: 0.3,
      metalness: 0.35,
      clearcoat: 0.4,
      side: THREE.DoubleSide,
      clippingPlanes: clip,
    })
    const fitting = new THREE.MeshStandardMaterial({ color: '#b9c6cc', roughness: 0.4, transparent: true, clippingPlanes: clip })
    const metal = new THREE.MeshStandardMaterial({ color: '#2b3a42', roughness: 0.5, metalness: 0.6, clippingPlanes: clip })
    const tank = new THREE.MeshPhysicalMaterial({
      color: '#0c63c9',
      roughness: 0.36,
      clearcoat: 0.7,
      clearcoatRoughness: 0.25,
      sheen: 0.3,
      sheenColor: new THREE.Color('#5fb4ff'),
      transparent: true,
      clippingPlanes: clip,
    })
    const lid = new THREE.MeshPhysicalMaterial({ color: '#0a54ab', roughness: 0.4, clearcoat: 0.6, transparent: true, clippingPlanes: clip })
    const concrete = new THREE.MeshStandardMaterial({ color: '#56656d', roughness: 0.95, clippingPlanes: clip })
    const housing = new THREE.MeshPhysicalMaterial({
      color: '#cfe3ea',
      roughness: 0.15,
      metalness: 0.1,
      clearcoat: 1,
      transparent: true,
      clippingPlanes: clip,
    })
    const capDark = new THREE.MeshStandardMaterial({ color: '#33464f', roughness: 0.45, metalness: 0.3, transparent: true, clippingPlanes: clip })
    const brass = new THREE.MeshStandardMaterial({ color: '#c9a35f', roughness: 0.28, metalness: 0.9, clippingPlanes: clip })
    const hose = new THREE.MeshStandardMaterial({ color: '#1f5b45', roughness: 0.55, clippingPlanes: clip })
    const bucket = new THREE.MeshStandardMaterial({ color: '#7f97a3', roughness: 0.5, side: THREE.DoubleSide, clippingPlanes: clip })
    const label = new THREE.MeshStandardMaterial({
      map: labelTexture('ÁGUA NÃO POTÁVEL', 'não indicada para consumo'),
      roughness: 0.6,
      transparent: true,
      clippingPlanes: clip,
    })
    const leaf = new THREE.MeshStandardMaterial({ color: '#4f8a3a', roughness: 0.7, side: THREE.DoubleSide })
    return { pvc, gutter, fitting, metal, tank, lid, concrete, housing, capDark, brass, hose, bucket, label, leaf }
  }, [])

  const geo = useMemo(() => {
    const main = new THREE.TubeGeometry(mainRoute, 220, PIPE_R, 18, false)
    const back = new THREE.TubeGeometry(backRoute, 160, PIPE_R, 18, false)
    const hoseG = new THREE.TubeGeometry(irrigationRoute, 120, 0.028, 10, false)
    const tankG = tankGeometry(TANK.r, TANK.h)
    const lidG = lidGeometry(TANK.r * 0.9)
    const bucketG = new THREE.LatheGeometry(
      [new THREE.Vector2(0, 0), new THREE.Vector2(0.13, 0), new THREE.Vector2(0.17, 0.3), new THREE.Vector2(0.18, 0.31)],
      28,
    )
    const leafG = leafGeometry(0.035)
    return { main, back, hoseG, tankG, lidG, bucketG, leafG }
  }, [])

  // folhas retidas na tela do filtro (aparecem na etapa 03)
  const leaves = useMemo(
    () =>
      Array.from({ length: 11 }, (_, i) => {
        const a = (i / 11) * Math.PI * 2 + i * 0.7
        return {
          pos: new THREE.Vector3(-FILTER.len / 2 + 0.07 + (i % 4) * 0.035, Math.cos(a) * 0.085, Math.sin(a) * 0.085),
          rot: new THREE.Euler(a, i * 1.3, i * 0.9),
          delay: i / 14,
          tint: i % 3,
        }
      }),
    [],
  )
  const leafRefs = useRef<(THREE.Mesh | null)[]>([])
  const leafMats = useMemo(
    () => ['#5b8f3c', '#8a7a3a', '#3f7a46'].map((c) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.7, side: THREE.DoubleSide })),
    [],
  )

  const screenMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
        uniforms: { uAlpha: { value: 0 }, uColor: { value: new THREE.Color('#bfeff0') } },
        vertexShader: /* glsl */ `
          varying vec2 vUv;
          void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }
        `,
        fragmentShader: /* glsl */ `
          varying vec2 vUv; uniform float uAlpha; uniform vec3 uColor;
          void main(){
            vec2 g = abs(fract(vUv * vec2(48.0, 18.0)) - 0.5);
            float line = 1.0 - smoothstep(0.0, 0.12, min(g.x, g.y));
            gl_FragColor = vec4(uColor, line * 0.75 * uAlpha);
          }
        `,
      }),
    [],
  )

  useFrame(() => {
    const x = sc.xray
    m.pvc.opacity = 1 - x * 0.74
    m.pvc.depthWrite = m.pvc.opacity > 0.97
    m.fitting.opacity = 1 - x * 0.6
    m.fitting.depthWrite = m.fitting.opacity > 0.97
    const f = Math.max(sc.filter, x * 0.25)
    m.housing.opacity = 0.96 - f * 0.8
    m.housing.depthWrite = m.housing.opacity > 0.95
    m.capDark.opacity = 1 - sc.filter * 0.35
    screenMat.uniforms.uAlpha.value = Math.min(1, sc.filter * 1.2 + x * 0.25)
    const t = sc.tank
    m.tank.opacity = 1 - t * 0.74
    m.tank.depthWrite = m.tank.opacity > 0.97
    m.lid.opacity = 1 - t * 0.6
    m.lid.depthWrite = m.lid.opacity > 0.97
    m.label.opacity = 1 - t
    m.label.visible = t < 0.98
    leafRefs.current.forEach((mesh, i) => {
      if (!mesh) return
      const k = THREE.MathUtils.clamp((sc.leaves - leaves[i].delay) * 3, 0, 1)
      mesh.scale.setScalar(k)
      mesh.visible = k > 0.01
      mesh.position.x = leaves[i].pos.x - (1 - k) * 0.25
    })
  })

  return (
    <group>
      <Gutter z={GUTTER_Z} mat={m.gutter} />
      <Gutter z={-GUTTER_Z} mat={m.gutter} />
      {/* bocais das calhas */}
      {[GUTTER_Z, -GUTTER_Z].map((z) => (
        <mesh key={z} material={m.gutter} position={[DOWN_X, GUTTER_Y - 0.1, z]}>
          <cylinderGeometry args={[PIPE_R * 1.5, PIPE_R * 1.1, 0.1, 18, 1, true]} />
        </mesh>
      ))}

      {/* condutores */}
      <mesh geometry={geo.main} material={m.pvc} castShadow />
      <mesh geometry={geo.back} material={m.pvc} castShadow />
      <Couplings curve={mainRoute} at={[0.04, 0.12, 0.21, 0.88, 0.97]} mat={m.fitting} />
      <Couplings curve={backRoute} at={[0.05, 0.2, 0.93]} mat={m.fitting} />
      {/* tê de junção */}
      <mesh material={m.fitting} position={[DOWN_X, 2.06, GUTTER_Z]} castShadow>
        <sphereGeometry args={[PIPE_R * 1.45, 18, 12]} />
      </mesh>
      {/* abraçadeiras na parede */}
      {[2.2, 2.1].map((y, i) => (
        <mesh key={i} material={m.metal} position={[DOWN_X - 0.08, y, i === 0 ? GUTTER_Z : -GUTTER_Z]}>
          <boxGeometry args={[0.16, 0.025, 0.025]} />
        </mesh>
      ))}
      {[-1.4, 0, 1.4].map((z) => (
        <mesh key={z} material={m.metal} position={[DOWN_X - 0.08, 2.1, z]}>
          <boxGeometry args={[0.16, 0.025, 0.025]} />
        </mesh>
      ))}
      {/* suportes do trecho horizontal */}
      {[4.18, 5.6].map((x) => (
        <group key={x} position={[x, 0, GUTTER_Z]}>
          <mesh material={m.metal} position={[0, 0.98, 0]} castShadow>
            <cylinderGeometry args={[0.022, 0.026, 1.96, 8]} />
          </mesh>
          <mesh material={m.metal} position={[0, 1.99, 0]} rotation-y={Math.PI / 2}>
            <torusGeometry args={[PIPE_R + 0.01, 0.01, 6, 18]} />
          </mesh>
          <mesh material={m.concrete} position={[0, 0.04, 0]}>
            <cylinderGeometry args={[0.08, 0.1, 0.08, 12]} />
          </mesh>
        </group>
      ))}

      {/* filtro de folhas e partículas */}
      <group position={[FILTER.x, FILTER.y, FILTER.z]}>
        <mesh material={m.housing} rotation-z={Math.PI / 2} castShadow>
          <cylinderGeometry args={[FILTER.r, FILTER.r, FILTER.len - 0.06, 32, 1]} />
        </mesh>
        {[-1, 1].map((s) => (
          <mesh key={s} material={m.capDark} position={[(s * FILTER.len) / 2, 0, 0]} rotation-z={Math.PI / 2}>
            <cylinderGeometry args={[FILTER.r + 0.025, FILTER.r + 0.025, 0.07, 32]} />
          </mesh>
        ))}
        <mesh material={m.capDark} position={[0, FILTER.r + 0.03, 0]}>
          <cylinderGeometry args={[0.07, 0.07, 0.06, 20]} />
        </mesh>
        <mesh material={screenMat} rotation-z={Math.PI / 2}>
          <cylinderGeometry args={[0.11, 0.11, FILTER.len - 0.1, 32, 1, true]} />
        </mesh>
        {leaves.map((l, i) => (
          <mesh
            key={i}
            ref={(el) => {
              leafRefs.current[i] = el
            }}
            geometry={geo.leafG}
            material={leafMats[l.tint]}
            position={l.pos}
            rotation={l.rot}
            visible={false}
          />
        ))}
      </group>

      {/* reservatório */}
      <group position={[TANK.x, 0, TANK.z]}>
        <mesh material={m.concrete} position={[0, TANK.base / 2, 0]} receiveShadow castShadow>
          <cylinderGeometry args={[TANK.r + 0.18, TANK.r + 0.22, TANK.base, 48]} />
        </mesh>
        <mesh geometry={geo.tankG} material={m.tank} position={[0, TANK.base, 0]} castShadow receiveShadow />
        <mesh geometry={geo.lidG} material={m.lid} position={[0, TANK.base + TANK.h, 0]} castShadow />
        <mesh material={m.lid} position={[0.28, TANK_TOP + 0.03, -0.2]}>
          <cylinderGeometry args={[0.16, 0.16, 0.05, 28]} />
        </mesh>
        {/* etiqueta curva */}
        <mesh material={m.label} position={[0, TANK.base + TANK.h * 0.62, 0]} rotation-y={0.5}>
          <cylinderGeometry args={[TANK.r + 0.026, TANK.r + 0.026, 0.2, 32, 1, true, -0.45, 0.9]} />
        </mesh>
      </group>

      {/* torneira */}
      <group position={[FAUCET.x, FAUCET.y, FAUCET.z - 0.16]}>
        <mesh material={m.brass} rotation-x={Math.PI / 2} position={[0, 0, 0.08]}>
          <cylinderGeometry args={[0.028, 0.028, 0.2, 14]} />
        </mesh>
        <mesh material={m.brass} position={[0, -0.02, 0.17]}>
          <sphereGeometry args={[0.045, 16, 12]} />
        </mesh>
        <mesh material={m.brass} position={[0, -0.08, 0.19]}>
          <cylinderGeometry args={[0.022, 0.026, 0.1, 12]} />
        </mesh>
        <mesh material={m.brass} position={[0, 0.06, 0.17]} rotation-z={0.25}>
          <boxGeometry args={[0.12, 0.02, 0.03]} />
        </mesh>
      </group>
      <mesh geometry={geo.bucketG} material={m.bucket} position={[BUCKET.x, 0, BUCKET.z]} castShadow receiveShadow />
      <mesh material={m.bucket} position={[BUCKET.x, 0.24, BUCKET.z]} rotation-x={0.4}>
        <torusGeometry args={[0.17, 0.006, 4, 24, Math.PI]} />
      </mesh>
      {/* mangueira de irrigação */}
      <mesh geometry={geo.hoseG} material={m.hose} castShadow />
    </group>
  )
}
