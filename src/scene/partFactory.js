import * as THREE from 'three'
import { getPart } from '../content/parts.js'
import { createWoodMaterial } from './materials/woodPBR.js'
import { createDouGeometry } from './geometry/dou.js'
import { createGongGeometry } from './geometry/gong.js'
import { createAngGeometry } from './geometry/ang.js'

function geometryFor(part) {
  if (part.id === 'ludou' || part.id.includes('dou')) return createDouGeometry(part.dims)
  if (part.id.startsWith('xiaang')) return createAngGeometry(part.dims)
  if (part.id.startsWith('huagong') || part.id === 'linggong') {
    return createGongGeometry(part.dims, part.juansha ?? 4)
  }
  throw new Error(`无法为部件生成几何：${part.id}`)
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
