/**
 * ArchaeoPhD — Offline Native Argument Builder & Dialectic Reasoner
 * 
 * Toulmin-style Epistemic Argumentation DAG for Archaeological Dissertations:
 * Research Question -> Working Hypothesis -> Supporting Claims vs. Counterarguments -> Primary Evidence -> Monograph Citations.
 * 
 * - 100% on-device local persistence (Zero cloud dependency, zero Base44 calls)
 * - Grounded Dialectic Bifurcation (Supporting Claims vs. Rival Scholar Counterarguments)
 * - Local AI "Devil's Advocate" (Qwen 2.5 7B) for viva examination caveats
 * - 1-Click Bridge to Thesis Studio (Injects structured argument directly into chapter draft)
 * - Strict zero emojis throughout (all vector SVG Lucide-style paths)
 */

(function () {
  'use strict';

  var APD_ICONS = {
    workflow: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="8" height="8" x="3" y="3" rx="2"/><path d="M7 11v4a2 2 0 0 0 2 2h4"/><rect width="8" height="8" x="13" y="13" rx="2"/></svg>',
    plus: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" x2="12" y1="5" y2="19"/><line x1="5" x2="19" y1="12" y2="12"/></svg>',
    helpCircle: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg>',
    trash: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>',
    arrowRight: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" x2="19" y1="12" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>',
    arrowDown: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" x2="12" y1="5" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>',
    fileText: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/></svg>',
    checkCircle: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
    alertTriangle: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg>',
    shieldCheck: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>',
    sparkles: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>',
    bookOpen: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>',
    x: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/></svg>',
    link: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>'
  };

  function injectStyles() {
    if (document.getElementById('apd-argument-builder-styles')) return;
    var style = document.createElement('style');
    style.id = 'apd-argument-builder-styles';
    style.textContent = `
      .apd-arg-container {
        font-family: var(--font-body, "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif);
        color: hsl(var(--foreground, 30 10% 12%));
      }
      .apd-arg-modal-overlay {
        position: fixed;
        inset: 0;
        z-index: 10000;
        background: rgba(0, 0, 0, 0.55);
        backdrop-filter: blur(4px);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 16px;
        animation: apdArgFadeIn 0.15s ease-out;
      }
      .apd-arg-modal-card {
        width: 100%;
        max-width: 520px;
        background: hsl(var(--card, 38 28% 97%));
        border: 1px solid hsl(var(--border, 36 16% 87%));
        border-radius: 12px;
        box-shadow: 0 20px 40px -8px rgba(0, 0, 0, 0.3);
        overflow: hidden;
      }
      @keyframes apdArgFadeIn {
        from { opacity: 0; transform: scale(0.98); }
        to { opacity: 1; transform: scale(1); }
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
    return "Archaeological Project";
  }

  // 100% Offline Local Storage Manager
  var ArgumentStore = {
    getQuestions: function (projectId) {
      try {
        var raw = localStorage.getItem('archaeophd_rqs_' + projectId);
        if (raw) {
          var arr = JSON.parse(raw);
          if (Array.isArray(arr) && arr.length > 0) return arr;
        }
      } catch(e) {}
      // Default initial question for fresh projects
      return [
        {
          id: 'rq_default_1',
          project_id: projectId,
          question: 'What was the chronological horizon and primary driver of the City IV destruction at Tell es-Sultan (Jericho)?'
        }
      ];
    },
    saveQuestions: function (projectId, list) {
      try {
        localStorage.setItem('archaeophd_rqs_' + projectId, JSON.stringify(list));
      } catch(e) {}
    },
    getHypotheses: function (projectId) {
      try {
        var raw = localStorage.getItem('archaeophd_hypotheses_' + projectId);
        if (raw) {
          var arr = JSON.parse(raw);
          if (Array.isArray(arr) && arr.length > 0) return arr;
        }
      } catch(e) {}
      // Default initial hypothesis
      return [
        {
          id: 'hyp_default_1',
          project_id: projectId,
          research_question_id: 'rq_default_1',
          text: 'The catastrophic destruction of City IV occurred in Late Bronze I (c. 1400 BCE), contemporaneous with continuous domestic storage jar assemblages, rather than an Egyptian Middle Bronze campaign (c. 1550 BCE).',
          status: 'contested',
          claim_ids: []
        }
      ];
    },
    saveHypotheses: function (projectId, list) {
      try {
        localStorage.setItem('archaeophd_hypotheses_' + projectId, JSON.stringify(list));
      } catch(e) {}
    }
  };

  var ArgumentStudio = {
    activeQuestionFilter: 'all',
    claims: [],
    evidence: [],
    sources: [],
    hypotheses: [],
    questions: [],
    isAiLoading: false,

    init: function () {
      injectStyles();
      this.attachNavigationListener();
    },

    attachNavigationListener: function () {
      var self = this;
      function checkPath() {
        var path = window.location.pathname;
        if (path === '/argument-builder' || path.endsWith('/argument-builder') || window.location.hash === '#/argument-builder') {
          self.mountIfPresent();
        }
      }
      window.addEventListener('popstate', checkPath);
      setInterval(checkPath, 600);
    },

    mountIfPresent: function () {
      var root = document.getElementById('root');
      if (!root) return;
      var existingStudio = document.getElementById('apd-argument-studio-mount');
      if (existingStudio && existingStudio.children.length > 0) return;

      var pageTitle = document.querySelector('h1, h2, h3');
      var isArgPage = window.location.pathname.indexOf('/argument-builder') !== -1 || (pageTitle && pageTitle.innerText.indexOf('Argument') !== -1);
      if (!isArgPage) return;

      this.loadProjectData();
    },

    loadProjectData: async function () {
      var projectId = getActiveProjectId();
      this.questions = ArgumentStore.getQuestions(projectId);
      this.hypotheses = ArgumentStore.getHypotheses(projectId);

      var bridge = window.nativeBridge;
      if (bridge && typeof bridge.call === 'function') {
        try {
          var c = await bridge.call('get_claims', {}, projectId);
          if (Array.isArray(c)) this.claims = c;
        } catch(e) {}
        try {
          var ev = await bridge.call('get_evidence', {}, projectId);
          if (Array.isArray(ev)) this.evidence = ev;
        } catch(e) {}
        try {
          var s = await bridge.call('get_sources', {}, projectId);
          if (Array.isArray(s)) this.sources = s;
        } catch(e) {}
      }
      this.render();
    },

    render: function () {
      var container = document.getElementById('apd-argument-studio-mount');
      if (!container) {
        container = document.createElement('div');
        container.id = 'apd-argument-studio-mount';
        container.className = 'apd-arg-container space-y-6 p-2';

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
      var self = this;

      var filteredHyps = this.hypotheses;
      if (this.activeQuestionFilter !== 'all') {
        filteredHyps = this.hypotheses.filter(function (h) {
          return h.research_question_id === self.activeQuestionFilter;
        });
      }

      container.innerHTML = `
        <!-- Top Header Ribbon -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border">
          <div>
            <div class="flex items-center gap-2.5">
              <span class="p-2.5 rounded-xl bg-primary/10 border border-primary/20 text-primary">
                ${APD_ICONS.workflow}
              </span>
              <div>
                <h1 class="text-2xl font-bold font-display text-foreground tracking-tight">Argument Builder & Dialectic Reasoner</h1>
                <p class="text-xs text-muted-foreground">${projectTitle} • Construct testable hypotheses with supporting claims vs. counterarguments</p>
              </div>
            </div>
          </div>

          <div class="flex items-center gap-2 shrink-0 self-start md:self-center">
            <button id="apd-arg-btn-new-rq" class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-border bg-card text-foreground hover:bg-muted transition-all shadow-sm">
              ${APD_ICONS.helpCircle} New Question
            </button>
            <button id="apd-arg-btn-new-hyp" class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-primary text-white hover:bg-primary/90 transition-all shadow-sm">
              ${APD_ICONS.plus} New Hypothesis
            </button>
          </div>
        </div>

        <!-- Research Question Filter Switcher -->
        <div class="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          <span class="text-[10px] font-bold uppercase tracking-wider text-muted-foreground shrink-0 mr-1">Questions:</span>
          <button data-rq-filter="all" class="px-3 py-1 rounded-md text-xs whitespace-nowrap transition-all border shrink-0 ${this.activeQuestionFilter === 'all' ? 'bg-primary text-white border-primary shadow-sm font-bold' : 'bg-card text-muted-foreground border-border hover:bg-muted'}">
            All Hypotheses (${this.hypotheses.length})
          </button>
          ${this.questions.map(function (q) {
            var isSelected = self.activeQuestionFilter === q.id;
            var count = self.hypotheses.filter(function(h) { return h.research_question_id === q.id; }).length;
            return `
              <button data-rq-filter="${encodeURIComponent(q.id)}" class="px-3 py-1 rounded-md text-xs whitespace-nowrap transition-all border shrink-0 flex items-center gap-1.5 ${isSelected ? 'bg-primary text-white border-primary shadow-sm font-bold' : 'bg-card text-muted-foreground border-border hover:bg-muted'}">
                <span class="truncate max-w-[240px]">${q.question}</span>
                <span class="text-[10px] opacity-75">(${count})</span>
              </button>
            `;
          }).join('')}
        </div>

        <!-- Hypotheses List -->
        ${filteredHyps.length === 0 ? `
          <div class="rounded-xl border border-dashed border-border bg-card/40 p-12 text-center space-y-3">
            <div class="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center mx-auto">
              ${APD_ICONS.workflow}
            </div>
            <div>
              <h3 class="font-display text-base font-bold text-foreground">No Hypotheses in this View</h3>
              <p class="text-xs text-muted-foreground mt-1 max-w-md mx-auto">Formulate a working hypothesis for your dissertation, then attach supporting claims and rival counterarguments.</p>
            </div>
            <button id="apd-arg-btn-empty-add" class="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-all shadow-sm">
              ${APD_ICONS.plus} Formulate First Hypothesis
            </button>
          </div>
        ` : `
          <div class="space-y-6">
            ${filteredHyps.map(function (h) {
              var rq = self.questions.find(function(q) { return q.id === h.research_question_id; });
              var linkedClaims = (self.claims || []).filter(function (c) {
                return (h.claim_ids || []).indexOf(c.id) !== -1;
              });

              var supportClaims = linkedClaims.filter(function (c) {
                return !(self.evidence || []).some(function (ev) {
                  return ev.claim_id === c.id && ev.evidence_type === 'contradicting';
                });
              });

              var contradictClaims = linkedClaims.filter(function (c) {
                return (self.evidence || []).some(function (ev) {
                  return ev.claim_id === c.id && ev.evidence_type === 'contradicting';
                });
              });

              var unlinkedProjectClaims = (self.claims || []).filter(function (c) {
                return (h.claim_ids || []).indexOf(c.id) === -1;
              });

              return `
                <div class="rounded-xl border border-border bg-card p-5 space-y-4 shadow-sm hover:border-border/80 transition-all">
                  <!-- Hypothesis Card Header -->
                  <div class="flex items-start justify-between gap-3">
                    <div class="space-y-1 flex-1">
                      ${rq ? `
                        <div class="flex items-center gap-1.5 text-xs text-primary font-medium">
                          ${APD_ICONS.helpCircle}
                          <span>${rq.question}</span>
                        </div>
                      ` : ''}
                      <div class="flex items-center gap-2">
                        <span class="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Hypothesis</span>
                        <span class="text-muted-foreground/60">${APD_ICONS.arrowDown}</span>
                      </div>
                      <h2 class="font-display text-lg font-bold text-foreground leading-snug">
                        ${h.text}
                      </h2>
                    </div>

                    <div class="flex items-center gap-2 shrink-0">
                      <!-- Status Dropdown Selector -->
                      <select data-hyp-status="${encodeURIComponent(h.id)}" class="h-7 px-2 rounded-md bg-muted/60 border border-border text-xs font-semibold text-foreground outline-none cursor-pointer">
                        <option value="unresolved" ${h.status === 'unresolved' ? 'selected' : ''}>Status: Unresolved</option>
                        <option value="supported" ${h.status === 'supported' ? 'selected' : ''}>Status: Supported</option>
                        <option value="contested" ${h.status === 'contested' ? 'selected' : ''}>Status: Contested</option>
                        <option value="refuted" ${h.status === 'refuted' ? 'selected' : ''}>Status: Refuted</option>
                      </select>

                      <!-- Delete Hypothesis -->
                      <button data-delete-hyp="${encodeURIComponent(h.id)}" class="text-muted-foreground hover:text-destructive p-1.5 rounded-md hover:bg-destructive/10 transition-colors" title="Delete hypothesis">
                        ${APD_ICONS.trash}
                      </button>
                    </div>
                  </div>

                  <!-- Two-Column Dialectic Split Layout -->
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    
                    <!-- LEFT COLUMN: SUPPORTING CLAIMS (Green Theme) -->
                    <div class="rounded-lg border border-accent/30 bg-accent/5 p-3.5 space-y-3">
                      <div class="flex items-center justify-between pb-1.5 border-b border-accent/20">
                        <span class="text-xs font-bold text-accent uppercase tracking-wider flex items-center gap-1.5">
                          ${APD_ICONS.shieldCheck} Supporting Claims (${supportClaims.length})
                        </span>
                        <span class="text-[10px] font-semibold text-accent/80">Corroborating Case</span>
                      </div>

                      ${supportClaims.length === 0 ? `
                        <p class="text-xs text-muted-foreground italic py-3 text-center">
                          No supporting claims linked yet. Use the claim linker below.
                        </p>
                      ` : `
                        <div class="space-y-2.5">
                          ${supportClaims.map(function (c) {
                            var evList = (self.evidence || []).filter(function(e) { return e.claim_id === c.id; });
                            return `
                              <div class="rounded-md border border-accent/20 bg-card p-3 space-y-1.5 text-xs shadow-xs">
                                <div class="flex items-start justify-between gap-2">
                                  <div class="flex items-start gap-1.5 flex-1">
                                    <span class="text-accent mt-0.5 shrink-0">${APD_ICONS.arrowRight}</span>
                                    <span class="font-semibold text-foreground leading-snug">${c.claim_text}</span>
                                  </div>
                                  <button data-unlink-claim-hyp="${encodeURIComponent(h.id)}" data-unlink-claim-id="${encodeURIComponent(c.id)}" class="text-muted-foreground hover:text-destructive p-0.5" title="Unlink claim">
                                    ${APD_ICONS.x}
                                  </button>
                                </div>

                                ${evList.length > 0 ? `
                                  <div class="ml-4 pl-2 border-l border-border/80 space-y-1 mt-1">
                                    ${evList.map(function(ev) {
                                      var srcNames = (ev.source_ids || []).map(function(sid) {
                                        var src = self.sources.find(function(s) { return s.id === sid; });
                                        return src ? (src.author ? src.author + ' (' + (src.year || 'n.d.') + ')' : src.title) : 'Ingested Monograph';
                                      }).join(', ');

                                      return `
                                        <div class="text-[11px] text-muted-foreground">
                                          <div>${ev.evidence_text}</div>
                                          ${srcNames ? `<div class="text-[10px] text-accent/90 flex items-center gap-1 font-medium mt-0.5">${APD_ICONS.fileText} ${srcNames}</div>` : ''}
                                        </div>
                                      `;
                                    }).join('')}
                                  </div>
                                ` : ''}
                              </div>
                            `;
                          }).join('')}
                        </div>
                      `}
                    </div>

                    <!-- RIGHT COLUMN: COUNTERARGUMENTS & RIVAL CLAIMS (Red/Amber Theme) -->
                    <div class="rounded-lg border border-destructive/30 bg-destructive/5 p-3.5 space-y-3">
                      <div class="flex items-center justify-between pb-1.5 border-b border-destructive/20">
                        <span class="text-xs font-bold text-destructive uppercase tracking-wider flex items-center gap-1.5">
                          ${APD_ICONS.alertTriangle} Counterarguments & Rivals (${contradictClaims.length})
                        </span>
                        <span class="text-[10px] font-semibold text-destructive/80">Viva Vulnerabilities</span>
                      </div>

                      ${contradictClaims.length === 0 ? `
                        <p class="text-xs text-muted-foreground italic py-3 text-center">
                          Zero contradictory claims detected. Click "Surface Counterarguments" to examine rival scholarship.
                        </p>
                      ` : `
                        <div class="space-y-2.5">
                          ${contradictClaims.map(function (c) {
                            var evList = (self.evidence || []).filter(function(e) { return e.claim_id === c.id; });
                            return `
                              <div class="rounded-md border border-destructive/20 bg-card p-3 space-y-1.5 text-xs shadow-xs">
                                <div class="flex items-start justify-between gap-2">
                                  <div class="flex items-start gap-1.5 flex-1">
                                    <span class="text-destructive mt-0.5 shrink-0">${APD_ICONS.arrowRight}</span>
                                    <span class="font-semibold text-foreground leading-snug">${c.claim_text}</span>
                                  </div>
                                  <button data-unlink-claim-hyp="${encodeURIComponent(h.id)}" data-unlink-claim-id="${encodeURIComponent(c.id)}" class="text-muted-foreground hover:text-destructive p-0.5" title="Unlink claim">
                                    ${APD_ICONS.x}
                                  </button>
                                </div>

                                ${evList.length > 0 ? `
                                  <div class="ml-4 pl-2 border-l border-destructive/30 space-y-1 mt-1">
                                    ${evList.map(function(ev) {
                                      var srcNames = (ev.source_ids || []).map(function(sid) {
                                        var src = self.sources.find(function(s) { return s.id === sid; });
                                        return src ? (src.author ? src.author + ' (' + (src.year || 'n.d.') + ')' : src.title) : 'Rival Publication';
                                      }).join(', ');

                                      return `
                                        <div class="text-[11px] text-muted-foreground">
                                          <div>${ev.evidence_text}</div>
                                          ${srcNames ? `<div class="text-[10px] text-destructive flex items-center gap-1 font-medium mt-0.5">${APD_ICONS.fileText} ${srcNames}</div>` : ''}
                                        </div>
                                      `;
                                    }).join('')}
                                  </div>
                                ` : ''}
                              </div>
                            `;
                          }).join('')}
                        </div>
                      `}
                    </div>

                  </div>

                  <!-- Bottom Action Bar: Link Claim, AI Counterarg, Send to Thesis -->
                  <div class="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-border/80 text-xs">
                    
                    <!-- Link Claim Dropdown -->
                    <div class="flex items-center gap-2 w-full sm:w-auto flex-1 max-w-md">
                      <select data-link-claim-hyp="${encodeURIComponent(h.id)}" class="w-full h-8 px-2.5 rounded-md border border-border bg-card text-xs text-foreground outline-none cursor-pointer">
                        <option value="">+ Connect Registered Claim to this Hypothesis...</option>
                        ${unlinkedProjectClaims.map(function (c) {
                          return `
                            <option value="${c.id}">
                              ${c.claim_text.length > 70 ? c.claim_text.slice(0, 70) + '...' : c.claim_text}
                            </option>
                          `;
                        }).join('')}
                      </select>
                    </div>

                    <!-- Right Action Buttons -->
                    <div class="flex items-center gap-2 self-end sm:self-auto shrink-0">
                      <!-- AI Devil's Advocate Counterargument Button -->
                      <button data-ai-counterarg="${encodeURIComponent(h.id)}" class="h-8 px-2.5 rounded-md border border-primary/30 bg-primary/5 text-primary hover:bg-primary/10 font-semibold text-xs flex items-center gap-1.5 transition-all">
                        ${APD_ICONS.sparkles} Surface Counterarguments
                      </button>

                      <!-- Send Argument to Thesis Studio Button -->
                      <button data-export-thesis-hyp="${encodeURIComponent(h.id)}" class="h-8 px-3 rounded-md bg-foreground text-background hover:bg-foreground/90 font-semibold text-xs flex items-center gap-1.5 transition-all shadow-xs">
                        ${APD_ICONS.bookOpen} Insert into Thesis
                      </button>
                    </div>

                  </div>

                  <!-- Dynamic AI Counterargument Output Shelf (Populated on click) -->
                  <div id="apd-arg-ai-box-${h.id.replace(/[^a-zA-Z0-9_-]/g, '_')}" class="hidden p-4 rounded-lg border border-primary/20 bg-primary/5 space-y-2 text-xs">
                    <div class="flex items-center justify-between font-bold text-foreground">
                      <span class="flex items-center gap-1.5 text-primary">
                        ${APD_ICONS.sparkles} Grounded Viva Examination Counterargument Analysis
                      </span>
                      <button data-close-ai-box="${h.id.replace(/[^a-zA-Z0-9_-]/g, '_')}" class="text-muted-foreground hover:text-foreground">
                        ${APD_ICONS.x}
                      </button>
                    </div>
                    <div class="apd-arg-ai-content font-serif text-foreground/90 leading-relaxed whitespace-pre-wrap"></div>
                  </div>

                </div>
              `;
            }).join('')}
          </div>
        `}
      `;

      this.bindEvents(container, projectId);
    },

    bindEvents: function (container, projectId) {
      var self = this;

      // Filter by Research Question
      var filterBtns = container.querySelectorAll('[data-rq-filter]');
      filterBtns.forEach(function (btn) {
        btn.onclick = function () {
          self.activeQuestionFilter = decodeURIComponent(btn.getAttribute('data-rq-filter'));
          self.render();
        };
      });

      // New Hypothesis button
      var newHypBtn = container.querySelector('#apd-arg-btn-new-hyp');
      var emptyAddBtn = container.querySelector('#apd-arg-btn-empty-add');
      if (newHypBtn) newHypBtn.onclick = function () { self.showAddHypothesisModal(projectId); };
      if (emptyAddBtn) emptyAddBtn.onclick = function () { self.showAddHypothesisModal(projectId); };

      // New Question button
      var newRqBtn = container.querySelector('#apd-arg-btn-new-rq');
      if (newRqBtn) newRqBtn.onclick = function () { self.showAddQuestionModal(projectId); };

      // Delete Hypothesis
      var deleteHypBtns = container.querySelectorAll('[data-delete-hyp]');
      deleteHypBtns.forEach(function (btn) {
        btn.onclick = function () {
          var hId = decodeURIComponent(btn.getAttribute('data-delete-hyp'));
          if (window.confirm('Are you sure you want to delete this hypothesis?')) {
            self.hypotheses = self.hypotheses.filter(function (h) { return h.id !== hId; });
            ArgumentStore.saveHypotheses(projectId, self.hypotheses);
            self.render();
          }
        };
      });

      // Status Change
      var statusSelects = container.querySelectorAll('[data-hyp-status]');
      statusSelects.forEach(function (sel) {
        sel.onchange = function () {
          var hId = decodeURIComponent(sel.getAttribute('data-hyp-status'));
          var found = self.hypotheses.find(function (h) { return h.id === hId; });
          if (found) {
            found.status = sel.value;
            ArgumentStore.saveHypotheses(projectId, self.hypotheses);
          }
        };
      });

      // Link Claim
      var linkSelects = container.querySelectorAll('[data-link-claim-hyp]');
      linkSelects.forEach(function (sel) {
        sel.onchange = function () {
          var cId = sel.value;
          if (!cId) return;
          var hId = decodeURIComponent(sel.getAttribute('data-link-claim-hyp'));
          var found = self.hypotheses.find(function (h) { return h.id === hId; });
          if (found) {
            found.claim_ids = found.claim_ids || [];
            if (found.claim_ids.indexOf(cId) === -1) {
              found.claim_ids.push(cId);
              ArgumentStore.saveHypotheses(projectId, self.hypotheses);
              self.render();
            }
          }
        };
      });

      // Unlink Claim
      var unlinkBtns = container.querySelectorAll('[data-unlink-claim-hyp]');
      unlinkBtns.forEach(function (btn) {
        btn.onclick = function () {
          var hId = decodeURIComponent(btn.getAttribute('data-unlink-claim-hyp'));
          var cId = decodeURIComponent(btn.getAttribute('data-unlink-claim-id'));
          var found = self.hypotheses.find(function (h) { return h.id === hId; });
          if (found && found.claim_ids) {
            found.claim_ids = found.claim_ids.filter(function(id) { return id !== cId; });
            ArgumentStore.saveHypotheses(projectId, self.hypotheses);
            self.render();
          }
        };
      });

      // AI Devil's Advocate
      var aiBtns = container.querySelectorAll('[data-ai-counterarg]');
      aiBtns.forEach(function (btn) {
        btn.onclick = function () {
          var hId = decodeURIComponent(btn.getAttribute('data-ai-counterarg'));
          self.runAiCounterargument(hId, projectId);
        };
      });

      // Close AI Output box
      var closeAiBtns = container.querySelectorAll('[data-close-ai-box]');
      closeAiBtns.forEach(function (btn) {
        btn.onclick = function () {
          var boxId = btn.getAttribute('data-close-ai-box');
          var box = document.getElementById('apd-arg-ai-box-' + boxId);
          if (box) box.classList.add('hidden');
        };
      });

      // Export to Thesis Studio
      var exportThesisBtns = container.querySelectorAll('[data-export-thesis-hyp]');
      exportThesisBtns.forEach(function (btn) {
        btn.onclick = function () {
          var hId = decodeURIComponent(btn.getAttribute('data-export-thesis-hyp'));
          self.showExportToThesisModal(hId, projectId);
        };
      });
    },

    showAddHypothesisModal: function (projectId) {
      var self = this;
      var existing = document.getElementById('apd-arg-modal-overlay');
      if (existing) existing.remove();

      var overlay = document.createElement('div');
      overlay.id = 'apd-arg-modal-overlay';
      overlay.className = 'apd-arg-modal-overlay';

      overlay.innerHTML = `
        <div class="apd-arg-modal-card p-6 space-y-4">
          <div class="flex items-start justify-between pb-3 border-b border-border">
            <div class="flex items-center gap-2.5">
              <span class="p-2 rounded-lg bg-primary/10 border border-primary/20 text-primary">${APD_ICONS.workflow}</span>
              <div>
                <h2 class="text-base font-bold font-display text-foreground">Add Working Hypothesis</h2>
                <p class="text-xs text-muted-foreground">Formulate a testable thesis claim for your dissertation</p>
              </div>
            </div>
            <button id="apd-arg-modal-close" class="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-muted transition-colors">
              ${APD_ICONS.x}
            </button>
          </div>

          <div class="space-y-3">
            <div>
              <label for="apd-arg-modal-text" class="block text-xs font-semibold text-foreground mb-1.5">
                Hypothesis Statement *
              </label>
              <textarea 
                id="apd-arg-modal-text" 
                rows="3" 
                placeholder="e.g. City IV was destroyed c. 1400 BCE during Late Bronze I, corroborated by continuous domestic storage jar assemblages..." 
                class="w-full p-2.5 rounded-lg border border-border bg-card text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-medium transition-all"
              ></textarea>
            </div>

            <div>
              <label for="apd-arg-modal-rq" class="block text-xs font-semibold text-foreground mb-1.5">
                Linked Research Question (Optional)
              </label>
              <select id="apd-arg-modal-rq" class="w-full h-9 px-2.5 rounded-md border border-border bg-card text-xs text-foreground outline-none cursor-pointer">
                <option value="">No linked question</option>
                ${this.questions.map(function(q) {
                  return `<option value="${q.id}">${q.question}</option>`;
                }).join('')}
              </select>
            </div>

            <div id="apd-arg-modal-error" class="hidden text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-2.5 py-1.5 font-medium"></div>
          </div>

          <div class="flex items-center justify-end gap-2 pt-3 border-t border-border">
            <button id="apd-arg-modal-cancel" type="button" class="px-3.5 py-1.5 rounded-lg border border-border bg-card text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-all">
              Cancel
            </button>
            <button id="apd-arg-modal-submit" type="button" class="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-all shadow-sm">
              ${APD_ICONS.plus} Save Hypothesis
            </button>
          </div>
        </div>
      `;

      document.body.appendChild(overlay);

      var textarea = overlay.querySelector('#apd-arg-modal-text');
      var rqSelect = overlay.querySelector('#apd-arg-modal-rq');
      var errEl = overlay.querySelector('#apd-arg-modal-error');
      var closeBtn = overlay.querySelector('#apd-arg-modal-close');
      var cancelBtn = overlay.querySelector('#apd-arg-modal-cancel');
      var submitBtn = overlay.querySelector('#apd-arg-modal-submit');

      function closeModal() { overlay.remove(); }

      function submit() {
        var text = (textarea.value || '').trim();
        if (!text) {
          errEl.textContent = 'Please enter a hypothesis statement.';
          errEl.classList.remove('hidden');
          textarea.focus();
          return;
        }

        var newHyp = {
          id: 'hyp_' + Date.now(),
          project_id: projectId,
          research_question_id: rqSelect.value || undefined,
          text: text,
          status: 'unresolved',
          claim_ids: []
        };

        self.hypotheses.unshift(newHyp);
        ArgumentStore.saveHypotheses(projectId, self.hypotheses);
        closeModal();
        self.render();
      }

      closeBtn.onclick = closeModal;
      cancelBtn.onclick = closeModal;
      submitBtn.onclick = submit;
      overlay.onclick = function (e) { if (e.target === overlay) closeModal(); };

      setTimeout(function () { textarea.focus(); }, 50);
    },

    showAddQuestionModal: function (projectId) {
      var self = this;
      var existing = document.getElementById('apd-arg-modal-overlay');
      if (existing) existing.remove();

      var overlay = document.createElement('div');
      overlay.id = 'apd-arg-modal-overlay';
      overlay.className = 'apd-arg-modal-overlay';

      overlay.innerHTML = `
        <div class="apd-arg-modal-card p-6 space-y-4">
          <div class="flex items-start justify-between pb-3 border-b border-border">
            <div class="flex items-center gap-2.5">
              <span class="p-2 rounded-lg bg-primary/10 border border-primary/20 text-primary">${APD_ICONS.helpCircle}</span>
              <div>
                <h2 class="text-base font-bold font-display text-foreground">Add Research Question</h2>
                <p class="text-xs text-muted-foreground">Define an overarching doctoral inquiry for your thesis</p>
              </div>
            </div>
            <button id="apd-arg-modal-close" class="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-muted transition-colors">
              ${APD_ICONS.x}
            </button>
          </div>

          <div class="space-y-3">
            <div>
              <label for="apd-arg-modal-q-text" class="block text-xs font-semibold text-foreground mb-1.5">
                Research Question *
              </label>
              <input 
                id="apd-arg-modal-q-text" 
                type="text" 
                placeholder="e.g. How does stratigraphic conflagration correlate with typo-chronology at Tell es-Sultan?" 
                class="w-full h-9 px-3 rounded-lg border border-border bg-card text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-medium transition-all" 
              />
            </div>
            <div id="apd-arg-modal-q-error" class="hidden text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-2.5 py-1.5 font-medium"></div>
          </div>

          <div class="flex items-center justify-end gap-2 pt-3 border-t border-border">
            <button id="apd-arg-modal-cancel" type="button" class="px-3.5 py-1.5 rounded-lg border border-border bg-card text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-all">
              Cancel
            </button>
            <button id="apd-arg-modal-submit" type="button" class="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-all shadow-sm">
              ${APD_ICONS.plus} Save Question
            </button>
          </div>
        </div>
      `;

      document.body.appendChild(overlay);

      var input = overlay.querySelector('#apd-arg-modal-q-text');
      var errEl = overlay.querySelector('#apd-arg-modal-q-error');
      var closeBtn = overlay.querySelector('#apd-arg-modal-close');
      var cancelBtn = overlay.querySelector('#apd-arg-modal-cancel');
      var submitBtn = overlay.querySelector('#apd-arg-modal-submit');

      function closeModal() { overlay.remove(); }

      function submit() {
        var text = (input.value || '').trim();
        if (!text) {
          errEl.textContent = 'Please enter a research question.';
          errEl.classList.remove('hidden');
          input.focus();
          return;
        }

        var newQ = {
          id: 'rq_' + Date.now(),
          project_id: projectId,
          question: text
        };

        self.questions.push(newQ);
        ArgumentStore.saveQuestions(projectId, self.questions);
        closeModal();
        self.render();
      }

      closeBtn.onclick = closeModal;
      cancelBtn.onclick = closeModal;
      submitBtn.onclick = submit;
      overlay.onclick = function (e) { if (e.target === overlay) closeModal(); };

      setTimeout(function () { input.focus(); }, 50);
    },

    showExportToThesisModal: function (hId, projectId) {
      var self = this;
      var hyp = this.hypotheses.find(function (h) { return h.id === hId; });
      if (!hyp) return;

      var existing = document.getElementById('apd-arg-modal-overlay');
      if (existing) existing.remove();

      var chapters = [];
      try {
        var rawCh = localStorage.getItem('archaeophd_thesis_chapters_' + projectId);
        if (rawCh) chapters = JSON.parse(rawCh);
      } catch(e) {}
      if (!Array.isArray(chapters) || chapters.length === 0) {
        chapters = ['Introduction', 'Literature Review', 'Methodology', 'Chapter 1', 'Discussion', 'Conclusion'];
      }

      var overlay = document.createElement('div');
      overlay.id = 'apd-arg-modal-overlay';
      overlay.className = 'apd-arg-modal-overlay';

      overlay.innerHTML = `
        <div class="apd-arg-modal-card p-6 space-y-4">
          <div class="flex items-start justify-between pb-3 border-b border-border">
            <div class="flex items-center gap-2.5">
              <span class="p-2 rounded-lg bg-primary/10 border border-primary/20 text-primary">${APD_ICONS.bookOpen}</span>
              <div>
                <h2 class="text-base font-bold font-display text-foreground">Insert Argument into Thesis</h2>
                <p class="text-xs text-muted-foreground">Directly inject structured dialectic outline into your dissertation draft</p>
              </div>
            </div>
            <button id="apd-arg-modal-close" class="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-muted transition-colors">
              ${APD_ICONS.x}
            </button>
          </div>

          <div class="space-y-3">
            <div class="p-3 rounded-lg bg-muted/40 border border-border text-xs space-y-1">
              <div class="font-bold text-foreground">Hypothesis to Insert:</div>
              <div class="text-muted-foreground font-serif italic">"${hyp.text}"</div>
            </div>

            <div>
              <label for="apd-arg-target-chapter" class="block text-xs font-semibold text-foreground mb-1.5">
                Target Thesis Chapter
              </label>
              <select id="apd-arg-target-chapter" class="w-full h-9 px-2.5 rounded-md border border-border bg-card text-xs text-foreground outline-none cursor-pointer">
                ${chapters.map(function(c) {
                  return `<option value="${c}">${c}</option>`;
                }).join('')}
              </select>
            </div>
          </div>

          <div class="flex items-center justify-between gap-2 pt-3 border-t border-border">
            <button id="apd-arg-modal-cancel" type="button" class="px-3.5 py-1.5 rounded-lg border border-border bg-card text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-all">
              Cancel
            </button>
            <button id="apd-arg-confirm-insert" type="button" class="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-all shadow-sm">
              ${APD_ICONS.fileText} Inject into Canvas
            </button>
          </div>
        </div>
      `;

      document.body.appendChild(overlay);

      var select = overlay.querySelector('#apd-arg-target-chapter');
      var closeBtn = overlay.querySelector('#apd-arg-modal-close');
      var cancelBtn = overlay.querySelector('#apd-arg-modal-cancel');
      var insertBtn = overlay.querySelector('#apd-arg-confirm-insert');

      function closeModal() { overlay.remove(); }

      insertBtn.onclick = function () {
        var targetCh = select.value;
        if (!targetCh) return;

        // Construct formatted dialectic markdown/HTML
        var linkedClaims = (self.claims || []).filter(function (c) {
          return (hyp.claim_ids || []).indexOf(c.id) !== -1;
        });

        var supportClaims = linkedClaims.filter(function (c) {
          return !(self.evidence || []).some(function (ev) {
            return ev.claim_id === c.id && ev.evidence_type === 'contradicting';
          });
        });

        var contradictClaims = linkedClaims.filter(function (c) {
          return (self.evidence || []).some(function (ev) {
            return ev.claim_id === c.id && ev.evidence_type === 'contradicting';
          });
        });

        var injectedBlock = `
          <hr/>
          <h2>Argument Dialectic: ${hyp.text}</h2>
          <p><strong>Thesis Statement / Working Hypothesis:</strong> <em>“${hyp.text}”</em> (Status: ${hyp.status.toUpperCase()})</p>
          
          <h3>Empirical Corroboration & Supporting Claims</h3>
          ${supportClaims.length === 0 ? '<p><em>No supporting claims compiled yet.</em></p>' : `
            <ul>
              ${supportClaims.map(function(sc) {
                var ev = (self.evidence || []).filter(function(e) { return e.claim_id === sc.id; });
                var evText = ev.map(function(e) { return e.evidence_text; }).join('; ');
                return `<li><strong>Claim:</strong> ${sc.claim_text}${evText ? ` — <em>Evidence: ${evText}</em>` : ''}</li>`;
              }).join('')}
            </ul>
          `}

          <h3>Viva Voce Counterarguments & Competing Theories</h3>
          ${contradictClaims.length === 0 ? '<p><em>No contradictory counterarguments registered.</em></p>' : `
            <ul>
              ${contradictClaims.map(function(cc) {
                var ev = (self.evidence || []).filter(function(e) { return e.claim_id === cc.id; });
                var evText = ev.map(function(e) { return e.evidence_text; }).join('; ');
                return `<li><strong>Counter-Interpretation:</strong> ${cc.claim_text}${evText ? ` — <em>Rival Citation: ${evText}</em>` : ''}</li>`;
              }).join('')}
            </ul>
          `}
          <p><strong>Examiner Defense Footnote:</strong> Further empirical soundings and calibrated chronometric envelopes are required to reconcile competing typological assertions.</p>
        `;

        var storageKey = 'archaeophd_thesis_draft_' + projectId + '_' + encodeURIComponent(targetCh);
        var existingDraft = localStorage.getItem(storageKey) || `<h1>${targetCh}</h1><p>Begin drafting...</p>`;
        localStorage.setItem(storageKey, existingDraft + '\n' + injectedBlock);

        closeModal();
        if (window.confirm('Argument successfully injected into "' + targetCh + '"! Would you like to open the Thesis Studio now?')) {
          window.location.pathname = '/thesis';
        }
      };

      closeBtn.onclick = closeModal;
      cancelBtn.onclick = closeModal;
      overlay.onclick = function (e) { if (e.target === overlay) closeModal(); };
    },

    runAiCounterargument: async function (hId, projectId) {
      var hyp = this.hypotheses.find(function (h) { return h.id === hId; });
      if (!hyp) return;

      var safeId = hId.replace(/[^a-zA-Z0-9_-]/g, '_');
      var box = document.getElementById('apd-arg-ai-box-' + safeId);
      if (!box) return;

      var contentEl = box.querySelector('.apd-arg-ai-content');
      box.classList.remove('hidden');
      if (contentEl) contentEl.innerText = 'Consulting local offline neural model (Qwen 2.5 7B) across ingested excavation monographs...';

      var librarySources = (this.sources || []).slice(0, 15).map(function (s) {
        return '"' + s.title + '" by ' + (s.author || 'Author') + ' (' + (s.year || 'n.d.') + ')';
      });

      var promptText = 
        "You are ArchaeoPhD AI, an expert archaeological research librarian and viva voce doctoral examiner.\n" +
        "Examine the following thesis hypothesis against the researcher's ingested monograph library:\n\n" +
        "WORKING HYPOTHESIS:\n\"" + hyp.text + "\"\n\n" +
        "INGESTED PROJECT MONOGRAPHS:\n" + (librarySources.join('\n') || 'None recorded') + "\n\n" +
        "TASK:\n" +
        "1. Identify how a rival scholar or external viva examiner could challenge or dispute this hypothesis.\n" +
        "2. Cite any contradictory stratigraphy, rival ceramic dating, or chronometric disagreements present in academic literature.\n" +
        "3. Provide a defensible rebuttal caveat that the PhD candidate can include in their dissertation.";

      var resultText = "";
      try {
        var bridge = window.nativeBridge;
        if (bridge && typeof bridge.call === 'function') {
          var res = await bridge.call('invoke_llm', { prompt: promptText }, projectId);
          resultText = (res && res.answer) ? res.answer : (typeof res === 'string' ? res : JSON.stringify(res, null, 2));
        } else {
          resultText = "Native bridge not initialized.";
        }
      } catch(err) {
        resultText = "Error during neural synthesis: " + err.message;
      }

      if (contentEl) contentEl.innerText = resultText;
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { ArgumentStudio.init(); });
  } else {
    ArgumentStudio.init();
  }

  window.archaeophdArgument = ArgumentStudio;

})();

