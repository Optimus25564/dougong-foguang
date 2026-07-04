import { getPart } from '../content/parts.js'

let el = null

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

export function hideAnnotation() {
  if (el && el.parentNode) el.parentNode.removeChild(el)
  el = null
}
