import './ui/styles.css'
import { createScene } from './scene/dougongScene.js'
import { buildPartMesh } from './scene/partFactory.js'
import { placementFor } from './content/placements.js'
import { ASSEMBLY_STEPS } from './content/assemblySteps.js'
import { createGame } from './engine/gameState.js'
import { validateSnap } from './interaction/snapValidator.js'
import { createDragController } from './interaction/dragPlace.js'
import { focusOn, frameOn, frameTo } from './teach/cameraFocus.js'
import { settleTween, dismissTween, SETTLE_MS, DISMISS_MS } from './teach/motion.js'
import { playSnap, primeAudio } from './audio/snap.js'
import { applyHighlight, clearHighlight } from './teach/highlight.js'
import { showAnnotation } from './teach/annotation.js'
import { createForceArrows } from './teach/forceAnim.js'
import { createExploder } from './teach/explode.js'
import { createBuildingContext } from './scene/buildingContext.js'
import { createForcePathTour } from './teach/forcePathTour.js'
import { getPart } from './content/parts.js'
import { createTray } from './ui/tray.js'
import { createCodex } from './ui/codex.js'
import { createHud } from './ui/hud.js'

const app = document.getElementById('app')

// WebGL 是本游戏的硬性前提；若创建失败（如浏览器禁用了硬件加速），
// 明确提示而不是让整页脚本在此静默崩溃、连零件盘都挂不出来。
let S
try {
  S = createScene(app)
} catch (err) {
  app.innerHTML = `<div style="position:fixed;inset:0;display:flex;align-items:center;
    justify-content:center;text-align:center;padding:32px;color:#e8c98a;line-height:1.8">
    <div>无法创建 3D 画面（WebGL 初始化失败）。<br>
    请在浏览器设置中开启「硬件加速 / WebGL」后刷新，或换用支持 WebGL 的浏览器。<br>
    <span style="opacity:.6;font-size:.85em">${err.message}</span></div></div>`
  throw err
}

const game = createGame()

const codex = createCodex()
const exploder = createExploder({ camera: S.camera, renderer: S.renderer })
const placedMeshes = new Map() // partId -> mesh，供拆解图整体调度
const hud = createHud({
  onChallenge: () => alert('挑战模式即将上线（MVP 后）'),
  onCodex: () => codex.open(),
  onExplode: toggleExplode,
  onForce: toggleForce,
})
const tour = createForcePathTour({ scene: S.scene }) // 传力链导览（受力·语境模式）
let context = null       // 一开间建筑框架，首次进入受力模式时懒构建
let forceOn = false
let tourCard = null
let dragMesh = null
const drag = createDragController(S.renderer, S.camera, { onDrop })
const tray = createTray({ onPick(partId) {
  if (dragMesh || exploder.exploded) return
  dragMesh = buildPartMesh(partId)
  const tp = placementFor(partId)
  if (tp) { // 部件出场即按目标角度摆好，与卯口一致，无需手动调角
    dragMesh.rotation.y = tp.rotY || 0
    dragMesh.rotation.z = tp.rotZ || 0
  }
  S.scene.add(dragMesh)
  drag.beginDrag(partId, dragMesh, tp ? tp.pos[2] : 0) // 在目标所在深度平面拖动，离面件也能对上
} })
document.body.append(hud.el, tray.el, codex.el)

let ghost = null
let lastHighlighted = null
let camFramedOnce = false
const OVERVIEW_DIST = 3.6 // 大件的总览取景距离（米）
const tweens = []
const forceRigs = []

function showCurrentStep() {
  const step = game.currentStep()
  hud.setProgress(game.placedIds().length, ASSEMBLY_STEPS.length)
  if (!step) return finish()
  hud.setHint(step.hint)
  tray.showPart(step.partId)
  if (ghost) S.scene.remove(ghost)
  const tp = placementFor(step.partId)
  ghost = S.addGhost(buildPartMesh(step.partId), tp)
  S.markerTo(tp.pos) // 置顶下指箭头指到落点，避免小件/被遮挡时找不到虚影
  // 镜头：只对小件（散斗/交互斗）拉近细看；大件用总览距离（拉近看过小件后再退回来）。
  // 首件（栌斗）不动镜头，保留初始总览——满足"一开始不需要拉近"。
  const dist = step.partId.startsWith('sandou') ? 0.72
    : step.partId.startsWith('jiaohudou') ? 1.05
    : OVERVIEW_DIST
  if (camFramedOnce || dist < OVERVIEW_DIST) {
    tweens.push(frameOn(S.camera, S.controls, tp.pos, { distance: dist }))
  } else {
    tweens.push(focusOn(S.camera, S.controls, tp.pos, { duration: 0.8 })) // 首个大件只回中不挪镜头
  }
  camFramedOnce = true
}

// 拖拽落点校验：松手时按吸附结果决定卡扣或回弹
function onDrop(partId, pos) {
  if (exploder.exploded) { dismiss(); return } // 拆解态不接受装配
  if (!pos) {
    dismiss()
    hud.setHint('再靠近目标虚影一点，对准了会自动卡扣。')
    return
  }
  const res = validateSnap(partId, pos)
  const step = game.currentStep()
  if (!res.ok || !step || step.partId !== partId) {
    dismiss()
    hud.setHint('再靠近目标虚影一点，对准了会自动卡扣。')
    return
  }
  const spent = dragMesh
  dragMesh = null
  if (spent) S.scene.remove(spent) // 关键：移除被拖动的那件（带对齐绿），否则它作为绿色残影留在场景里
  primeAudio() // 在松手这个用户手势里唤醒音频，稍后卡扣声才能顺利播放
  commitPlace(partId, res.target, pos)
}

// 吸附失败：不再瞬间消失，缩小淡出后再移出场景，给手感留一点缓冲
function dismiss() {
  if (!dragMesh) return
  const m = dragMesh
  dragMesh = null
  tweens.push(dismissTween(m, DISMISS_MS, () => S.scene.remove(m)))
}

// 造实体 + 教学（聚焦/高亮/讲解卡/图鉴解锁/受力动画）+ 推进流程
function commitPlace(partId, target, dropPos) {
  game.tryPlace(partId)
  if (ghost) { S.scene.remove(ghost); ghost = null }

  const mesh = buildPartMesh(partId)
  S.addPart(mesh, target) // 旋转瞬时到位；位置随后由 settleTween 接管，从落点缓缓滑入
  const startPos = dropPos || target.pos
  mesh.position.set(...startPos)
  tweens.push(settleTween(mesh, startPos, target.pos, SETTLE_MS, playSnap)) // 坐实一刻响卡扣声
  const part = getPart(partId)

  // 教学：高亮 + 讲解卡（镜头交由下一步 showCurrentStep 的 frameOn 统一调度，避免两个补间抢 target）
  if (lastHighlighted) clearHighlight(lastHighlighted)
  applyHighlight(mesh)
  lastHighlighted = mesh
  showAnnotation(partId)
  codex.unlock(partId)
  if (part.hasForceAnim) forceRigs.push(createForceArrows(S.scene, mesh))

  placedMeshes.set(partId, mesh)
  refreshExploder()
  hud.showExplode() // 放下第一件即可切到拆解图查看

  showCurrentStep()
}

function finish() {
  S.hideMarker()
  hud.setHint('大功告成！一朵七铺作双杪双下昂已重建。点「受力·语境」看它如何撑住屋檐、如何入墙，或「拆解图」逐件炸开。')
  hud.showChallenge()
  hud.showExplode()
  hud.showForce()
  codex.open()
}

// 用当前已放好的构件（按装配顺序）刷新拆解图数据
function refreshExploder() {
  const parts = [...placedMeshes.entries()].map(([partId, mesh]) => {
    const p = getPart(partId)
    return {
      mesh, name: p.name, pinyin: p.pinyin,
      assembledPos: placementFor(partId).pos,
      order: ASSEMBLY_STEPS.findIndex(s => s.partId === partId),
    }
  })
  exploder.setParts(parts)
}

// 切换拆解图：炸开时收起零件盘/虚影，避免与装配流程打架
function toggleExplode(on) {
  if (on && forceOn) { forceOn = false; exitForce() } // 与受力·语境互斥
  exploder.setExploded(on)
  if (on && ghost) { S.scene.remove(ghost); ghost = null }
  if (on) S.hideMarker()
  tray.el.style.display = on ? 'none' : ''
  if (!on) showCurrentStep()
}

// 简单数值淡入淡出补间，驱动 context 透明度
function fadeTween(setter, from, to, dur, onDone) {
  let t = 0
  return dt => {
    t = Math.min(1, t + dt / dur)
    setter(from + (to - from) * t)
    if (t >= 1) { onDone && onDone(); return true }
    return false
  }
}

// 切换「受力·语境」：把整朵放回一开间框架，启动分步传力导览
function toggleForce(on) {
  forceOn = on
  if (on) {
    if (exploder.exploded) { exploder.setExploded(false); tray.el.style.display = 'none' } // 互斥
    enterForce()
  } else {
    exitForce()
  }
}

function enterForce() {
  if (ghost) { S.scene.remove(ghost); ghost = null }
  S.hideMarker()
  tray.el.style.display = 'none'
  S.setStubVisible(false)                                  // 短柱换成完整柱
  for (const rig of forceRigs) rig.group.visible = false  // 收起逐件杠杆箭头，避免与传力链打架
  if (!context) context = createBuildingContext()
  S.scene.add(context.group)
  tweens.push(fadeTween(context.setOpacity, 0, 1, 0.6))
  // 断面 3/4 视角：既看清出跳（+X），又看清开间与墙（沿 -Z 退向深处）
  tweens.push(frameTo(S.camera, S.controls, [2.7, 0.95, 3.1], [0.30, 0.36, -0.45], { duration: 1.1 }))
  tour.start(renderTourCard)
}

function exitForce() {
  tour.stop()
  hideTourCard()
  for (const rig of forceRigs) rig.group.visible = true
  if (context) {
    const ctx = context
    tweens.push(fadeTween(ctx.setOpacity, 1, 0, 0.4, () => S.scene.remove(ctx.group)))
  }
  S.setStubVisible(true)
  tweens.push(frameOn(S.camera, S.controls, placementFor('huagong-2').pos, { distance: OVERVIEW_DIST })) // 回总览
}

// 底部居中导览卡：步号 + 名目 + 讲解 + 上/下一步 + 退出
function renderTourCard(node, i, flags) {
  if (!tourCard) {
    tourCard = document.createElement('div')
    tourCard.className = 'tour-card'
    document.body.appendChild(tourCard)
  }
  const total = tour.nodes.length
  tourCard.innerHTML = `
    <div class="tour-step">受力传递 · 第 ${i + 1} / ${total} 步</div>
    <h3>${node.label}</h3>
    <p>${node.caption}</p>
    <div class="tour-nav">
      <button class="tour-prev"${flags.first ? ' disabled' : ''}>← 上一步</button>
      <button class="tour-close">退出</button>
      <button class="tour-next"${flags.last ? ' disabled' : ''}>下一步 →</button>
    </div>`
  tourCard.querySelector('.tour-prev').onclick = () => tour.prev()
  tourCard.querySelector('.tour-next').onclick = () => tour.next()
  tourCard.querySelector('.tour-close').onclick = () => { hud.setForcePressed(false); toggleForce(false) }
}
function hideTourCard() { if (tourCard) { tourCard.remove(); tourCard = null } }

// 虚影"呼吸"以便定位；正在拖动的部件对准卯口时染绿自发光，"对齐了"一目了然
function updateGhostCue(now) {
  if (ghost) {
    const t = (now % 1500) / 1500
    ghost.material.opacity = 0.26 + 0.16 * (0.5 - 0.5 * Math.cos(t * Math.PI * 2)) // 锈橙虚影明显呼吸
  }
  const step = game.currentStep()
  if (dragMesh && dragMesh.material.emissive) {
    const aligned = step && validateSnap(step.partId, dragMesh.position.toArray()).ok
    dragMesh.material.emissive.setHex(aligned ? 0x2e7d32 : 0x000000)
  }
}

// 驱动补间与受力动画
let last = performance.now()
;(function animate(now) {
  const dt = (now - last) / 1000; last = now
  updateGhostCue(now)
  for (let i = tweens.length - 1; i >= 0; i--) if (tweens[i](dt)) tweens.splice(i, 1)
  for (const rig of forceRigs) rig.update(dt)
  exploder.update(dt)
  tour.update(dt)
  requestAnimationFrame(animate)
})(performance.now())

S.start()

// 调试：?demo 一次性放完所有构件并定住总览相机，便于无头截图自检
if (new URLSearchParams(location.search).has('demo')) {
  let s
  while ((s = game.currentStep())) {
    const mesh = buildPartMesh(s.partId)
    S.addPart(mesh, placementFor(s.partId))
    placedMeshes.set(s.partId, mesh)
    game.tryPlace(s.partId)
  }
  if (ghost) { S.scene.remove(ghost); ghost = null }
  S.hideMarker()
  tray.el.style.display = 'none'
  // 截图自检：?demo&view=side 取正侧立面（斗栱断面视角），最便于看层叠坐实
  const view = new URLSearchParams(location.search).get('view')
  if (view === 'side') {
    S.camera.position.set(0.6, 0.6, 6.2)
    S.controls.target.set(0.6, 0.6, 0)
    S.controls.update()
  } else if (view === 'top') {
    S.camera.position.set(1.15, 0.95, 1.9)
    S.controls.target.set(0.78, 0.72, 0.02)
    S.controls.update()
  } else if (view === 'mid') {
    S.camera.position.set(1.5, 0.7, 2.0)   // 近观华栱二跳头的计心层（瓜子栱/慢栱/罗汉枋）
    S.controls.target.set(0.42, 0.4, 0.02)
    S.controls.update()
  } else if (view === 'force') {
    hud.showForce(); hud.setForcePressed(true); toggleForce(true) // 受力·语境自检
  } else if (view === 'codex') {
    for (const s of ASSEMBLY_STEPS) codex.unlock(s.partId) // 全解锁，缩略图上色
    codex.open()
  }
} else {
  showCurrentStep()
}
