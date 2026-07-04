import { describe, it, expect } from 'vitest'
import { FEN_TO_M, DOUKOU_FEN } from '../src/constants.js'

describe('constants', () => {
  it('分到米换算与斗口模数正确', () => {
    expect(FEN_TO_M).toBe(0.01)
    expect(DOUKOU_FEN).toBe(10)
  })
})
