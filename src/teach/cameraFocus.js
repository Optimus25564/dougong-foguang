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
