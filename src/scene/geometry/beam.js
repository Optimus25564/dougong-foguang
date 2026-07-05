import * as THREE from 'three'
import { FEN_TO_M } from '../../constants.js'

// 枋 / 替木：一根方直长木。长沿 X、广沿 Y、厚沿 Z，居中。
// 横向构件（柱头枋、替木）安装时由 placement 的 rotY 转 90° 使其沿进深方向。
// 可选 dims.lap（单个或数组）：在底/顶面开刻口，与纵向穿过的栱十字刻半搭接。
export function createFangGeometry(dims) {
  const length = dims.length * FEN_TO_M
  const guang = dims.caiGuang * FEN_TO_M
  const hou = dims.houDou * FEN_TO_M
  const laps = (dims.lap ? (Array.isArray(dims.lap) ? dims.lap : [dims.lap]) : []).map(l => ({
    side: l.side, w: l.width * FEN_TO_M, dep: l.depth * FEN_TO_M, cx: length / 2 + (l.at ?? 0) * FEN_TO_M,
  }))
  if (!laps.length) return new THREE.BoxGeometry(length, guang, hou)
  const topLap = laps.find(l => l.side === 'top')
  const bottomLap = laps.find(l => l.side === 'bottom')
  const s = new THREE.Shape()
  s.moveTo(0, 0)
  if (bottomLap) {
    s.lineTo(bottomLap.cx - bottomLap.w / 2, 0)
    s.lineTo(bottomLap.cx - bottomLap.w / 2, bottomLap.dep)
    s.lineTo(bottomLap.cx + bottomLap.w / 2, bottomLap.dep)
    s.lineTo(bottomLap.cx + bottomLap.w / 2, 0)
  }
  s.lineTo(length, 0)
  s.lineTo(length, guang)
  if (topLap) {
    s.lineTo(topLap.cx + topLap.w / 2, guang)
    s.lineTo(topLap.cx + topLap.w / 2, guang - topLap.dep)
    s.lineTo(topLap.cx - topLap.w / 2, guang - topLap.dep)
    s.lineTo(topLap.cx - topLap.w / 2, guang)
  }
  s.lineTo(0, guang)
  s.closePath()
  const geo = new THREE.ExtrudeGeometry(s, { depth: hou, bevelEnabled: false })
  geo.translate(-length / 2, -guang / 2, -hou / 2)
  return geo
}

// 替木：压在令栱上、承撩檐槫的短垫木。顶面沿长度方向开一道弧形鞍口，
// 让圆撩檐槫嵌坐其中——把圆檩的线接触摊成面接触，也让"垫—托"关系一眼可见。
// 截面在 X(进深)–Y(高) 平面：矩形顶部挖出半径 saddleR 的凹弧，再沿 Z 挤出为长度，
// 最后转 90° 使长度轴回到 X，与其它构件的本地朝向一致。
export function createTimuGeometry(dims) {
  const length = dims.length * FEN_TO_M
  const guang = dims.caiGuang * FEN_TO_M
  const hou = dims.houDou * FEN_TO_M
  const R = (dims.saddleRadius ?? 10) * FEN_TO_M  // 鞍口弧半径（略大于撩檐槫半径，令其松嵌）
  const sink = (dims.saddleSink ?? 3) * FEN_TO_M  // 鞍口最深处相对顶面的下凹
  const hw = hou / 2, hh = guang / 2
  const cy = hh - sink + R                         // 凹弧所在圆的圆心（在顶面之上）
  const dx = Math.sqrt(Math.max(1e-9, R * R - hw * hw))
  const edgeB = cy - dx                            // 弧在两侧壁处的高度
  const a0 = Math.atan2(edgeB - cy, hw)            // 右壁端角
  const a1 = Math.atan2(edgeB - cy, -hw)           // 左壁端角
  const s = new THREE.Shape()
  s.moveTo(-hw, -hh)
  s.lineTo(hw, -hh)
  s.lineTo(hw, edgeB)
  s.absarc(0, cy, R, a0, a1, true)                 // 顶面凹弧（鞍口）
  s.lineTo(-hw, -hh)
  const geo = new THREE.ExtrudeGeometry(s, { depth: length, bevelEnabled: false })
  geo.translate(0, 0, -length / 2)                 // 沿长度居中
  geo.rotateY(Math.PI / 2)                          // 长度轴 Z→X，与其它构件一致
  return geo
}

// 橑檐槫：最外一道檐檩，圆木。默认圆柱沿 Y，转 90° 使其沿 X（再由 rotY 转到进深方向）。
export function createTuanGeometry(dims) {
  const r = dims.radius * FEN_TO_M
  const length = dims.length * FEN_TO_M
  const geo = new THREE.CylinderGeometry(r, r, length, 24)
  geo.rotateZ(Math.PI / 2) // 卧倒，长沿 X
  return geo
}
