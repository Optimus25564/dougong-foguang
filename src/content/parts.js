// 佛光寺东大殿柱头铺作·七铺作双杪双下昂（MVP 主轴 6 件，自下而上）
// 尺寸依《营造法式》分°：斗口=10分，材广=15分，足材广=21分。

export const REQUIRED_FIELDS = [
  'id', 'name', 'term', 'pinyin', 'dims',
  'juansha', 'layer', 'parents', 'role', 'desc', 'trivia', 'hasForceAnim',
]

export const PARTS = [
  {
    id: 'ludou', name: '栌斗', term: '栌斗', pinyin: 'lúdǒu',
    dims: { fang: 32, height: 20, ear: 8, ping: 4, xie: 8, kouWidth: 10 },
    juansha: null, layer: 0, parents: [],
    role: '全朵之基，坐于柱头，承托上部所有出跳与横栱，最终将屋檐之力汇聚落柱。',
    desc: '栌斗是斗栱最下、最大的坐斗，方三十二分、高二十分，上开十字口以纳第一跳华栱。斗身自上而下分耳、平、欹三段。',
    trivia: '佛光寺东大殿的栌斗尺度雄大，是判定其为唐构的重要依据之一——斗口越大，用材等级越高。',
    hasForceAnim: true,
  },
  {
    id: 'huagong-1', name: '华栱·第一杪', term: '华栱', pinyin: 'huágǒng',
    dims: { length: 72, caiGuang: 21, houDou: 10, chuTiao: 30 },
    juansha: 4, layer: 1, parents: ['ludou'],
    role: '自栌斗十字口纵向出第一跳（杪），向外悬挑并承上层。',
    desc: '华栱是横向出跳的栱，足材造，广二十一分、厚十分，栱头卷杀四瓣。佛光寺此跳为「偷心」——跳头不施横栱，唯见华栱层层挑出，气魄雄浑。',
    trivia: '「偷心造」是唐及辽构的典型手法，宋《营造法式》以后多改「计心」，故一眼「偷心」便知年代古老。',
    hasForceAnim: true,
  },
  {
    id: 'huagong-2', name: '华栱·第二杪', term: '华栱', pinyin: 'huágǒng',
    dims: { length: 72, caiGuang: 21, houDou: 10, chuTiao: 30 },
    juansha: 4, layer: 2, parents: ['huagong-1'],
    role: '出第二跳（杪），跳头置交互斗以承其上下昂。',
    desc: '第二跳华栱之上置交互斗，承接第一下昂。至此出跳两次，皆为杪（华栱）。',
    trivia: '「双杪」即连出两跳华栱；佛光寺再叠「双下昂」，合为「双杪双下昂」七铺作，是唐代最高等级的铺作之一。',
    hasForceAnim: false,
  },
  {
    id: 'xiaang-1', name: '下昂·第一昂', term: '下昂', pinyin: 'xiàáng',
    dims: { length: 120, caiGuang: 21, houDou: 10, chuTiao: 30, slopeDeg: 25 },
    juansha: null, layer: 3, parents: ['huagong-2'],
    role: '下斜悬挑的杠杆：昂尖向外下伸承挑檐，昂尾向内上翘被屋架压住，以栌斗一线为支点平衡。',
    desc: '下昂是一根斜置长木，昂身自内向外下斜。它是斗栱中最精妙的杠杆构件：外挑之檐与内压之屋架各据支点两端，以巧妙的力学平衡出深远的屋檐。',
    trivia: '正是下昂的杠杆，让唐代大殿得以出檐深远如翼——佛光寺东大殿檐出近四米，却轻盈欲飞。',
    hasForceAnim: true,
  },
  {
    id: 'xiaang-2', name: '下昂·第二昂', term: '下昂', pinyin: 'xiàáng',
    dims: { length: 130, caiGuang: 21, houDou: 10, chuTiao: 30, slopeDeg: 25 },
    juansha: null, layer: 4, parents: ['xiaang-1'],
    role: '第二重下昂，进一步出跳并抬高承檐点。',
    desc: '第二下昂叠于第一昂之上，再出一跳，将撩檐槫的承点推向更外更高处，形成双下昂的深远挑檐。',
    trivia: '双下昂逐层加大出挑与举高，是控制屋面举折、塑造唐构舒展屋顶曲线的关键。',
    hasForceAnim: false,
  },
  {
    id: 'linggong', name: '令栱', term: '令栱', pinyin: 'línggǒng',
    dims: { length: 72, caiGuang: 15, houDou: 10 },
    juansha: 5, layer: 5, parents: ['xiaang-2'],
    role: '最上横栱，承替木与撩檐槫，把檐槫之力横向摊给下方昂、栱。',
    desc: '令栱是铺作最上的横栱，单材造，栱头卷杀五瓣，其上承替木以托撩檐槫（即最外一道屋檐檩木）。',
    trivia: '令栱卷杀五瓣，较华栱（四瓣）更多一瓣，曲线更柔——卷杀瓣数是辨识栱种的细节线索。',
    hasForceAnim: false,
  },
]

export function getPart(id) {
  return PARTS.find(p => p.id === id) || null
}
