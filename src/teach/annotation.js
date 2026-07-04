import { getPart } from '../content/parts.js'

let el = null

// 先移除旧卡，再据部件数据生成讲解卡并挂到 body
export function showAnnotation(partId) {
  const p = getPart(partId)
  hideAnnotation()
  el = document.createElement('div')
  el.className = 'annotation-card'
  el.innerHTML = `
    <h2>${p.name} <span class="pinyin">${p.pinyin}</span></h2>
    <div class="term">营造法式术语：${p.term}</div>
    <p class="role"><b>作用：</b>${p.role}</p>
    <p class="desc">${p.desc}</p>
    <p class="trivia">💡 ${p.trivia}</p>
  `
  document.body.appendChild(el)
  return el
}

// 移除当前讲解卡
export function hideAnnotation() {
  if (el && el.parentNode) el.parentNode.removeChild(el)
  el = null
}
