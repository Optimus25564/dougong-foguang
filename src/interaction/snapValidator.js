import { placementFor } from '../content/placements.js'

export const SNAP_TOLERANCE = 0.12 // 米

function dist(a, b) {
  return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2])
}

export function validateSnap(partId, pos, { tolerance = SNAP_TOLERANCE } = {}) {
  const target = placementFor(partId)
  if (!target) return { ok: false, target: null, distance: Infinity }
  const distance = dist(pos, target.pos)
  return { ok: distance <= tolerance, target, distance }
}
