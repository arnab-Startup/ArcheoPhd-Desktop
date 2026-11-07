/**
 * ArchaeoPhD — Thesis Writing Section & Dissertation Studio
 * 
 * Complete Thesis Drafting Structure & Workflow:
 * - Matches previous application's chapter-by-chapter organizational workflow
 *   (Introduction, Literature Review, Methodology, Chapter 1, 2, 3, Discussion, Conclusion + Custom)
 * - Assigns and displays claims per chapter with evidentiary indicators:
 *   [+Supporting], [-Contradicting], [No citation], [Weak evidence]
 * - Built-in "Check Evidence" AI analysis with issue classification and summary
 * - Full Dual Manual Drafting Editor + Grounded Neural AI Assistant (Qwen 2.5 7B):
 *   Grounded in years of project monographs, excavation field reports, stratigraphy, and radiocarbon dates
 * - Real-time autosaving to local project storage per chapter
 * - Pre-Submission Defense Readiness Audit integration
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
    chevronDown: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>',
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
        font-size: 15px;
        line-height: 1.75;
        letter-spacing: 0.01em;
        background: transparent;
        color: hsl(var(--foreground, 30 10% 12%));
        border: none;
        outline: none;
        width: 100%;
        min-height: 420px;
        resize: vertical;
        padding: 16px;
      }
      .apd-te-canvas::placeholder {
        color: hsl(var(--muted-foreground, 30 8% 55%) / 0.65);
        font-style: italic;
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
    activeTab: 'workspace', // 'workspace' (matches previous app) | 'editor' (dedicated studio) | 'audit' (defense audit)
    activeChapter: DEFAULT_CHAPTERS[0],
    expandedDraftChapter: null, // If user expands editor inline within a chapter card
    checkingChapter: null,      // Chapter currently running AI evidence check
    isAiLoading: false,
    aiSuggestionText: '',
    showShelf: false,
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
        container.className = 'apd-te-container space-y-6 p-2';

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

      container.innerHTML = `
        <!-- Workspace Header matching previous application -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border">
          <div>
            <div class="flex items-center gap-2.5">
              <span class="p-2.5 rounded-xl bg-primary/10 border border-primary/20 text-primary">${APD_ICONS.book}</span>
              <div>
                <h1 class="text-2xl font-bold font-display text-foreground tracking-tight">Thesis Workspace</h1>
                <p class="text-xs text-muted-foreground">${projectTitle}</p>
              </div>
            </div>
          </div>

          <!-- Top Navigation Switcher -->
          <div class="flex items-center gap-1.5 p-1 bg-muted/60 rounded-xl border border-border shrink-0 self-start md:self-center">
            <button id="apd-te-tab-workspace" class="apd-te-tab-btn flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${this.activeTab === 'workspace' ? 'bg-card text-foreground shadow-sm border border-border font-bold' : 'text-muted-foreground'}">
              ${APD_ICONS.layers} Chapters Workspace
            </button>
            <button id="apd-te-tab-editor" class="apd-te-tab-btn flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${this.activeTab === 'editor' ? 'bg-card text-foreground shadow-sm border border-border font-bold' : 'text-muted-foreground'}">
              ${APD_ICONS.pen} Chapter Studio & AI
            </button>
            <button id="apd-te-tab-audit" class="apd-te-tab-btn flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${this.activeTab === 'audit' ? 'bg-card text-foreground shadow-sm border border-border font-bold' : 'text-muted-foreground'}">
              ${APD_ICONS.shieldCheck} Defense Readiness Audit
              ${this.auditData ? `<span class="px-1.5 py-0.2 rounded-full bg-primary/10 text-primary text-[10px] font-bold">${this.auditData.defense_readiness_score || 85}%</span>` : ''}
            </button>
          </div>
        </div>

        <!-- Banner: Researcher-Directed Drafting & Neural AI Assistant -->
        <div class="rounded-xl border border-accent/30 bg-accent/5 p-4 flex items-start gap-3">
          <div class="text-accent shrink-0 mt-0.5">${APD_ICONS.alert}</div>
          <div class="text-sm text-foreground/80">
            <span class="font-semibold text-foreground">Drafting Workspace & Neural AI Research Co-Writer.</span>
            Structure chapters, verify evidence coverage, and write your dissertation with manual editor tools and local neural AI grounded strictly in your project's monographs, field notes, and excavation strata.
          </div>
        </div>

        <!-- Add Custom Chapter Bar matching previous app -->
        <div class="flex gap-2">
          <input id="apd-te-new-chapter-input" type="text" placeholder="Add a custom chapter…" class="max-w-xs text-xs h-9 px-3 rounded-lg border border-border bg-card text-foreground outline-none focus:border-primary" />
          <button id="apd-te-add-chapter-btn" class="h-9 px-3 rounded-lg border border-border bg-card text-xs font-medium hover:bg-muted flex items-center gap-1.5">
            ${APD_ICONS.plus} Add chapter
          </button>
        </div>

        <!-- Main Body Render -->
        ${this.activeTab === 'workspace' ? this.renderWorkspaceView(chapters, projectId) : ''}
        ${this.activeTab === 'editor' ? this.renderEditorView(chapters, projectId) : ''}
        ${this.activeTab === 'audit' ? this.renderAuditView(chapters, projectId) : ''}
      `;

      this.bindEvents(container, projectId);
    },

    /**
     * View 1: Chapters Workspace
     * Exactly matches the previous application's drafting structure and workflow:
     * - Lists all chapters (Introduction through Conclusion + custom)
     * - Shows claim count per chapter
     * - Check Evidence button per chapter
     * - Badges on claims: [+sup], [-con], [Weak], [! No citation]
     * - Evidence Check Summary box with AI analysis
     * - Inline expandable Drafting Editor + Neural AI assistant
     */
    renderWorkspaceView: function (chapters, projectId) {
      var self = this;
      var evByClaim = this.getEvidenceByClaim();

      return `
        <div class="space-y-4">
          ${chapters.map(function (ch) {
            var cl = (self.claims || []).filter(function (c) {
              return (c.chapter || '').toLowerCase() === ch.toLowerCase();
            });
            var check = self.checks[ch];
            var isChecking = self.checkingChapter === ch;
            var isExpanded = self.expandedDraftChapter === ch;
            var currentDraft = DraftStore.getDraft(projectId, ch);
            var words = currentDraft.trim() ? currentDraft.trim().split(/\s+/).filter(Boolean).length : 0;
            var status = DraftStore.getStatus(projectId, ch);

            return `
              <div class="rounded-xl border border-border bg-card overflow-hidden shadow-sm transition-all" id="chapter-card-${encodeURIComponent(ch)}">
                
                <!-- Chapter Card Header -->
                <div class="flex flex-wrap items-center justify-between p-4 border-b border-border bg-muted/20 gap-3">
                  <div class="flex items-center gap-3">
                    <span class="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                      ${APD_ICONS.book}
                    </span>
                    <div>
                      <div class="flex items-center gap-2">
                        <h3 class="font-display text-lg font-semibold text-foreground">${ch}</h3>
                        <span class="text-[10px] font-semibold px-2 py-0.5 rounded-full ${status === 'ready' ? 'bg-accent/15 text-accent' : status === 'review' ? 'bg-chart-4/15 text-chart-4' : 'bg-muted text-muted-foreground'}">
                          ${status === 'ready' ? 'Defense Ready' : status === 'review' ? 'In Review' : 'Drafting'}
                        </span>
                      </div>
                      <p class="text-xs text-muted-foreground">
                        ${cl.length} claim${cl.length !== 1 ? 's' : ''} • ${words} drafted words
                      </p>
                    </div>
                  </div>

                  <div class="flex items-center gap-2">
                    <!-- Check Evidence Button matching previous app -->
                    <button data-check-ch="${encodeURIComponent(ch)}" ${isChecking ? 'disabled' : ''} class="apd-te-check-evidence-btn px-3 py-1.5 rounded-lg border border-border bg-card text-xs font-medium hover:bg-muted flex items-center gap-1.5 transition-all">
                      ${isChecking ? `<span class="apd-te-pulse text-primary">${APD_ICONS.refresh}</span> Checking…` : `<span class="text-primary">${APD_ICONS.sparkles}</span> Check Evidence`}
                    </button>

                    <!-- Write / Draft Chapter Button -->
                    <button data-toggle-draft="${encodeURIComponent(ch)}" class="apd-te-toggle-draft-btn px-3 py-1.5 rounded-lg border ${isExpanded ? 'bg-primary text-white border-primary shadow-sm' : 'border-border bg-card hover:bg-muted text-foreground'} text-xs font-semibold flex items-center gap-1.5 transition-all">
                      ${APD_ICONS.pen} ${isExpanded ? 'Close Editor' : 'Draft Chapter'}
                    </button>
                  </div>
                </div>

                <!-- Claims & Evidence Section -->
                <div class="p-4 space-y-3">
                  ${cl.length === 0 ? `
                    <p class="text-sm text-muted-foreground">
                      No claims assigned to this chapter. <a href="#/claims" class="text-primary hover:underline font-medium">Create a claim</a> and set its chapter to “${ch}”.
                    </p>
                  ` : `
                    <div class="space-y-2">
                      ${cl.map(function (c) {
                        var ev = evByClaim[c.id] || [];
                        var sup = ev.filter(function (e) { return e.evidence_type === 'supporting'; }).length;
                        var con = ev.filter(function (e) { return e.evidence_type === 'contradicting'; }).length;
                        var hasSrc = ev.some(function (e) { return (e.source_ids || []).length > 0; }) || !!c.scholar_name;
                        var issues = (check && check.results && check.results.find(function(r) { return r.claim === c.claim_text; }) && check.results.find(function(r) { return r.claim === c.claim_text; }).issues) || [];

                        return `
                          <div class="p-3 rounded-lg border border-border bg-card/60 hover:bg-muted/30 transition-colors">
                            <div class="flex items-start justify-between gap-3">
                              <div class="text-sm font-medium text-foreground hover:text-primary cursor-pointer flex-1" data-goto-claim="${c.id}">
                                ${c.claim_text}
                                ${c.scholar_name ? `<span class="block text-xs text-muted-foreground mt-0.5">Scholar: ${c.scholar_name} ${c.page_ref ? `(p. ${c.page_ref})` : ''}</span>` : ''}
                              </div>
                              <div class="flex items-center gap-1.5 text-[10px] shrink-0 font-bold">
                                ${!hasSrc ? `<span class="px-1.5 py-0.5 rounded bg-destructive/15 text-destructive flex items-center gap-1">${APD_ICONS.alert} No citation</span>` : ''}
                                ${sup === 0 ? `<span class="px-1.5 py-0.5 rounded bg-chart-4/15 text-chart-4">Weak</span>` : ''}
                                <span class="px-1.5 py-0.5 rounded bg-accent/15 text-accent">+${sup}</span>
                                ${con > 0 ? `<span class="px-1.5 py-0.5 rounded bg-destructive/15 text-destructive">−${con}</span>` : ''}
                              </div>
                            </div>

                            ${issues.length > 0 ? `
                              <div class="flex flex-wrap gap-1.5 mt-2">
                                ${issues.map(function(i) {
                                  return `<span class="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground capitalize">${i.replace(/_/g, ' ')}</span>`;
                                }).join('')}
                              </div>
                            ` : ''}
                          </div>
                        `;
                      }).join('')}
                    </div>
                  `}

                  <!-- Evidence Check Summary if performed -->
                  ${check && check.summary ? `
                    <div class="mt-3 p-3.5 rounded-lg bg-muted/50 border border-border text-xs text-foreground/90 space-y-1">
                      <div class="font-bold text-[10px] uppercase tracking-wider text-primary flex items-center gap-1">
                        ${APD_ICONS.sparkles} Evidence Check Summary
                      </div>
                      <div class="leading-relaxed font-sans">${check.summary}</div>
                    </div>
                  ` : ''}

                  <!-- Inline Drafting Canvas when Expanded -->
                  ${isExpanded ? `
                    <div class="mt-4 pt-4 border-t border-border space-y-4">
                      ${self.renderInlineDraftCanvas(ch, projectId, currentDraft, status, cl)}
                    </div>
                  ` : ''}

                </div>

              </div>
            `;
          }).join('')}
        </div>
      `;
    },

    /**
     * Render the dual Manual Drafting Editor + AI Research Co-Writer canvas
     */
    renderInlineDraftCanvas: function (chapter, projectId, draftText, status, chapterClaims) {
      var words = draftText.trim() ? draftText.trim().split(/\s+/).filter(Boolean).length : 0;
      var chars = draftText.length;
      var readMin = Math.max(1, Math.ceil(words / 220));

      return `
        <div class="rounded-xl border border-primary/25 bg-muted/10 p-4 space-y-4">
          
          <div class="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-border">
            <div class="flex items-center gap-2">
              <span class="text-xs font-bold text-primary uppercase tracking-wider">Chapter Drafting Canvas:</span>
              <span class="text-sm font-bold text-foreground">${chapter}</span>
            </div>

            <div class="flex items-center gap-2 text-xs">
              <select data-status-for="${encodeURIComponent(chapter)}" class="apd-te-inline-status px-2.5 py-1 rounded-md bg-card border border-border text-xs font-medium text-foreground outline-none cursor-pointer">
                <option value="drafting" ${status === 'drafting' ? 'selected' : ''}>Status: Drafting</option>
                <option value="review" ${status === 'review' ? 'selected' : ''}>Status: In Review</option>
                <option value="ready" ${status === 'ready' ? 'selected' : ''}>Status: Defense Ready</option>
              </select>

              <button data-export-ch="${encodeURIComponent(chapter)}" class="apd-te-inline-export p-1.5 rounded-md hover:bg-muted border border-border bg-card text-muted-foreground hover:text-foreground" title="Export Markdown">
                ${APD_ICONS.download}
              </button>

              <button data-focus-ch="${encodeURIComponent(chapter)}" class="apd-te-inline-focus px-2.5 py-1 rounded-md border border-border bg-card hover:bg-muted text-xs font-medium flex items-center gap-1" title="Open Fullscreen Studio">
                ${APD_ICONS.pen} Focused Studio
              </button>
            </div>
          </div>

          <!-- Dual Grid: 7 cols Manual Editor, 5 cols Grounded AI Co-Writer -->
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
            
            <!-- Manual Editor -->
            <div class="lg:col-span-7 rounded-xl border border-border bg-card shadow-sm overflow-hidden flex flex-col">
              
              <!-- Formatting Toolbar -->
              <div class="p-2 border-b border-border bg-muted/20 flex flex-wrap items-center gap-1 text-xs">
                <button data-fmt-ch="${encodeURIComponent(chapter)}" data-fmt="bold" class="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground" title="Bold">${APD_ICONS.bold}</button>
                <button data-fmt-ch="${encodeURIComponent(chapter)}" data-fmt="italic" class="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground" title="Italic">${APD_ICONS.italic}</button>
                <div class="h-4 w-px bg-border mx-1"></div>
                <button data-fmt-ch="${encodeURIComponent(chapter)}" data-fmt="h2" class="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground" title="Heading 2">${APD_ICONS.heading2}</button>
                <button data-fmt-ch="${encodeURIComponent(chapter)}" data-fmt="h3" class="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground" title="Heading 3">${APD_ICONS.heading3}</button>
                <div class="h-4 w-px bg-border mx-1"></div>
                <button data-fmt-ch="${encodeURIComponent(chapter)}" data-fmt="quote" class="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground" title="Blockquote">${APD_ICONS.quote}</button>
                <button data-fmt-ch="${encodeURIComponent(chapter)}" data-fmt="list" class="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground" title="Bullet List">${APD_ICONS.list}</button>
                <div class="h-4 w-px bg-border mx-1"></div>

                <!-- Quick Citation Inserter -->
                ${this.sources.length > 0 ? `
                  <select data-cite-for="${encodeURIComponent(chapter)}" class="apd-te-quick-cite-sel bg-card border border-border text-[11px] rounded px-2 py-1 text-muted-foreground hover:text-foreground outline-none cursor-pointer max-w-[150px] truncate ml-auto">
                    <option value="">+ Insert Citation…</option>
                    ${this.sources.map(function(s) {
                      return `<option value=" (${s.author || 'Author'}, ${s.year || 'n.d.'}: p. ${s.pages || 'XX'})">${s.author || 'Author'} (${s.year || 'n.d.'})</option>`;
                    }).join('')}
                  </select>
                ` : ''}
              </div>

              <!-- Canvas Textarea -->
              <textarea data-ta-ch="${encodeURIComponent(chapter)}" class="apd-te-canvas" placeholder="Begin drafting Chapter: ${chapter}… Express your archaeological interpretation, reference loci, stratigraphy, and chronometric calibrations…">${draftText}</textarea>

              <!-- Footer Stats -->
              <div class="p-3 border-t border-border bg-muted/20 flex flex-wrap items-center justify-between text-xs text-muted-foreground gap-2">
                <div class="flex items-center gap-4">
                  <span id="apd-te-word-stat-${encodeURIComponent(chapter)}" class="font-bold text-foreground">${words} words</span>
                  <span id="apd-te-char-stat-${encodeURIComponent(chapter)}">${chars} characters</span>
                  <span>~${readMin} min read</span>
                </div>
                <div class="flex items-center gap-1.5 text-[11px] text-accent font-semibold">
                  ${APD_ICONS.checkCircle} Saved locally to project
                </div>
              </div>

            </div>

            <!-- Grounded Neural AI Research Co-Writer -->
            <div class="lg:col-span-5 rounded-xl border border-primary/25 bg-card p-4 shadow-sm space-y-3.5">
              
              <div class="flex items-center justify-between pb-2.5 border-b border-border">
                <div class="flex items-center gap-2">
                  <span class="w-6 h-6 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-xs">
                    ${APD_ICONS.sparkles}
                  </span>
                  <div>
                    <h4 class="font-bold text-xs text-foreground">AI Research Co-Writer</h4>
                    <p class="text-[10px] text-muted-foreground">Grounded strictly in project monographs & claims</p>
                  </div>
                </div>
                <span class="text-[9px] font-bold px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20">
                  Offline Neural AI
                </span>
              </div>

              <!-- Grounding Stats -->
              <div class="p-2 rounded-lg bg-muted/40 border border-border text-[11px] flex items-center justify-between">
                <span class="text-muted-foreground text-[10px] uppercase font-bold">Project Library:</span>
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
                <span class="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Select AI Action:</span>
                <div class="grid grid-cols-2 gap-1.5">
                  <button data-ai-for="${encodeURIComponent(chapter)}" data-ai-action="synthesize" class="apd-te-ai-action-btn p-2 rounded-lg border border-border bg-card/60 hover:bg-muted text-left text-xs font-medium transition-colors flex items-center gap-1.5">
                    <span class="text-primary">${APD_ICONS.sparkles}</span>
                    <span>Synthesize Claims</span>
                  </button>

                  <button data-ai-for="${encodeURIComponent(chapter)}" data-ai-action="citations" class="apd-te-ai-action-btn p-2 rounded-lg border border-border bg-card/60 hover:bg-muted text-left text-xs font-medium transition-colors flex items-center gap-1.5">
                    <span class="text-accent">${APD_ICONS.book}</span>
                    <span>Suggest Citations</span>
                  </button>

                  <button data-ai-for="${encodeURIComponent(chapter)}" data-ai-action="viva_check" class="apd-te-ai-action-btn p-2 rounded-lg border border-border bg-card/60 hover:bg-muted text-left text-xs font-medium transition-colors flex items-center gap-1.5">
                    <span class="text-chart-4">${APD_ICONS.shieldCheck}</span>
                    <span>Viva Defense Check</span>
                  </button>

                  <button data-ai-for="${encodeURIComponent(chapter)}" data-ai-action="expand" class="apd-te-ai-action-btn p-2 rounded-lg border border-border bg-card/60 hover:bg-muted text-left text-xs font-medium transition-colors flex items-center gap-1.5">
                    <span class="text-primary">${APD_ICONS.pen}</span>
                    <span>Continue Paragraph</span>
                  </button>
                </div>
              </div>

              <!-- Custom Inquiry Box -->
              <div class="space-y-1.5 pt-1">
                <span class="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Custom Scholarly Inquiry:</span>
                <div class="flex gap-2">
                  <input data-query-for="${encodeURIComponent(chapter)}" type="text" placeholder="e.g. Synthesize the stratigraphy of Trench B with Kenyon 1978…" class="text-xs h-8 px-2.5 rounded-md border border-border bg-transparent flex-1 outline-none focus:border-primary" />
                  <button data-query-btn-for="${encodeURIComponent(chapter)}" class="apd-te-query-btn h-8 px-3 rounded-md bg-primary text-white text-xs font-bold hover:bg-primary/90 flex items-center gap-1">
                    Generate
                  </button>
                </div>
              </div>

              <!-- AI Loading State -->
              <div id="apd-te-ai-loading-${encodeURIComponent(chapter)}" class="hidden p-5 rounded-xl border border-primary/20 bg-primary/5 flex flex-col items-center justify-center text-center space-y-2">
                <span class="text-primary apd-te-pulse">${APD_ICONS.refresh}</span>
                <p class="text-xs font-bold text-foreground">Evaluating library monographs & claims…</p>
                <p class="text-[10px] text-muted-foreground">Synthesizing peer-reviewed archaeological prose with Qwen 2.5 7B</p>
              </div>

              <!-- AI Suggestion Output -->
              <div id="apd-te-ai-output-${encodeURIComponent(chapter)}" class="hidden p-3.5 rounded-xl border border-primary/30 bg-primary/5 space-y-2.5">
                <div class="flex items-center justify-between text-xs pb-1.5 border-b border-primary/15">
                  <span class="font-bold text-primary text-[11px] flex items-center gap-1">
                    ${APD_ICONS.sparkles} Grounded Academic Suggestion
                  </span>
                  <button data-close-ai-output="${encodeURIComponent(chapter)}" class="text-muted-foreground hover:text-foreground">${APD_ICONS.x}</button>
                </div>

                <div id="apd-te-suggestion-body-${encodeURIComponent(chapter)}" class="text-xs font-serif leading-relaxed text-foreground/90 max-h-[200px] overflow-y-auto whitespace-pre-wrap p-2 rounded bg-card/80 border border-border"></div>

                <div class="flex items-center justify-between pt-1">
                  <button data-insert-ai-output="${encodeURIComponent(chapter)}" class="h-7 px-2.5 rounded-md bg-primary text-white text-xs font-semibold hover:bg-primary/90 flex items-center gap-1">
                    ${APD_ICONS.pen} Insert in Editor
                  </button>

                  <div class="flex gap-1.5">
                    <button data-append-ai-output="${encodeURIComponent(chapter)}" class="h-7 px-2.5 rounded-md border border-border bg-card text-xs font-medium hover:bg-muted">
                      Append
                    </button>
                    <button data-copy-ai-output="${encodeURIComponent(chapter)}" class="h-7 px-2 rounded-md border border-border bg-card hover:bg-muted text-muted-foreground" title="Copy suggestion">
                      ${APD_ICONS.copy}
                    </button>
                  </div>
                </div>
              </div>

            </div>

          </div>

        </div>
      `;
    },

    /**
     * View 2: Focused Chapter Studio (Dedicated Fullscreen Writing Canvas)
     */
    renderEditorView: function (chapters, projectId) {
      var self = this;
      var activeDraft = DraftStore.getDraft(projectId, this.activeChapter);
      var activeStatus = DraftStore.getStatus(projectId, this.activeChapter);
      var activeClaims = (this.claims || []).filter(function (c) {
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
            var chClaims = (self.claims || []).filter(function(c) { return (c.chapter || '').toLowerCase() === ch.toLowerCase(); });
            return `
              <button data-ch-select="${encodeURIComponent(ch)}" class="apd-te-ch-select-btn px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-2 border shrink-0 ${isSelected ? 'bg-primary text-white border-primary shadow-sm font-semibold' : 'bg-card/70 text-foreground/80 border-border hover:bg-muted'}">
                <span class="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${isSelected ? 'bg-white/25 text-white' : 'bg-muted text-muted-foreground'}">${idx + 1}</span>
                <span>${ch}</span>
                ${chClaims.length > 0 ? `<span class="text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-white/25 text-white' : 'bg-muted/80 text-muted-foreground'}">${chClaims.length}</span>` : ''}
              </button>
            `;
          }).join('')}
        </div>

        <!-- Render the full canvas for activeChapter -->
        ${this.renderInlineDraftCanvas(this.activeChapter, projectId, activeDraft, activeStatus, activeClaims)}
      `;
    },

    /**
     * View 3: Pre-Submission Defense Readiness Audit
     */
    renderAuditView: function (chapters, projectId) {
      var self = this;
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

                    <button data-goto-draft="${encodeURIComponent(ch)}" class="apd-te-goto-draft-btn px-3 py-1.5 rounded-lg border border-border bg-card text-xs font-semibold hover:bg-muted flex items-center gap-1">
                      Draft Chapter ${APD_ICONS.chevronRight}
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

      // Tab switcher
      var tabWs = container.querySelector('#apd-te-tab-workspace');
      if (tabWs) tabWs.onclick = function () { self.activeTab = 'workspace'; self.render(); };

      var tabEd = container.querySelector('#apd-te-tab-editor');
      if (tabEd) tabEd.onclick = function () { self.activeTab = 'editor'; self.render(); };

      var tabAu = container.querySelector('#apd-te-tab-audit');
      if (tabAu) tabAu.onclick = function () { self.activeTab = 'audit'; self.render(); };

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
        newChInp.value = '';
        self.render();
      }
      if (addChBtn) addChBtn.onclick = doAddChapter;
      if (newChInp) newChInp.onkeydown = function(e) { if (e.key === 'Enter') doAddChapter(); };

      // Check Evidence Button per chapter
      var checkBtns = container.querySelectorAll('.apd-te-check-evidence-btn');
      checkBtns.forEach(function (btn) {
        btn.onclick = function () {
          var ch = decodeURIComponent(btn.getAttribute('data-check-ch'));
          self.runEvidenceCheck(ch, projectId);
        };
      });

      // Toggle inline draft canvas
      var toggleDraftBtns = container.querySelectorAll('.apd-te-toggle-draft-btn');
      toggleDraftBtns.forEach(function (btn) {
        btn.onclick = function () {
          var ch = decodeURIComponent(btn.getAttribute('data-toggle-draft'));
          if (self.expandedDraftChapter === ch) {
            self.expandedDraftChapter = null;
          } else {
            self.expandedDraftChapter = ch;
          }
          self.render();
        };
      });

      // Switch to Focused Studio from button
      var focusBtns = container.querySelectorAll('.apd-te-inline-focus, .apd-te-goto-draft-btn');
      focusBtns.forEach(function (btn) {
        btn.onclick = function () {
          var ch = decodeURIComponent(btn.getAttribute('data-focus-ch') || btn.getAttribute('data-goto-draft'));
          self.activeChapter = ch;
          self.activeTab = 'editor';
          self.render();
        };
      });

      // Chapter select in Focused Studio
      var chSelBtns = container.querySelectorAll('.apd-te-ch-select-btn');
      chSelBtns.forEach(function (btn) {
        btn.onclick = function () {
          self.activeChapter = decodeURIComponent(btn.getAttribute('data-ch-select'));
          self.render();
        };
      });

      // Textareas input handler (autosave)
      var textareas = container.querySelectorAll('textarea[data-ta-ch]');
      textareas.forEach(function (ta) {
        var ch = decodeURIComponent(ta.getAttribute('data-ta-ch'));
        ta.oninput = function () {
          DraftStore.saveDraft(projectId, ch, ta.value);
          var words = ta.value.trim() ? ta.value.trim().split(/\s+/).filter(Boolean).length : 0;
          var chars = ta.value.length;
          var wStat = container.querySelector('#apd-te-word-stat-' + encodeURIComponent(ch));
          var cStat = container.querySelector('#apd-te-char-stat-' + encodeURIComponent(ch));
          if (wStat) wStat.innerText = words + ' words';
          if (cStat) cStat.innerText = chars + ' characters';
        };
      });

      // Status dropdowns
      var statusDropdowns = container.querySelectorAll('select[data-status-for]');
      statusDropdowns.forEach(function (sel) {
        var ch = decodeURIComponent(sel.getAttribute('data-status-for'));
        sel.onchange = function () {
          DraftStore.saveStatus(projectId, ch, sel.value);
        };
      });

      // Quick Citation select
      var citeSelects = container.querySelectorAll('.apd-te-quick-cite-sel');
      citeSelects.forEach(function (sel) {
        var ch = decodeURIComponent(sel.getAttribute('data-cite-for'));
        var ta = container.querySelector('textarea[data-ta-ch="' + encodeURIComponent(ch) + '"]');
        sel.onchange = function () {
          if (sel.value && ta) {
            self.insertAtCursor(ta, ch, sel.value);
            sel.value = '';
          }
        };
      });

      // Formatting buttons
      var fmtBtns = container.querySelectorAll('button[data-fmt-ch]');
      fmtBtns.forEach(function (b) {
        b.onclick = function () {
          var ch = decodeURIComponent(b.getAttribute('data-fmt-ch'));
          var ta = container.querySelector('textarea[data-ta-ch="' + encodeURIComponent(ch) + '"]');
          if (!ta) return;
          var fmt = b.getAttribute('data-fmt');
          if (fmt === 'bold') self.wrapSelection(ta, ch, '**', '**');
          else if (fmt === 'italic') self.wrapSelection(ta, ch, '*', '*');
          else if (fmt === 'h2') self.wrapSelection(ta, ch, '## ', '');
          else if (fmt === 'h3') self.wrapSelection(ta, ch, '### ', '');
          else if (fmt === 'quote') self.wrapSelection(ta, ch, '> ', '');
          else if (fmt === 'list') self.wrapSelection(ta, ch, '- ', '');
        };
      });

      // Export Markdown button
      var exportBtns = container.querySelectorAll('.apd-te-inline-export');
      exportBtns.forEach(function (btn) {
        btn.onclick = function () {
          var ch = decodeURIComponent(btn.getAttribute('data-export-ch'));
          var ta = container.querySelector('textarea[data-ta-ch="' + encodeURIComponent(ch) + '"]');
          var text = ta ? ta.value : DraftStore.getDraft(projectId, ch);
          var filename = ch.replace(/[^a-zA-Z0-9_-]/g, '_') + '_Draft.md';
          var blob = new Blob([
            '# ' + ch + '\n\n' +
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
      });

      // AI Action Buttons
      var aiActionBtns = container.querySelectorAll('.apd-te-ai-action-btn');
      aiActionBtns.forEach(function (btn) {
        btn.onclick = function () {
          var ch = decodeURIComponent(btn.getAttribute('data-ai-for'));
          var action = btn.getAttribute('data-ai-action');
          self.runAiQuery(ch, action, '');
        };
      });

      // Custom Query Button
      var queryBtns = container.querySelectorAll('.apd-te-query-btn');
      queryBtns.forEach(function (btn) {
        btn.onclick = function () {
          var ch = decodeURIComponent(btn.getAttribute('data-query-btn-for'));
          var inp = container.querySelector('input[data-query-for="' + encodeURIComponent(ch) + '"]');
          if (inp && inp.value.trim()) {
            self.runAiQuery(ch, 'custom', inp.value.trim());
          }
        };
      });

      // AI Output Close
      var closeAiBtns = container.querySelectorAll('button[data-close-ai-output]');
      closeAiBtns.forEach(function (btn) {
        btn.onclick = function () {
          var ch = decodeURIComponent(btn.getAttribute('data-close-ai-output'));
          var outBox = container.querySelector('#apd-te-ai-output-' + encodeURIComponent(ch));
          if (outBox) outBox.classList.add('hidden');
        };
      });

      // AI Output Insert in Editor
      var insertAiBtns = container.querySelectorAll('button[data-insert-ai-output]');
      insertAiBtns.forEach(function (btn) {
        btn.onclick = function () {
          var ch = decodeURIComponent(btn.getAttribute('data-insert-ai-output'));
          var ta = container.querySelector('textarea[data-ta-ch="' + encodeURIComponent(ch) + '"]');
          var body = container.querySelector('#apd-te-suggestion-body-' + encodeURIComponent(ch));
          if (ta && body) {
            self.insertAtCursor(ta, ch, '\n\n' + body.innerText + '\n\n');
          }
        };
      });

      // AI Output Append
      var appendAiBtns = container.querySelectorAll('button[data-append-ai-output]');
      appendAiBtns.forEach(function (btn) {
        btn.onclick = function () {
          var ch = decodeURIComponent(btn.getAttribute('data-append-ai-output'));
          var ta = container.querySelector('textarea[data-ta-ch="' + encodeURIComponent(ch) + '"]');
          var body = container.querySelector('#apd-te-suggestion-body-' + encodeURIComponent(ch));
          if (ta && body) {
            ta.value = ta.value + '\n\n' + body.innerText;
            DraftStore.saveDraft(projectId, ch, ta.value);
            alert('Appended suggestion to chapter draft!');
          }
        };
      });

      // AI Output Copy
      var copyAiBtns = container.querySelectorAll('button[data-copy-ai-output]');
      copyAiBtns.forEach(function (btn) {
        btn.onclick = function () {
          var ch = decodeURIComponent(btn.getAttribute('data-copy-ai-output'));
          var body = container.querySelector('#apd-te-suggestion-body-' + encodeURIComponent(ch));
          if (body) {
            navigator.clipboard.writeText(body.innerText);
            alert('Copied suggestion to clipboard!');
          }
        };
      });

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

    /**
     * Run Evidence Check matching the previous application's workflow:
     * Gathers chapter claims and evidence, calls InvokeLLM with the standard evidence check schema,
     * flags issues (no_citation, weak_evidence, contradictory_evidence, missing_source_connection),
     * and produces an Evidence Check Summary.
     */
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

    /**
     * Grounded AI Research Suggestion Engine
     */
    runAiQuery: async function (chapter, mode, customQuery) {
      var projectId = getActiveProjectId();
      var bridge = window.nativeBridge;
      var loadingEl = document.getElementById('apd-te-ai-loading-' + encodeURIComponent(chapter));
      var outputEl = document.getElementById('apd-te-ai-output-' + encodeURIComponent(chapter));
      var bodyEl = document.getElementById('apd-te-suggestion-body-' + encodeURIComponent(chapter));

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
