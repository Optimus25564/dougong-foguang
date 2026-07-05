export function createHud({ onChallenge, onCodex, onExplode, onForce }) {
  const el = document.createElement('div')
  el.className = 'hud'
  el.innerHTML = `
    <div class="hud-title">佛光寺东大殿</div>
    <div class="hud-sub">外檐柱头铺作·重建</div>
    <div class="hud-progress">进度：<span class="hud-count">0 / 0</span></div>
    <div class="hud-hint"></div>
    <button class="hud-codex">图鉴</button>
    <button class="hud-explode" aria-pressed="false" hidden>拆解图</button>
    <button class="hud-force" aria-pressed="false" hidden>受力·语境</button>
    <button class="hud-challenge" hidden>挑战模式</button>`
  el.querySelector('.hud-codex').addEventListener('click', onCodex)
  el.querySelector('.hud-challenge').addEventListener('click', onChallenge)

  const explodeBtn = el.querySelector('.hud-explode')
  const forceBtn = el.querySelector('.hud-force')
  const pressed = btn => btn.getAttribute('aria-pressed') === 'true'
  const setPressed = (btn, v) => btn.setAttribute('aria-pressed', String(v))

  explodeBtn.addEventListener('click', () => {
    const on = !pressed(explodeBtn)
    setPressed(explodeBtn, on)
    if (on) setPressed(forceBtn, false) // 两态互斥
    onExplode?.(on)
  })
  forceBtn.addEventListener('click', () => {
    const on = !pressed(forceBtn)
    setPressed(forceBtn, on)
    if (on) setPressed(explodeBtn, false) // 两态互斥
    onForce?.(on)
  })

  return {
    el,
    setProgress: (done, total) => { el.querySelector('.hud-count').textContent = `${done} / ${total}` },
    setHint: (t) => { el.querySelector('.hud-hint').textContent = t },
    showChallenge: () => el.querySelector('.hud-challenge').removeAttribute('hidden'),
    showExplode: () => explodeBtn.removeAttribute('hidden'),
    showForce: () => forceBtn.removeAttribute('hidden'),
    isExploded: () => pressed(explodeBtn),
    isForced: () => pressed(forceBtn),
    setExplodePressed: (v) => setPressed(explodeBtn, v),
    setForcePressed: (v) => setPressed(forceBtn, v),
  }
}
