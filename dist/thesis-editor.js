/**
 * ArchaeoPhD — Thesis Writing Studio & Grounded AI Editor
 * 
 * Comprehensive Dissertation Drafting Workspace:
 * - Dual Manual Editor + AI Research Suggestion Assistant
 * - AI suggestions grounded strictly in years of project research:
 *   ingested monographs, excavation field reports, verified claims,
 *   radiocarbon calibrations, and detected stratigraphic contradictions.
 * - Chapter Management & Outline Matrix (Introduction through Conclusion)
 * - Auto-saving to local project storage per chapter
 * - Pre-Submission Defense Readiness Audit integration
 */

(function () {
  'use strict';

  var DEFAULT_CHAPTERS = [
    'Introduction & Historiography',
    'Theoretical Framework & Research Questions',
    'Methodology, Stratigraphy & Chronometric Dating',
    'Excavation Data, Loci & Ceramic Typology',
    'Spatial Distribution, GIS & Regional Context',
    'Synthesis, Inter-Site Synchronization & Discussion',
    'Conclusion, Limitations & Future Research'
  ];

  var APD_ICONS = {
    book: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/><path d="M6 2v20"/></svg>',
    pen: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>',
    sparkles: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>',
    shieldCheck: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>',
    layers: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>',
    bookmark: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>',
    copy: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>',
    download: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>',
    check: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
    checkCircle: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
    alert: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg>',
    refresh: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 21h5v-5"/></svg>',
    x: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/></svg>',
    plus: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" x2="12" y1="5" y2="19"/><line x1="5" x2="19" y1="12" y2="12"/></svg>',
    chevronRight: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>',
    quote: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/></svg>',
    list: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" x2="21" y1="6" y2="6"/><line x1="8" x2="21" y1="12" y2="12"/><line x1="8" x2="21" y1="18" y2="18"/><line x1="3" x2="3.01" y1="6" y2="6"/><line x1="3" x2="3.01" y1="12" y2="12"/><line x1="3" x2="3.01" y1="18" y2="18"/></svg>'
  };

  function injectStyles() {
    if (document.getElementById('apd-thesis-editor-styles')) return;
    var style = document.createElement('style');
    style.id = 'apd-thesis-editor-styles';
    style.textContent = `
      /* Thesis Writing Studio Ergonomics */
      .apd-te-container {
        font-family: var(--font-body, "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif);
        color: hsl(var(--foreground, 30 10% 12%));
      }
      .apd-te-canvas {
        font-family: "Georgia", "Cambria", "Times New Roman", serif;
        font-size: 15px;
        line-height: 1.75;
        letter-spacing: 0.01em;
        background: transparent;
        color: hsl(var(--foreground, 30 10% 12%));
        border: none;
        outline: none;
        width: 100%;
        min-height: 480px;
        resize: vertical;
        padding: 16px;
      }
      .apd-te-canvas::placeholder {
        color: hsl(var(--muted-foreground, 30 8% 55%) / 0.65);
        font-style: italic;
      }
      .apd-te-pill-active {
        background: hsl(var(--primary, 24 75% 42%)) !important;
        color: hsl(var(--primary-foreground, 0 0% 100%)) !important;
        border-color: hsl(var(--primary, 24 75% 42%)) !important;
      }
      .apd-te-tab-btn {
        transition: all 0.15s ease;
      }
      .apd-te-tab-btn:hover {
        background: hsl(var(--muted, 38 20% 94%) / 0.7);
      }
      .apd-te-pulse {
        animation: apdTePulse 1.5s infinite ease-in-out;
      }
      @keyframes apdTePulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }
      .apd-te-badge {
        font-size: 10.5px;
        font-weight: 600;
        padding: 2px 7px;
        border-radius: 9999px;
      }
      .apd-te-panel {
        background: hsl(var(--card, 40 33% 99%));
        border: 1px solid hsl(var(--border, 36 16% 87%));
        border-radius: calc(var(--radius, 10px) + 2px);
      }
    `;
    document.head.appendChild(style);
  }

  // Active Project ID Resolver
  function getActiveProjectId() {
    return localStorage.getItem('archaeo_active_project') || 'default';
  }

  function getActiveProjectTitle() {
    try {
      var projs = JSON.parse(localStorage.getItem('archaeophd_local_projects') || '[]');
      var curId = getActiveProjectId();
      var found = projs.find(function(p) { return p.id === curId; });
      if (found && (found.title || found.name)) return found.title || found.name;
    } catch(e) {}
    return "Dissertation Workspace";
  }

  // Chapter Draft Storage Manager
  var DraftStore = {
    getChapters: function(projectId) {
      try {
        var saved = localStorage.getItem('archaeophd_thesis_chapters_' + projectId);
        if (saved) {
          var arr = JSON.parse(saved);
          if (Array.isArray(arr) && arr.length > 0) return arr;
        }
      } catch(e) {}
      return DEFAULT_CHAPTERS.slice();
    },
    saveChapters: function(projectId, chapters) {
      try {
        localStorage.setItem('archaeophd_thesis_chapters_' + projectId, JSON.stringify(chapters));
      } catch(e) {}
    },
    getDraft: function(projectId, chapter) {
      try {
        return localStorage.getItem('archaeophd_thesis_draft_' + projectId + '_' + encodeURIComponent(chapter)) || '';
      } catch(e) {
        return '';
      }
    },
    saveDraft: function(projectId, chapter, text) {
      try {
        localStorage.setItem('archaeophd_thesis_draft_' + projectId + '_' + encodeURIComponent(chapter), text);
      } catch(e) {}
    },
    getStatus: function(projectId, chapter) {
      try {
        return localStorage.getItem('archaeophd_thesis_status_' + projectId + '_' + encodeURIComponent(chapter)) || 'drafting';
      } catch(e) {
        return 'drafting';
      }
    },
    saveStatus: function(projectId, chapter, status) {
      try {
        localStorage.setItem('archaeophd_thesis_status_' + projectId + '_' + encodeURIComponent(chapter), status);
      } catch(e) {}
    }
  };

  // Main UI Renderer
  var ThesisStudio = {
    activeTab: 'editor',       // 'editor' | 'audit' | 'outline'
    activeChapter: DEFAULT_CHAPTERS[0],
    isAiLoading: false,
    aiSuggestionText: '',
    showShelf: false,
    auditData: null,
    sources: [],
    claims: [],
    contradictions: [],

    init: function () {
      injectStyles();
      this.attachNavigationListener();
    },

    attachNavigationListener: function () {
      var self = this;
      function checkPath() {
        var path = window.location.pathname;
        if (path === '/thesis' || path.endsWith('/thesis') || window.location.hash === '#/thesis') {
          self.mountIfPresent();
        }
      }
      window.addEventListener('popstate', checkPath);
      setInterval(checkPath, 600);
    },

    mountIfPresent: function () {
      var root = document.getElementById('root');
      if (!root) return;
      var existingStudio = document.getElementById('apd-thesis-studio-mount');
      if (existingStudio) return;

      // Check if user is on Thesis page
      var pageTitle = document.querySelector('h1, h2, h3');
      var isThesisPage = window.location.pathname.indexOf('/thesis') !== -1 || (pageTitle && pageTitle.innerText.indexOf('Thesis') !== -1);
      if (!isThesisPage) return;

      // Enhance the current page by rendering the comprehensive Thesis Studio
      this.loadProjectData();
    },

    loadProjectData: async function () {
      var projectId = getActiveProjectId();
      var bridge = window.nativeBridge;
      if (bridge && typeof bridge.call === 'function') {
        try {
          var s = await bridge.call('get_sources', {}, projectId);
          if (Array.isArray(s)) this.sources = s;
        } catch(e) {}
        try {
          var c = await bridge.call('get_claims', {}, projectId);
          if (Array.isArray(c)) this.claims = c;
        } catch(e) {}
        try {
          var con = await bridge.call('get_contradictions', {}, projectId);
          if (Array.isArray(con)) this.contradictions = con;
        } catch(e) {}
        try {
          var a = await bridge.call('get_thesis_audit', {}, projectId);
          if (a) this.auditData = a;
        } catch(e) {}
      }
      this.render();
    },

    render: function () {
      var container = document.getElementById('apd-thesis-studio-mount');
      if (!container) {
        container = document.createElement('div');
        container.id = 'apd-thesis-studio-mount';
        container.className = 'apd-te-container space-y-5 p-2';

        var root = document.getElementById('root');
        var mainContent = root ? root.querySelector('main, .p-6, .space-y-6, div > div') : null;
        if (mainContent) {
          mainContent.innerHTML = '';
          mainContent.appendChild(container);
        } else if (root) {
          root.innerHTML = '';
          root.appendChild(container);
        }
      }

      var projectId = getActiveProjectId();
      var projectTitle = getActiveProjectTitle();
      var chapters = DraftStore.getChapters(projectId);
      var currentDraft = DraftStore.getDraft(projectId, this.activeChapter);
      var currentStatus = DraftStore.getStatus(projectId, this.activeChapter);

      var words = currentDraft.trim() ? currentDraft.trim().split(/\s+/).filter(Boolean).length : 0;
      var chars = currentDraft.length;
      var readMin = Math.max(1, Math.ceil(words / 220));

      var self = this;

      container.innerHTML = `
        <!-- Studio Header -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border">
          <div>
            <div class="flex items-center gap-2.5">
              <span class="p-2 rounded-xl bg-primary/10 border border-primary/20 text-primary">${APD_ICONS.book}</span>
              <div>
                <h1 class="text-xl font-bold font-display text-foreground tracking-tight">Thesis Writing Studio & Editor</h1>
                <p class="text-xs text-muted-foreground">${projectTitle} • Grounded Academic Dissertation Workspace</p>
              </div>
            </div>
          </div>

          <!-- View Switcher -->
          <div class="flex items-center gap-1.5 p-1 bg-muted/60 rounded-xl border border-border shrink-0 self-start md:self-center">
            <button id="apd-te-tab-editor" class="apd-te-tab-btn flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold ${this.activeTab === 'editor' ? 'bg-card text-foreground shadow-sm border border-border font-bold' : 'text-muted-foreground'}">
              ${APD_ICONS.pen} Chapter Editor & AI Studio
            </button>
            <button id="apd-te-tab-audit" class="apd-te-tab-btn flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold ${this.activeTab === 'audit' ? 'bg-card text-foreground shadow-sm border border-border font-bold' : 'text-muted-foreground'}">
              ${APD_ICONS.shieldCheck} Pre-Submission Audit
              ${this.auditData ? `<span class="px-1.5 py-0.2 rounded-full bg-primary/10 text-primary text-[10px] font-bold">${this.auditData.defense_readiness_score || 85}%</span>` : ''}
            </button>
            <button id="apd-te-tab-outline" class="apd-te-tab-btn flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold ${this.activeTab === 'outline' ? 'bg-card text-foreground shadow-sm border border-border font-bold' : 'text-muted-foreground'}">
              ${APD_ICONS.layers} Chapter Matrix (${chapters.length})
            </button>
          </div>
        </div>

        ${this.activeTab === 'editor' ? this.renderEditorView(chapters, currentDraft, currentStatus, words, chars, readMin) : ''}
        ${this.activeTab === 'audit' ? this.renderAuditView() : ''}
        ${this.activeTab === 'outline' ? this.renderOutlineView(chapters) : ''}
      `;

      this.bindEvents(container, projectId);
    },

    renderEditorView: function (chapters, draftText, status, words, chars, readMin) {
      var self = this;
      var activeChapterClaims = this.claims.filter(function(c) {
        return (c.chapter || '').toLowerCase() === self.activeChapter.toLowerCase();
      });

      return `
        <!-- Chapter Selector Ribbon -->
        <div class="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
          <span class="text-[11px] font-bold uppercase tracking-wider text-muted-foreground shrink-0 flex items-center gap-1.5 mr-1">
            ${APD_ICONS.book} Chapter:
          </span>
          ${chapters.map(function(ch, idx) {
            var isSelected = ch === self.activeChapter;
            var chClaims = self.claims.filter(function(c) { return (c.chapter || '').toLowerCase() === ch.toLowerCase(); });
            return `
              <button data-ch="${encodeURIComponent(ch)}" class="apd-te-ch-btn px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-2 border shrink-0 ${isSelected ? 'bg-primary text-white border-primary shadow-sm font-semibold' : 'bg-card/70 text-foreground/80 border-border hover:bg-muted'}">
                <span class="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${isSelected ? 'bg-white/25 text-white' : 'bg-muted text-muted-foreground'}">${idx + 1}</span>
                <span>${ch}</span>
                ${chClaims.length > 0 ? `<span class="text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-white/25 text-white' : 'bg-muted/80 text-muted-foreground'}">${chClaims.length}</span>` : ''}
              </button>
            `;
          }).join('')}
        </div>

        <!-- Main Dual Canvas -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          
          <!-- Left: Manual Editor (7 cols) -->
          <div class="lg:col-span-7 space-y-3">
            <div class="rounded-xl border border-border bg-card shadow-sm overflow-hidden flex flex-col">
              
              <!-- Chapter Header Bar -->
              <div class="p-3.5 border-b border-border bg-muted/20 flex flex-wrap items-center justify-between gap-3">
                <div class="flex items-center gap-2 flex-1 min-w-[220px]">
                  <span class="text-xs font-bold text-primary uppercase tracking-wider">Chapter:</span>
                  <span class="text-sm font-bold text-foreground truncate">${this.activeChapter}</span>
                </div>

                <div class="flex items-center gap-2 text-xs">
                  <select id="apd-te-status-select" class="px-2.5 py-1 rounded-md bg-card border border-border text-xs font-medium text-foreground outline-none cursor-pointer">
                    <option value="drafting" ${status === 'drafting' ? 'selected' : ''}>Status: Drafting</option>
                    <option value="review" ${status === 'review' ? 'selected' : ''}>Status: In Review</option>
                    <option value="ready" ${status === 'ready' ? 'selected' : ''}>Status: Defense Ready</option>
                  </select>

                  <button id="apd-te-toggle-shelf" class="px-2.5 py-1 rounded-md border text-xs font-medium flex items-center gap-1 transition-all ${this.showShelf ? 'bg-accent/15 border-accent text-accent' : 'bg-card border-border hover:bg-muted'}">
                    ${APD_ICONS.bookmark} Project Shelf
                  </button>

                  <button id="apd-te-copy-btn" class="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground" title="Copy draft">
                    ${APD_ICONS.copy}
                  </button>

                  <button id="apd-te-export-btn" class="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground" title="Export Markdown">
                    ${APD_ICONS.download}
                  </button>
                </div>
              </div>

              <!-- Formatting Toolbar -->
              <div class="p-2 border-b border-border bg-muted/10 flex flex-wrap items-center gap-1 text-xs">
                <button data-fmt="bold" class="p-1.5 rounded hover:bg-muted font-bold text-muted-foreground hover:text-foreground" title="Bold">B</button>
                <button data-fmt="italic" class="p-1.5 rounded hover:bg-muted italic text-muted-foreground hover:text-foreground" title="Italic">I</button>
                <div class="h-4 w-px bg-border mx-1"></div>
                <button data-fmt="h2" class="px-1.5 py-0.5 rounded hover:bg-muted font-semibold text-xs text-muted-foreground hover:text-foreground" title="Heading 2">H2</button>
                <button data-fmt="h3" class="px-1.5 py-0.5 rounded hover:bg-muted font-semibold text-xs text-muted-foreground hover:text-foreground" title="Heading 3">H3</button>
                <div class="h-4 w-px bg-border mx-1"></div>
                <button data-fmt="quote" class="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground" title="Blockquote">${APD_ICONS.quote}</button>
                <button data-fmt="list" class="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground" title="Bullet List">${APD_ICONS.list}</button>
                <div class="h-4 w-px bg-border mx-1"></div>

                <!-- Quick Citation Inserter -->
                <div class="flex items-center gap-1.5 ml-auto">
                  ${this.sources.length > 0 ? `
                    <select id="apd-te-quick-cite" class="bg-card border border-border text-[11px] rounded px-2 py-1 text-muted-foreground hover:text-foreground outline-none cursor-pointer max-w-[150px] truncate">
                      <option value="">+ Insert Citation…</option>
                      ${this.sources.map(function(s) {
                        return `<option value=" (${s.author || 'Author'}, ${s.year || 'n.d.'}: p. ${s.pages || 'XX'})">${s.author || 'Author'} (${s.year || 'n.d.'})</option>`;
                      }).join('')}
                    </select>
                  ` : ''}

                  ${activeChapterClaims.length > 0 ? `
                    <select id="apd-te-quick-claim" class="bg-card border border-border text-[11px] rounded px-2 py-1 text-muted-foreground hover:text-foreground outline-none cursor-pointer max-w-[150px] truncate">
                      <option value="">+ Insert Claim…</option>
                      ${activeChapterClaims.map(function(c) {
                        return `<option value='\\n\\n"${c.claim_text}"\\n'>${c.claim_text.substring(0, 32)}…</option>`;
                      }).join('')}
                    </select>
                  ` : ''}
                </div>
              </div>

              <!-- Manual Textarea Surface -->
              <div class="p-4 flex-1">
                <textarea id="apd-te-textarea" class="apd-te-canvas" placeholder="Begin drafting '${this.activeChapter}' here…&#10;&#10;Synthesize primary excavation strata, diagnostic ceramics, radiocarbon dates, and author citations. Click any AI Assistant action on the right to synthesize your project claims or suggest grounded citations from your library.">${draftText}</textarea>
              </div>

              <!-- Footer Status Bar -->
              <div class="p-3 border-t border-border bg-muted/20 flex flex-wrap items-center justify-between text-xs text-muted-foreground gap-2">
                <div class="flex items-center gap-4">
                  <span id="apd-te-word-stat" class="font-bold text-foreground">${words} words</span>
                  <span id="apd-te-char-stat">${chars} characters</span>
                  <span>~${readMin} min read</span>
                </div>

                <div class="flex items-center gap-1.5 text-[11px] text-accent font-semibold">
                  ${APD_ICONS.checkCircle} Saved locally to project
                </div>
              </div>

            </div>
          </div>

          <!-- Right: AI Suggestion Studio & Project Shelf (5 cols) -->
          <div class="lg:col-span-5 space-y-4">
            
            <!-- AI Grounded Research Co-Writer -->
            <div class="rounded-xl border border-primary/25 bg-card p-4 shadow-sm space-y-3.5">
              <div class="flex items-center justify-between pb-3 border-b border-border">
                <div class="flex items-center gap-2">
                  <div class="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                    ${APD_ICONS.sparkles}
                  </div>
                  <div>
                    <h3 class="font-bold text-sm text-foreground">AI Research Co-Writer</h3>
                    <p class="text-[11px] text-muted-foreground">Grounded strictly in active project library</p>
                  </div>
                </div>
                <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20">
                  Offline Neural AI
                </span>
              </div>

              <!-- Grounding Indicator -->
              <div class="p-2.5 rounded-lg bg-muted/40 border border-border text-[11px] text-foreground/80 flex items-center justify-between">
                <span>Grounded in:</span>
                <div class="flex items-center gap-2 font-bold text-primary">
                  <span>${this.sources.length} Monographs</span>
                  <span>•</span>
                  <span>${activeChapterClaims.length} Claims</span>
                  <span>•</span>
                  <span>${this.contradictions.length} Disputes</span>
                </div>
              </div>

              <!-- Action Pills -->
              <div class="space-y-1.5">
                <span class="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Select AI Writing Action:</span>
                <div class="grid grid-cols-2 gap-1.5">
                  <button data-ai="synthesize" class="apd-te-ai-btn p-2 rounded-lg border border-border bg-card/60 hover:bg-muted text-left text-xs font-medium transition-colors flex items-center gap-1.5">
                    <span class="text-primary">${APD_ICONS.sparkles}</span>
                    <span>Synthesize Claims</span>
                  </button>

                  <button data-ai="citations" class="apd-te-ai-btn p-2 rounded-lg border border-border bg-card/60 hover:bg-muted text-left text-xs font-medium transition-colors flex items-center gap-1.5">
                    <span class="text-accent">${APD_ICONS.book}</span>
                    <span>Suggest Citations</span>
                  </button>

                  <button data-ai="viva_check" class="apd-te-ai-btn p-2 rounded-lg border border-border bg-card/60 hover:bg-muted text-left text-xs font-medium transition-colors flex items-center gap-1.5">
                    <span class="text-chart-4">${APD_ICONS.shieldCheck}</span>
                    <span>Viva Defense Check</span>
                  </button>

                  <button data-ai="expand" class="apd-te-ai-btn p-2 rounded-lg border border-border bg-card/60 hover:bg-muted text-left text-xs font-medium transition-colors flex items-center gap-1.5">
                    <span class="text-primary">${APD_ICONS.pen}</span>
                    <span>Continue Paragraph</span>
                  </button>
                </div>
              </div>

              <!-- Custom Query -->
              <div class="space-y-1.5 pt-1">
                <span class="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Or Custom Scholarly Request:</span>
                <div class="flex gap-2">
                  <input id="apd-te-custom-query" type="text" placeholder="e.g. How does Stratum IV chronology relate to Kenyon 1978?…" class="text-xs h-8 px-2.5 rounded-md border border-border bg-transparent flex-1 outline-none" />
                  <button id="apd-te-custom-gen-btn" class="h-8 px-3 rounded-md bg-primary text-white text-xs font-bold hover:bg-primary/90 flex items-center gap-1">
                    Generate
                  </button>
                </div>
              </div>

              <!-- Loading Indicator -->
              <div id="apd-te-ai-loading" class="hidden p-6 rounded-xl border border-primary/20 bg-primary/5 flex flex-col items-center justify-center text-center space-y-2">
                <span class="text-primary apd-te-pulse">${APD_ICONS.refresh}</span>
                <p class="text-xs font-bold text-foreground">Evaluating library monographs & claims…</p>
                <p class="text-[10px] text-muted-foreground">Synthesizing peer-reviewed archaeological prose with Qwen 2.5 7B</p>
              </div>

              <!-- AI Suggestion Output Box -->
              <div id="apd-te-ai-output" class="${this.aiSuggestionText ? '' : 'hidden'} p-3.5 rounded-xl border border-primary/30 bg-primary/5 space-y-2.5">
                <div class="flex items-center justify-between text-xs pb-1.5 border-b border-primary/15">
                  <span class="font-bold text-primary text-[11px] flex items-center gap-1">
                    ${APD_ICONS.sparkles} Grounded Academic Suggestion
                  </span>
                  <button id="apd-te-close-suggestion" class="text-muted-foreground hover:text-foreground">${APD_ICONS.x}</button>
                </div>

                <div id="apd-te-suggestion-body" class="text-xs font-serif leading-relaxed text-foreground/90 max-h-[220px] overflow-y-auto whitespace-pre-wrap p-2 rounded bg-card/80 border border-border">
                  ${this.aiSuggestionText}
                </div>

                <div class="flex items-center justify-between pt-1">
                  <button id="apd-te-insert-suggestion" class="h-7 px-2.5 rounded-md bg-primary text-white text-xs font-semibold hover:bg-primary/90 flex items-center gap-1">
                    ${APD_ICONS.pen} Insert in Editor
                  </button>

                  <div class="flex gap-1.5">
                    <button id="apd-te-append-suggestion" class="h-7 px-2.5 rounded-md border border-border bg-card text-xs font-medium hover:bg-muted">
                      Append
                    </button>
                    <button id="apd-te-copy-suggestion" class="h-7 px-2 rounded-md border border-border bg-card hover:bg-muted text-muted-foreground" title="Copy suggestion">
                      ${APD_ICONS.copy}
                    </button>
                  </div>
                </div>
              </div>

            </div>

            <!-- Project Research Shelf (Collapsible) -->
            ${this.showShelf ? `
              <div class="rounded-xl border border-accent/30 bg-card p-4 space-y-4 shadow-sm animate-in fade-in duration-200">
                <div class="flex items-center justify-between pb-2 border-b border-border">
                  <h4 class="font-bold text-xs flex items-center gap-1.5 text-accent">
                    ${APD_ICONS.bookmark} Project Research Shelf
                  </h4>
                  <button id="apd-te-close-shelf" class="text-muted-foreground hover:text-foreground">${APD_ICONS.x}</button>
                </div>

                <!-- Claims Section -->
                <div class="space-y-1.5">
                  <span class="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Claims Allocated to this Chapter (${activeChapterClaims.length}):
                  </span>
                  ${activeChapterClaims.length === 0 ? `
                    <p class="text-xs text-muted-foreground italic">No claims allocated to "${this.activeChapter}". Link claims in Claims Manager.</p>
                  ` : `
                    <div class="space-y-1.5 max-h-[140px] overflow-y-auto">
                      ${activeChapterClaims.map(function(c) {
                        return `
                          <div class="p-2 rounded bg-muted/40 border border-border text-xs flex items-start justify-between gap-2">
                            <span class="line-clamp-2 text-[11px]">${c.claim_text}</span>
                            <button data-insert-claim="${encodeURIComponent(c.claim_text)}" class="apd-te-shelf-claim text-[10px] text-primary hover:underline shrink-0 font-bold">+ Insert</button>
                          </div>
                        `;
                      }).join('')}
                    </div>
                  `}
                </div>

                <!-- Sources Section -->
                <div class="space-y-1.5 pt-2 border-t border-border">
                  <span class="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Ingested Library Monographs (${this.sources.length}):
                  </span>
                  <div class="space-y-1.5 max-h-[140px] overflow-y-auto">
                    ${this.sources.map(function(s) {
                      return `
                        <div class="p-2 rounded bg-muted/40 border border-border text-xs flex items-center justify-between gap-2">
                          <div class="truncate text-[11px]">
                            <span class="font-bold text-foreground">${s.author || 'Author'}</span> (${s.year || 'n.d.'}): ${s.title}
                          </div>
                          <button data-cite-src="${encodeURIComponent(s.author || 'Author')}" data-cite-yr="${encodeURIComponent(s.year || 'n.d.')}" data-cite-pg="${encodeURIComponent(s.pages || 'XX')}" class="apd-te-shelf-cite text-[10px] text-accent hover:underline shrink-0 font-bold">+ Cite</button>
                        </div>
                      `;
                    }).join('')}
                  </div>
                </div>
              </div>
            ` : ''}

          </div>

        </div>
      `;
    },

    renderAuditView: function () {
      var self = this;
      var projectId = getActiveProjectId();
      var chapters = DraftStore.getChapters(projectId);
      var score = (this.auditData && this.auditData.defense_readiness_score) || 85;

      return `
        <div class="space-y-6">
          <div class="rounded-xl border border-primary/20 bg-card p-6 shadow-sm">
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-5 border-b border-border">
              <div class="flex items-center gap-4">
                <div class="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex flex-col items-center justify-center shrink-0">
                  <span class="text-2xl font-bold text-primary">${score}%</span>
                  <span class="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Defense</span>
                </div>
                <div>
                  <h3 class="font-bold text-lg flex items-center gap-2">
                    ${APD_ICONS.shieldCheck} Pre-Submission Defense Readiness Audit
                  </h3>
                  <p class="text-sm text-muted-foreground">
                    Verifies chapter assertions against physical excavation layers, IntCal20 radiocarbon bounds, and detected library contradictions.
                  </p>
                </div>
              </div>

              <button id="apd-te-run-audit-btn" class="px-3.5 py-2 rounded-lg bg-primary text-white text-xs font-bold hover:bg-primary/90 flex items-center gap-1.5 shadow-sm">
                ${APD_ICONS.refresh} Re-Audit All Chapters
              </button>
            </div>

            <!-- Stats -->
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5">
              <div class="p-3.5 rounded-xl bg-muted/40 border border-border">
                <div class="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Total Claims</div>
                <div class="text-2xl font-bold">${this.claims.length}</div>
              </div>
              <div class="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive">
                <div class="text-[10px] font-bold uppercase tracking-wider mb-1">Unsupported Claims</div>
                <div class="text-2xl font-bold">${(this.auditData && this.auditData.unsupported_claims_count) || 0}</div>
              </div>
              <div class="p-3.5 rounded-xl bg-chart-4/10 border border-chart-4/20 text-chart-4">
                <div class="text-[10px] font-bold uppercase tracking-wider mb-1">Active Conflicts</div>
                <div class="text-2xl font-bold">${(this.auditData && this.auditData.total_conflicts_detected) || this.contradictions.length}</div>
              </div>
              <div class="p-3.5 rounded-xl bg-muted/40 border border-border">
                <div class="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Affected Chapters</div>
                <div class="text-2xl font-bold">${(this.auditData && this.auditData.affected_chapters && this.auditData.affected_chapters.length) || 0}</div>
              </div>
            </div>
          </div>

          <!-- Per-Chapter Cards -->
          <div class="space-y-4">
            <h4 class="font-bold text-sm flex items-center gap-2">
              ${APD_ICONS.layers} Chapter Claims Verification
            </h4>
            ${chapters.map(function(ch) {
              var chClaims = self.claims.filter(function(c) { return (c.chapter || '').toLowerCase() === ch.toLowerCase(); });
              var isAffected = self.auditData && self.auditData.affected_chapters && self.auditData.affected_chapters.includes(ch);
              return `
                <div class="rounded-xl border bg-card overflow-hidden ${isAffected ? 'border-chart-4/40 shadow-sm' : 'border-border'}">
                  <div class="flex items-center justify-between p-4 border-b border-border bg-muted/20">
                    <div class="flex items-center gap-3">
                      <span class="${isAffected ? 'text-chart-4' : 'text-accent'}">${isAffected ? APD_ICONS.alert : APD_ICONS.checkCircle}</span>
                      <div>
                        <h4 class="font-bold text-base font-display">${ch}</h4>
                        <p class="text-xs text-muted-foreground">${chClaims.length} verified claim${chClaims.length !== 1 ? 's' : ''}</p>
                      </div>
                    </div>

                    <button data-open-ch="${encodeURIComponent(ch)}" class="apd-te-open-editor px-3 py-1.5 rounded-lg border border-border bg-card text-xs font-semibold hover:bg-muted flex items-center gap-1">
                      Draft Chapter ${APD_ICONS.chevronRight}
                    </button>
                  </div>

                  <div class="p-4">
                    ${chClaims.length === 0 ? `
                      <p class="text-xs text-muted-foreground italic">No claims assigned to this chapter yet. Go to Claims Manager to link claims.</p>
                    ` : `
                      <div class="space-y-2">
                        ${chClaims.map(function(c) {
                          return `
                            <div class="p-3 rounded-lg border border-border bg-card/60 flex items-start justify-between gap-3 text-xs">
                              <div class="flex-1">
                                <span class="font-medium text-foreground">${c.claim_text}</span>
                                ${c.scholar_name ? `<div class="text-[11px] text-muted-foreground mt-0.5">Scholar: ${c.scholar_name} ${c.page_ref ? `(p. ${c.page_ref})` : ''}</div>` : ''}
                              </div>
                            </div>
                          `;
                        }).join('')}
                      </div>
                    `}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    },

    renderOutlineView: function (chapters) {
      var self = this;
      return `
        <div class="space-y-4">
          <div class="flex gap-2">
            <input id="apd-te-new-chapter-input" type="text" placeholder="Add a custom dissertation chapter (e.g. Chapter 4: Petrographic Analysis)…" class="max-w-md text-xs h-9 px-3 rounded-lg border border-border bg-transparent flex-1 outline-none" />
            <button id="apd-te-add-chapter-btn" class="h-9 px-3.5 rounded-lg border border-border bg-card text-xs font-bold hover:bg-muted flex items-center gap-1">
              ${APD_ICONS.plus} Add Chapter
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            ${chapters.map(function(ch, idx) {
              var chClaims = self.claims.filter(function(c) { return (c.chapter || '').toLowerCase() === ch.toLowerCase(); });
              return `
                <div class="p-4 rounded-xl border border-border bg-card flex flex-col justify-between space-y-3 shadow-sm">
                  <div class="flex items-start justify-between gap-3">
                    <div class="flex items-center gap-2.5">
                      <span class="w-6 h-6 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                        ${idx + 1}
                      </span>
                      <h4 class="font-bold text-sm text-foreground">${ch}</h4>
                    </div>
                    <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-muted text-muted-foreground">
                      ${chClaims.length} Claims
                    </span>
                  </div>

                  <div class="flex items-center justify-between pt-2 border-t border-border text-xs">
                    <span class="text-muted-foreground text-[11px]">
                      ${idx === 0 ? 'Historiographical Foundation' : idx === chapters.length - 1 ? 'Final Viva Conclusions' : 'Core Empirical Chapter'}
                    </span>
                    <button data-open-ch="${encodeURIComponent(ch)}" class="apd-te-open-editor h-7 px-2.5 rounded border border-border bg-card text-xs font-semibold hover:bg-muted flex items-center gap-1">
                      Draft Chapter ${APD_ICONS.chevronRight}
                    </button>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    },

    bindEvents: function (container, projectId) {
      var self = this;

      // Tab switcher
      var tabEditor = container.querySelector('#apd-te-tab-editor');
      if (tabEditor) tabEditor.onclick = function () { self.activeTab = 'editor'; self.render(); };
      
      var tabAudit = container.querySelector('#apd-te-tab-audit');
      if (tabAudit) tabAudit.onclick = function () { self.activeTab = 'audit'; self.render(); };

      var tabOutline = container.querySelector('#apd-te-tab-outline');
      if (tabOutline) tabOutline.onclick = function () { self.activeTab = 'outline'; self.render(); };

      // Chapter buttons
      var chBtns = container.querySelectorAll('.apd-te-ch-btn');
      chBtns.forEach(function(b) {
        b.onclick = function() {
          self.activeChapter = decodeURIComponent(b.getAttribute('data-ch'));
          self.render();
        };
      });

      var openChBtns = container.querySelectorAll('.apd-te-open-editor');
      openChBtns.forEach(function(b) {
        b.onclick = function() {
          self.activeChapter = decodeURIComponent(b.getAttribute('data-open-ch'));
          self.activeTab = 'editor';
          self.render();
        };
      });

      // Textarea autosave
      var ta = container.querySelector('#apd-te-textarea');
      if (ta) {
        ta.oninput = function () {
          DraftStore.saveDraft(projectId, self.activeChapter, ta.value);
          var words = ta.value.trim() ? ta.value.trim().split(/\s+/).filter(Boolean).length : 0;
          var chars = ta.value.length;
          var wStat = container.querySelector('#apd-te-word-stat');
          var cStat = container.querySelector('#apd-te-char-stat');
          if (wStat) wStat.innerText = words + ' words';
          if (cStat) cStat.innerText = chars + ' characters';
        };
      }

      // Status selector
      var statusSel = container.querySelector('#apd-te-status-select');
      if (statusSel) {
        statusSel.onchange = function () {
          DraftStore.saveStatus(projectId, self.activeChapter, statusSel.value);
        };
      }

      // Shelf toggle
      var shelfBtn = container.querySelector('#apd-te-toggle-shelf');
      if (shelfBtn) {
        shelfBtn.onclick = function () {
          self.showShelf = !self.showShelf;
          self.render();
        };
      }

      var closeShelf = container.querySelector('#apd-te-close-shelf');
      if (closeShelf) {
        closeShelf.onclick = function () {
          self.showShelf = false;
          self.render();
        };
      }

      // Quick Citation and Claim dropdowns
      var quickCite = container.querySelector('#apd-te-quick-cite');
      if (quickCite && ta) {
        quickCite.onchange = function () {
          if (quickCite.value) {
            self.insertAtCursor(ta, quickCite.value);
            quickCite.value = '';
          }
        };
      }

      var quickClaim = container.querySelector('#apd-te-quick-claim');
      if (quickClaim && ta) {
        quickClaim.onchange = function () {
          if (quickClaim.value) {
            self.insertAtCursor(ta, quickClaim.value);
            quickClaim.value = '';
          }
        };
      }

      // Formatting buttons
      var fmtBtns = container.querySelectorAll('[data-fmt]');
      fmtBtns.forEach(function(b) {
        b.onclick = function() {
          if (!ta) return;
          var fmt = b.getAttribute('data-fmt');
          if (fmt === 'bold') self.wrapSelection(ta, '**', '**');
          else if (fmt === 'italic') self.wrapSelection(ta, '*', '*');
          else if (fmt === 'h2') self.wrapSelection(ta, '## ', '');
          else if (fmt === 'h3') self.wrapSelection(ta, '### ', '');
          else if (fmt === 'quote') self.wrapSelection(ta, '> ', '');
          else if (fmt === 'list') self.wrapSelection(ta, '- ', '');
        };
      });

      // Copy & Export
      var copyBtn = container.querySelector('#apd-te-copy-btn');
      if (copyBtn && ta) {
        copyBtn.onclick = function () {
          navigator.clipboard.writeText(ta.value);
          alert('Chapter draft copied to clipboard!');
        };
      }

      var exportBtn = container.querySelector('#apd-te-export-btn');
      if (exportBtn && ta) {
        exportBtn.onclick = function () {
          var filename = self.activeChapter.replace(/[^a-zA-Z0-9_-]/g, '_') + '_Draft.md';
          var blob = new Blob([
            '# ' + self.activeChapter + '\n\n' +
            '**Project:** ' + getActiveProjectTitle() + '\n' +
            '**Exported:** ' + new Date().toLocaleString() + '\n\n' +
            '---\n\n' + ta.value
          ], { type: 'text/markdown;charset=utf-8' });
          var url = URL.createObjectURL(blob);
          var a = document.createElement('a');
          a.href = url;
          a.download = filename;
          a.click();
          URL.revokeObjectURL(url);
        };
      }

      // Shelf inserts
      var shelfClaims = container.querySelectorAll('.apd-te-shelf-claim');
      shelfClaims.forEach(function(b) {
        b.onclick = function() {
          var clm = decodeURIComponent(b.getAttribute('data-insert-claim'));
          if (ta) self.insertAtCursor(ta, '\n\n"' + clm + '"\n');
        };
      });

      var shelfCites = container.querySelectorAll('.apd-te-shelf-cite');
      shelfCites.forEach(function(b) {
        b.onclick = function() {
          var a = decodeURIComponent(b.getAttribute('data-cite-src'));
          var y = decodeURIComponent(b.getAttribute('data-cite-yr'));
          var p = decodeURIComponent(b.getAttribute('data-cite-pg'));
          if (ta) self.insertAtCursor(ta, ' (' + a + ', ' + y + ': p. ' + p + ')');
        };
      });

      // AI Generation Buttons
      var aiBtns = container.querySelectorAll('.apd-te-ai-btn');
      aiBtns.forEach(function(b) {
        b.onclick = function() {
          var mode = b.getAttribute('data-ai');
          self.runAiQuery(mode, '');
        };
      });

      var customGenBtn = container.querySelector('#apd-te-custom-gen-btn');
      var customQueryInput = container.querySelector('#apd-te-custom-query');
      if (customGenBtn && customQueryInput) {
        customGenBtn.onclick = function() {
          var val = customQueryInput.value.trim();
          if (val) self.runAiQuery('custom', val);
        };
      }

      // AI Output actions
      var closeSug = container.querySelector('#apd-te-close-suggestion');
      if (closeSug) {
        closeSug.onclick = function () {
          self.aiSuggestionText = '';
          var box = container.querySelector('#apd-te-ai-output');
          if (box) box.classList.add('hidden');
        };
      }

      var insSug = container.querySelector('#apd-te-insert-suggestion');
      if (insSug && ta) {
        insSug.onclick = function () {
          self.insertAtCursor(ta, '\n\n' + self.aiSuggestionText + '\n\n');
        };
      }

      var appSug = container.querySelector('#apd-te-append-suggestion');
      if (appSug && ta) {
        appSug.onclick = function () {
          ta.value = ta.value + '\n\n' + self.aiSuggestionText;
          DraftStore.saveDraft(projectId, self.activeChapter, ta.value);
          alert('Appended suggestion to chapter draft!');
        };
      }

      var copySug = container.querySelector('#apd-te-copy-suggestion');
      if (copySug) {
        copySug.onclick = function () {
          navigator.clipboard.writeText(self.aiSuggestionText);
          alert('Copied suggestion to clipboard!');
        };
      }

      // Audit View Actions
      var runAuditBtn = container.querySelector('#apd-te-run-audit-btn');
      if (runAuditBtn) {
        runAuditBtn.onclick = async function () {
          var bridge = window.nativeBridge;
          if (bridge && typeof bridge.call === 'function') {
            runAuditBtn.innerText = 'Auditing…';
            try {
              var a = await bridge.call('get_thesis_audit', {}, projectId);
              self.auditData = a;
              self.render();
            } catch(e) {
              alert('Audit failed: ' + e.message);
            }
          }
        };
      }

      // Add Custom Chapter in Outline View
      var addChBtn = container.querySelector('#apd-te-add-chapter-btn');
      var newChInp = container.querySelector('#apd-te-new-chapter-input');
      if (addChBtn && newChInp) {
        addChBtn.onclick = function () {
          var title = newChInp.value.trim();
          if (!title) return;
          var cur = DraftStore.getChapters(projectId);
          if (cur.includes(title)) return;
          cur.push(title);
          DraftStore.saveChapters(projectId, cur);
          self.activeChapter = title;
          self.activeTab = 'editor';
          self.render();
        };
      }
    },

    wrapSelection: function (ta, prefix, suffix) {
      var start = ta.selectionStart || 0;
      var end = ta.selectionEnd || 0;
      var sel = ta.value.substring(start, end);
      var replacement = prefix + (sel || 'text') + suffix;
      ta.value = ta.value.substring(0, start) + replacement + ta.value.substring(end);
      DraftStore.saveDraft(getActiveProjectId(), this.activeChapter, ta.value);
      ta.focus();
      ta.setSelectionRange(start + prefix.length, start + prefix.length + (sel.length || 4));
    },

    insertAtCursor: function (ta, text) {
      var start = ta.selectionStart || 0;
      var end = ta.selectionEnd || 0;
      ta.value = ta.value.substring(0, start) + text + ta.value.substring(end);
      DraftStore.saveDraft(getActiveProjectId(), this.activeChapter, ta.value);
      ta.focus();
      ta.setSelectionRange(start + text.length, start + text.length);
    },

    runAiQuery: async function (mode, customQuery) {
      var projectId = getActiveProjectId();
      var bridge = window.nativeBridge;
      var loadingEl = document.getElementById('apd-te-ai-loading');
      var outputEl = document.getElementById('apd-te-ai-output');
      var bodyEl = document.getElementById('apd-te-suggestion-body');

      if (loadingEl) loadingEl.classList.remove('hidden');
      if (outputEl) outputEl.classList.add('hidden');

      var self = this;
      var activeChapterClaims = this.claims.filter(function(c) {
        return (c.chapter || '').toLowerCase() === self.activeChapter.toLowerCase();
      });

      var librarySources = this.sources.slice(0, 15).map(function(s) {
        return '"' + s.title + '" by ' + s.author + ' (' + (s.year || 'n.d.') + '), pp. ' + (s.pages || 'N/A');
      });
      var verifiedClaims = activeChapterClaims.map(function(c) {
        return '- ' + c.claim_text + ' [Scholar: ' + (c.scholar_name || 'Recorded') + ', Status: ' + (c.status || 'Active') + ']';
      });
      var activeConflicts = this.contradictions.slice(0, 5).map(function(c) {
        return '- ' + (c.title || c.type) + ': ' + c.claim_a + ' vs ' + c.claim_b + ' (' + (c.anomaly_description || 'Disputed layer sequence') + ')';
      });

      var currentDraft = DraftStore.getDraft(projectId, this.activeChapter);

      var instruction = "";
      if (mode === 'synthesize') {
        instruction = "Synthesize all verified empirical claims, excavation reports, and author monographs into a cohesive, academically rigorous thesis section for this chapter. Tie primary stratigraphy and dates together into peer-reviewed prose.";
      } else if (mode === 'citations') {
        instruction = "Examine the drafted text and recommend precise inline citations from the researcher's ingested monograph library. Identify exact author names, publication years, and page ranges that substantiate each assertion.";
      } else if (mode === 'viva_check') {
        instruction = "Conduct a viva examination counter-argument check. Examine whether any statement contradicts other excavation monographs in the library or contested radiocarbon dates. Provide a rigorous defense footnote caveat addressing potential examiner skepticism.";
      } else if (mode === 'expand') {
        instruction = "Generate the next logical academic paragraph continuing the current draft, advancing the archaeological interpretation with empirical rigor.";
      } else if (customQuery) {
        instruction = "Researcher Custom Inquiry: " + customQuery;
      }

      var promptText = 
        "You are ArchaeoPhD AI, an expert archaeological research and dissertation writing workstation assistant.\n" +
        "You are assisting an archaeological scientist and PhD researcher with drafting Chapter: \"" + this.activeChapter + "\".\n\n" +
        "ACTIVE PROJECT RESEARCH LIBRARY (Grounded in years of monographs, excavation field reports, and registered claims):\n" +
        "INGESTED SOURCES:\n" +
        (librarySources.length > 0 ? librarySources.join('\n') : '(Active library currently contains zero external monograph records.)') + "\n\n" +
        "VERIFIED CLAIMS ALLOCATED TO THIS CHAPTER:\n" +
        (verifiedClaims.length > 0 ? verifiedClaims.join('\n') : '(No specific claims tagged to this chapter yet. Base analysis on overall library.)') + "\n\n" +
        "ACTIVE CONTRADICTIONS & STRATIGRAPHIC DISPUTES:\n" +
        (activeConflicts.length > 0 ? activeConflicts.join('\n') : '(Zero active stratigraphic contradictions recorded.)') + "\n\n" +
        "CURRENT CHAPTER DRAFT TEXT (Last 1,500 characters):\n\"\"\"\n" +
        (currentDraft ? currentDraft.slice(-1500) : "(Draft is currently blank. Provide an introductory thesis chapter opening.)") + "\n\"\"\"\n\n" +
        "TASK:\n" + instruction + "\n\n" +
        "ACADEMIC GROUNDING RULES:\n" +
        "1. Ground your suggestion strictly in the active project sources, authors, and claims listed above.\n" +
        "2. Maintain rigorous peer-reviewed archaeological standard. Never invent archaeological sites or citations not present in the workspace.\n" +
        "3. Use standard inline academic citations (Author, Year: p. XX) when referencing sources from the library.\n" +
        "4. Output the drafted academic text directly, ready for dissertation insertion.";

      var resultText = "";
      try {
        if (bridge && typeof bridge.call === 'function') {
          var res = await bridge.call('invoke_llm', { prompt: promptText }, projectId);
          if (res && res.answer) {
            resultText = res.answer;
          } else if (typeof res === 'string') {
            resultText = res;
          } else {
            resultText = JSON.stringify(res, null, 2);
          }
        }
      } catch(err) {
        resultText = "Error during AI generation: " + err.message;
      }

      if (loadingEl) loadingEl.classList.add('hidden');
      this.aiSuggestionText = resultText;
      if (bodyEl) bodyEl.innerText = resultText;
      if (outputEl) outputEl.classList.remove('hidden');
    }
  };

  // Auto-boot on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { ThesisStudio.init(); });
  } else {
    ThesisStudio.init();
  }

  // Expose globally
  window.archaeophdThesis = ThesisStudio;

})();

