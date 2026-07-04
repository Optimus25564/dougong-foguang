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
})
