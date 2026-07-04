import './ui/styles.css'
import { createScene } from './scene/dougongScene.js'
import { buildPartMesh } from './scene/partFactory.js'
import { placementFor } from './content/placements.js'
import { ASSEMBLY_STEPS } from './content/assemblySteps.js'
import { createGame } from './engine/gameState.js'
import { validateSnap } from './interaction/snapValidator.js'
import { createDragController } from './interaction/dragPlace.js'
import { focusOn } from './teach/cameraFocus.js'
import { settleTween, dismissTween, SETTLE_MS, DISMISS_MS } from './teach/motion.js'
import { applyHighlight, clearHighlight } from './teach/highlight.js'
import { showAnnotation } from './teach/annotation.js'
import { createForceArrows } from './teach/forceAnim.js'
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
const hud = createHud({ onChallenge: () => alert('挑战模式即将上线（MVP 后）'), onCodex: () => codex.open() })
let dragMesh = null
const drag = createDragController(S.renderer, S.camera, { onDrop })
const tray = createTray({ onPick(partId) {
  if (dragMesh) return
  dragMesh = buildPartMesh(partId)
  S.scene.add(dragMesh)
  drag.beginDrag(partId, dragMesh)
} })
document.body.append(hud.el, tray.el, codex.el)

let ghost = null
let lastHighlighted = null
const tweens = []
const forceRigs = []

function showCurrentStep() {
  const step = game.currentStep()
  hud.setProgress(game.placedIds().length, ASSEMBLY_STEPS.length)
  if (!step) return finish()
  hud.setHint(step.hint)
  tray.showPart(step.partId)
  if (ghost) S.scene.remove(ghost)
  ghost = S.addGhost(buildPartMesh(step.partId), placementFor(step.partId))
}

// 拖拽落点校验：松手时按吸附结果决定卡扣或回弹
function onDrop(partId, pos) {
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
  dragMesh = null
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
  tweens.push(settleTween(mesh, startPos, target.pos, SETTLE_MS))
  const part = getPart(partId)

  // 教学：聚焦 + 高亮 + 讲解卡
  tweens.push(focusOn(S.camera, S.controls, target.pos, { duration: 0.8 }))
  if (lastHighlighted) clearHighlight(lastHighlighted)
  applyHighlight(mesh)
  lastHighlighted = mesh
  showAnnotation(partId)
  codex.unlock(partId)
  if (part.hasForceAnim) forceRigs.push(createForceArrows(S.scene, mesh))

  showCurrentStep()
}

function finish() {
  hud.setHint('大功告成！一朵七铺作双杪双下昂已重建。观察力如何从撩檐槫层层传落柱头。')
  hud.showChallenge()
  codex.open()
  // 整朵受力总览：让所有受力箭头持续演示
}

// 驱动补间与受力动画
let last = performance.now()
;(function animate(now) {
  const dt = (now - last) / 1000; last = now
  drag.follow(dt) // 拖拽悬停：阻尼跟随鼠标瞄准点，而非瞬移
  for (let i = tweens.length - 1; i >= 0; i--) if (tweens[i](dt)) tweens.splice(i, 1)
  for (const rig of forceRigs) rig.update(dt)
  requestAnimationFrame(animate)
})(performance.now())

S.start()
showCurrentStep()
