import './ui/styles.css'
import { createScene } from './scene/dougongScene.js'
import { buildPartMesh } from './scene/partFactory.js'
import { placementFor } from './content/placements.js'
import { ASSEMBLY_STEPS } from './content/assemblySteps.js'
import { createGame } from './engine/gameState.js'
import { validateSnap } from './interaction/snapValidator.js'
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
const tray = createTray({ onPick: place })
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

// 简化交互：拾件即视为放到目标位（MVP 用吸附校验保证正确性；拖拽落点接入见下）
function place(partId) {
  const target = placementFor(partId)
  const res = validateSnap(partId, target.pos) // 直接落目标点，必然吸附
  const step = game.currentStep()
  if (!res.ok || !step || step.partId !== partId) return
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
