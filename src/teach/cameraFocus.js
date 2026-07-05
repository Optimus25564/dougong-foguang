import * as THREE from 'three'

export function lerpVec(a, b, t) {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]
}

// 返回 tick(dt)：每帧推进相机趋向 target 视角，完成后 resolve
export function focusOn(camera, controls, targetVec3, { duration = 0.8 } = {}) {
  const startTarget = controls.target.clone()
  const end = new THREE.Vector3(...targetVec3)
  let t = 0
  return function tick(dt) {
    t = Math.min(1, t + dt / duration)
    const e = 1 - Math.pow(1 - t, 3) // easeOutCubic
    controls.target.lerpVectors(startTarget, end, e)
    return t >= 1
  }
}

// 通用双点相机补间：把相机与视线中心同时缓动到指定的相机位/目标位。
// 用于「受力·语境」等需要转到特定断面视角的场合。
export function frameTo(camera, controls, camPos, targetPos, { duration = 1.0 } = {}) {
  const sp = camera.position.clone()
  const st = controls.target.clone()
  const ep = new THREE.Vector3(...camPos)
  const et = new THREE.Vector3(...targetPos)
  let t = 0
  return function tick(dt) {
    t = Math.min(1, t + dt / duration)
    const e = 1 - Math.pow(1 - t, 3)
    camera.position.lerpVectors(sp, ep, e)
    controls.target.lerpVectors(st, et, e)
    return t >= 1
  }
}

// 取景补间：不仅把视线中心对到落点，还把相机拉近到落点前方固定的 3/4 近景，
// 让当前该放的这一件（哪怕小、哪怕被挡）稳稳占据画面中心。
const FRAME_DIR = new THREE.Vector3(0.34, 0.30, 1).normalize() // 固定视向：正面略偏右上
export function frameOn(camera, controls, targetVec3, { duration = 0.9, distance = 1.25 } = {}) {
  const startTarget = controls.target.clone()
  const startPos = camera.position.clone()
  const end = new THREE.Vector3(...targetVec3)
  const endPos = end.clone().addScaledVector(FRAME_DIR, distance)
  let t = 0
  return function tick(dt) {
    t = Math.min(1, t + dt / duration)
    const e = 1 - Math.pow(1 - t, 3) // easeOutCubic
    controls.target.lerpVectors(startTarget, end, e)
    camera.position.lerpVectors(startPos, endPos, e)
    return t >= 1
  }
}
