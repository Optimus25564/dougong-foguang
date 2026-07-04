// 卷杀 profile：返回栱头曲线的落点（分为单位）
// caiGuang: 材广（栱高），bras: 瓣数
export function juanshaProfile(caiGuang, bras) {
  const totalLen = bras * 4          // 每瓣约 4 分（法式常用值）
  const headInset = caiGuang * 0.4   // 栱头端收进后的起始高度
  const pts = []
  for (let i = 0; i <= bras; i++) {
    const t = i / bras               // 0→1
    const x = t * totalLen
    // 四分之一正弦弧：栱端最收，向内渐达满高
    const y = headInset + (caiGuang - headInset) * Math.sin((t * Math.PI) / 2)
    pts.push({ x, y })
  }
  // 保证末点精确落在满材广
  pts[pts.length - 1].y = caiGuang
  return pts
}
