import { describe, it, expect } from 'vitest'
import { createWoodMaterial } from '../src/scene/materials/woodPBR.js'

describe('木料材质', () => {
  it('返回带贴图的 MeshStandardMaterial', () => {
    const m = createWoodMaterial()
    expect(m.type).toBe('MeshStandardMaterial')
    expect(m.map).toBeTruthy()
    expect(m.roughness).toBeGreaterThan(0.5) // 木材偏粗糙
  })

  it('aged 色调比 warm 更深', () => {
    const warm = createWoodMaterial({ tone: 'warm' })
    const aged = createWoodMaterial({ tone: 'aged' })
    expect(aged.color.getHex()).not.toBe(warm.color.getHex())
  })
})
