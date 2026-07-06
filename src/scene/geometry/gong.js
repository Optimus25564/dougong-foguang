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

// 栱：据《营造法式》卷杀「上留六分、下杀九分」——顶边全平（满材广），两端把**底面**外角
// 卷杀上抬成栱头，端面留约 0.4 材广（六分）。故栱是平顶、底端起翘的栱臂，非拱起的驼峰。
// 可选 dims.squareInner：出跳栱内端做方直（不卷杀），腾出栱身开十字刻口。
// 可选 dims.lap：{ side:'top'|'bottom', width, depth, at }（分）——中段开十字搭接刻口，刻半咬合。
export function createGongGeometry(dims, bras) {
  const d = gongDimensions(dims)
  // 卷杀 profile：x 沿栱长、yb 为底边高度。栱端(x=0) 底边抬到 (广−留)，向内(x=jsLen) 落到 0。
  const prof = juanshaProfile(dims.caiGuang, bras).map(p => ({
    x: p.x * FEN_TO_M,
    yb: d.guang - p.y * FEN_TO_M,   // 由「顶边卷杀」翻为「底边卷杀」：底边抬起量 = 广 − 原曲线高
  }))
  const jsLen = prof.at(-1).x       // 单端卷杀长（此处 yb=0，栱身满高）
  const tip = prof[0].yb            // 栱端底边高度（端面 = 广 − tip = 留六分）

  const laps = (dims.lap ? (Array.isArray(dims.lap) ? dims.lap : [dims.lap]) : []).map(l => ({
    side: l.side,
    w: l.width * FEN_TO_M,
    dep: l.depth * FEN_TO_M,
    cx: d.length / 2 + (l.at ?? 0) * FEN_TO_M,
  }))
  const topLap = laps.find(l => l.side === 'top')
  const bottomLap = laps.find(l => l.side === 'bottom')

  const shape = new THREE.Shape()
  // —— 左端面 → 顶边(平，含顶刻口) → 右端面 ——
  if (dims.squareInner) {
    shape.moveTo(0, 0)                    // 内端方直（底到顶）
    shape.lineTo(0, d.guang)
  } else {
    shape.moveTo(0, tip)                  // 左端面下点（底边抬到 tip）
    shape.lineTo(0, d.guang)              // 左端面上行（端面高 = 广 − tip = 留）
  }
  if (topLap) {                           // 顶面某处开口（刻上半）
    shape.lineTo(topLap.cx - topLap.w / 2, d.guang)
    shape.lineTo(topLap.cx - topLap.w / 2, d.guang - topLap.dep)
    shape.lineTo(topLap.cx + topLap.w / 2, d.guang - topLap.dep)
    shape.lineTo(topLap.cx + topLap.w / 2, d.guang)
  }
  shape.lineTo(d.length, d.guang)         // 顶边全平到右端
  shape.lineTo(d.length, tip)             // 右端面下行到 tip

  // —— 右端底边卷杀（自 tip 落到栱身 0） ——
  for (let i = 0; i < prof.length; i++) {
    shape.lineTo(d.length - prof[i].x, prof[i].yb)
  }
  // —— 底边栱身段（平，含底刻口，坐斗处） ——
  if (bottomLap) {
    shape.lineTo(bottomLap.cx + bottomLap.w / 2, 0)
    shape.lineTo(bottomLap.cx + bottomLap.w / 2, bottomLap.dep)
    shape.lineTo(bottomLap.cx - bottomLap.w / 2, bottomLap.dep)
    shape.lineTo(bottomLap.cx - bottomLap.w / 2, 0)
  }
  // —— 左端底边卷杀（自栱身 0 抬回 tip；方直内端则直接回底角） ——
  if (dims.squareInner) {
    shape.lineTo(0, 0)
  } else {
    for (let i = prof.length - 1; i >= 0; i--) {
      shape.lineTo(prof[i].x, prof[i].yb)
    }
  }
  shape.closePath()

  const geo = new THREE.ExtrudeGeometry(shape, { depth: d.hou, bevelEnabled: false })
  geo.translate(-d.length / 2, -d.guang / 2, -d.hou / 2)
  return geo
}
