import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Environment, Lightformer, PerformanceMonitor } from '@react-three/drei'
import { Bloom, EffectComposer, ToneMapping, Vignette } from '@react-three/postprocessing'
import { ToneMappingMode } from 'postprocessing'
import * as THREE from 'three'
import { device, type Tier } from '../lib/device'
import { House } from './House'
import { Plumbing } from './Plumbing'
import { FOG_HEX, Ground, Nature, Sky } from './Environment'
import { FlowParticles, GutterWater, Motes, PipeGlow, Rain, ReuseRings, RoofStreaks, ScanSlice, Splashes, TankWater } from './Water'
import { CameraRig } from './CameraRig'
import { Labels } from './Labels'
import { anchors, BUCKET, HOUSE_W } from './layout'
import { sc, updateScene } from './sceneState'
import './labels.css'

const EXPOSURE = 1.12

/** Mesma curva ACES do three (ACESFilmicToneMapping), aplicada a uma cor linear. */
function acesFilmic(c: THREE.Color, exposure: number) {
  const v = new THREE.Vector3(c.r, c.g, c.b).multiplyScalar(exposure / 0.6)
  const inM = new THREE.Matrix3().set(0.59719, 0.35458, 0.04823, 0.076, 0.90834, 0.01566, 0.0284, 0.13383, 0.83777)
  const outM = new THREE.Matrix3().set(1.60475, -0.53108, -0.07367, -0.10208, 1.10813, -0.00605, -0.00327, -0.07276, 1.07602)
  v.applyMatrix3(inM)
  const rrt = (x: number) => (x * (x + 0.0245786) - 0.000090537) / (x * (0.983729 * x + 0.432951) + 0.238081)
  v.set(rrt(v.x), rrt(v.y), rrt(v.z)).applyMatrix3(outM)
  return c.setRGB(THREE.MathUtils.clamp(v.x, 0, 1), THREE.MathUtils.clamp(v.y, 0, 1), THREE.MathUtils.clamp(v.z, 0, 1), THREE.LinearSRGBColorSpace)
}

type Props = {
  tier: Tier
  reduced: boolean
  active: boolean
  onReady: () => void
  onError: () => void
}

function Lights({ shadows }: { shadows: boolean }) {
  const hemi = useRef<THREE.HemisphereLight>(null)
  const moon = useRef<THREE.DirectionalLight>(null)
  const rim = useRef<THREE.DirectionalLight>(null)
  const fill = useRef<THREE.PointLight>(null)
  useFrame(() => {
    const a = sc.ambient
    if (hemi.current) hemi.current.intensity = 0.08 + a * 0.62
    if (moon.current) moon.current.intensity = a * 1.35
    if (rim.current) rim.current.intensity = a * 0.7
    if (fill.current) fill.current.intensity = a * 9 + sc.tank * 6
  })
  return (
    <>
      <hemisphereLight ref={hemi} args={['#4f8fbf', '#061B2B', 0.1]} />
      <directionalLight
        ref={moon}
        position={[-8, 14, 8]}
        color="#b4d6ff"
        castShadow={shadows}
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-13}
        shadow-camera-right={13}
        shadow-camera-top={11}
        shadow-camera-bottom={-9}
        shadow-camera-near={2}
        shadow-camera-far={40}
        shadow-bias={-0.0005}
        shadow-normalBias={0.025}
      />
      <directionalLight ref={rim} position={[8, 5, -11]} color="#42E8E0" />
      <pointLight ref={fill} position={[8.6, 2.6, 5.2]} color="#5fb4ff" distance={9} decay={1.6} />
    </>
  )
}

function Contents({ tier, reduced, composer, onReady }: { tier: Tier; reduced: boolean; composer: boolean; onReady: () => void }) {
  const high = tier === 'high'
  // A névoa do three entra depois da conversão de cor: sem o composer, a cor é
  // gravada já em sRGB para casar com o horizonte do céu.
  const fog = useMemo(() => {
    const f = new THREE.FogExp2(FOG_HEX, 0.03)
    // Sem o composer, a névoa é misturada depois do tone mapping e da conversão
    // para sRGB; gravamos a cor já mapeada para casar com o céu.
    if (!composer) {
      const mapped = acesFilmic(f.color.clone(), EXPOSURE)
      const t = { r: 0, g: 0, b: 0 }
      mapped.getRGB(t, THREE.SRGBColorSpace)
      f.color.setRGB(t.r, t.g, t.b, THREE.LinearSRGBColorSpace)
    }
    return f
  }, [composer])
  const frames = useRef(0)
  const ready = useRef(false)
  useFrame((_, dt) => {
    updateScene(Math.min(dt, 0.1), reduced)
    if (!ready.current && ++frames.current > 3) {
      ready.current = true
      onReady()
    }
  }, -1)

  const ringPoints = useMemo(
    () => [
      anchors.garden.clone().setY(0),
      new THREE.Vector3(BUCKET.x, 0, BUCKET.z),
      new THREE.Vector3(HOUSE_W / 2 + 0.45, 0, 0.4),
    ],
    [],
  )

  return (
    <>
      <color attach="background" args={['#061B2B']} />
      <primitive attach="fog" object={fog} />
      <Sky />
      <Lights shadows={high} />
      <Environment resolution={128} frames={1} environmentIntensity={0.55}>
        <Lightformer form="rect" intensity={1.4} color="#9fd0ff" position={[0, 9, 2]} rotation-x={Math.PI / 2} scale={[18, 8, 1]} />
        <Lightformer form="rect" intensity={1.1} color="#42E8E0" position={[10, 3, -6]} rotation-y={-Math.PI / 3} scale={[8, 3, 1]} />
        <Lightformer form="rect" intensity={0.8} color="#087CF0" position={[-10, 2, 6]} rotation-y={Math.PI / 2.5} scale={[10, 3, 1]} />
        <Lightformer form="ring" intensity={1.4} color="#ffe6c4" position={[-4.2, 3.6, 4]} scale={1.2} />
      </Environment>

      <Ground reflect={high} />
      <Nature grass={high ? 2600 : 900} />
      <House />
      <Plumbing />

      <TankWater />
      <PipeGlow />
      <GutterWater />
      <FlowParticles scale={high ? 1 : 0.65} />
      <RoofStreaks count={high ? 220 : 110} />
      <Splashes surface="roof" count={high ? 260 : 120} />
      <Splashes surface="ground" count={high ? 320 : 120} />
      <Rain count={high ? 7000 : 2600} />
      <Motes count={high ? 520 : 200} />
      <ScanSlice />
      <ReuseRings points={ringPoints} />
      <Labels />
      <CameraRig reduced={reduced} />
    </>
  )
}

// ?capture e ?monitor=0 desligam o ajuste automático de qualidade (capturas e
// gravações em ambientes sem GPU, onde cada quadro leva segundos).
const monitor = device.monitor

/** Densidade de pixels limitada por um orçamento de área: nítido em 4K sem custo excessivo. */
function maxDpr(tier: Tier) {
  const budget = tier === 'high' ? 7_800_000 : 2_600_000
  const area = window.innerWidth * window.innerHeight
  return Math.max(1, Math.min(window.devicePixelRatio || 1, tier === 'high' ? 2 : 1.5, Math.sqrt(budget / area)))
}

export default function Scene({ tier, reduced, active, onReady, onError }: Props) {
  const high = tier === 'high'
  const [dpr, setDpr] = useState(() => maxDpr(tier))
  const [effects, setEffects] = useState(high)

  useEffect(() => {
    const onResize = () => setDpr(maxDpr(tier))
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [tier])

  return (
    <Canvas
      className="stage__gl"
      dpr={dpr}
      shadows={high ? 'percentage' : false}
      frameloop={active ? 'always' : 'never'}
      gl={{ antialias: !effects, powerPreference: 'high-performance', stencil: false, alpha: false }}
      camera={{ fov: 30, near: 0.1, far: 140, position: [-12.5, 2.2, 9.5] }}
      onCreated={({ gl, scene, camera }) => {
        if (device.capture) Object.assign(window, { __three: { gl, scene, camera } })
        gl.localClippingEnabled = true
        gl.toneMapping = THREE.ACESFilmicToneMapping
        gl.toneMappingExposure = EXPOSURE
        gl.domElement.addEventListener('webglcontextlost', (e) => {
          e.preventDefault()
          onError()
        })
      }}
      aria-hidden="true"
    >
      {monitor ? (
        <PerformanceMonitor
          flipflops={3}
          onDecline={() => setDpr((d) => Math.max(1, Math.round(d * 0.8 * 100) / 100))}
          onFallback={() => setEffects(false)}
        />
      ) : null}
      <Contents tier={tier} reduced={reduced} composer={effects} onReady={onReady} />
      {effects ? (
        <EffectComposer multisampling={4} enableNormalPass={false}>
          <Bloom mipmapBlur intensity={0.85} luminanceThreshold={0.82} luminanceSmoothing={0.18} radius={0.72} />
          <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
          <Vignette offset={0.24} darkness={0.7} />
        </EffectComposer>
      ) : (
        <></>
      )}
    </Canvas>
  )
}
