// ============================================================
// UI 设计风格集锦 · 应用逻辑 (P0 · 配置驱动重构)
// ------------------------------------------------------------
// 渲染 / 筛选 / 搜索 / 详情 / 剪贴板 全部读取 styles.config.js 的 STYLES。
// 新增一个风格：只需在 styles.config.js 加一条配置 + 在 previews.js
// 补一个 demo 标记，本文件无需改动。
// ============================================================

import { STYLES, ERA_LABELS, CATEGORY_LABELS } from './styles.config.js';
import { PREVIEWS } from './previews.js';
import { SUBTITLES } from './subtitles.js';

/* ---------- 索引与工具 ---------- */
const byId = new Map(STYLES.map((s) => [s.id, s]));
const getStyle = (id) => byId.get(id) || null;
const subtitleOf = (s) => SUBTITLES[s.id] || s.nameEn || '';

function escapeHtml(str) {
    return String(str == null ? '' : str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function categoryClass(cat) {
    return 'tag-' + (cat || 'mainstream');
}

/* ---------- 剪贴板状态（localStorage 持久化） ---------- */
let clipboardItems = (function () {
    try {
        const raw = JSON.parse(localStorage.getItem('ui-gallery-clipboard') || '[]');
        return Array.isArray(raw) ? raw.filter((id) => byId.has(id)) : [];
    } catch (e) {
        return [];
    }
})();
let currentModalPrompt = '';

/* ---------- 启动 ---------- */
document.addEventListener('DOMContentLoaded', () => {
    renderCards();
    renderClipboard();
    updateFab();
    refreshAllCardStars();
    setupClipboard();
    setupSearch();
    setupHashRouting();
    detectCapabilities();
});

/* ============================================================
   卡片渲染（配置驱动）
   ============================================================ */
function renderCards() {
    const grid = document.getElementById('stylesGrid');
    if (!grid) return;

    grid.innerHTML = STYLES.map((style) => {
        const subtitle = escapeHtml(subtitleOf(style));
        const demoMarkup = PREVIEWS[style.demo] || '';
        return `
            <div class="style-card" id="style-${style.id}" data-id="${style.id}" data-category="${style.category}" data-era="${style.era}" role="listitem" tabindex="0" aria-label="${escapeHtml(style.name)} 设计风格卡片，按 Enter 查看详情">
                <button class="card-star-btn" data-star-id="${style.id}" onclick="event.stopPropagation(); toggleClipboard('${style.id}', this);" title="加入剪贴板" aria-label="将 ${escapeHtml(style.name)} 加入提示词剪贴板">☆</button>
                <div class="card-preview">
                    <div class="${style.demo}">${demoMarkup}</div>
                </div>
                <div class="card-header">
                    <div>
                        <div class="card-title">${escapeHtml(style.name)}</div>
                        <div class="card-subtitle">${subtitle}</div>
                    </div>
                    <div class="card-tags">
                        <span class="tag ${categoryClass(style.category)}">${CATEGORY_LABELS[style.category] || ''}</span>
                    </div>
                </div>
                <div class="card-body">
                    <div class="card-features">
                        <h4>设计特点</h4>
                        <div class="feature-list">
                            ${style.features.map((f) => `<span class="feature-item">${escapeHtml(f)}</span>`).join('')}
                        </div>
                    </div>
                </div>
                <div class="card-footer">
                    <button class="copy-btn" onclick="event.stopPropagation(); copyPrompt('${style.id}')" aria-label="复制 ${escapeHtml(style.name)} 的提示词">
                        📋 复制提示词
                    </button>
                    <button class="expand-btn" onclick="event.stopPropagation(); openModal('${style.id}')" aria-label="查看 ${escapeHtml(style.name)} 详情" title="查看详情">
                        ⋯
                    </button>
                </div>
            </div>
        `;
    }).join('');

    document.querySelectorAll('.style-card').forEach((card) => {
        card.addEventListener('click', (e) => {
            if (e.target.closest('button')) return;
            const id = card.dataset.id;
            if (id) openModal(id);
        });
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                if (e.target.closest('button')) return;
                e.preventDefault();
                const id = card.dataset.id;
                if (id) openModal(id);
            }
        });
    });

    updateVisibleCount();
}

/* ============================================================
   能力探测：透明度 / 动效降级写回 html 属性供 CSS 使用
   ============================================================ */
function detectCapabilities() {
    const root = document.documentElement;
    const mqReduceTransparency = window.matchMedia && window.matchMedia('(prefers-reduced-transparency: reduce)');
    const mqReduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');
    root.setAttribute('data-transparency', mqReduceTransparency && mqReduceTransparency.matches ? 'reduced' : 'full');
    root.setAttribute('data-motion', mqReduceMotion && mqReduceMotion.matches ? 'reduced' : 'full');
}

/* ============================================================
   剪贴板（收藏）逻辑
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
        if (!id) return;
        if (isInClipboard(id)) {
            btn.classList.add('is-saved');
            btn.textContent = '★';
            btn.title = '已收藏 · 点击移除';
        } else {
            btn.classList.remove('is-saved');
            btn.textContent = '☆';
            btn.title = '加入剪贴板';
        }
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
        refreshAllCardStars();
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

    refreshAllCardStars();
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
    md += '> 来源：https://kuntechnology.github.io/ui-style-gallery/\n\n';
    md += '---\n\n';
    clipboardItems.forEach((id, idx) => {
        const s = getStyle(id);
        if (!s) return;
        md += '## ' + (idx + 1) + '. ' + s.name;
        if (subtitleOf(s)) md += ' · ' + subtitleOf(s);
        md += '\n\n';
        if (s.features && s.features.length) {
            md += '**设计特点：** ' + s.features.join('、') + '\n\n';
        }
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
                if (s) {
                    navigator.clipboard.writeText(s.aiPrompt || '').then(() => {
                        showToast('已复制 · ' + s.name, 'success');
                    });
                }
            } else if (btn.dataset.action === 'remove-one') {
                removeFromClipboard(id);
            }
        });
    }
}

/* ============================================================
   筛选 / 搜索 / 计数
   ============================================================ */
function applyFilters() {
    const searchEl = document.getElementById('searchInput');
    const term = (searchEl ? searchEl.value : '').toLowerCase().trim();
    const cards = document.querySelectorAll('.style-card');
    let visibleCount = 0;

    cards.forEach((card) => {
        const style = getStyle(card.dataset.id);
        if (!style) return;
        // 搜索范围：名称 + 副标题 + 特点 + 描述 + 标签 + 分类 + 提示词
        const haystack = [
            style.name, style.nameEn, subtitleOf(style),
            (style.tags || []).join(' '), (style.features || []).join(' '),
            style.summary, style.description, style.category,
            (style.bestFor || []).join(' '), style.aiPrompt,
        ].join(' ').toLowerCase();
        const match = !term || haystack.includes(term);
        card.classList.toggle('hidden', !match);
        if (match) visibleCount++;
    });

    const visEl = document.getElementById('visibleCount');
    if (visEl) visEl.textContent = visibleCount;
    const emptyEl = document.getElementById('emptyState');
    if (emptyEl) emptyEl.classList.toggle('show', visibleCount === 0);
}

function resetFilters() {
    const searchEl = document.getElementById('searchInput');
    if (searchEl) searchEl.value = '';
    applyFilters();
}

function setupSearch() {
    const el = document.getElementById('searchInput');
    if (el) el.addEventListener('input', applyFilters);
}

function updateVisibleCount() {
    const visible = document.querySelectorAll('.style-card:not(.hidden)').length;
    const el = document.getElementById('visibleCount');
    if (el) el.textContent = visible;
}

/* ============================================================
   复制提示词
   ============================================================ */
function copyPrompt(id) {
    const style = getStyle(id);
    if (!style) return;
    navigator.clipboard.writeText(style.aiPrompt || '').then(() => {
        showToast('提示词已复制到剪贴板', 'success');
        const btn = document.querySelector('[data-id="' + id + '"] .copy-btn');
        if (btn) {
            btn.classList.add('copied');
            btn.innerHTML = '✓ 已复制';
            setTimeout(() => {
                btn.classList.remove('copied');
                btn.innerHTML = '📋 复制提示词';
            }, 2000);
        }
    });
}

function copyModalPrompt() {
    navigator.clipboard.writeText(currentModalPrompt).then(() => {
        showToast('完整提示词已复制到剪贴板', 'success');
    });
}

/* ============================================================
   详情弹窗（含可分享锚点 #style-<id>）
   ============================================================ */
function renderTokenBar(style) {
    const t = style.tokens || {};
    const p = t.palette || {};
    const swatches = ['primary', 'bg', 'text', 'accent']
        .filter((k) => p[k])
        .map((k) => '<span class="token-swatch" style="background:' + escapeHtml(p[k]) + '" title="' + k + ' ' + escapeHtml(p[k]) + '"></span>')
        .join('');
    return `
        <div class="modal-section">
            <div class="modal-section-title">🎛️ 核心 Tokens</div>
            <div class="token-bar">
                <div class="token-row"><span class="token-key">圆角</span><span class="token-val">${escapeHtml(t.radius || '—')}</span></div>
                <div class="token-row"><span class="token-key">阴影</span><span class="token-val">${escapeHtml(t.shadow || '—')}</span></div>
                <div class="token-row"><span class="token-key">模糊</span><span class="token-val">${escapeHtml(t.blur || '—')}</span></div>
                <div class="token-row"><span class="token-key">动效</span><span class="token-val">${escapeHtml(t.motionDuration || '—')} · ${escapeHtml(t.motionEasing || '—')}</span></div>
                <div class="token-row"><span class="token-key">色板</span><span class="token-val token-swatches">${swatches}</span></div>
            </div>
        </div>`;
}

function openModal(id) {
    const style = getStyle(id);
    if (!style) return;

    currentModalPrompt = style.aiPrompt || '';
    document.getElementById('modalTitle').textContent = style.name;

    const sub = subtitleOf(style);
    document.getElementById('modalBody').innerHTML = `
        <div class="modal-section">
            <div class="modal-section-title">📖 风格概述</div>
            ${sub ? '<p class="modal-subtitle">' + escapeHtml(sub) + '</p>' : ''}
            <p class="modal-desc">${escapeHtml(style.description || style.summary || '')}</p>
        </div>
        <div class="modal-section">
            <div class="modal-section-title">✨ 设计特点</div>
            <div class="feature-list">
                ${style.features.map((f) => `<span class="feature-item">${escapeHtml(f)}</span>`).join('')}
            </div>
        </div>
        ${renderTokenBar(style)}
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
    overlay.classList.add('active');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    // 同步锚点，便于分享 / 刷新还原
    if (history.replaceState) history.replaceState(null, '', '#style-' + id);
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

/* ============================================================
   锚点路由：支持直接访问 #style-<slug> 打开详情
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
   主题切换
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

/* ============================================================
   Toast
   ============================================================ */
function showToast(message, type = 'default') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = message;
    toast.className = 'toast ' + type;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

/* ============================================================
   全局事件绑定 & 暴露给内联 onclick 的函数
   ============================================================ */
document.addEventListener('click', (e) => {
    const overlay = document.getElementById('modalOverlay');
    if (overlay && e.target === overlay) closeModal();
});

document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    const drawer = document.getElementById('clipboardDrawer');
    if (drawer && drawer.classList.contains('is-open')) {
        closeClipboardDrawer();
        return;
    }
    const overlay = document.getElementById('modalOverlay');
    if (overlay && overlay.classList.contains('active')) closeModal();
});

Object.assign(window, {
    toggleTheme,
    resetFilters,
    closeModal,
    copyModalPrompt,
    copyPrompt,
    openModal,
    toggleClipboard,
    applyFilters,
});

// 便于控制台调试与后续阶段扩展
window.UI_GALLERY = { STYLES, ERA_LABELS, CATEGORY_LABELS, getStyle };


