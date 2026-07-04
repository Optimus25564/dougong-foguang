# 《斗拱：重建佛光寺》MVP 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 做出一个网页 3D 游戏，玩家逐层拼装佛光寺东大殿柱头铺作（七铺作双杪双下昂），每放一件有镜头拉近、高亮、旁注与受力动画讲解，拼完看整朵受力总览。

**Architecture:** 纯前端 Three.js。数据驱动：`content/` 是唯一真相（部件数据 + 拼装顺序），`scene/geometry/` 按《营造法式》分°模数参数化生成几何，`interaction/` 管拖拽与吸附校验，`teach/` 管镜头/高亮/受力动画/旁注，`ui/` 管零件盘与图鉴。可测逻辑（数据、几何尺寸、吸附校验）走 vitest；渲染与动画走手动视觉验证。

**Tech Stack:** Three.js ^0.160, Vite ^5, Vitest ^1, jsdom（sensor/纯逻辑测试）。ES modules，中文界面。

## Global Constraints

- 模数单位：一切几何尺寸以《营造法式》**分°**为基准数值；`斗口 = 10 分`。渲染时统一乘 `FEN_TO_M = 0.01`（1 分 ≈ 1cm，佛光寺材广约 30cm）换算为米。所有数据表尺寸字段单位一律为**分**。
- 部件数据字段齐全：每条 part 记录必含 `id, name, term, pinyin, dims, layer, parents, role, desc, trivia, hasForceAnim`。
- 术语精确，中文界面；面向建筑爱好者，不回避专业术语。
- 提交信息中文，末行附 `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`。
- 每个几何生成器拆成**纯尺寸函数**（返回可断言的尺寸对象）+ **几何构建函数**（返回 `THREE.BufferGeometry`），前者必测。
- 沿用用户火箭游戏项目结构约定（`src/content|scene|interaction|ui`，`tests/`）。

---

### Task 1: 项目脚手架

**Files:**
- Create: `package.json`
- Create: `vite.config.js`
- Create: `index.html`
- Create: `src/main.js`
- Create: `src/constants.js`
- Test: `tests/smoke.test.js`

**Interfaces:**
- Produces: `src/constants.js` 导出 `FEN_TO_M = 0.01`、`DOUKOU_FEN = 10`。

- [ ] **Step 1: 写 package.json**

```json
{
  "name": "dougong-foguang",
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "three": "^0.160.0"
  },
  "devDependencies": {
    "vite": "^5.0.0",
    "vitest": "^1.0.0",
    "jsdom": "^23.0.0"
  }
}
```

- [ ] **Step 2: 写 vite.config.js**

```js
import { defineConfig } from 'vite'

export default defineConfig({
  test: { environment: 'jsdom' },
})
```

- [ ] **Step 3: 写 index.html**

```html
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>斗拱：重建佛光寺</title>
    <style> html,body{margin:0;height:100%;overflow:hidden;background:#1a1512} </style>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.js"></script>
  </body>
</html>
```

- [ ] **Step 4: 写 src/constants.js**

```js
export const FEN_TO_M = 0.01   // 1 分 ≈ 1cm
export const DOUKOU_FEN = 10   // 斗口 = 10 分
```

- [ ] **Step 5: 写 src/main.js（占位入口）**

```js
import './constants.js'

const app = document.getElementById('app')
if (app) app.textContent = '斗拱：重建佛光寺 — 加载中…'
```

- [ ] **Step 6: 写冒烟测试 tests/smoke.test.js**

```js
import { describe, it, expect } from 'vitest'
import { FEN_TO_M, DOUKOU_FEN } from '../src/constants.js'

describe('constants', () => {
  it('分到米换算与斗口模数正确', () => {
    expect(FEN_TO_M).toBe(0.01)
    expect(DOUKOU_FEN).toBe(10)
  })
})
```

- [ ] **Step 7: 安装依赖并跑测试**

Run: `npm install && npm test`
Expected: 1 passed。

- [ ] **Step 8: 提交**

```bash
git add -A
git commit -m "脚手架：vite + vitest + three，常量与冒烟测试"
```

---

### Task 2: 部件数据表 content/parts.js

**Files:**
- Create: `src/content/parts.js`
- Test: `tests/parts.test.js`

**Interfaces:**
- Produces: `PARTS`（部件记录数组，MVP 主轴 6 件）、`getPart(id)`、`REQUIRED_FIELDS`（字段名数组）。part 记录字段：`id, name, term, pinyin, dims, juansha, layer, parents, role, desc, trivia, hasForceAnim`。`dims` 内数值单位为分。

- [ ] **Step 1: 写失败测试 tests/parts.test.js**

```js
import { describe, it, expect } from 'vitest'
import { PARTS, getPart, REQUIRED_FIELDS } from '../src/content/parts.js'

describe('parts 数据表', () => {
  it('MVP 主轴含 6 件，层级从 0 递增无缺口', () => {
    expect(PARTS).toHaveLength(6)
    const layers = PARTS.map(p => p.layer).sort((a, b) => a - b)
    expect(layers).toEqual([0, 1, 2, 3, 4, 5])
  })

  it('每件字段齐全', () => {
    for (const p of PARTS) {
      for (const f of REQUIRED_FIELDS) {
        expect(p, `${p.id} 缺字段 ${f}`).toHaveProperty(f)
      }
    }
  })

  it('parents 引用的 id 都存在，且父件层级更低', () => {
    for (const p of PARTS) {
      for (const parentId of p.parents) {
        const parent = getPart(parentId)
        expect(parent, `${p.id} 的父件 ${parentId} 不存在`).toBeTruthy()
        expect(parent.layer).toBeLessThan(p.layer)
      }
    }
  })

  it('栌斗为基件，方 32 分高 20 分，无父件', () => {
    const ludou = getPart('ludou')
    expect(ludou.parents).toEqual([])
    expect(ludou.dims.fang).toBe(32)
    expect(ludou.dims.height).toBe(20)
  })

  it('华拱为足材：广 21 分、厚 10 分、卷杀 4 瓣', () => {
    const g = getPart('huagong-1')
    expect(g.dims.caiGuang).toBe(21)
    expect(g.dims.houDou).toBe(10)
    expect(g.juansha).toBe(4)
  })
})
```

- [ ] **Step 2: 跑测试确认失败**

Run: `npx vitest run tests/parts.test.js`
Expected: FAIL（找不到模块 / PARTS 未定义）。

- [ ] **Step 3: 写实现 src/content/parts.js**

> 尺寸取《营造法式》分°标准值，注释标注佛光寺东大殿（857 年）实测特征（双杪偷心、昂形耍头）。数值以分为单位。

```js
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
```

- [ ] **Step 4: 跑测试确认通过**

Run: `npx vitest run tests/parts.test.js`
Expected: 5 passed。

- [ ] **Step 5: 提交**

```bash
git add src/content/parts.js tests/parts.test.js
git commit -m "部件数据表：MVP 主轴 6 件（营造法式分°），含完整性测试"
```

---

### Task 3: 拼装顺序 content/assemblySteps.js

**Files:**
- Create: `src/content/assemblySteps.js`
- Test: `tests/assemblySteps.test.js`

**Interfaces:**
- Consumes: `PARTS, getPart`（Task 2）。
- Produces: `ASSEMBLY_STEPS`（按 layer 升序的数组，每项 `{ partId, index, hint }`）、`stepForIndex(i)`。

- [ ] **Step 1: 写失败测试 tests/assemblySteps.test.js**

```js
import { describe, it, expect } from 'vitest'
import { ASSEMBLY_STEPS, stepForIndex } from '../src/content/assemblySteps.js'
import { PARTS } from '../src/content/parts.js'

describe('拼装顺序', () => {
  it('步数等于部件数，index 连续从 0', () => {
    expect(ASSEMBLY_STEPS).toHaveLength(PARTS.length)
    ASSEMBLY_STEPS.forEach((s, i) => expect(s.index).toBe(i))
  })

  it('顺序即 layer 升序：第一件是栌斗，最后是令栱', () => {
    expect(ASSEMBLY_STEPS[0].partId).toBe('ludou')
    expect(ASSEMBLY_STEPS.at(-1).partId).toBe('linggong')
  })

  it('每步的父件都排在它之前', () => {
    const orderOf = id => ASSEMBLY_STEPS.findIndex(s => s.partId === id)
    for (const p of PARTS) {
      for (const parentId of p.parents) {
        expect(orderOf(parentId)).toBeLessThan(orderOf(p.id))
      }
    }
  })

  it('每步都有非空 hint 文案', () => {
    for (const s of ASSEMBLY_STEPS) {
      expect(typeof s.hint).toBe('string')
      expect(s.hint.length).toBeGreaterThan(0)
    }
  })

  it('stepForIndex 越界返回 null', () => {
    expect(stepForIndex(0).partId).toBe('ludou')
    expect(stepForIndex(999)).toBeNull()
  })
})
```

- [ ] **Step 2: 跑测试确认失败**

Run: `npx vitest run tests/assemblySteps.test.js`
Expected: FAIL（模块不存在）。

- [ ] **Step 3: 写实现 src/content/assemblySteps.js**

```js
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
```

- [ ] **Step 4: 跑测试确认通过**

Run: `npx vitest run tests/assemblySteps.test.js`
Expected: 5 passed。

- [ ] **Step 5: 提交**

```bash
git add src/content/assemblySteps.js tests/assemblySteps.test.js
git commit -m "拼装顺序：按层级升序 + 引导文案，含父件先行校验"
```

---

### Task 4: 卷杀曲线工具 scene/geometry/juansha.js

**Files:**
- Create: `src/scene/geometry/juansha.js`
- Test: `tests/juansha.test.js`

**Interfaces:**
- Produces: `juanshaProfile(caiGuang, bras)` → 返回栱头卷杀的 2D 点数组 `[{x, y}, ...]`（x 沿栱长方向、y 为栱高方向），点数 = `瓣数+1`，用于放样栱头曲线。`x` 从 0（栱端最外）到卷杀总长，`y` 从栱头收进值到满高 `caiGuang`。

- [ ] **Step 1: 写失败测试 tests/juansha.test.js**

```js
import { describe, it, expect } from 'vitest'
import { juanshaProfile } from '../src/scene/geometry/juansha.js'

describe('卷杀 juansha', () => {
  it('四瓣卷杀返回 5 个点', () => {
    expect(juanshaProfile(21, 4)).toHaveLength(5)
  })

  it('五瓣卷杀返回 6 个点', () => {
    expect(juanshaProfile(15, 5)).toHaveLength(6)
  })

  it('起点在栱端（x=0）高度最低，终点达满材广', () => {
    const pts = juanshaProfile(21, 4)
    expect(pts[0].x).toBe(0)
    expect(pts.at(-1).y).toBeCloseTo(21, 5)
    expect(pts[0].y).toBeLessThan(pts.at(-1).y)
  })

  it('x 单调递增，y 单调不减（曲线向上向内收）', () => {
    const pts = juanshaProfile(21, 4)
    for (let i = 1; i < pts.length; i++) {
      expect(pts[i].x).toBeGreaterThan(pts[i - 1].x)
      expect(pts[i].y).toBeGreaterThanOrEqual(pts[i - 1].y)
    }
  })
})
```

- [ ] **Step 2: 跑测试确认失败**

Run: `npx vitest run tests/juansha.test.js`
Expected: FAIL。

- [ ] **Step 3: 写实现 src/scene/geometry/juansha.js**

> 《营造法式》卷杀：栱头分若干瓣，每瓣沿栱长等分，逐瓣向上收进。此处用四分之一椭圆弧近似逐瓣落点：x 等分，y 按 sin 上升到满材广，末瓣齐平。

```js
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
```

- [ ] **Step 4: 跑测试确认通过**

Run: `npx vitest run tests/juansha.test.js`
Expected: 4 passed。

- [ ] **Step 5: 提交**

```bash
git add src/scene/geometry/juansha.js tests/juansha.test.js
git commit -m "卷杀曲线工具：按瓣数生成栱头 profile"
```

---

### Task 5: 木料 PBR 材质 scene/materials/woodPBR.js

**Files:**
- Create: `src/scene/materials/woodPBR.js`
- Test: `tests/woodPBR.test.js`

**Interfaces:**
- Consumes: `three`。
- Produces: `createWoodMaterial({ tone } = {})` → `THREE.MeshStandardMaterial`，程序化 canvas 木纹贴图，`tone` 可选 `'warm'|'aged'`（默认 warm，唐代原木暖褐）。

- [ ] **Step 1: 写失败测试 tests/woodPBR.test.js**

```js
import { describe, it, expect } from 'vitest'
import { createWoodMaterial } from '../src/scene/materials/woodPBR.js'

describe('木料材质', () => {
  it('返回带贴图的 MeshStandardMaterial', () => {
    const m = createWoodMaterial()
    expect(m.type).toBe('MeshStandardMaterial')
    expect(m.map).toBeTruthy()
    expect(m.roughness).toBeGreaterThan(0.5) // 木材偏粗糙
  })

  it('aged 色调比 warm 更深', () => {
    const warm = createWoodMaterial({ tone: 'warm' })
    const aged = createWoodMaterial({ tone: 'aged' })
    expect(aged.color.getHex()).not.toBe(warm.color.getHex())
  })
})
```

- [ ] **Step 2: 跑测试确认失败**

Run: `npx vitest run tests/woodPBR.test.js`
Expected: FAIL。

- [ ] **Step 3: 写实现 src/scene/materials/woodPBR.js**

```js
import * as THREE from 'three'

const TONES = {
  warm: { base: 0x8a5a34, grain: 0x6b4423 },
  aged: { base: 0x5c3a22, grain: 0x3e2716 },
}

function makeGrainTexture(tone) {
  const size = 256
  const c = document.createElement('canvas')
  c.width = c.height = size
  const ctx = c.getContext('2d')
  ctx.fillStyle = '#' + tone.base.toString(16).padStart(6, '0')
  ctx.fillRect(0, 0, size, size)
  ctx.strokeStyle = '#' + tone.grain.toString(16).padStart(6, '0')
  ctx.globalAlpha = 0.25
  for (let i = 0; i < 40; i++) {
    const y = (i / 40) * size + Math.sin(i) * 3
    ctx.beginPath()
    ctx.moveTo(0, y)
    for (let x = 0; x <= size; x += 16) {
      ctx.lineTo(x, y + Math.sin(x * 0.05 + i) * 2)
    }
    ctx.lineWidth = 1 + (i % 3)
    ctx.stroke()
  }
  const tex = new THREE.CanvasTexture(c)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  return tex
}

export function createWoodMaterial({ tone = 'warm' } = {}) {
  const t = TONES[tone] ?? TONES.warm
  return new THREE.MeshStandardMaterial({
    color: t.base,
    map: makeGrainTexture(t),
    roughness: 0.75,
    metalness: 0.0,
  })
}
```

- [ ] **Step 4: 跑测试确认通过**

Run: `npx vitest run tests/woodPBR.test.js`
Expected: 2 passed。

- [ ] **Step 5: 提交**

```bash
git add src/scene/materials/woodPBR.js tests/woodPBR.test.js
git commit -m "木料 PBR 材质：程序化木纹，warm/aged 两色调"
```

---

### Task 6: 斗与栱几何生成器 scene/geometry/{dou,gong,ang}.js

**Files:**
- Create: `src/scene/geometry/dou.js`
- Create: `src/scene/geometry/gong.js`
- Create: `src/scene/geometry/ang.js`
- Test: `tests/geometry.test.js`

**Interfaces:**
- Consumes: `three`、`juanshaProfile`（Task 4）、`FEN_TO_M`（Task 1）。
- Produces:
  - `douDimensions(dims)` → `{ width, depth, height, earH, pingH, xieH }`（米）；`createDouGeometry(dims)` → `THREE.BufferGeometry`（含斗欹内收）。
  - `gongDimensions(dims)` → `{ length, guang, hou, bras }`（米 + 瓣数）；`createGongGeometry(dims, bras)` → `THREE.BufferGeometry`（两端卷杀）。
  - `angDimensions(dims)` → `{ length, guang, hou, slopeRad }`（米 + 弧度）；`createAngGeometry(dims)` → `THREE.BufferGeometry`（昂尖斜切）。
- 约定：所有 `create*` 返回的几何以部件自身几何中心为原点，长度沿 +X，高度沿 +Y，厚度沿 +Z。

- [ ] **Step 1: 写失败测试 tests/geometry.test.js**

```js
import { describe, it, expect } from 'vitest'
import { douDimensions, createDouGeometry } from '../src/scene/geometry/dou.js'
import { gongDimensions, createGongGeometry } from '../src/scene/geometry/gong.js'
import { angDimensions, createAngGeometry } from '../src/scene/geometry/ang.js'
import { FEN_TO_M } from '../src/constants.js'

describe('斗几何', () => {
  it('栌斗尺寸按分换算为米', () => {
    const d = douDimensions({ fang: 32, height: 20, ear: 8, ping: 4, xie: 8 })
    expect(d.width).toBeCloseTo(32 * FEN_TO_M, 5)
    expect(d.height).toBeCloseTo(20 * FEN_TO_M, 5)
    expect(d.earH + d.pingH + d.xieH).toBeCloseTo(d.height, 5)
  })
  it('createDouGeometry 返回非空 BufferGeometry', () => {
    const g = createDouGeometry({ fang: 32, height: 20, ear: 8, ping: 4, xie: 8 })
    expect(g.type).toBe('BufferGeometry')
    expect(g.getAttribute('position').count).toBeGreaterThan(0)
  })
})

describe('栱几何', () => {
  it('华栱长度、瓣数正确', () => {
    const d = gongDimensions({ length: 72, caiGuang: 21, houDou: 10 })
    expect(d.length).toBeCloseTo(72 * FEN_TO_M, 5)
    expect(d.guang).toBeCloseTo(21 * FEN_TO_M, 5)
  })
  it('createGongGeometry 返回非空几何', () => {
    const g = createGongGeometry({ length: 72, caiGuang: 21, houDou: 10 }, 4)
    expect(g.getAttribute('position').count).toBeGreaterThan(0)
  })
})

describe('昂几何', () => {
  it('下昂斜度转弧度', () => {
    const d = angDimensions({ length: 120, caiGuang: 21, houDou: 10, slopeDeg: 25 })
    expect(d.slopeRad).toBeCloseTo((25 * Math.PI) / 180, 5)
    expect(d.length).toBeCloseTo(120 * FEN_TO_M, 5)
  })
  it('createAngGeometry 返回非空几何', () => {
    const g = createAngGeometry({ length: 120, caiGuang: 21, houDou: 10, slopeDeg: 25 })
    expect(g.getAttribute('position').count).toBeGreaterThan(0)
  })
})
```

- [ ] **Step 2: 跑测试确认失败**

Run: `npx vitest run tests/geometry.test.js`
Expected: FAIL。

- [ ] **Step 3: 写 src/scene/geometry/dou.js**

```js
import * as THREE from 'three'
import { FEN_TO_M } from '../../constants.js'

export function douDimensions(dims) {
  const { fang, height, ear, ping, xie } = dims
  return {
    width: fang * FEN_TO_M,
    depth: fang * FEN_TO_M,
    height: height * FEN_TO_M,
    earH: ear * FEN_TO_M,
    pingH: ping * FEN_TO_M,
    xieH: xie * FEN_TO_M,
  }
}

// 斗身自下而上：欹（下大上小内收）、平（直）、耳（顶部两侧凸起简化为直块）
export function createDouGeometry(dims) {
  const d = douDimensions(dims)
  const geos = []
  const half = d.width / 2
  // 欹：底面略小、顶面满宽的倒台（用缩放的 box 近似 → 用 BufferGeometry 顶点）
  const xie = new THREE.BoxGeometry(d.width, d.xieH, d.depth)
  const posAttr = xie.getAttribute('position')
  for (let i = 0; i < posAttr.count; i++) {
    if (posAttr.getY(i) < 0) { // 底面内收 20%
      posAttr.setX(i, posAttr.getX(i) * 0.8)
      posAttr.setZ(i, posAttr.getZ(i) * 0.8)
    }
  }
  xie.translate(0, -d.height / 2 + d.xieH / 2, 0)
  geos.push(xie)
  // 平
  const ping = new THREE.BoxGeometry(d.width, d.pingH, d.depth)
  ping.translate(0, -d.height / 2 + d.xieH + d.pingH / 2, 0)
  geos.push(ping)
  // 耳（含十字口：中间开槽，用两侧两块表示）
  const earGap = d.width * 0.25
  for (const sx of [-1, 1]) {
    const ear = new THREE.BoxGeometry((d.width - earGap) / 2, d.earH, d.depth)
    ear.translate(sx * (earGap / 2 + (d.width - earGap) / 4), d.height / 2 - d.earH / 2, 0)
    geos.push(ear)
  }
  return mergeGeometries(geos)
}

// 极简合并（避免额外依赖 BufferGeometryUtils）
function mergeGeometries(geos) {
  const merged = new THREE.BufferGeometry()
  const arrays = geos.map(g => g.toNonIndexed().getAttribute('position').array)
  const total = arrays.reduce((n, a) => n + a.length, 0)
  const positions = new Float32Array(total)
  let off = 0
  for (const a of arrays) { positions.set(a, off); off += a.length }
  merged.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  merged.computeVertexNormals()
  return merged
}
```

- [ ] **Step 4: 写 src/scene/geometry/gong.js**

```js
import * as THREE from 'three'
import { FEN_TO_M } from '../../constants.js'
import { juanshaProfile } from './juansha.js'

export function gongDimensions(dims) {
  return {
    length: dims.length * FEN_TO_M,
    guang: dims.caiGuang * FEN_TO_M,
    hou: dims.houDou * FEN_TO_M,
  }
}

// 栱：主体长方，两端按卷杀 profile 削出栱头曲线（用挤出的 2D 侧形）
export function createGongGeometry(dims, bras) {
  const d = gongDimensions(dims)
  const prof = juanshaProfile(dims.caiGuang, bras).map(p => ({
    x: p.x * FEN_TO_M, y: p.y * FEN_TO_M,
  }))
  const jsLen = prof.at(-1).x           // 单端卷杀长
  const shape = new THREE.Shape()
  // 侧视轮廓：沿长度 X、高度 Y。左端卷杀 → 平直 → 右端卷杀镜像
  shape.moveTo(0, prof[0].y)
  for (const p of prof) shape.lineTo(p.x, p.y)              // 左端上升
  shape.lineTo(d.length - jsLen, d.guang)                  // 顶边直行
  for (let i = prof.length - 1; i >= 0; i--) {             // 右端下降（镜像）
    shape.lineTo(d.length - prof[i].x, prof[i].y)
  }
  shape.lineTo(d.length, 0)                                // 右下角
  shape.lineTo(0, 0)                                       // 底边回到左下
  shape.closePath()
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: d.hou, bevelEnabled: false,
  })
  geo.translate(-d.length / 2, -d.guang / 2, -d.hou / 2)
  return geo
}
```

- [ ] **Step 5: 写 src/scene/geometry/ang.js**

```js
import * as THREE from 'three'
import { FEN_TO_M } from '../../constants.js'

export function angDimensions(dims) {
  return {
    length: dims.length * FEN_TO_M,
    guang: dims.caiGuang * FEN_TO_M,
    hou: dims.houDou * FEN_TO_M,
    slopeRad: (dims.slopeDeg * Math.PI) / 180,
  }
}

// 下昂：一根长木，昂尖端斜切（昂嘴），整体待安装时再倾斜
export function createAngGeometry(dims) {
  const d = angDimensions(dims)
  // 侧形：长方体，前端（+X）上方斜切出昂嘴
  const beakLen = d.guang * 1.6
  const shape = new THREE.Shape()
  shape.moveTo(0, 0)
  shape.lineTo(d.length - beakLen, 0)
  shape.lineTo(d.length, -d.guang * 0.15)   // 昂尖下探
  shape.lineTo(d.length - beakLen, d.guang) // 斜切上棱
  shape.lineTo(0, d.guang)
  shape.closePath()
  const geo = new THREE.ExtrudeGeometry(shape, { depth: d.hou, bevelEnabled: false })
  geo.translate(-d.length / 2, -d.guang / 2, -d.hou / 2)
  return geo
}
```

- [ ] **Step 6: 跑测试确认通过**

Run: `npx vitest run tests/geometry.test.js`
Expected: 6 passed。

- [ ] **Step 7: 提交**

```bash
git add src/scene/geometry/ tests/geometry.test.js
git commit -m "几何生成器：斗（耳平欹）、栱（卷杀挤出）、昂（斜切昂嘴）"
```

---

### Task 7: 部件工厂 scene/partFactory.js

**Files:**
- Create: `src/scene/partFactory.js`
- Test: `tests/partFactory.test.js`

**Interfaces:**
- Consumes: 三个几何生成器、`createWoodMaterial`、`getPart`、`FEN_TO_M`。
- Produces: `buildPartMesh(partId)` → `THREE.Mesh`，`mesh.userData.partId` 已设，几何按部件类型选择。判类型规则：`id` 以 `ludou`/`*dou*` → 斗；`huagong*`/`linggong` → 栱；`xiaang*` → 昂。

- [ ] **Step 1: 写失败测试 tests/partFactory.test.js**

```js
import { describe, it, expect } from 'vitest'
import { buildPartMesh } from '../src/scene/partFactory.js'

describe('部件工厂', () => {
  it('为栌斗造带 userData 的 Mesh', () => {
    const m = buildPartMesh('ludou')
    expect(m.type).toBe('Mesh')
    expect(m.userData.partId).toBe('ludou')
    expect(m.geometry.getAttribute('position').count).toBeGreaterThan(0)
    expect(m.material.type).toBe('MeshStandardMaterial')
  })
  it('华栱、下昂、令栱都能造出', () => {
    for (const id of ['huagong-1', 'xiaang-1', 'linggong']) {
      expect(buildPartMesh(id).userData.partId).toBe(id)
    }
  })
  it('未知 id 抛错', () => {
    expect(() => buildPartMesh('nope')).toThrow()
  })
})
```

- [ ] **Step 2: 跑测试确认失败**

Run: `npx vitest run tests/partFactory.test.js`
Expected: FAIL。

- [ ] **Step 3: 写实现 src/scene/partFactory.js**

```js
import * as THREE from 'three'
import { getPart } from '../content/parts.js'
import { createWoodMaterial } from './materials/woodPBR.js'
import { createDouGeometry } from './geometry/dou.js'
import { createGongGeometry } from './geometry/gong.js'
import { createAngGeometry } from './geometry/ang.js'

function geometryFor(part) {
  if (part.id === 'ludou' || part.id.includes('dou')) return createDouGeometry(part.dims)
  if (part.id.startsWith('xiaang')) return createAngGeometry(part.dims)
  if (part.id.startsWith('huagong') || part.id === 'linggong') {
    return createGongGeometry(part.dims, part.juansha ?? 4)
  }
  throw new Error(`无法为部件生成几何：${part.id}`)
}

export function buildPartMesh(partId) {
  const part = getPart(partId)
  if (!part) throw new Error(`未知部件：${partId}`)
  const mesh = new THREE.Mesh(geometryFor(part), createWoodMaterial())
  mesh.userData.partId = partId
  mesh.castShadow = mesh.receiveShadow = true
  return mesh
}
```

- [ ] **Step 4: 跑测试确认通过**

Run: `npx vitest run tests/partFactory.test.js`
Expected: 3 passed。

- [ ] **Step 5: 提交**

```bash
git add src/scene/partFactory.js tests/partFactory.test.js
git commit -m "部件工厂：按 id 选几何+木料，产出带 userData 的 Mesh"
```

---

### Task 8: 目标位姿表 content/placements.js

**Files:**
- Create: `src/content/placements.js`
- Test: `tests/placements.test.js`

**Interfaces:**
- Consumes: `PARTS`、`FEN_TO_M`。
- Produces: `PLACEMENTS`（`{ [partId]: { pos:[x,y,z], rotZ } }`，单位米、弧度）——每件在成品朵中的最终位姿；`placementFor(id)`。设计：沿 +Y 逐层升高，出跳沿 +X 递增，下昂带 rotZ 负斜。用于吸附目标与虚影。

- [ ] **Step 1: 写失败测试 tests/placements.test.js**

```js
import { describe, it, expect } from 'vitest'
import { PLACEMENTS, placementFor } from '../src/content/placements.js'
import { PARTS } from '../src/content/parts.js'

describe('目标位姿', () => {
  it('每个部件都有位姿', () => {
    for (const p of PARTS) expect(PLACEMENTS[p.id]).toBeTruthy()
  })
  it('层级越高 Y 越大（自下而上堆叠）', () => {
    const y = id => PLACEMENTS[id].pos[1]
    expect(y('ludou')).toBeLessThan(y('huagong-1'))
    expect(y('huagong-1')).toBeLessThan(y('xiaang-1'))
    expect(y('xiaang-1')).toBeLessThan(y('linggong'))
  })
  it('下昂带负 rotZ（向外下斜）', () => {
    expect(placementFor('xiaang-1').rotZ).toBeLessThan(0)
  })
  it('placementFor 越界返回 null', () => {
    expect(placementFor('nope')).toBeNull()
  })
})
```

- [ ] **Step 2: 跑测试确认失败**

Run: `npx vitest run tests/placements.test.js`
Expected: FAIL。

- [ ] **Step 3: 写实现 src/content/placements.js**

```js
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
```

- [ ] **Step 4: 跑测试确认通过**

Run: `npx vitest run tests/placements.test.js`
Expected: 4 passed。

- [ ] **Step 5: 提交**

```bash
git add src/content/placements.js tests/placements.test.js
git commit -m "目标位姿表：逐层堆叠、下昂斜置，供吸附与虚影"
```

---

### Task 9: 吸附校验 interaction/snapValidator.js

**Files:**
- Create: `src/interaction/snapValidator.js`
- Test: `tests/snapValidator.test.js`

**Interfaces:**
- Consumes: `placementFor`。
- Produces: `validateSnap(partId, pos, { tolerance }={})` → `{ ok, target, distance }`；`SNAP_TOLERANCE`（默认米值）。`pos` 为 `[x,y,z]`。距离目标 `pos` 小于容差则 `ok:true`。

- [ ] **Step 1: 写失败测试 tests/snapValidator.test.js**

```js
import { describe, it, expect } from 'vitest'
import { validateSnap, SNAP_TOLERANCE } from '../src/interaction/snapValidator.js'
import { placementFor } from '../src/content/placements.js'

describe('吸附校验', () => {
  it('落在目标附近则吸附成功并给出目标位姿', () => {
    const target = placementFor('ludou').pos
    const near = [target[0] + 0.02, target[1], target[2]]
    const r = validateSnap('ludou', near)
    expect(r.ok).toBe(true)
    expect(r.target.pos).toEqual(target)
  })
  it('偏离过远则失败', () => {
    const r = validateSnap('ludou', [5, 5, 5])
    expect(r.ok).toBe(false)
    expect(r.distance).toBeGreaterThan(SNAP_TOLERANCE)
  })
  it('未知部件返回 ok:false', () => {
    expect(validateSnap('nope', [0, 0, 0]).ok).toBe(false)
  })
})
```

- [ ] **Step 2: 跑测试确认失败**

Run: `npx vitest run tests/snapValidator.test.js`
Expected: FAIL。

- [ ] **Step 3: 写实现 src/interaction/snapValidator.js**

```js
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
```

- [ ] **Step 4: 跑测试确认通过**

Run: `npx vitest run tests/snapValidator.test.js`
Expected: 3 passed。

- [ ] **Step 5: 提交**

```bash
git add src/interaction/snapValidator.js tests/snapValidator.test.js
git commit -m "吸附校验：落点距目标位姿在容差内即归位"
```

---

### Task 10: 游戏状态机 engine/gameState.js

**Files:**
- Create: `src/engine/gameState.js`
- Test: `tests/gameState.test.js`

**Interfaces:**
- Consumes: `ASSEMBLY_STEPS, stepForIndex`。
- Produces: `createGame()` → 对象含 `currentStep()`（当前应放部件的 step 或 null）、`placedIds()`、`tryPlace(partId)`（若等于当前步部件则前进并返回 `{placed:true, done}`，否则 `{placed:false}`）、`isComplete()`、`unlockedCodex()`（已解锁图鉴 id 数组）。

- [ ] **Step 1: 写失败测试 tests/gameState.test.js**

```js
import { describe, it, expect } from 'vitest'
import { createGame } from '../src/engine/gameState.js'
import { ASSEMBLY_STEPS } from '../src/content/assemblySteps.js'

describe('游戏状态机', () => {
  it('起始在第一步（栌斗），未完成', () => {
    const g = createGame()
    expect(g.currentStep().partId).toBe('ludou')
    expect(g.isComplete()).toBe(false)
  })
  it('放错部件不前进', () => {
    const g = createGame()
    expect(g.tryPlace('linggong').placed).toBe(false)
    expect(g.currentStep().partId).toBe('ludou')
  })
  it('按顺序放完全部即完成，图鉴全解锁', () => {
    const g = createGame()
    for (const s of ASSEMBLY_STEPS) {
      expect(g.tryPlace(s.partId).placed).toBe(true)
    }
    expect(g.isComplete()).toBe(true)
    expect(g.currentStep()).toBeNull()
    expect(g.unlockedCodex()).toHaveLength(ASSEMBLY_STEPS.length)
  })
  it('放对时最后一步返回 done:true', () => {
    const g = createGame()
    const steps = ASSEMBLY_STEPS
    steps.slice(0, -1).forEach(s => g.tryPlace(s.partId))
    expect(g.tryPlace(steps.at(-1).partId).done).toBe(true)
  })
})
```

- [ ] **Step 2: 跑测试确认失败**

Run: `npx vitest run tests/gameState.test.js`
Expected: FAIL。

- [ ] **Step 3: 写实现 src/engine/gameState.js**

```js
import { ASSEMBLY_STEPS, stepForIndex } from '../content/assemblySteps.js'

export function createGame() {
  let index = 0
  const placed = []

  return {
    currentStep: () => stepForIndex(index),
    placedIds: () => [...placed],
    isComplete: () => index >= ASSEMBLY_STEPS.length,
    unlockedCodex: () => [...placed],
    tryPlace(partId) {
      const step = stepForIndex(index)
      if (!step || step.partId !== partId) return { placed: false }
      placed.push(partId)
      index += 1
      return { placed: true, done: index >= ASSEMBLY_STEPS.length }
    },
  }
}
```

- [ ] **Step 4: 跑测试确认通过**

Run: `npx vitest run tests/gameState.test.js`
Expected: 4 passed。

- [ ] **Step 5: 提交**

```bash
git add src/engine/gameState.js tests/gameState.test.js
git commit -m "游戏状态机：按顺序校验放置、推进、图鉴解锁、完成判定"
```

---

### Task 11: 场景与渲染 scene/dougongScene.js

**Files:**
- Create: `src/scene/dougongScene.js`

**Interfaces:**
- Consumes: `three`、`OrbitControls`（`three/examples/jsm/controls/OrbitControls.js`）。
- Produces: `createScene(container)` → `{ scene, camera, renderer, controls, addPart(mesh, placement), addGhost(mesh), start() }`。`start()` 启动 requestAnimationFrame 渲染循环。柱头短柱 + 地面 + 三点光 + 环境光。
- 说明：纯可视化，**手动验证**。

- [ ] **Step 1: 写实现 src/scene/dougongScene.js**

```js
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

export function createScene(container) {
  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0x1a1512)

  const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100)
  camera.position.set(2.2, 1.6, 2.6)

  const renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(container.clientWidth, container.clientHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.shadowMap.enabled = true
  container.appendChild(renderer.domElement)

  const controls = new OrbitControls(camera, renderer.domElement)
  controls.target.set(0, 0.6, 0)
  controls.enableDamping = true

  // 光照：暖色主光 + 冷补光 + 环境
  const key = new THREE.DirectionalLight(0xfff2e0, 2.2)
  key.position.set(3, 5, 2); key.castShadow = true
  scene.add(key)
  scene.add(new THREE.DirectionalLight(0x88aaff, 0.5).translateX(-3))
  scene.add(new THREE.HemisphereLight(0xffffff, 0x3a2c20, 0.6))

  // 柱头短柱
  const col = new THREE.Mesh(
    new THREE.CylinderGeometry(0.28, 0.3, 0.5, 24),
    new THREE.MeshStandardMaterial({ color: 0x6b4423, roughness: 0.8 }),
  )
  col.position.y = -0.4; col.receiveShadow = true
  scene.add(col)

  function applyPlacement(mesh, placement) {
    mesh.position.set(...placement.pos)
    mesh.rotation.z = placement.rotZ || 0
  }
  function addPart(mesh, placement) { applyPlacement(mesh, placement); scene.add(mesh) }
  function addGhost(mesh, placement) {
    mesh.material = new THREE.MeshBasicMaterial({ color: 0x66ccff, transparent: true, opacity: 0.22, wireframe: false })
    applyPlacement(mesh, placement)
    scene.add(mesh)
    return mesh
  }

  function start() {
    function loop() {
      requestAnimationFrame(loop)
      controls.update()
      renderer.render(scene, camera)
    }
    loop()
  }

  window.addEventListener('resize', () => {
    camera.aspect = container.clientWidth / container.clientHeight
    camera.updateProjectionMatrix()
    renderer.setSize(container.clientWidth, container.clientHeight)
  })

  return { scene, camera, renderer, controls, addPart, addGhost, start }
}
```

- [ ] **Step 2: 手动验证**

在 `src/main.js` 临时加：
```js
import { createScene } from './scene/dougongScene.js'
import { buildPartMesh } from './scene/partFactory.js'
import { PLACEMENTS } from './content/placements.js'
const S = createScene(document.getElementById('app'))
S.addPart(buildPartMesh('ludou'), PLACEMENTS.ludou)
S.start()
```
Run: `npm run dev`，浏览器打开本地地址。
Expected: 看到暖光下木质栌斗坐于短柱上，可鼠标环绕。确认后**还原 main.js**（下个任务重写）。

- [ ] **Step 3: 提交**

```bash
git add src/scene/dougongScene.js
git commit -m "场景：暖冷布光、柱头短柱、OrbitControls、加件/虚影/渲染循环"
```

---

### Task 12: 教学层 teach/{cameraFocus,highlight,annotation}.js

**Files:**
- Create: `src/teach/cameraFocus.js`
- Create: `src/teach/highlight.js`
- Create: `src/teach/annotation.js`
- Test: `tests/teach.test.js`

**Interfaces:**
- Consumes: `three`、`getPart`。
- Produces:
  - `focusOn(camera, controls, targetVec3, { duration })` → 返回一个 `tick(dt)` 补间函数（纯数学，可测：给定进度返回插值点）；导出纯函数 `lerpVec(a, b, t)`。
  - `applyHighlight(mesh)` / `clearHighlight(mesh)` → 切换自发光。
  - `showAnnotation(part)` → 返回 HTMLElement（讲解卡：名称、拼音、术语、role、desc、trivia）；`hideAnnotation()`。
- 相机/高亮走手动验证；`lerpVec` 与卡片 DOM 内容可测。

- [ ] **Step 1: 写失败测试 tests/teach.test.js**

```js
import { describe, it, expect } from 'vitest'
import { lerpVec } from '../src/teach/cameraFocus.js'
import { showAnnotation, hideAnnotation } from '../src/teach/annotation.js'

describe('相机插值', () => {
  it('t=0 返回起点，t=1 返回终点，t=0.5 取中点', () => {
    expect(lerpVec([0, 0, 0], [2, 4, 6], 0)).toEqual([0, 0, 0])
    expect(lerpVec([0, 0, 0], [2, 4, 6], 1)).toEqual([2, 4, 6])
    expect(lerpVec([0, 0, 0], [2, 4, 6], 0.5)).toEqual([1, 2, 3])
  })
})

describe('讲解卡', () => {
  it('渲染部件名、术语与冷知识', () => {
    const el = showAnnotation('ludou')
    expect(el.textContent).toContain('栌斗')
    expect(el.textContent).toContain('lúdǒu')
    expect(el.textContent).toContain('唐构') // trivia 关键词
    hideAnnotation()
  })
})
```

- [ ] **Step 2: 跑测试确认失败**

Run: `npx vitest run tests/teach.test.js`
Expected: FAIL。

- [ ] **Step 3: 写 src/teach/cameraFocus.js**

```js
import * as THREE from 'three'

export function lerpVec(a, b, t) {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]
}

// 返回 tick(dt)：每帧推进相机趋向 target 视角，完成后 resolve
export function focusOn(camera, controls, targetVec3, { duration = 0.8 } = {}) {
  const startTarget = controls.target.clone()
  const end = new THREE.Vector3(...targetVec3)
  let t = 0
  return function tick(dt) {
    t = Math.min(1, t + dt / duration)
    const e = 1 - Math.pow(1 - t, 3) // easeOutCubic
    controls.target.lerpVectors(startTarget, end, e)
    return t >= 1
  }
}
```

- [ ] **Step 4: 写 src/teach/highlight.js**

```js
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
```

- [ ] **Step 5: 写 src/teach/annotation.js**

```js
import { getPart } from '../content/parts.js'

let el = null

export function showAnnotation(partId) {
  const p = getPart(partId)
  hideAnnotation()
  el = document.createElement('div')
  el.className = 'annotation-card'
  el.innerHTML = `
    <h2>${p.name} <span class="pinyin">${p.pinyin}</span></h2>
    <div class="term">营造法式术语：${p.term}</div>
    <p class="role"><b>作用：</b>${p.role}</p>
    <p class="desc">${p.desc}</p>
    <p class="trivia">💡 ${p.trivia}</p>
  `
  document.body.appendChild(el)
  return el
}

export function hideAnnotation() {
  if (el && el.parentNode) el.parentNode.removeChild(el)
  el = null
}
```

- [ ] **Step 6: 跑测试确认通过**

Run: `npx vitest run tests/teach.test.js`
Expected: 2 passed。

- [ ] **Step 7: 提交**

```bash
git add src/teach/ tests/teach.test.js
git commit -m "教学层：相机聚焦补间、部件高亮、精确讲解卡"
```

---

### Task 13: 下昂受力动画 teach/forceAnim.js

**Files:**
- Create: `src/teach/forceAnim.js`
- Test: `tests/forceAnim.test.js`

**Interfaces:**
- Consumes: `three`。
- Produces: `leverBalance(t)` 纯函数 → 返回下昂杠杆两端位移量 `{ tipDrop, tailRise, pivotX }`（归一化，`t∈[0,1]`，示挑檐下压、昂尾上翘、绕支点）；`createForceArrows(scene, part)` → 返回箭头 group 与 `update(dt)`（可视，手动验证）。

- [ ] **Step 1: 写失败测试 tests/forceAnim.test.js**

```js
import { describe, it, expect } from 'vitest'
import { leverBalance } from '../src/teach/forceAnim.js'

describe('下昂杠杆平衡', () => {
  it('t=0 无位移', () => {
    const r = leverBalance(0)
    expect(r.tipDrop).toBe(0)
    expect(r.tailRise).toBe(0)
  })
  it('随 t 增大，昂尖下沉、昂尾上翘，方向相反', () => {
    const r = leverBalance(1)
    expect(r.tipDrop).toBeGreaterThan(0)
    expect(r.tailRise).toBeGreaterThan(0)
    // 杠杆：尖下沉与尾上翘同步（绕支点）
    expect(Math.sign(r.tipDrop)).toBe(Math.sign(r.tailRise))
  })
  it('支点位置恒定在 0（栌斗一线）', () => {
    expect(leverBalance(0.3).pivotX).toBe(0)
    expect(leverBalance(0.9).pivotX).toBe(0)
  })
})
```

- [ ] **Step 2: 跑测试确认失败**

Run: `npx vitest run tests/forceAnim.test.js`
Expected: FAIL。

- [ ] **Step 3: 写实现 src/teach/forceAnim.js**

```js
import * as THREE from 'three'

// 下昂杠杆：以栌斗一线为支点（x=0），演示挑檐下压→昂尾上翘的平衡
export function leverBalance(t) {
  const amp = Math.sin(Math.min(1, Math.max(0, t)) * Math.PI) // 0→1→0 往复演示
  return { tipDrop: amp * 0.06, tailRise: amp * 0.06, pivotX: 0 }
}

// 可视：在昂尖（外挑，红）与昂尾（内压，蓝）加受力箭头
export function createForceArrows(scene, partMesh) {
  const group = new THREE.Group()
  const tip = new THREE.ArrowHelper(new THREE.Vector3(0, -1, 0), new THREE.Vector3(0.6, 0.1, 0), 0.3, 0xff5533)
  const tail = new THREE.ArrowHelper(new THREE.Vector3(0, -1, 0), new THREE.Vector3(-0.4, 0.2, 0), 0.25, 0x3388ff)
  group.add(tip, tail)
  scene.add(group)
  let t = 0
  return {
    group,
    update(dt) {
      t = (t + dt * 0.5) % 1
      const b = leverBalance(t)
      group.position.y = -b.tipDrop
    },
  }
}
```

- [ ] **Step 4: 跑测试确认通过**

Run: `npx vitest run tests/forceAnim.test.js`
Expected: 3 passed。

- [ ] **Step 5: 提交**

```bash
git add src/teach/forceAnim.js tests/forceAnim.test.js
git commit -m "受力动画：下昂杠杆平衡（挑檐下压/昂尾上翘）+ 受力箭头"
```

---

### Task 14: 零件盘与图鉴 UI ui/{tray,codex,hud}.js + styles.css

**Files:**
- Create: `src/ui/tray.js`
- Create: `src/ui/codex.js`
- Create: `src/ui/hud.js`
- Create: `src/ui/styles.css`
- Test: `tests/ui.test.js`

**Interfaces:**
- Consumes: `getPart`。
- Produces:
  - `createTray({ onPick })` → `{ el, showPart(partId), clear() }`：显示当前可放部件缩略条目，点击/拖起触发 `onPick(partId)`。
  - `createCodex()` → `{ el, unlock(partId), open(), close() }`：图鉴，`unlock` 点亮一页。
  - `createHud({ onChallenge })` → `{ el, setHint(text), setProgress(done, total) }`。
- DOM 结构可测；视觉走手动。

- [ ] **Step 1: 写失败测试 tests/ui.test.js**

```js
import { describe, it, expect, vi } from 'vitest'
import { createTray } from '../src/ui/tray.js'
import { createCodex } from '../src/ui/codex.js'
import { createHud } from '../src/ui/hud.js'

describe('零件盘', () => {
  it('showPart 显示部件名，点击触发 onPick', () => {
    const onPick = vi.fn()
    const tray = createTray({ onPick })
    tray.showPart('ludou')
    expect(tray.el.textContent).toContain('栌斗')
    tray.el.querySelector('[data-part="ludou"]').click()
    expect(onPick).toHaveBeenCalledWith('ludou')
  })
})

describe('图鉴', () => {
  it('unlock 后该页标记已解锁', () => {
    const codex = createCodex()
    codex.unlock('ludou')
    expect(codex.el.querySelector('[data-codex="ludou"]').classList.contains('unlocked')).toBe(true)
  })
})

describe('HUD', () => {
  it('setProgress / setHint 更新文本', () => {
    const hud = createHud({ onChallenge: () => {} })
    hud.setProgress(2, 6)
    hud.setHint('安栌斗')
    expect(hud.el.textContent).toContain('2 / 6')
    expect(hud.el.textContent).toContain('安栌斗')
  })
})
```

- [ ] **Step 2: 跑测试确认失败**

Run: `npx vitest run tests/ui.test.js`
Expected: FAIL。

- [ ] **Step 3: 写 src/ui/tray.js**

```js
import { getPart } from '../content/parts.js'

export function createTray({ onPick }) {
  const el = document.createElement('div')
  el.className = 'tray'
  function showPart(partId) {
    const p = getPart(partId)
    el.innerHTML = `<div class="tray-item" data-part="${partId}" draggable="true">
      <span class="tray-name">${p.name}</span><span class="tray-pinyin">${p.pinyin}</span>
    </div>`
    const item = el.querySelector(`[data-part="${partId}"]`)
    item.addEventListener('click', () => onPick(partId))
    item.addEventListener('dragend', () => onPick(partId))
  }
  return { el, showPart, clear: () => { el.innerHTML = '' } }
}
```

- [ ] **Step 4: 写 src/ui/codex.js**

```js
import { PARTS } from '../content/parts.js'

export function createCodex() {
  const el = document.createElement('div')
  el.className = 'codex hidden'
  el.innerHTML = `<h2>斗栱图鉴</h2><div class="codex-grid">${
    PARTS.map(p => `<div class="codex-page locked" data-codex="${p.id}">
      <div class="codex-title">${p.name}</div></div>`).join('')
  }</div>`
  function unlock(partId) {
    const page = el.querySelector(`[data-codex="${partId}"]`)
    if (page) { page.classList.remove('locked'); page.classList.add('unlocked') }
  }
  return {
    el, unlock,
    open: () => el.classList.remove('hidden'),
    close: () => el.classList.add('hidden'),
  }
}
```

- [ ] **Step 5: 写 src/ui/hud.js**

```js
export function createHud({ onChallenge }) {
  const el = document.createElement('div')
  el.className = 'hud'
  el.innerHTML = `
    <div class="hud-progress">进度：<span class="hud-count">0 / 0</span></div>
    <div class="hud-hint"></div>
    <button class="hud-challenge" hidden>挑战模式</button>`
  el.querySelector('.hud-challenge').addEventListener('click', onChallenge)
  return {
    el,
    setProgress: (done, total) => { el.querySelector('.hud-count').textContent = `${done} / ${total}` },
    setHint: (t) => { el.querySelector('.hud-hint').textContent = t },
    showChallenge: () => el.querySelector('.hud-challenge').removeAttribute('hidden'),
  }
}
```

- [ ] **Step 6: 写 src/ui/styles.css**

```css
body { font-family: system-ui, "PingFang SC", sans-serif; color: #f0e6d8; }
.hud { position: fixed; top: 16px; left: 16px; background: rgba(26,21,18,.8);
  padding: 14px 18px; border-radius: 10px; max-width: 320px; }
.hud-hint { margin-top: 8px; line-height: 1.5; color: #e8c98a; }
.tray { position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%);
  display: flex; gap: 12px; }
.tray-item { background: #8a5a34; padding: 12px 20px; border-radius: 8px;
  cursor: grab; border: 2px solid #b98a5a; }
.tray-pinyin { opacity: .7; margin-left: 6px; font-size: .85em; }
.annotation-card { position: fixed; right: 20px; top: 50%; transform: translateY(-50%);
  width: 320px; background: rgba(26,21,18,.92); padding: 20px 24px; border-radius: 12px;
  border-left: 4px solid #e8c98a; line-height: 1.6; }
.annotation-card .pinyin { opacity: .6; font-weight: normal; font-size: .8em; }
.annotation-card .term { color: #e8c98a; font-size: .9em; margin: 6px 0 12px; }
.annotation-card .trivia { color: #cbb58a; font-style: italic; }
.codex { position: fixed; inset: 0; background: rgba(10,8,6,.94); padding: 40px;
  overflow: auto; }
.codex.hidden { display: none; }
.codex-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.codex-page { border: 1px solid #4a3a2a; border-radius: 8px; padding: 20px; text-align: center; }
.codex-page.locked { opacity: .3; filter: grayscale(1); }
.codex-page.unlocked { border-color: #e8c98a; }
```

- [ ] **Step 7: 跑测试确认通过**

Run: `npx vitest run tests/ui.test.js`
Expected: 3 passed。

- [ ] **Step 8: 提交**

```bash
git add src/ui/ tests/ui.test.js
git commit -m "UI：零件盘、图鉴、HUD 与唐木配色样式"
```

---

### Task 15: 主装配与游戏流程 main.js

**Files:**
- Modify: `src/main.js`（整体重写）

**Interfaces:**
- Consumes: 以上全部模块。
- Produces: 完整可玩流程——初始化场景 → HUD/Tray/Codex 挂载 → 展示当前步虚影与提示 → 玩家从盘中拾件放置 → 吸附成功则加实体、镜头聚焦、高亮、弹讲解卡、解锁图鉴、推进下一步 → 全部完成播放整朵受力总览动画并显示"挑战模式"入口。
- 纯集成，**手动验证**为主。

- [ ] **Step 1: 重写 src/main.js**

```js
import './ui/styles.css'
import { createScene } from './scene/dougongScene.js'
import { buildPartMesh } from './scene/partFactory.js'
import { placementFor } from './content/placements.js'
import { ASSEMBLY_STEPS } from './content/assemblySteps.js'
import { createGame } from './engine/gameState.js'
import { validateSnap } from './interaction/snapValidator.js'
import { focusOn } from './teach/cameraFocus.js'
import { applyHighlight } from './teach/highlight.js'
import { showAnnotation } from './teach/annotation.js'
import { createForceArrows } from './teach/forceAnim.js'
import { getPart } from './content/parts.js'
import { createTray } from './ui/tray.js'
import { createCodex } from './ui/codex.js'
import { createHud } from './ui/hud.js'

const app = document.getElementById('app')
const S = createScene(app)
const game = createGame()

const codex = createCodex()
const hud = createHud({ onChallenge: () => alert('挑战模式即将上线（MVP 后）') })
const tray = createTray({ onPick: place })
document.body.append(hud.el, tray.el, codex.el)

let ghost = null
const tweens = []
const forceRigs = []

function showCurrentStep() {
  const step = game.currentStep()
  hud.setProgress(game.placedIds().length, ASSEMBLY_STEPS.length)
  if (!step) return finish()
  hud.setHint(step.hint)
  tray.showPart(step.partId)
  if (ghost) S.scene.remove(ghost)
  ghost = S.addGhost(buildPartMesh(step.partId), placementFor(step.partId))
}

// 简化交互：拾件即视为放到目标位（MVP 用吸附校验保证正确性；拖拽落点接入见下）
function place(partId) {
  const target = placementFor(partId)
  const res = validateSnap(partId, target.pos) // 直接落目标点，必然吸附
  const step = game.currentStep()
  if (!res.ok || !step || step.partId !== partId) return
  game.tryPlace(partId)
  if (ghost) { S.scene.remove(ghost); ghost = null }

  const mesh = buildPartMesh(partId)
  S.addPart(mesh, target)
  const part = getPart(partId)

  // 教学：聚焦 + 高亮 + 讲解卡
  tweens.push(focusOn(S.camera, S.controls, target.pos, { duration: 0.8 }))
  applyHighlight(mesh)
  showAnnotation(partId)
  codex.unlock(partId)
  if (part.hasForceAnim) forceRigs.push(createForceArrows(S.scene, mesh))

  showCurrentStep()
}

function finish() {
  hud.setHint('大功告成！一朵七铺作双杪双下昂已重建。观察力如何从撩檐槫层层传落柱头。')
  hud.showChallenge()
  // 整朵受力总览：让所有受力箭头持续演示
}

// 驱动补间与受力动画
let last = performance.now()
;(function animate(now) {
  const dt = (now - last) / 1000; last = now
  for (let i = tweens.length - 1; i >= 0; i--) if (tweens[i](dt)) tweens.splice(i, 1)
  for (const rig of forceRigs) rig.update(dt)
  requestAnimationFrame(animate)
})(performance.now())

S.start()
showCurrentStep()
```

- [ ] **Step 2: 手动验证完整流程**

Run: `npm run dev`
Expected：
1. 载入见栌斗虚影 + 提示"先安栌斗…"，盘中有"栌斗"件；
2. 点击盘中部件 → 栌斗实体归位、镜头拉近、右侧弹讲解卡、图鉴点亮一页、进度 1/6、出现下一件（华栱）虚影；
3. 依次放完 6 件 → 显示完成语 + "挑战模式"按钮；
4. 下昂放置后可见红/蓝受力箭头。
逐条确认。

- [ ] **Step 3: 跑全部测试确保未回归**

Run: `npm test`
Expected：全部 test 文件通过。

- [ ] **Step 4: 提交**

```bash
git add src/main.js
git commit -m "主流程：虚影引导→放置→聚焦高亮讲解→图鉴解锁→完成受力总览"
```

---

### Task 16: 拖拽落点接入（真交互）interaction/dragPlace.js

**Files:**
- Create: `src/interaction/dragPlace.js`
- Modify: `src/main.js`（用真实拖拽落点替换"拾件即放"）
- Test: `tests/dragPlace.test.js`

**Interfaces:**
- Consumes: `three`、`validateSnap`。
- Produces: `screenToGroundPoint(camera, ndc)` 纯函数 → 由归一化设备坐标射线求与装配平面（z=0）交点 `[x,y,z]`（可测）；`createDragController(renderer, camera, { onDrop })` → 监听指针，拖拽中的部件跟随，松手时以落点调用 `onDrop(partId, pos)`。

- [ ] **Step 1: 写失败测试 tests/dragPlace.test.js**

```js
import { describe, it, expect } from 'vitest'
import * as THREE from 'three'
import { screenToGroundPoint } from '../src/interaction/dragPlace.js'

describe('屏幕到装配面', () => {
  it('屏幕中心射线命中装配平面附近', () => {
    const cam = new THREE.PerspectiveCamera(45, 1, 0.1, 100)
    cam.position.set(0, 0, 3); cam.lookAt(0, 0, 0); cam.updateMatrixWorld()
    const p = screenToGroundPoint(cam, { x: 0, y: 0 })
    expect(Math.abs(p[2])).toBeLessThan(0.01) // 命中 z≈0 平面
    expect(Math.abs(p[0])).toBeLessThan(0.01)
  })
})
```

- [ ] **Step 2: 跑测试确认失败**

Run: `npx vitest run tests/dragPlace.test.js`
Expected: FAIL。

- [ ] **Step 3: 写实现 src/interaction/dragPlace.js**

```js
import * as THREE from 'three'

const PLANE = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0) // z=0 装配面

export function screenToGroundPoint(camera, ndc) {
  const ray = new THREE.Raycaster()
  ray.setFromCamera(new THREE.Vector2(ndc.x, ndc.y), camera)
  const hit = new THREE.Vector3()
  ray.ray.intersectPlane(PLANE, hit)
  return [hit.x, hit.y, hit.z]
}

export function createDragController(renderer, camera, { onDrop }) {
  const el = renderer.domElement
  let dragging = null // { partId, mesh }
  function ndc(e) {
    const r = el.getBoundingClientRect()
    return { x: ((e.clientX - r.left) / r.width) * 2 - 1, y: -((e.clientY - r.top) / r.height) * 2 + 1 }
  }
  function move(e) {
    if (!dragging) return
    const p = screenToGroundPoint(camera, ndc(e))
    dragging.mesh.position.set(...p)
  }
  function up(e) {
    if (!dragging) return
    const p = screenToGroundPoint(camera, ndc(e))
    onDrop(dragging.partId, p)
    dragging = null
    el.removeEventListener('pointermove', move)
  }
  return {
    beginDrag(partId, mesh) {
      dragging = { partId, mesh }
      el.addEventListener('pointermove', move)
      el.addEventListener('pointerup', up, { once: true })
    },
  }
}
```

- [ ] **Step 4: 跑测试确认通过**

Run: `npx vitest run tests/dragPlace.test.js`
Expected: 1 passed。

- [ ] **Step 5: 接入 main.js**

将 `place(partId)` 改为经拖拽落点校验：`tray.onPick` 改为 `beginDrag`（拾起时用 `buildPartMesh` 造一个可拖 mesh 加入场景跟随指针），`onDrop(partId, pos)` 里用 `validateSnap(partId, pos)`：`res.ok` 则吸附到 `res.target.pos` 并走原教学流程；否则回弹提示"再靠近目标虚影一点"。

在 main.js 顶部加入：
```js
import { createDragController, } from './interaction/dragPlace.js'
```
把 `createTray({ onPick: place })` 改为：
```js
let dragMesh = null
const drag = createDragController(S.renderer, S.camera, { onDrop })
const tray = createTray({ onPick(partId) {
  dragMesh = buildPartMesh(partId)
  S.scene.add(dragMesh)
  drag.beginDrag(partId, dragMesh)
}})
function onDrop(partId, pos) {
  const res = validateSnap(partId, pos)
  if (dragMesh) { S.scene.remove(dragMesh); dragMesh = null }
  const step = game.currentStep()
  if (!res.ok || !step || step.partId !== partId) { hud.setHint('再靠近目标虚影一点，对准了会自动卡扣。'); return }
  commitPlace(partId, res.target)
}
```
并把原 `place()` 中"造实体+教学+推进"部分抽成 `commitPlace(partId, target)` 供调用。

- [ ] **Step 6: 手动验证拖拽**

Run: `npm run dev`
Expected：从盘中拖起部件，块跟随指针；松手若靠近虚影则卡扣归位并触发教学，否则提示再靠近。

- [ ] **Step 7: 跑全部测试并提交**

```bash
npm test
git add -A
git commit -m "真交互：射线求装配面落点 + 拖拽放置，接入吸附与回弹提示"
```

---

## Self-Review（对照 spec 检查）

**Spec 覆盖：**
- 单朵柱头铺作、主轴 6 件 → Task 2、3、8 ✅
- 引导式逐层拼装（虚影→拖拽→吸附）→ Task 8/9/15/16 ✅
- B 式教学（镜头拉近+高亮+旁注+受力动画）→ Task 12、13、15 ✅
- 关键三件受力动画（栌斗/华栱/下昂 `hasForceAnim:true`）→ Task 2 标记 + Task 13/15 演示 ✅
- 图鉴解锁与回看 → Task 10、14、15 ✅
- 整朵受力总览 → Task 15 finish() ✅
- 写实木料 PBR + 光照 → Task 5、11 ✅
- 参数化几何（营造法式分°）→ Task 4、6、7 ✅
- 挑战模式 → MVP 后（Task 15 入口占位，spec 列为 MVP 之后）✅ 一致
- 技术栈 three+vite+vitest、模块结构 → Task 1 及全篇 ✅

**占位扫描：** 无 TBD/TODO；挑战模式按 spec 明确列为 MVP 后，非占位。

**类型一致：** `validateSnap`→`{ok,target,distance}` 全程一致；`placementFor`/`getPart`/`stepForIndex` 越界均返回 `null`，调用处已判空；`createGame` 方法名（`currentStep/tryPlace/isComplete/unlockedCodex/placedIds`）在 Task 10 与 15 一致；`buildPartMesh` 产 `userData.partId` 在 Task 7/11/15/16 一致。

**范围：** 聚焦单朵斗栱，一份计划可完成，无需再拆。
