import { describe, it, expect } from 'vitest'
import { lerpVec } from '../src/teach/cameraFocus.js'
import { showAnnotation, hideAnnotation } from '../src/teach/annotation.js'

describe('相机插值', () => {
  it('t=0 返回起点，t=1 返回终点，t=0.5 取中点', () => {
    expect(lerpVec([0, 0, 0], [2, 4, 6], 0)).toEqual([0, 0, 0])
    expect(lerpVec([0, 0, 0], [2, 4, 6], 1)).toEqual([2, 4, 6])
    expect(lerpVec([0, 0, 0], [2, 4, 6], 0.5)).toEqual([1, 2, 3])
  })
})

describe('讲解卡', () => {
  it('渲染部件名、术语与冷知识', () => {
    const el = showAnnotation('ludou')
    expect(el.textContent).toContain('栌斗')
    expect(el.textContent).toContain('lúdǒu')
    expect(el.textContent).toContain('唐构') // trivia 关键词
    hideAnnotation()
  })
})
