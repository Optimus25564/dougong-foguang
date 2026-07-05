import { describe, it, expect } from 'vitest'
import * as THREE from 'three'
import { screenToGroundPoint } from '../src/interaction/dragPlace.js'

describe('屏幕到装配面', () => {
  it('屏幕中心射线命中装配平面附近', () => {
    const cam = new THREE.PerspectiveCamera(45, 1, 0.1, 100)
    cam.position.set(0, 0, 3); cam.lookAt(0, 0, 0); cam.updateMatrixWorld()
    const p = screenToGroundPoint(cam, { x: 0, y: 0 })
    expect(Math.abs(p[2])).toBeLessThan(0.01) // 命中 z≈0 平面
    expect(Math.abs(p[0])).toBeLessThan(0.01)
  })
  it('给定 planeZ 时命中该深度平面——离面构件（如散斗 z=0.28）方能拖到位', () => {
    const cam = new THREE.PerspectiveCamera(45, 1, 0.1, 100)
    cam.position.set(0, 0, 3); cam.lookAt(0, 0, 0); cam.updateMatrixWorld()
    const p = screenToGroundPoint(cam, { x: 0, y: 0 }, 0.28)
    expect(p[2]).toBeCloseTo(0.28, 5) // 命中 z=0.28 平面，而非 z=0
  })
})
