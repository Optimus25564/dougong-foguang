import * as THREE from 'three'
import { FEN_TO_M } from '../../constants.js'

export function douDimensions(dims) {
  const { fang, height, ear, ping, xie } = dims
  return {
    width: fang * FEN_TO_M,
    depth: fang * FEN_TO_M,
    height: height * FEN_TO_M,
    earH: ear * FEN_TO_M,
    pingH: ping * FEN_TO_M,
    xieH: xie * FEN_TO_M,
  }
}

// 斗身自下而上：欹（下大上小内收）、平（直）、耳（顶部两侧凸起简化为直块）
export function createDouGeometry(dims) {
  const d = douDimensions(dims)
  const geos = []
  // 欹：底面略小、顶面满宽的倒台（用缩放的 box 近似 → 用 BufferGeometry 顶点）
  const xie = new THREE.BoxGeometry(d.width, d.xieH, d.depth)
  const posAttr = xie.getAttribute('position')
  for (let i = 0; i < posAttr.count; i++) {
    if (posAttr.getY(i) < 0) { // 底面内收 20%
      posAttr.setX(i, posAttr.getX(i) * 0.8)
      posAttr.setZ(i, posAttr.getZ(i) * 0.8)
    }
  }
  xie.translate(0, -d.height / 2 + d.xieH / 2, 0)
  geos.push(xie)
  // 平
  const ping = new THREE.BoxGeometry(d.width, d.pingH, d.depth)
  ping.translate(0, -d.height / 2 + d.xieH + d.pingH / 2, 0)
  geos.push(ping)
  // 耳（含十字口：中间开槽，用两侧两块表示）
  const earGap = d.width * 0.25
  for (const sx of [-1, 1]) {
    const ear = new THREE.BoxGeometry((d.width - earGap) / 2, d.earH, d.depth)
    ear.translate(sx * (earGap / 2 + (d.width - earGap) / 4), d.height / 2 - d.earH / 2, 0)
    geos.push(ear)
  }
  return mergeGeometries(geos)
}

// 极简合并（避免额外依赖 BufferGeometryUtils）
function mergeGeometries(geos) {
  const merged = new THREE.BufferGeometry()
  const arrays = geos.map(g => g.toNonIndexed().getAttribute('position').array)
  const total = arrays.reduce((n, a) => n + a.length, 0)
  const positions = new Float32Array(total)
  let off = 0
  for (const a of arrays) { positions.set(a, off); off += a.length }
  merged.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  merged.computeVertexNormals()
  return merged
}
