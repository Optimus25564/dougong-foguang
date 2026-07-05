// 暂存原自发光色并置暖色高亮（浅纸底上偏蓝会经色调映射发脏绿，故改暖橙微光）
export function applyHighlight(mesh) {
  if (!mesh.material.emissive) return
  if (mesh.userData._emissive != null) return  // 防重复高亮丢失原色
  mesh.userData._emissive = mesh.material.emissive.getHex()
  mesh.material.emissive.setHex(0x5a2a08)  // 暖橙微光，刚放好的一件轻微提亮而不抢色
}
// 恢复暂存的自发光色
export function clearHighlight(mesh) {
  if (mesh.userData._emissive == null) return
  mesh.material.emissive.setHex(mesh.userData._emissive)
  mesh.userData._emissive = null
}
