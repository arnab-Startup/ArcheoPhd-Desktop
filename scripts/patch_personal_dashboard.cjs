const fs = require('fs');
const path = require('path');

const targetFile = path.resolve(__dirname, '../dist/assets/Dashboard-W5Q9sdSC.js');
let code = fs.readFileSync(targetFile, 'utf8');

const sStr = 'if (!isProject) {';
const sIdx = code.indexOf(sStr);
if (sIdx === -1) {
  console.error('Cannot find if (!isProject) {');
  process.exit(1);
}

const eStr = '// ===========================================================================\n  // UNIVERSAL ARCHAEOLOGICAL PROJECT WORKSPACE';
let eIdx = code.indexOf(eStr);
if (eIdx === -1) {
  // Try alternative marker
  const alt = '// Project Workstation Header with Back to Personal Dashboard Button';
  eIdx = code.indexOf(alt);
}
if (eIdx === -1) {
  console.error('Cannot find end of personal dashboard section');
  process.exit(1);
}

console.log('Replacing personal dashboard section from', sIdx, 'to', eIdx);

const replacement = `if (!isProject) {
    const researcherName = (a && a.full_name) ? a.full_name : "Lead Researcher";
    const nonDefaultProjects = (i || []).filter(p => p.id && p.id !== "default" && p.id !== "null");

    const enterProject = (projId, targetRoute = "/dashboard") => {
      try { localStorage.setItem("archaeo_active_project", projId); } catch(err) {}
      if (typeof o === "function") o(projId);
      if (typeof h === "function") h(targetRoute);
    };

    return e.jsxs("div", {className: "space-y-8 animate-fade-in", children: [
      // 1. Academic Identity & Command Header
      e.jsxs("div", {className: "rounded-2xl border border-border bg-card p-6 md:p-8 shadow-xs relative overflow-hidden", children: [
        e.jsxs("div", {className: "relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6", children: [
          e.jsxs("div", {className: "space-y-1.5", children: [
            e.jsxs("div", {className: "flex items-center gap-2", children: [
              e.jsx("span", {className: "inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-700 tracking-wider uppercase bg-primary/10 text-primary border border-primary/20", children: "Scholar Research Home"}),
              e.jsxs("span", {className: "inline-flex items-center gap-1 text-[11px] font-500 text-muted-foreground", children: [
                e.jsx("span", {className: "w-2 h-2 rounded-full bg-emerald-500 inline-block"}),
                "Offline Local Vault Active"
              ]})
            ]}),
            e.jsx("h1", {className: "font-display text-2xl md:text-3xl font-700 text-foreground tracking-tight", children: researcherName + " — Personal Dashboard"}),
            e.jsx("p", {className: "text-sm text-muted-foreground max-w-2xl", children: "Academic research portfolio, doctoral writing studio, and cross-project excavation management."})
          ]}),
          e.jsxs("div", {className: "flex flex-wrap items-center gap-2.5 shrink-0", children: [
            e.jsxs(r, {to: "/projects/new", className: "inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-xs font-600 hover:bg-primary/90 transition-all shadow-xs cursor-pointer", children: [
              e.jsx(B, {className: "w-4 h-4"}),
              "New Research Project"
            ]}),
            e.jsxs(r, {to: "/thesis", className: "inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-border bg-background hover:bg-muted text-xs font-500 text-foreground transition-all shadow-xs", children: [
              e.jsx(ee, {className: "w-4 h-4 text-accent"}),
              "Thesis Studio"
            ]}),
            e.jsxs(r, {to: "/ai-research", className: "inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-border bg-background hover:bg-muted text-xs font-500 text-foreground transition-all shadow-xs", children: [
              e.jsx(d, {className: "w-4 h-4 text-primary"}),
              "AI Literature Assistant"
            ]})
          ]})
        ]})
      ]}),

      // 2. High-Level Research Metrics (Portfolio Scope)
      e.jsxs("div", {className: "grid grid-cols-2 lg:grid-cols-4 gap-4", children: [
        e.jsxs(r, {to: "/projects", className: "group rounded-xl border border-border bg-card p-5 hover:border-primary/40 transition-all shadow-2xs block", children: [
          e.jsxs("div", {className: "flex items-center justify-between text-muted-foreground mb-2", children: [
            e.jsx("span", {className: "text-xs font-600 uppercase tracking-wider", children: "Field Projects"}),
            e.jsx(P, {className: "w-4 h-4 text-primary group-hover:scale-110 transition-transform"})
          ]}),
          e.jsx("div", {className: "text-2xl font-700 text-foreground", children: nonDefaultProjects.length}),
          e.jsx("div", {className: "text-[11px] text-muted-foreground mt-1 flex items-center gap-1", children: [
            "Excavations & Surveys",
            e.jsx(S, {className: "w-3 h-3 text-primary opacity-0 group-hover:opacity-100 transition-opacity"})
          ]})
        ]}),
        e.jsxs(r, {to: "/library", className: "group rounded-xl border border-border bg-card p-5 hover:border-primary/40 transition-all shadow-2xs block", children: [
          e.jsxs("div", {className: "flex items-center justify-between text-muted-foreground mb-2", children: [
            e.jsx("span", {className: "text-xs font-600 uppercase tracking-wider", children: "Monographs"}),
            e.jsx(R, {className: "w-4 h-4 text-accent group-hover:scale-110 transition-transform"})
          ]}),
          e.jsx("div", {className: "text-2xl font-700 text-foreground", children: g.length}),
          e.jsx("div", {className: "text-[11px] text-muted-foreground mt-1 flex items-center gap-1", children: [
            "Catalogued Volumes & PDFs",
            e.jsx(S, {className: "w-3 h-3 text-accent opacity-0 group-hover:opacity-100 transition-opacity"})
          ]})
        ]}),
        e.jsxs(r, {to: "/thesis", className: "group rounded-xl border border-border bg-card p-5 hover:border-primary/40 transition-all shadow-2xs block", children: [
          e.jsxs("div", {className: "flex items-center justify-between text-muted-foreground mb-2", children: [
            e.jsx("span", {className: "text-xs font-600 uppercase tracking-wider", children: "Thesis Studio"}),
            e.jsx(ee, {className: "w-4 h-4 text-chart-2 group-hover:scale-110 transition-transform"})
          ]}),
          e.jsx("div", {className: "text-2xl font-700 text-foreground", children: "Writing Mode"}),
          e.jsx("div", {className: "text-[11px] text-muted-foreground mt-1 flex items-center gap-1", children: [
            "Dialectic Arguments & Drafts",
            e.jsx(S, {className: "w-3 h-3 text-chart-2 opacity-0 group-hover:opacity-100 transition-opacity"})
          ]})
        ]}),
        e.jsxs(r, {to: "/notes", className: "group rounded-xl border border-border bg-card p-5 hover:border-primary/40 transition-all shadow-2xs block", children: [
          e.jsxs("div", {className: "flex items-center justify-between text-muted-foreground mb-2", children: [
            e.jsx("span", {className: "text-xs font-600 uppercase tracking-wider", children: "Scholar Notes"}),
            e.jsx(C, {className: "w-4 h-4 text-chart-5 group-hover:scale-110 transition-transform"})
          ]}),
          e.jsx("div", {className: "text-2xl font-700 text-foreground", children: $.length}),
          e.jsx("div", {className: "text-[11px] text-muted-foreground mt-1 flex items-center gap-1", children: [
            "Fieldnotes & Working Ideas",
            e.jsx(S, {className: "w-3 h-3 text-chart-5 opacity-0 group-hover:opacity-100 transition-opacity"})
          ]})
        ]})
      ]}),

      // 3. Fieldwork & Research Projects (The Primary Workspaces)
      e.jsxs("div", {className: "rounded-2xl border border-border bg-card p-6 md:p-7 shadow-xs", children: [
        e.jsxs("div", {className: "flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 border-b border-border pb-4", children: [
          e.jsxs("div", {children: [
            e.jsx("h2", {className: "font-display text-lg font-600 text-foreground", children: "Excavation & Research Projects"}),
            e.jsx("p", {className: "text-xs text-muted-foreground mt-0.5", children: "Each excavation or survey maintains its own isolated trench units, Harris Matrix, finds registry, and evidence graph."})
          ]}),
          e.jsxs(r, {to: "/projects", className: "text-xs font-600 text-primary hover:underline inline-flex items-center gap-1.5 self-start sm:self-auto", children: [
            "All Projects Directory",
            e.jsx(S, {className: "w-3.5 h-3.5"})
          ]})
        ]}),

        nonDefaultProjects.length === 0 ? e.jsxs("div", {className: "py-12 px-4 rounded-xl border border-dashed border-border text-center max-w-md mx-auto", children: [
          e.jsx("div", {className: "w-12 h-12 rounded-2xl bg-primary/10 text-primary grid place-items-center mx-auto mb-3", children: e.jsx(P, {className: "w-6 h-6"})}),
          e.jsx("h3", {className: "font-display text-base font-600 text-foreground", children: "No research projects catalogued yet"}),
          e.jsx("p", {className: "text-xs text-muted-foreground mt-1 leading-relaxed", children: "Create an excavation or survey project workspace to begin recording trench units, artifact assemblages, and stratigraphic matrices."}),
          e.jsxs(r, {to: "/projects/new", className: "inline-flex items-center gap-1.5 mt-4 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-600 hover:bg-primary/90 transition-all cursor-pointer shadow-xs", children: [
            e.jsx(B, {className: "w-3.5 h-3.5"}),
            "Create First Project"
          ]})
        ]}) : e.jsx("div", {className: "grid md:grid-cols-2 gap-5", children: nonDefaultProjects.map(proj => {
          return e.jsxs("div", {key: proj.id, className: "rounded-xl border border-border bg-muted/15 p-5 hover:border-primary/40 hover:bg-muted/25 transition-all flex flex-col justify-between group", children: [
            e.jsxs("div", {className: "space-y-2.5", children: [
              e.jsxs("div", {className: "flex items-center justify-between gap-2", children: [
                proj.is_demo ? e.jsx("span", {className: "inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-700 tracking-wider uppercase bg-accent/15 text-accent", children: [
                  e.jsx(A, {className: "w-3 h-3"}),
                  "Benchmark Dataset"
                ]}) : e.jsx("span", {className: "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-700 tracking-wider uppercase bg-primary/10 text-primary font-mono", children: "Active Workspace"}),
                e.jsx("span", {className: "text-[11px] font-mono text-muted-foreground", children: proj.research_period || "Multi-Period"})
              ]}),
              e.jsx("h3", {className: "font-display text-lg font-600 text-foreground leading-snug group-hover:text-primary transition-colors", children: proj.title}),
              proj.research_question ? e.jsx("p", {className: "text-xs text-muted-foreground line-clamp-2 leading-relaxed bg-background/50 p-2.5 rounded-lg border border-border/40", children: proj.research_question}) : null,
              e.jsxs("div", {className: "flex flex-wrap items-center gap-3 pt-1 text-xs text-muted-foreground", children: [
                proj.research_region ? e.jsxs("span", {className: "inline-flex items-center gap-1 font-500", children: [
                  e.jsx(J, {className: "w-3 h-3 text-primary"}),
                  proj.research_region
                ]}) : null,
                proj.supervisor ? e.jsxs("span", {className: "inline-flex items-center gap-1", children: [
                  "PI / Sup: ",
                  proj.supervisor
                ]}) : null
              ]})
            ]}),
            e.jsxs("div", {className: "flex items-center justify-between pt-4 mt-4 border-t border-border/80 gap-2", children: [
              e.jsxs("button", {
                type: "button",
                onClick: () => enterProject(proj.id, "/dashboard"),
                className: "inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-600 hover:bg-primary/90 transition-all shadow-xs cursor-pointer",
                children: [
                  "Open Project Workspace",
                  e.jsx(S, {className: "w-3 h-3"})
                ]
              }),
              e.jsxs("button", {
                type: "button",
                onClick: () => enterProject(proj.id, "/evidence-graph"),
                className: "text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1",
                children: [
                  e.jsx(I, {className: "w-3 h-3 text-accent"}),
                  "Evidence Graph"
                ]
              })
            ]})
          ]});
        })})
      ]}),

      // 4. Scholarly Core Workstations (Thesis Studio + AI Literature Assistant)
      e.jsxs("div", {className: "grid lg:grid-cols-2 gap-6", children: [
        // Thesis Studio Command Card
        e.jsxs("div", {className: "rounded-2xl border border-border bg-card p-6 shadow-xs flex flex-col justify-between", children: [
          e.jsxs("div", {children: [
            e.jsxs("div", {className: "flex items-center justify-between mb-3 border-b border-border pb-3", children: [
              e.jsxs("div", {className: "flex items-center gap-2.5", children: [
                e.jsx("div", {className: "w-8 h-8 rounded-lg bg-accent/15 text-accent grid place-items-center", children: e.jsx(ee, {className: "w-4 h-4"})}),
                e.jsx("h2", {className: "font-display text-base font-600 text-foreground", children: "Doctoral Thesis Studio"})
              ]}),
              e.jsx("span", {className: "text-[10px] font-600 uppercase tracking-wider text-muted-foreground bg-muted px-2 py-0.5 rounded", children: "Drafting Studio"})
            ]}),
            e.jsx("p", {className: "text-xs text-muted-foreground leading-relaxed", children: "Structured thesis drafting with dialectic argument mapping, viva defensibility audits, and primary evidence citations."}),
            e.jsxs("div", {className: "mt-4 space-y-2", children: [
              e.jsxs("div", {className: "flex items-center justify-between text-xs p-2.5 rounded-lg bg-muted/30 border border-border/40", children: [
                e.jsx("span", {className: "font-500 text-foreground", children: "Dialectic Argument Builder"}),
                e.jsx("span", {className: "text-[11px] text-muted-foreground", children: "Hypothesis vs Counter-Claims"})
              ]}),
              e.jsxs("div", {className: "flex items-center justify-between text-xs p-2.5 rounded-lg bg-muted/30 border border-border/40", children: [
                e.jsx("span", {className: "font-500 text-foreground", children: "Citation Formatting"}),
                e.jsx("span", {className: "text-[11px] text-muted-foreground", children: "Chicago 17th / APA / Harvard"})
              ]})
            ]})
          ]}),
          e.jsx("div", {className: "pt-4 mt-4 border-t border-border", children: [
            e.jsxs(r, {to: "/thesis", className: "inline-flex items-center justify-center gap-2 w-full py-2 rounded-lg bg-muted hover:bg-muted/80 text-foreground text-xs font-600 transition-colors border border-border", children: [
              "Continue Thesis Drafting",
              e.jsx(S, {className: "w-3.5 h-3.5"})
            ]})
          ]})
        ]}),

        // AI Literature Research Assistant Card
        e.jsxs("div", {className: "rounded-2xl border border-border bg-card p-6 shadow-xs flex flex-col justify-between", children: [
          e.jsxs("div", {children: [
            e.jsxs("div", {className: "flex items-center justify-between mb-3 border-b border-border pb-3", children: [
              e.jsxs("div", {className: "flex items-center gap-2.5", children: [
                e.jsx("div", {className: "w-8 h-8 rounded-lg bg-primary/10 text-primary grid place-items-center", children: e.jsx(d, {className: "w-4 h-4"})}),
                e.jsx("h2", {className: "font-display text-base font-600 text-foreground", children: "AI Literature Assistant"})
              ]}),
              e.jsx("span", {className: "text-[10px] font-600 uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded", children: "Local Qwen 2.5 7B"})
            ]}),
            e.jsx("p", {className: "text-xs text-muted-foreground leading-relaxed", children: "Query across your catalogued monographs and excavation reports with verifiable citations and zero cloud data transmission."}),
            e.jsxs("div", {className: "mt-4 space-y-2", children: [
              e.jsxs(r, {to: "/ai-research?prompt=Synthesize+regional+settlement+patterns+and+chronological+horizons", className: "flex items-center justify-between text-xs p-2.5 rounded-lg bg-muted/30 hover:bg-muted/60 border border-border/40 transition-colors block text-foreground group", children: [
                e.jsx("span", {className: "truncate font-500", children: "Synthesize regional settlement patterns & horizons"}),
                e.jsx(S, {className: "w-3 h-3 text-primary opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2"})
              ]}),
              e.jsxs(r, {to: "/ai-research?prompt=Identify+contradictions+between+excavation+reports+and+pottery+typologies", className: "flex items-center justify-between text-xs p-2.5 rounded-lg bg-muted/30 hover:bg-muted/60 border border-border/40 transition-colors block text-foreground group", children: [
                e.jsx("span", {className: "truncate font-500", children: "Identify contradictions in stratigraphic reports"}),
                e.jsx(S, {className: "w-3 h-3 text-primary opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2"})
              ]})
            ]})
          ]}),
          e.jsx("div", {className: "pt-4 mt-4 border-t border-border", children: [
            e.jsxs(r, {to: "/ai-research", className: "inline-flex items-center justify-center gap-2 w-full py-2 rounded-lg bg-muted hover:bg-muted/80 text-foreground text-xs font-600 transition-colors border border-border", children: [
              "Launch AI Literature Assistant",
              e.jsx(S, {className: "w-3.5 h-3.5"})
            ]})
          ]})
        ]})
      ]}),

      // 5. Scholarly Archive (Recent Monographs & Fieldnotes)
      e.jsxs("div", {className: "grid lg:grid-cols-2 gap-6", children: [
        e.jsxs("div", {className: "rounded-2xl border border-border bg-card p-6 shadow-xs", children: [
          e.jsxs("div", {className: "flex items-center justify-between mb-4 border-b border-border pb-3", children: [
            e.jsxs("div", {className: "flex items-center gap-2", children: [
              e.jsx(R, {className: "w-4 h-4 text-accent"}),
              e.jsx("h2", {className: "font-display text-base font-600 text-foreground", children: "Primary Sources & Monographs"})
            ]}),
            e.jsx(r, {to: "/library", className: "text-xs font-600 text-primary hover:underline", children: "View All (" + g.length + ")"})
          ]}),
          g.length === 0 ? e.jsxs("div", {className: "py-8 text-center", children: [
            e.jsx(R, {className: "w-8 h-8 text-muted-foreground/30 mx-auto mb-2"}),
            e.jsx("p", {className: "text-xs text-muted-foreground", children: "No primary monographs catalogued yet."}),
            e.jsxs(r, {to: "/library", className: "inline-flex items-center gap-1 text-xs font-600 text-primary hover:underline mt-2", children: [
              "Upload Excavation Report or PDF",
              e.jsx(S, {className: "w-3 h-3"})
            ]})
          ]}) : e.jsx("div", {className: "space-y-2", children: g.slice(0, 4).map(s => {
            return e.jsxs(r, {key: s.id, to: "/library/" + s.id, className: "flex items-center justify-between group rounded-lg p-2.5 hover:bg-muted/40 transition-colors border border-transparent hover:border-border/60", children: [
              e.jsxs("div", {className: "min-w-0 pr-3", children: [
                e.jsx("div", {className: "text-xs font-600 text-foreground group-hover:text-primary truncate", children: s.title}),
                e.jsxs("div", {className: "text-[11px] text-muted-foreground truncate mt-0.5", children: [
                  s.author || "Archaeological Survey",
                  s.year ? " · " + s.year : ""
                ]})
              ]}),
              e.jsx(S, {className: "w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0"})
            ]});
          })})
        ]}),
        e.jsxs("div", {className: "rounded-2xl border border-border bg-card p-6 shadow-xs", children: [
          e.jsxs("div", {className: "flex items-center justify-between mb-4 border-b border-border pb-3", children: [
            e.jsxs("div", {className: "flex items-center gap-2", children: [
              e.jsx(C, {className: "w-4 h-4 text-chart-5"}),
              e.jsx("h2", {className: "font-display text-base font-600 text-foreground", children: "Scholar Fieldnotes & Working Ideas"})
            ]}),
            e.jsx(r, {to: "/notes", className: "text-xs font-600 text-primary hover:underline", children: "View All (" + $.length + ")"})
          ]}),
          $.length === 0 ? e.jsxs("div", {className: "py-8 text-center", children: [
            e.jsx(C, {className: "w-8 h-8 text-muted-foreground/30 mx-auto mb-2"}),
            e.jsx("p", {className: "text-xs text-muted-foreground", children: "No scholar fieldnotes recorded yet."}),
            e.jsxs(r, {to: "/notes", className: "inline-flex items-center gap-1 text-xs font-600 text-primary hover:underline mt-2", children: [
              "Record First Note or Hypothesis",
              e.jsx(S, {className: "w-3 h-3"})
            ]})
          ]}) : e.jsx("div", {className: "space-y-2", children: $.slice(0, 4).map(note => {
            return e.jsxs(r, {key: note.id, to: "/notes?focus=" + note.id, className: "flex items-center justify-between group rounded-lg p-2.5 hover:bg-muted/40 transition-colors border border-transparent hover:border-border/60", children: [
              e.jsxs("div", {className: "min-w-0 pr-3", children: [
                e.jsx("div", {className: "text-xs font-600 text-foreground group-hover:text-primary truncate", children: note.title || "Untitled Fieldnote"}),
                e.jsx("div", {className: "text-[11px] text-muted-foreground truncate mt-0.5", children: (note.content || "").replace(/<[^>]+>/g, "").slice(0, 85)})
              ]}),
              e.jsx(S, {className: "w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0"})
            ]});
          })})
        ]})
      ]})
    ]});
  }

  `;

code = code.slice(0, sIdx) + replacement + code.slice(eIdx);
fs.writeFileSync(targetFile, code, 'utf8');
console.log('[SUCCESS] Successfully applied senior-level Personal Dashboard to Dashboard-W5Q9sdSC.js!');
