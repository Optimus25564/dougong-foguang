import { FEN_TO_M } from '../constants.js'

const f = n => n * FEN_TO_M
const deg = d => (d * Math.PI) / 180

// 位姿以栌斗顶面中心一带为基准，逐层向上、向外（+X）挑出
export const PLACEMENTS = {
  ludou:      { pos: [0,        f(0),   0], rotZ: 0 },
  'huagong-1':{ pos: [0,        f(18),  0], rotZ: 0 },
  'huagong-2':{ pos: [f(30),    f(39),  0], rotZ: 0 },
  'xiaang-1': { pos: [f(55),    f(60),  0], rotZ: deg(-25) },
  'xiaang-2': { pos: [f(85),    f(82),  0], rotZ: deg(-25) },
  linggong:   { pos: [f(110),   f(104), 0], rotZ: 0 },
}

export function placementFor(id) {
  return PLACEMENTS[id] ?? null
}
