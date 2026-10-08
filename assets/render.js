// ============================================================
// UI 设计风格集锦 · 卡片渲染 (P1)
// ------------------------------------------------------------
// 运行时（app.js）与构建期静态预渲染（tools/render-static.mjs）共用本模块，
// 保证「用户看到的」与「爬虫看到的」两套 HTML 完全一致。
// ============================================================

import { CATEGORY_LABELS } from './styles.config.js';
import { PREVIEWS } from './previews.js';
import { SUBTITLES } from './subtitles.js';

export function escapeHtml(str) {
    return String(str == null ? '' : str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

export function categoryClass(cat) {
    return 'tag-' + (cat || 'mainstream');
}

export function subtitleOf(style) {
    return SUBTITLES[style.id] || style.nameEn || '';
}

/** 单张卡片的 HTML（含 P1 的对比勾选、筛选用 data-* 属性、锚点 id） */
export function cardHTML(style) {
    const subtitle = escapeHtml(subtitleOf(style));
    const demoMarkup = PREVIEWS[style.demo] || '';
    const scenes = (style.scenes || []).join(' ');
    const catLabel = CATEGORY_LABELS[style.category] || '';
    return `
            <div class="style-card" id="style-${style.id}" data-id="${style.id}" data-category="${style.category || ''}" data-era="${style.era || ''}" data-paradigm="${style.paradigm || ''}" data-tone="${style.tone || ''}" data-scenes="${escapeHtml(scenes)}" role="listitem" tabindex="0" aria-label="${escapeHtml(style.name)} 设计风格卡片，按 Enter 查看详情">
                <div class="card-toolbar">
                    <button class="card-star-btn" data-star-id="${style.id}" onclick="event.stopPropagation(); toggleClipboard('${style.id}', this);" title="加入剪贴板" aria-label="将 ${escapeHtml(style.name)} 加入提示词剪贴板">☆</button>
                    <label class="card-compare" title="勾选后可与其他风格对比" onclick="event.stopPropagation()">
                        <input type="checkbox" class="compare-check" data-compare-id="${style.id}" aria-label="选择 ${escapeHtml(style.name)} 加入对比">
                        <span class="compare-text" aria-hidden="true">对比</span>
                    </label>
                </div>
                <div class="card-preview">
                    <div class="${style.demo}">${demoMarkup}</div>
                </div>
                <div class="card-header">
                    <div>
                        <div class="card-title">${escapeHtml(style.name)}</div>
                        <div class="card-subtitle">${subtitle}</div>
                    </div>
                    <div class="card-tags">
                        <span class="tag ${categoryClass(style.category)}">${catLabel}</span>
                    </div>
                </div>
                <div class="card-body">
                    <div class="card-features">
                        <h4>设计特点</h4>
                        <div class="feature-list">
                            ${(style.features || []).map((f) => `<span class="feature-item">${escapeHtml(f)}</span>`).join('')}
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
            </div>`;
}

/** 整片网格的 HTML（静态预渲染用） */
export function gridHTML(styles) {
    return styles.map(cardHTML).join('\n');
}
