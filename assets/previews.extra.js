// ============================================================
// P2 · 新增 16 个风格 demo（自包含标记，无外部图片依赖）
// 每个 demo 使用内联样式 + pv-* 作用域类，可在离线环境独立渲染。
// ============================================================

export const EXTRA_PREVIEWS = {
  // A. Linear Dark · 深色 SaaS
  'preview-linear-dark': `
    <div style="position:absolute;inset:0;background:#0B0B0F;color:#E6E6E9;padding:14px;display:flex;flex-direction:column;gap:10px;">
      <div style="display:flex;align-items:center;gap:8px;font-size:11px;color:#8B8B94;">
        <span style="width:8px;height:8px;border-radius:50%;background:#5E6AD2;"></span> Linear · Inbox
      </div>
      <div style="background:#141418;border:1px solid #23232c;border-radius:8px;padding:8px 10px;display:flex;align-items:center;gap:8px;font-size:12px;">
        <span style="color:#8B8B94;border:1px solid #2a2a34;border-radius:4px;padding:0 4px;font-size:10px;">⌘K</span>
        <span style="color:#8B8B94;">命令面板…</span>
      </div>
      <div style="display:flex;flex-direction:column;gap:6px;font-size:11px;">
        <div style="display:flex;justify-content:space-between;padding:6px 8px;border-radius:6px;background:#121216;">
          <span>ENG-142 修复登录态</span><span style="color:#5E6AD2;">In&nbsp;Progress</span>
        </div>
        <div style="display:flex;justify-content:space-between;padding:6px 8px;border-radius:6px;">
          <span style="color:#C9C9D1;">ENG-138 优化查询</span><span style="color:#8B8B94;">Todo</span>
        </div>
        <div style="display:flex;justify-content:space-between;padding:6px 8px;border-radius:6px;">
          <span style="color:#C9C9D1;">ENG-131 文档站</span><span style="color:#3FB950;">Done</span>
        </div>
      </div>
    </div>`,

  // B. Vaporwave · 蒸汽波（替代与既有 bento 重复的项）
  'preview-vaporwave': `
    <div style="position:absolute;inset:0;background:linear-gradient(180deg,#1A0033 0%,#3B0A5A 55%,#FF6EC7 100%);overflow:hidden;display:flex;flex-direction:column;justify-content:flex-end;padding:16px;">
      <div style="position:absolute;left:0;right:0;top:50%;height:150px;background-image:linear-gradient(rgba(255,110,199,.6) 1px,transparent 1px),linear-gradient(90deg,rgba(255,110,199,.6) 1px,transparent 1px);background-size:14px 14px;transform:perspective(120px) rotateX(58deg);transform-origin:top;"></div>
      <div style="position:absolute;left:50%;top:26%;transform:translateX(-50%);width:56px;height:56px;border-radius:50%;background:radial-gradient(circle at 50% 50%,#FFE45E,#FF6EC7 72%);box-shadow:0 0 32px #FF6EC7;"></div>
      <div style="position:relative;font-size:20px;font-weight:800;letter-spacing:.24em;color:#EAEAEA;text-shadow:2px 0 #00E5FF,-2px 0 #FF2E88;">V A P O R</div>
    </div>`,

  // C. Terminal / CLI
  'preview-terminal-cli': `
    <div style="position:absolute;inset:0;background:#0C0C0C;padding:14px;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:11.5px;line-height:1.95;color:#D0D0D0;">
      <div><span style="color:#4AF626;">➜</span> <span style="color:#6E6E6E;">~/app</span> npm run build</div>
      <div style="color:#8A8A8A;">✓ built in 1.24s</div>
      <div><span style="color:#4AF626;">➜</span> <span style="color:#6E6E6E;">~/app</span> deploy --prod</div>
      <div style="color:#8A8A8A;">uploading 42 files…</div>
      <div><span style="color:#4AF626;">➜</span> <span style="color:#6E6E6E;">~/app</span><span class="pv-caret">▍</span></div>
    </div>`,

  // D. Spatial / visionOS · 空间界面（替代与既有 liquid 重复的项）
  'preview-spatial': `
    <div style="position:absolute;inset:0;background:radial-gradient(circle at 50% 28%,#2A2D3A,#0C0D12 70%);display:flex;align-items:center;justify-content:center;">
      <div style="width:74%;padding:16px;border-radius:24px;background:rgba(255,255,255,.10);border:1px solid rgba(255,255,255,.28);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);box-shadow:0 24px 50px rgba(0,0,0,.5),inset 0 1px 0 rgba(255,255,255,.45);color:#EDEFF5;text-align:center;">
        <div style="width:56px;height:56px;margin:0 auto 10px;border-radius:16px;background:linear-gradient(135deg,#7C9CFF,#B18CFF);box-shadow:0 10px 24px rgba(124,156,255,.45);"></div>
        <div style="font-size:12px;font-weight:700;">Spatial Window</div>
        <div style="font-size:10px;opacity:.75;margin-top:4px;">depth · materials · presence</div>
      </div>
    </div>`,

  // E. Aurora Gradient · 极光光斑
  'preview-aurora': `
    <div style="position:absolute;inset:0;background:#0A0A1A;overflow:hidden;">
      <div class="pv-aurora-blob"></div>
      <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;">
        <div style="font-size:17px;font-weight:800;color:#F8FAFC;background:rgba(10,10,26,.45);padding:5px 14px;border-radius:12px;">Aurora</div>
        <div style="font-size:11px;color:#C7D2FE;background:rgba(10,10,26,.4);padding:3px 11px;border-radius:9px;">柔和光斑 · 空间感</div>
      </div>
    </div>`,

  // F. Art Deco · 装饰艺术
  'preview-art-deco': `
    <div style="position:absolute;inset:0;background:#0E0E0E;display:flex;align-items:center;justify-content:center;overflow:hidden;">
      <div style="position:absolute;inset:0;background:repeating-conic-gradient(from 0deg at 50% 130%, rgba(201,162,39,.22) 0deg 3deg, transparent 3deg 9deg);"></div>
      <div style="position:relative;text-align:center;padding:18px 24px;border:1px solid rgba(201,162,39,.6);">
        <div style="height:6px;border-top:1px solid #C9A227;border-bottom:1px solid #C9A227;margin-bottom:10px;"></div>
        <div style="font-family:Georgia,'Times New Roman',serif;font-size:24px;letter-spacing:.2em;color:#C9A227;">DECO</div>
        <div style="height:1px;background:#C9A227;margin:9px auto;width:64px;"></div>
        <div style="font-size:10px;letter-spacing:.34em;color:#F2E9D8;">GRAND&nbsp;HÔTEL</div>
      </div>
    </div>`,

  // G. AI-Native / Copilot · AI 原生界面（替代与既有 bauhaus 重复的项）
  'preview-ai-native': `
    <div style="position:absolute;inset:0;background:#0D0D12;padding:14px;display:flex;flex-direction:column;justify-content:space-between;color:#EDEDF2;">
      <div style="display:flex;align-items:center;gap:8px;font-size:11px;color:#9AA0AE;">
        <span style="width:16px;height:16px;border-radius:5px;background:linear-gradient(135deg,#6E8BFF,#C08BFF);"></span> Copilot
      </div>
      <div style="background:#161620;border:1px solid #262633;border-radius:12px;padding:10px;font-size:11.5px;line-height:1.7;">
        <span style="color:#9AA0AE;">你：</span>帮我总结这份周报<br>
        <span style="color:#8FA8FF;">✦ </span>本周完成 3 项关键任务，风险 1 项…
      </div>
      <div style="display:flex;gap:6px;">
        <span style="font-size:10px;padding:4px 10px;border-radius:999px;background:#1E1E2A;border:1px solid #2A2A3A;color:#C7CCDA;">重新生成</span>
        <span style="font-size:10px;padding:4px 10px;border-radius:999px;background:#1E1E2A;border:1px solid #2A2A3A;color:#C7CCDA;">插入正文</span>
      </div>
    </div>`,

  // I. Retro macOS / Win95 · 复古桌面
  'preview-retro-os': `
    <div style="position:absolute;inset:0;background:#008080;padding:14px;display:flex;align-items:flex-start;">
      <div style="width:100%;background:#C0C0C0;border:2px solid #FFFFFF;border-right-color:#808080;border-bottom-color:#808080;box-shadow:1px 1px 0 #000000;font-size:11px;color:#000000;">
        <div style="background:linear-gradient(90deg,#000080,#1084D0);color:#FFFFFF;padding:3px 6px;display:flex;justify-content:space-between;align-items:center;">
          <span>C:\\WINDOWS</span>
          <span style="background:#C0C0C0;color:#000000;border:1px solid #FFFFFF;border-right-color:#808080;border-bottom-color:#808080;padding:0 4px;">✕</span>
        </div>
        <div style="padding:9px;display:flex;flex-direction:column;gap:7px;">
          <div>📁 My Computer</div>
          <div>📄 readme.txt</div>
          <div style="margin-top:3px;background:#C0C0C0;border:2px solid #FFFFFF;border-right-color:#808080;border-bottom-color:#808080;padding:2px 12px;width:fit-content;">OK</div>
        </div>
      </div>
    </div>`,

  // J. 8-bit Pixel · 像素
  'preview-pixel': `
    <div style="position:absolute;inset:0;background:#1A1C2C;padding:16px;display:flex;flex-direction:column;justify-content:space-between;font-family:ui-monospace,SFMono-Regular,monospace;">
      <div style="display:flex;justify-content:space-between;align-items:center;font-size:11px;letter-spacing:.08em;color:#F4F4F4;">
        <span>LV.7</span><span style="color:#F8D800;">◆ 1280</span>
      </div>
      <div>
        <div style="font-size:10px;color:#F4F4F4;letter-spacing:.14em;margin-bottom:6px;">HP</div>
        <div style="height:14px;background:#2A2E45;border:2px solid #111111;padding:2px;">
          <div style="height:100%;width:62%;background:#41A6F6;"></div>
        </div>
        <div style="margin-top:10px;font-size:13px;color:#F8D800;letter-spacing:.14em;">PRESS&nbsp;START</div>
      </div>
    </div>`,

  // K. 新中式 / 国潮
  'preview-neo-chinese': `
    <div style="position:absolute;inset:0;background:#F5F1E8;padding:16px;display:flex;flex-direction:column;justify-content:space-between;">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;">
        <div style="font-family:Georgia,'Times New Roman',serif;font-size:22px;color:#2B2B2B;letter-spacing:.06em;">新·中式</div>
        <div style="width:26px;height:26px;background:#B03A2E;color:#F5F1E8;font-size:10px;display:flex;align-items:center;justify-content:center;border-radius:4px;">印</div>
      </div>
      <div>
        <div style="height:1px;background:rgba(43,43,43,.25);margin-bottom:10px;"></div>
        <div style="font-size:11px;color:#2E5A6B;letter-spacing:.22em;">ZHU&nbsp;SHA · DAI&nbsp;LAN</div>
        <div style="font-size:11px;color:#6B6257;margin-top:5px;">留白 · 东方 · 当代</div>
      </div>
    </div>`,

  // L. Health Wearable · 健康穿戴
  'preview-health-wearable': `
    <div style="position:absolute;inset:0;background:#0B1220;padding:16px;display:flex;flex-direction:column;justify-content:space-between;color:#E8EEF9;">
      <div style="font-size:11px;color:#8FA3BF;letter-spacing:.12em;">今日活动</div>
      <div style="display:flex;align-items:center;gap:14px;">
        <div style="width:66px;height:66px;border-radius:50%;background:conic-gradient(#34D399 0 72%,rgba(255,255,255,.12) 72% 100%);display:flex;align-items:center;justify-content:center;">
          <div style="width:48px;height:48px;border-radius:50%;background:#0B1220;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:700;">72%</div>
        </div>
        <div>
          <div style="font-size:26px;font-weight:800;line-height:1;">8,420</div>
          <div style="font-size:11px;color:#8FA3BF;margin-top:4px;">步 · 目标 12000</div>
        </div>
      </div>
      <div style="font-size:10px;color:#5B7391;">🔒 健康数据仅存于本机</div>
    </div>`,

  // M. E-ink / 低功耗电子墨水
  'preview-eink': `
    <div style="position:absolute;inset:0;background:#EDEAE3;padding:18px;display:flex;flex-direction:column;justify-content:space-between;color:#1F1F1F;font-family:Georgia,'Times New Roman',serif;">
      <div style="font-size:11px;letter-spacing:.16em;color:#6B675E;font-family:ui-sans-serif,system-ui;">E-INK · 电子墨水</div>
      <div style="font-size:17px;line-height:1.55;">灰度层级带来的<br>安静阅读体验</div>
      <div style="display:flex;gap:5px;">
        <span style="width:26px;height:9px;background:#1F1F1F;"></span>
        <span style="width:26px;height:9px;background:#4A4A4A;"></span>
        <span style="width:26px;height:9px;background:#7D7D7D;"></span>
        <span style="width:26px;height:9px;background:#B4B4B4;"></span>
        <span style="width:26px;height:9px;background:#D8D5CE;"></span>
      </div>
    </div>`,

  // N. Senior Friendly · 适老化
  'preview-senior-friendly': `
    <div style="position:absolute;inset:0;background:#FFFFFF;padding:16px;display:flex;flex-direction:column;justify-content:space-between;color:#111111;">
      <div style="font-size:15px;font-weight:700;">早上好，王阿姨</div>
      <div style="display:flex;flex-direction:column;gap:10px;">
        <button style="font-size:15px;font-weight:700;padding:12px 14px;border-radius:12px;border:none;background:#0B57D0;color:#FFFFFF;text-align:left;">👨⚕️ 联系我的医生</button>
        <button style="font-size:15px;font-weight:700;padding:12px 14px;border-radius:12px;background:#FFFFFF;color:#111111;border:2px solid #111111;text-align:left;">💊 查看今天用药</button>
      </div>
      <div style="font-size:13px;color:#444444;">字体可放大至 200% 不横向滚动</div>
    </div>`,

  // O. Holographic · 全息薄膜
  'preview-holographic': `
    <div style="position:absolute;inset:0;background:linear-gradient(135deg,#0E0B1A,#1B1030);display:flex;align-items:center;justify-content:center;overflow:hidden;">
      <div class="pv-holo"></div>
      <div style="position:relative;text-align:center;">
        <div style="font-size:20px;font-weight:800;letter-spacing:.04em;color:#F5F3FF;background:rgba(14,11,26,.55);padding:4px 13px;border-radius:10px;">HOLO</div>
        <div style="margin-top:9px;font-size:11px;color:#D8CCFF;background:rgba(14,11,26,.5);padding:3px 11px;border-radius:8px;display:inline-block;">薄膜干涉 · 文字需衬底</div>
      </div>
    </div>`,

  // P. E-commerce Luxury · 奢侈品电商
  'preview-luxury-ecommerce': `
    <div style="position:absolute;inset:0;background:#FAF8F4;padding:16px;display:flex;flex-direction:column;justify-content:space-between;">
      <div style="font-size:10px;letter-spacing:.3em;color:#8A8378;">M&nbsp;A&nbsp;I&nbsp;S&nbsp;O&nbsp;N</div>
      <div>
        <div style="width:100%;height:72px;background:linear-gradient(135deg,#E7E1D6,#D7CEC0);border-radius:2px;"></div>
        <div style="margin-top:11px;font-family:Georgia,'Times New Roman',serif;font-size:16px;color:#211E1A;">真丝长裙</div>
        <div style="font-size:12px;color:#6B655B;margin-top:3px;letter-spacing:.04em;">¥&nbsp;12,800</div>
      </div>
    </div>`,

  // Q. Calm Technology · 平静技术
  'preview-calm-tech': `
    <div style="position:absolute;inset:0;background:#121212;padding:18px;display:flex;flex-direction:column;justify-content:center;gap:15px;color:#E5E5E5;">
      <div style="display:flex;align-items:center;gap:11px;font-size:12px;">
        <span style="width:8px;height:8px;border-radius:50%;background:#4ADE80;"></span> 室内空气 · 优
      </div>
      <div style="display:flex;align-items:center;gap:11px;font-size:12px;">
        <span style="width:8px;height:8px;border-radius:50%;background:#FACC15;"></span> 路由器 · 建议重启
      </div>
      <div style="font-size:10px;color:#8A8A8A;margin-top:2px;">仅在状态变化时提示，其余保持沉默</div>
    </div>`,
};

