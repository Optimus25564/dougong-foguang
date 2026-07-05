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

// 按住拖拽（鼠标 / 触屏统一走 Pointer Events）：从零件盘按下即抓起、跟手移动、松手放下。
// 拖动期间关掉 OrbitControls，避免同一根手指既拖件又转镜头（触屏上二者本会打架）。
export function createDragController(renderer, camera, controls, { onDrop }) {
  const el = renderer.domElement
  let dragging = null // { partId, mesh, planeZ }

  function ndc(e) {
    const r = el.getBoundingClientRect()
    return { x: ((e.clientX - r.left) / r.width) * 2 - 1, y: -((e.clientY - r.top) / r.height) * 2 + 1 }
  }
  function move(e) {
    if (!dragging) return
    const p = screenToGroundPoint(camera, ndc(e), dragging.planeZ)
    if (p) dragging.mesh.position.set(...p) // 直接跟手，不做悬停阻尼
  }
  function teardown() {
    window.removeEventListener('pointermove', move)
    window.removeEventListener('pointerup', up)
    window.removeEventListener('pointercancel', cancel)
    if (controls) controls.enabled = true // 恢复镜头旋转
  }
  function up(e) {
    if (!dragging) return
    const { partId, planeZ } = dragging
    const p = screenToGroundPoint(camera, ndc(e), planeZ)
    dragging = null
    teardown()
    onDrop(partId, p)
  }
  function cancel() { // 触摸被系统打断（来电、手势返回等）：按未对准处理，避免卡住
    if (!dragging) return
    const { partId } = dragging
    dragging = null
    teardown()
    onDrop(partId, null)
  }

  return {
    beginDrag(partId, mesh, planeZ = 0, startEvent = null) {
      dragging = { partId, mesh, planeZ }
      if (controls) controls.enabled = false
      if (startEvent) move(startEvent) // 立刻定位到按下点，手指/光标下即出现该件
      window.addEventListener('pointermove', move)
      window.addEventListener('pointerup', up)
      window.addEventListener('pointercancel', cancel)
    },
  }
}
