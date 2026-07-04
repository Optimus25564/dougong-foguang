import { PARTS } from './parts.js'

const HINTS = {
  ludou: '先安栌斗——把这方大坐斗稳稳搁上柱头，它是整朵斗栱的地基。',
  'huagong-1': '将第一跳华栱纳入栌斗的十字口，向外挑出第一跳（杪）。',
  'huagong-2': '再叠第二跳华栱，跳头的交互斗准备承接下昂。',
  'xiaang-1': '搭上第一根下昂——注意它斜向下伸，是撬起深远屋檐的杠杆。',
  'xiaang-2': '叠上第二根下昂，把承檐点推得更外、更高。',
  linggong: '最后安令栱，承替木与撩檐槫，一朵斗栱大功告成。',
}

export const ASSEMBLY_STEPS = [...PARTS]
  .sort((a, b) => a.layer - b.layer)
  .map((p, index) => ({ partId: p.id, index, hint: HINTS[p.id] }))

export function stepForIndex(i) {
  return ASSEMBLY_STEPS[i] ?? null
}
