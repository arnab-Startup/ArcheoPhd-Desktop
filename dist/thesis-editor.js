/**
 * ArchaeoPhD — Thesis Writing Studio & Focused Chapter Editor
 * 
 * Focused, fast, and smooth chapter writing experience:
 * - Clicking a chapter opens ONLY that chapter in a dedicated studio.
 * - Quick chapter switcher ribbon at the top for instant 1-click chapter jumps.
 * - Distraction-free, responsive drafting canvas with instant debounced local autosave.
 * - SVG toolbar (Bold, Italic, H2, H3, Blockquote, Bullet List, Citation Inserter).
 * - Grounded Neural AI Assistant (Synthesize Claims, Suggest Citations, Viva Check, Continue Paragraph).
 * - Chapter Claims & Evidence Shelf directly integrated into the studio.
 * - Full Pre-Submission Defense Readiness Audit tab.
 */

(function () {
  'use strict';

  var DEFAULT_CHAPTERS = [
    'Introduction',
    'Literature Review',
    'Methodology',
    'Chapter 1',
    'Chapter 2',
    'Chapter 3',
    'Discussion',
    'Conclusion'
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
    arrowLeft: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" x2="5" y1="12" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>',
    quote: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/></svg>',
    list: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" x2="21" y1="6" y2="6"/><line x1="8" x2="21" y1="12" y2="12"/><line x1="8" x2="21" y1="18" y2="18"/><line x1="3" x2="3.01" y1="6" y2="6"/><line x1="3" x2="3.01" y1="12" y2="12"/><line x1="3" x2="3.01" y1="18" y2="18"/></svg>',
    bold: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 12h9a4 4 0 0 1 0 8H7a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h7a4 4 0 0 1 0 8"/><path d="M6 12h9"/></svg>',
    italic: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="19" x2="10" y1="4" y2="4"/><line x1="14" x2="5" y1="20" y2="20"/><line x1="15" x2="9" y1="4" y2="20"/></svg>',
    heading2: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12h8"/><path d="M4 18V6"/><path d="M12 18V6"/><path d="M21 18h-4c0-4 4-3 4-6 0-1.5-2-2.5-4-1"/></svg>',
    heading3: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12h8"/><path d="M4 18V6"/><path d="M12 18V6"/><path d="M17.5 10.5c1.7-1 3.5 0 3.5 1.5a2 2 0 0 1-2 2"/><path d="M17 17.5c2 1.5 4 .3 4-1.5a2 2 0 0 0-2-2"/></svg>'
  };

  function injectStyles() {
    if (document.getElementById('apd-thesis-editor-styles')) return;
    var style = document.createElement('style');
    style.id = 'apd-thesis-editor-styles';
    style.textContent = `
      .apd-te-container {
        font-family: var(--font-body, "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif);
        color: hsl(var(--foreground, 30 10% 12%));
      }
      .apd-te-canvas {
        font-family: "Georgia", "Cambria", "Times New Roman", serif;
        font-size: 15.5px;
        line-height: 1.8;
        letter-spacing: 0.01em;
        background: transparent;
        color: hsl(var(--foreground, 30 10% 12%));
        border: none;
        outline: none;
        width: 100%;
        min-height: 520px;
        resize: vertical;
        padding: 20px;
      }
      .apd-te-canvas::placeholder {
        color: hsl(var(--muted-foreground, 30 8% 55%) / 0.65);
        font-style: italic;
      }
      .apd-te-canvas:focus {
        outline: none;
      }
      .apd-te-pulse {
        animation: apdTePulse 1.5s infinite ease-in-out;
      }
      @keyframes apdTePulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }
      .apd-te-card-hover {
        transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease;
      }
      .apd-te-card-hover:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px -2px rgba(0, 0, 0, 0.06);
        border-color: hsl(var(--primary, 24 75% 42%) / 0.5);
      }
    `;
    document.head.appendChild(style);
  }

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
    },
    getChecks: function(projectId) {
      try {
        var saved = localStorage.getItem('archaeophd_thesis_checks_' + projectId);
        if (saved) return JSON.parse(saved);
      } catch(e) {}
      return {};
    },
    saveCheck: function(projectId, chapter, checkResult) {
      try {
        var c = this.getChecks(projectId);
        c[chapter] = checkResult;
        localStorage.setItem('archaeophd_thesis_checks_' + projectId, JSON.stringify(c));
      } catch(e) {}
    }
  };

  var ThesisStudio = {
    viewMode: 'workspace', // 'workspace' (all chapters overview) | 'chapter' (focused ONLY on active chapter) | 'audit' (defense audit)
    activeChapter: DEFAULT_CHAPTERS[0],
    activeRightTab: 'ai',   // 'ai' | 'claims' | 'sources'
    checkingChapter: null,
    isAiLoading: false,
    auditData: null,
    sources: [],
    claims: [],
    evidence: [],
    contradictions: [],
    checks: {},

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
      if (existingStudio && existingStudio.children.length > 0) return;

      var pageTitle = document.querySelector('h1, h2, h3');
      var isThesisPage = window.location.pathname.indexOf('/thesis') !== -1 || (pageTitle && pageTitle.innerText.indexOf('Thesis') !== -1);
      if (!isThesisPage) return;

      this.loadProjectData();
    },

    loadProjectData: async function () {
      var projectId = getActiveProjectId();
      this.checks = DraftStore.getChecks(projectId);

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
          var ev = await bridge.call('get_evidence', {}, projectId);
          if (Array.isArray(ev)) this.evidence = ev;
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

    getEvidenceByClaim: function () {
      var m = {};
      (this.evidence || []).forEach(function (e) {
        if (!m[e.claim_id]) m[e.claim_id] = [];
        m[e.claim_id].push(e);
      });
      return m;
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

      if (this.viewMode === 'chapter') {
        container.innerHTML = this.renderSingleChapterView(chapters, projectId, projectTitle);
      } else if (this.viewMode === 'audit') {
        container.innerHTML = this.renderAuditHeader(projectTitle) + this.renderAuditView(chapters, projectId);
      } else {
        container.innerHTML = this.renderWorkspaceOverview(chapters, projectId, projectTitle);
      }

      this.bindEvents(container, projectId);
    },

    /**
     * View 1: Clean Chapter Workspace Overview
     * Lists all chapters. Clicking any chapter immediately opens ONLY that chapter!
     */
    renderWorkspaceOverview: function (chapters, projectId, projectTitle) {
      var self = this;
      var evByClaim = this.getEvidenceByClaim();

      return `
        <!-- Workspace Header -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border">
          <div>
            <div class="flex items-center gap-2.5">
              <span class="p-2.5 rounded-xl bg-primary/10 border border-primary/20 text-primary">${APD_ICONS.book}</span>
              <div>
                <h1 class="text-2xl font-bold font-display text-foreground tracking-tight">Thesis Workspace & Chapters</h1>
                <p class="text-xs text-muted-foreground">${projectTitle} • Select any chapter to begin drafting</p>
              </div>
            </div>
          </div>

          <!-- Top Navigation Switcher -->
          <div class="flex items-center gap-1.5 p-1 bg-muted/60 rounded-xl border border-border shrink-0 self-start md:self-center">
            <button id="apd-te-tab-workspace" class="apd-te-tab-btn flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-card text-foreground shadow-sm border border-border font-bold">
              ${APD_ICONS.layers} All Chapters (${chapters.length})
            </button>
            <button id="apd-te-tab-audit" class="apd-te-tab-btn flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-muted-foreground hover:text-foreground">
              ${APD_ICONS.shieldCheck} Defense Audit
              ${this.auditData ? `<span class="px-1.5 py-0.2 rounded-full bg-primary/10 text-primary text-[10px] font-bold">${this.auditData.defense_readiness_score || 85}%</span>` : ''}
            </button>
          </div>
        </div>

        <!-- Banner -->
        <div class="rounded-xl border border-accent/30 bg-accent/5 p-4 flex items-start gap-3">
          <div class="text-accent shrink-0 mt-0.5">${APD_ICONS.alert}</div>
          <div class="text-sm text-foreground/80">
            <span class="font-semibold text-foreground">Click on any chapter below to open its dedicated writing studio.</span>
            Draft thesis prose with instant autosave, cite monographs, and consult the neural AI research assistant grounded strictly in your project's field evidence.
          </div>
        </div>

        <!-- Add Custom Chapter Bar -->
        <div class="flex gap-2">
          <input id="apd-te-new-chapter-input" type="text" placeholder="Add a custom chapter (e.g. Chapter 4: Petrographic Analysis)…" class="max-w-md text-xs h-9 px-3 rounded-lg border border-border bg-card text-foreground outline-none focus:border-primary" />
          <button id="apd-te-add-chapter-btn" class="h-9 px-3.5 rounded-lg border border-border bg-card text-xs font-medium hover:bg-muted flex items-center gap-1.5">
            ${APD_ICONS.plus} Add chapter
          </button>
        </div>

        <!-- Chapters Grid: Fast, clean cards. Clicking any card opens ONLY that chapter! -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          ${chapters.map(function (ch, idx) {
            var cl = (self.claims || []).filter(function (c) {
              return (c.chapter || '').toLowerCase() === ch.toLowerCase();
            });
            var draft = DraftStore.getDraft(projectId, ch);
            var words = draft.trim() ? draft.trim().split(/\s+/).filter(Boolean).length : 0;
            var status = DraftStore.getStatus(projectId, ch);
            var check = self.checks[ch];

            return `
              <div data-open-chapter="${encodeURIComponent(ch)}" class="apd-te-card-hover rounded-xl border border-border bg-card p-4 flex flex-col justify-between space-y-3 shadow-sm cursor-pointer">
                <div>
                  <div class="flex items-start justify-between gap-3">
                    <div class="flex items-center gap-2.5">
                      <span class="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                        ${idx + 1}
                      </span>
                      <div>
                        <h3 class="font-display text-base font-bold text-foreground hover:text-primary transition-colors">${ch}</h3>
                        <p class="text-xs text-muted-foreground mt-0.5">
                          ${cl.length} claim${cl.length !== 1 ? 's' : ''} • ${words} words drafted
                        </p>
                      </div>
                    </div>

                    <span class="text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${status === 'ready' ? 'bg-accent/15 text-accent' : status === 'review' ? 'bg-chart-4/15 text-chart-4' : 'bg-muted text-muted-foreground'}">
                      ${status === 'ready' ? 'Defense Ready' : status === 'review' ? 'In Review' : 'Drafting'}
                    </span>
                  </div>

                  <!-- Claim previews or status snippet -->
                  <div class="mt-3 pt-3 border-t border-border/60 text-xs">
                    ${cl.length > 0 ? `
                      <div class="flex flex-wrap gap-1.5">
                        <span class="text-[10.5px] text-muted-foreground">Key claims:</span>
                        <span class="text-[11px] font-medium text-foreground/90 truncate max-w-[280px]">"${cl[0].claim_text}"</span>
                        ${cl.length > 1 ? `<span class="text-[10px] text-muted-foreground font-bold">+${cl.length - 1} more</span>` : ''}
                      </div>
                    ` : `
                      <span class="text-[11px] text-muted-foreground italic">No claims allocated. Open chapter to start drafting.</span>
                    `}
                  </div>
                </div>

                <div class="flex items-center justify-between pt-2 border-t border-border/60 text-xs">
                  <span class="text-[11px] text-muted-foreground flex items-center gap-1">
                    ${words > 0 ? `${APD_ICONS.checkCircle} Draft in progress` : `${APD_ICONS.pen} Empty draft`}
                  </span>
                  <span class="text-xs font-semibold text-primary flex items-center gap-1 group-hover:underline">
                    Open Chapter Writing Studio ${APD_ICONS.chevronRight}
                  </span>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `;
    },

    /**
     * View 2: ONLY THIS CHAPTER
     * Dedicated, distraction-free, fast, smooth writing experience for ONLY the selected chapter.
     */
    renderSingleChapterView: function (chapters, projectId, projectTitle) {
      var self = this;
      var ch = this.activeChapter;
      var draft = DraftStore.getDraft(projectId, ch);
      var status = DraftStore.getStatus(projectId, ch);
      var words = draft.trim() ? draft.trim().split(/\s+/).filter(Boolean).length : 0;
      var chars = draft.length;
      var readMin = Math.max(1, Math.ceil(words / 220));

      var chapterClaims = (this.claims || []).filter(function (c) {
        return (c.chapter || '').toLowerCase() === ch.toLowerCase();
      });
      var evByClaim = this.getEvidenceByClaim();
      var check = this.checks[ch];
      var isChecking = this.checkingChapter === ch;

      return `
        <!-- Single Chapter Studio Top Bar -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-border">
          <div class="flex items-center gap-3">
            <button id="apd-te-back-to-workspace" class="px-2.5 py-1.5 rounded-lg border border-border bg-card hover:bg-muted text-xs font-semibold flex items-center gap-1.5 text-foreground transition-all shadow-sm">
              ${APD_ICONS.arrowLeft} All Chapters
            </button>
            <div class="h-4 w-px bg-border"></div>
            <div>
              <div class="flex items-center gap-2">
                <span class="text-xs font-bold text-primary uppercase tracking-wider">Chapter:</span>
                <h1 class="text-lg font-bold font-display text-foreground">${ch}</h1>
              </div>
            </div>
          </div>

          <!-- Studio Actions -->
          <div class="flex items-center gap-2 text-xs">
            <select id="apd-te-single-status" class="px-2.5 py-1 rounded-md bg-card border border-border text-xs font-medium text-foreground outline-none cursor-pointer">
              <option value="drafting" ${status === 'drafting' ? 'selected' : ''}>Status: Drafting</option>
              <option value="review" ${status === 'review' ? 'selected' : ''}>Status: In Review</option>
              <option value="ready" ${status === 'ready' ? 'selected' : ''}>Status: Defense Ready</option>
            </select>

            <button id="apd-te-check-evidence-btn" ${isChecking ? 'disabled' : ''} class="px-2.5 py-1 rounded-md border border-border bg-card hover:bg-muted text-xs font-medium flex items-center gap-1.5">
              ${isChecking ? `<span class="apd-te-pulse text-primary">${APD_ICONS.refresh}</span> Checking…` : `<span class="text-primary">${APD_ICONS.sparkles}</span> Check Evidence`}
            </button>

            <button id="apd-te-copy-btn" class="p-1.5 rounded-md hover:bg-muted border border-border bg-card text-muted-foreground hover:text-foreground" title="Copy draft">
              ${APD_ICONS.copy}
            </button>

            <button id="apd-te-export-btn" class="p-1.5 rounded-md hover:bg-muted border border-border bg-card text-muted-foreground hover:text-foreground" title="Export Markdown">
              ${APD_ICONS.download}
            </button>
          </div>
        </div>

        <!-- Quick 1-Click Chapter Switcher Ribbon: jump between chapters instantly without friction -->
        <div class="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          <span class="text-[10px] font-bold uppercase tracking-wider text-muted-foreground shrink-0 mr-1">Switch:</span>
          ${chapters.map(function (c, idx) {
            var isSelected = c === ch;
            var cClaims = (self.claims || []).filter(function(clm) { return (clm.chapter || '').toLowerCase() === c.toLowerCase(); });
            return `
              <button data-switch-to="${encodeURIComponent(c)}" class="px-2.5 py-1 rounded-lg text-xs whitespace-nowrap transition-all flex items-center gap-1.5 border shrink-0 ${isSelected ? 'bg-primary text-white border-primary shadow-sm font-bold' : 'bg-card text-muted-foreground border-border hover:bg-muted hover:text-foreground'}">
                <span class="text-[10px] opacity-75">${idx + 1}.</span>
                <span>${c}</span>
                ${cClaims.length > 0 ? `<span class="text-[9px] px-1 py-0.2 rounded-full ${isSelected ? 'bg-white/20 text-white' : 'bg-muted text-muted-foreground'}">${cClaims.length}</span>` : ''}
              </button>
            `;
          }).join('')}
        </div>

        <!-- Focused Dual Studio Canvas (7 cols Editor, 5 cols Grounded AI & Research Shelf) -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          
          <!-- LEFT: Smooth Writing Editor (7 cols) -->
          <div class="lg:col-span-7 rounded-xl border border-border bg-card shadow-sm overflow-hidden flex flex-col">
            
            <!-- Formatting Toolbar -->
            <div class="p-2 border-b border-border bg-muted/20 flex flex-wrap items-center gap-1 text-xs">
              <button data-fmt="bold" class="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground" title="Bold">${APD_ICONS.bold}</button>
              <button data-fmt="italic" class="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground" title="Italic">${APD_ICONS.italic}</button>
              <div class="h-4 w-px bg-border mx-1"></div>
              <button data-fmt="h2" class="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground" title="Heading 2">${APD_ICONS.heading2}</button>
              <button data-fmt="h3" class="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground" title="Heading 3">${APD_ICONS.heading3}</button>
              <div class="h-4 w-px bg-border mx-1"></div>
              <button data-fmt="quote" class="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground" title="Blockquote">${APD_ICONS.quote}</button>
              <button data-fmt="list" class="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground" title="Bullet List">${APD_ICONS.list}</button>
              <div class="h-4 w-px bg-border mx-1"></div>

              <!-- Quick Citation Inserter -->
              ${this.sources.length > 0 ? `
                <select id="apd-te-quick-cite" class="bg-card border border-border text-[11px] rounded px-2 py-1 text-muted-foreground hover:text-foreground outline-none cursor-pointer max-w-[170px] truncate ml-auto">
                  <option value="">+ Insert Citation…</option>
                  ${this.sources.map(function(s) {
                    return `<option value=" (${s.author || 'Author'}, ${s.year || 'n.d.'}: p. ${s.pages || 'XX'})">${s.author || 'Author'} (${s.year || 'n.d.'})</option>`;
                  }).join('')}
                </select>
              ` : ''}
            </div>

            <!-- Writing Canvas: autofocus, fast, zero lag -->
            <textarea id="apd-te-active-canvas" class="apd-te-canvas" placeholder="Begin drafting Chapter: ${ch}… Express your archaeological interpretation, reference loci, stratigraphy, and chronometric calibrations…">${draft}</textarea>

            <!-- Bottom Live Stats & Autosave Feedback -->
            <div class="p-3 border-t border-border bg-muted/20 flex flex-wrap items-center justify-between text-xs text-muted-foreground gap-2">
              <div class="flex items-center gap-4">
                <span id="apd-te-word-stat" class="font-bold text-foreground">${words} words</span>
                <span id="apd-te-char-stat">${chars} characters</span>
                <span>~${readMin} min read</span>
              </div>
              <div class="flex items-center gap-1.5 text-[11px] text-accent font-semibold">
                ${APD_ICONS.checkCircle} Real-time autosave
              </div>
            </div>

          </div>

          <!-- RIGHT: Grounded Neural AI Assistant & Chapter Evidence Shelf (5 cols) -->
          <div class="lg:col-span-5 rounded-xl border border-primary/25 bg-card p-4 shadow-sm space-y-4">
            
            <!-- Side Tab Switcher -->
            <div class="flex items-center justify-between pb-3 border-b border-border">
              <div class="flex items-center gap-1 p-0.5 bg-muted/60 rounded-lg border border-border">
                <button id="apd-te-right-tab-ai" class="px-2.5 py-1 rounded text-xs font-semibold transition-all ${this.activeRightTab === 'ai' ? 'bg-card text-foreground shadow-sm font-bold' : 'text-muted-foreground'}">
                  ${APD_ICONS.sparkles} Neural AI
                </button>
                <button id="apd-te-right-tab-claims" class="px-2.5 py-1 rounded text-xs font-semibold transition-all ${this.activeRightTab === 'claims' ? 'bg-card text-foreground shadow-sm font-bold' : 'text-muted-foreground'}">
                  ${APD_ICONS.bookmark} Claims (${chapterClaims.length})
                </button>
                <button id="apd-te-right-tab-sources" class="px-2.5 py-1 rounded text-xs font-semibold transition-all ${this.activeRightTab === 'sources' ? 'bg-card text-foreground shadow-sm font-bold' : 'text-muted-foreground'}">
                  ${APD_ICONS.book} Library (${this.sources.length})
                </button>
              </div>

              <span class="text-[9px] font-bold px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20">
                Offline AI
              </span>
            </div>

            <!-- TAB 1: Grounded Neural AI Research Co-Writer -->
            ${this.activeRightTab === 'ai' ? `
              <div class="space-y-3.5">
                <!-- Grounding Stats -->
                <div class="p-2.5 rounded-lg bg-muted/40 border border-border text-[11px] flex items-center justify-between">
                  <span class="text-muted-foreground text-[10px] uppercase font-bold">Library Grounding:</span>
                  <div class="flex items-center gap-2 font-bold text-primary text-[10.5px]">
                    <span>${this.sources.length} Monographs</span>
                    <span>•</span>
                    <span>${chapterClaims.length} Claims</span>
                    <span>•</span>
                    <span>${this.contradictions.length} Disputes</span>
                  </div>
                </div>

                <!-- Quick AI Actions -->
                <div class="space-y-1.5">
                  <span class="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Select AI Writing Action:</span>
                  <div class="grid grid-cols-2 gap-1.5">
                    <button data-ai-action="synthesize" class="apd-te-ai-action-btn p-2 rounded-lg border border-border bg-card/60 hover:bg-muted text-left text-xs font-medium transition-colors flex items-center gap-1.5">
                      <span class="text-primary">${APD_ICONS.sparkles}</span>
                      <span>Synthesize Claims</span>
                    </button>

                    <button data-ai-action="citations" class="apd-te-ai-action-btn p-2 rounded-lg border border-border bg-card/60 hover:bg-muted text-left text-xs font-medium transition-colors flex items-center gap-1.5">
                      <span class="text-accent">${APD_ICONS.book}</span>
                      <span>Suggest Citations</span>
                    </button>

                    <button data-ai-action="viva_check" class="apd-te-ai-action-btn p-2 rounded-lg border border-border bg-card/60 hover:bg-muted text-left text-xs font-medium transition-colors flex items-center gap-1.5">
                      <span class="text-chart-4">${APD_ICONS.shieldCheck}</span>
                      <span>Viva Defense Check</span>
                    </button>

                    <button data-ai-action="expand" class="apd-te-ai-action-btn p-2 rounded-lg border border-border bg-card/60 hover:bg-muted text-left text-xs font-medium transition-colors flex items-center gap-1.5">
                      <span class="text-primary">${APD_ICONS.pen}</span>
                      <span>Continue Paragraph</span>
                    </button>
                  </div>
                </div>

                <!-- Custom Inquiry Box -->
                <div class="space-y-1.5 pt-1">
                  <span class="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Custom Scholarly Inquiry:</span>
                  <div class="flex gap-2">
                    <input id="apd-te-custom-query" type="text" placeholder="e.g. Synthesize the stratigraphy of Trench B with Kenyon 1978…" class="text-xs h-8 px-2.5 rounded-md border border-border bg-transparent flex-1 outline-none focus:border-primary" />
                    <button id="apd-te-query-btn" class="h-8 px-3 rounded-md bg-primary text-white text-xs font-bold hover:bg-primary/90 flex items-center gap-1">
                      Generate
                    </button>
                  </div>
                </div>

                <!-- AI Loading State -->
                <div id="apd-te-ai-loading" class="hidden p-5 rounded-xl border border-primary/20 bg-primary/5 flex flex-col items-center justify-center text-center space-y-2">
                  <span class="text-primary apd-te-pulse">${APD_ICONS.refresh}</span>
                  <p class="text-xs font-bold text-foreground">Evaluating library monographs & claims…</p>
                  <p class="text-[10px] text-muted-foreground">Synthesizing peer-reviewed archaeological prose with Qwen 2.5 7B</p>
                </div>

                <!-- AI Suggestion Output -->
                <div id="apd-te-ai-output" class="hidden p-3.5 rounded-xl border border-primary/30 bg-primary/5 space-y-2.5">
                  <div class="flex items-center justify-between text-xs pb-1.5 border-b border-primary/15">
                    <span class="font-bold text-primary text-[11px] flex items-center gap-1">
                      ${APD_ICONS.sparkles} Grounded Academic Suggestion
                    </span>
                    <button id="apd-te-close-ai-output" class="text-muted-foreground hover:text-foreground">${APD_ICONS.x}</button>
                  </div>

                  <div id="apd-te-suggestion-body" class="text-xs font-serif leading-relaxed text-foreground/90 max-h-[220px] overflow-y-auto whitespace-pre-wrap p-2 rounded bg-card/80 border border-border"></div>

                  <div class="flex items-center justify-between pt-1">
                    <button id="apd-te-insert-ai-output" class="h-7 px-2.5 rounded-md bg-primary text-white text-xs font-semibold hover:bg-primary/90 flex items-center gap-1">
                      ${APD_ICONS.pen} Insert in Editor
                    </button>

                    <div class="flex gap-1.5">
                      <button id="apd-te-append-ai-output" class="h-7 px-2.5 rounded-md border border-border bg-card text-xs font-medium hover:bg-muted">
                        Append
                      </button>
                      <button id="apd-te-copy-ai-output" class="h-7 px-2 rounded-md border border-border bg-card hover:bg-muted text-muted-foreground" title="Copy suggestion">
                        ${APD_ICONS.copy}
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Evidence Check Summary if performed -->
                ${check && check.summary ? `
                  <div class="mt-2 p-3 rounded-lg bg-muted/50 border border-border text-xs text-foreground/90 space-y-1">
                    <div class="font-bold text-[10px] uppercase tracking-wider text-primary flex items-center gap-1">
                      ${APD_ICONS.sparkles} Evidence Check Summary
                    </div>
                    <div class="leading-relaxed font-sans">${check.summary}</div>
                  </div>
                ` : ''}

              </div>
            ` : ''}

            <!-- TAB 2: Chapter Claims & Evidence Shelf -->
            ${this.activeRightTab === 'claims' ? `
              <div class="space-y-3">
                <div class="flex items-center justify-between text-xs pb-1 border-b border-border">
                  <span class="font-bold text-foreground">Claims Allocated to this Chapter</span>
                  <span class="text-muted-foreground text-[11px]">${chapterClaims.length} total</span>
                </div>

                ${chapterClaims.length === 0 ? `
                  <div class="p-4 rounded-lg bg-muted/30 border border-border text-center text-xs text-muted-foreground">
                    No claims assigned to “${ch}” yet. You can assign claims to chapters in Claims Manager.
                  </div>
                ` : `
                  <div class="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                    ${chapterClaims.map(function(c) {
                      var ev = evByClaim[c.id] || [];
                      var sup = ev.filter(function(e) { return e.evidence_type === 'supporting'; }).length;
                      var con = ev.filter(function(e) { return e.evidence_type === 'contradicting'; }).length;
                      var hasSrc = ev.some(function(e) { return (e.source_ids || []).length > 0; }) || !!c.scholar_name;

                      return `
                        <div class="p-2.5 rounded-lg border border-border bg-card/70 space-y-1.5 text-xs">
                          <div class="flex items-start justify-between gap-2">
                            <span class="font-medium text-foreground leading-snug flex-1">${c.claim_text}</span>
                            <button data-insert-claim-text="${encodeURIComponent(c.claim_text)}" class="apd-te-insert-claim-btn px-2 py-0.5 rounded bg-primary/10 text-primary hover:bg-primary hover:text-white font-semibold text-[10px] shrink-0 transition-colors">
                              + Insert
                            </button>
                          </div>
                          <div class="flex items-center gap-1.5 text-[9.5px] font-bold">
                            ${!hasSrc ? `<span class="px-1.5 py-0.2 rounded bg-destructive/15 text-destructive">No citation</span>` : ''}
                            ${sup === 0 ? `<span class="px-1.5 py-0.2 rounded bg-chart-4/15 text-chart-4">Weak</span>` : ''}
                            <span class="px-1.5 py-0.2 rounded bg-accent/15 text-accent">+${sup}</span>
                            ${con > 0 ? `<span class="px-1.5 py-0.2 rounded bg-destructive/15 text-destructive">−${con}</span>` : ''}
                            ${c.scholar_name ? `<span class="text-muted-foreground font-normal ml-auto">${c.scholar_name}</span>` : ''}
                          </div>
                        </div>
                      `;
                    }).join('')}
                  </div>
                `}
              </div>
            ` : ''}

            <!-- TAB 3: Project Library Monographs -->
            ${this.activeRightTab === 'sources' ? `
              <div class="space-y-3">
                <div class="flex items-center justify-between text-xs pb-1 border-b border-border">
                  <span class="font-bold text-foreground">Project Ingested Monographs</span>
                  <span class="text-muted-foreground text-[11px]">${this.sources.length} sources</span>
                </div>

                ${this.sources.length === 0 ? `
                  <div class="p-4 rounded-lg bg-muted/30 border border-border text-center text-xs text-muted-foreground">
                    No library monographs recorded yet.
                  </div>
                ` : `
                  <div class="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                    ${this.sources.map(function(s) {
                      return `
                        <div class="p-2.5 rounded-lg border border-border bg-card/70 flex items-center justify-between gap-2 text-xs">
                          <div class="truncate flex-1">
                            <span class="font-bold text-foreground">${s.author || 'Author'}</span> (${s.year || 'n.d.'}):
                            <span class="text-muted-foreground"> ${s.title}</span>
                          </div>
                          <button data-cite-src="${encodeURIComponent(s.author || 'Author')}" data-cite-yr="${encodeURIComponent(s.year || 'n.d.')}" data-cite-pg="${encodeURIComponent(s.pages || 'XX')}" class="apd-te-cite-src-btn px-2 py-0.5 rounded bg-accent/15 text-accent hover:bg-accent hover:text-white font-semibold text-[10px] shrink-0 transition-colors">
                            + Cite
                          </button>
                        </div>
                      `;
                    }).join('')}
                  </div>
                `}
              </div>
            ` : ''}

          </div>

        </div>
      `;
    },

    renderAuditHeader: function (projectTitle) {
      return `
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border">
          <div>
            <div class="flex items-center gap-2.5">
              <span class="p-2.5 rounded-xl bg-primary/10 border border-primary/20 text-primary">${APD_ICONS.shieldCheck}</span>
              <div>
                <h1 class="text-2xl font-bold font-display text-foreground tracking-tight">Pre-Submission Defense Audit</h1>
                <p class="text-xs text-muted-foreground">${projectTitle}</p>
              </div>
            </div>
          </div>

          <div class="flex items-center gap-1.5 p-1 bg-muted/60 rounded-xl border border-border shrink-0 self-start md:self-center">
            <button id="apd-te-tab-workspace" class="apd-te-tab-btn flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-muted-foreground hover:text-foreground">
              ${APD_ICONS.layers} All Chapters
            </button>
            <button id="apd-te-tab-audit" class="apd-te-tab-btn flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-card text-foreground shadow-sm border border-border font-bold">
              ${APD_ICONS.shieldCheck} Defense Audit
            </button>
          </div>
        </div>
      `;
    },

    renderAuditView: function (chapters, projectId) {
      var self = this;
      var score = (this.auditData && this.auditData.defense_readiness_score) || 85;

      return `
        <div class="space-y-6 pt-2">
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
                    Verifies chapter assertions against physical excavation layers, IntCal20 radiocarbon bounds, and library contradictions.
                  </p>
                </div>
              </div>

              <button id="apd-te-run-audit-btn" class="px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 flex items-center gap-2 shadow-sm shrink-0 self-start md:self-center">
                ${APD_ICONS.refresh} Re-Run Defense Audit
              </button>
            </div>

            <!-- Audit Metrics Grid -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 pt-5">
              <div class="p-3.5 rounded-xl bg-muted/40 border border-border">
                <div class="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Total Chapters</div>
                <div class="text-2xl font-bold">${chapters.length}</div>
              </div>
              <div class="p-3.5 rounded-xl bg-muted/40 border border-border">
                <div class="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Assigned Claims</div>
                <div class="text-2xl font-bold">${this.claims.length}</div>
              </div>
              <div class="p-3.5 rounded-xl bg-chart-4/10 border border-chart-4/20 text-chart-4">
                <div class="text-[10px] font-bold uppercase tracking-wider mb-1">Active Conflicts</div>
                <div class="text-2xl font-bold">${(this.auditData && this.auditData.total_conflicts_detected) || this.contradictions.length}</div>
              </div>
              <div class="p-3.5 rounded-xl bg-accent/10 border border-accent/20 text-accent">
                <div class="text-[10px] font-bold uppercase tracking-wider mb-1">Library Monographs</div>
                <div class="text-2xl font-bold">${this.sources.length}</div>
              </div>
            </div>
          </div>

          <!-- Per-Chapter Verification Table -->
          <div class="space-y-4">
            <h4 class="font-bold text-sm flex items-center gap-2">
              ${APD_ICONS.layers} Chapter Claims Verification
            </h4>
            ${chapters.map(function(ch) {
              var chClaims = (self.claims || []).filter(function(c) { return (c.chapter || '').toLowerCase() === ch.toLowerCase(); });
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

                    <button data-open-chapter="${encodeURIComponent(ch)}" class="px-3 py-1.5 rounded-lg border border-border bg-card text-xs font-semibold hover:bg-muted flex items-center gap-1">
                      Open Writing Studio ${APD_ICONS.chevronRight}
                    </button>
                  </div>

                  <div class="p-4">
                    ${chClaims.length === 0 ? `
                      <p class="text-xs text-muted-foreground italic">No claims assigned to this chapter yet.</p>
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

    bindEvents: function (container, projectId) {
      var self = this;

      // Top Tab Switchers
      var tabWs = container.querySelector('#apd-te-tab-workspace');
      if (tabWs) tabWs.onclick = function () { self.viewMode = 'workspace'; self.render(); };

      var tabAu = container.querySelector('#apd-te-tab-audit');
      if (tabAu) tabAu.onclick = function () { self.viewMode = 'audit'; self.render(); };

      var backBtn = container.querySelector('#apd-te-back-to-workspace');
      if (backBtn) backBtn.onclick = function () { self.viewMode = 'workspace'; self.render(); };

      // Open Chapter on Card Click (Opens ONLY that chapter)
      var openChapterCards = container.querySelectorAll('[data-open-chapter]');
      openChapterCards.forEach(function (card) {
        card.onclick = function () {
          var ch = decodeURIComponent(card.getAttribute('data-open-chapter'));
          self.activeChapter = ch;
          self.viewMode = 'chapter';
          self.render();
        };
      });

      // Quick chapter switcher in Single Chapter Studio
      var switchBtns = container.querySelectorAll('[data-switch-to]');
      switchBtns.forEach(function (btn) {
        btn.onclick = function () {
          var ch = decodeURIComponent(btn.getAttribute('data-switch-to'));
          self.activeChapter = ch;
          self.viewMode = 'chapter';
          self.render();
        };
      });

      // Right Side Panel Tab Switcher
      var rightAi = container.querySelector('#apd-te-right-tab-ai');
      if (rightAi) rightAi.onclick = function () { self.activeRightTab = 'ai'; self.render(); };

      var rightClaims = container.querySelector('#apd-te-right-tab-claims');
      if (rightClaims) rightClaims.onclick = function () { self.activeRightTab = 'claims'; self.render(); };

      var rightSources = container.querySelector('#apd-te-right-tab-sources');
      if (rightSources) rightSources.onclick = function () { self.activeRightTab = 'sources'; self.render(); };

      // Add Custom Chapter
      var addChBtn = container.querySelector('#apd-te-add-chapter-btn');
      var newChInp = container.querySelector('#apd-te-new-chapter-input');
      function doAddChapter() {
        if (!newChInp) return;
        var val = newChInp.value.trim();
        if (!val) return;
        var cur = DraftStore.getChapters(projectId);
        if (cur.includes(val)) return;
        cur.push(val);
        DraftStore.saveChapters(projectId, cur);
        self.activeChapter = val;
        self.viewMode = 'chapter';
        self.render();
      }
      if (addChBtn) addChBtn.onclick = doAddChapter;
      if (newChInp) newChInp.onkeydown = function(e) { if (e.key === 'Enter') doAddChapter(); };

      // Active Writing Canvas Textarea (Fast debounced autosave)
      var canvas = container.querySelector('#apd-te-active-canvas');
      if (canvas) {
        // Automatically focus for instant writing flow
        if (document.activeElement !== canvas) {
          setTimeout(function() { canvas.focus(); }, 50);
        }

        var saveTimeout = null;
        canvas.oninput = function () {
          var val = canvas.value;
          var words = val.trim() ? val.trim().split(/\s+/).filter(Boolean).length : 0;
          var chars = val.length;
          var wStat = container.querySelector('#apd-te-word-stat');
          var cStat = container.querySelector('#apd-te-char-stat');
          if (wStat) wStat.innerText = words + ' words';
          if (cStat) cStat.innerText = chars + ' characters';

          clearTimeout(saveTimeout);
          saveTimeout = setTimeout(function () {
            DraftStore.saveDraft(projectId, self.activeChapter, val);
          }, 300);
        };
      }

      // Status dropdown
      var statusSel = container.querySelector('#apd-te-single-status');
      if (statusSel) {
        statusSel.onchange = function () {
          DraftStore.saveStatus(projectId, self.activeChapter, statusSel.value);
        };
      }

      // Check Evidence Button
      var checkEvBtn = container.querySelector('#apd-te-check-evidence-btn');
      if (checkEvBtn) {
        checkEvBtn.onclick = function () {
          self.runEvidenceCheck(self.activeChapter, projectId);
        };
      }

      // Copy Button
      var copyBtn = container.querySelector('#apd-te-copy-btn');
      if (copyBtn && canvas) {
        copyBtn.onclick = function () {
          navigator.clipboard.writeText(canvas.value);
          alert('Chapter draft copied to clipboard!');
        };
      }

      // Export Button
      var exportBtn = container.querySelector('#apd-te-export-btn');
      if (exportBtn && canvas) {
        exportBtn.onclick = function () {
          var text = canvas.value;
          var filename = self.activeChapter.replace(/[^a-zA-Z0-9_-]/g, '_') + '_Draft.md';
          var blob = new Blob([
            '# ' + self.activeChapter + '\n\n' +
            '**Project:** ' + getActiveProjectTitle() + '\n' +
            '**Exported:** ' + new Date().toLocaleString() + '\n\n' +
            '---\n\n' + text
          ], { type: 'text/markdown;charset=utf-8' });
          var url = URL.createObjectURL(blob);
          var a = document.createElement('a');
          a.href = url;
          a.download = filename;
          a.click();
          URL.revokeObjectURL(url);
        };
      }

      // Formatting Toolbar
      var fmtBtns = container.querySelectorAll('button[data-fmt]');
      fmtBtns.forEach(function (b) {
        b.onclick = function () {
          if (!canvas) return;
          var fmt = b.getAttribute('data-fmt');
          if (fmt === 'bold') self.wrapSelection(canvas, self.activeChapter, '**', '**');
          else if (fmt === 'italic') self.wrapSelection(canvas, self.activeChapter, '*', '*');
          else if (fmt === 'h2') self.wrapSelection(canvas, self.activeChapter, '## ', '');
          else if (fmt === 'h3') self.wrapSelection(canvas, self.activeChapter, '### ', '');
          else if (fmt === 'quote') self.wrapSelection(canvas, self.activeChapter, '> ', '');
          else if (fmt === 'list') self.wrapSelection(canvas, self.activeChapter, '- ', '');
        };
      });

      // Quick Citation Inserter
      var quickCite = container.querySelector('#apd-te-quick-cite');
      if (quickCite && canvas) {
        quickCite.onchange = function () {
          if (quickCite.value) {
            self.insertAtCursor(canvas, self.activeChapter, quickCite.value);
            quickCite.value = '';
          }
        };
      }

      // Insert Claim Text from Claims Tab
      var insertClaimBtns = container.querySelectorAll('button[data-insert-claim-text]');
      insertClaimBtns.forEach(function (btn) {
        btn.onclick = function () {
          var clm = decodeURIComponent(btn.getAttribute('data-insert-claim-text'));
          if (canvas) self.insertAtCursor(canvas, self.activeChapter, '\n\n"' + clm + '"\n');
        };
      });

      // Insert Citation from Sources Tab
      var citeSrcBtns = container.querySelectorAll('button[data-cite-src]');
      citeSrcBtns.forEach(function (btn) {
        btn.onclick = function () {
          var a = decodeURIComponent(btn.getAttribute('data-cite-src'));
          var y = decodeURIComponent(btn.getAttribute('data-cite-yr'));
          var p = decodeURIComponent(btn.getAttribute('data-cite-pg'));
          if (canvas) self.insertAtCursor(canvas, self.activeChapter, ' (' + a + ', ' + y + ': p. ' + p + ')');
        };
      });

      // AI Action Buttons
      var aiActionBtns = container.querySelectorAll('.apd-te-ai-action-btn');
      aiActionBtns.forEach(function (btn) {
        btn.onclick = function () {
          var action = btn.getAttribute('data-ai-action');
          self.runAiQuery(self.activeChapter, action, '');
        };
      });

      // Custom Query Button
      var queryBtn = container.querySelector('#apd-te-query-btn');
      var customInp = container.querySelector('#apd-te-custom-query');
      if (queryBtn && customInp) {
        queryBtn.onclick = function () {
          var val = customInp.value.trim();
          if (val) self.runAiQuery(self.activeChapter, 'custom', val);
        };
      }

      // AI Output Close
      var closeAiBtn = container.querySelector('#apd-te-close-ai-output');
      if (closeAiBtn) {
        closeAiBtn.onclick = function () {
          var outBox = container.querySelector('#apd-te-ai-output');
          if (outBox) outBox.classList.add('hidden');
        };
      }

      // AI Output Insert in Editor
      var insertAiBtn = container.querySelector('#apd-te-insert-ai-output');
      if (insertAiBtn && canvas) {
        insertAiBtn.onclick = function () {
          var body = container.querySelector('#apd-te-suggestion-body');
          if (body) self.insertAtCursor(canvas, self.activeChapter, '\n\n' + body.innerText + '\n\n');
        };
      }

      // AI Output Append
      var appendAiBtn = container.querySelector('#apd-te-append-ai-output');
      if (appendAiBtn && canvas) {
        appendAiBtn.onclick = function () {
          var body = container.querySelector('#apd-te-suggestion-body');
          if (body) {
            canvas.value = canvas.value + '\n\n' + body.innerText;
            DraftStore.saveDraft(projectId, self.activeChapter, canvas.value);
            alert('Appended suggestion to chapter draft!');
          }
        };
      }

      // AI Output Copy
      var copyAiBtn = container.querySelector('#apd-te-copy-ai-output');
      if (copyAiBtn) {
        copyAiBtn.onclick = function () {
          var body = container.querySelector('#apd-te-suggestion-body');
          if (body) {
            navigator.clipboard.writeText(body.innerText);
            alert('Copied suggestion to clipboard!');
          }
        };
      }

      // Audit Re-Run Button
      var auditBtn = container.querySelector('#apd-te-run-audit-btn');
      if (auditBtn) {
        auditBtn.onclick = async function () {
          var bridge = window.nativeBridge;
          if (bridge && typeof bridge.call === 'function') {
            auditBtn.innerText = 'Auditing…';
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
    },

    wrapSelection: function (ta, chapter, prefix, suffix) {
      var start = ta.selectionStart || 0;
      var end = ta.selectionEnd || 0;
      var sel = ta.value.substring(start, end);
      var replacement = prefix + (sel || 'text') + suffix;
      ta.value = ta.value.substring(0, start) + replacement + ta.value.substring(end);
      DraftStore.saveDraft(getActiveProjectId(), chapter, ta.value);
      ta.focus();
      ta.setSelectionRange(start + prefix.length, start + prefix.length + (sel.length || 4));
    },

    insertAtCursor: function (ta, chapter, text) {
      var start = ta.selectionStart || 0;
      var end = ta.selectionEnd || 0;
      ta.value = ta.value.substring(0, start) + text + ta.value.substring(end);
      DraftStore.saveDraft(getActiveProjectId(), chapter, ta.value);
      ta.focus();
      ta.setSelectionRange(start + text.length, start + text.length);
    },

    runEvidenceCheck: async function (chapter, projectId) {
      var cl = (this.claims || []).filter(function (c) {
        return (c.chapter || '').toLowerCase() === chapter.toLowerCase();
      });
      if (cl.length === 0) {
        alert('No claims assigned to this chapter. Add claims and set their chapter to "' + chapter + '" first.');
        return;
      }

      var evByClaim = this.getEvidenceByClaim();
      var claimData = cl.map(function (c) {
        var ev = evByClaim[c.id] || [];
        return {
          claim: c.claim_text,
          supporting: ev.filter(function(e) { return e.evidence_type === 'supporting'; }).length,
          contradicting: ev.filter(function(e) { return e.evidence_type === 'contradicting'; }).length,
          hasSources: ev.some(function(e) { return (e.source_ids || []).length > 0; }) || !!c.scholar_name,
          status: c.status || 'active'
        };
      });

      this.checkingChapter = chapter;
      this.render();

      var promptText = 
        "You are reviewing a PhD thesis chapter for evidence quality.\n" +
        "Do NOT write or rewrite any thesis text. For each claim, flag issues only.\n" +
        "Categories: \"no_citation\" (no sources linked), \"weak_evidence\" (zero or only weak supporting evidence), \"contradictory_evidence\" (contradicting evidence exists), \"missing_source_connection\" (claim lacks linked sources/sites/artifacts).\n" +
        "Return a valid JSON object strictly formatted as:\n" +
        "{ \"results\": [ { \"claim\": string, \"issues\": string[], \"note\": string } ], \"summary\": string }\n\n" +
        "CLAIMS:\n" + JSON.stringify(claimData, null, 2);

      var bridge = window.nativeBridge;
      var parsedRes = null;

      try {
        if (bridge && typeof bridge.call === 'function') {
          var llmRes = await bridge.call('invoke_llm', { prompt: promptText }, projectId);
          var raw = "";
          if (llmRes && llmRes.answer) raw = llmRes.answer;
          else if (typeof llmRes === 'string') raw = llmRes;
          else raw = JSON.stringify(llmRes);

          var jsonMatch = raw.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            parsedRes = JSON.parse(jsonMatch[0]);
          } else {
            parsedRes = {
              results: cl.map(function(c) {
                var ev = evByClaim[c.id] || [];
                var issues = [];
                if (!ev.some(function(e) { return (e.source_ids || []).length > 0; }) && !c.scholar_name) issues.push('no_citation');
                if (ev.filter(function(e) { return e.evidence_type === 'supporting'; }).length === 0) issues.push('weak_evidence');
                if (ev.filter(function(e) { return e.evidence_type === 'contradicting'; }).length > 0) issues.push('contradictory_evidence');
                return { claim: c.claim_text, issues: issues, note: raw.slice(0, 150) };
              }),
              summary: raw
            };
          }
        }
      } catch (err) {
        alert('Check failed: ' + err.message);
      }

      if (parsedRes) {
        this.checks[chapter] = parsedRes;
        DraftStore.saveCheck(projectId, chapter, parsedRes);
      }

      this.checkingChapter = null;
      this.render();
    },

    runAiQuery: async function (chapter, mode, customQuery) {
      var projectId = getActiveProjectId();
      var bridge = window.nativeBridge;
      var loadingEl = document.getElementById('apd-te-ai-loading');
      var outputEl = document.getElementById('apd-te-ai-output');
      var bodyEl = document.getElementById('apd-te-suggestion-body');

      if (loadingEl) loadingEl.classList.remove('hidden');
      if (outputEl) outputEl.classList.add('hidden');

      var self = this;
      var chapterClaims = (this.claims || []).filter(function (c) {
        return (c.chapter || '').toLowerCase() === chapter.toLowerCase();
      });

      var librarySources = (this.sources || []).slice(0, 15).map(function (s) {
        return '"' + s.title + '" by ' + (s.author || 'Author') + ' (' + (s.year || 'n.d.') + '), pp. ' + (s.pages || 'N/A');
      });
      var verifiedClaims = chapterClaims.map(function (c) {
        return '- ' + c.claim_text + ' [Scholar: ' + (c.scholar_name || 'Recorded') + ', Status: ' + (c.status || 'Active') + ']';
      });
      var activeConflicts = (this.contradictions || []).slice(0, 5).map(function (c) {
        return '- ' + (c.title || c.type) + ': ' + c.claim_a + ' vs ' + c.claim_b + ' (' + (c.anomaly_description || 'Disputed layer sequence') + ')';
      });

      var currentDraft = DraftStore.getDraft(projectId, chapter);

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
        "You are assisting an archaeological scientist and PhD researcher with drafting Chapter: \"" + chapter + "\".\n\n" +
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
      if (bodyEl) bodyEl.innerText = resultText;
      if (outputEl) outputEl.classList.remove('hidden');
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { ThesisStudio.init(); });
  } else {
    ThesisStudio.init();
  }

  window.archaeophdThesis = ThesisStudio;

})();
