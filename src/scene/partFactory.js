import * as THREE from 'three'
import { getPart } from '../content/parts.js'
import { createWoodMaterial } from './materials/woodPBR.js'
import { createDouGeometry } from './geometry/dou.js'
import { createGongGeometry } from './geometry/gong.js'
import { createAngGeometry } from './geometry/ang.js'
import { createFangGeometry, createTuanGeometry } from './geometry/beam.js'

function geometryFor(part) {
  const id = part.id
  if (id === 'ludou' || id.includes('dou')) return createDouGeometry(part.dims)   // 栌斗 / 交互斗
  if (id.startsWith('xiaang') || id === 'shuatou') return createAngGeometry(part.dims) // 下昂 / 耍头
  if (id === 'zhutoufang' || id === 'timu') return createFangGeometry(part.dims)  // 柱头枋 / 替木
  if (id === 'liaoyantuan') return createTuanGeometry(part.dims)                   // 橑檐槫
  if (id.includes('gong')) return createGongGeometry(part.dims, part.juansha ?? 4) // 华栱 / 泥道栱 / 令栱
  throw new Error(`无法为部件生成几何：${id}`)
}

export function buildPartMesh(partId) {
  const part = getPart(partId)
  if (!part) throw new Error(`未知部件：${partId}`)
  const mesh = new THREE.Mesh(geometryFor(part), createWoodMaterial())
  mesh.userData.partId = partId
  mesh.castShadow = mesh.receiveShadow = true
  return mesh
}

// 交互斗等连接小斗：无对应 part 数据，直接按给定 dims 造一个斗
export function buildDouMesh(dims) {
  const mesh = new THREE.Mesh(createDouGeometry(dims), createWoodMaterial())
  mesh.castShadow = mesh.receiveShadow = true
  return mesh
}
