import * as THREE from 'three'

const TONES = {
  warm: { base: 0x8a5a34, grain: 0x6b4423 },
  aged: { base: 0x5c3a22, grain: 0x3e2716 },
}

function makeGrainTexture(tone) {
  const size = 256
  const c = document.createElement('canvas')
  c.width = c.height = size
  const ctx = c.getContext('2d')
  ctx.fillStyle = '#' + tone.base.toString(16).padStart(6, '0')
  ctx.fillRect(0, 0, size, size)
  ctx.strokeStyle = '#' + tone.grain.toString(16).padStart(6, '0')
  ctx.globalAlpha = 0.25
  for (let i = 0; i < 40; i++) {
    const y = (i / 40) * size + Math.sin(i) * 3
    ctx.beginPath()
    ctx.moveTo(0, y)
    for (let x = 0; x <= size; x += 16) {
      ctx.lineTo(x, y + Math.sin(x * 0.05 + i) * 2)
    }
    ctx.lineWidth = 1 + (i % 3)
    ctx.stroke()
  }
  const tex = new THREE.CanvasTexture(c)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  return tex
}

export function createWoodMaterial({ tone = 'warm' } = {}) {
  const t = TONES[tone] ?? TONES.warm
  return new THREE.MeshStandardMaterial({
    color: t.base,
    map: makeGrainTexture(t),
    roughness: 0.75,
    metalness: 0.0,
  })
}
