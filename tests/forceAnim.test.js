import { describe, it, expect } from 'vitest'
import { leverBalance } from '../src/teach/forceAnim.js'

describe('下昂杠杆平衡', () => {
  it('t=0 无位移', () => {
    const r = leverBalance(0)
    expect(r.tipDrop).toBe(0)
    expect(r.tailRise).toBe(0)
  })
  it('随 t 增大，昂尖下沉、昂尾上翘，方向相反', () => {
    const r = leverBalance(1)
    expect(r.tipDrop).toBeGreaterThan(0)
    expect(r.tailRise).toBeGreaterThan(0)
    // 杠杆：尖下沉与尾上翘同步（绕支点）
    expect(Math.sign(r.tipDrop)).toBe(Math.sign(r.tailRise))
  })
  it('支点位置恒定在 0（栌斗一线）', () => {
    expect(leverBalance(0.3).pivotX).toBe(0)
    expect(leverBalance(0.9).pivotX).toBe(0)
  })
})
