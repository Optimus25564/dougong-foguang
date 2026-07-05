import { PARTS } from './parts.js'

const HINTS = {
  ludou: '先安栌斗——把这方大坐斗稳稳搁上柱头，它是整朵斗栱的地基。',
  'huagong-1': '将第一跳华栱纳入栌斗的十字口，向外挑出第一跳（杪）。',
  nidaogong: '横过来放泥道栱——它与华栱一在栌斗口里十字相交，沿墙面横陈。',
  'sandou-1': '在泥道栱右端栱头坐一枚散斗，斗口向上，准备托柱头枋。',
  'sandou-2': '左端栱头再坐一枚散斗，与右端对称——一栱两端两散斗。',
  zhutoufang: '把柱头枋搁在左右两散斗上（枋不落斗口）；枋侧隐刻栱形，即"隐出栱"。',
  'jiaohudou-1': '在华栱一的跳头坐一颗交互斗——它卡进跳头斗口，等着承接第二跳华栱。',
  'huagong-2': '把第二跳华栱纳入交互斗的斗口，再向外挑出一跳（杪）。',
  'jiaohudou-2': '华栱二跳头再坐一颗交互斗，斗口朝上，准备承接斜伸的第一下昂。',
  'xiaang-1': '搭上第一根下昂——注意它斜向下伸，是撬起深远屋檐的杠杆。',
  'jiaohudou-3': '第一下昂跳头坐一颗交互斗，把双下昂之间接续起来。',
  'xiaang-2': '叠上第二根下昂，把承檐点推得更外、更高。',
  'jiaohudou-4': '第二下昂昂头再坐最后一颗交互斗，斗口朝上，准备承接顺出的耍头。',
  shuatou: '顺着第二下昂之势挑出耍头——外跳最末的露头，其上便承令栱。',
  linggong: '横安令栱——外跳唯一的计心横栱，承其上的替木。',
  timu: '令栱之上垫替木，把圆槫的压力摊开，好稳稳托檩。',
  liaoyantuan: '最后搁上橑檐槫——最外一道檐檩，一朵斗栱层层出跳，托的正是它。',
}

export const ASSEMBLY_STEPS = [...PARTS]
  .sort((a, b) => a.layer - b.layer)
  .map((p, index) => ({ partId: p.id, index, hint: HINTS[p.id] }))

export function stepForIndex(i) {
  return ASSEMBLY_STEPS[i] ?? null
}
