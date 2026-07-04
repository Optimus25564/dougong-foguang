import { describe, it, expect } from 'vitest'
import { easeOutCubic } from '../src/teach/motion.js'

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
