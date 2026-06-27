# ui-style-gallery

UI Design Style Gallery — **28 mainstream / industry / culture / trending UI design styles** with live mock previews. 现已支持深色模式、全文搜索与无障碍键盘导航。

🌐 **Live demo:** https://kuntechnology.github.io/ui-style-gallery/

## What's inside

**28 张风格卡全覆盖：**

**主流风格 (10)** — Apple / iOS · Material Design · Fluent Design · Neumorphism · Glassmorphism · Flat Design · Gradient · Brutalism · Minimalism · Dark Mode

**行业风格 (5)** — SaaS / 企业级 · 金融 / 银行 · 电商 / 零售 · 社交 / 社区 · 游戏 / 娱乐

**趋势 / 视觉变体 (6)** — Claymorphism · Bauhaus · Memphis · Cyberpunk · Japanese Zen (culture) · Skeuomorphism

**v4.x 浪潮 (7)** — 3D Glass Type · Bento Grid · Anti-Design · Y2K Aero · Pastel Gradient Mesh · Liquid Glass · Solarpunk · Frutiger Aero

每张卡片：
- 微型 UI mock 预览（纯 HTML+CSS，无图片依赖，精准体现该风格的视觉特征）
- 设计特点标签
- 一键复制提示词（可直接喂给 AI 生图）
- 详情弹窗

## 核心能力 (v4.6 起)

- 🌓 **深色模式**：右上角 🌙/☀️ 一键切换，默认跟随系统 `prefers-color-scheme`，状态记忆到 localStorage
- 🔎 **全文搜索**：搜索范围覆盖卡片名称、副标题、标签、prompt 全文与分类（支持中英文混合）
- ♿ **无障碍**：
  - 所有交互元素配 `aria-label`，modal 配 `role="dialog"` + `aria-modal`
  - 卡片支持键盘 Tab 聚焦，按 Enter / Space 触发详情
  - 全局 `:focus-visible` 蓝色描边焦点提示
  - 文字对比度满足 WCAG AA 4.5:1（`--text-tertiary` 从 #95A0B4 提到 #6F7B92）
- 📱 **社交分享**：Open Graph + Twitter Card meta，分享到 IM / 社媒生成预览卡片
- ✨ **过渡动画**：卡片筛选 fade-in 缓动，告别 display:none 硬切换
- 📋 **剪贴板**：星标收藏 prompt → 一键复制全部 / 下载为 .md

## 技术栈
单文件 `index.html`，零依赖、零构建。所有预览用 CSS 绘制以保证轻量。GitHub Pages 静态托管。

---

## Changelog / 优化记录

### 2026-06-28 v4.6 体验深耕 + a11y + 暗色模式

**目标**：从「展示型画廊」向「生产力工具」的第一步，补齐基础体验欠债（暗色模式 / 搜索覆盖 / a11y / 过渡动画）。

**改动清单**：
- ✅ **暗色模式**：新增 `[data-theme="dark"]` CSS 变量覆盖；header 加切换按钮；localStorage 持久化；默认跟随系统
- ✅ **全文搜索**：搜索范围从 `name + features` 扩展到 `name + subtitle + features + prompt + category`，支持中英文混合
- ✅ **a11y 基础补齐**：所有交互元素 `aria-label`；modal `role="dialog" aria-modal="true"`；卡片 `role="listitem" tabindex="0"`；全局 `:focus-visible`；`--text-tertiary` 对比度 #95A0B4 → #6F7B92（满足 AA 4.5:1）
- ✅ **键盘交互**：卡片支持 Tab 聚焦 + Enter/Space 触发详情；modal Esc 关闭已存在
- ✅ **卡片点击职责分工**：卡片整体 click → openModal（提升发现性）；底部 📋 按钮快速复制（stopPropagation）；⋯ 按钮显式触发详情
- ✅ **过渡动画**：`.style-card` 加 `cardFadeIn` 入场动画（0.3s opacity + translateY）
- ✅ **SEO / 社交分享**：`<head>` 增加 description / keywords / OG / Twitter Card / theme-color meta
- ✅ **README 全面重写**：清掉积压 8 版的 changelog 技术债，重新说明 28 卡构成与新能力

**未做（按版本拆分到 v4.7+）**：
- 场景化标签（每张卡补"适合场景"字段）→ v4.7
- Prompt 参数化（主色调 / 视觉强度滑杆）→ v4.7
- 风格对比视图（side-by-side）→ v4.8
- 导出 Markdown / JSON → v4.8
- 数据与代码分离（styles.json + 渲染函数）→ v5.0

### 2026-06-24 ~ 2026-06-25 v4.0 → v4.5 28 卡扩展

**总卡数**：21 → 28；新增 7 张潮流风格 + 文化变体卡。

| 版本 | 风格 | 类别 | 视觉锚点 |
|------|------|------|---------|
| v4.0 | 3D Glass Type | trending | 厚玻璃挤出字体 + 折射高光 |
| v4.1 | Bento Grid | trending | 不规则圆角卡片网格 + 巨数字 |
| v4.2 | Anti-Design | trending | 故意错位 + 字体冲突 + 暴力配色 |
| v4.3 | Y2K Aero | trending | 透明气泡 + 镜面玻璃 + 千禧光晕 |
| v4.4 | Pastel Gradient Mesh | trending | 柔和糖果色网格渐变 |
| v4.5 | Liquid Glass | trending | iOS 26 风格 + 流光液态玻璃 |
| v4.5 | Solarpunk | culture | 苔藓绿 + 黄铜 + 太阳能板 + 攀缘植物 |
| v4.5 | Frutiger Aero | trending | 2004-2013 风 + 草地天空 + 透明气泡 |

每张卡独立 commit，可单点回退。

### 2026-06-24 v3.1 → v3.6 长期维护阶段 — 新增 6 张风格卡

**总卡数**：15 → 21；新增分类：`culture`（首次引入）。

| 版本 | 风格 | 类别 | 视觉锚点 |
|------|------|------|---------|
| v3.1 | Claymorphism 黏土风 | mainstream | 三色彩泥圆角图标 + 厚重投影 |
| v3.2 | Bauhaus 包豪斯 | mainstream | 红圆+蓝方+黄三角+黑横线 |
| v3.3 | Memphis 孟菲斯 | mainstream | 奶油底+多色几何元素+影边框 |
| v3.4 | Cyberpunk 赛博朋克 | mainstream | 紫粉霓虹+赛博网格+扫描线 |
| v3.5 | Japanese Zen 日式和风 | **culture** | 奶白纸底+黑色Enso圆+竖排"静寂"+朱红印章 |
| v3.6 | Skeuomorphism 拟物化 | mainstream | 木纹+皮革+LCD凹陷绿光+3D红按钮 |

**踩坑教训（已沉淀）**：v3.1 首次 push 时使用 `gh api -f content="$(base64 -w 0 index.html)"` 因文件超 ARG_MAX 触发 `Argument list too long`，gh 返回空 blob SHA 但 tree+commit+ref 仍成功，导致线上 index.html 被替换成 14 字节空文件。已 `force=true` 回滚后改用 `python3` 写 JSON 临时文件 + `gh api --input` stdin 喂入。孤立污染 commit `cbac9e88` 仍存在 git 历史中。

### 2026-06-24 v1 → v2 风格 mock 增强

**目标**：解决"prompt 文本描述详尽，但 mock 实际渲染过于稀疏"的偏差问题。

6 张卡增强（Fluent / Neumorphism / Gradient / Flat / Dark / SaaS），9 张未动（已对齐）。

---

## 单卡 / 单版本回退命令

```bash
gh api -X PATCH repos/kuntechnology/ui-style-gallery/git/refs/heads/main \
  --field sha=<目标 commit-sha> --field force=true
```
