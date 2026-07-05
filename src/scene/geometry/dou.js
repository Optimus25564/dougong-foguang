import * as THREE from 'three'
import { FEN_TO_M } from '../../constants.js'

export function douDimensions(dims) {
  const { fang, height, ear, ping, xie, kouWidth = 10 } = dims
  return {
    width: fang * FEN_TO_M,
    depth: fang * FEN_TO_M,
    height: height * FEN_TO_M,
    earH: ear * FEN_TO_M,
    pingH: ping * FEN_TO_M,
    xieH: xie * FEN_TO_M,
    kou: kouWidth * FEN_TO_M,   // 斗口宽——十字凹槽的宽度，正好纳一材厚的栱/昂
  }
}

// 斗身自下而上：欹（底段·实心倒台，底面收分，无槽——斗坐在其下栱/柱之上）、
// 平（斗平·实心）、耳（顶段·四角方块中开十字斗口，纳其上的栱/昂）。
// 关键：只有顶面开十字口；底面是整块实心的欹，斗才敦实如斗、不成四脚板凳。
export function createDouGeometry(dims) {
  const d = douDimensions(dims)
  const geos = []

  // 欹：底段实心倒台，底面朝内收分（斗欹的外张之势），整块无槽
  const xie = new THREE.BoxGeometry(d.width, d.xieH, d.depth)
  const xp = xie.getAttribute('position')
  for (let i = 0; i < xp.count; i++) {
    if (xp.getY(i) < 0) { // 底面四边内收，成倒梯形（下小上大）
      xp.setX(i, xp.getX(i) * 0.72)
      xp.setZ(i, xp.getZ(i) * 0.72)
    }
  }
  xie.translate(0, -d.height / 2 + d.xieH / 2, 0)
  geos.push(xie)

  // 平（斗平）：实心，栱/昂就坐在这一层顶面
  const ping = new THREE.BoxGeometry(d.width, d.pingH, d.depth)
  ping.translate(0, -d.height / 2 + d.xieH + d.pingH / 2, 0)
  geos.push(ping)

  // 耳：顶面四角方块，中留十字斗口（纳其上的栱/昂，被四耳夹住）
  const earSide = (d.width - d.kou) / 2      // 角块在 X/Z 方向的边长
  const off = d.kou / 2 + earSide / 2        // 角块中心到斗轴的距离
  const earY = d.height / 2 - d.earH / 2
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      const ear = new THREE.BoxGeometry(earSide, d.earH, earSide)
      ear.translate(sx * off, earY, sz * off)
      geos.push(ear)
    }
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
