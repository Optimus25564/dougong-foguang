export function createHud({ onChallenge }) {
  const el = document.createElement('div')
  el.className = 'hud'
  el.innerHTML = `
    <div class="hud-progress">进度：<span class="hud-count">0 / 0</span></div>
    <div class="hud-hint"></div>
    <button class="hud-challenge" hidden>挑战模式</button>`
  el.querySelector('.hud-challenge').addEventListener('click', onChallenge)
  return {
    el,
    setProgress: (done, total) => { el.querySelector('.hud-count').textContent = `${done} / ${total}` },
    setHint: (t) => { el.querySelector('.hud-hint').textContent = t },
    showChallenge: () => el.querySelector('.hud-challenge').removeAttribute('hidden'),
  }
}
