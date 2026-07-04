import * as THREE from 'three'

const PLANE = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0) // z=0 装配面

export function screenToGroundPoint(camera, ndc) {
  const ray = new THREE.Raycaster()
  ray.setFromCamera(new THREE.Vector2(ndc.x, ndc.y), camera)
  const hit = new THREE.Vector3()
  ray.ray.intersectPlane(PLANE, hit)
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
    dragging.mesh.position.set(...p)
  }
  function up(e) {
    if (!dragging) return
    const p = screenToGroundPoint(camera, ndc(e))
    onDrop(dragging.partId, p)
    dragging = null
    el.removeEventListener('pointermove', move)
  }
  return {
    beginDrag(partId, mesh) {
      dragging = { partId, mesh }
      el.addEventListener('pointermove', move)
      el.addEventListener('pointerup', up, { once: true })
    },
  }
}
