import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

export function createScene(container) {
  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0x1a1512)

  const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100)
  camera.position.set(2.2, 1.6, 2.6)

  const renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(container.clientWidth, container.clientHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.shadowMap.enabled = true
  container.appendChild(renderer.domElement)

  const controls = new OrbitControls(camera, renderer.domElement)
  controls.target.set(0, 0.6, 0)
  controls.enableDamping = true

  // 光照：暖色主光 + 冷补光 + 环境
  const key = new THREE.DirectionalLight(0xfff2e0, 2.2)
  key.position.set(3, 5, 2); key.castShadow = true
  scene.add(key)
  scene.add(new THREE.DirectionalLight(0x88aaff, 0.5).translateX(-3))
  scene.add(new THREE.HemisphereLight(0xffffff, 0x3a2c20, 0.6))

  // 柱头短柱
  const col = new THREE.Mesh(
    new THREE.CylinderGeometry(0.28, 0.3, 0.5, 24),
    new THREE.MeshStandardMaterial({ color: 0x6b4423, roughness: 0.8 }),
  )
  col.position.y = -0.4; col.receiveShadow = true
  scene.add(col)

  function applyPlacement(mesh, placement) {
    mesh.position.set(...placement.pos)
    mesh.rotation.z = placement.rotZ || 0
  }
  function addPart(mesh, placement) { applyPlacement(mesh, placement); scene.add(mesh) }
  function addGhost(mesh, placement) {
    mesh.material = new THREE.MeshBasicMaterial({ color: 0x66ccff, transparent: true, opacity: 0.22, wireframe: false })
    applyPlacement(mesh, placement)
    scene.add(mesh)
    return mesh
  }

  function start() {
    function loop() {
      requestAnimationFrame(loop)
      controls.update()
      renderer.render(scene, camera)
    }
    loop()
  }

  window.addEventListener('resize', () => {
    camera.aspect = container.clientWidth / container.clientHeight
    camera.updateProjectionMatrix()
    renderer.setSize(container.clientWidth, container.clientHeight)
  })

  return { scene, camera, renderer, controls, addPart, addGhost, start }
}
