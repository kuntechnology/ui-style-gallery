// ============================================================
// 对比度自检（无第三方依赖）
// 用法：node tools/contrast.mjs
// ------------------------------------------------------------
// 为什么需要它：index.html 里曾有一行注释写着
//   --text-tertiary: #6F7B92; /* v4.6: 提高对比度…满足 WCAG AA 4.5:1 */
// 而实测只有 3.37:1。人工目检靠不住，把标准做成可执行的断言。
//
// 断言规则：
//   · 正文级文字（primary）    ≥ 4.5:1（AA），目标 7:1 只告警
//   · 次要/三级文字（secondary/tertiary）≥ 4.5:1（AA）
//   · 明暗两套主题分别校验
// 退出码：任一硬性断言失败 → 1
// ============================================================

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const indexPath = path.join(root, 'index.html');

/* ---------- WCAG 相对亮度与对比度 ---------- */
function luminance(hex) {
    const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
    if (!m) return null;
    const n = m[1];
    const ch = [0, 2, 4].map((i) => parseInt(n.slice(i, i + 2), 16) / 255)
        .map((v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
    return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2];
}

function contrast(fg, bg) {
    const a = luminance(fg);
    const b = luminance(bg);
    if (a == null || b == null) return null;
    return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

/* ---------- 从 index.html 抽出两套主题的令牌 ---------- */
function extractBlock(src, selector) {
    const start = src.indexOf(selector);
    if (start === -1) return null;
    const open = src.indexOf('{', start);
    if (open === -1) return null;
    let depth = 0;
    for (let i = open; i < src.length; i += 1) {
        if (src[i] === '{') depth += 1;
        else if (src[i] === '}') {
            depth -= 1;
            if (depth === 0) return src.slice(open + 1, i);
        }
    }
    return null;
}

function parseTokens(block) {
    const out = {};
    if (!block) return out;
    const re = /--([a-z0-9-]+)\s*:\s*(#[0-9a-fA-F]{6})\s*;/g;
    let m;
    while ((m = re.exec(block)) !== null) out[m[1]] = m[2];
    return out;
}

const html = fs.readFileSync(indexPath, 'utf8');
const light = parseTokens(extractBlock(html, ':root {'));
const darkBlock = parseTokens(extractBlock(html, '[data-theme="dark"]'));

if (!light['bg-primary']) {
    console.error('✗ 未能从 index.html 的 :root 中解析出 --bg-primary，脚本需要同步更新');
    process.exit(1);
}

const themes = [
    { name: 'light', tokens: { ...light } },
    { name: 'dark', tokens: { ...light, ...darkBlock } },
];

const TEXT_ROLES = [
    { key: 'text-primary', label: '主文字', min: 4.5, target: 7 },
    { key: 'text-secondary', label: '次要文字', min: 4.5 },
    { key: 'text-tertiary', label: '三级文字', min: 4.5 },
];

// 分类标签：小字号文字，背景是 --neu-bg 而非 --bg-primary，必须单独校验。
// 鲜亮的语义色（--primary/--success/--warning/--accent）实测在浅底只有 1.70~3.53:1，
// 只能用于圆点/边框，文字必须走对应的 -ink 变体。
const TAG_ROLES = [
    { key: 'primary-ink', label: '主流标签' },
    { key: 'success-ink', label: '行业标签' },
    { key: 'warning-ink', label: '文化标签' },
    { key: 'accent-ink', label: '创意标签' },
];

let failures = 0;
const warnings = [];

for (const theme of themes) {
    const bg = theme.tokens['bg-primary'];
    console.log(`\n[${theme.name}] 背景 ${bg}`);
    console.log('  角色        色值      对比度   判定');
    for (const role of TEXT_ROLES) {
        const fg = theme.tokens[role.key];
        if (!fg) {
            failures += 1;
            console.log(`  ${role.label.padEnd(10)} —         缺失     ✗ 未定义 --${role.key}`);
            continue;
        }
        const ratio = contrast(fg, bg);
        if (ratio == null) {
            failures += 1;
            console.log(`  ${role.label.padEnd(10)} ${fg}  解析失败 ✗`);
            continue;
        }
        const ok = ratio >= role.min;
        if (!ok) failures += 1;
        const tag = ok ? '✓ AA' : `✗ < ${role.min}`;
        console.log(`  ${role.label.padEnd(10)} ${fg}  ${ratio.toFixed(2).padStart(5)}   ${tag}`);
        if (ok && role.target && ratio < role.target) {
            warnings.push(`${theme.name}/${role.label} ${ratio.toFixed(2)} 低于理想值 ${role.target}`);
        }
    }

    const tagBg = theme.tokens['neu-bg'] || bg;
    console.log(`  标签文字（背景 --neu-bg ${tagBg}）`);
    for (const role of TAG_ROLES) {
        const fg = theme.tokens[role.key];
        if (!fg) {
            failures += 1;
            console.log(`  ${role.label.padEnd(10)} —         缺失     ✗ 未定义 --${role.key}`);
            continue;
        }
        const ratio = contrast(fg, tagBg);
        const ok = ratio != null && ratio >= 4.5;
        if (!ok) failures += 1;
        console.log(`  ${role.label.padEnd(10)} ${fg}  ${(ratio == null ? 0 : ratio).toFixed(2).padStart(5)}   ${ok ? '✓ AA' : '✗ < 4.5'}`);
    }
}

console.log('\n────────────────────────────');
if (warnings.length) {
    warnings.forEach((w) => console.log('  ⚠ ' + w));
}
if (failures) {
    console.log(`  对比度断言失败 ${failures} 项`);
    process.exit(1);
}
console.log('  对比度断言全部通过');
