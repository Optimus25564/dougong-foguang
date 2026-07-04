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

export function createDragController(renderer, camera, { onDrop }) {
  const el = renderer.domElement
  let dragging = null // { partId, mesh }
  function ndc(e) {
    const r = el.getBoundingClientRect()
    return { x: ((e.clientX - r.left) / r.width) * 2 - 1, y: -((e.clientY - r.top) / r.height) * 2 + 1 }
  }
  function move(e) {
    if (!dragging) return
    const p = screenToGroundPoint(camera, ndc(e))
    if (p) dragging.mesh.position.set(...p) // 直接跟手，不做悬停阻尼
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
      dragging = { partId, mesh }
      window.addEventListener('pointermove', move)
      window.addEventListener('pointerup', up, { once: true })
    },
  }
}
