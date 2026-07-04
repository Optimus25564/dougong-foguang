import { describe, it, expect } from 'vitest'
import { buildPartMesh } from '../src/scene/partFactory.js'

describe('部件工厂', () => {
  it('为栌斗造带 userData 的 Mesh', () => {
    const m = buildPartMesh('ludou')
    expect(m.type).toBe('Mesh')
    expect(m.userData.partId).toBe('ludou')
    expect(m.geometry.getAttribute('position').count).toBeGreaterThan(0)
    expect(m.material.type).toBe('MeshStandardMaterial')
  })
  it('华栱、下昂、令栱都能造出', () => {
    for (const id of ['huagong-1', 'xiaang-1', 'linggong']) {
      expect(buildPartMesh(id).userData.partId).toBe(id)
    }
  })
  it('未知 id 抛错', () => {
    expect(() => buildPartMesh('nope')).toThrow()
  })
})
