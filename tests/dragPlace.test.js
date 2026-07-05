import { describe, it, expect, vi } from 'vitest'
import * as THREE from 'three'
import { screenToGroundPoint, createDragController } from '../src/interaction/dragPlace.js'

const fakeRenderer = () => ({ domElement: { getBoundingClientRect: () => ({ left: 0, top: 0, width: 100, height: 100 }) } })
const ptr = (type, x, y) => { const e = new Event(type); e.clientX = x; e.clientY = y; return e }

describe('按住拖拽控制器（鼠标/触屏统一）', () => {
  it('抓起即停镜头、跟手移动、松手放下并恢复镜头', () => {
    const cam = new THREE.PerspectiveCamera(45, 1, 0.1, 100)
    cam.position.set(0, 0, 3); cam.lookAt(0, 0, 0); cam.updateMatrixWorld()
    const controls = { enabled: true }
    const onDrop = vi.fn()
    const drag = createDragController(fakeRenderer(), cam, controls, { onDrop })
    const mesh = new THREE.Object3D()
    drag.beginDrag('ludou', mesh, 0, ptr('pointerdown', 50, 50)) // 屏幕中心按下
    expect(controls.enabled).toBe(false)               // 拖动时镜头停转，避免与拼装打架
    expect(Math.abs(mesh.position.x)).toBeLessThan(0.05) // 立刻定位到按下点（中心→原点）
    window.dispatchEvent(ptr('pointerup', 50, 50))
    expect(onDrop).toHaveBeenCalledTimes(1)
    expect(onDrop.mock.calls[0][0]).toBe('ludou')
    expect(controls.enabled).toBe(true)                // 松手恢复镜头
  })

  it('pointercancel 视为未放置并恢复镜头', () => {
    const cam = new THREE.PerspectiveCamera(45, 1, 0.1, 100); cam.updateMatrixWorld()
    const controls = { enabled: true }
    const onDrop = vi.fn()
    const drag = createDragController(fakeRenderer(), cam, controls, { onDrop })
    drag.beginDrag('ludou', new THREE.Object3D(), 0, null)
    expect(controls.enabled).toBe(false)
    window.dispatchEvent(new Event('pointercancel'))
    expect(controls.enabled).toBe(true)
    expect(onDrop).toHaveBeenCalledWith('ludou', null)
  })
})

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
