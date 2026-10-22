import { useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { COS, EAVE_Y, EAVE_Z, HOUSE_D, HOUSE_W, RIDGE_Y, ROOF_X, SIN, SLOPE_LEN, WALL_H } from './layout'
import { tileRoofGeometry } from './geometry'
import { revealPlane, sc } from './sceneState'

const clip = [revealPlane]

function windowGlowTexture() {
  const c = document.createElement('canvas')
  c.width = 64
  c.height = 128
  const ctx = c.getContext('2d')!
  const g = ctx.createLinearGradient(0, 0, 0, 128)
  g.addColorStop(0, '#5d7f96')
  g.addColorStop(0.55, '#e9d9b8')
  g.addColorStop(1, '#ffe9c2')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 64, 128)
  // cortina parcialmente aberta
  ctx.fillStyle = 'rgba(30, 50, 66, 0.55)'
  ctx.fillRect(0, 0, 14, 128)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

type WinProps = { w: number; h: number; position: [number, number, number]; rotation?: number; split?: boolean }

function Window({ w, h, position, rotation = 0, split = true, glass, frame }: WinProps & { glass: THREE.Material; frame: THREE.Material }) {
  const t = 0.06
  const d = 0.09
  return (
    <group position={position} rotation-y={rotation}>
      <mesh material={glass} position={[0, 0, 0.012]}>
        <planeGeometry args={[w, h]} />
      </mesh>
      <mesh material={frame} position={[0, h / 2, d / 2]} castShadow>
        <boxGeometry args={[w + t, t, d]} />
      </mesh>
      <mesh material={frame} position={[0, -h / 2, d / 2]}>
        <boxGeometry args={[w + t, t, d]} />
      </mesh>
      <mesh material={frame} position={[-w / 2, 0, d / 2]}>
        <boxGeometry args={[t, h, d]} />
      </mesh>
      <mesh material={frame} position={[w / 2, 0, d / 2]}>
        <boxGeometry args={[t, h, d]} />
      </mesh>
      {split ? (
        <mesh material={frame} position={[0, 0, d / 2]}>
          <boxGeometry args={[t * 0.6, h, d * 0.8]} />
        </mesh>
      ) : null}
      {/* peitoril */}
      <mesh material={frame} position={[0, -h / 2 - 0.05, 0.1]} castShadow>
        <boxGeometry args={[w + 0.2, 0.05, 0.2]} />
      </mesh>
    </group>
  )
}

export function House() {
  const m = useMemo(() => {
    const plaster = new THREE.MeshStandardMaterial({ color: '#d6dee2', roughness: 0.92, clippingPlanes: clip })
    const plinth = new THREE.MeshStandardMaterial({ color: '#6f7d86', roughness: 0.85, clippingPlanes: clip })
    const tiles = new THREE.MeshPhysicalMaterial({
      vertexColors: true,
      roughness: 0.42,
      clearcoat: 0.55,
      clearcoatRoughness: 0.35,
      clippingPlanes: clip,
    })
    const slab = new THREE.MeshStandardMaterial({ color: '#4d5a62', roughness: 0.7, clippingPlanes: clip })
    const band = new THREE.MeshStandardMaterial({ color: '#e4eaec', roughness: 0.8, clippingPlanes: clip })
    const ridge = new THREE.MeshPhysicalMaterial({ color: '#8e3a27', roughness: 0.45, clearcoat: 0.5, clippingPlanes: clip })
    const frame = new THREE.MeshStandardMaterial({ color: '#1d2b33', roughness: 0.5, metalness: 0.4, clippingPlanes: clip })
    const glass = new THREE.MeshStandardMaterial({
      color: '#0b1d29',
      roughness: 0.12,
      metalness: 0.2,
      emissive: '#ffffff',
      emissiveMap: windowGlowTexture(),
      emissiveIntensity: 0,
      clippingPlanes: clip,
    })
    const door = new THREE.MeshStandardMaterial({ color: '#2a3f4a', roughness: 0.6, clippingPlanes: clip })
    const sconce = new THREE.MeshStandardMaterial({ color: '#000000', emissive: '#ffe6bd', emissiveIntensity: 0, clippingPlanes: clip })
    return { plaster, plinth, tiles, slab, band, ridge, frame, glass, door, sconce }
  }, [])

  const roof = useMemo(() => {
    const tilesGeo = tileRoofGeometry(ROOF_X * 2, SLOPE_LEN + 0.02)
    const a = new THREE.Vector3(0, SIN, -COS) // sobe a água do telhado (frente)
    const front = new THREE.Matrix4().makeBasis(new THREE.Vector3(1, 0, 0), a, new THREE.Vector3(1, 0, 0).cross(a))
    const b = new THREE.Vector3(0, SIN, COS)
    const back = new THREE.Matrix4().makeBasis(new THREE.Vector3(-1, 0, 0), b, new THREE.Vector3(-1, 0, 0).cross(b))
    const qf = new THREE.Quaternion().setFromRotationMatrix(front)
    const qb = new THREE.Quaternion().setFromRotationMatrix(back)
    return { tilesGeo, qf, qb }
  }, [])

  const gable = useMemo(() => {
    const g = new THREE.BufferGeometry()
    const hw = HOUSE_W / 2
    const hd = HOUSE_D / 2
    // dois oitões triangulares (frente e fundo do volume do telhado)
    const v = new Float32Array([
      hw, WALL_H, hd, hw, WALL_H, -hd, hw, RIDGE_Y, 0,
      -hw, WALL_H, -hd, -hw, WALL_H, hd, -hw, RIDGE_Y, 0,
    ])
    g.setAttribute('position', new THREE.BufferAttribute(v, 3))
    g.computeVertexNormals()
    return g
  }, [])

  useFrame(() => {
    m.glass.emissiveIntensity = sc.windows * 1.15
    m.sconce.emissiveIntensity = sc.windows * 3
  })

  const hd = HOUSE_D / 2
  const hw = HOUSE_W / 2
  const slabT = 0.08

  return (
    <group>
      {/* volume principal */}
      <mesh material={m.plaster} position={[0, WALL_H / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[HOUSE_W, WALL_H, HOUSE_D]} />
      </mesh>
      <mesh material={m.plaster} geometry={gable} castShadow receiveShadow />
      <mesh material={m.plinth} position={[0, 0.15, 0]} receiveShadow>
        <boxGeometry args={[HOUSE_W + 0.05, 0.3, HOUSE_D + 0.05]} />
      </mesh>
      {/* faixa sob o beiral */}
      <mesh material={m.band} position={[0, WALL_H - 0.08, 0]}>
        <boxGeometry args={[HOUSE_W + 0.03, 0.16, HOUSE_D + 0.03]} />
      </mesh>

      {/* telhado: telhas sobre laje com espessura visível nas bordas */}
      <group position={[-ROOF_X, EAVE_Y, EAVE_Z]} quaternion={roof.qf}>
        <mesh geometry={roof.tilesGeo} material={m.tiles} castShadow receiveShadow />
        <mesh material={m.slab} position={[ROOF_X, SLOPE_LEN / 2, -slabT / 2 - 0.004]} castShadow>
          <boxGeometry args={[ROOF_X * 2, SLOPE_LEN, slabT]} />
        </mesh>
      </group>
      <group position={[ROOF_X, EAVE_Y, -EAVE_Z]} quaternion={roof.qb}>
        <mesh geometry={roof.tilesGeo} material={m.tiles} castShadow receiveShadow />
        <mesh material={m.slab} position={[ROOF_X, SLOPE_LEN / 2, -slabT / 2 - 0.004]} castShadow>
          <boxGeometry args={[ROOF_X * 2, SLOPE_LEN, slabT]} />
        </mesh>
      </group>
      <mesh material={m.ridge} position={[0, RIDGE_Y + 0.045, 0]} rotation-z={Math.PI / 2} castShadow>
        <cylinderGeometry args={[0.1, 0.1, ROOF_X * 2 + 0.04, 20, 1]} />
      </mesh>

      {/* fachada frontal */}
      <Window w={1.5} h={1.1} position={[-2.05, 1.55, hd]} glass={m.glass} frame={m.frame} />
      <Window w={1.5} h={1.1} position={[2.05, 1.55, hd]} glass={m.glass} frame={m.frame} />
      <group position={[0, 0, hd]}>
        <mesh material={m.door} position={[0, 1.08, 0.03]} castShadow>
          <boxGeometry args={[0.95, 2.1, 0.06]} />
        </mesh>
        <mesh material={m.glass} position={[0.22, 1.2, 0.065]}>
          <planeGeometry args={[0.16, 1.5]} />
        </mesh>
        <mesh material={m.frame} position={[0, 2.18, 0.06]}>
          <boxGeometry args={[1.1, 0.08, 0.12]} />
        </mesh>
        <mesh material={m.sconce} position={[0.85, 2.15, 0.08]}>
          <boxGeometry args={[0.1, 0.22, 0.08]} />
        </mesh>
        <mesh material={m.plinth} position={[0, 0.06, 0.45]} receiveShadow castShadow>
          <boxGeometry args={[1.6, 0.12, 0.7]} />
        </mesh>
      </group>

      {/* lateral direita (banheiro) e esquerda */}
      <Window w={1.05} h={0.6} position={[hw, 1.95, -0.3]} rotation={Math.PI / 2} glass={m.glass} frame={m.frame} split={false} />
      <Window w={1.6} h={1.05} position={[-hw, 1.55, 0]} rotation={-Math.PI / 2} glass={m.glass} frame={m.frame} />
      {/* fundos */}
      <Window w={1.4} h={1.05} position={[-1.8, 1.55, -hd]} rotation={Math.PI} glass={m.glass} frame={m.frame} />
      <Window w={1.4} h={1.05} position={[1.8, 1.55, -hd]} rotation={Math.PI} glass={m.glass} frame={m.frame} />
    </group>
  )
}
