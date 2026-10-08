# UI Style Gallery · UI 设计风格集锦

一个**可复用、可索引、可访问**的 UI 主题参考库：**44 种 UI 设计风格**，每种都带一个纯 CSS 绘制的微型 UI mock（无外部图片）、设计 tokens、适用/不适用场景、无障碍提示与一段可直接喂给 AI 的提示词。

🌐 **在线访问：** https://kuntechnology.github.io/ui-style-gallery/

> 单页设计：所有风格都在同一个页面通过 `#style-<slug>` 锚点 / 详情弹窗查看，不做多页跳转。

---

## 一、能力总览

| 能力 | 说明 |
|------|------|
| 🔎 搜索 | 覆盖名称 / 英文名 / 概述 / 标签 / 特点 / 适用场景 / 提示词 |
| 🧭 多维筛选 | **范式**（操作系统/扁平/玻璃拟物/3D拟物/编辑排版/复古未来/其他）· **色调**（浅色/深色/高饱和/低饱和）· **年代**（经典/现代/当代/未来）· **场景**（SaaS/金融/电商/消费社交/游戏电竞/文化东方/工具效率） |
| ↕️ 排序 | 默认 / 最新收录 / 名称 / 年代 |
| 🧩 对比模式 | 勾选 2–3 个风格 → tokens 表格 + 并排 mini demo |
| ⭐ 收藏置顶 | localStorage 持久化，可置顶 |
| 🎨 复制 CSS Variables | 一键把该风格 tokens 复制为 `:root { … }` 代码块 |
| 💬 复制 AI 提示词 | 一键复制该风格的生成提示词 |
| 🔗 URL 状态同步 | `?q=&paradigm=&tone=&era=&scenes=&sort=&cmp=&view=` + `#style-slug`，刷新/分享可还原 |
| 🌓 深色模式 | 跟随系统，可手动切换，记忆到 localStorage |
| 📋 剪贴板 | 收藏提示词 → 一键复制全部 / 下载 `.md` |
| ♿ 无障碍 | 键盘可达、可见焦点环、aria 标注、44px 触控目标、`prefers-reduced-motion` 全站禁用动效 |
| 🔍 SEO | 静态预渲染 44 张卡片 + JSON-LD（ItemList + 44 CreativeWork）、OG/Twitter、canonical、sitemap.xml、robots.txt |

---

## 二、项目结构

```
ui-style-gallery/
├── index.html                 # 唯一入口页：结构 + 内联样式 + 静态预渲染内容 + 模块引用
├── assets/
│   ├── tokens.css             # 统一 design tokens（--radius-* / --shadow-* / --blur-* / --motion-* / --ease-*）
│   ├── styles.config.js       # ★ 数据源：44 个风格的结构化配置 + 分类/排序定义
│   ├── taxonomy.js            # 各风格的 范式/色调/场景 映射
│   ├── previews.js            # 28 个基础 demo 标记（程序化提取）+ 合并新 demo
│   ├── previews.extra.js      # P2 新增 16 个 demo 标记
│   ├── prompts.js             # 既有 28 条提示词库
│   ├── subtitles.js           # 卡片副标题映射
│   ├── render.js              # 卡片渲染（浏览器与 Node 共用，保证 SSR 一致）
│   └── app.js                 # 交互逻辑：筛选/排序/对比/收藏/URL 同步/详情/剪贴板/主题
├── tools/
│   ├── render-static.mjs      # 静态预渲染：把卡片与 JSON-LD 写进 index.html（SEO 首屏可爬取）
│   └── selftest.mjs           # 无第三方依赖的自检（数据/筛选/排序/tokens/映射）
├── sitemap.xml / robots.txt   # SEO
├── package.json               # build / test / verify 脚本
└── docs/ci-lighthouse.yml     # Lighthouse + axe 质量门禁模板（见下）
```

技术栈：**纯静态、零框架、零构建依赖**。JS 为原生 ES Modules，CSS 用自定义属性分层，托管于 GitHub Pages。

---

## 三、如何新增一个风格（三步）

**Step 1 — 加配置**：在 `assets/styles.config.js` 的 `RAW_STYLES` 数组中追加一条（字段见下），并在 `assets/taxonomy.js` 补该 `id` 的分类映射。

```js
{
  id: 'my-style', name: '我的风格', nameEn: 'My Style',
  era: 'contemporary', category: 'creative',
  tags: ['关键词1', '关键词2'],
  summary: '一句话概述（≤40字）',
  description: '2-3 句独特描述，用于 SEO 与详情页。',
  features: ['特点1', /* 6-8 个 */],
  tokens: { radius: '12px', shadow: '…', blur: '0px', motionDuration: '220ms',
            motionEasing: 'cubic-bezier(.4,0,.2,1)',
            palette: { primary: '#…', bg: '#…', text: '#…', accent: '#…' } },
  bestFor: ['适合场景…'], avoidFor: ['不适用…'],
  a11yNote: '对比度 / 动效注意事项。',
  demo: 'preview-my-style',   // 对应 previews 里的 key
  aiPrompt: 'A paragraph of English prompt usable for AI UI generation.',
  isNew: true,
}
```

**Step 2 — 写 demo**：在 `assets/previews.extra.js` 增加 `'preview-my-style'` 标记。要求：卡片大小的**静态场景**、**无外部图片**（emoji 或内联 SVG）、优先用内联样式；如需动画，类名前缀 `pv-` 并在 `index.html` 的样式块里加 `@media (prefers-reduced-motion: no-preference)` 包裹的 keyframes。

**Step 3 — 跑验收**：

```bash
pnpm verify      # = build（静态预渲染）+ test（自检）
```

两项全绿即完成。GitHub Pages 推送后自动更新。

---

## 四、本地开发与验收

```bash
# 本地预览（任意静态服务器即可）
npx serve .

# 静态预渲染（把 44 张卡片 + JSON-LD 写进 index.html）
pnpm build

# 数据/逻辑自检（在 Node 中用极简 DOM 桩执行 app.js）
pnpm test

# 两者一起
pnpm verify
```

### Lighthouse 跑法

```bash
npx lighthouse https://kuntechnology.github.io/ui-style-gallery/ \
  --preset=desktop --view
# 移动端模拟（默认）
npx lighthouse https://kuntechnology.github.io/ui-style-gallery/ \
  --form-factor=mobile --throttling-method=simulate --view
```

**验收基线**：Performance ≥ 90（移动端模拟）、Accessibility ≥ 95、SEO ≥ 95、Best Practices ≥ 95。

`docs/ci-lighthouse.yml` 同时提供 **Lighthouse CI + axe 扫描** 的 GitHub Actions 工作流模板（含上述阈值门禁）。启用方式：

```bash
mkdir -p .github/workflows
cp docs/ci-lighthouse.yml .github/workflows/ci.yml
```

> 说明：该文件未直接放在 `.github/workflows/`，是因为当前自动化推送所用的 OAuth App 缺少 `workflow` 权限；你用自己的账号提交即可直接放入 `.github/workflows/`。

### 无障碍扫描

```bash
npx @axe-core/cli https://kuntechnology.github.io/ui-style-gallery/
```

目标：**0 critical / 0 serious**。

---

## 五、设计原则

1. **不破坏风格本身**：工程重构不改变任一 demo 的视觉本质。
2. **数据驱动**：渲染层只读配置，新增风格 = 新增配置 + 一个 demo。
3. **token 先行**：动效、圆角、阴影、模糊全部走 `:root` 令牌，无散落硬编码。
4. **无障碍是默认值**：键盘可达、对比达标、尊重 `prefers-reduced-motion`。
5. **渐进增强**：核心内容静态可爬取，交互能力由 JS 增强。

---

## 六、44 种风格一览

**主流 (10)**：Apple HIG · Material Design · Fluent Design · Neumorphism · Glassmorphism · Flat · Gradient · Brutalism · Minimalism · Dark Mode

**行业 (5)**：SaaS · 金融 · 电商 · 社交 · 游戏

**趋势 / 视觉 (13)**：Claymorphism · Bauhaus · Memphis · Cyberpunk · 日式禅意 · Skeuomorphism · 3D Glass Type · Bento Grid · Anti-Design · Y2K Aero · Pastel Gradient Mesh · Liquid Glass · Solarpunk · Frutiger Aero

**P2 新增 (16)**：Linear 深色 SaaS · Vaporwave 蒸汽波 · 终端/命令行 · 空间界面 · Aurora 极光渐变 · Art Deco 装饰艺术 · AI 原生界面 · 复古桌面系统 · 8-bit 像素 · 新中式/国潮 · 健康穿戴 · 电子墨水 · 适老化设计 · 全息镭射 · 奢侈品电商 · 平静科技

---

## 七、更新记录

### P2 — 内容扩充与质量
- 新增 16 个风格（数据 + 纯 CSS demo + do/don't + a11yNote + aiPrompt），总数 28 → **44**
- 补齐全部风格的分类映射（范式/色调/场景）
- README 重写：结构说明 / 新增风格三步 / Lighthouse 与 axe 跑法
- 接入 Lighthouse CI + axe 质量门禁工作流

### P1 — 信息架构 / SEO / 性能 / 无障碍
- 四维分类体系与多选筛选、排序、对比模式、收藏置顶、列表视图、URL 状态同步
- SEO：静态预渲染 + JSON-LD + OG/Twitter + sitemap + robots
- 性能：`content-visibility`、固定 `aspect-ratio`、字体 .cn 优先并自动回退
- 无障碍：焦点管理、aria、reduced-motion、44px 触控目标

### P0 — 数据驱动重构
- 抽出 `styles.config.js` / `previews.js` / `prompts.js` / `subtitles.js` / `tokens.css` / `app.js`
- `index.html` 移除 2400+ 行内联脚本，改为 ES Modules 加载（259KB → 142KB）
- 新增 `#style-<slug>` 可分享锚点与详情增强
