import { describe, it, expect } from 'vitest'
import { PARTS, getPart, REQUIRED_FIELDS } from '../src/content/parts.js'

describe('parts 数据表', () => {
  it('MVP 主轴含 6 件，层级从 0 递增无缺口', () => {
    expect(PARTS).toHaveLength(6)
    const layers = PARTS.map(p => p.layer).sort((a, b) => a - b)
    expect(layers).toEqual([0, 1, 2, 3, 4, 5])
  })

  it('每件字段齐全', () => {
    for (const p of PARTS) {
      for (const f of REQUIRED_FIELDS) {
        expect(p, `${p.id} 缺字段 ${f}`).toHaveProperty(f)
      }
    }
  })

  it('parents 引用的 id 都存在，且父件层级更低', () => {
    for (const p of PARTS) {
      for (const parentId of p.parents) {
        const parent = getPart(parentId)
        expect(parent, `${p.id} 的父件 ${parentId} 不存在`).toBeTruthy()
        expect(parent.layer).toBeLessThan(p.layer)
      }
    }
  })

  it('栌斗为基件，方 32 分高 20 分，无父件', () => {
    const ludou = getPart('ludou')
    expect(ludou.parents).toEqual([])
    expect(ludou.dims.fang).toBe(32)
    expect(ludou.dims.height).toBe(20)
  })

  it('华拱为足材：广 21 分、厚 10 分、卷杀 4 瓣', () => {
    const g = getPart('huagong-1')
    expect(g.dims.caiGuang).toBe(21)
    expect(g.dims.houDou).toBe(10)
    expect(g.juansha).toBe(4)
  })
})
