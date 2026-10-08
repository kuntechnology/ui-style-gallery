// ============================================================
// UI 设计风格集锦 · 应用逻辑 (P1)
// ------------------------------------------------------------
// 全部 UI 读取 styles.config.js 的 STYLES；卡片 HTML 复用 render.js，
// 与 tools/render-static.mjs 的静态预渲染保持完全一致（SEO 首屏可爬取）。
// P1 新增：多维筛选 / 排序 / 对比 / 收藏置顶 / URL 状态同步 / 列表视图。
// ============================================================

import {
    STYLES, ERA_LABELS, CATEGORY_LABELS, PARADIGM_LABELS, TONE_LABELS,
    SCENE_LABELS, FILTER_GROUPS, SORT_OPTIONS,
} from './styles.config.js';
import { PREVIEWS } from './previews.js';
import { cardHTML, escapeHtml, categoryClass, subtitleOf } from './render.js';

/* ---------- 索引与工具 ---------- */
const byId = new Map(STYLES.map((s) => [s.id, s]));
const getStyle = (id) => byId.get(id) || null;

/* ---------- 应用状态（单一数据源） ---------- */
const state = {
    filters: { paradigm: '', tone: '', era: '', scenes: [] },
    search: '',
    sort: 'default',
    compare: [],            // 最多 3 个 id
    pinFavorites: false,
    view: 'grid',
};

/* ============================================================
   剪贴板（收藏）—— localStorage 持久化
   ============================================================ */
let clipboardItems = (function () {
    try {
        const raw = JSON.parse(localStorage.getItem('ui-gallery-clipboard') || '[]');
        return Array.isArray(raw) ? raw.filter((id) => byId.has(id)) : [];
    } catch (e) {
        return [];
    }
})();
let currentModalPrompt = '';

/* ============================================================
   主题 / Toast
   ============================================================ */
function toggleTheme() {
    const cur = document.documentElement.getAttribute('data-theme') || 'light';
    const next = cur === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    try { localStorage.setItem('ui-gallery-theme', next); } catch (e) {}
    const icon = document.getElementById('themeIcon');
    if (icon) icon.textContent = next === 'dark' ? '☀️' : '🌙';
}

(function initTheme() {
    try {
        const saved = localStorage.getItem('ui-gallery-theme');
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        const initial = saved || (prefersDark ? 'dark' : 'light');
        document.documentElement.setAttribute('data-theme', initial);
        document.addEventListener('DOMContentLoaded', () => {
            const icon = document.getElementById('themeIcon');
            if (icon) icon.textContent = initial === 'dark' ? '☀️' : '🌙';
        });
    } catch (e) {
        document.documentElement.setAttribute('data-theme', 'light');
    }
})();

function showToast(message, type = 'default') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = message;
    toast.className = 'toast ' + type;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

/* ============================================================
   能力探测：透明度 / 动效降级写回 html 属性供 CSS 选择
   ============================================================ */
function detectCapabilities() {
    const root = document.documentElement;
    const mqReduceTransparency = window.matchMedia && window.matchMedia('(prefers-reduced-transparency: reduce)');
    const mqReduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');
    root.setAttribute('data-transparency', mqReduceTransparency && mqReduceTransparency.matches ? 'reduced' : 'full');
    root.setAttribute('data-motion', mqReduceMotion && mqReduceMotion.matches ? 'reduced' : 'full');
}

/* ============================================================
   卡片渲染：优先复用静态预渲染的 DOM（避免重排 / CLS）
   ============================================================ */
function ensureCards() {
    const grid = document.getElementById('stylesGrid');
    if (!grid) return;
    if (!grid.querySelector('.style-card')) {
        grid.innerHTML = STYLES.map(cardHTML).join('\n');
    }
    wireCardEvents();
}

function wireCardEvents() {
    document.querySelectorAll('.style-card').forEach((card) => {
        if (card.dataset.wired) return;
        card.dataset.wired = '1';
        card.addEventListener('click', (e) => {
            if (e.target.closest('button') || e.target.closest('.card-compare')) return;
            const id = card.dataset.id;
            if (id) openModal(id);
        });
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                if (e.target.closest('button') || e.target.closest('.card-compare')) return;
                e.preventDefault();
                const id = card.dataset.id;
                if (id) openModal(id);
            }
        });
    });
    refreshAllCardStars();
    syncCompareChecks();
}

/* ============================================================
   剪贴板逻辑
   ============================================================ */
function isInClipboard(id) {
    return clipboardItems.indexOf(id) !== -1;
}

function saveClipboard() {
    try {
        localStorage.setItem('ui-gallery-clipboard', JSON.stringify(clipboardItems));
    } catch (e) {
        console.warn('localStorage 写入失败', e);
    }
}

function addToClipboard(id) {
    if (isInClipboard(id)) return false;
    clipboardItems.push(id);
    saveClipboard();
    renderClipboard();
    updateFab();
    updateCardStar(id);
    return true;
}

function removeFromClipboard(id) {
    const idx = clipboardItems.indexOf(id);
    if (idx === -1) return false;
    clipboardItems.splice(idx, 1);
    saveClipboard();
    renderClipboard();
    updateFab();
    updateCardStar(id);
    return true;
}

function toggleClipboard(id, btnEl) {
    if (isInClipboard(id)) {
        removeFromClipboard(id);
        showToast('已从剪贴板移除');
    } else {
        addToClipboard(id);
        if (btnEl) {
            btnEl.classList.add('just-added');
            setTimeout(() => btnEl.classList.remove('just-added'), 420);
        }
        showToast('已加入剪贴板 ★', 'success');
    }
}

function updateFab() {
    const fab = document.getElementById('clipboardFab');
    const badge = document.getElementById('clipboardFabBadge');
    const count = clipboardItems.length;
    if (!fab || !badge) return;
    badge.textContent = count;
    fab.classList.toggle('is-empty', count === 0);
}

function updateCardStar(id) {
    const btn = document.querySelector('.card-star-btn[data-star-id="' + id + '"]');
    if (!btn) return;
    if (isInClipboard(id)) {
        btn.classList.add('is-saved');
        btn.textContent = '★';
        btn.title = '已收藏 · 点击移除';
    } else {
        btn.classList.remove('is-saved');
        btn.textContent = '☆';
        btn.title = '加入剪贴板';
    }
}

function refreshAllCardStars() {
    document.querySelectorAll('.card-star-btn').forEach((btn) => {
        const id = btn.dataset.starId;
        if (id) updateCardStar(id);
    });
}

function renderClipboard() {
    const body = document.getElementById('clipboardBody');
    const titleCount = document.getElementById('clipboardTitleCount');
    const copyAll = document.getElementById('clipboardCopyAllBtn');
    const dl = document.getElementById('clipboardDownloadBtn');
    const clr = document.getElementById('clipboardClearBtn');
    if (!body) return;

    const count = clipboardItems.length;
    if (titleCount) titleCount.textContent = count + ' 条';
    [copyAll, dl, clr].forEach((b) => { if (b) b.disabled = count === 0; });

    if (count === 0) {
        body.innerHTML =
            '<div class="clipboard-empty">' +
                '<div class="clipboard-empty-icon">📋</div>' +
                '<div class="clipboard-empty-text">剪贴板还是空的</div>' +
                '<div class="clipboard-empty-hint">点击卡片右上角 ☆ 把喜欢的风格加进来</div>' +
            '</div>';
        return;
    }

    body.innerHTML = clipboardItems.map((id, idx) => {
        const style = getStyle(id);
        if (!style) return '';
        const displayName = subtitleOf(style) ? style.name + ' · ' + subtitleOf(style) : style.name;
        return '<div class="clipboard-item" data-clip-id="' + id + '">' +
                    '<div class="clipboard-item-header">' +
                        '<div class="clipboard-item-name">' + (idx + 1) + '. ' + escapeHtml(displayName) + '</div>' +
                        '<div class="clipboard-item-actions">' +
                            '<button class="clipboard-item-btn" data-action="copy-one" data-id="' + id + '" title="复制此条" aria-label="复制 ' + escapeHtml(style.name) + '">⎘</button>' +
                            '<button class="clipboard-item-btn danger" data-action="remove-one" data-id="' + id + '" title="移除" aria-label="移除 ' + escapeHtml(style.name) + '">✕</button>' +
                        '</div>' +
                    '</div>' +
                    '<div class="clipboard-item-prompt">' + escapeHtml(style.aiPrompt || '') + '</div>' +
                '</div>';
    }).join('');
}

function openClipboardDrawer() {
    const overlay = document.getElementById('clipboardOverlay');
    const drawer = document.getElementById('clipboardDrawer');
    if (overlay) overlay.classList.add('is-open');
    if (drawer) {
        drawer.classList.add('is-open');
        drawer.setAttribute('aria-hidden', 'false');
    }
}

function closeClipboardDrawer() {
    const overlay = document.getElementById('clipboardOverlay');
    const drawer = document.getElementById('clipboardDrawer');
    if (overlay) overlay.classList.remove('is-open');
    if (drawer) {
        drawer.classList.remove('is-open');
        drawer.setAttribute('aria-hidden', 'true');
    }
}

function copyAllPrompts() {
    if (clipboardItems.length === 0) return;
    const text = clipboardItems.map((id, idx) => {
        const s = getStyle(id);
        if (!s) return '';
        return '【' + (idx + 1) + '. ' + s.name + '】\n' + (s.aiPrompt || '');
    }).filter(Boolean).join('\n\n---\n\n');
    navigator.clipboard.writeText(text)
        .then(() => showToast('全部 ' + clipboardItems.length + ' 条已复制', 'success'))
        .catch(() => showToast('复制失败，请重试'));
}

function downloadClipboardMd() {
    if (clipboardItems.length === 0) return;
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const stamp = now.getFullYear() + '-' + pad(now.getMonth() + 1) + '-' + pad(now.getDate()) +
                  ' ' + pad(now.getHours()) + ':' + pad(now.getMinutes());
    let md = '# UI Style Gallery · 提示词剪贴板\n\n';
    md += '> 导出时间：' + stamp + '  \n';
    md += '> 来源：https://kuntechnology.github.io/ui-style-gallery/\n\n---\n\n';
    clipboardItems.forEach((id, idx) => {
        const s = getStyle(id);
        if (!s) return;
        md += '## ' + (idx + 1) + '. ' + s.name;
        if (subtitleOf(s)) md += ' · ' + subtitleOf(s);
        md += '\n\n';
        if (s.features && s.features.length) md += '**设计特点：** ' + s.features.join('、') + '\n\n';
        md += '```\n' + (s.aiPrompt || '') + '\n```\n\n';
    });
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ui-prompts-' + now.getFullYear() + pad(now.getMonth() + 1) + pad(now.getDate()) + '.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('已下载 ' + clipboardItems.length + ' 条到本地', 'success');
}

function clearClipboard() {
    if (clipboardItems.length === 0) return;
    if (!confirm('确定清空剪贴板里的 ' + clipboardItems.length + ' 条提示词吗？')) return;
    clipboardItems = [];
    saveClipboard();
    renderClipboard();
    updateFab();
    refreshAllCardStars();
    showToast('剪贴板已清空');
}

/* ============================================================
   筛选面板（多维 Chips，可组合）
   ============================================================ */
function renderFilterPanel() {
    const panel = document.getElementById('filterPanel');
    if (!panel) return;
    panel.innerHTML = FILTER_GROUPS.map((group) => {
        const chips = Object.keys(group.options).map((key) => {
            const active = group.multi
                ? state.filters[group.key].includes(key)
                : state.filters[group.key] === key;
            return '<button type="button" class="chip' + (active ? ' is-active' : '') +
                '" data-group="' + group.key + '" data-value="' + key + '" aria-pressed="' + active + '">' +
                escapeHtml(group.options[key]) + '</button>';
        }).join('');
        return '<div class="filter-group" role="group" aria-label="' + group.label + '筛选">' +
                    '<span class="filter-group-label">' + group.label + '</span>' +
                    '<div class="chip-row">' + chips + '</div>' +
                '</div>';
    }).join('');
}

function onChipClick(group, value) {
    if (group === 'scenes') {
        const list = state.filters.scenes;
        const i = list.indexOf(value);
        if (i === -1) list.push(value); else list.splice(i, 1);
    } else {
        state.filters[group] = state.filters[group] === value ? '' : value;
    }
    renderFilterPanel();
    renderActiveFilters();
    applyState();
}

function renderActiveFilters() {
    const box = document.getElementById('filterActive');
    if (!box) return;
    const parts = [];
    FILTER_GROUPS.forEach((g) => {
        if (g.multi) {
            state.filters[g.key].forEach((v) => parts.push({ group: g.key, value: v, label: g.options[v] }));
        } else if (state.filters[g.key]) {
            parts.push({ group: g.key, value: state.filters[g.key], label: g.options[state.filters[g.key]] });
        }
    });
    if (state.search) parts.push({ group: 'search', value: '', label: '搜索：' + state.search });
    if (state.pinFavorites) parts.push({ group: 'pin', value: '', label: '收藏置顶' });

    if (parts.length === 0) { box.hidden = true; box.innerHTML = ''; return; }
    box.hidden = false;
    box.innerHTML = '<span class="filter-active-label">已选：</span>' +
        parts.map((p) => '<button type="button" class="active-pill" data-group="' + p.group + '" data-value="' + escapeHtml(p.value) + '">' +
            escapeHtml(p.label) + ' <span aria-hidden="true">✕</span></button>').join('') +
        '<button type="button" class="active-clear" id="activeClearBtn">全部清除</button>';
}

function removeActiveFilter(group, value) {
    if (group === 'search') { state.search = ''; const el = document.getElementById('searchInput'); if (el) el.value = ''; }
    else if (group === 'pin') state.pinFavorites = false;
    else if (group === 'scenes') { const i = state.filters.scenes.indexOf(value); if (i > -1) state.filters.scenes.splice(i, 1); }
    else state.filters[group] = '';
    renderFilterPanel();
    renderActiveFilters();
    applyState();
}

/* ---------- 排序 ---------- */
const ERA_ORDER = { classic: 0, modern: 1, contemporary: 2, future: 3 };

function renderSortOptions() {
    const sel = document.getElementById('sortSelect');
    if (!sel) return;
    sel.innerHTML = SORT_OPTIONS.map((o) =>
        '<option value="' + o.key + '">' + escapeHtml(o.label) + '</option>').join('');
    sel.value = state.sort;
}

function sortStyles(list) {
    const arr = list.slice();
    if (state.sort === 'new') {
        arr.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
    } else if (state.sort === 'name') {
        arr.sort((a, b) => a.name.localeCompare(b.name, 'zh-Hans-CN'));
    } else if (state.sort === 'era') {
        arr.sort((a, b) => (ERA_ORDER[a.era] ?? 9) - (ERA_ORDER[b.era] ?? 9));
    }
    return arr;
}

/* ---------- 热门标签 ---------- */
function renderHotTags() {
    const box = document.getElementById('hotTags');
    if (!box) return;
    const hot = ['saas', 'gaming', 'oriental', 'ecommerce', 'social'];
    box.innerHTML = '<span class="hot-tags-label">热门：</span>' + hot.map((k) => {
        const [group, value] = k === 'saas' || k === 'gaming' || k === 'oriental' || k === 'ecommerce' || k === 'social'
            ? ['scenes', k] : ['scenes', k];
        return '<button type="button" class="hot-tag" data-group="' + group + '" data-value="' + value + '">' +
            escapeHtml(SCENE_LABELS[value] || value) + '</button>';
    }).join('');
}

/* ============================================================
   过滤 + 排序主流程
   ============================================================ */
function matchSearch(style) {
    if (!state.search) return true;
    const haystack = [
        style.name, style.nameEn, subtitleOf(style),
        (style.tags || []).join(' '), (style.features || []).join(' '),
        style.summary, style.description, style.category,
        (style.bestFor || []).join(' '), (style.scenes || []).map((s) => SCENE_LABELS[s] || s).join(' '),
        (style.tags || []).join(' '), style.aiPrompt,
    ].join(' ').toLowerCase();
    return haystack.includes(state.search);
}

function matchesAll(style) {
    const f = state.filters;
    if (f.paradigm && style.paradigm !== f.paradigm) return false;
    if (f.tone && style.tone !== f.tone) return false;
    if (f.era && style.era !== f.era) return false;
    if (f.scenes.length && !f.scenes.some((s) => (style.scenes || []).includes(s))) return false;
    return matchSearch(style);
}

function applyState() {
    const grid = document.getElementById('stylesGrid');
    if (!grid) return;
    const visible = STYLES.filter(matchesAll);
    const ordered = sortStyles(visible);

    // 收藏置顶：把已收藏的排到最前
    if (state.pinFavorites) {
        ordered.sort((a, b) => (isInClipboard(b.id) ? 1 : 0) - (isInClipboard(a.id) ? 1 : 0));
    }

    const orderIndex = new Map(ordered.map((s, i) => [s.id, i]));
    const allCards = Array.from(grid.querySelectorAll('.style-card'));

    // 隐藏不匹配项
    allCards.forEach((card) => {
        const show = orderIndex.has(card.dataset.id);
        card.classList.toggle('hidden', !show);
    });
    // 依据排序重排 DOM（仅移动可见卡片）
    ordered.forEach((s) => {
        const card = document.getElementById('style-' + s.id);
        if (card) grid.appendChild(card);
    });

    const visEl = document.getElementById('visibleCount');
    if (visEl) visEl.textContent = ordered.length;
    const emptyEl = document.getElementById('emptyState');
    if (emptyEl) emptyEl.classList.toggle('show', ordered.length === 0);

    writeUrl();
}

function resetFilters() {
    state.filters = { paradigm: '', tone: '', era: '', scenes: [] };
    state.search = '';
    state.sort = 'default';
    state.pinFavorites = false;
    const el = document.getElementById('searchInput');
    if (el) el.value = '';
    const sel = document.getElementById('sortSelect');
    if (sel) sel.value = 'default';
    renderFilterPanel();
    renderActiveFilters();
    applyState();
    showToast('已重置全部筛选');
}

function setSearch(term) {
    state.search = (term || '').trim().toLowerCase();
    renderActiveFilters();
    applyState();
}

/* ============================================================
   对比模式（最多 3 个）
   ============================================================ */
function toggleCompare(id, checked) {
    const i = state.compare.indexOf(id);
    if (checked) {
        if (i === -1) {
            if (state.compare.length >= 3) {
                showToast('最多同时对比 3 个风格');
                syncCompareChecks();
                return;
            }
            state.compare.push(id);
        }
    } else if (i !== -1) {
        state.compare.splice(i, 1);
    }
    renderCompareBar();
    writeUrl();
}

function syncCompareChecks() {
    document.querySelectorAll('.compare-check').forEach((cb) => {
        cb.checked = state.compare.includes(cb.dataset.compareId);
    });
}

function renderCompareBar() {
    const bar = document.getElementById('compareBar');
    const count = document.getElementById('compareCount');
    if (!bar) return;
    bar.hidden = state.compare.length === 0;
    if (count) count.textContent = state.compare.length;
    const openBtn = document.getElementById('compareOpenBtn');
    if (openBtn) openBtn.disabled = state.compare.length < 2;
}

function compareHTML() {
    const items = state.compare.map(getStyle).filter(Boolean);
    const rows = [
        ['分类', (s) => CATEGORY_LABELS[s.category] || '—'],
        ['范式', (s) => PARADIGM_LABELS[s.paradigm] || '—'],
        ['色调', (s) => TONE_LABELS[s.tone] || '—'],
        ['年代', (s) => ERA_LABELS[s.era] || '—'],
        ['场景', (s) => (s.scenes || []).map((x) => SCENE_LABELS[x] || x).join('、') || '—'],
        ['圆角', (s) => s.tokens?.radius || '—'],
        ['阴影', (s) => s.tokens?.shadow || '—'],
        ['模糊', (s) => s.tokens?.blur || '—'],
        ['动效', (s) => (s.tokens?.motionDuration || '—') + ' · ' + (s.tokens?.motionEasing || '—')],
    ];
    const head = '<tr><th scope="col">维度</th>' + items.map((s) =>
        '<th scope="col">' + escapeHtml(s.name) + '</th>').join('') + '</tr>';
    const demoRow = '<tr><th scope="row">预览</th>' + items.map((s) =>
        '<td><div class="compare-mini ' + s.demo + '">' + (PREVIEWS[s.demo] || '') + '</div></td>').join('') + '</tr>';
    const body = rows.map(([label, fn]) =>
        '<tr><th scope="row">' + label + '</th>' + items.map((s) =>
            '<td>' + escapeHtml(fn(s) || '—') + '</td>').join('') + '</tr>').join('');
    const swatchRow = '<tr><th scope="row">色板</th>' + items.map((s) => {
        const p = s.tokens?.palette || {};
        const sw = ['primary', 'bg', 'text', 'accent'].filter((k) => p[k]).map((k) =>
            '<span class="token-swatch" style="background:' + escapeHtml(p[k]) + '" title="' + k + '"></span>').join('');
        return '<td><span class="token-swatches">' + sw + '</span></td>';
    }).join('') + '</tr>';
    return '<table class="compare-table"><thead>' + head + '</thead><tbody>' + demoRow + body + swatchRow + '</tbody></table>';
}

function openCompare() {
    const overlay = document.getElementById('compareOverlay');
    const bodyEl = document.getElementById('compareBody');
    if (!overlay || !bodyEl) return;
    bodyEl.innerHTML = compareHTML();
    overlay.classList.add('is-open');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
}

function closeCompare() {
    const overlay = document.getElementById('compareOverlay');
    if (!overlay) return;
    overlay.classList.remove('is-open');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
}

/* ============================================================
   URL 状态同步（刷新 / 分享可还原）
   ============================================================ */
function writeUrl() {
    if (!history.replaceState) return;
    const p = new URLSearchParams();
    if (state.search) p.set('q', state.search);
    if (state.sort !== 'default') p.set('sort', state.sort);
    ['paradigm', 'tone', 'era'].forEach((k) => { if (state.filters[k]) p.set(k, state.filters[k]); });
    if (state.filters.scenes.length) p.set('scenes', state.filters.scenes.join(','));
    if (state.pinFavorites) p.set('pin', '1');
    if (state.view === 'list') p.set('view', 'list');
    if (state.compare.length) p.set('cmp', state.compare.join(','));
    const qs = p.toString();
    const hash = location.hash || '';
    history.replaceState(null, '', location.pathname + (qs ? '?' + qs : '') + hash);
}

function readUrl() {
    const p = new URLSearchParams(location.search);
    if (p.get('q')) state.search = p.get('q').toLowerCase();
    if (p.get('sort')) state.sort = p.get('sort');
    ['paradigm', 'tone', 'era'].forEach((k) => { if (p.get(k)) state.filters[k] = p.get(k); });
    if (p.get('scenes')) state.filters.scenes = p.get('scenes').split(',').filter(Boolean);
    if (p.get('pin') === '1') state.pinFavorites = true;
    if (p.get('view') === 'list') state.view = 'list';
    if (p.get('cmp')) state.compare = p.get('cmp').split(',').filter((id) => byId.has(id)).slice(0, 3);
}

/* ============================================================
   详情弹窗（含 tokens 可视化 / CSS Variables 复制 / 锚点）
   ============================================================ */
function tokenBarHTML(style) {
    const t = style.tokens || {};
    const p = t.palette || {};
    const swatches = ['primary', 'bg', 'text', 'accent'].filter((k) => p[k]).map((k) =>
        '<span class="token-swatch" style="background:' + escapeHtml(p[k]) + '" title="' + k + ' ' + escapeHtml(p[k]) + '"></span>').join('');
    return `
        <div class="modal-section">
            <div class="modal-section-title">🎛️ 核心 Tokens</div>
            <div class="token-bar">
                <div class="token-row"><span class="token-key">圆角</span><span class="token-val"><span class="radius-demo" style="border-radius:${escapeHtml((t.radius || '12px').split('-')[0])}"></span>${escapeHtml(t.radius || '—')}</span></div>
                <div class="token-row"><span class="token-key">阴影</span><span class="token-val">${escapeHtml(t.shadow || '—')}</span></div>
                <div class="token-row"><span class="token-key">模糊</span><span class="token-val">${escapeHtml(t.blur || '—')}</span></div>
                <div class="token-row"><span class="token-key">动效</span><span class="token-val">${escapeHtml(t.motionDuration || '—')} · ${escapeHtml(t.motionEasing || '—')}</span></div>
                <div class="token-row"><span class="token-key">色板</span><span class="token-val token-swatches">${swatches}</span></div>
            </div>
            <div class="modal-actions-row">
                <button class="btn btn-secondary" onclick="copyCssVars('${style.id}')">🎨 复制 CSS Variables</button>
                <button class="btn btn-secondary" onclick="copyModalPrompt()">💬 复制 AI 提示词</button>
            </div>
        </div>`;
}

function cssVarsOf(style) {
    const t = style.tokens || {};
    const p = t.palette || {};
    return ':root {\n' +
        '  /* ' + style.name + ' */\n' +
        '  --radius: ' + (t.radius || '12px') + ';\n' +
        '  --shadow: ' + (t.shadow || 'none') + ';\n' +
        '  --blur: ' + (t.blur || '0px') + ';\n' +
        '  --motion-duration: ' + (t.motionDuration || '300ms') + ';\n' +
        '  --motion-easing: ' + (t.motionEasing || 'ease') + ';\n' +
        '  --color-primary: ' + (p.primary || '#000') + ';\n' +
        '  --color-bg: ' + (p.bg || '#fff') + ';\n' +
        '  --color-text: ' + (p.text || '#111') + ';\n' +
        '  --color-accent: ' + (p.accent || '#666') + ';\n' +
        '}';
}

function copyCssVars(id) {
    const style = getStyle(id);
    if (!style) return;
    navigator.clipboard.writeText(cssVarsOf(style))
        .then(() => showToast('CSS Variables 已复制', 'success'))
        .catch(() => showToast('复制失败，请重试'));
}

function openModal(id) {
    const style = getStyle(id);
    if (!style) return;
    currentModalPrompt = style.aiPrompt || '';
    const titleEl = document.getElementById('modalTitle');
    if (titleEl) titleEl.textContent = style.name;
    const sub = subtitleOf(style);
    const bodyEl = document.getElementById('modalBody');
    if (bodyEl) bodyEl.innerHTML = `
        <div class="modal-section">
            <div class="modal-section-title">📖 风格概述</div>
            ${sub ? '<p class="modal-subtitle">' + escapeHtml(sub) + '</p>' : ''}
            <p class="modal-desc">${escapeHtml(style.description || style.summary || '')}</p>
        </div>
        <div class="modal-section">
            <div class="modal-section-title">✨ 设计特点</div>
            <div class="feature-list">
                ${(style.features || []).map((f) => `<span class="feature-item">${escapeHtml(f)}</span>`).join('')}
            </div>
        </div>
        ${tokenBarHTML(style)}
        <div class="modal-section modal-cols">
            <div>
                <div class="modal-section-title">✅ 适用场景</div>
                <ul class="do-list">${(style.bestFor || []).map((x) => '<li>' + escapeHtml(x) + '</li>').join('')}</ul>
            </div>
            <div>
                <div class="modal-section-title">🚫 不适用</div>
                <ul class="dont-list">${(style.avoidFor || []).map((x) => '<li>' + escapeHtml(x) + '</li>').join('')}</ul>
            </div>
        </div>
        <div class="modal-section">
            <div class="modal-section-title">♿ 无障碍提示</div>
            <p class="modal-desc">${escapeHtml(style.a11yNote || '')}</p>
        </div>
        <div class="modal-section">
            <div class="modal-section-title">💬 提示词模板</div>
            <div class="prompt-box">${escapeHtml(style.aiPrompt || '')}</div>
        </div>
    `;
    const overlay = document.getElementById('modalOverlay');
    if (overlay) {
        overlay.classList.add('active');
        overlay.setAttribute('aria-hidden', 'false');
        const closeBtn = overlay.querySelector('.modal-close');
        if (closeBtn) closeBtn.focus();
    }
    document.body.style.overflow = 'hidden';
    if (history.replaceState) history.replaceState(null, '', location.pathname + location.search + '#style-' + id);
    else location.hash = 'style-' + id;
}

function closeModal() {
    const overlay = document.getElementById('modalOverlay');
    if (!overlay) return;
    overlay.classList.remove('active');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (history.replaceState) history.replaceState(null, '', location.pathname + location.search);
}

function copyPrompt(id) {
    const style = getStyle(id);
    if (!style) return;
    navigator.clipboard.writeText(style.aiPrompt || '').then(() => {
        showToast('提示词已复制到剪贴板', 'success');
        const btn = document.querySelector('[data-id="' + id + '"] .copy-btn');
        if (btn) {
            btn.classList.add('copied');
            btn.innerHTML = '✓ 已复制';
            setTimeout(() => { btn.classList.remove('copied'); btn.innerHTML = '📋 复制提示词'; }, 2000);
        }
    });
}

function copyModalPrompt() {
    navigator.clipboard.writeText(currentModalPrompt).then(() => showToast('完整提示词已复制到剪贴板', 'success'));
}

/* ============================================================
   锚点路由：#style-<slug> 直接打开详情
   ============================================================ */
function applyHash() {
    const m = /^#style-([\w-]+)$/.exec(location.hash || '');
    if (m && byId.has(m[1])) {
        openModal(m[1]);
        const card = document.getElementById('style-' + m[1]);
        if (card) card.scrollIntoView({ block: 'center' });
    }
}

function setupHashRouting() {
    window.addEventListener('hashchange', applyHash);
    applyHash();
}

/* ============================================================
   视图切换（网格 / 列表）
   ============================================================ */
function setView(view) {
    state.view = view === 'list' ? 'list' : 'grid';
    const grid = document.getElementById('stylesGrid');
    if (grid) grid.classList.toggle('is-list', state.view === 'list');
    document.querySelectorAll('.view-btn').forEach((btn) => {
        const on = btn.dataset.view === state.view;
        btn.classList.toggle('active', on);
        btn.setAttribute('aria-pressed', String(on));
    });
    writeUrl();
}

/* ============================================================
   事件绑定
   ============================================================ */
function setupClipboard() {
    const fab = document.getElementById('clipboardFab');
    const overlay = document.getElementById('clipboardOverlay');
    const closeBtn = document.getElementById('clipboardCloseBtn');
    const copyAll = document.getElementById('clipboardCopyAllBtn');
    const dl = document.getElementById('clipboardDownloadBtn');
    const clr = document.getElementById('clipboardClearBtn');
    const body = document.getElementById('clipboardBody');

    if (fab) fab.addEventListener('click', openClipboardDrawer);
    if (overlay) overlay.addEventListener('click', closeClipboardDrawer);
    if (closeBtn) closeBtn.addEventListener('click', closeClipboardDrawer);
    if (copyAll) copyAll.addEventListener('click', copyAllPrompts);
    if (dl) dl.addEventListener('click', downloadClipboardMd);
    if (clr) clr.addEventListener('click', clearClipboard);

    if (body) {
        body.addEventListener('click', (e) => {
            const btn = e.target.closest('button[data-action]');
            if (!btn) return;
            const id = btn.dataset.id;
            if (!id) return;
            if (btn.dataset.action === 'copy-one') {
                const s = getStyle(id);
                if (s) navigator.clipboard.writeText(s.aiPrompt || '').then(() => showToast('已复制 · ' + s.name, 'success'));
            } else if (btn.dataset.action === 'remove-one') {
                removeFromClipboard(id);
            }
        });
    }
}

function setupFilterEvents() {
    const panel = document.getElementById('filterPanel');
    if (panel) {
        panel.addEventListener('click', (e) => {
            const chip = e.target.closest('.chip');
            if (chip) onChipClick(chip.dataset.group, chip.dataset.value);
        });
    }
    const active = document.getElementById('filterActive');
    if (active) {
        active.addEventListener('click', (e) => {
            if (e.target.closest('#activeClearBtn')) { resetFilters(); return; }
            const pill = e.target.closest('.active-pill');
            if (pill) removeActiveFilter(pill.dataset.group, pill.dataset.value);
        });
    }
    const hot = document.getElementById('hotTags');
    if (hot) {
        hot.addEventListener('click', (e) => {
            const tag = e.target.closest('.hot-tag');
            if (tag) onChipClick(tag.dataset.group, tag.dataset.value);
        });
    }
    const clearAll = document.getElementById('clearAllBtn');
    if (clearAll) clearAll.addEventListener('click', resetFilters);

    const search = document.getElementById('searchInput');
    if (search) {
        let t;
        search.addEventListener('input', () => {
            clearTimeout(t);
            t = setTimeout(() => setSearch(search.value), 180);
        });
    }
    const sortSel = document.getElementById('sortSelect');
    if (sortSel) sortSel.addEventListener('change', () => { state.sort = sortSel.value; applyState(); });

    document.querySelectorAll('.view-btn').forEach((btn) =>
        btn.addEventListener('click', () => setView(btn.dataset.view)));
}

function setupCompare() {
    const grid = document.getElementById('stylesGrid');
    if (grid) {
        grid.addEventListener('change', (e) => {
            const cb = e.target.closest('.compare-check');
            if (cb) toggleCompare(cb.dataset.compareId, cb.checked);
        });
    }
    const openBtn = document.getElementById('compareOpenBtn');
    const clearBtn = document.getElementById('compareClearBtn');
    const closeBtn = document.getElementById('compareCloseBtn');
    const overlay = document.getElementById('compareOverlay');
    if (openBtn) openBtn.addEventListener('click', openCompare);
    if (clearBtn) clearBtn.addEventListener('click', () => { state.compare = []; syncCompareChecks(); renderCompareBar(); writeUrl(); });
    if (closeBtn) closeBtn.addEventListener('click', closeCompare);
    if (overlay) overlay.addEventListener('click', (e) => { if (e.target === overlay) closeCompare(); });
}

/* ============================================================
   启动
   ============================================================ */
function init() {
    detectCapabilities();
    readUrl();
    ensureCards();
    renderFilterPanel();
    renderSortOptions();
    renderActiveFilters();
    renderHotTags();
    renderCompareBar();
    syncCompareChecks();
    const searchEl = document.getElementById('searchInput');
    if (searchEl && state.search) searchEl.value = state.search;
    setView(state.view);
    applyState();

    renderClipboard();
    updateFab();
    setupClipboard();
    setupFilterEvents();
    setupCompare();
    setupHashRouting();
    applyHash();
}

document.addEventListener('DOMContentLoaded', init);

document.addEventListener('click', (e) => {
    const overlay = document.getElementById('modalOverlay');
    if (overlay && e.target === overlay) closeModal();
});

document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    const compareOverlay = document.getElementById('compareOverlay');
    if (compareOverlay && compareOverlay.classList.contains('is-open')) { closeCompare(); return; }
    const drawer = document.getElementById('clipboardDrawer');
    if (drawer && drawer.classList.contains('is-open')) { closeClipboardDrawer(); return; }
    const overlay = document.getElementById('modalOverlay');
    if (overlay && overlay.classList.contains('active')) closeModal();
});

/* 暴露给内联 onclick */
Object.assign(window, {
    toggleTheme, resetFilters, closeModal, copyModalPrompt, copyPrompt,
    openModal, toggleClipboard, copyCssVars, setView,
});

// 便于调试与后续阶段扩展
window.UI_GALLERY = {
    STYLES, ERA_LABELS, CATEGORY_LABELS, FILTER_GROUPS, SORT_OPTIONS,
    getStyle, state, matchesAll, sortStyles, cssVarsOf, applyState, resetFilters,
};



