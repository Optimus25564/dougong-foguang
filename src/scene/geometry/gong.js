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

// 栱：主体长方，两端按卷杀 profile 削出栱头曲线（用挤出的 2D 侧形）。
// 可选 dims.lap：在栱中段开"十字搭接刻口"——{ side:'top'|'bottom', width, depth }（单位分），
// 刻口沿厚度(Z)贯通，正好让十字相交的另一根栱嵌进来，形成刻半咬合。
export function createGongGeometry(dims, bras) {
  const d = gongDimensions(dims)
  const prof = juanshaProfile(dims.caiGuang, bras).map(p => ({
    x: p.x * FEN_TO_M, y: p.y * FEN_TO_M,
  }))
  const jsLen = prof.at(-1).x           // 单端卷杀长
  const shape = new THREE.Shape()

  // dims.lap 可为单个或数组；每道 { side:'top'|'bottom', width, depth, at }（at 为相对栱心的分位）
  const laps = (dims.lap ? (Array.isArray(dims.lap) ? dims.lap : [dims.lap]) : []).map(l => ({
    side: l.side,
    w: l.width * FEN_TO_M,
    dep: l.depth * FEN_TO_M,
    cx: d.length / 2 + (l.at ?? 0) * FEN_TO_M,
  }))
  const topLap = laps.find(l => l.side === 'top')
  const bottomLap = laps.find(l => l.side === 'bottom')

  // 侧视轮廓：沿长度 X、高度 Y。内(左)端卷杀或方直 → 平直(含顶刻口) → 外(右)端卷杀 → 底边(含底刻口)
  // squareInner：出跳栱的内端做方榫（不卷杀），腾出平直栱身以开十字刻口、与横栱/枋刻半。
  if (dims.squareInner) {
    shape.moveTo(0, 0)
    shape.lineTo(0, d.guang)                                // 内端方直
  } else {
    shape.moveTo(0, prof[0].y)
    for (const p of prof) shape.lineTo(p.x, p.y)            // 内端卷杀上升
  }
  if (topLap) {                                            // 顶面某处开口（过横栱/枋处刻上半）
    shape.lineTo(topLap.cx - topLap.w / 2, d.guang)
    shape.lineTo(topLap.cx - topLap.w / 2, d.guang - topLap.dep)
    shape.lineTo(topLap.cx + topLap.w / 2, d.guang - topLap.dep)
    shape.lineTo(topLap.cx + topLap.w / 2, d.guang)
  }
  shape.lineTo(d.length - jsLen, d.guang)                  // 顶边直行
  for (let i = prof.length - 1; i >= 0; i--) {             // 右端下降（镜像）
    shape.lineTo(d.length - prof[i].x, prof[i].y)
  }
  shape.lineTo(d.length, 0)                                // 右下角
  if (bottomLap) {                                         // 底面某处开口（向上刻入，坐斗处）
    shape.lineTo(bottomLap.cx + bottomLap.w / 2, 0)
    shape.lineTo(bottomLap.cx + bottomLap.w / 2, bottomLap.dep)
    shape.lineTo(bottomLap.cx - bottomLap.w / 2, bottomLap.dep)
    shape.lineTo(bottomLap.cx - bottomLap.w / 2, 0)
  }
  shape.lineTo(0, 0)                                       // 底边回到左下
  shape.closePath()
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: d.hou, bevelEnabled: false,
  })
  geo.translate(-d.length / 2, -d.guang / 2, -d.hou / 2)
  return geo
}
