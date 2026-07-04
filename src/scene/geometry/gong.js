import * as THREE from 'three'
import { FEN_TO_M } from '../../constants.js'
import { juanshaProfile } from './juansha.js'

export function gongDimensions(dims) {
  return {
    length: dims.length * FEN_TO_M,
    guang: dims.caiGuang * FEN_TO_M,
    hou: dims.houDou * FEN_TO_M,
  }
}

// 栱：主体长方，两端按卷杀 profile 削出栱头曲线（用挤出的 2D 侧形）
export function createGongGeometry(dims, bras) {
  const d = gongDimensions(dims)
  const prof = juanshaProfile(dims.caiGuang, bras).map(p => ({
    x: p.x * FEN_TO_M, y: p.y * FEN_TO_M,
  }))
  const jsLen = prof.at(-1).x           // 单端卷杀长
  const shape = new THREE.Shape()
  // 侧视轮廓：沿长度 X、高度 Y。左端卷杀 → 平直 → 右端卷杀镜像
  shape.moveTo(0, prof[0].y)
  for (const p of prof) shape.lineTo(p.x, p.y)              // 左端上升
  shape.lineTo(d.length - jsLen, d.guang)                  // 顶边直行
  for (let i = prof.length - 1; i >= 0; i--) {             // 右端下降（镜像）
    shape.lineTo(d.length - prof[i].x, prof[i].y)
  }
  shape.lineTo(d.length, 0)                                // 右下角
  shape.lineTo(0, 0)                                       // 底边回到左下
  shape.closePath()
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: d.hou, bevelEnabled: false,
  })
  geo.translate(-d.length / 2, -d.guang / 2, -d.hou / 2)
  return geo
}
