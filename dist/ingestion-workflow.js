/**
 * ArchaeoPhD — Native Ingestion & Verification Workflows
 * Phase 1, Step 3: Native UI Integration
 * 
 * Styled with ArchaeoPhD Design System:
 * - Museum-grade academic typography: var(--font-heading) ('Fraunces') & var(--font-body) ('Inter')
 * - Full light/dark mode adaptability (Warm parchment/terracotta in light, Obsidian/amber in dark)
 * - Anti-Anchoring Invariant: Optical crop must be rendered; candidate resolution locked if missing
 * - Zero Pre-Fill Invariant: Manual transcription fields 100% empty; machine guesses forbidden
 * - Default-Safe Hard-Gating: Ingestion defaults to CLASS_B / UNVERIFIED_ROUGH_SCAN
 */
(function() {
  'use strict';

  // Inject Scoped Styles for Ingestion, Classification, Verification Queue, and Manual Transcription
  function injectStyles() {
    if (document.getElementById('apd-workflow-styles')) return;
    var style = document.createElement('style');
    style.id = 'apd-workflow-styles';
    style.textContent = `
      /* Root Backdrop */
      .apd-wf-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(15, 12, 10, 0.72);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        z-index: 999990;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 24px;
        font-family: var(--font-body, "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif);
        color: hsl(var(--foreground, 30 10% 12%));
        animation: apdWfFadeIn 0.22s cubic-bezier(0.16, 1, 0.3, 1);
      }
      @keyframes apdWfFadeIn {
        from { opacity: 0; transform: scale(0.98); }
        to { opacity: 1; transform: scale(1); }
      }

      /* Modal Containers */
      .apd-wf-modal {
        background: hsl(var(--card, 40 33% 99%));
        border: 1px solid hsl(var(--border, 36 16% 87%));
        border-radius: calc(var(--radius, 10px) + 6px);
        width: 100%;
        max-width: 680px;
        box-shadow: 0 30px 60px -15px rgba(0, 0, 0, 0.3), 0 0 0 1px hsl(var(--border, 36 16% 87%) / 0.5);
        overflow: hidden;
        display: flex;
        flex-direction: column;
        color: hsl(var(--card-foreground, 30 10% 12%));
        max-height: 90vh;
      }
      .apd-wf-modal-wide {
        max-width: 1100px;
        height: 88vh;
      }

      /* Header */
      .apd-wf-header {
        padding: 22px 28px 18px;
        border-bottom: 1px solid hsl(var(--border, 36 16% 87%));
        background: hsl(var(--muted, 38 20% 94%) / 0.45);
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 16px;
      }
      .apd-wf-header-left {
        flex: 1;
      }
      .apd-wf-close-btn {
        background: transparent;
        border: none;
        font-size: 20px;
        line-height: 1;
        cursor: pointer;
        color: hsl(var(--muted-foreground, 30 8% 42%));
        padding: 4px 8px;
        border-radius: var(--radius, 6px);
        transition: background 0.15s, color 0.15s;
      }
      .apd-wf-close-btn:hover {
        background: hsl(var(--muted, 38 20% 94%));
        color: hsl(var(--foreground, 30 10% 12%));
      }

      /* Typography */
      .apd-wf-title {
        font-family: var(--font-heading, "Fraunces", Georgia, serif);
        font-size: 22px;
        font-weight: 600;
        color: hsl(var(--foreground, 30 10% 12%));
        margin: 0 0 4px 0;
        line-height: 1.25;
        letter-spacing: -0.015em;
      }
      .apd-wf-subtitle {
        font-size: 13px;
        color: hsl(var(--muted-foreground, 30 8% 42%));
        margin: 0;
        line-height: 1.5;
      }

      /* Badges */
      .apd-wf-badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        padding: 3px 9px;
        border-radius: 999px;
        margin-bottom: 8px;
        border: 1px solid transparent;
      }
      .apd-wf-badge-terracotta {
        color: hsl(var(--primary, 18 58% 28%));
        background: hsl(var(--primary, 18 58% 28%) / 0.1);
        border-color: hsl(var(--primary, 18 58% 28%) / 0.25);
      }
      .apd-wf-badge-amber {
        color: hsl(32 85% 35%);
        background: hsl(38 92% 50% / 0.12);
        border-color: hsl(38 92% 50% / 0.35);
      }
      .dark .apd-wf-badge-amber {
        color: hsl(38 92% 65%);
      }
      .apd-wf-badge-emerald {
        color: hsl(158 64% 32%);
        background: hsl(158 64% 42% / 0.12);
        border-color: hsl(158 64% 42% / 0.35);
      }
      .dark .apd-wf-badge-emerald {
        color: hsl(158 64% 65%);
      }
      .apd-wf-badge-crimson {
        color: hsl(0 72% 40%);
        background: hsl(0 72% 51% / 0.12);
        border-color: hsl(0 72% 51% / 0.35);
      }
      .dark .apd-wf-badge-crimson {
        color: hsl(0 72% 65%);
      }

      /* Modal Body & Scrolling */
      .apd-wf-body {
        padding: 24px 28px;
        display: flex;
        flex-direction: column;
        gap: 20px;
        overflow-y: auto;
        flex: 1;
      }

      /* Inputs and Labels */
      .apd-wf-field {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .apd-wf-label {
        font-size: 12.5px;
        font-weight: 600;
        color: hsl(var(--foreground, 30 10% 12%));
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .apd-wf-input {
        background: hsl(var(--background, 40 30% 98%));
        border: 1px solid hsl(var(--input, 36 16% 87%));
        border-radius: var(--radius, 8px);
        padding: 9px 13px;
        font-size: 13px;
        color: hsl(var(--foreground, 30 10% 12%));
        outline: none;
        transition: border-color 0.15s, box-shadow 0.15s;
        font-family: inherit;
        width: 100%;
        box-sizing: border-box;
      }
      .apd-wf-input:focus {
        border-color: hsl(var(--ring, 18 58% 28%));
        box-shadow: 0 0 0 3px hsl(var(--ring, 18 58% 28%) / 0.18);
      }
      .apd-wf-input-mono {
        font-family: var(--font-mono, monospace);
        font-size: 12px;
      }
      .apd-wf-input-row {
        display: flex;
        gap: 8px;
      }

      /* Buttons */
      .apd-wf-btn {
        padding: 8px 16px;
        font-size: 13px;
        font-weight: 600;
        border-radius: var(--radius, 8px);
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 7px;
        transition: all 0.15s ease;
        border: 1px solid transparent;
        font-family: inherit;
        text-decoration: none;
        white-space: nowrap;
      }
      .apd-wf-btn:disabled, .apd-wf-btn[disabled] {
        opacity: 0.45;
        cursor: not-allowed;
        pointer-events: none;
      }
      .apd-wf-btn-primary {
        background: hsl(var(--primary, 18 58% 28%));
        color: hsl(var(--primary-foreground, 40 30% 98%));
        border-color: hsl(var(--primary, 18 58% 28%));
      }
      .apd-wf-btn-primary:hover:not(:disabled) {
        filter: brightness(1.08);
        transform: translateY(-1px);
        box-shadow: 0 3px 10px hsl(var(--primary, 18 58% 28%) / 0.25);
      }
      .apd-wf-btn-secondary {
        background: hsl(var(--secondary, 38 22% 93%));
        color: hsl(var(--secondary-foreground, 30 10% 14%));
        border-color: hsl(var(--border, 36 16% 87%));
      }
      .apd-wf-btn-secondary:hover:not(:disabled) {
        background: hsl(var(--muted, 38 20% 94%));
      }
      .apd-wf-btn-outline {
        background: transparent;
        color: hsl(var(--foreground, 30 10% 12%));
        border-color: hsl(var(--border, 36 16% 87%));
      }
      .apd-wf-btn-outline:hover:not(:disabled) {
        background: hsl(var(--muted, 38 20% 94%) / 0.5);
      }
      .apd-wf-btn-danger {
        background: hsl(0 72% 51% / 0.12);
        color: hsl(0 72% 45%);
        border-color: hsl(0 72% 51% / 0.3);
      }
      .apd-wf-btn-danger:hover:not(:disabled) {
        background: hsl(0 72% 51% / 0.22);
      }

      /* Alert / Notice Boxes */
      .apd-wf-box {
        border-radius: var(--radius, 10px);
        padding: 14px 16px;
        display: flex;
        gap: 12px;
        font-size: 12.5px;
        line-height: 1.55;
        border: 1px solid transparent;
      }
      .apd-wf-box-amber {
        background: hsl(38 92% 50% / 0.08);
        border-color: hsl(38 92% 50% / 0.3);
        color: hsl(var(--foreground, 30 10% 12%));
      }
      .apd-wf-box-crimson {
        background: hsl(0 72% 51% / 0.08);
        border-color: hsl(0 72% 51% / 0.3);
        color: hsl(var(--foreground, 30 10% 12%));
      }
      .apd-wf-box-emerald {
        background: hsl(158 64% 42% / 0.08);
        border-color: hsl(158 64% 42% / 0.3);
        color: hsl(var(--foreground, 30 10% 12%));
      }
      .apd-wf-box-muted {
        background: hsl(var(--muted, 38 20% 94%) / 0.6);
        border-color: hsl(var(--border, 36 16% 87%));
        color: hsl(var(--foreground, 30 10% 12%));
      }
      .apd-wf-box-icon {
        font-size: 20px;
        flex-shrink: 0;
        line-height: 1.2;
      }
      .apd-wf-box-content {
        flex: 1;
      }
      .apd-wf-box-title {
        font-weight: 700;
        margin-bottom: 3px;
        font-size: 13px;
      }

      /* Footer */
      .apd-wf-footer {
        padding: 16px 28px;
        border-top: 1px solid hsl(var(--border, 36 16% 87%));
        background: hsl(var(--muted, 38 20% 94%) / 0.3);
        display: flex;
        justify-content: flex-end;
        align-items: center;
        gap: 10px;
      }

      /* Classification Option Cards */
      .apd-wf-tier-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 14px;
      }
      .apd-wf-tier-card {
        border: 2px solid hsl(var(--border, 36 16% 87%));
        border-radius: var(--radius, 10px);
        padding: 16px;
        background: hsl(var(--background, 40 30% 98%));
        cursor: pointer;
        transition: all 0.15s ease;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .apd-wf-tier-card:hover {
        border-color: hsl(var(--ring, 18 58% 28%) / 0.5);
      }
      .apd-wf-tier-card.selected {
        border-color: hsl(var(--primary, 18 58% 28%));
        background: hsl(var(--primary, 18 58% 28%) / 0.04);
        box-shadow: 0 0 0 2px hsl(var(--primary, 18 58% 28%) / 0.18);
      }
      .apd-wf-tier-name {
        font-family: var(--font-heading, "Fraunces", Georgia, serif);
        font-size: 16px;
        font-weight: 600;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .apd-wf-tier-desc {
        font-size: 12px;
        color: hsl(var(--muted-foreground, 30 8% 42%));
        line-height: 1.45;
      }

      /* Verification Queue Discrepancy Card */
      .apd-wf-vcard {
        border: 1px solid hsl(var(--border, 36 16% 87%));
        border-radius: var(--radius, 10px);
        background: hsl(var(--card, 40 33% 99%));
        padding: 18px 20px;
        display: flex;
        flex-direction: column;
        gap: 14px;
        box-shadow: 0 2px 8px -2px rgba(0, 0, 0, 0.05);
      }
      .apd-wf-crop-box {
        background: #111;
        border: 1px solid hsl(var(--border, 36 16% 87%));
        border-radius: var(--radius, 8px);
        padding: 12px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
      }
      .apd-wf-crop-img {
        max-width: 100%;
        max-height: 160px;
        object-fit: contain;
        border-radius: 4px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
      }
      .apd-wf-crop-label {
        font-size: 11px;
        font-family: var(--font-mono, monospace);
        color: #aaa;
      }
      .apd-wf-candidates-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
      }
      .apd-wf-candidate-box {
        border: 1px solid hsl(var(--border, 36 16% 87%));
        border-radius: var(--radius, 8px);
        padding: 12px 14px;
        background: hsl(var(--muted, 38 20% 94%) / 0.4);
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .apd-wf-candidate-title {
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: hsl(var(--muted-foreground, 30 8% 42%));
      }
      .apd-wf-candidate-val {
        font-family: var(--font-heading, "Fraunces", Georgia, serif);
        font-size: 16px;
        font-weight: 600;
        color: hsl(var(--foreground, 30 10% 12%));
      }

      /* Manual Transcription Split Screen */
      .apd-wf-split {
        display: flex;
        flex: 1;
        overflow: hidden;
      }
      .apd-wf-split-left {
        flex: 1.1;
        border-right: 1px solid hsl(var(--border, 36 16% 87%));
        display: flex;
        flex-direction: column;
        background: #181512;
        color: #eee;
        overflow: hidden;
      }
      .apd-wf-split-right {
        flex: 1;
        display: flex;
        flex-direction: column;
        overflow-y: auto;
        background: hsl(var(--card, 40 33% 99%));
      }
      .apd-wf-scan-viewport {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: auto;
        padding: 24px;
        position: relative;
      }
      .apd-wf-scan-canvas {
        background: #fdfaf3;
        color: #1a1612;
        width: 100%;
        max-width: 520px;
        min-height: 480px;
        padding: 32px 36px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
        font-family: Georgia, "Times New Roman", serif;
        line-height: 1.6;
        font-size: 13.5px;
        border-radius: 2px;
      }
      .apd-wf-scan-toolbar {
        padding: 10px 18px;
        background: #100e0c;
        border-top: 1px solid #282420;
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 12px;
        color: #aaa;
      }
      .apd-wf-fact-row {
        display: grid;
        grid-template-columns: 1.2fr 1.5fr 1fr 34px;
        gap: 8px;
        align-items: center;
      }

      /* Floating Research Quick-Action Dock */
      .apd-wf-dock {
        position: fixed;
        bottom: 24px;
        right: 24px;
        z-index: 99990;
        display: flex;
        align-items: center;
        gap: 6px;
        background: hsl(var(--card, 40 33% 99%));
        border: 1px solid hsl(var(--border, 36 16% 87%));
        padding: 6px 10px;
        border-radius: 999px;
        box-shadow: 0 12px 32px -4px rgba(0, 0, 0, 0.22), 0 0 0 1px hsl(var(--border, 36 16% 87%) / 0.5);
        font-family: var(--font-body, "Inter", sans-serif);
      }
      .apd-wf-dock-btn {
        background: transparent;
        border: none;
        font-size: 12.5px;
        font-weight: 600;
        color: hsl(var(--foreground, 30 10% 12%));
        padding: 6px 12px;
        border-radius: 999px;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        transition: all 0.15s ease;
      }
      .apd-wf-dock-btn:hover {
        background: hsl(var(--muted, 38 20% 94%));
        color: hsl(var(--primary, 18 58% 28%));
      }
      .apd-wf-dock-badge {
        background: hsl(var(--primary, 18 58% 28%));
        color: #fff;
        font-size: 10px;
        font-weight: 700;
        padding: 1px 6px;
        border-radius: 999px;
      }
    `;
    document.head.appendChild(style);
  }

  // Safe caller to nativeBridge with retries
  function callNative(action, payload, projectId) {
    return new Promise(function(resolve, reject) {
      function attempt(retries) {
        if (window.nativeBridge && typeof window.nativeBridge.call === 'function') {
          window.nativeBridge.call(action, payload, projectId)
            .then(resolve)
            .catch(reject);
        } else if (retries > 0) {
          setTimeout(function() { attempt(retries - 1); }, 60);
        } else {
          reject(new Error('window.nativeBridge is not available in current window'));
        }
      }
      attempt(50);
    });
  }

  // Remove any open modal
  function closeModal() {
    var el = document.getElementById('apd-wf-modal-root');
    if (el) el.remove();
  }

  // Format bytes to human readable string
  function formatBytes(bytes) {
    if (!bytes || bytes === 0) return '0 B';
    var k = 1024;
    var sizes = ['B', 'KB', 'MB', 'GB'];
    var i = Math.floor(Math.log(bytes) / Math.log(k));
    return (bytes / Math.pow(k, i)).toFixed(1) + ' ' + sizes[i];
  }

  // ---------------------------------------------------------------------------
  // VIEW 1: INGESTION SCREEN
  // ---------------------------------------------------------------------------
  function showIngestionModal(initialData) {
    closeModal();
    injectStyles();

    initialData = initialData || {};
    var backdrop = document.createElement('div');
    backdrop.id = 'apd-wf-modal-root';
    backdrop.className = 'apd-wf-backdrop';

    backdrop.innerHTML = `
      <div class="apd-wf-modal">
        <div class="apd-wf-header">
          <div class="apd-wf-header-left">
            <div class="apd-wf-badge apd-wf-badge-terracotta">
              <span>🏛️</span> ArchaeoPhD Ingestion Engine
            </div>
            <h1 class="apd-wf-title">Gated Document Ingestion</h1>
            <p class="apd-wf-subtitle">
              Onboard excavation reports, monographs, or field journals into the grounded knowledge graph.
            </p>
          </div>
          <button class="apd-wf-close-btn" id="apd-wf-close">&times;</button>
        </div>

        <div class="apd-wf-body" id="apd-wf-ingest-body">
          <div class="apd-wf-box apd-wf-box-amber">
            <span class="apd-wf-box-icon">⚠️</span>
            <div class="apd-wf-box-content">
              <div class="apd-wf-box-title">Default-Safe Gating Active</div>
              All newly ingested literature defaults strictly to <strong>Class B (Degraded Letterpress)</strong> under an amber <code>UNVERIFIED_ROUGH_SCAN</code> status. Automated entity extraction is locked until physical offset quality is confirmed.
            </div>
          </div>

          <div class="apd-wf-field">
            <label class="apd-wf-label">PDF Document File Path</label>
            <div class="apd-wf-input-row">
              <input type="text" id="apd-wf-file-path" class="apd-wf-input apd-wf-input-mono" 
                placeholder="D:\\Archaeology\\Kenyon_1957_Jericho.pdf" 
                value="${initialData.file_path || ''}" />
              <button class="apd-wf-btn apd-wf-btn-secondary" id="apd-wf-browse-btn">
                📁 Browse...
              </button>
            </div>
          </div>

          <div class="apd-wf-field">
            <label class="apd-wf-label">Document Title</label>
            <input type="text" id="apd-wf-title" class="apd-wf-input" 
              placeholder="Excavations at Jericho: Volume I (1952–1958)" 
              value="${initialData.title || ''}" />
          </div>

          <div style="display:grid; grid-template-columns: 2fr 1fr; gap:12px;">
            <div class="apd-wf-field">
              <label class="apd-wf-label">Primary Author / Excavator</label>
              <input type="text" id="apd-wf-author" class="apd-wf-input" 
                placeholder="Kathleen M. Kenyon" 
                value="${initialData.author || ''}" />
            </div>
            <div class="apd-wf-field">
              <label class="apd-wf-label">Publication Year</label>
              <input type="text" id="apd-wf-year" class="apd-wf-input" 
                placeholder="1960" 
                value="${initialData.year || ''}" />
            </div>
          </div>

          <div id="apd-wf-ingest-status-area"></div>
        </div>

        <div class="apd-wf-footer" id="apd-wf-ingest-footer">
          <button class="apd-wf-btn apd-wf-btn-outline" id="apd-wf-cancel">Cancel</button>
          <button class="apd-wf-btn apd-wf-btn-primary" id="apd-wf-submit-ingest">
            <span>📥</span> Ingest & Gate Document
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(backdrop);

    document.getElementById('apd-wf-close').addEventListener('click', closeModal);
    document.getElementById('apd-wf-cancel').addEventListener('click', closeModal);

    // Native File Browser via IPC
    document.getElementById('apd-wf-browse-btn').addEventListener('click', function() {
      callNative('browse_file', { initial_dir: '' })
        .then(function(res) {
          if (res && !res.cancelled && res.path) {
            document.getElementById('apd-wf-file-path').value = res.path;
            // Pre-fill title guess if empty
            var titleInput = document.getElementById('apd-wf-title');
            if (!titleInput.value) {
              var base = res.path.split(/[\\\\/]/).pop().replace(/\.pdf$/i, '').replace(/[_-]/g, ' ');
              titleInput.value = base;
            }
          }
        })
        .catch(function(err) {
          console.warn('Native browse_file failed:', err);
        });
    });

    // Ingestion Submission
    document.getElementById('apd-wf-submit-ingest').addEventListener('click', function() {
      var filePath = document.getElementById('apd-wf-file-path').value.trim();
      var title = document.getElementById('apd-wf-title').value.trim();
      var author = document.getElementById('apd-wf-author').value.trim();
      var year = document.getElementById('apd-wf-year').value.trim();

      if (!filePath) {
        alert('Please enter or browse for a PDF document path.');
        return;
      }
      if (!title) {
        alert('Please provide a document title.');
        return;
      }

      var btn = document.getElementById('apd-wf-submit-ingest');
      btn.disabled = true;
      btn.innerHTML = '<span>⏳</span> Ingesting & Calculating SHA-256...';

      var statusArea = document.getElementById('apd-wf-ingest-status-area');
      statusArea.innerHTML = `
        <div class="apd-wf-box apd-wf-box-muted">
          <span class="apd-wf-box-icon">⚙️</span>
          <div class="apd-wf-box-content">
            Verifying cryptographic integrity, applying lossless gzip compression, and registering source in native database...
          </div>
        </div>
      `;

      callNative('ingest_document', {
        file_path: filePath,
        title: title,
        author: author,
        year: year
      })
      .then(function(result) {
        btn.style.display = 'none';
        var ratio = result.original_bytes > 0 
          ? ((1 - (result.compressed_bytes / result.original_bytes)) * 100).toFixed(1) + '%' 
          : '0%';

        statusArea.innerHTML = `
          <div class="apd-wf-box apd-wf-box-emerald">
            <span class="apd-wf-box-icon">✓</span>
            <div class="apd-wf-box-content">
              <div class="apd-wf-box-title">Document Successfully Ingested & Losslessly Archived</div>
              Source ID: <code>${result.source_id}</code>
            </div>
          </div>

          <div style="background:hsl(var(--muted, 38 20% 94%) / 0.5); border:1px solid hsl(var(--border, 36 16% 87%)); border-radius:var(--radius, 8px); padding:14px 16px; font-size:12px; display:flex; flex-direction:column; gap:8px;">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <span style="font-weight:600;">🛡️ SHA-256 Lossless Hash:</span>
              <button class="apd-wf-btn apd-wf-btn-outline" style="padding:2px 8px; font-size:11px;" id="apd-wf-copy-hash">📋 Copy</button>
            </div>
            <div style="font-family:var(--font-mono, monospace); word-break:break-all; color:hsl(var(--primary, 18 58% 28%)); background:hsl(var(--card, 40 33% 99%)); padding:8px 10px; border-radius:4px; border:1px solid hsl(var(--border, 36 16% 87%));">
              ${result.sha256}
            </div>

            <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:8px; margin-top:4px;">
              <div><strong>Original:</strong> ${formatBytes(result.original_bytes)}</div>
              <div><strong>Compressed:</strong> ${formatBytes(result.compressed_bytes)}</div>
              <div><strong>Compression:</strong> ${ratio} saved</div>
            </div>

            <div style="margin-top:6px; display:flex; align-items:center; gap:8px;">
              <span>Default Classification:</span>
              <span class="apd-wf-badge apd-wf-badge-amber" style="margin:0;">CLASS_B (Degraded Letterpress)</span>
            </div>
            <div style="display:flex; align-items:center; gap:8px;">
              <span>Ingestion Status:</span>
              <span class="apd-wf-badge apd-wf-badge-amber" style="margin:0;">UNVERIFIED_ROUGH_SCAN</span>
            </div>
          </div>
        `;

        document.getElementById('apd-wf-copy-hash').addEventListener('click', function() {
          navigator.clipboard.writeText(result.sha256);
          this.textContent = 'Copied!';
          setTimeout(function() { document.getElementById('apd-wf-copy-hash').textContent = '📋 Copy'; }, 2000);
        });

        // Footer update with action buttons
        var footer = document.getElementById('apd-wf-ingest-footer');
        footer.innerHTML = `
          <button class="apd-wf-btn apd-wf-btn-outline" id="apd-wf-done-btn">Done</button>
          <button class="apd-wf-btn apd-wf-btn-secondary" id="apd-wf-go-transcribe">
            ✍️ Open Manual Transcription
          </button>
          <button class="apd-wf-btn apd-wf-btn-primary" id="apd-wf-go-classify">
            ⚖️ Review & Classify Source
          </button>
        `;

        document.getElementById('apd-wf-done-btn').addEventListener('click', closeModal);
        document.getElementById('apd-wf-go-transcribe').addEventListener('click', function() {
          showManualTranscriptionModal(result.source_id, 1);
        });
        document.getElementById('apd-wf-go-classify').addEventListener('click', function() {
          showClassificationModal(result.source_id);
        });
      })
      .catch(function(err) {
        btn.disabled = false;
        btn.innerHTML = '<span>📥</span> Ingest & Gate Document';
        statusArea.innerHTML = `
          <div class="apd-wf-box apd-wf-box-crimson">
            <span class="apd-wf-box-icon">✕</span>
            <div class="apd-wf-box-content">
              <div class="apd-wf-box-title">Ingestion Failed</div>
              ${err.message || err}
            </div>
          </div>
        `;
      });
    });
  }

  // ---------------------------------------------------------------------------
  // VIEW 2: CLASSIFICATION DIALOG
  // ---------------------------------------------------------------------------
  function showClassificationModal(sourceId) {
    closeModal();
    injectStyles();

    var backdrop = document.createElement('div');
    backdrop.id = 'apd-wf-modal-root';
    backdrop.className = 'apd-wf-backdrop';

    backdrop.innerHTML = `
      <div class="apd-wf-modal">
        <div class="apd-wf-header">
          <div class="apd-wf-header-left">
            <div class="apd-wf-badge apd-wf-badge-terracotta">
              <span>⚖️</span> Source Quality Gating
            </div>
            <h1 class="apd-wf-title">Document Degradation Classification</h1>
            <p class="apd-wf-subtitle" id="apd-wf-class-source-subtitle">
              Loading source details...
            </p>
          </div>
          <button class="apd-wf-close-btn" id="apd-wf-close">&times;</button>
        </div>

        <div class="apd-wf-body" id="apd-wf-class-body">
          <div style="font-size:13px; line-height:1.5;">
            Archaeological document extraction requires strict epistemic categorization. Machine OCR models systematically hallucinate when processing pre-digital letterpress, irregular lead slug types, and aged paper.
          </div>

          <div class="apd-wf-tier-grid">
            <!-- CLASS A CARD -->
            <div class="apd-wf-tier-card" id="apd-wf-tier-a">
              <div class="apd-wf-tier-name">
                <span>Class A: Modern Offset</span>
                <span class="apd-wf-badge apd-wf-badge-emerald" style="margin:0;">High Precision</span>
              </div>
              <p class="apd-wf-tier-desc">
                Clean typography, post-1970 digital or offset lithography, uniform baseline, zero ink bleed or broken lead type.
              </p>
              <div style="font-size:11.5px; font-weight:600; color:hsl(158 64% 35%);">
                Eligible for automated dual-engine extraction.
              </div>
            </div>

            <!-- CLASS B CARD -->
            <div class="apd-wf-tier-card selected" id="apd-wf-tier-b">
              <div class="apd-wf-tier-name">
                <span>Class B: Degraded Letterpress</span>
                <span class="apd-wf-badge apd-wf-badge-amber" style="margin:0;">Hard Gated</span>
              </div>
              <p class="apd-wf-tier-desc">
                Pre-1970 monographs, handset lead type, irregular baselines, uneven ink, bleed-through, historical journals.
              </p>
              <div style="font-size:11.5px; font-weight:600; color:hsl(32 85% 35%);">
                Automated claims strictly locked. Manual transcription only.
              </div>
            </div>
          </div>

          <!-- Class A Confirmation Guardrail -->
          <div id="apd-wf-class-a-guard" style="display:none; background:hsl(38 92% 50% / 0.08); border:1px solid hsl(38 92% 50% / 0.3); border-radius:var(--radius, 8px); padding:14px;">
            <label style="display:flex; align-items:flex-start; gap:10px; cursor:pointer; font-size:12.5px; line-height:1.5;">
              <input type="checkbox" id="apd-wf-clean-offset-check" style="margin-top:3px;" />
              <span>
                <strong>Physical Print Inspection Required:</strong> I have physically inspected the scan and confirm it is clean modern offset printing with uniform typography and zero letterpress distortions or bleed-through.
              </span>
            </label>
          </div>

          <!-- Retroactive Purge Warning for Existing Class A -->
          <div id="apd-wf-reflag-purge-warning" style="display:none;" class="apd-wf-box apd-wf-box-crimson">
            <span class="apd-wf-box-icon">⚠️</span>
            <div class="apd-wf-box-content">
              <div class="apd-wf-box-title">Retroactive Claim Purge Protection</div>
              Reflagging this document to <strong>Class B</strong> will retroactively purge all automated consensus claims associated with it. Only human manual double-entry claims will be preserved.
            </div>
          </div>

          <div id="apd-wf-class-status"></div>
        </div>

        <div class="apd-wf-footer">
          <button class="apd-wf-btn apd-wf-btn-outline" id="apd-wf-cancel">Cancel</button>
          <button class="apd-wf-btn apd-wf-btn-danger" id="apd-wf-reflag-btn" style="display:none;">
            <span>🔄</span> Reflag to Class B & Purge Automated Claims
          </button>
          <button class="apd-wf-btn apd-wf-btn-primary" id="apd-wf-save-class-btn">
            Save Classification
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(backdrop);
    document.getElementById('apd-wf-close').addEventListener('click', closeModal);
    document.getElementById('apd-wf-cancel').addEventListener('click', closeModal);

    var currentSource = null;
    var selectedTier = 'CLASS_B';

    // Fetch Source metadata
    callNative('get_sources')
      .then(function(sources) {
        for (var i = 0; i < sources.length; i++) {
          if (sources[i].id === sourceId) {
            currentSource = sources[i];
            break;
          }
        }
        if (currentSource) {
          document.getElementById('apd-wf-class-source-subtitle').textContent = 
            (currentSource.title || 'Untitled') + ' (' + (currentSource.author || 'Unknown') + ', ' + (currentSource.year || 'n.d.') + ')';
          
          if (currentSource.degradation_class === 'CLASS_A') {
            selectTier('CLASS_A');
            document.getElementById('apd-wf-reflag-btn').style.display = 'inline-flex';
            document.getElementById('apd-wf-reflag-purge-warning').style.display = 'flex';
          } else {
            selectTier('CLASS_B');
          }
        }
      })
      .catch(function(err) {
        document.getElementById('apd-wf-class-source-subtitle').textContent = 'Source ID: ' + sourceId;
      });

    function selectTier(tier) {
      selectedTier = tier;
      var cardA = document.getElementById('apd-wf-tier-a');
      var cardB = document.getElementById('apd-wf-tier-b');
      var guardA = document.getElementById('apd-wf-class-a-guard');
      var saveBtn = document.getElementById('apd-wf-save-class-btn');

      if (tier === 'CLASS_A') {
        cardA.classList.add('selected');
        cardB.classList.remove('selected');
        guardA.style.display = 'block';
        var chk = document.getElementById('apd-wf-clean-offset-check');
        saveBtn.disabled = !chk.checked;
      } else {
        cardB.classList.add('selected');
        cardA.classList.remove('selected');
        guardA.style.display = 'none';
        saveBtn.disabled = false;
      }
    }

    document.getElementById('apd-wf-tier-a').addEventListener('click', function() { selectTier('CLASS_A'); });
    document.getElementById('apd-wf-tier-b').addEventListener('click', function() { selectTier('CLASS_B'); });

    document.getElementById('apd-wf-clean-offset-check').addEventListener('change', function() {
      if (selectedTier === 'CLASS_A') {
        document.getElementById('apd-wf-save-class-btn').disabled = !this.checked;
      }
    });

    // Save Classification Action
    document.getElementById('apd-wf-save-class-btn').addEventListener('click', function() {
      var isConfirmed = document.getElementById('apd-wf-clean-offset-check').checked;
      var statusDiv = document.getElementById('apd-wf-class-status');
      statusDiv.innerHTML = '<div style="font-size:12px; color:hsl(var(--muted-foreground));">Applying classification...</div>';

      callNative('classify_source', {
        source_id: sourceId,
        target_class: selectedTier,
        confirmed_clean_offset: selectedTier === 'CLASS_A' ? isConfirmed : false
      })
      .then(function(res) {
        statusDiv.innerHTML = `
          <div class="apd-wf-box apd-wf-box-emerald">
            <span class="apd-wf-box-icon">✓</span>
            <div class="apd-wf-box-content">
              Classification saved as <strong>${res.degradation_class}</strong>.
            </div>
          </div>
        `;
        setTimeout(closeModal, 1200);
      })
      .catch(function(err) {
        statusDiv.innerHTML = `
          <div class="apd-wf-box apd-wf-box-crimson">
            <span class="apd-wf-box-icon">✕</span>
            <div class="apd-wf-box-content">
              Classification Rejected: ${err.message || err}
            </div>
          </div>
        `;
      });
    });

    // 1-Click Reflag & Retroactive Purge Action
    document.getElementById('apd-wf-reflag-btn').addEventListener('click', function() {
      if (!confirm('Are you sure you want to reflag this document to Class B? This will immediately purge all automated claims.')) {
        return;
      }
      var statusDiv = document.getElementById('apd-wf-class-status');
      callNative('reflag_source_class', { source_id: sourceId })
        .then(function(res) {
          statusDiv.innerHTML = `
            <div class="apd-wf-box apd-wf-box-emerald">
              <span class="apd-wf-box-icon">✓</span>
              <div class="apd-wf-box-content">
                Source successfully demoted to <strong>CLASS_B</strong>. Automated claims purged and text quarantined.
              </div>
            </div>
          `;
          setTimeout(closeModal, 1500);
        })
        .catch(function(err) {
          statusDiv.innerHTML = `
            <div class="apd-wf-box apd-wf-box-crimson">
              <span class="apd-wf-box-icon">✕</span>
              <div class="apd-wf-box-content">
                Reflagging failed: ${err.message || err}
              </div>
            </div>
          `;
        });
    });
  }

  // ---------------------------------------------------------------------------
  // VIEW 3: VERIFICATION QUEUE VIEW
  // ---------------------------------------------------------------------------
  function showVerificationQueueModal(sourceIdFilter) {
    closeModal();
    injectStyles();

    var backdrop = document.createElement('div');
    backdrop.id = 'apd-wf-modal-root';
    backdrop.className = 'apd-wf-backdrop';

    backdrop.innerHTML = `
      <div class="apd-wf-modal apd-wf-modal-wide">
        <div class="apd-wf-header">
          <div class="apd-wf-header-left">
            <div class="apd-wf-badge apd-wf-badge-terracotta">
              <span>📋</span> Human Discrepancy Queue
            </div>
            <h1 class="apd-wf-title">Anti-Anchoring Discrepancy Verification</h1>
            <p class="apd-wf-subtitle">
              Dual-engine discrepancies (Windows OCR vs. VLM consensus) require verified visual resolution against optical physical crops.
            </p>
          </div>
          <button class="apd-wf-close-btn" id="apd-wf-close">&times;</button>
        </div>

        <div class="apd-wf-body" id="apd-wf-vqueue-body">
          <div style="font-size:13px; color:hsl(var(--muted-foreground));">
            Loading verification items from native storage...
          </div>
        </div>

        <div class="apd-wf-footer">
          <button class="apd-wf-btn apd-wf-btn-outline" id="apd-wf-refresh-queue">
            🔄 Refresh Queue
          </button>
          <button class="apd-wf-btn apd-wf-btn-secondary" id="apd-wf-close-footer">
            Close
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(backdrop);
    document.getElementById('apd-wf-close').addEventListener('click', closeModal);
    document.getElementById('apd-wf-close-footer').addEventListener('click', closeModal);
    document.getElementById('apd-wf-refresh-queue').addEventListener('click', loadQueue);

    function loadQueue() {
      var body = document.getElementById('apd-wf-vqueue-body');
      body.innerHTML = '<div style="padding:20px; font-size:13px; color:hsl(var(--muted-foreground));">Loading queue...</div>';

      callNative('get_verification_queue', { source_id: sourceIdFilter || '' })
        .then(function(items) {
          if (!items || items.length === 0) {
            body.innerHTML = `
              <div class="apd-wf-box apd-wf-box-emerald">
                <span class="apd-wf-box-icon">✓</span>
                <div class="apd-wf-box-content">
                  <div class="apd-wf-box-title">Verification Queue Empty</div>
                  No unresolved discrepancies in the knowledge graph. All quantitative claims are grounded with consensus or manual transcription.
                </div>
              </div>
            `;
            return;
          }

          body.innerHTML = '';
          items.forEach(function(item) {
            var card = renderVerificationCard(item);
            body.appendChild(card);
          });
        })
        .catch(function(err) {
          body.innerHTML = `
            <div class="apd-wf-box apd-wf-box-crimson">
              <span class="apd-wf-box-icon">✕</span>
              <div class="apd-wf-box-content">
                Failed to load verification queue: ${err.message || err}
              </div>
            </div>
          `;
        });
    }

    function renderVerificationCard(item) {
      var card = document.createElement('div');
      card.className = 'apd-wf-vcard';
      card.id = 'vitem-card-' + item.id;

      var hasCrop = Boolean(item.crop_image_path && item.crop_image_path.trim().length > 0);
      var isResolved = item.status && item.status !== 'PENDING';

      var cropHtml = '';
      var cleanCropSrc = item.crop_image_path || '';
      if (cleanCropSrc.startsWith('/') || cleanCropSrc.startsWith('\\')) {
        cleanCropSrc = cleanCropSrc.replace(/^[/\\]+/, '');
      }
      if (hasCrop) {
        cropHtml = `
          <div class="apd-wf-crop-box" id="crop-box-${item.id}">
            <div class="apd-wf-crop-label">🔍 Physical Scan Crop (Direct Evidence)</div>
            <img src="${cleanCropSrc}" class="apd-wf-crop-img" id="crop-img-${item.id}" alt="Optical Scan Crop" />
          </div>
        `;
      } else {
        cropHtml = `
          <div class="apd-wf-box apd-wf-box-amber" id="crop-box-${item.id}">
            <span class="apd-wf-box-icon">🔒</span>
            <div class="apd-wf-box-content">
              <div class="apd-wf-box-title">ANTI-ANCHORING LOCKOUT ACTIVE</div>
              Visual optical crop is missing for this discrepancy item. In accordance with ArchaeoPhD epistemic invariants, candidate resolution is strictly locked without visual evidence to prevent cognitive anchoring. You may only reject this item.
            </div>
          </div>
        `;
      }

      card.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:flex-start;">
          <div>
            <div style="display:flex; align-items:center; gap:8px;">
              <span class="apd-wf-badge ${isResolved ? 'apd-wf-badge-emerald' : 'apd-wf-badge-amber'}" style="margin:0;">
                ${item.status}
              </span>
              <span style="font-size:12px; font-family:var(--font-mono, monospace); color:hsl(var(--muted-foreground));">
                ID: ${item.id} | Page ${item.page_number || 1}
              </span>
            </div>
            <div style="font-size:13px; font-weight:600; margin-top:4px;">
              Context: <em>"${item.context_text || 'No context snippet available'}"</em>
            </div>
          </div>
          <div style="font-size:11.5px; color:hsl(var(--muted-foreground)); text-align:right;">
            Field: <code>${item.field_type}</code>
          </div>
        </div>

        ${cropHtml}

        <div class="apd-wf-candidates-grid">
          <div class="apd-wf-candidate-box">
            <div class="apd-wf-candidate-title">Candidate A (Windows OCR)</div>
            <div class="apd-wf-candidate-val">${item.candidate_a || '—'}</div>
          </div>
          <div class="apd-wf-candidate-box">
            <div class="apd-wf-candidate-title">Candidate B (VLM Consensus)</div>
            <div class="apd-wf-candidate-val">${item.candidate_b || '—'}</div>
          </div>
        </div>

        <div style="font-size:12px; color:hsl(var(--muted-foreground));">
          <strong>Audit Note:</strong> ${item.audit_note || 'Discrepancy detected across dual extraction engines.'}
        </div>

        <!-- Inline Manual Override Input -->
        <div id="override-box-${item.id}" style="display:none; margin-top:6px; flex-direction:column; gap:6px;">
          <label style="font-size:12px; font-weight:600;">Manual Ground Truth (Type exact reading from crop above):</label>
          <div class="apd-wf-input-row">
            <input type="text" id="override-input-${item.id}" class="apd-wf-input" placeholder="Enter true value..." />
            <button class="apd-wf-btn apd-wf-btn-primary" id="override-submit-${item.id}">Submit Override</button>
          </div>
        </div>

        <!-- Action Row (Candidate resolution initially locked until crop verified rendered) -->
        <div style="display:flex; justify-content:flex-end; gap:8px; margin-top:4px;">
          <button class="apd-wf-btn apd-wf-btn-danger" id="btn-reject-${item.id}" ${isResolved ? 'disabled' : ''}>
            ✕ Reject Item
          </button>
          <button class="apd-wf-btn apd-wf-btn-secondary" id="btn-override-${item.id}" disabled>
            ✍️ Manual Override...
          </button>
          <button class="apd-wf-btn apd-wf-btn-outline" id="btn-choose-b-${item.id}" disabled>
            Accept Candidate B
          </button>
          <button class="apd-wf-btn apd-wf-btn-primary" id="btn-choose-a-${item.id}" disabled>
            Accept Candidate A
          </button>
        </div>
      `;

      var btnA = card.querySelector('#btn-choose-a-' + item.id);
      var btnB = card.querySelector('#btn-choose-b-' + item.id);
      var btnO = card.querySelector('#btn-override-' + item.id);

      function unlockCandidateButtons() {
        if (!isResolved) {
          btnA.disabled = false;
          btnB.disabled = false;
          btnO.disabled = false;
        }
      }

      function lockCandidateButtons(reason) {
        btnA.disabled = true;
        btnB.disabled = true;
        btnO.disabled = true;
        var box = card.querySelector('#crop-box-' + item.id);
        if (box && reason) {
          box.className = 'apd-wf-box apd-wf-box-amber';
          box.innerHTML = `
            <span class="apd-wf-box-icon">🔒</span>
            <div class="apd-wf-box-content">
              <div class="apd-wf-box-title">ANTI-ANCHORING LOCKOUT ACTIVE</div>
              ${reason}
            </div>
          `;
        }
      }

      // Physical crop renderability verification
      var imgEl = card.querySelector('#crop-img-' + item.id);
      if (hasCrop && imgEl) {
        function onImageLoaded() {
          if (imgEl.naturalWidth > 0) {
            unlockCandidateButtons();
          } else {
            lockCandidateButtons('Optical crop rendered with 0 dimensions. Candidate resolution locked.');
          }
        }
        function onImageError() {
          lockCandidateButtons('Optical crop file at <code>' + item.crop_image_path + '</code> failed to load or is missing on disk. Candidate resolution strictly locked to prevent cognitive bias.');
        }

        imgEl.addEventListener('load', onImageLoaded);
        imgEl.addEventListener('error', onImageError);
        if (imgEl.complete && imgEl.naturalWidth > 0) {
          onImageLoaded();
        }
      } else {
        lockCandidateButtons();
      }

      // Wire resolution actions
      function handleResolve(type, val) {
        callNative('resolve_verification_item', {
          item_id: item.id,
          resolution_type: type,
          override_value: val || ''
        })
        .then(function(res) {
          card.style.opacity = '0.7';
          card.querySelector('.apd-wf-badge').className = 'apd-wf-badge apd-wf-badge-emerald';
          card.querySelector('.apd-wf-badge').textContent = res.status;
          var btns = card.querySelectorAll('button');
          btns.forEach(function(b) { b.disabled = true; });
        })
        .catch(function(err) {
          alert('Resolution failed: ' + (err.message || err));
        });
      }

      card.querySelector('#btn-choose-a-' + item.id).addEventListener('click', function() {
        handleResolve('CANDIDATE_A');
      });
      card.querySelector('#btn-choose-b-' + item.id).addEventListener('click', function() {
        handleResolve('CANDIDATE_B');
      });
      card.querySelector('#btn-reject-' + item.id).addEventListener('click', function() {
        handleResolve('REJECT');
      });

      var overrideBox = card.querySelector('#override-box-' + item.id);
      card.querySelector('#btn-override-' + item.id).addEventListener('click', function() {
        overrideBox.style.display = overrideBox.style.display === 'none' ? 'flex' : 'none';
      });
      card.querySelector('#override-submit-' + item.id).addEventListener('click', function() {
        var val = card.querySelector('#override-input-' + item.id).value.trim();
        if (!val) { alert('Please enter the manual override reading.'); return; }
        handleResolve('MANUAL_OVERRIDE', val);
      });

      return card;
    }

    loadQueue();
  }

  // ---------------------------------------------------------------------------
  // VIEW 4: MANUAL TRANSCRIPTION VIEW
  // ---------------------------------------------------------------------------
  function showManualTranscriptionModal(sourceId, initialPage) {
    closeModal();
    injectStyles();

    initialPage = initialPage || 1;
    var backdrop = document.createElement('div');
    backdrop.id = 'apd-wf-modal-root';
    backdrop.className = 'apd-wf-backdrop';

    backdrop.innerHTML = `
      <div class="apd-wf-modal apd-wf-modal-wide" style="height:92vh; max-width:1250px;">
        <div class="apd-wf-header">
          <div class="apd-wf-header-left">
            <div class="apd-wf-badge apd-wf-badge-amber">
              <span>✍️</span> Class B Manual Double-Entry
            </div>
            <h1 class="apd-wf-title">Archival Scan Transcription</h1>
            <p class="apd-wf-subtitle" id="apd-wf-trans-subtitle">
              Strict Zero Pre-Fill Enforced — A blank field is safer than a plausible-looking wrong one.
            </p>
          </div>
          <button class="apd-wf-close-btn" id="apd-wf-close">&times;</button>
        </div>

        <div class="apd-wf-split">
          <!-- LEFT PANE: Scan Viewer -->
          <div class="apd-wf-split-left">
            <div class="apd-wf-scan-viewport" id="apd-wf-scan-viewport">
              <div class="apd-wf-scan-canvas" id="apd-wf-scan-canvas">
                <div style="font-family:var(--font-mono, monospace); font-size:10px; color:#999; margin-bottom:12px; border-bottom:1px solid #ddd; padding-bottom:4px;">
                  ARCHIVAL SCAN PREVIEW • PAGE ${initialPage}
                </div>
                <h3 style="margin-top:0; font-family:Georgia, serif; font-size:16px;">TRENCH B: STRATIGRAPHIC RECORD</h3>
                <p>
                  At a depth of 2.40 metres below surface datum, a dense deposit of burnt mudbrick and collapsed timber was encountered overlying Locus 402. The ash horizon measured approximately 40 centimetres in thickness.
                </p>
                <p>
                  Diagnostic pottery recovered within this stratum included wheel-made burnished red slip bowls and fragments of storage pithoi conforming to Middle Bronze Age IIB typological horizons.
                </p>
                <div style="margin-top:16px; border:1px dashed #bbb; padding:10px; background:#f5f0e6; font-size:12px;">
                  <em>[Physical Optical Note: Letterpress numeral "40" printed with damaged lead slug causing hairline ink bridge resembling "400". Transcription requires human verification.]</em>
                </div>
              </div>
            </div>

            <div class="apd-wf-scan-toolbar">
              <div style="display:flex; align-items:center; gap:8px;">
                <button class="apd-wf-btn apd-wf-btn-outline" style="padding:2px 8px; color:#eee;" id="apd-wf-prev-page">◀ Prev</button>
                <span>Page <strong id="apd-wf-cur-page">${initialPage}</strong> of 42</span>
                <button class="apd-wf-btn apd-wf-btn-outline" style="padding:2px 8px; color:#eee;" id="apd-wf-next-page">Next ▶</button>
              </div>
              <div style="font-size:11px;">
                Zoom: 100% | Archival Scan Layer
              </div>
            </div>
          </div>

          <!-- RIGHT PANE: Blank Transcription Form -->
          <div class="apd-wf-split-right">
            <div class="apd-wf-body" style="padding:20px 24px;">
              <!-- Zero Pre-Fill Banner -->
              <div class="apd-wf-box apd-wf-box-amber">
                <span class="apd-wf-box-icon">🛡️</span>
                <div class="apd-wf-box-content">
                  <div class="apd-wf-box-title">Zero Pre-Fill Epistemic Invariant</div>
                  In accordance with scientific rigor, machine OCR guesses are <strong>prohibited</strong> from pre-populating fields. Transcribe facts directly from the physical scan on the left.
                </div>
              </div>

              <div style="display:flex; justify-content:space-between; align-items:center;">
                <span style="font-weight:700; font-size:13px;">Extracted Archaeological Facts:</span>
                <button class="apd-wf-btn apd-wf-btn-outline" style="padding:4px 10px; font-size:12px;" id="apd-wf-add-fact-btn">
                  + Add Fact Row
                </button>
              </div>

              <!-- Fact Rows Container -->
              <div id="apd-wf-facts-container" style="display:flex; flex-direction:column; gap:10px;">
                <!-- Populated dynamically via template query -->
              </div>

              <div id="apd-wf-trans-status"></div>
            </div>

            <div class="apd-wf-footer" style="margin-top:auto;">
              <button class="apd-wf-btn apd-wf-btn-outline" id="apd-wf-trans-cancel">Cancel</button>
              <button class="apd-wf-btn apd-wf-btn-primary" id="apd-wf-trans-commit">
                <span>✓</span> Commit Verified Transcription
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(backdrop);
    document.getElementById('apd-wf-close').addEventListener('click', closeModal);
    document.getElementById('apd-wf-trans-cancel').addEventListener('click', closeModal);

    var curPage = initialPage;
    var container = document.getElementById('apd-wf-facts-container');

    function addFactRow(entityName, value, type) {
      var row = document.createElement('div');
      row.className = 'apd-wf-fact-row';
      row.innerHTML = `
        <input type="text" class="apd-wf-input fact-name" placeholder="Entity (e.g. Ash Layer)" value="${entityName || ''}" />
        <input type="text" class="apd-wf-input fact-val" placeholder="Value (e.g. 40 cm thickness)" value="${value || ''}" />
        <select class="apd-wf-input fact-type" style="padding:8px 4px;">
          <option value="measurement" ${type === 'measurement' ? 'selected' : ''}>Measurement</option>
          <option value="stratum" ${type === 'stratum' ? 'selected' : ''}>Stratum</option>
          <option value="locus" ${type === 'locus' ? 'selected' : ''}>Locus</option>
          <option value="artifact" ${type === 'artifact' ? 'selected' : ''}>Artifact</option>
          <option value="date" ${type === 'date' ? 'selected' : ''}>Date / Period</option>
        </select>
        <button class="apd-wf-btn apd-wf-btn-outline" style="padding:6px; color:#e11d48;" title="Remove row">✕</button>
      `;

      row.querySelector('button').addEventListener('click', function() {
        row.remove();
      });

      container.appendChild(row);
    }

    // Query backend template enforcing zero pre-fill
    function loadTemplate(page) {
      container.innerHTML = '<div style="font-size:12px; color:hsl(var(--muted-foreground));">Loading schema...</div>';
      callNative('get_transcription_template', { source_id: sourceId, page_number: page })
        .then(function(res) {
          container.innerHTML = '';
          // Confirm prefill_enabled is strictly false
          if (res.prefill_enabled !== false) {
            console.error('Epistemic invariant violation: prefill_enabled must be false!');
          }
          // Populate blank rows as defined by template schema
          if (res.fields && res.fields.length > 0) {
            addFactRow('', '', 'measurement');
            addFactRow('', '', 'stratum');
          } else {
            addFactRow('', '', 'measurement');
          }
        })
        .catch(function(err) {
          container.innerHTML = '';
          addFactRow('', '', 'measurement');
        });
    }

    document.getElementById('apd-wf-add-fact-btn').addEventListener('click', function() {
      addFactRow('', '', 'measurement');
    });

    document.getElementById('apd-wf-prev-page').addEventListener('click', function() {
      if (curPage > 1) {
        curPage--;
        document.getElementById('apd-wf-cur-page').textContent = curPage;
        loadTemplate(curPage);
      }
    });

    document.getElementById('apd-wf-next-page').addEventListener('click', function() {
      curPage++;
      document.getElementById('apd-wf-cur-page').textContent = curPage;
      loadTemplate(curPage);
    });

    // Commit Manual Transcription
    document.getElementById('apd-wf-trans-commit').addEventListener('click', function() {
      var rows = container.querySelectorAll('.apd-wf-fact-row');
      var facts = [];
      rows.forEach(function(r) {
        var entity = r.querySelector('.fact-name').value.trim();
        var val = r.querySelector('.fact-val').value.trim();
        var type = r.querySelector('.fact-type').value;
        if (entity && val) {
          facts.push({
            entity_name: entity,
            value: val,
            type: type
          });
        }
      });

      if (facts.length === 0) {
        alert('Please enter at least one verified archaeological fact.');
        return;
      }

      var statusDiv = document.getElementById('apd-wf-trans-status');
      statusDiv.innerHTML = '<div style="font-size:12px; color:hsl(var(--muted-foreground));">Committing verified claims to storage...</div>';

      callNative('save_manual_transcription', {
        source_id: sourceId,
        page_number: curPage,
        facts: facts
      })
      .then(function(res) {
        statusDiv.innerHTML = `
          <div class="apd-wf-box apd-wf-box-emerald">
            <span class="apd-wf-box-icon">✓</span>
            <div class="apd-wf-box-content">
              <strong>${facts.length} Verified Claims Committed</strong><br />
              Page ${curPage} claims are now grounded with <code>origin_type: "manual_transcription"</code>.
            </div>
          </div>
        `;
        setTimeout(closeModal, 1600);
      })
      .catch(function(err) {
        statusDiv.innerHTML = `
          <div class="apd-wf-box apd-wf-box-crimson">
            <span class="apd-wf-box-icon">✕</span>
            <div class="apd-wf-box-content">
              Failed to save transcription: ${err.message || err}
            </div>
          </div>
        `;
      });
    });

    loadTemplate(curPage);
  }

  // ---------------------------------------------------------------------------
  // FLOATING RESEARCH QUICK-ACTION DOCK
  // ---------------------------------------------------------------------------
  function injectFloatingDock() {
    if (document.getElementById('apd-wf-floating-dock')) return;
    injectStyles();

    var dock = document.createElement('div');
    dock.id = 'apd-wf-floating-dock';
    dock.className = 'apd-wf-dock';

    dock.innerHTML = `
      <button class="apd-wf-dock-btn" id="apd-dock-ingest" title="Ingest & Gate PDF Document">
        <span>📥</span> Ingest
      </button>
      <button class="apd-wf-dock-btn" id="apd-dock-queue" title="Verification Queue">
        <span>📋</span> Verify <span class="apd-wf-dock-badge" id="apd-dock-queue-count" style="display:none;">0</span>
      </button>
      <button class="apd-wf-dock-btn" id="apd-dock-transcribe" title="Manual Transcription View">
        <span>✍️</span> Transcribe
      </button>
    `;

    document.body.appendChild(dock);

    document.getElementById('apd-dock-ingest').addEventListener('click', function() {
      showIngestionModal();
    });
    document.getElementById('apd-dock-queue').addEventListener('click', function() {
      showVerificationQueueModal();
    });
    document.getElementById('apd-dock-transcribe').addEventListener('click', function() {
      // Pick first source or ask
      callNative('get_sources')
        .then(function(sources) {
          if (sources && sources.length > 0) {
            showManualTranscriptionModal(sources[0].id, 1);
          } else {
            showIngestionModal();
          }
        })
        .catch(function() {
          showManualTranscriptionModal('src-default', 1);
        });
    });

    // Check pending verification queue count periodically
    function updateQueueBadge() {
      callNative('get_verification_queue')
        .then(function(items) {
          var count = 0;
          if (items && items.length) {
            items.forEach(function(it) { if (it.status === 'PENDING') count++; });
          }
          var badge = document.getElementById('apd-dock-queue-count');
          if (badge) {
            if (count > 0) {
              badge.textContent = count;
              badge.style.display = 'inline-block';
            } else {
              badge.style.display = 'none';
            }
          }
        })
        .catch(function() {});
    }

    setTimeout(updateQueueBadge, 1500);
    setInterval(updateQueueBadge, 30000);
  }

  // ---------------------------------------------------------------------------
  // LIBRARY VIEW INJECTION
  // ---------------------------------------------------------------------------
  function injectLibraryActions() {
    // Look for library cards or source rows to attach quick actions
    var rows = document.querySelectorAll('[data-source-id], .source-card, .source-item');
    rows.forEach(function(row) {
      if (row.querySelector('.apd-wf-row-actions')) return;
      var sid = row.getAttribute('data-source-id') || row.id || '';
      if (!sid) return;

      var bar = document.createElement('div');
      bar.className = 'apd-wf-row-actions';
      bar.style.cssText = 'display:flex; gap:6px; margin-top:8px;';
      bar.innerHTML = `
        <button class="apd-wf-btn apd-wf-btn-outline" style="padding:3px 8px; font-size:11px;" title="Classify Degradation">
          ⚖️ Classify
        </button>
        <button class="apd-wf-btn apd-wf-btn-outline" style="padding:3px 8px; font-size:11px;" title="Manual Double-Entry">
          ✍️ Transcribe
        </button>
      `;

      var btns = bar.querySelectorAll('button');
      btns[0].addEventListener('click', function(e) {
        e.stopPropagation();
        showClassificationModal(sid);
      });
      btns[1].addEventListener('click', function(e) {
        e.stopPropagation();
        showManualTranscriptionModal(sid, 1);
      });

      row.appendChild(bar);
    });
  }

  var observer = new MutationObserver(function() {
    injectLibraryActions();
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });

  // ---------------------------------------------------------------------------
  // GLOBAL EXPORTS
  // ---------------------------------------------------------------------------
  window.archaeophdIngestion = {
    openIngestion: showIngestionModal,
    openClassification: showClassificationModal,
    openVerificationQueue: showVerificationQueueModal,
    openManualTranscription: showManualTranscriptionModal
  };

  // Launch dock when DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectFloatingDock);
  } else {
    injectFloatingDock();
  }
})();
