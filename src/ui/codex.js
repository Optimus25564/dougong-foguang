import { PARTS } from '../content/parts.js'

export function createCodex() {
  const el = document.createElement('div')
  el.className = 'codex hidden'
  el.innerHTML = `<button class="codex-close">关闭</button><h2>斗栱图鉴</h2><div class="codex-grid">${
    PARTS.map(p => `<div class="codex-page locked" data-codex="${p.id}">
      <div class="codex-title">${p.name}</div></div>`).join('')
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
