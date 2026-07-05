import { describe, it, expect } from 'vitest'
import { explodedOffset, EXPLODE_GAP } from '../src/teach/explode.js'

describe('拆解图偏移', () => {
  it('第 0 件不动，其后每件按顺序纵向递增拉开', () => {
    expect(explodedOffset(0)).toEqual([0, 0, 0])
    expect(explodedOffset(1)).toEqual([0, EXPLODE_GAP, 0])
    expect(explodedOffset(3)).toEqual([0, 3 * EXPLODE_GAP, 0])
  })
  it('仅在纵轴（Y）上拉开，X/Z 不变', () => {
    const [x, , z] = explodedOffset(5)
    expect(x).toBe(0)
    expect(z).toBe(0)
  })
})
