import { describe, it, expect } from 'vitest'
import { ASSEMBLY_STEPS, stepForIndex } from '../src/content/assemblySteps.js'
import { PARTS } from '../src/content/parts.js'

describe('拼装顺序', () => {
  it('步数等于部件数，index 连续从 0', () => {
    expect(ASSEMBLY_STEPS).toHaveLength(PARTS.length)
    ASSEMBLY_STEPS.forEach((s, i) => expect(s.index).toBe(i))
  })

  it('顺序即 layer 升序：第一件是栌斗，最后是令栱', () => {
    expect(ASSEMBLY_STEPS[0].partId).toBe('ludou')
    expect(ASSEMBLY_STEPS.at(-1).partId).toBe('linggong')
  })

  it('每步的父件都排在它之前', () => {
    const orderOf = id => ASSEMBLY_STEPS.findIndex(s => s.partId === id)
    for (const p of PARTS) {
      for (const parentId of p.parents) {
        expect(orderOf(parentId)).toBeLessThan(orderOf(p.id))
      }
    }
  })

  it('每步都有非空 hint 文案', () => {
    for (const s of ASSEMBLY_STEPS) {
      expect(typeof s.hint).toBe('string')
      expect(s.hint.length).toBeGreaterThan(0)
    }
  })

  it('stepForIndex 越界返回 null', () => {
    expect(stepForIndex(0).partId).toBe('ludou')
    expect(stepForIndex(999)).toBeNull()
  })
})
