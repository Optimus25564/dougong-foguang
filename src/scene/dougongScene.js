import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

export function createScene(container) {
  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0xe7dcc4) // 做旧纸底，与海报统一

  // 装配发生在 z=0 这一个平面内，故默认用近正视（略带俯角）取景：
  // 屏幕坐标几乎直接对应装配位，拖拽落点直观、深度不再暧昧。可自由环绕欣赏。
  const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100)
  camera.position.set(0.95, 0.9, 4.4) // 取景对准规则化紧凑后约 1.5m 见方的一朵

  const renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(container.clientWidth, container.clientHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap // 柔化投影，贴近海报的轻阴影
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.05
  container.appendChild(renderer.domElement)

  const controls = new OrbitControls(camera, renderer.domElement)
  controls.target.set(0.42, 0.53, 0) // 对准整朵斗栱的大致中心（自栌斗向右上层叠展开）
  controls.enableDamping = true

  // 光照：暖主光 + 正面补光 + 侧补光 + 强环境（浅纸底需大量补光，否则背光面糊黑）
  const key = new THREE.DirectionalLight(0xfff1dc, 1.9)
  key.position.set(3, 5, 2); key.castShadow = true
  key.shadow.mapSize.set(2048, 2048)
  key.shadow.radius = 4
  key.shadow.bias = -0.0004
  scene.add(key)
  const fill = new THREE.DirectionalLight(0xfbefd8, 0.9) // 正面补光，抬起朝向相机的暗面
  fill.position.set(0.5, 1.5, 4)
  scene.add(fill)
  scene.add(new THREE.DirectionalLight(0xe8d9bd, 0.5).translateX(-3)) // 侧补光
  scene.add(new THREE.HemisphereLight(0xfff6e6, 0xb59a70, 1.05))      // 天光更亮、地色更浅，整体提亮

  // 柱头短柱（缩小到与栌斗相称，坐在栌斗正下方）
  const col = new THREE.Mesh(
    new THREE.CylinderGeometry(0.17, 0.19, 0.34, 24),
    new THREE.MeshStandardMaterial({ color: 0x6b4423, roughness: 0.8 }),
  )
  col.position.y = -0.36; col.receiveShadow = true
  scene.add(col)

  // 落点标记：悬在目标正上方的下指锥，depthTest=false 始终画在最前，脉动闪烁——
  // 无论目标多小、是否被别的构件遮挡，都能一眼看到"这一件放这里"。
  const marker = new THREE.Mesh(
    new THREE.ConeGeometry(0.035, 0.08, 4),
    new THREE.MeshBasicMaterial({ color: 0xb5451c, transparent: true, depthTest: false }),
  )
  marker.rotation.x = Math.PI       // 尖朝下
  marker.renderOrder = 999
  marker.visible = false
  scene.add(marker)
  let markerBaseY = 0
  function markerTo(pos) {
    markerBaseY = pos[1] + 0.15
    marker.position.set(pos[0], markerBaseY, pos[2])
    marker.visible = true
  }
  function hideMarker() { marker.visible = false }

  function applyPlacement(mesh, placement) {
    mesh.position.set(...placement.pos)
    mesh.rotation.y = placement.rotY || 0 // 横向构件（泥道栱/令栱/替木/槫）转向进深方向
    mesh.rotation.z = placement.rotZ || 0
  }
  function addPart(mesh, placement) { applyPlacement(mesh, placement); scene.add(mesh) }
  function addGhost(mesh, placement) {
    // 锈橙半透实体虚影：在浅纸底上高对比、清楚指示"这一件该落在哪"
    mesh.material = new THREE.MeshBasicMaterial({ color: 0xb5451c, transparent: true, opacity: 0.34, depthWrite: false })
    applyPlacement(mesh, placement)
    scene.add(mesh)
    return mesh
  }

  function start() {
    function loop(t) {
      requestAnimationFrame(loop)
      if (marker.visible) { // 上下浮动 + 明暗脉动，醒目指示落点
        const k = (t % 1100) / 1100
        marker.position.y = markerBaseY + 0.03 * Math.sin(k * Math.PI * 2)
        marker.material.opacity = 0.55 + 0.45 * (0.5 - 0.5 * Math.cos(k * Math.PI * 2))
      }
      controls.update()
      renderer.render(scene, camera)
    }
    requestAnimationFrame(loop)
  }

  window.addEventListener('resize', () => {
    camera.aspect = container.clientWidth / container.clientHeight
    camera.updateProjectionMatrix()
    renderer.setSize(container.clientWidth, container.clientHeight)
  })

  return { scene, camera, renderer, controls, addPart, addGhost, markerTo, hideMarker, start }
}
