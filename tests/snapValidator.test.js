import { describe, it, expect } from 'vitest'
import { validateSnap, SNAP_TOLERANCE } from '../src/interaction/snapValidator.js'
import { placementFor } from '../src/content/placements.js'

describe('吸附校验', () => {
  it('落在目标附近则吸附成功并给出目标位姿', () => {
    const target = placementFor('ludou').pos
    const near = [target[0] + 0.02, target[1], target[2]]
    const r = validateSnap('ludou', near)
    expect(r.ok).toBe(true)
    expect(r.target.pos).toEqual(target)
  })
  it('偏离过远则失败', () => {
    const r = validateSnap('ludou', [5, 5, 5])
    expect(r.ok).toBe(false)
    expect(r.distance).toBeGreaterThan(SNAP_TOLERANCE)
  })
  it('未知部件返回 ok:false', () => {
    expect(validateSnap('nope', [0, 0, 0]).ok).toBe(false)
  })
})
