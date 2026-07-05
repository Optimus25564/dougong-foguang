import { FEN_TO_M } from '../constants.js'

const f = n => n * FEN_TO_M
const deg = d => (d * Math.PI) / 180

// ── 按《营造法式》分°规则生成位姿，而非手填坐标 ──
// 改这几个规则常数即可整体调整，所有构件自洽联动、榫卯对齐。
const TIAO = 20    // 每跳外挑（分）：华栱/昂逐跳向 +X 挑出一跳（收紧以增叠压、去松散）
const ZUCAI = 21   // 足材广（华栱·下昂·耍头）
const DANCAI = 15  // 单材广（泥道栱·令栱）
const SD_H = 10, SD_EAR = 4   // 小斗（交互斗/散斗）：高、耳
const LD_H = 20, LD_EAR = 8   // 栌斗：高、耳
const TIMU_G = 12, TUAN_R = 9 // 替木广、橑檐槫半径
const SLOPE = 10, SLOPE_SH = 5 // 下昂、耍头斜度（度）

const SEAT = 4 // 额外搭接（分）：每处栱↔斗多沉入一点，压紧层叠、消除斜昂之间的空隙
// 顶面斗平 = 斗心 + 高/2 − 耳高 − 搭接；栱底落此、沉入斗口并再压紧
const pingTop = (cy, h, ear) => cy + h / 2 - ear - SEAT
// 斗坐栱顶：给栱顶高，返回斗心（多压入 SEAT）
const douOn = (gongTop, h) => gongTop + h / 2 - SEAT
// 斜构件（下昂/耍头）跳头相对其心顶的下沉 = 跳距 × tan斜度
const drop = degv => TIAO * Math.tan((degv * Math.PI) / 180)

// —— 竖向：自栌斗斗平起，栱→斗→栱→斗 逐层叠加；昂/耍头的跳头按斜度下沉 ——
const LUDOU_CY = -8
const P0 = pingTop(LUDOU_CY, LD_H, LD_EAR)             // 栌斗斗平
const hg1Cy = P0 + ZUCAI / 2                            // 华栱一坐栌斗口
const jhd1Cy = douOn(hg1Cy + ZUCAI / 2, SD_H)          // 交互斗一坐华栱一跳头（平顶）
const P1 = pingTop(jhd1Cy, SD_H, SD_EAR)
const hg2Cy = P1 + ZUCAI / 2                            // 华栱二
const jhd2Cy = douOn(hg2Cy + ZUCAI / 2, SD_H)
const P2 = pingTop(jhd2Cy, SD_H, SD_EAR)
const xa1Cy = P2 + ZUCAI / 2                            // 下昂一
const jhd3Cy = douOn(xa1Cy + ZUCAI / 2 - drop(SLOPE), SD_H)  // 昂一跳头下沉
const P3 = pingTop(jhd3Cy, SD_H, SD_EAR)
const xa2Cy = P3 + ZUCAI / 2                            // 下昂二
const jhd4Cy = douOn(xa2Cy + ZUCAI / 2 - drop(SLOPE), SD_H)  // 昂二跳头下沉
const P4 = pingTop(jhd4Cy, SD_H, SD_EAR)
const shCy = P4 + ZUCAI / 2                             // 耍头
const lgCy = shCy + ZUCAI / 2 - drop(SLOPE_SH) + DANCAI / 2  // 令栱坐耍头跳头（微沉）
const tmCy = lgCy + DANCAI / 2 + TIMU_G / 2            // 替木坐令栱顶
const ltCy = tmCy + TIMU_G / 2 + TUAN_R                // 橑檐槫坐替木顶

// —— 泥道列：栌斗 → 泥道栱 → 散斗 → 柱头枋 ——
const ndCy = P0 + DANCAI / 2                            // 泥道栱与华栱一同坐栌斗斗平
const sdCy = douOn(ndCy + DANCAI / 2, SD_H)            // 散斗坐泥道栱两端栱头
const ztCy = sdCy + SD_H / 2 + DANCAI / 2              // 柱头枋搁两散斗上

// 每件的 x 由其所坐之斗的跳位决定（jump × TIAO）
export const PLACEMENTS = {
  ludou:        { pos: [f(0),       f(LUDOU_CY), 0],     rotZ: 0 },
  'huagong-1':  { pos: [f(0),       f(hg1Cy),    0],     rotZ: 0 },          // 居栌斗正中
  nidaogong:    { pos: [f(0),       f(ndCy),     0],     rotZ: 0, rotY: deg(90) },
  'sandou-1':   { pos: [f(0),       f(sdCy),     f(28)], rotZ: 0 },
  'sandou-2':   { pos: [f(0),       f(sdCy),     f(-28)],rotZ: 0 },
  zhutoufang:   { pos: [f(0),       f(ztCy),     0],     rotZ: 0, rotY: deg(90) },
  'jiaohudou-1':{ pos: [f(TIAO),    f(jhd1Cy),   0],     rotZ: 0 },
  'huagong-2':  { pos: [f(TIAO),    f(hg2Cy),    0],     rotZ: 0 },
  'jiaohudou-2':{ pos: [f(2 * TIAO),f(jhd2Cy),   0],     rotZ: 0 },
  'xiaang-1':   { pos: [f(2 * TIAO),f(xa1Cy),    0],     rotZ: deg(-SLOPE) },
  'jiaohudou-3':{ pos: [f(3 * TIAO),f(jhd3Cy),   0],     rotZ: 0 },
  'xiaang-2':   { pos: [f(3 * TIAO),f(xa2Cy),    0],     rotZ: deg(-SLOPE) },
  'jiaohudou-4':{ pos: [f(4 * TIAO),f(jhd4Cy),   0],     rotZ: 0 },
  shuatou:      { pos: [f(4 * TIAO),f(shCy),     0],     rotZ: deg(-SLOPE_SH) },
  linggong:     { pos: [f(4 * TIAO),f(lgCy),     f(2)],  rotZ: 0, rotY: deg(90) },
  timu:         { pos: [f(4 * TIAO),f(tmCy),     f(2)],  rotZ: 0, rotY: deg(90) },
  liaoyantuan:  { pos: [f(4 * TIAO),f(ltCy),     f(2)],  rotZ: 0, rotY: deg(90) },
}

export function placementFor(id) {
  return PLACEMENTS[id] ?? null
}
