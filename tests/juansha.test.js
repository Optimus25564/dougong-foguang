import { describe, it, expect } from 'vitest'
import { juanshaProfile } from '../src/scene/geometry/juansha.js'

describe('卷杀 juansha', () => {
  it('四瓣卷杀返回 5 个点', () => {
    expect(juanshaProfile(21, 4)).toHaveLength(5)
  })

  it('五瓣卷杀返回 6 个点', () => {
    expect(juanshaProfile(15, 5)).toHaveLength(6)
  })

  it('起点在栱端（x=0）高度最低，终点达满材广', () => {
    const pts = juanshaProfile(21, 4)
    expect(pts[0].x).toBe(0)
    expect(pts.at(-1).y).toBeCloseTo(21, 5)
    expect(pts[0].y).toBeLessThan(pts.at(-1).y)
  })

  it('x 单调递增，y 单调不减（曲线向上向内收）', () => {
    const pts = juanshaProfile(21, 4)
    for (let i = 1; i < pts.length; i++) {
      expect(pts[i].x).toBeGreaterThan(pts[i - 1].x)
      expect(pts[i].y).toBeGreaterThanOrEqual(pts[i - 1].y)
    }
  })
})
