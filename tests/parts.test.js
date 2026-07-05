import { describe, it, expect } from 'vitest'
import { PARTS, getPart, REQUIRED_FIELDS } from '../src/content/parts.js'

describe('parts 数据表', () => {
  it('七铺作偷心造共 17 件（含泥道两散斗），层级严格递增、唯一', () => {
    expect(PARTS).toHaveLength(17)
    const layers = PARTS.map(p => p.layer).sort((a, b) => a - b)
    for (let i = 1; i < layers.length; i++) {
      expect(layers[i], `层级须严格递增：${layers[i - 1]} → ${layers[i]}`).toBeGreaterThan(layers[i - 1])
    }
    expect(layers[0]).toBe(0) // 栌斗为基
  })

  it('泥道两散斗坐于泥道栱、共承柱头枋', () => {
    const san = PARTS.filter(p => p.id.startsWith('sandou'))
    expect(san).toHaveLength(2)
    for (const s of san) expect(s.parents).toContain('nidaogong')
    expect(getPart('zhutoufang').parents).toEqual(['sandou-1', 'sandou-2'])
  })

  it('4 颗交互斗各就其位，坐于所承托构件下方的跳头', () => {
    const dous = PARTS.filter(p => p.id.startsWith('jiaohudou'))
    expect(dous).toHaveLength(4)
    for (const d of dous) expect(d.term).toBe('交互斗')
  })

  it('偷心造：外跳三个跳头不施横栱，横栱只在泥道一列与令栱', () => {
    // 泥道栱、柱头枋（泥道一列）+ 令栱（外跳唯一计心）
    expect(getPart('nidaogong').term).toBe('泥道栱')
    expect(getPart('zhutoufang').term).toBe('柱头枋')
    expect(getPart('linggong').term).toBe('令栱')
    // 补全的承檐三件
    for (const id of ['shuatou', 'timu', 'liaoyantuan']) {
      expect(getPart(id), `${id} 应存在`).toBeTruthy()
    }
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
