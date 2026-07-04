import { getPart } from '../content/parts.js'

export function createTray({ onPick }) {
  const el = document.createElement('div')
  el.className = 'tray'
  function showPart(partId) {
    const p = getPart(partId)
    el.innerHTML = `<div class="tray-item" data-part="${partId}" draggable="true">
      <span class="tray-name">${p.name}</span><span class="tray-pinyin">${p.pinyin}</span>
    </div>`
    const item = el.querySelector(`[data-part="${partId}"]`)
    item.addEventListener('click', () => onPick(partId))
    item.addEventListener('dragend', () => onPick(partId))
  }
  return { el, showPart, clear: () => { el.innerHTML = '' } }
}
