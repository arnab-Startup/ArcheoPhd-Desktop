/**
 * ArchaeoPhD — Native Data Root Manager
 * Pure Vanilla JS + Scoped CSS (Zero dependencies)
 * Native Desktop Behavior:
 * - Clean interface (no floating pills or intrusive widgets)
 * - First-launch modal if Data Root not yet configured
 * - Storage disconnect alert if external SSD is unplugged
 * - Seamless integration inside the /settings page
 */
(function() {
  'use strict';

  var currentStatus = null;

  // Insert scoped styling for modals and settings card
  function injectStyles() {
    if (document.getElementById('apd-styles')) return;
    var style = document.createElement('style');
    style.id = 'apd-styles';
    style.textContent = `
      .apd-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(4, 7, 13, 0.85);
        backdrop-filter: blur(8px);
        z-index: 999999;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 24px;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Inter", sans-serif;
        color: #f1f5f9;
        animation: apdFadeIn 0.25s ease-out;
      }
      @keyframes apdFadeIn {
        from { opacity: 0; transform: scale(0.98); }
        to { opacity: 1; transform: scale(1); }
      }
      .apd-modal {
        background: #0d121d;
        border: 1px solid #2a354b;
        border-radius: 16px;
        width: 100%;
        max-width: 620px;
        box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.7), 0 0 30px rgba(226, 179, 90, 0.1);
        overflow: hidden;
        display: flex;
        flex-direction: column;
      }
      .apd-header {
        padding: 24px 28px 20px;
        border-bottom: 1px solid #1a2234;
        background: linear-gradient(180deg, #131b2a 0%, #0d121d 100%);
      }
      .apd-badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: #e2b35a;
        background: rgba(226, 179, 90, 0.12);
        border: 1px solid rgba(226, 179, 90, 0.25);
        padding: 4px 10px;
        border-radius: 999px;
        margin-bottom: 10px;
      }
      .apd-title {
        font-size: 20px;
        font-weight: 700;
        color: #ffffff;
        margin: 0 0 6px 0;
        line-height: 1.3;
      }
      .apd-subtitle {
        font-size: 13px;
        color: #94a3b8;
        margin: 0;
        line-height: 1.5;
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
        background: #080c14;
        border: 1px solid #1a2336;
        border-radius: 10px;
        padding: 14px 16px;
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        font-size: 12px;
        color: #cbd5e1;
        line-height: 1.6;
      }
      .apd-structure-box span.hl {
        color: #e2b35a;
        font-weight: 600;
      }
      .apd-label {
        font-size: 12px;
        font-weight: 600;
        color: #cbd5e1;
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
        background: #080c14;
        border: 1px solid #2a354b;
        border-radius: 8px;
        padding: 10px 14px;
        font-size: 13px;
        color: #f8fafc;
        outline: none;
        transition: border-color 0.15s, box-shadow 0.15s;
        font-family: inherit;
      }
      .apd-input:focus {
        border-color: #e2b35a;
        box-shadow: 0 0 0 3px rgba(226, 179, 90, 0.15);
      }
      .apd-btn {
        padding: 10px 18px;
        font-size: 13px;
        font-weight: 600;
        border-radius: 8px;
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
        background: #e2b35a;
        color: #080b12;
        border-color: #f3c775;
      }
      .apd-btn-primary:hover {
        background: #efc46e;
        transform: translateY(-1px);
        box-shadow: 0 4px 14px rgba(226, 179, 90, 0.35);
      }
      .apd-btn-secondary {
        background: #1a2234;
        color: #e2e8f0;
        border-color: #2b3850;
      }
      .apd-btn-secondary:hover {
        background: #232e44;
        color: #ffffff;
      }
      .apd-warning-box {
        background: rgba(217, 119, 6, 0.12);
        border: 1px solid rgba(245, 158, 11, 0.35);
        border-radius: 10px;
        padding: 14px 16px;
        display: flex;
        gap: 12px;
        color: #fde68a;
        font-size: 12.5px;
        line-height: 1.5;
      }
      .apd-warning-icon {
        font-size: 20px;
        flex-shrink: 0;
      }
      .apd-warning-title {
        font-weight: 700;
        color: #fbbf24;
        margin-bottom: 2px;
      }
      .apd-footer {
        padding: 18px 28px;
        border-top: 1px solid #1a2234;
        background: #0a0e17;
        display: flex;
        justify-content: flex-end;
        gap: 10px;
      }
      .apd-settings-card {
        background: #0e1422;
        border: 1px solid #1e283d;
        border-radius: 12px;
        padding: 20px 24px;
        margin-top: 24px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
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
            Choose where all your archaeological libraries, LanceDB vector indexes, and local AI model weights (GGUF) will be stored.
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
              <span style="font-weight:400; font-size:11px; color:#94a3b8;">Choose fast internal drive or external SSD</span>
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

          <div style="font-size: 12px; color: #94a3b8; line-height: 1.5; display:flex; align-items:center; gap:8px;">
            <span>🔒</span>
            <span>Your selection is saved locally to <code>%LOCALAPPDATA%\\ArchaeoPhD\\settings.json</code>. Zero data leaves your machine.</span>
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
        <div class="apd-header" style="background: linear-gradient(180deg, #2a1515 0%, #0d121d 100%); border-bottom: 1px solid #4a2020;">
          <div class="apd-badge" style="color: #f87171; background: rgba(239, 68, 68, 0.15); border-color: rgba(239, 68, 68, 0.3);">
            <span>⚠️</span> Storage Disconnected
          </div>
          <h1 class="apd-title">Research Data Root Unavailable</h1>
          <p class="apd-subtitle">
            The configured research storage location cannot be accessed.
          </p>
        </div>
        <div class="apd-body">
          <div style="background:#160b0b; border:1px solid #4a2020; border-radius:10px; padding:14px 16px;">
            <div style="font-size:12px; color:#fca5a5; margin-bottom:4px;">Configured Data Root:</div>
            <div style="font-family:monospace; font-size:13px; color:#ffffff; word-break:break-all;">${status.data_root}</div>
          </div>

          <div style="font-size:13px; color:#cbd5e1; line-height:1.6;">
            If your research data is on an <strong>external SSD or USB drive</strong>, please plug it into your computer. ArchaeoPhD never writes to a fallback drive to protect against fragmenting your research graphs.
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
      ? `<span style="color:#f59e0b; background:rgba(245,158,11,0.15); border:1px solid rgba(245,158,11,0.3); padding:3px 8px; border-radius:6px; font-size:11px; font-weight:600;">⚠️ Cloud Synced (${currentStatus.cloud_service})</span>`
      : `<span style="color:#10b981; background:rgba(16,185,129,0.15); border:1px solid rgba(16,185,129,0.3); padding:3px 8px; border-radius:6px; font-size:11px; font-weight:600;">🔒 100% Offline (Local Drive)</span>`;

    card.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:12px;">
        <div>
          <h3 style="margin:0 0 4px 0; font-size:15px; font-weight:600; color:#ffffff; display:flex; align-items:center; gap:8px;">
            <span>💾</span> Workstation Storage &amp; Data Root
          </h3>
          <p style="margin:0; font-size:12px; color:#94a3b8;">
            Location where local AI models, LanceDB vectors, and research libraries are stored.
          </p>
        </div>
        <div>${cloudBadge}</div>
      </div>

      <div style="display:flex; align-items:center; gap:10px; background:#080c14; border:1px solid #1e283d; border-radius:8px; padding:10px 14px; margin-bottom:12px;">
        <code style="flex:1; font-family:monospace; font-size:12.5px; color:#e2b35a; word-break:break-all;">${currentStatus.data_root}</code>
        <button id="apd-settings-change-btn" type="button" class="apd-btn apd-btn-secondary" style="padding:6px 14px; font-size:12px;">
          📁 Relocate...
        </button>
      </div>

      <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:8px; font-size:11px; font-family:monospace; color:#94a3b8;">
        <div style="background:#080c14; padding:8px 10px; border-radius:6px; border:1px solid #1a2234;">🧠 ${currentStatus.models_dir || 'models/'}</div>
        <div style="background:#080c14; padding:8px 10px; border-radius:6px; border:1px solid #1a2234;">📚 ${currentStatus.libraries_dir || 'libraries/'}</div>
        <div style="background:#080c14; padding:8px 10px; border-radius:6px; border:1px solid #1a2234;">📋 ${currentStatus.logs_dir || 'logs/'}</div>
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
