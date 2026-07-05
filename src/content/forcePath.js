import { placementFor } from './placements.js'

// 传力链：屋檐荷载自上而下，经铺作层层收回柱心，落柱入地。
// 每个节点是一处「力的交接」，也是导览的一站。
// at: 部件 id（端点取该件装配位）；或 point:[x,y,z] 显式点（屋面上方 / 柱脚入地，无对应单件）。
export const FORCE_STEPS = [
  {
    id: 'eave', at: 'liaoyantuan', label: '屋檐压上撩檐槫',
    caption: '屋面之重顺着椽子，汇集到最外一道檐檩——撩檐槫。这是屋顶荷载进入斗栱的第一站。',
  },
  {
    id: 'linggong', at: 'linggong', label: '令栱替木承接',
    caption: '撩檐槫坐在替木与令栱之上。令栱是最上的横栱，把这份力横向摊开，交给下方层层出挑的昂与栱。',
  },
  {
    id: 'ang', at: 'xiaang-1', label: '下昂作杠杆',
    caption: '下昂是一根斜置的杠杆：昂尖在外挑着深远的檐，昂尾在内向上伸进室内、被草栿（屋架暗梁）死死压住，以栌斗一线为支点两端平衡。——注意昂尾通向的是屋架，不是墙；正因这套杠杆，佛光寺东大殿才敢出檐近四米而轻盈欲飞。',
  },
  {
    id: 'huagong', at: 'huagong-1', label: '华栱层层内收',
    caption: '华栱一跳跳向内收，把远远挑出的力，一步步收回到柱心的正上方——出跳愈多，铺作愈高，出檐也愈远。',
  },
  {
    id: 'ludou', at: 'ludou', label: '汇于栌斗',
    caption: '全朵之力最终汇聚到最下、最大的栌斗。这方大坐斗把上面所有的力，整整齐齐压到柱头一点。',
  },
  {
    id: 'column', point: [0, -0.55, 0], label: '落柱入地',
    caption: '柱把力顺直落到础石、传入大地。而墙呢？墙只是柱与柱之间的填充隔断，一点不承重——这正是中国木构「墙倒屋不塌」的底气：撑起屋檐的从来是柱与斗栱，不是墙。',
  },
]

// 解析出世界坐标的有序节点：[{ id, label, caption, pos:[x,y,z] }, ...]
export function forceNodes() {
  return FORCE_STEPS.map(s => {
    const pos = s.point ?? placementFor(s.at).pos
    return { id: s.id, label: s.label, caption: s.caption, pos: [...pos] }
  })
}
