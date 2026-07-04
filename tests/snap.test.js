import { describe, it, expect } from 'vitest'
import { playSnap, primeAudio } from '../src/audio/snap.js'

describe('卡扣声', () => {
  it('在不支持 Web Audio 的环境（如 jsdom）下安全降级，不抛错', () => {
    // jsdom 没有 AudioContext，playSnap/primeAudio 应静默跳过而非崩溃
    expect(() => primeAudio()).not.toThrow()
    expect(() => playSnap()).not.toThrow()
  })
})
