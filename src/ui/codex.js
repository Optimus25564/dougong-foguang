import { PARTS } from '../content/parts.js'

export function createCodex() {
  const el = document.createElement('div')
  el.className = 'codex hidden'
  el.innerHTML = `<h2>斗栱图鉴</h2><div class="codex-grid">${
    PARTS.map(p => `<div class="codex-page locked" data-codex="${p.id}">
      <div class="codex-title">${p.name}</div></div>`).join('')
  }</div>`
  function unlock(partId) {
    const page = el.querySelector(`[data-codex="${partId}"]`)
    if (page) { page.classList.remove('locked'); page.classList.add('unlocked') }
  }
  return {
    el, unlock,
    open: () => el.classList.remove('hidden'),
    close: () => el.classList.add('hidden'),
  }
}
