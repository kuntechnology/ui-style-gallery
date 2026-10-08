// ============================================================
// 静态预渲染工具 (P1)
// ------------------------------------------------------------
// 用法：node tools/render-static.mjs
// 作用：把 28 张卡片与 JSON-LD 注入 index.html 的标记位，
//       让爬虫/无 JS 环境也能看到完整内容（SEO 首屏可爬取）。
// 每次修改 styles.config.js / previews.js 后重跑一次即可。
// ============================================================

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const htmlPath = path.join(root, 'index.html');

const { STYLES, ERA_LABELS, CATEGORY_LABELS, PARADIGM_LABELS, TONE_LABELS, SCENE_LABELS } =
    await import(path.join(root, 'assets/styles.config.js'));
const { gridHTML, subtitleOf } = await import(path.join(root, 'assets/render.js'));

const SITE = 'https://kuntechnology.github.io/ui-style-gallery/';

/* ---------- 1. 卡片网格 ---------- */
const cards = gridHTML(STYLES);

/* ---------- 2. JSON-LD（ItemList + 每风格 CreativeWork） ---------- */
const baseDesc = 'UI 设计风格集锦：可复制的设计风格 Prompt 卡片库，为 AI 生图与前端设计提供精准提示词。';
const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'UI 设计风格集锦 | Design Style Gallery',
    description: baseDesc,
    numberOfItems: STYLES.length,
    itemListElement: STYLES.map((s, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        item: {
            '@type': 'CreativeWork',
            name: s.name + (s.nameEn ? ' / ' + s.nameEn : ''),
            description: s.description || s.summary || '',
            url: SITE + '#style-' + s.id,
            keywords: (s.tags || []).concat(s.features || []).join(','),
        },
    })),
};

const jsonLdBlock =
    '    <script type="application/ld+json">\n' +
    JSON.stringify(jsonLd, null, 2).replace(/^/gm, '    ') +
    '\n    </script>';

/* ---------- 3. 注入 ---------- */
function inject(src, startMark, endMark, payload) {
    const start = src.indexOf(startMark);
    const end = src.indexOf(endMark);
    if (start === -1 || end === -1) throw new Error('未找到标记位: ' + startMark + ' / ' + endMark);
    return src.slice(0, start + startMark.length) + '\n' + payload + '\n' + src.slice(end);
}

let html = fs.readFileSync(htmlPath, 'utf8');
html = inject(html, '<!-- STATIC_CARDS_START -->', '<!-- STATIC_CARDS_END -->', cards);
html = inject(html, '<!-- JSONLD_START -->', '<!-- JSONLD_END -->', jsonLdBlock);
fs.writeFileSync(htmlPath, html);

console.log('✓ 已注入静态卡片:', STYLES.length, '张');
console.log('✓ 已注入 JSON-LD: ItemList +', STYLES.length, '个 CreativeWork');
console.log('✓ index.html 体积:', (fs.statSync(htmlPath).size / 1024).toFixed(1) + ' KB');
