import './ui/styles.css'
import { createScene } from './scene/dougongScene.js'
import { buildPartMesh } from './scene/partFactory.js'
import { placementFor } from './content/placements.js'
import { ASSEMBLY_STEPS } from './content/assemblySteps.js'
import { createGame } from './engine/gameState.js'
import { validateSnap } from './interaction/snapValidator.js'
import { createDragController } from './interaction/dragPlace.js'
import { focusOn } from './teach/cameraFocus.js'
import { applyHighlight } from './teach/highlight.js'
import { showAnnotation } from './teach/annotation.js'
import { createForceArrows } from './teach/forceAnim.js'
import { getPart } from './content/parts.js'
import { createTray } from './ui/tray.js'
import { createCodex } from './ui/codex.js'
import { createHud } from './ui/hud.js'

const app = document.getElementById('app')
const S = createScene(app)
const game = createGame()

const codex = createCodex()
const hud = createHud({ onChallenge: () => alert('挑战模式即将上线（MVP 后）') })
let dragMesh = null
const drag = createDragController(S.renderer, S.camera, { onDrop })
const tray = createTray({ onPick(partId) {
  dragMesh = buildPartMesh(partId)
  S.scene.add(dragMesh)
  drag.beginDrag(partId, dragMesh)
} })
document.body.append(hud.el, tray.el, codex.el)

let ghost = null
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
  const res = validateSnap(partId, pos)
  if (dragMesh) { S.scene.remove(dragMesh); dragMesh = null }
  const step = game.currentStep()
  if (!res.ok || !step || step.partId !== partId) {
    hud.setHint('再靠近目标虚影一点，对准了会自动卡扣。')
    return
  }
  commitPlace(partId, res.target)
}

// 造实体 + 教学（聚焦/高亮/讲解卡/图鉴解锁/受力动画）+ 推进流程
function commitPlace(partId, target) {
  game.tryPlace(partId)
  if (ghost) { S.scene.remove(ghost); ghost = null }

  const mesh = buildPartMesh(partId)
  S.addPart(mesh, target)
  const part = getPart(partId)

  // 教学：聚焦 + 高亮 + 讲解卡
  tweens.push(focusOn(S.camera, S.controls, target.pos, { duration: 0.8 }))
  applyHighlight(mesh)
  showAnnotation(partId)
  codex.unlock(partId)
  if (part.hasForceAnim) forceRigs.push(createForceArrows(S.scene, mesh))

  showCurrentStep()
}

function finish() {
  hud.setHint('大功告成！一朵七铺作双杪双下昂已重建。观察力如何从撩檐槫层层传落柱头。')
  hud.showChallenge()
  // 整朵受力总览：让所有受力箭头持续演示
}

// 驱动补间与受力动画
let last = performance.now()
;(function animate(now) {
  const dt = (now - last) / 1000; last = now
  for (let i = tweens.length - 1; i >= 0; i--) if (tweens[i](dt)) tweens.splice(i, 1)
  for (const rig of forceRigs) rig.update(dt)
  requestAnimationFrame(animate)
})(performance.now())

S.start()
showCurrentStep()
