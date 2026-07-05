import { describe, it, expect } from 'vitest'
import { createFangGeometry, createTimuGeometry, createTuanGeometry } from '../src/scene/geometry/beam.js'

describe('枋/替木/槫 几何', () => {
  it('柱头枋（方直枋）返回非空 BufferGeometry', () => {
    const g = createFangGeometry({ length: 120, caiGuang: 15, houDou: 10 })
    expect(g.getAttribute('position').count).toBeGreaterThan(0)
  })

  it('替木顶开鞍口：几何非空，且沿长度轴（X）居中', () => {
    const g = createTimuGeometry({ length: 96, caiGuang: 12, houDou: 10, saddleRadius: 10, saddleSink: 3 })
    g.computeBoundingBox()
    const bb = g.boundingBox
    expect(g.getAttribute('position').count).toBeGreaterThan(0)
    expect((bb.min.x + bb.max.x) / 2).toBeCloseTo(0, 5)      // 长度轴居中
    expect(bb.max.x - bb.min.x).toBeCloseTo(0.96, 2)          // 长 96 分 = 0.96 m
  })

  it('鞍口令替木顶面下凹：顶部最高点低于无槽时的满高', () => {
    const g = createTimuGeometry({ length: 96, caiGuang: 12, houDou: 10, saddleRadius: 10, saddleSink: 3 })
    g.computeBoundingBox()
    // 满高应为 caiGuang=0.12，半高 0.06；开槽后顶面最高点应略低于 0.06
    expect(g.boundingBox.max.y).toBeLessThan(0.06)
  })

  it('橑檐槫（圆檩）返回非空几何', () => {
    const g = createTuanGeometry({ length: 150, radius: 9 })
    expect(g.getAttribute('position').count).toBeGreaterThan(0)
  })
})
