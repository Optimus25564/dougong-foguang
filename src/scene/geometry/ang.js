import * as THREE from 'three'
import { FEN_TO_M } from '../../constants.js'

export function angDimensions(dims) {
  return {
    length: dims.length * FEN_TO_M,
    guang: dims.caiGuang * FEN_TO_M,
    hou: dims.houDou * FEN_TO_M,
    slopeRad: (dims.slopeDeg * Math.PI) / 180,
  }
}

// 下昂/耍头：一根长木，昂尖端斜切（昂嘴），整体待安装时再倾斜。
// 可选 dims.lap：在底面开斗口刻口 { side:'bottom', width, depth, at }（分），使其明确骑坐在交互斗上。
export function createAngGeometry(dims) {
  const d = angDimensions(dims)
  // 侧形：长方体，前端（+X）斜切出批竹昂嘴（一道平斜面收到下前方的尖）
  const beakLen = d.guang * 1.0
  const lap = dims.lap
    ? { side: dims.lap.side, w: dims.lap.width * FEN_TO_M, dep: dims.lap.depth * FEN_TO_M, cx: d.length / 2 + (dims.lap.at ?? 0) * FEN_TO_M }
    : null
  const shape = new THREE.Shape()
  shape.moveTo(0, 0)
  if (lap && lap.side === 'bottom') {        // 底面中段开口（向上刻入）
    shape.lineTo(lap.cx - lap.w / 2, 0)
    shape.lineTo(lap.cx - lap.w / 2, lap.dep)
    shape.lineTo(lap.cx + lap.w / 2, lap.dep)
    shape.lineTo(lap.cx + lap.w / 2, 0)
  }
  shape.lineTo(d.length - beakLen, 0)
  shape.lineTo(d.length, d.guang * 0.16)    // 昂尖：收在下前方的一点（略高于底、利落不拖）
  shape.lineTo(d.length - beakLen, d.guang) // 批竹斜面：自顶棱一道平斜切到尖
  shape.lineTo(0, d.guang)
  shape.closePath()
  const geo = new THREE.ExtrudeGeometry(shape, { depth: d.hou, bevelEnabled: false })
  geo.translate(-d.length / 2, -d.guang / 2, -d.hou / 2)
  return geo
}
