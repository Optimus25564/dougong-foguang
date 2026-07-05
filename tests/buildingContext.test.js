import { describe, it, expect } from 'vitest'
import { contextDimensions, createBuildingContext } from '../src/scene/buildingContext.js'

describe('一开间建筑语境', () => {
  it('尺寸合理：柱顶在栌斗之下、柱脚落地、开间为正', () => {
    const d = contextDimensions()
    expect(d.colTopY).toBeCloseTo(-0.18, 2)      // 柱顶接栌斗底
    expect(d.groundY).toBeLessThan(d.colTopY)     // 柱脚在柱顶之下
    expect(d.bay).toBeGreaterThan(0)
    expect(d.colHeight).toBeCloseTo(d.colTopY - d.groundY, 5)
  })

  it('构建出含具名子件的 Group（本柱/邻柱/阑额/墙/屋面/地面）', () => {
    const { group } = createBuildingContext()
    expect(group.type).toBe('Group')
    const names = new Set(group.children.map(c => c.name))
    for (const n of ['column-main', 'column-neighbor', 'lane', 'wall', 'roof', 'ground']) {
      expect(names.has(n), `缺子件 ${n}`).toBe(true)
    }
  })

  it('setOpacity 调所有子件材质透明度，供淡入淡出', () => {
    const ctx = createBuildingContext()
    ctx.setOpacity(0.5)
    for (const c of ctx.group.children) {
      if (c.material) expect(c.material.opacity).toBeCloseTo(0.5 * (c.userData.maxOpacity ?? 1), 5)
    }
  })
})
