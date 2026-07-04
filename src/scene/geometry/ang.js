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

// 下昂：一根长木，昂尖端斜切（昂嘴），整体待安装时再倾斜
export function createAngGeometry(dims) {
  const d = angDimensions(dims)
  // 侧形：长方体，前端（+X）上方斜切出昂嘴
  const beakLen = d.guang * 1.6
  const shape = new THREE.Shape()
  shape.moveTo(0, 0)
  shape.lineTo(d.length - beakLen, 0)
  shape.lineTo(d.length, -d.guang * 0.15)   // 昂尖下探
  shape.lineTo(d.length - beakLen, d.guang) // 斜切上棱
  shape.lineTo(0, d.guang)
  shape.closePath()
  const geo = new THREE.ExtrudeGeometry(shape, { depth: d.hou, bevelEnabled: false })
  geo.translate(-d.length / 2, -d.guang / 2, -d.hou / 2)
  return geo
}
