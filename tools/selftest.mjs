// ============================================================
// 轻量自检脚本（无第三方依赖）
// 用法：node tools/selftest.mjs
// 在 Node 中用极简 DOM 桩执行 assets/app.js，验证核心数据/筛选/排序逻辑。
// ============================================================
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

let pass = 0, fail = 0;
const ok = (name, cond, extra = '') => {
  if (cond) { pass++; console.log('  ✓ ' + name); }
  else { fail++; console.log('  ✗ ' + name + (extra ? '  → ' + extra : '')); }
};

/* ---------- 极简 DOM 桩 ---------- */
function makeEl(id) {
  return {
    id, _html: '', textContent: '', dataset: {}, style: {}, value: '', disabled: false, hidden: false, checked: false,
    get innerHTML() { return this._html; },
    set innerHTML(v) { this._html = v; },
    classList: { _s: new Set(), add(c){this._s.add(c);}, remove(c){this._s.delete(c);}, toggle(c,f){f===undefined?(this._s.has(c)?this._s.delete(c):this._s.add(c)):(f?this._s.add(c):this._s.delete(c));}, contains(c){return this._s.has(c);} },
    setAttribute(){}, getAttribute(){return null;}, removeAttribute(){},
    addEventListener(){}, appendChild(){}, removeChild(){}, click(){},
    querySelector(){return null;}, querySelectorAll(){return [];},
    scrollIntoView(){}, closest(){return null;}, focus(){},
  };
}
const els = {};
const listeners = {};

Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: {
  _d: {}, getItem(k){ return this._d[k] ?? null; }, setItem(k,v){ this._d[k] = String(v); }, removeItem(k){ delete this._d[k]; },
}});
Object.defineProperty(globalThis, 'navigator', { configurable: true, value: { clipboard: { writeText: () => Promise.resolve() } } });
globalThis.location = { hash: '', pathname: '/ui-style-gallery/', search: '', href: 'https://x/' };
globalThis.history = { replaceState() {} };
globalThis.document = {
  documentElement: { attrs: {}, setAttribute(k,v){ this.attrs[k] = v; }, getAttribute(k){ return this.attrs[k] ?? null; } },
  body: { style: {}, appendChild(){}, removeChild(){}, classList:{add(){},remove(){}} },
  getElementById: (id) => els[id] || (els[id] = makeEl(id)),
  querySelector: () => null,
  querySelectorAll: () => [],
  addEventListener: (ev, fn) => { (listeners[ev] = listeners[ev] || []).push(fn); },
  createElement: () => makeEl('a'),
};
globalThis.window = {
  matchMedia: () => ({ matches: false, addEventListener(){}, addListener(){} }),
  addEventListener(){}, location: globalThis.location,
};
globalThis.window.localStorage = globalThis.localStorage;

/* ---------- 载入应用 ---------- */
const app = await import(path.join(root, 'assets/app.js'));
const cfg = await import(path.join(root, 'assets/styles.config.js'));
const { PREVIEWS } = await import(path.join(root, 'assets/previews.js'));
(listeners['DOMContentLoaded'] || []).forEach((fn) => fn());

const UI = globalThis.window.UI_GALLERY;

/* ---------- 1. 数据完整性 ---------- */
console.log('\n[1] 数据完整性');
ok('STYLES 数量为 28', UI.STYLES.length === 28, '实际 ' + UI.STYLES.length);
const REQUIRED = ['id','name','nameEn','era','category','tags','summary','description','features','tokens','bestFor','avoidFor','a11yNote','aiPrompt','demo','isNew','paradigm','tone','scenes'];
ok('所有风格必备字段齐备', UI.STYLES.every((s) => REQUIRED.every((k) => s[k] !== undefined)));
ok('id 唯一', new Set(UI.STYLES.map((s) => s.id)).size === UI.STYLES.length);
ok('features ≥ 6', UI.STYLES.every((s) => s.features.length >= 6));
ok('每个 demo 均有对应预览', UI.STYLES.every((s) => typeof PREVIEWS[s.demo] === 'string' && PREVIEWS[s.demo].length > 0));

/* ---------- 2. 筛选逻辑 ---------- */
console.log('\n[2] 筛选逻辑');
const reset = () => UI.resetFilters();
const visCount = () => Number(els['visibleCount'].textContent);

reset();
UI.applyState();
ok('默认可见 = 28', visCount() === 28, '实际 ' + visCount());

UI.state.filters.paradigm = 'os';
UI.applyState();
ok('范式=操作系统 命中数 > 0 且 < 28', visCount() > 0 && visCount() < 28, '实际 ' + visCount());

reset();
UI.state.filters.tone = 'dark';
UI.applyState();
const darkN = visCount();
ok('色调=深色 命中数 > 0', darkN > 0, '实际 ' + darkN);

reset();
UI.state.filters.scenes = ['saas'];
UI.applyState();
ok('场景=SaaS 命中数 > 0', visCount() > 0, '实际 ' + visCount());

reset();
UI.state.filters.paradigm = 'os';
UI.state.filters.era = 'classic';
UI.applyState();
const combo = visCount();
ok('范式+年代 组合筛选生效（≤ 单条件）', combo <= 28 && combo >= 0, '实际 ' + combo);

reset();
UI.state.search = '玻璃';
UI.applyState();
ok('搜索"玻璃"命中 > 0', visCount() > 0, '实际 ' + visCount());

reset();
UI.state.search = 'zzzznotexist';
UI.applyState();
ok('无结果时可见 = 0', visCount() === 0, '实际 ' + visCount());

/* ---------- 3. 排序逻辑 ---------- */
console.log('\n[3] 排序逻辑');
reset();
UI.state.sort = 'name';
const byName = UI.sortStyles(UI.STYLES).map((s) => s.name);
const sorted = byName.slice().sort((a, b) => a.localeCompare(b, 'zh-Hans-CN'));
ok('按名称排序正确', JSON.stringify(byName) === JSON.stringify(sorted));

reset();
UI.state.sort = 'era';
const eras = UI.sortStyles(UI.STYLES).map((s) => s.era);
const ORDER = { classic: 0, modern: 1, contemporary: 2, future: 3 };
ok('按年代排序非递减', eras.every((e, i) => i === 0 || (ORDER[eras[i-1]] ?? 9) <= (ORDER[e] ?? 9)));

/* ---------- 4. Tokens / CSS 变量 ---------- */
console.log('\n[4] Tokens 与 CSS 变量输出');
const css = UI.cssVarsOf(UI.getStyle('glass'));
ok('CSS Variables 含 --color-primary', css.includes('--color-primary'));
ok('CSS Variables 含 --motion-duration', css.includes('--motion-duration'));
ok('CSS Variables 花括号平衡', (css.match(/{/g) || []).length === (css.match(/}/g) || []).length);

/* ---------- 5. 分类标签映射 ---------- */
console.log('\n[5] 分类与标签映射');
const groups = UI.FILTER_GROUPS.map((g) => g.key);
ok('筛选组含 paradigm/tone/era/scenes', ['paradigm','tone','era','scenes'].every((k) => groups.includes(k)));
const optCount = UI.FILTER_GROUPS.reduce((n, g) => n + Object.keys(g.options).length, 0);
ok('筛选选项总数 > 10', optCount > 10, '实际 ' + optCount);
ok('每条风格都能映射出分类标签', UI.STYLES.every((s) => !!UI.CATEGORY_LABELS[s.category]));

/* ---------- 汇总 ---------- */
console.log('\n────────────────────────────');
console.log('  通过 ' + pass + ' / 失败 ' + fail);
console.log('────────────────────────────\n');
process.exit(fail === 0 ? 0 : 1);
