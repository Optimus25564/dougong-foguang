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

// 橑檐槫：最外一道檐檩，圆木。默认圆柱沿 Y，转 90° 使其沿 X（再由 rotY 转到进深方向）。
export function createTuanGeometry(dims) {
  const r = dims.radius * FEN_TO_M
  const length = dims.length * FEN_TO_M
  const geo = new THREE.CylinderGeometry(r, r, length, 24)
  geo.rotateZ(Math.PI / 2) // 卧倒，长沿 X
  return geo
}
