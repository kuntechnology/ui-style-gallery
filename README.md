# ui-style-gallery

UI Design Style Gallery — 15 mainstream & industry UI design styles with live mock previews.

🌐 **Live demo:** https://kuntechnology.github.io/ui-style-gallery/

## What's inside

15 风格全覆盖：

**主流风格 (10)**
- Apple / iOS · Material Design · Fluent Design
- Neumorphism · Glassmorphism · Flat Design · Gradient
- Brutalism · Minimalism · Dark Mode

**行业风格 (5)**
- SaaS / 企业级 · 金融 / 银行 · 电商 / 零售 · 社交 / 社区 · 游戏 / 娱乐

每张卡片：
- 微型 UI mock 预览（纯 HTML+CSS，无图片依赖，体现该风格的视觉特征）
- 设计特点标签
- 一键复制提示词（可直接喂给 AI 生图）
- 详情弹窗

## 技术栈
单文件 `index.html`，零依赖、零构建。所有预览用 CSS 绘制以保证轻量。

## Changelog / 优化记录

### 2026-06-24 v1 → v2 风格 mock 增强

**目标**：解决"prompt 文本描述详尽，但 mock 实际渲染过于稀疏 / 不充分体现风格特征"的偏差问题。

**提交链**：
- `7b3dd8f` baseline — 原始 15 张风格卡
- `07a2c15` Stage 1 全局布局 — `.styles-grid` minmax 从 380px 降到 320px，平均每屏多容纳 1 列卡片
- `c41b10b` Stage 2 P0 单卡（Fluent / Neumorphism / Gradient）
- `e3c1b80` Stage 3 P1 单卡（Flat / Dark / SaaS）
- `7ae593d` Fix 修复 Stage 2/3 并发 edit 丢失的 HTML / CSS 块

**6 张卡增强明细**：
- **#3 Fluent**：加 Pivot 顶部 Tab + 双按钮（主 + Ghost）
- **#4 Neumorphism**：加 rich card 内阴影 + label/value + inset 进度条
- **#7 Gradient**：双 blob 渐变背景 + 玻璃 CTA 按钮
- **#6 Flat**：emoji 图标（📋🔔✅）+ 大号数字（12 / 3 / 28）
- **#10 Dark**：紫色 #bb86fc 发光点 + 98% 大数值统计
- **#11 SaaS**：KPI 条（ARR $1.2M / 用户 +12%）

**9 张未动卡**：Apple / Material / Glass / Brutal / Minimal / 金融 / Ecommerce / Social / Gaming — mock 与 prompt 已基本对齐，强改反而破坏风格本意。

**回退**：如需回到任意快照，`git reset --hard <commit-sha>` 即可。
