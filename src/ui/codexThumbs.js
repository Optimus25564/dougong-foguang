import * as THREE from 'three'
import { PARTS } from '../content/parts.js'
import { buildPartMesh } from '../scene/partFactory.js'

// 为图鉴每件渲染一张 3/4 视角缩略图（复用真实几何，含卷杀/昂嘴/鞍口等细节）。
// 用一个离屏渲染器顺序拍照 → dataURL，避免每页各开一个 WebGL 上下文（浏览器有上限）。
// 无 WebGL 环境（如 jsdom 测试）时抛错，调用方以 try/catch 兜底、退回纯文字图鉴。
export function renderPartThumbnails(size = 150) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true })
  renderer.setSize(size, size)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))

  const scene = new THREE.Scene()
  scene.add(new THREE.HemisphereLight(0xfff6e6, 0x6b5740, 1.15))
  const key = new THREE.DirectionalLight(0xfff1dc, 1.9)
  key.position.set(2, 3, 2.5)
  scene.add(key)
  const fill = new THREE.DirectionalLight(0xfbefd8, 0.7)
  fill.position.set(-1.5, 1, 2)
  scene.add(fill)

  const cam = new THREE.PerspectiveCamera(32, 1, 0.001, 100)
  const box = new THREE.Box3(), center = new THREE.Vector3(), sizeV = new THREE.Vector3()
  const map = {}

  for (const p of PARTS) {
    const mesh = buildPartMesh(p.id)
    mesh.rotation.set(0, 0, 0) // 图鉴取部件自身的规范朝向（长沿 X），而非装配位姿
    scene.add(mesh)
    box.setFromObject(mesh)
    box.getCenter(center); box.getSize(sizeV)
    const r = Math.max(sizeV.x, sizeV.y, sizeV.z) || 0.1
    // 近侧立面的 3/4：压低俯角、偏侧向，让栱/昂/枋的侧轮廓（卷杀、昂嘴）看得清，
    // 而非俯视压成"驼峰"
    cam.position.set(center.x + r * 0.75, center.y + r * 0.42, center.z + r * 2.4)
    cam.lookAt(center)
    cam.updateProjectionMatrix()
    renderer.render(scene, cam)
    map[p.id] = renderer.domElement.toDataURL('image/png')
    scene.remove(mesh)
    mesh.geometry.dispose()
  }
  renderer.dispose()
  return map
}
