import { describe, it, expect, vi } from 'vitest'
import { createForcePathTour } from '../src/teach/forcePathTour.js'

// three 可视件加到假 scene；只验证步进逻辑与回调。
function fakeScene() { return { add: vi.fn(), remove: vi.fn() } }

describe('受力导览步进', () => {
  it('start 归零到第一步，first=true、last=false', () => {
    const t = createForcePathTour({ scene: fakeScene() })
    const onStep = vi.fn()
    t.start(onStep)
    expect(t.index()).toBe(0)
    expect(onStep).toHaveBeenCalledWith(expect.objectContaining({ id: 'eave' }), 0, expect.objectContaining({ first: true, last: false }))
  })

  it('next 逐步推进到末步并夹紧', () => {
    const t = createForcePathTour({ scene: fakeScene() })
    t.start(vi.fn())
    const total = t.nodes.length
    for (let i = 1; i < total; i++) expect(t.next()).toBe(i)
    expect(t.index()).toBe(total - 1)
    expect(t.next()).toBe(total - 1) // 末步再 next 不越界
    expect(t.current().id).toBe('column')
  })

  it('prev 回退并在第一步夹紧', () => {
    const t = createForcePathTour({ scene: fakeScene() })
    t.start(vi.fn())
    t.next(); t.next()
    expect(t.index()).toBe(2)
    t.prev()
    expect(t.index()).toBe(1)
    t.prev(); t.prev()
    expect(t.index()).toBe(0) // 夹紧
  })

  it('last 标志在末步为 true', () => {
    const t = createForcePathTour({ scene: fakeScene() })
    const onStep = vi.fn()
    t.start(onStep)
    while (t.index() < t.nodes.length - 1) t.next()
    const lastCall = onStep.mock.calls.at(-1)
    expect(lastCall[2]).toMatchObject({ last: true })
  })

  it('stop 从 scene 移除可视件', () => {
    const scene = fakeScene()
    const t = createForcePathTour({ scene })
    t.start(vi.fn())
    t.stop()
    expect(scene.remove).toHaveBeenCalled()
  })
})
