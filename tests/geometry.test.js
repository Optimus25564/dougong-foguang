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
