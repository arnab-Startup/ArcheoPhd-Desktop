/**
 * ArchaeoPhD — Native Data Root Manager
 * Pure Vanilla JS + Scoped CSS
 * 
 * Styled with ArchaeoPhD Design System:
 * - Uses app CSS variables: hsl(var(--primary)), hsl(var(--card)), hsl(var(--foreground)), etc.
 * - Classical academic typography: var(--font-heading) ('Fraunces') and var(--font-body) ('Inter')
 * - Full light/dark mode adaptability (Warm parchment/terracotta in light, Obsidian/amber in dark)
 * - Zero intrusive pills, clean modals, seamless /settings card integration
 */
(function() {
  'use strict';
  // ArchaeoPhD Modern SVG Icon Library (Executive Offline Aesthetic)
  var APD_ICONS = {
    landmark: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="apd-icon"><line x1="2" x2="22" y1="22" y2="22"/><line x1="12" x2="12" y1="2" y2="6"/><polyline points="2 6 12 2 22 6"/><line x1="4" x2="4" y1="18" y2="22"/><line x1="8" x2="8" y1="18" y2="22"/><line x1="16" x2="16" y1="18" y2="22"/><line x1="20" x2="20" y1="18" y2="22"/><path d="M4 18h16"/><path d="M4 6h16"/></svg>',
    warning: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="apd-icon"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg>',
    folder: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="apd-icon"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/></svg>',
    folderOpen: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="apd-icon"><path d="m6 14 1.45-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.55 6a2 2 0 0 1-1.94 1.5H4a2 2 0 0 1-2-2V5c0-1.1.9-2 2-2h3.93a2 2 0 0 1 1.66.9l.82 1.2a2 2 0 0 0 1.66.9H18a2 2 0 0 1 2 2v2"/></svg>',
    ingest: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="apd-icon"><path d="M12 17V3"/><path d="m6 11 6 6 6-6"/><path d="M19 21H5"/></svg>',
    gear: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="apd-icon"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>',
    check: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="apd-icon"><polyline points="20 6 9 17 4 12"/></svg>',
    checkCircle: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="apd-icon"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
    shield: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="apd-icon"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
    copy: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="apd-icon"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>',
    clipboard: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="apd-icon"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/></svg>',
    verify: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="apd-icon"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="m9 14 2 2 4-4"/></svg>',
    transcribe: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="apd-icon"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>',
    scale: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="apd-icon"><path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M7 21h10"/><path d="M12 3v18"/><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/></svg>',
    x: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="apd-icon"><line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/></svg>',
    refresh: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="apd-icon"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 21h5v-5"/></svg>',
    search: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="apd-icon"><circle cx="11" cy="11" r="8"/><line x1="21" x2="16.65" y1="21" y2="16.65"/></svg>',
    lock: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="apd-icon"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>',
    brain: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="apd-icon"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-2.04Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-2.04Z"/></svg>',
    library: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="apd-icon"><path d="m16 6 4 14"/><path d="M12 6v14"/><path d="M8 8v12"/><path d="M4 4v16"/></svg>',
    hardDrive: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="apd-icon"><line x1="22" x2="2" y1="12" y2="12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/><line x1="6" x2="6.01" y1="16" y2="16"/><line x1="10" x2="10.01" y1="16" y2="16"/></svg>'
  };


  var currentStatus = null;

  // Insert scoped styling that inherits the app's Tailwind tokens & typography
  function injectStyles() {
    if (document.getElementById('apd-styles')) return;
    var style = document.createElement('style');
    style.id = 'apd-styles';
    style.textContent = `
      .apd-icon { display: inline-block; vertical-align: -2px; stroke: currentColor; flex-shrink: 0; }
      .apd-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(15, 12, 10, 0.65);
        backdrop-filter: blur(6px);
        -webkit-backdrop-filter: blur(6px);
        z-index: 999999;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 24px;
        font-family: var(--font-body, "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif);
        color: hsl(var(--foreground, 30 10% 12%));
        animation: apdFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      }
      @keyframes apdFadeIn {
        from { opacity: 0; transform: scale(0.97); }
        to { opacity: 1; transform: scale(1); }
      }
      .apd-modal {
        background: hsl(var(--card, 40 33% 99%));
        border: 1px solid hsl(var(--border, 36 16% 87%));
        border-radius: calc(var(--radius, 10px) + 6px);
        width: 100%;
        max-width: 600px;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px hsl(var(--border, 36 16% 87%) / 0.5);
        overflow: hidden;
        display: flex;
        flex-direction: column;
        color: hsl(var(--card-foreground, 30 10% 12%));
      }
      .apd-header {
        padding: 24px 28px 18px;
        border-bottom: 1px solid hsl(var(--border, 36 16% 87%));
        background: hsl(var(--muted, 38 20% 94%) / 0.4);
      }
      .apd-badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: hsl(var(--primary, 18 58% 28%));
        background: hsl(var(--primary, 18 58% 28%) / 0.1);
        border: 1px solid hsl(var(--primary, 18 58% 28%) / 0.25);
        padding: 4px 10px;
        border-radius: 999px;
        margin-bottom: 10px;
        font-family: var(--font-body, inherit);
      }
      .apd-title {
        font-family: var(--font-heading, "Fraunces", Georgia, serif);
        font-size: 22px;
        font-weight: 600;
        color: hsl(var(--foreground, 30 10% 12%));
        margin: 0 0 6px 0;
        line-height: 1.25;
        letter-spacing: -0.015em;
      }
      .apd-subtitle {
        font-size: 13.5px;
        color: hsl(var(--muted-foreground, 30 8% 42%));
        margin: 0;
        line-height: 1.5;
        font-family: var(--font-body, inherit);
      }
      .apd-body {
        padding: 24px 28px;
        display: flex;
        flex-direction: column;
        gap: 18px;
        max-height: 70vh;
        overflow-y: auto;
      }
      .apd-structure-box {
        background: hsl(var(--muted, 38 20% 94%) / 0.5);
        border: 1px solid hsl(var(--border, 36 16% 87%));
        border-radius: var(--radius, 10px);
        padding: 14px 16px;
        font-family: var(--font-mono, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace);
        font-size: 12px;
        color: hsl(var(--foreground, 30 10% 12%));
        line-height: 1.6;
      }
      .apd-structure-box span.hl {
        color: hsl(var(--primary, 18 58% 28%));
        font-weight: 600;
      }
      .apd-label {
        font-size: 12.5px;
        font-weight: 600;
        color: hsl(var(--foreground, 30 10% 12%));
        margin-bottom: 6px;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .apd-input-row {
        display: flex;
        gap: 8px;
      }
      .apd-input {
        flex: 1;
        background: hsl(var(--background, 40 30% 98%));
        border: 1px solid hsl(var(--input, 36 16% 87%));
        border-radius: var(--radius, 8px);
        padding: 10px 14px;
        font-size: 13px;
        color: hsl(var(--foreground, 30 10% 12%));
        outline: none;
        transition: border-color 0.15s, box-shadow 0.15s;
        font-family: inherit;
      }
      .apd-input:focus {
        border-color: hsl(var(--ring, 18 58% 28%));
        box-shadow: 0 0 0 3px hsl(var(--ring, 18 58% 28%) / 0.2);
      }
      .apd-btn {
        padding: 9px 18px;
        font-size: 13px;
        font-weight: 600;
        border-radius: var(--radius, 8px);
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        transition: all 0.15s ease;
        border: 1px solid transparent;
        font-family: inherit;
      }
      .apd-btn-primary {
        background: hsl(var(--primary, 18 58% 28%));
        color: hsl(var(--primary-foreground, 40 30% 98%));
        border-color: hsl(var(--primary, 18 58% 28%));
      }
      .apd-btn-primary:hover {
        filter: brightness(1.08);
        transform: translateY(-1px);
        box-shadow: 0 3px 10px hsl(var(--primary, 18 58% 28%) / 0.25);
      }
      .apd-btn-secondary {
        background: hsl(var(--secondary, 38 22% 93%));
        color: hsl(var(--secondary-foreground, 30 10% 14%));
        border-color: hsl(var(--border, 36 16% 87%));
      }
      .apd-btn-secondary:hover {
        background: hsl(var(--muted, 38 20% 94%));
      }
      .apd-warning-box {
        background: hsl(38 92% 50% / 0.1);
        border: 1px solid hsl(38 92% 50% / 0.3);
        border-radius: var(--radius, 10px);
        padding: 14px 16px;
        display: flex;
        gap: 12px;
        color: hsl(var(--foreground, 30 10% 12%));
        font-size: 12.5px;
        line-height: 1.5;
      }
      .apd-warning-icon {
        font-size: 20px;
        flex-shrink: 0;
      }
      .apd-warning-title {
        font-weight: 700;
        color: hsl(32 75% 38%);
        margin-bottom: 2px;
      }
      .dark .apd-warning-title {
        color: hsl(38 92% 60%);
      }
      .apd-footer {
        padding: 16px 28px;
        border-top: 1px solid hsl(var(--border, 36 16% 87%));
        background: hsl(var(--muted, 38 20% 94%) / 0.25);
        display: flex;
        justify-content: flex-end;
        gap: 10px;
      }
      .apd-settings-card {
        background: hsl(var(--card, 40 33% 99%));
        border: 1px solid hsl(var(--border, 36 16% 87%));
        border-radius: calc(var(--radius, 10px) + 2px);
        padding: 20px 24px;
        margin-top: 24px;
        box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05);
        color: hsl(var(--card-foreground, 30 10% 12%));
      }
    `;
    document.head.appendChild(style);
  }

  // Safe caller to nativeBridge with retry
  function callNative(action, payload) {
    return new Promise(function(resolve, reject) {
      function attempt(retries) {
        if (window.nativeBridge && typeof window.nativeBridge.call === 'function') {
          window.nativeBridge.call(action, payload)
            .then(resolve)
            .catch(reject);
        } else if (retries > 0) {
          setTimeout(function() { attempt(retries - 1); }, 60);
        } else {
          reject(new Error('nativeBridge is not available'));
        }
      }
      attempt(50);
    });
  }

  // Remove existing modal from DOM
  function closeModal() {
    var el = document.getElementById('apd-modal-root');
    if (el) el.remove();
  }

  // Render First Launch Setup Modal (Only when Data Root is unconfigured)
  function showFirstLaunchModal(status) {
    closeModal();
    injectStyles();

    var initialPath = status.data_root || status.default_path || 'D:\\ArchaeoPhD-Data';
    var cloudWarning = status.cloud_service || '';

    var backdrop = document.createElement('div');
    backdrop.id = 'apd-modal-root';
    backdrop.className = 'apd-backdrop';

    backdrop.innerHTML = `
      <div class="apd-modal">
        <div class="apd-header">
          <div class="apd-badge">
            <span>${APD_ICONS.landmark}</span> ArchaeoPhD Offline Workstation
          </div>
          <h1 class="apd-title">Select Research Data Root</h1>
          <p class="apd-subtitle">
            Choose where your archaeological libraries, native vector indexes, and local AI model weights (GGUF) will be stored.
          </p>
        </div>
        <div class="apd-body">
          <div class="apd-structure-box">
            <div><span class="hl">${APD_ICONS.folderOpen} [Chosen Root]/</span></div>
            <div>&nbsp;&nbsp;├── <span class="hl">${APD_ICONS.brain} models/</span> (Embeddings &amp; Local LLMs)</div>
            <div>&nbsp;&nbsp;├── <span class="hl">${APD_ICONS.library} libraries/</span> (Excavation datasets, vector indexes)</div>
            <div>&nbsp;&nbsp;├── <span class="hl">${APD_ICONS.clipboard} logs/</span> (Air-gapped operation records)</div>
            <div>&nbsp;&nbsp;└── <span class="hl">${APD_ICONS.gear} config.json</span> (Workstation configuration)</div>
          </div>

          <div>
            <div class="apd-label">
              <span>Data Root Directory:</span>
              <span style="font-weight:400; font-size:11px; color:hsl(var(--muted-foreground, 30 8% 42%));">Choose fast internal drive or external SSD</span>
            </div>
            <div class="apd-input-row">
              <input type="text" id="apd-path-input" class="apd-input" value="${initialPath}">
              <button type="button" id="apd-browse-btn" class="apd-btn apd-btn-secondary">
                ${APD_ICONS.folder} Browse...
              </button>
            </div>
          </div>

          
          <div id="apd-init-error" style="display: none; background: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.35); border-radius: 8px; padding: 12px; margin-bottom: 12px; gap: 10px; align-items: flex-start;">
            <div style="color: #ef4444; flex-shrink: 0; margin-top: 1px;">${APD_ICONS.warning}</div>
            <div>
              <div style="font-weight: 600; font-size: 13px; color: #b91c1c;">Storage Initialization Notice</div>
              <div id="apd-init-error-msg" style="font-size: 12px; color: #7f1d1d; margin-top: 2px; line-height: 1.4;"></div>
            </div>
          </div>
          <div id="apd-cloud-alert" style="display: ${cloudWarning ? 'flex' : 'none'};" class="apd-warning-box">
            <div class="apd-warning-icon">${APD_ICONS.warning}</div>
            <div>
              <div class="apd-warning-title">Cloud Storage Detected (<span id="apd-cloud-service">${cloudWarning}</span>)</div>
              <div>
                Storing multi-gigabyte models and raw research data inside a cloud-synced folder can consume cloud quota and risk unintentionally syncing unpublished archaeological findings. A dedicated local drive (e.g. <code>D:\\ArchaeoPhD-Data</code>) is strongly recommended.
              </div>
            </div>
          </div>

          <div style="font-size: 12px; color: hsl(var(--muted-foreground, 30 8% 42%)); line-height: 1.5; display:flex; align-items:center; gap:8px;">
            <span>${APD_ICONS.lock}</span>
            <span>Your selection is saved locally in your user profile settings. Zero telemetry or research data leaves your PC.</span>
          </div>
        </div>
        <div class="apd-footer">
          <button type="button" id="apd-default-btn" class="apd-btn apd-btn-secondary">
            Use Standard Default
          </button>
          <button type="button" id="apd-confirm-btn" class="apd-btn apd-btn-primary">
            Confirm &amp; Initialize Workstation
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(backdrop);

    var inputEl = document.getElementById('apd-path-input');
    var browseBtn = document.getElementById('apd-browse-btn');
    var defaultBtn = document.getElementById('apd-default-btn');
    var confirmBtn = document.getElementById('apd-confirm-btn');
    var cloudAlert = document.getElementById('apd-cloud-alert');
    var cloudServiceSpan = document.getElementById('apd-cloud-service');

    function checkCloudSync(path) {
      callNative('check_cloud_sync', { path: path }).then(function(res) {
        if (res && res.cloud_service) {
          cloudServiceSpan.textContent = res.cloud_service;
          cloudAlert.style.display = 'flex';
        } else {
          cloudAlert.style.display = 'none';
        }
      }).catch(function() {});
    }

    inputEl.addEventListener('input', function() {
      checkCloudSync(inputEl.value.trim());
    });

    browseBtn.addEventListener('click', function() {
      browseBtn.disabled = true;
      browseBtn.textContent = 'Opening...';
      callNative('browse_folder', { initial_path: inputEl.value.trim() })
        .then(function(res) {
          browseBtn.disabled = false;
          browseBtn.innerHTML = APD_ICONS.folder + ' Browse...';
          if (res && !res.cancelled && res.path) {
            inputEl.value = res.path;
            if (res.cloud_service) {
              cloudServiceSpan.textContent = res.cloud_service;
              cloudAlert.style.display = 'flex';
            } else {
              cloudAlert.style.display = 'none';
            }
          }
        })
        .catch(function(err) {
          browseBtn.disabled = false;
          browseBtn.innerHTML = APD_ICONS.folder + ' Browse...';
        });
    });

    defaultBtn.addEventListener('click', function() {
      inputEl.value = status.default_path;
      checkCloudSync(status.default_path);
    });

    confirmBtn.addEventListener('click', function() {
      var selectedPath = inputEl.value.trim();
      if (!selectedPath) {
        alert('Please specify a valid folder path.');
        return;
      }
      confirmBtn.disabled = true;
      confirmBtn.innerHTML = '<span>' + APD_ICONS.refresh + '</span> Initializing...';

      callNative('set_data_root', { data_root: selectedPath })
        .then(function(res) {
          confirmBtn.innerHTML = '<span>' + APD_ICONS.checkCircle + '</span> Initialized!';
          setTimeout(function() {
            closeModal();
            refreshStatus();
          }, 350);
        })
        .catch(function(err) {
          confirmBtn.disabled = false;
          confirmBtn.innerHTML = 'Confirm &amp; Initialize Workstation';
          alert('Failed to set Data Root: ' + (err.message || err));
        });
    });
  }

  // Render Missing/Disconnected External Storage Modal
  function showMissingRootModal(status) {
    closeModal();
    injectStyles();

    var backdrop = document.createElement('div');
    backdrop.id = 'apd-modal-root';
    backdrop.className = 'apd-backdrop';

    backdrop.innerHTML = `
      <div class="apd-modal">
        <div class="apd-header" style="background: hsl(var(--destructive, 0 65% 44%) / 0.08); border-bottom: 1px solid hsl(var(--destructive, 0 65% 44%) / 0.25);">
          <div class="apd-badge" style="color: hsl(var(--destructive, 0 65% 44%)); background: hsl(var(--destructive, 0 65% 44%) / 0.12); border-color: hsl(var(--destructive, 0 65% 44%) / 0.3);">
            <span>${APD_ICONS.warning}</span> Storage Disconnected
          </div>
          <h1 class="apd-title" style="color: hsl(var(--foreground, 30 10% 12%));">Research Data Root Unavailable</h1>
          <p class="apd-subtitle">
            The configured research storage location cannot be accessed.
          </p>
        </div>
        <div class="apd-body">
          <div style="background: hsl(var(--destructive, 0 65% 44%) / 0.06); border: 1px solid hsl(var(--destructive, 0 65% 44%) / 0.2); border-radius: var(--radius, 10px); padding: 14px 16px;">
            <div style="font-size: 12px; color: hsl(var(--destructive, 0 65% 44%)); margin-bottom: 4px; font-weight: 600;">Configured Data Root:</div>
            <div style="font-family: var(--font-mono, monospace); font-size: 13px; color: hsl(var(--foreground, 30 10% 12%)); word-break: break-all; font-weight: 600;">${status.data_root}</div>
          </div>

          <div style="font-size: 13px; color: hsl(var(--muted-foreground, 30 8% 42%)); line-height: 1.6;">
            If your research data is stored on an <strong>external SSD or USB drive</strong>, please plug it into your computer. ArchaeoPhD never writes to a fallback drive to protect against fragmenting your research graphs.
          </div>
        </div>
        <div class="apd-footer" style="justify-content: space-between;">
          <button type="button" id="apd-missing-browse-btn" class="apd-btn apd-btn-secondary">
            ${APD_ICONS.folder} Select Different Folder...
          </button>
          <button type="button" id="apd-retry-btn" class="apd-btn apd-btn-primary">
            ${APD_ICONS.refresh} Retry Connection
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(backdrop);

    document.getElementById('apd-retry-btn').addEventListener('click', function() {
      var btn = this;
      btn.disabled = true;
      btn.innerHTML = '<span>' + APD_ICONS.refresh + '</span> Checking...';
      callNative('get_data_root_status')
        .then(function(newStatus) {
          if (!newStatus.is_missing) {
            btn.innerHTML = '<span>' + APD_ICONS.checkCircle + '</span> Connected!';
            setTimeout(function() {
              closeModal();
              refreshStatus();
            }, 300);
          } else {
            btn.disabled = false;
            btn.innerHTML = APD_ICONS.refresh + ' Retry Connection';
            alert('Drive or path is still unavailable. Please reconnect the drive or select a different folder.');
          }
        })
        .catch(function(err) {
          btn.disabled = false;
          btn.innerHTML = APD_ICONS.refresh + ' Retry Connection';
        });
    });

    document.getElementById('apd-missing-browse-btn').addEventListener('click', function() {
      showFirstLaunchModal(status);
    });
  }

  // Inject Data Root Card cleanly into the /settings page (Native Desktop App UX)
  function injectSettingsCard() {
    if (!currentStatus || !currentStatus.configured || currentStatus.is_missing) return;
    if (document.getElementById('apd-settings-card')) return;

    // Check if we are on settings page
    var isSettings = window.location.pathname.indexOf('/settings') !== -1;
    if (!isSettings) return;

    // Look for target container in settings page
    var container = document.querySelector('.space-y-6') || document.querySelector('main') || document.getElementById('root');
    if (!container) return;

    injectStyles();

    var card = document.createElement('div');
    card.id = 'apd-settings-card';
    card.className = 'apd-settings-card';

    var cloudBadge = currentStatus.cloud_service
      ? `<span style="color: hsl(38 92% 45%); background: hsl(38 92% 45% / 0.12); border: 1px solid hsl(38 92% 45% / 0.3); padding: 3px 10px; border-radius: 999px; font-size: 11px; font-weight: 600;">${APD_ICONS.warning} Cloud Synced (${currentStatus.cloud_service})</span>`
      : `<span style="color: hsl(150 60% 40%); background: hsl(150 60% 40% / 0.12); border: 1px solid hsl(150 60% 40% / 0.3); padding: 3px 10px; border-radius: 999px; font-size: 11px; font-weight: 600;">${APD_ICONS.lock} 100% Offline (Local Drive)</span>`;

    card.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:12px;">
        <div>
          <h3 style="margin:0 0 4px 0; font-family: var(--font-heading, 'Fraunces', serif); font-size:16px; font-weight:600; color:hsl(var(--foreground, 30 10% 12%)); display:flex; align-items:center; gap:8px;">
            <span>${APD_ICONS.hardDrive}</span> Workstation Storage &amp; Data Root
          </h3>
          <p style="margin:0; font-size:12.5px; color:hsl(var(--muted-foreground, 30 8% 42%));">
            Location where local AI models, native vector indexes, and research libraries are stored.
          </p>
        </div>
        <div>${cloudBadge}</div>
      </div>

      <div style="display:flex; align-items:center; gap:10px; background:hsl(var(--muted, 38 20% 94%) / 0.4); border:1px solid hsl(var(--border, 36 16% 87%)); border-radius:var(--radius, 8px); padding:10px 14px; margin-bottom:12px;">
        <code style="flex:1; font-family:var(--font-mono, monospace); font-size:12.5px; color:hsl(var(--primary, 18 58% 28%)); font-weight:600; word-break:break-all;">${currentStatus.data_root}</code>
        <button id="apd-settings-change-btn" type="button" class="apd-btn apd-btn-secondary" style="padding:6px 14px; font-size:12px;">
          ${APD_ICONS.folder} Relocate...
        </button>
      </div>

      <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:8px; font-size:11px; font-family:var(--font-mono, monospace); color:hsl(var(--muted-foreground, 30 8% 42%));">
        <div style="background:hsl(var(--muted, 38 20% 94%) / 0.5); padding:8px 10px; border-radius:var(--radius, 6px); border:1px solid hsl(var(--border, 36 16% 87%));">${APD_ICONS.brain} ${currentStatus.models_dir || 'models/'}</div>
        <div style="background:hsl(var(--muted, 38 20% 94%) / 0.5); padding:8px 10px; border-radius:var(--radius, 6px); border:1px solid hsl(var(--border, 36 16% 87%));">${APD_ICONS.library} ${currentStatus.libraries_dir || 'libraries/'}</div>
        <div style="background:hsl(var(--muted, 38 20% 94%) / 0.5); padding:8px 10px; border-radius:var(--radius, 6px); border:1px solid hsl(var(--border, 36 16% 87%));">${APD_ICONS.clipboard} ${currentStatus.logs_dir || 'logs/'}</div>
      </div>
    `;

    container.appendChild(card);

    document.getElementById('apd-settings-change-btn').addEventListener('click', function() {
      showFirstLaunchModal(currentStatus);
    });
  }

  // Observe URL and DOM changes to inject into Settings page when visited
  var observer = new MutationObserver(function() {
    injectSettingsCard();
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });

  // Query engine status and route to proper UI state
  function refreshStatus() {
    callNative('get_data_root_status')
      .then(function(status) {
        currentStatus = status;
        var rootSpan = document.getElementById('apd-sb-dataroot');
        if (rootSpan && status.data_root) {
          rootSpan.textContent = 'Data Root: ' + status.data_root;
        }
        if (!status.configured) {
          showFirstLaunchModal(status);
        } else if (status.is_missing) {
          showMissingRootModal(status);
        } else {
          // Native app behavior: screen stays clean and undisturbed.
          // Injects cleanly inside /settings when user visits Settings.
          injectSettingsCard();
        }
      })
      .catch(function(err) {
        console.warn('[ArchaeoPhD DataRoot] Could not query data root status:', err);
      });
  }

  // Expose global controller
  window.archaeophdDataRoot = {
    openPicker: function() {
      if (currentStatus) showFirstLaunchModal(currentStatus);
      else refreshStatus();
    },
    getStatus: function() {
      return currentStatus;
    },
    refresh: refreshStatus
  };

  // Launch when document is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', refreshStatus);
  } else {
    refreshStatus();
  }
})();
