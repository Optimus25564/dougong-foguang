import { getPart } from '../content/parts.js'

export function createTray({ onPick }) {
  const el = document.createElement('div')
  el.className = 'tray'
  function showPart(partId) {
    const p = getPart(partId)
    el.innerHTML = `<div class="tray-item" data-part="${partId}">
      <span class="tray-name">${p.name}</span><span class="tray-pinyin">${p.pinyin}</span>
    </div>`
    const item = el.querySelector(`[data-part="${partId}"]`)
    // 按下即抓起（鼠标/触屏统一）；preventDefault 防触屏长按选中/上下文菜单
    item.addEventListener('pointerdown', (e) => { e.preventDefault(); onPick(partId, e) })
  }
  return { el, showPart, clear: () => { el.innerHTML = '' } }
}
