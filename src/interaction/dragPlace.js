import * as THREE from 'three'

// 装配面：默认 z=0，但拖某件时用它自己的目标深度 planeZ，
// 使离面构件（如散斗 z=±0.28）拖动时与虚影同处一个深度平面——屏幕对齐即世界对齐。
export function screenToGroundPoint(camera, ndc, planeZ = 0) {
  const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), -planeZ) // z = planeZ
  const ray = new THREE.Raycaster()
  ray.setFromCamera(new THREE.Vector2(ndc.x, ndc.y), camera)
  const hit = new THREE.Vector3()
  const res = ray.ray.intersectPlane(plane, hit)
  if (!res) return null
  return [hit.x, hit.y, hit.z]
}

export function createDragController(renderer, camera, { onDrop }) {
  const el = renderer.domElement
  let dragging = null // { partId, mesh }
  function ndc(e) {
    const r = el.getBoundingClientRect()
    return { x: ((e.clientX - r.left) / r.width) * 2 - 1, y: -((e.clientY - r.top) / r.height) * 2 + 1 }
  }
  function move(e) {
    if (!dragging) return
    const p = screenToGroundPoint(camera, ndc(e), dragging.planeZ)
    if (p) dragging.mesh.position.set(...p) // 直接跟手，不做悬停阻尼
  }
  function up(e) {
    if (!dragging) return
    const draggingPartId = dragging.partId
    const p = screenToGroundPoint(camera, ndc(e), dragging.planeZ)
    window.removeEventListener('pointermove', move)
    dragging = null
    onDrop(draggingPartId, p)
  }
  return {
    beginDrag(partId, mesh, planeZ = 0) {
      dragging = { partId, mesh, planeZ }
      window.addEventListener('pointermove', move)
      window.addEventListener('pointerup', up, { once: true })
    },
  }
}
