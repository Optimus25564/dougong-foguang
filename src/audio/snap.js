// 卡扣声：现场合成的木质叩击，不依赖任何音频文件（自包含）。
// 一声"嗒"由两部分叠成——低中频正弦快速衰减（木头的"身")，
// 叠一小段带通噪声瞬态作起始的"咔"（榫卯咬合的脆响）。

let ctx = null

function audioCtx() {
  const AC = typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext)
  if (!AC) return null // 环境不支持 Web Audio（如测试用的 jsdom）→ 静默跳过
  if (!ctx) ctx = new AC()
  return ctx
}

// 在用户手势（如松手放置）中先唤醒音频上下文，之后延迟播放才不会被浏览器策略拦截。
export function primeAudio() {
  const ac = audioCtx()
  if (ac && ac.state === 'suspended') ac.resume()
}

export function playSnap() {
  const ac = audioCtx()
  if (!ac) return
  if (ac.state === 'suspended') ac.resume()
  const now = ac.currentTime

  // 木身：三角波 240→110Hz 快速下滑，音量急起急落
  const osc = ac.createOscillator()
  osc.type = 'triangle'
  osc.frequency.setValueAtTime(240, now)
  osc.frequency.exponentialRampToValueAtTime(110, now + 0.06)
  const g = ac.createGain()
  g.gain.setValueAtTime(0.0001, now)
  g.gain.exponentialRampToValueAtTime(0.5, now + 0.005)
  g.gain.exponentialRampToValueAtTime(0.0001, now + 0.13)
  osc.connect(g).connect(ac.destination)
  osc.start(now)
  osc.stop(now + 0.15)

  // 起始脆响：约 20ms 的带通噪声瞬态
  const len = Math.floor(ac.sampleRate * 0.02)
  const buf = ac.createBuffer(1, len, ac.sampleRate)
  const data = buf.getChannelData(0)
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len)
  const noise = ac.createBufferSource()
  noise.buffer = buf
  const bp = ac.createBiquadFilter()
  bp.type = 'bandpass'
  bp.frequency.value = 2000
  const ng = ac.createGain()
  ng.gain.setValueAtTime(0.28, now)
  ng.gain.exponentialRampToValueAtTime(0.0001, now + 0.03)
  noise.connect(bp).connect(ng).connect(ac.destination)
  noise.start(now)
  noise.stop(now + 0.03)
}
