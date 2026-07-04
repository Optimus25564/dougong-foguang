import { describe, it, expect } from 'vitest'
import { PLACEMENTS, placementFor } from '../src/content/placements.js'
import { PARTS } from '../src/content/parts.js'

describe('目标位姿', () => {
  it('每个部件都有位姿', () => {
    for (const p of PARTS) expect(PLACEMENTS[p.id]).toBeTruthy()
  })
  it('层级越高 Y 越大（自下而上堆叠）', () => {
    const y = id => PLACEMENTS[id].pos[1]
    expect(y('ludou')).toBeLessThan(y('huagong-1'))
    expect(y('huagong-1')).toBeLessThan(y('xiaang-1'))
    expect(y('xiaang-1')).toBeLessThan(y('linggong'))
  })
  it('下昂带负 rotZ（向外下斜）', () => {
    expect(placementFor('xiaang-1').rotZ).toBeLessThan(0)
  })
  it('placementFor 越界返回 null', () => {
    expect(placementFor('nope')).toBeNull()
  })
})
