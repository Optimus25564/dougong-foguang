# 「受力·语境」讲解模式 设计

**Goal:** 让玩家在拼完整朵斗栱后，理解它在真实建筑里的**作用**——如何坐上柱头、如何与相邻柱/额枋连成一圈、如何层层挑出把深远屋檐之力传落到柱与地；并破除"斗栱嵌在墙里"的误解（唐构中墙只是柱间填充、不承重）。

**Trigger:** 拼完整朵后（`finish()`），HUD 出现第三个开关「受力·语境」（与「图鉴」「拆解图」并列）。点开进入该模式：收起零件盘/虚影/落点标记，镜头转到**正侧断面**视角，淡入建筑语境，启动分步受力导览。再点关闭退出、还原装配态。

## 组成

### 1. 建筑语境（一开间框架）— `src/scene/buildingContext.js`
示意化、低多边、哑光材质（明显区别于主角斗栱的木色），淡入淡出：
- **本柱**（z=0，斗栱所在柱）与**相邻柱**（z=+bay）——落到础石与地面。
- **阑额**：沿 Z 跨两柱头相连（佛光寺东大殿无普拍枋，栌斗直坐柱头——唐构判据，在讲解卡点出）。
- **屋面坡**：斜搭在撩檐槫上、向内上扬的一段椽+屋面板示意。
- **半透明墙板**：填在两柱之间（facade 面），自地面到阑额——直观回答"如何入墙壁"。

模块导出纯尺寸函数 `contextDimensions()`（返回米制尺寸对象，可测）+ 构建函数 `createBuildingContext()`（返回 `THREE.Group`，子件具名，可断言存在）。

### 2. 传力链数据 — `src/content/forcePath.js`（纯数据，可测）
有序节点数组，力自上而下。每个节点 `{ id, label, caption, at }`：`at` 为部件 id（端点由 `placementFor(at).pos` 解析）或显式 `point:[x,y,z]`（屋面荷载点、入地点）。导出 `forceNodes()` 返回解析出世界坐标的有序节点。

**6 步脚本：**
1. 屋面之重经椽汇到最外檐檩**撩檐槫**（`at: liaoyantuan`，力自上方压入）。
2. 撩檐槫坐在**令栱+替木**上，令栱把力横向摊给下面（`at: linggong`）。
3. **下昂是杠杆**：外端挑深远之檐、昂尾被屋架压住，以栌斗一线为支点——故能出檐近四米（`at: xiaang-1`）。
4. **华栱**层层内收，把外挑之力一跳跳收回柱心正上方（`at: huagong-1`）。
5. 全朵之力汇于**栌斗**，整块压到柱头（`at: ludou`）。
6. 柱顺直落力入**础石**；而墙只是柱间填充、毫不承重——木构"墙倒屋不塌"的底气（`point:` 柱脚入地点）。

### 3. 导览控制器 — `src/teach/forcePathTour.js`
消费 `forceNodes()` + scene + camera。一条发光脉冲沿传力链自上而下流动；停在当前节点弹讲解卡（复用 annotation-card 样式，附「下一步 →」/「← 上一步」）。导出 `createForcePathTour({ scene })` → `{ start(), stop(), next(), prev(), step(), update(dt) }`。步进逻辑纯粹、可测（给定步索引返回当前节点与是否末步）。

### 4. 接线
- `ui/hud.js`：新增 `showForce()` 揭示「受力·语境」开关 + `onForce(on)` 回调；导览步进控件（下一步/上一步）可挂在讲解卡上。
- `main.js`：`finish()` 里 `hud.showForce()`；`toggleForce(on)` 进出模式（与 `toggleExplode` 互斥）。
- `ui/styles.css`：导览卡与步进按钮样式。

## 测试
- `tests/forcePath.test.js`：节点有序、自上而下（y 递减）、每步 caption 非空、端点能解析。
- `tests/buildingContext.test.js`：`contextDimensions()` 尺寸合理、`createBuildingContext()` 含具名子件。
- `tests/forcePathTour.test.js`：步进推进/回退、越界夹紧、末步判定。
- 相机/淡入/脉冲走手动截图验证（`?demo` + 手动开关）。

## 不采用
- 纯静态箭头 backdrop：不够引导，用户想"被走一遍"。
- 可拖拽荷载模拟：工量大、超出当前需要（YAGNI）。
