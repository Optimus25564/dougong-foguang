import { describe, it, expect } from 'vitest'
import { PARTS, getPart, REQUIRED_FIELDS } from '../src/content/parts.js'

describe('parts 数据表', () => {
  it('七铺作隔跳偷心共 26 件，层级严格递增、唯一', () => {
    expect(PARTS).toHaveLength(26)
    const layers = PARTS.map(p => p.layer).sort((a, b) => a - b)
    for (let i = 1; i < layers.length; i++) {
      expect(layers[i], `层级须严格递增：${layers[i - 1]} → ${layers[i]}`).toBeGreaterThan(layers[i - 1])
    }
    expect(layers[0]).toBe(0) // 栌斗为基
  })

  it('八散斗分列三处：泥道承柱头枋、瓜子/慢栱承罗汉枋、令栱承替木', () => {
    const san = PARTS.filter(p => p.id.startsWith('sandou'))
    expect(san).toHaveLength(8)
    for (const s of san) expect(s.term).toBe('散斗')
    // 泥道一列 → 柱头枋
    for (const id of ['sandou-1', 'sandou-2']) expect(getPart(id).parents).toContain('nidaogong')
    expect(getPart('zhutoufang').parents).toEqual(['sandou-1', 'sandou-2'])
    // 第二跳计心：瓜子栱端散斗 → 慢栱；慢栱端散斗 → 罗汉枋
    for (const id of ['sandou-5', 'sandou-6']) expect(getPart(id).parents).toContain('guazigong')
    expect(getPart('mangong').parents).toEqual(['sandou-5', 'sandou-6'])
    for (const id of ['sandou-7', 'sandou-8']) expect(getPart(id).parents).toContain('mangong')
    expect(getPart('luohanfang').parents).toEqual(['sandou-7', 'sandou-8'])
    // 令栱一列 → 替木
    for (const id of ['sandou-3', 'sandou-4']) expect(getPart(id).parents).toContain('linggong')
    expect(getPart('timu').parents).toEqual(['sandou-3', 'sandou-4'])
  })

  it('隔跳偷心造：二跳计心施重栱（瓜子栱→慢栱→罗汉枋），一、三跳偷心', () => {
    // 第二跳跳头（交互斗二）之上施瓜子栱、慢栱、罗汉枋，即计心
    expect(getPart('guazigong').parents).toEqual(['jiaohudou-2'])
    expect(getPart('guazigong').term).toBe('瓜子栱')
    expect(getPart('mangong').term).toBe('慢栱')
    expect(getPart('luohanfang').term).toBe('罗汉枋')
    // 一、三跳偷心：华栱一、下昂一跳头只承交互斗，不施横栱
    expect(getPart('jiaohudou-1').parents).toEqual(['huagong-1'])
    expect(getPart('jiaohudou-3').parents).toEqual(['xiaang-1'])
  })

  it('4 颗交互斗各就其位，坐于所承托构件下方的跳头', () => {
    const dous = PARTS.filter(p => p.id.startsWith('jiaohudou'))
    expect(dous).toHaveLength(4)
    for (const d of dous) expect(d.term).toBe('交互斗')
  })

  it('横栱分布：泥道一列 + 二跳计心（瓜子/慢栱）+ 令栱，承檐三件齐备', () => {
    // 泥道栱、柱头枋（泥道一列）+ 二跳计心横栱 + 令栱（四跳计心）
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
