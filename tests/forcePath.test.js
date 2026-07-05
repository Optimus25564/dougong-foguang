import { describe, it, expect } from 'vitest'
import { FORCE_STEPS, forceNodes } from '../src/content/forcePath.js'

describe('传力链数据', () => {
  it('六步，自上而下 y 严格递减', () => {
    const nodes = forceNodes()
    expect(nodes).toHaveLength(6)
    for (let i = 1; i < nodes.length; i++) {
      expect(nodes[i].pos[1]).toBeLessThan(nodes[i - 1].pos[1])
    }
  })

  it('每步都有非空 label 与 caption', () => {
    for (const s of FORCE_STEPS) {
      expect(s.label.length).toBeGreaterThan(0)
      expect(s.caption.length).toBeGreaterThan(0)
    }
  })

  it('起于撩檐槫、终于入地点，端点均解析出三维坐标', () => {
    const nodes = forceNodes()
    expect(nodes[0].id).toBe('eave')
    expect(nodes.at(-1).id).toBe('column')
    for (const n of nodes) expect(n.pos).toHaveLength(3)
  })

  it('力沿出跳向柱心内收（x 单调不增）', () => {
    const nodes = forceNodes()
    for (let i = 1; i < nodes.length; i++) {
      expect(nodes[i].pos[0]).toBeLessThanOrEqual(nodes[i - 1].pos[0] + 1e-9)
    }
  })
})
