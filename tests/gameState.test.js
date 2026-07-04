import { describe, it, expect } from 'vitest'
import { createGame } from '../src/engine/gameState.js'
import { ASSEMBLY_STEPS } from '../src/content/assemblySteps.js'

describe('游戏状态机', () => {
  it('起始在第一步（栌斗），未完成', () => {
    const g = createGame()
    expect(g.currentStep().partId).toBe('ludou')
    expect(g.isComplete()).toBe(false)
  })
  it('放错部件不前进', () => {
    const g = createGame()
    expect(g.tryPlace('linggong').placed).toBe(false)
    expect(g.currentStep().partId).toBe('ludou')
  })
  it('按顺序放完全部即完成，图鉴全解锁', () => {
    const g = createGame()
    for (const s of ASSEMBLY_STEPS) {
      expect(g.tryPlace(s.partId).placed).toBe(true)
    }
    expect(g.isComplete()).toBe(true)
    expect(g.currentStep()).toBeNull()
    expect(g.unlockedCodex()).toHaveLength(ASSEMBLY_STEPS.length)
  })
  it('放对时最后一步返回 done:true', () => {
    const g = createGame()
    const steps = ASSEMBLY_STEPS
    steps.slice(0, -1).forEach(s => g.tryPlace(s.partId))
    expect(g.tryPlace(steps.at(-1).partId).done).toBe(true)
  })
})
