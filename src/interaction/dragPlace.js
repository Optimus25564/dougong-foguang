import * as THREE from 'three'

const PLANE = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0) // z=0 装配面

export function screenToGroundPoint(camera, ndc) {
  const ray = new THREE.Raycaster()
  ray.setFromCamera(new THREE.Vector2(ndc.x, ndc.y), camera)
  const hit = new THREE.Vector3()
  const res = ray.ray.intersectPlane(PLANE, hit)
  if (!res) return null
  return [hit.x, hit.y, hit.z]
}

// 悬停跟随的阻尼系数：每秒仍剩余的距离比例（越小越"跟手"、越大越"迟滞绵软"）
export const FOLLOW_RESPONSE = 0.0005

// 帧率无关的平滑插值系数：dt 越大，本帧应追上的比例越高，
// 保证不同刷新率下的跟随手感一致（纯函数，便于单测）
export function smoothingAlpha(dt, perSecond) {
  return 1 - Math.pow(perSecond, dt)
}

export function createDragController(renderer, camera, { onDrop }) {
  const el = renderer.domElement
  let dragging = null // { partId, mesh, aim }
  function ndc(e) {
    const r = el.getBoundingClientRect()
    return { x: ((e.clientX - r.left) / r.width) * 2 - 1, y: -((e.clientY - r.top) / r.height) * 2 + 1 }
  }
  function move(e) {
    if (!dragging) return
    const p = screenToGroundPoint(camera, ndc(e))
    if (p) dragging.aim = p // 只更新瞄准点，真正的位置移动交给 follow(dt) 做阻尼平滑
  }
  function up(e) {
    if (!dragging) return
    const draggingPartId = dragging.partId
    const p = screenToGroundPoint(camera, ndc(e))
    window.removeEventListener('pointermove', move)
    dragging = null
    onDrop(draggingPartId, p)
  }
  return {
    beginDrag(partId, mesh) {
      dragging = { partId, mesh, aim: mesh.position.toArray() }
      window.addEventListener('pointermove', move)
      window.addEventListener('pointerup', up, { once: true })
    },
    // 每帧调用：让被拖拽的部件带阻尼地追向鼠标最新瞄准点，而不是瞬移
    follow(dt) {
      if (!dragging || !dragging.aim) return
      const alpha = smoothingAlpha(dt, FOLLOW_RESPONSE)
      dragging.mesh.position.lerp(new THREE.Vector3(...dragging.aim), alpha)
    },
  }
}
