// 暂存原自发光色并置高亮蓝
export function applyHighlight(mesh) {
  if (!mesh.material.emissive) return
  if (mesh.userData._emissive != null) return  // 防重复高亮丢失原色
  mesh.userData._emissive = mesh.material.emissive.getHex()
  mesh.material.emissive.setHex(0x3a6ea5)  // 高亮蓝
}
// 恢复暂存的自发光色
export function clearHighlight(mesh) {
  if (mesh.userData._emissive == null) return
  mesh.material.emissive.setHex(mesh.userData._emissive)
  mesh.userData._emissive = null
}
