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

### 2026-06-24 v3.1 → v3.6 长期维护阶段 — 新增 6 张风格卡

**目标**：在原 15 张基础上扩展风格语料库，新卡与老卡的视觉/语义相似度 ≤30%，覆盖此前未触及的设计语言维度（视觉趋势 / 历史经典 / 文化地域）。

**总卡数**：15 → 21；新增分类：`culture`（首次引入）。

**逐张 commit**（每张独立 commit 便于单点回退）：

| 版本 | 风格 | 类别 | 视觉锚点 | Commit |
|------|------|------|---------|--------|
| v3.1 | Claymorphism 黏土风 | mainstream | 三色彩泥圆角图标 + 厚重投影 + 圆润胶囊按钮 | `d50f5eb8` |
| v3.2 | Bauhaus 包豪斯 | mainstream | 红圆 + 蓝方 + 黄三角 + 黑横线 + "01" 巨数字 + 竖排 "FORM FOLLOWS FUNCTION" | `87b600a7` |
| v3.3 | Memphis 孟菲斯 | mainstream | 奶油底 + 绿圆点 + 蓝斜条 + 黄豆子 + 粉锯齿 + 粉影边框 "RETRO 80s" | `711b1d52` |
| v3.4 | Cyberpunk 赛博朋克 | mainstream | 紫粉霓虹渐变 + 赛博网格 + 发光太阳 + 扫描线 + 青色 "NEO TOKYO" + "// 2049 //" | `e9575960` |
| v3.5 | Japanese Zen 日式和风 | **culture** | 奶白纸底 + 黑色 Enso 圆 + 竖排"静寂" + 红印章"禅" + "わび·さび" | `3eadd0df` |
| v3.6 | Skeuomorphism 拟物化 | mainstream | 木纹外框 + 皮革内框 + LCD 凹陷绿光 "▶ 2:34 / 4:12" + 3D 红色按钮 PREV/PLAY/NEXT | `0a980356` |

**相似度自评**：与原 15 张最高相似度 30%（Zen vs Minimal，留白哲学相近但 Zen 的竖排日文 + 朱红印章使其语义独立）；其余均 ≤25%。

**踩坑教训**：v3.1 首次 push 时使用 `gh api -f content="$(base64 -w 0 index.html)"` 因文件超 ARG_MAX 触发 `Argument list too long`，gh 返回空 blob SHA 但 tree+commit+ref 仍成功，导致线上 index.html 被替换成 14 字节空文件。已 `force=true` 回滚到 `52682823` 后改用 `python3` 写 base64+JSON 临时文件 + `gh api --input` stdin 喂入的方式重发成功。孤立污染 commit `cbac9e88` 仍存在 git 历史中作为教训。

**单卡回退命令**：
```bash
gh api -X PATCH repos/kuntechnology/ui-style-gallery/git/refs/heads/main \
  --field sha=<目标 commit-sha> --field force=true
```
