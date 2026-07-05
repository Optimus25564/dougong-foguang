import * as THREE from 'three'
import { placementFor } from '../content/placements.js'

// 一开间建筑语境：把主角斗栱放回它所属的木构框架里，示意化、哑光、
// 明显区别于主角木色。用以回答"斗栱如何坐柱、如何入墙、如何托檐"。
//
// 坐标：栌斗底 ≈ y=-0.18（柱顶），柱脚落地 y=-0.55；开间沿 -Z 展开（进深方向、
// 退向画面深处，不遮挡正侧断面里的出跳）。撩檐槫由 placementFor 运行时锚定。

const COL_TOP = -0.18
const GROUND = -0.55
const BAY = 1.1          // 开间（米，示意压缩）——邻柱在 z=-BAY
const COL_R = 0.085

export function contextDimensions() {
  return {
    colTopY: COL_TOP,
    groundY: GROUND,
    colHeight: COL_TOP - GROUND,
    colRadius: COL_R,
    bay: BAY,
  }
}

const MAT = {
  timber: () => new THREE.MeshStandardMaterial({ color: 0xbfa06a, roughness: 0.85, transparent: true }), // 框架木色（较主角浅、去饱和）
  stone: () => new THREE.MeshStandardMaterial({ color: 0x8f8577, roughness: 0.95, transparent: true }),   // 础石/地面
  wall: () => new THREE.MeshStandardMaterial({ color: 0xeae1cd, roughness: 1, transparent: true }),        // 墙（灰白抹灰，半透示意填充）
  tile: () => new THREE.MeshStandardMaterial({ color: 0x5b5148, roughness: 0.9, transparent: true }),      // 屋面
}

// 记录每件的目标不透明度，供 setOpacity 统一淡入（墙本就半透）
function tag(mesh, name, maxOpacity) {
  mesh.name = name
  mesh.userData.maxOpacity = maxOpacity
  mesh.material.opacity = maxOpacity
  mesh.castShadow = mesh.receiveShadow = true
  return mesh
}

export function createBuildingContext() {
  const group = new THREE.Group()
  const d = contextDimensions()

  // 两根柱：本柱 z=0、邻柱 z=-BAY，柱顶接栌斗底、柱脚落地
  const colGeo = new THREE.CylinderGeometry(d.colRadius, d.colRadius * 1.06, d.colHeight, 20)
  const colY = (COL_TOP + GROUND) / 2
  const colMain = new THREE.Mesh(colGeo, MAT.timber()); colMain.position.set(0, colY, 0)
  const colNbr = new THREE.Mesh(colGeo.clone(), MAT.timber()); colNbr.position.set(0, colY, -BAY)
  group.add(tag(colMain, 'column-main', 1), tag(colNbr, 'column-neighbor', 0.92))

  // 础石：柱脚下的方石
  const baseGeo = new THREE.BoxGeometry(0.24, 0.05, 0.24)
  for (const z of [0, -BAY]) {
    const b = new THREE.Mesh(baseGeo.clone(), MAT.stone())
    b.position.set(0, GROUND + 0.025, z)
    group.add(tag(b, 'base-stone', 0.95))
  }

  // 阑额：沿 Z 跨两柱头相连，顶接柱顶（佛光寺东大殿无普拍枋，栌斗直坐柱头）
  const laneH = 0.16, laneT = 0.09
  const lane = new THREE.Mesh(new THREE.BoxGeometry(laneT, laneH, BAY), MAT.timber())
  lane.position.set(0, COL_TOP - laneH / 2, -BAY / 2)
  group.add(tag(lane, 'lane', 1))

  // 墙：填在两柱之间的 facade 面，自地面到阑额底，半透明示意"只是填充、不承重"
  const wallTop = COL_TOP - laneH
  const wallH = wallTop - GROUND
  const wall = new THREE.Mesh(new THREE.BoxGeometry(0.05, wallH, BAY - 2 * d.colRadius), MAT.wall())
  wall.position.set(-0.03, GROUND + wallH / 2, -BAY / 2)
  group.add(tag(wall, 'wall', 0.72))

  // 屋面坡：搭在撩檐槫上，向内（-X）上扬的一段坡板
  const eave = placementFor('liaoyantuan').pos // [x,y,z]
  const roofRun = 1.05, roofRise = 0.42
  const roofLen = Math.hypot(roofRun, roofRise)
  const roof = new THREE.Mesh(new THREE.BoxGeometry(roofLen, 0.03, BAY + 0.3), MAT.tile())
  // 下外端落在撩檐槫顶，板体向 -X 上扬
  roof.position.set(eave[0] - roofRun / 2, eave[1] + 0.05 + roofRise / 2, -BAY / 2)
  roof.rotation.z = Math.atan2(roofRise, roofRun)
  group.add(tag(roof, 'roof', 0.9))

  // 地面：一大片浅石底，接住投影
  const ground = new THREE.Mesh(new THREE.BoxGeometry(4, 0.04, 4), MAT.stone())
  ground.position.set(0.4, GROUND - 0.02, -BAY / 2)
  group.add(tag(ground, 'ground', 0.55))

  function setOpacity(v) {
    for (const c of group.children) {
      if (c.material) c.material.opacity = v * (c.userData.maxOpacity ?? 1)
    }
  }
  setOpacity(0)

  return { group, setOpacity }
}
