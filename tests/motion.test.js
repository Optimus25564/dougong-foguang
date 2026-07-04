import { describe, it, expect } from 'vitest'
import { easeOutCubic } from '../src/teach/motion.js'
import { smoothingAlpha } from '../src/interaction/dragPlace.js'

describe('缓出立方 easeOutCubic', () => {
  it('t=0 为 0，t=1 为 1', () => {
    expect(easeOutCubic(0)).toBe(0)
    expect(easeOutCubic(1)).toBe(1)
  })
  it('t=0.5 介于 0~1 之间，且高于线性中点（先快后慢）', () => {
    const v = easeOutCubic(0.5)
    expect(v).toBeGreaterThan(0)
    expect(v).toBeLessThan(1)
    expect(v).toBeGreaterThan(0.5)
  })
})

describe('帧率无关的阻尼平滑 smoothingAlpha', () => {
  it('dt=0.016s 时返回 (0,1) 区间内的追赶比例', () => {
    const a = smoothingAlpha(0.016, 0.0005)
    expect(a).toBeGreaterThan(0)
    expect(a).toBeLessThan(1)
  })
  it('dt 越大，本帧应追上的比例越高', () => {
    const small = smoothingAlpha(0.016, 0.0005)
    const large = smoothingAlpha(0.1, 0.0005)
    expect(large).toBeGreaterThan(small)
  })
})
