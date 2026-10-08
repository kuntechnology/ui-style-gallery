// ============================================================
// UI 设计风格集锦 · 分类体系 (P1)
// ------------------------------------------------------------
// 在 P0 的 era / category 基础上，补充多维可组合的筛选维度：
//   paradigm  范式：os 操作系统 / flat 扁平 / glass 玻璃拟物 /
//                  skeuo 3D拟物 / editorial 编辑排版 /
//                  retrofuture 复古未来 / other 其他
//   tone      色调：light 浅色 / dark 深色 / vivid 高饱和 / muted 低饱和
//   scenes[]  场景：saas / finance / ecommerce / social / gaming /
//                  oriental 文化东方 / tool 工具效率
// 由 styles.config.js 合并进每条 STYLES；新增风格时在此登记即可。
// ============================================================

export const TAXONOMY = {
  apple:        { paradigm: 'os',          tone: 'light', scenes: ['saas', 'tool'] },
  material:     { paradigm: 'os',          tone: 'light', scenes: ['saas', 'social'] },
  fluent:       { paradigm: 'os',          tone: 'light', scenes: ['saas', 'tool'] },
  neumorphism:  { paradigm: 'skeuo',       tone: 'light', scenes: ['saas', 'tool'] },
  glass:        { paradigm: 'glass',       tone: 'light', scenes: ['saas', 'social'] },
  flat:         { paradigm: 'flat',        tone: 'vivid', scenes: ['saas', 'social'] },
  gradient:     { paradigm: 'other',       tone: 'vivid', scenes: ['social', 'ecommerce'] },
  brutal:       { paradigm: 'flat',        tone: 'vivid', scenes: ['social', 'ecommerce', 'gaming'] },
  minimal:      { paradigm: 'flat',        tone: 'muted', scenes: ['saas', 'tool', 'ecommerce'] },
  dark:         { paradigm: 'flat',        tone: 'dark',  scenes: ['saas', 'tool'] },
  saas:         { paradigm: 'flat',        tone: 'light', scenes: ['saas'] },
  finance:      { paradigm: 'flat',        tone: 'muted', scenes: ['finance'] },
  ecommerce:    { paradigm: 'flat',        tone: 'light', scenes: ['ecommerce'] },
  social:       { paradigm: 'flat',        tone: 'vivid', scenes: ['social'] },
  gaming:       { paradigm: 'other',       tone: 'dark',  scenes: ['gaming'] },
  clay:         { paradigm: 'skeuo',       tone: 'vivid', scenes: ['social', 'ecommerce'] },
  bauhaus:      { paradigm: 'editorial',   tone: 'vivid', scenes: ['social', 'ecommerce'] },
  memphis:      { paradigm: 'other',       tone: 'vivid', scenes: ['social', 'ecommerce'] },
  cyber:        { paradigm: 'retrofuture', tone: 'dark',  scenes: ['gaming', 'tool'] },
  zen:          { paradigm: 'editorial',   tone: 'muted', scenes: ['oriental', 'tool'] },
  skeuo:        { paradigm: 'skeuo',       tone: 'light', scenes: ['tool', 'gaming'] },
  bento:        { paradigm: 'other',       tone: 'light', scenes: ['saas', 'tool'] },
  editorial:    { paradigm: 'editorial',   tone: 'muted', scenes: ['oriental', 'ecommerce'] },
  y3k:          { paradigm: 'retrofuture', tone: 'dark',  scenes: ['gaming', 'social'] },
  scrapbook:    { paradigm: 'editorial',   tone: 'light', scenes: ['social', 'oriental'] },
  liquid:       { paradigm: 'glass',       tone: 'vivid', scenes: ['saas', 'social'] },
  solarpunk:    { paradigm: 'other',       tone: 'vivid', scenes: ['social', 'tool'] },
  frutiger:     { paradigm: 'retrofuture', tone: 'light', scenes: ['social', 'tool'] },

  // ---- P2 新增 16 个风格 ----
  'linear-dark':     { paradigm: 'flat',       tone: 'dark',  scenes: ['saas', 'tool'] },
  vaporwave:         { paradigm: 'retrofuture', tone: 'vivid', scenes: ['social', 'gaming'] },
  'terminal-cli':    { paradigm: 'other',      tone: 'dark',  scenes: ['tool'] },
  spatial:           { paradigm: 'glass',      tone: 'dark',  scenes: ['saas', 'social'] },
  aurora:            { paradigm: 'other',      tone: 'vivid', scenes: ['saas', 'social'] },
  'art-deco':        { paradigm: 'editorial',  tone: 'dark',  scenes: ['finance', 'ecommerce'] },
  'ai-native':       { paradigm: 'flat',       tone: 'dark',  scenes: ['saas', 'tool'] },
  'retro-os':        { paradigm: 'skeuo',      tone: 'light', scenes: ['tool', 'gaming'] },
  pixel:             { paradigm: 'retrofuture', tone: 'vivid', scenes: ['gaming'] },
  'neo-chinese':     { paradigm: 'editorial',  tone: 'muted', scenes: ['oriental', 'ecommerce'] },
  'health-wearable': { paradigm: 'flat',       tone: 'dark',  scenes: ['tool'] },
  eink:              { paradigm: 'flat',       tone: 'muted', scenes: ['tool'] },
  'senior-friendly': { paradigm: 'flat',       tone: 'light', scenes: ['tool', 'finance'] },
  holographic:       { paradigm: 'other',      tone: 'dark',  scenes: ['social', 'ecommerce'] },
  'luxury-ecommerce':{ paradigm: 'editorial',  tone: 'light', scenes: ['ecommerce'] },
  'calm-tech':       { paradigm: 'flat',       tone: 'muted', scenes: ['tool', 'social'] },
};
