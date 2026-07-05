import { PARTS } from '../content/parts.js'
import { renderPartThumbnails } from './codexThumbs.js'

export function createCodex() {
  // 开局离屏渲染每件的缩略图；无 WebGL（如 jsdom 测试）时退回纯文字图鉴。
  let thumbs = {}
  try { thumbs = renderPartThumbnails() } catch { thumbs = {} }

  const el = document.createElement('div')
  el.className = 'codex hidden'
  el.innerHTML = `<button class="codex-close">关闭</button><h2>斗栱图鉴</h2><div class="codex-grid">${
    PARTS.map(p => `<div class="codex-page locked" data-codex="${p.id}">
      ${thumbs[p.id] ? `<img class="codex-thumb" src="${thumbs[p.id]}" alt="${p.name}">` : '<div class="codex-thumb codex-thumb-empty"></div>'}
      <div class="codex-title">${p.name} <span class="codex-py">${p.pinyin}</span></div>
      <div class="codex-term">${p.term}</div></div>`).join('')
  }</div>`
  function unlock(partId) {
    const page = el.querySelector(`[data-codex="${partId}"]`)
    if (page) { page.classList.remove('locked'); page.classList.add('unlocked') }
  }
  const close = () => el.classList.add('hidden')
  el.querySelector('.codex-close').addEventListener('click', close)
  return {
    el, unlock,
    open: () => el.classList.remove('hidden'),
    close,
  }
}
