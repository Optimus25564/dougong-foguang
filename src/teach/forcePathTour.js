import * as THREE from 'three'
import { forceNodes } from '../content/forcePath.js'

const CHAIN_COLOR = 0xff8c42   // 传力链暖橙
const PULSE_COLOR = 0xffe08a   // 流动脉冲亮黄
const ARROW_COLOR = 0xd24317   // 当前站下压箭头锈红

// 受力导览：一条发光传力链贯穿铺作，脉冲自上而下持续流动，
// 当前站以下压箭头强调；next/prev 步进，onStep 回调驱动讲解卡。
export function createForcePathTour({ scene }) {
  const nodes = forceNodes()
  const pts = nodes.map(n => new THREE.Vector3(...n.pos))

  // 传力链折线（始终画在最前，避免被构件遮住）
  const chainGeo = new THREE.BufferGeometry().setFromPoints(pts)
  const chain = new THREE.Line(chainGeo, new THREE.LineBasicMaterial({
    color: CHAIN_COLOR, transparent: true, opacity: 0.9, depthTest: false,
  }))
  chain.renderOrder = 998

  // 流动脉冲球
  const pulse = new THREE.Mesh(
    new THREE.SphereGeometry(0.028, 16, 16),
    new THREE.MeshBasicMaterial({ color: PULSE_COLOR, transparent: true, depthTest: false }),
  )
  pulse.renderOrder = 1000

  // 当前站下压箭头
  const arrow = new THREE.ArrowHelper(new THREE.Vector3(0, -1, 0), pts[0], 0.16, ARROW_COLOR, 0.07, 0.05)
  arrow.renderOrder = 1000
  for (const l of arrow.children) if (l.material) l.material.depthTest = false

  // 折线累计弧长，供脉冲按总长匀速流动
  const segLen = []
  let totalLen = 0
  for (let i = 1; i < pts.length; i++) { const d = pts[i].distanceTo(pts[i - 1]); segLen.push(d); totalLen += d }

  function pointAt(u) { // u∈[0,1] 沿链插值
    let d = u * totalLen
    for (let i = 0; i < segLen.length; i++) {
      if (d <= segLen[i] || i === segLen.length - 1) {
        const f = segLen[i] ? d / segLen[i] : 0
        return new THREE.Vector3().lerpVectors(pts[i], pts[i + 1], Math.min(1, f))
      }
      d -= segLen[i]
    }
    return pts.at(-1).clone()
  }

  let i = 0
  let onStep = null
  let u = 0        // 脉冲进度
  let active = false

  function emit() {
    arrow.position.copy(pts[i])
    onStep?.(nodes[i], i, { first: i === 0, last: i === nodes.length - 1 })
  }

  function start(cb) {
    onStep = cb
    i = 0; u = 0; active = true
    scene.add(chain, pulse, arrow)
    emit()
    return i
  }
  function stop() {
    active = false
    scene.remove(chain, pulse, arrow)
  }
  function next() { if (i < nodes.length - 1) { i += 1; emit() } return i }
  function prev() { if (i > 0) { i -= 1; emit() } return i }

  function update(dt) {
    if (!active) return
    u = (u + dt * 0.22) % 1        // 缓慢自上而下流动
    pulse.position.copy(pointAt(u))
    const s = 1 + 0.35 * Math.sin(performance.now() * 0.006) // 箭头脉动
    arrow.scale.setScalar(s)
  }

  return {
    nodes,
    start, stop, next, prev, update,
    index: () => i,
    current: () => nodes[i],
  }
}
