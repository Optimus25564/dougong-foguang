import { describe, it, expect, vi } from 'vitest'
import { createTray } from '../src/ui/tray.js'
import { createCodex } from '../src/ui/codex.js'
import { createHud } from '../src/ui/hud.js'

describe('零件盘', () => {
  it('showPart 显示部件名，按下（pointerdown）触发 onPick', () => {
    const onPick = vi.fn()
    const tray = createTray({ onPick })
    tray.showPart('ludou')
    expect(tray.el.textContent).toContain('栌斗')
    tray.el.querySelector('[data-part="ludou"]').dispatchEvent(new Event('pointerdown'))
    expect(onPick).toHaveBeenCalledWith('ludou', expect.anything()) // (partId, 事件)
  })
})

describe('图鉴', () => {
  it('unlock 后该页标记已解锁', () => {
    const codex = createCodex()
    codex.unlock('ludou')
    expect(codex.el.querySelector('[data-codex="ludou"]').classList.contains('unlocked')).toBe(true)
  })
})

describe('HUD', () => {
  it('setProgress / setHint 更新文本', () => {
    const hud = createHud({ onChallenge: () => {} })
    hud.setProgress(2, 6)
    hud.setHint('安栌斗')
    expect(hud.el.textContent).toContain('2 / 6')
    expect(hud.el.textContent).toContain('安栌斗')
  })
})
