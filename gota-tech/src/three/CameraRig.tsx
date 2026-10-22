import { useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { device } from '../lib/device'
import { easeInOut, stage } from '../lib/stage'
import { sc } from './sceneState'

const v = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z)

// Poses: 0 abertura · 1 telhado · 2 calha e condutor · 3 filtro · 4 reservatório · 5 reaproveitamento
const POS = [v(14.6, 5.4, 17.2), v(4.4, 6.9, 9.2), v(9.4, 4.3, 8.8), v(5.55, 2.55, 4.4), v(10.9, 3.7, 8.9), v(12.6, 7.6, 14.6)]
const TGT = [v(2.2, 1.55, 0.9), v(1.0, 2.8, 1.6), v(4.5, 1.95, 2.5), v(4.82, 2.02, 2.82), v(6.0, 1.15, 2.4), v(3.4, 0.55, 2.3)]
// Ponto de partida da entrada: vista lateral baixa, com o reservatório escondido atrás da casa.
const INTRO_POS = v(-12.5, 2.2, 9.5)
const INTRO_TGT = v(-0.5, 1.7, 0)

export function CameraRig({ reduced }: { reduced: boolean }) {
  const { camera, size } = useThree()
  const cam = camera as THREE.PerspectiveCamera
  const curves = useMemo(
    () => ({
      pos: new THREE.CatmullRomCurve3(POS, false, 'centripetal', 0.5),
      tgt: new THREE.CatmullRomCurve3(TGT, false, 'centripetal', 0.5),
    }),
    [],
  )
  const tmp = useMemo(
    () => ({
      pos: new THREE.Vector3(),
      tgt: new THREE.Vector3(),
      curPos: POS[0].clone(),
      curTgt: TGT[0].clone(),
      shift: new THREE.Vector2(),
      sphA: new THREE.Spherical(),
      sphB: new THREE.Spherical(),
      off: new THREE.Vector3(),
      right: new THREE.Vector3(),
      up: new THREE.Vector3(),
      init: false,
    }),
    [],
  )

  useFrame((state, dt) => {
    const aspect = size.width / Math.max(1, size.height)
    const u = sc.camU / 5
    curves.pos.getPoint(u, tmp.pos)
    curves.tgt.getPoint(u, tmp.tgt)

    // Entrada: órbita da lateral até a vista em 3/4 que revela o reservatório.
    const k = easeInOut(sc.introCam)
    if (k < 1) {
      tmp.off.copy(tmp.pos).sub(tmp.tgt)
      tmp.sphB.setFromVector3(tmp.off)
      tmp.sphA.setFromVector3(tmp.off.copy(INTRO_POS).sub(INTRO_TGT))
      const r = THREE.MathUtils.lerp(tmp.sphA.radius, tmp.sphB.radius, k)
      const phi = THREE.MathUtils.lerp(tmp.sphA.phi, tmp.sphB.phi, k)
      const theta = THREE.MathUtils.lerp(tmp.sphA.theta, tmp.sphB.theta, k)
      tmp.tgt.lerpVectors(INTRO_TGT, tmp.tgt, k)
      tmp.pos.setFromSphericalCoords(r, phi, theta).add(tmp.tgt)
    }

    // Respiração lenta na abertura.
    const idle = Math.max(0, 1 - sc.camU * 2)
    if (idle > 0 && !reduced) {
      tmp.off.copy(tmp.pos).sub(tmp.tgt)
      tmp.off.applyAxisAngle(THREE.Object3D.DEFAULT_UP, Math.sin(state.clock.elapsedTime * 0.12) * 0.035 * idle)
      tmp.pos.copy(tmp.tgt).add(tmp.off)
    }

    // Enquadramento responsivo: em telas estreitas abre o campo de visão e recua.
    const refAspect = 1.6
    let halfFov = THREE.MathUtils.degToRad(15)
    let dist = 1
    if (aspect < refAspect) {
      const need = (Math.tan(halfFov) * refAspect) / aspect
      halfFov = Math.min(Math.atan(need), THREE.MathUtils.degToRad(29))
      dist = Math.min(1.4, need / Math.tan(halfFov))
    }
    if (dist !== 1) tmp.pos.sub(tmp.tgt).multiplyScalar(dist).add(tmp.tgt)

    // Paralaxe do cursor, proporcional à distância.
    if (!reduced && stage.pointer.active) {
      const d = tmp.pos.distanceTo(tmp.tgt) / 16
      tmp.off.copy(tmp.tgt).sub(tmp.pos).normalize()
      tmp.right.crossVectors(tmp.off, THREE.Object3D.DEFAULT_UP).normalize()
      tmp.up.crossVectors(tmp.right, tmp.off).normalize()
      tmp.pos.addScaledVector(tmp.right, stage.pointer.x * 0.45 * d).addScaledVector(tmp.up, stage.pointer.y * 0.25 * d)
    }

    const damp = reduced || device.capture || !tmp.init ? 1 : 1 - Math.exp(-Math.min(dt, 0.1) * 3.4)
    tmp.curPos.lerp(tmp.pos, damp)
    tmp.curTgt.lerp(tmp.tgt, damp)
    tmp.init = true
    cam.position.copy(tmp.curPos)
    cam.lookAt(tmp.curTgt)

    // Desloca o enquadramento para dar espaço ao texto (lado esquerdo no desktop,
    // parte de baixo no celular).
    const wide = aspect >= 1.05
    const sx = wide ? 0.14 : 0
    const sy = wide ? 0 : 0.17
    const ks = device.capture ? 1 : 0.1
    tmp.shift.x += (sx - tmp.shift.x) * ks
    tmp.shift.y += (sy - tmp.shift.y) * ks
    const fov = THREE.MathUtils.radToDeg(halfFov * 2)
    if (Math.abs(cam.fov - fov) > 0.01) cam.fov = fov
    cam.setViewOffset(size.width, size.height, -tmp.shift.x * size.width, tmp.shift.y * size.height, size.width, size.height)
    cam.updateProjectionMatrix()
  }, -0.5)

  return null
}
