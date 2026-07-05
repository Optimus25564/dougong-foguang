import * as THREE from 'three'
import { lerpVec } from './cameraFocus.js'

// 每一步在拆解图中额外拉开的纵向间距（米）——基础布局已较通透，这里只再补一点分离感。
export const EXPLODE_GAP = 0.06

// 纯函数：某件在拆解图中相对其装配位的偏移。
// 按装配顺序纵向拉开，让已坐实的一朵斗栱"炸开"成上下分明的构件序列（仿海报拆解示意）。
export function explodedOffset(order, gap = EXPLODE_GAP) {
  return [0, order * gap, 0]
}

// 拆解图控制器：管理构件的"装配态 ⇄ 拆解态"缓动，
// 并在拆解态下把每件投影到屏幕、引出橙色虚线 + 术语标签。
export function createExploder({ camera, renderer }) {
  const layer = document.createElement('div')
  layer.className = 'explode-layer'
  layer.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:4;opacity:0;'
  const NS = 'http://www.w3.org/2000/svg'
  const svg = document.createElementNS(NS, 'svg')
  svg.setAttribute('style', 'position:absolute;inset:0;width:100%;height:100%;overflow:visible')
  layer.appendChild(svg)
  document.body.appendChild(layer)

  let entries = []
  let on = false
  let prog = 0 // 0 装配态 · 1 拆解态

  function clear() {
    for (const e of entries) { e.label.remove(); e.line.remove() }
    entries = []
  }

  // parts: [{ mesh, name, pinyin, assembledPos, order }]
  function setParts(parts) {
    clear()
    entries = parts.map((p, i) => {
      const label = document.createElement('div')
      label.className = 'explode-label' + (i % 2 ? ' left' : '')
      label.innerHTML = `${p.name}<span class="py">${p.pinyin}</span>`
      layer.appendChild(label)
      const line = document.createElementNS(NS, 'line')
      line.setAttribute('stroke', '#b5451c')
      line.setAttribute('stroke-width', '1.5')
      line.setAttribute('stroke-dasharray', '5 4')
      svg.appendChild(line)
      const [ox, oy, oz] = explodedOffset(p.order)
      return {
        mesh: p.mesh,
        side: i % 2 ? -1 : 1,
        assembled: p.assembledPos,
        exploded: [p.assembledPos[0] + ox, p.assembledPos[1] + oy, p.assembledPos[2] + oz],
        label, line,
      }
    })
  }

  function setExploded(v) { on = v }

  const v = new THREE.Vector3()
  function project(pos) {
    v.set(pos[0], pos[1], pos[2]).project(camera)
    const w = renderer.domElement.clientWidth || 1
    const h = renderer.domElement.clientHeight || 1
    return [(v.x * 0.5 + 0.5) * w, (-v.y * 0.5 + 0.5) * h]
  }

  function update(dt) {
    const target = on ? 1 : 0
    prog += (target - prog) * Math.min(1, dt * 6)
    if (Math.abs(target - prog) < 0.001) prog = target
    layer.style.opacity = String(prog)
    const show = prog > 0.02
    // 完全装配态（prog≈0 且未开启）时不接管位置，交还给归位补间/装配位
    const drive = on || prog > 0.001
    for (const e of entries) {
      const p = lerpVec(e.assembled, e.exploded, prog)
      if (drive) e.mesh.position.set(p[0], p[1], p[2])
      const [sx, sy] = project(p)
      const lead = 88 * e.side
      const labelX = sx + lead
      e.label.style.left = labelX + 'px'
      e.label.style.top = sy + 'px'
      e.line.setAttribute('x1', String(sx)); e.line.setAttribute('y1', String(sy))
      e.line.setAttribute('x2', String(labelX - 6 * e.side)); e.line.setAttribute('y2', String(sy))
      e.label.style.display = show ? '' : 'none'
      e.line.style.display = show ? '' : 'none'
    }
  }

  return { setParts, setExploded, update, clear, get exploded() { return on } }
}
