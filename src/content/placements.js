import { FEN_TO_M } from '../constants.js'

const f = n => n * FEN_TO_M
const deg = d => (d * Math.PI) / 180

// 位姿以栌斗中心一带为基准，逐层向上、向外（+X）挑出。
// 关键：相邻层之间靠交互斗（见 CONNECTORS）承接，故此处的层高留出一个小斗的厚度，
// 让上一层的栱头顶 → 小斗 → 下一层底 三者贴合，装配看起来是"坐实"而非"悬空"。
export const PLACEMENTS = {
  ludou:      { pos: [f(0),   f(-5),  0], rotZ: 0 },
  'huagong-1':{ pos: [f(6),   f(16),  0], rotZ: 0 },
  'huagong-2':{ pos: [f(20),  f(42),  0], rotZ: 0 },
  'xiaang-1': { pos: [f(34),  f(66),  0], rotZ: deg(-22) },
  'xiaang-2': { pos: [f(50),  f(86),  0], rotZ: deg(-22) },
  linggong:   { pos: [f(64),  f(102), 0], rotZ: 0 },
}

export function placementFor(id) {
  return PLACEMENTS[id] ?? null
}

// 交互斗：把每一跳的栱/昂头承接给上一层的小坐斗。
// 键 = 它所坐落的那件部件；该件放好时，对应的小斗一并出现在它的跳头上，
// 于是下一件放上来时便有可见的斗托着——回答了"到底插/坐在哪"。
const DOU_DIMS = { fang: 18, height: 10, ear: 4, ping: 2, xie: 4, kouWidth: 10 }

export const CONNECTORS = {
  'huagong-1': [{ dims: DOU_DIMS, pos: [f(20), f(29),  0], rotZ: 0 }], // 承华拱二
  'huagong-2': [{ dims: DOU_DIMS, pos: [f(34), f(55),  0], rotZ: 0 }], // 承下昂一
  'xiaang-1':  [{ dims: DOU_DIMS, pos: [f(50), f(76),  0], rotZ: 0 }], // 承下昂二
  'xiaang-2':  [{ dims: DOU_DIMS, pos: [f(64), f(96),  0], rotZ: 0 }], // 承令栱
}

// 返回某件放好时应一并出现的交互斗（没有则空数组）
export function connectorsOn(id) {
  return CONNECTORS[id] ?? []
}
