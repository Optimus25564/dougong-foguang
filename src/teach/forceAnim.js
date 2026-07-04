import * as THREE from 'three'

// 下昂杠杆：以栌斗一线为支点（x=0），演示挑檐下压→昂尾上翘的平衡
export function leverBalance(t) {
  const amp = Math.sin(Math.min(1, Math.max(0, t)) * Math.PI) // 0→1→0 往复演示
  return { tipDrop: amp * 0.06, tailRise: amp * 0.06, pivotX: 0 }
}

// 可视：在昂尖（外挑，红）与昂尾（内压，蓝）加受力箭头
export function createForceArrows(scene, partMesh) {
  const group = new THREE.Group()
  const tip = new THREE.ArrowHelper(new THREE.Vector3(0, -1, 0), new THREE.Vector3(0.6, 0.1, 0), 0.3, 0xff5533)
  const tail = new THREE.ArrowHelper(new THREE.Vector3(0, -1, 0), new THREE.Vector3(-0.4, 0.2, 0), 0.25, 0x3388ff)
  group.add(tip, tail)
  scene.add(group)
  let t = 0
  return {
    group,
    update(dt) {
      t = (t + dt * 0.5) % 1
      const b = leverBalance(t)
      group.position.y = -b.tipDrop
    },
  }
}
