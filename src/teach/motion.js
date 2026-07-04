import { lerpVec } from './cameraFocus.js'

// 缓出立方：开始快、结尾慢，适合"归位"这种从动到静的收尾感
export function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3)
}

export const SETTLE_MS = 600
export const DISMISS_MS = 400

// 归位缓落：部件从松手处的落点缓缓滑入最终装配位，转动瞬时到位、位移渐进
export function settleTween(mesh, fromPos, toPos, durationMs) {
  let elapsed = 0
  return function tick(dt) {
    elapsed += dt * 1000
    const t = Math.min(1, elapsed / durationMs)
    const e = easeOutCubic(t)
    mesh.position.set(...lerpVec(fromPos, toPos, e))
    return t >= 1
  }
}

// 回收缩淡：吸附失败时不再瞬间消失，而是缩小并淡出，给"被放弃"一个柔和的过渡
export function dismissTween(mesh, durationMs, onDone) {
  let elapsed = 0
  mesh.material.transparent = true
  const startOpacity = mesh.material.opacity ?? 1
  const startScale = mesh.scale.x || 1
  const endScale = 0.1
  return function tick(dt) {
    elapsed += dt * 1000
    const t = Math.min(1, elapsed / durationMs)
    const e = easeOutCubic(t)
    const scale = startScale + (endScale - startScale) * e
    mesh.scale.setScalar(scale)
    mesh.material.opacity = startOpacity * (1 - e)
    if (t >= 1) {
      onDone()
      return true
    }
    return false
  }
}
