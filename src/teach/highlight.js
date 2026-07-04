export function applyHighlight(mesh) {
  if (!mesh.material.emissive) return
  mesh.userData._emissive = mesh.material.emissive.getHex()
  mesh.material.emissive.setHex(0x3a6ea5)
}
export function clearHighlight(mesh) {
  if (mesh.userData._emissive == null) return
  mesh.material.emissive.setHex(mesh.userData._emissive)
  mesh.userData._emissive = null
}
