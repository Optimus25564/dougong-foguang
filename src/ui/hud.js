export function createHud({ onChallenge, onCodex, onExplode }) {
  const el = document.createElement('div')
  el.className = 'hud'
  el.innerHTML = `
    <div class="hud-title">佛光寺东大殿</div>
    <div class="hud-sub">外檐柱头铺作·重建</div>
    <div class="hud-progress">进度：<span class="hud-count">0 / 0</span></div>
    <div class="hud-hint"></div>
    <button class="hud-codex">图鉴</button>
    <button class="hud-explode" aria-pressed="false" hidden>拆解图</button>
    <button class="hud-challenge" hidden>挑战模式</button>`
  el.querySelector('.hud-codex').addEventListener('click', onCodex)
  el.querySelector('.hud-challenge').addEventListener('click', onChallenge)
  const explodeBtn = el.querySelector('.hud-explode')
  explodeBtn.addEventListener('click', () => {
    const on = explodeBtn.getAttribute('aria-pressed') !== 'true'
    explodeBtn.setAttribute('aria-pressed', String(on))
    onExplode?.(on)
  })
  return {
    el,
    setProgress: (done, total) => { el.querySelector('.hud-count').textContent = `${done} / ${total}` },
    setHint: (t) => { el.querySelector('.hud-hint').textContent = t },
    showChallenge: () => el.querySelector('.hud-challenge').removeAttribute('hidden'),
    showExplode: () => explodeBtn.removeAttribute('hidden'),
    isExploded: () => explodeBtn.getAttribute('aria-pressed') === 'true',
  }
}
