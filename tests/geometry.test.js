import { describe, it, expect } from 'vitest'
import { douDimensions, createDouGeometry } from '../src/scene/geometry/dou.js'
import { gongDimensions, createGongGeometry } from '../src/scene/geometry/gong.js'
import { angDimensions, createAngGeometry } from '../src/scene/geometry/ang.js'
import { FEN_TO_M } from '../src/constants.js'

describe('斗几何', () => {
  it('栌斗尺寸按分换算为米', () => {
    const d = douDimensions({ fang: 32, height: 20, ear: 8, ping: 4, xie: 8 })
    expect(d.width).toBeCloseTo(32 * FEN_TO_M, 5)
    expect(d.height).toBeCloseTo(20 * FEN_TO_M, 5)
    expect(d.earH + d.pingH + d.xieH).toBeCloseTo(d.height, 5)
  })
  it('createDouGeometry 返回非空 BufferGeometry', () => {
    const g = createDouGeometry({ fang: 32, height: 20, ear: 8, ping: 4, xie: 8 })
    expect(g.type).toBe('BufferGeometry')
    expect(g.getAttribute('position').count).toBeGreaterThan(0)
  })
  it('顶面开十字口：耳在四角、斗口中线无耳（可纳栱咬合）', () => {
    const dims = { fang: 32, height: 20, ear: 8, ping: 4, xie: 8, kouWidth: 10 }
    const g = createDouGeometry(dims)
    const p = g.getAttribute('position')
    const topY = (20 / 2) * FEN_TO_M
    const halfKou = (10 / 2) * FEN_TO_M
    let cornerEarVerts = 0
    let centerTopVerts = 0
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), y = p.getY(i), z = p.getZ(i)
      if (y < topY - 1e-6) continue                 // 只看顶面耳层
      if (Math.abs(x) < halfKou - 1e-4 && Math.abs(z) < halfKou - 1e-4) centerTopVerts++ // 十字口中心
      if (Math.abs(x) > halfKou + 1e-4 && Math.abs(z) > halfKou + 1e-4) cornerEarVerts++  // 四角
    }
    expect(cornerEarVerts).toBeGreaterThan(0)   // 四角有耳
    expect(centerTopVerts).toBe(0)              // 斗口中线（十字交点）无实体——正是纳栱的槽
  })
})

describe('栱几何', () => {
  it('华栱长度、瓣数正确', () => {
    const d = gongDimensions({ length: 72, caiGuang: 21, houDou: 10 })
    expect(d.length).toBeCloseTo(72 * FEN_TO_M, 5)
    expect(d.guang).toBeCloseTo(21 * FEN_TO_M, 5)
  })
  it('createGongGeometry 返回非空几何', () => {
    const g = createGongGeometry({ length: 72, caiGuang: 21, houDou: 10 }, 4)
    expect(g.getAttribute('position').count).toBeGreaterThan(0)
  })
  it('带搭接刻口(lap)的栱几何比无刻口的多出顶点——刻口确实开出来了', () => {
    const plain = createGongGeometry({ length: 72, caiGuang: 21, houDou: 10 }, 4)
    const lapped = createGongGeometry(
      { length: 72, caiGuang: 21, houDou: 10, lap: { side: 'top', width: 10, depth: 10 } }, 4,
    )
    expect(lapped.getAttribute('position').count).toBeGreaterThan(plain.getAttribute('position').count)
  })
})

describe('昂几何', () => {
  it('下昂斜度转弧度', () => {
    const d = angDimensions({ length: 120, caiGuang: 21, houDou: 10, slopeDeg: 25 })
    expect(d.slopeRad).toBeCloseTo((25 * Math.PI) / 180, 5)
    expect(d.length).toBeCloseTo(120 * FEN_TO_M, 5)
  })
  it('createAngGeometry 返回非空几何', () => {
    const g = createAngGeometry({ length: 120, caiGuang: 21, houDou: 10, slopeDeg: 25 })
    expect(g.getAttribute('position').count).toBeGreaterThan(0)
  })
})
