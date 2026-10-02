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

  var currentStatus = null;

  // Insert scoped styling that inherits the app's Tailwind tokens & typography
  function injectStyles() {
    if (document.getElementById('apd-styles')) return;
    var style = document.createElement('style');
    style.id = 'apd-styles';
    style.textContent = `
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
            <span>🏛️</span> ArchaeoPhD Offline Workstation
          </div>
          <h1 class="apd-title">Select Research Data Root</h1>
          <p class="apd-subtitle">
            Choose where your archaeological libraries, LanceDB vector indexes, and local AI model weights (GGUF) will be stored.
          </p>
        </div>
        <div class="apd-body">
          <div class="apd-structure-box">
            <div><span class="hl">📂 [Chosen Root]/</span></div>
            <div>&nbsp;&nbsp;├── <span class="hl">🧠 models/</span> (Embeddings &amp; Local LLMs)</div>
            <div>&nbsp;&nbsp;├── <span class="hl">📚 libraries/</span> (Excavation datasets, vector indexes)</div>
            <div>&nbsp;&nbsp;├── <span class="hl">📋 logs/</span> (Air-gapped operation records)</div>
            <div>&nbsp;&nbsp;└── <span class="hl">⚙️ config.json</span> (Workstation configuration)</div>
          </div>

          <div>
            <div class="apd-label">
              <span>Data Root Directory:</span>
              <span style="font-weight:400; font-size:11px; color:hsl(var(--muted-foreground, 30 8% 42%));">Choose fast internal drive or external SSD</span>
            </div>
            <div class="apd-input-row">
              <input type="text" id="apd-path-input" class="apd-input" value="${initialPath}">
              <button type="button" id="apd-browse-btn" class="apd-btn apd-btn-secondary">
                📁 Browse...
              </button>
            </div>
          </div>

          <div id="apd-cloud-alert" style="display: ${cloudWarning ? 'flex' : 'none'};" class="apd-warning-box">
            <div class="apd-warning-icon">⚠️</div>
            <div>
              <div class="apd-warning-title">Cloud Storage Detected (<span id="apd-cloud-service">${cloudWarning}</span>)</div>
              <div>
                Storing multi-gigabyte models and raw research data inside a cloud-synced folder can consume cloud quota and risk unintentionally syncing unpublished archaeological findings. A dedicated local drive (e.g. <code>D:\\ArchaeoPhD-Data</code>) is strongly recommended.
              </div>
            </div>
          </div>

          <div style="font-size: 12px; color: hsl(var(--muted-foreground, 30 8% 42%)); line-height: 1.5; display:flex; align-items:center; gap:8px;">
            <span>🔒</span>
            <span>Your selection is saved locally to <code>%LOCALAPPDATA%\\ArchaeoPhD\\settings.json</code>. Zero telemetry or research data leaves your PC.</span>
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
          browseBtn.innerHTML = '📁 Browse...';
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
          browseBtn.innerHTML = '📁 Browse...';
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
      confirmBtn.innerHTML = '<span>⏳</span> Initializing...';

      callNative('set_data_root', { data_root: selectedPath })
        .then(function(res) {
          confirmBtn.innerHTML = '<span>✅</span> Initialized!';
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
            <span>⚠️</span> Storage Disconnected
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
            📁 Select Different Folder...
          </button>
          <button type="button" id="apd-retry-btn" class="apd-btn apd-btn-primary">
            🔄 Retry Connection
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(backdrop);

    document.getElementById('apd-retry-btn').addEventListener('click', function() {
      var btn = this;
      btn.disabled = true;
      btn.innerHTML = '<span>⏳</span> Checking...';
      callNative('get_data_root_status')
        .then(function(newStatus) {
          if (!newStatus.is_missing) {
            btn.innerHTML = '<span>✅</span> Connected!';
            setTimeout(function() {
              closeModal();
              refreshStatus();
            }, 300);
          } else {
            btn.disabled = false;
            btn.innerHTML = '🔄 Retry Connection';
            alert('Drive or path is still unavailable. Please reconnect the drive or select a different folder.');
          }
        })
        .catch(function(err) {
          btn.disabled = false;
          btn.innerHTML = '🔄 Retry Connection';
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
      ? `<span style="color: hsl(38 92% 45%); background: hsl(38 92% 45% / 0.12); border: 1px solid hsl(38 92% 45% / 0.3); padding: 3px 10px; border-radius: 999px; font-size: 11px; font-weight: 600;">⚠️ Cloud Synced (${currentStatus.cloud_service})</span>`
      : `<span style="color: hsl(150 60% 40%); background: hsl(150 60% 40% / 0.12); border: 1px solid hsl(150 60% 40% / 0.3); padding: 3px 10px; border-radius: 999px; font-size: 11px; font-weight: 600;">🔒 100% Offline (Local Drive)</span>`;

    card.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:12px;">
        <div>
          <h3 style="margin:0 0 4px 0; font-family: var(--font-heading, 'Fraunces', serif); font-size:16px; font-weight:600; color:hsl(var(--foreground, 30 10% 12%)); display:flex; align-items:center; gap:8px;">
            <span>💾</span> Workstation Storage &amp; Data Root
          </h3>
          <p style="margin:0; font-size:12.5px; color:hsl(var(--muted-foreground, 30 8% 42%));">
            Location where local AI models, LanceDB vectors, and research libraries are stored.
          </p>
        </div>
        <div>${cloudBadge}</div>
      </div>

      <div style="display:flex; align-items:center; gap:10px; background:hsl(var(--muted, 38 20% 94%) / 0.4); border:1px solid hsl(var(--border, 36 16% 87%)); border-radius:var(--radius, 8px); padding:10px 14px; margin-bottom:12px;">
        <code style="flex:1; font-family:var(--font-mono, monospace); font-size:12.5px; color:hsl(var(--primary, 18 58% 28%)); font-weight:600; word-break:break-all;">${currentStatus.data_root}</code>
        <button id="apd-settings-change-btn" type="button" class="apd-btn apd-btn-secondary" style="padding:6px 14px; font-size:12px;">
          📁 Relocate...
        </button>
      </div>

      <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:8px; font-size:11px; font-family:var(--font-mono, monospace); color:hsl(var(--muted-foreground, 30 8% 42%));">
        <div style="background:hsl(var(--muted, 38 20% 94%) / 0.5); padding:8px 10px; border-radius:var(--radius, 6px); border:1px solid hsl(var(--border, 36 16% 87%));">🧠 ${currentStatus.models_dir || 'models/'}</div>
        <div style="background:hsl(var(--muted, 38 20% 94%) / 0.5); padding:8px 10px; border-radius:var(--radius, 6px); border:1px solid hsl(var(--border, 36 16% 87%));">📚 ${currentStatus.libraries_dir || 'libraries/'}</div>
        <div style="background:hsl(var(--muted, 38 20% 94%) / 0.5); padding:8px 10px; border-radius:var(--radius, 6px); border:1px solid hsl(var(--border, 36 16% 87%));">📋 ${currentStatus.logs_dir || 'logs/'}</div>
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
