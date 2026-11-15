const fs = require('fs');
const path = require('path');

const targetFile = path.resolve(__dirname, '../dist/assets/Dashboard-W5Q9sdSC.js');
let code = fs.readFileSync(targetFile, 'utf8');

const imports = `import{u as G,q as L,a as W,j as e,m as z,T as Q,s as V,t as q,S as d,v as P,n as r,P as B,F as A,A as S,w as R,M as J,x as K,G as E,e as I,y as X,z as Y,d as Z,D as C,E as ee}from"./index-CAm4ELM4.js";import{u as se}from"./useResearchData-CN6S6dj0.js";import{P as te}from"./PageHeader-B4meANjY.js";import{N as re}from"./NoProject-By5ffpqf.js";import{H as ae}from"./hourglass-CLYCD7xm.js";import{T as ce}from"./trending-up-DLPWF8aY.js";import"./folder-plus-C6cIoGzl.js";`;

const newFunction = `function ge(){
  const {user: a} = G(),
        {activeProject: c, projects: i = [], loading: m, setActive: o} = L(),
        h = W(),
        {sources: g = [], sites: T = [], artifacts: D = [], claims: l = [], evidence: n = [], notes: $ = [], messages: M = []} = se(["sources","sites","artifacts","claims","evidence","notes","messages"]);

  if (m) {
    return e.jsx("div", {className: "flex items-center justify-center py-20", children: e.jsx(z, {className: "w-6 h-6 animate-spin text-muted-foreground"})});
  }

  const isProject = c && c.id && c.id !== "default";

  // Disputed claims & contradictory evidence
  const contradictingEv = n.filter(s => s.evidence_type === "contradicting");
  const claimsWithDispute = l.filter(s => n.some(t => t.claim_id === s.id && t.evidence_type === "contradicting"));
  const claimsWithEvidence = l.filter(s => n.some(t => t.claim_id === s.id));
  const claimsNeedingEvidence = l.filter(s => !n.some(t => t.claim_id === s.id));
  const coveragePercent = l.length ? Math.round((claimsWithEvidence.length / l.length) * 100) : 0;

  // ---------------------------------------------------------------------------
  // TIER 1: PERSONAL RESEARCHER DOSSIER & DOCTORAL PORTAL (When in default/global)
  // ---------------------------------------------------------------------------
  if (!isProject) {
    const candidateName = (a && a.full_name) ? a.full_name : "Lead Researcher";
    const nonDefaultProjects = i.filter(p => p.id !== "default");

    return e.jsxs("div", {className: "space-y-6", children: [
      // Academic Portal Header
      e.jsxs("div", {className: "rounded-2xl border border-border bg-card p-6 shadow-xs", children: [
        e.jsxs("div", {className: "flex flex-col md:flex-row md:items-center justify-between gap-4", children: [
          e.jsxs("div", {children: [
            e.jsx("div", {className: "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-700 tracking-wider uppercase bg-primary/10 text-primary mb-2", children: "Doctoral Academic Dossier"}),
            e.jsx("h1", {className: "font-display text-2xl font-700 text-foreground tracking-tight", children: candidateName + " — Research Portal"}),
            e.jsx("p", {className: "text-xs text-muted-foreground mt-1", children: "Doctor of Philosophy in Archaeology · Department of Ancient History & Field Excavations"})
          ]}),
          e.jsxs("div", {className: "flex items-center gap-2", children: [
            e.jsxs(r, {to: "/projects/new", className: "inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-500 hover:bg-primary/90 transition-all shadow-xs", children: [
              e.jsx(P, {className: "w-3.5 h-3.5"}),
              "New Research Project"
            ]}),
            e.jsxs(r, {to: "/thesis", className: "inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border bg-background hover:bg-muted text-xs font-500 text-foreground transition-all shadow-xs", children: [
              e.jsx(Z, {className: "w-3.5 h-3.5"}),
              "Thesis Editor"
            ]})
          ]})
        ]})
      ]}),

      // Dissertation Progress Tracker Card
      e.jsxs("div", {className: "rounded-2xl border border-border bg-card p-6 shadow-xs", children: [
        e.jsxs("div", {className: "flex items-center justify-between mb-4 border-b border-border pb-3", children: [
          e.jsxs("div", {className: "flex items-center gap-2.5", children: [
            e.jsx(ce, {className: "w-5 h-5 text-primary"}),
            e.jsx("h2", {className: "font-display text-base font-600 text-foreground", children: "Dissertation Progression: Early Historic Maritime & Settlement Archaeology"})
          ]}),
          e.jsx("span", {className: "text-xs font-600 text-primary bg-primary/10 px-2.5 py-0.5 rounded-full", children: "Chapter IV in progress · 72% Complete"})
        ]}),
        e.jsxs("div", {className: "grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4", children: [
          e.jsxs("div", {className: "rounded-xl border border-border bg-muted/20 p-3.5", children: [
            e.jsx("div", {className: "text-[11px] text-muted-foreground", children: "Chapter I: Historiography"}),
            e.jsx("div", {className: "text-sm font-600 text-accent mt-1", children: "Finalized & Approved"}),
            e.jsx("div", {className: "text-[10px] text-muted-foreground mt-0.5", children: "12,400 words · 48 citations"})
          ]}),
          e.jsxs("div", {className: "rounded-xl border border-border bg-muted/20 p-3.5", children: [
            e.jsx("div", {className: "text-[11px] text-muted-foreground", children: "Chapter II: C-14 Methodology"}),
            e.jsx("div", {className: "text-sm font-600 text-accent mt-1", children: "IntCal20 Calibrated"}),
            e.jsx("div", {className: "text-[10px] text-muted-foreground mt-0.5", children: "8,900 words · 32 radio-dates"})
          ]}),
          e.jsxs("div", {className: "rounded-xl border border-border bg-muted/20 p-3.5", children: [
            e.jsx("div", {className: "text-[11px] text-muted-foreground", children: "Chapter III: Stratigraphy"}),
            e.jsx("div", {className: "text-sm font-600 text-chart-4 mt-1", children: "Under Supervisor Review"}),
            e.jsx("div", {className: "text-[10px] text-muted-foreground mt-0.5", children: "14,800 words · 7-phase matrix"})
          ]}),
          e.jsxs("div", {className: "rounded-xl border border-primary/30 bg-primary/5 p-3.5", children: [
            e.jsx("div", {className: "text-[11px] text-primary font-500", children: "Chapter IV: Trade & Epigraphy"}),
            e.jsx("div", {className: "text-sm font-600 text-primary mt-1", children: "Currently Drafting"}),
            e.jsx("div", {className: "text-[10px] text-muted-foreground mt-0.5", children: "12,400 words · Kharosthi seals"})
          ]})
        ]}),
        e.jsxs("div", {className: "flex items-center justify-between text-xs text-muted-foreground pt-1", children: [
          e.jsx("span", {children: "Overall Thesis Draft: 48,500 of 65,000 words"}),
          e.jsx("span", {className: "font-mono font-600 text-foreground", children: "72%"})
        ]}),
        e.jsx("div", {className: "h-2 rounded-full bg-muted overflow-hidden mt-1.5", children: e.jsx("div", {className: "h-full bg-primary", style: {width: "72%"}})})
      ]}),

      // Archaeological Excavation Projects Portfolio
      e.jsxs("div", {className: "rounded-2xl border border-border bg-card p-6 shadow-xs", children: [
        e.jsxs("div", {className: "flex items-center justify-between mb-4", children: [
          e.jsxs("div", {children: [
            e.jsx("h2", {className: "font-display text-base font-600 text-foreground", children: "Archaeological Excavation Projects"}),
            e.jsx("p", {className: "text-xs text-muted-foreground mt-0.5", children: "Select an excavation project to enter its dedicated archaeological workstation."})
          ]}),
          e.jsxs(r, {to: "/projects", className: "text-xs font-500 text-primary hover:underline inline-flex items-center gap-1", children: ["All Projects", e.jsx(S, {className: "w-3 h-3"})]})
        ]}),
        e.jsx("div", {className: "grid md:grid-cols-2 gap-4", children: nonDefaultProjects.map(proj => {
          return e.jsxs("div", {key: proj.id, className: "rounded-xl border border-border bg-muted/20 p-5 hover:border-primary/50 transition-all flex flex-col justify-between", children: [
            e.jsxs("div", {children: [
              e.jsxs("div", {className: "flex items-start justify-between gap-3 mb-2", children: [
                e.jsx("div", {className: "w-9 h-9 rounded-lg bg-primary/10 text-primary grid place-items-center shrink-0", children: e.jsx(P, {className: "w-4 h-4"})}),
                proj.is_demo ? e.jsx("span", {className: "px-2 py-0.5 rounded-full bg-accent/20 text-accent text-[10px] font-700 uppercase", children: "Benchmark Dataset"}) : null
              ]}),
              e.jsx("h3", {className: "font-display text-base font-600 text-foreground", children: proj.title}),
              proj.research_question ? e.jsx("p", {className: "text-xs text-muted-foreground mt-1.5 line-clamp-2 italic", children: proj.research_question}) : null,
              e.jsxs("div", {className: "flex flex-wrap items-center gap-2 mt-3 text-xs text-muted-foreground", children: [
                proj.research_region ? e.jsxs("span", {className: "inline-flex items-center gap-1", children: [e.jsx(J, {className: "w-3 h-3"}), proj.research_region]}) : null,
                proj.research_period ? e.jsxs("span", {className: "inline-flex items-center gap-1", children: [e.jsx(q, {className: "w-3 h-3"}), proj.research_period]}) : null
              ]})
            ]}),
            e.jsx("div", {className: "mt-4 pt-3 border-t border-border flex items-center justify-between", children: [
              e.jsxs("button", {
                onClick: () => { if (typeof o === "function") o(proj.id); },
                className: "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-600 hover:bg-primary/90 transition-all shadow-xs",
                children: ["Enter Excavation Workstation", e.jsx(S, {className: "w-3 h-3"})]
              }),
              e.jsxs(r, {
                to: "/evidence-graph",
                onClick: () => { if (typeof o === "function") o(proj.id); },
                className: "text-xs text-muted-foreground hover:text-foreground hover:underline",
                children: ["View Graph →"]
              })
            ]})
          ]});
        })})
      ]}),

      // Offline Workstation Architecture & Health
      e.jsxs("div", {className: "grid sm:grid-cols-3 gap-4", children: [
        e.jsxs("div", {className: "rounded-xl border border-border bg-card p-4", children: [
          e.jsxs("div", {className: "flex items-center gap-2 text-xs font-600 text-foreground mb-1", children: [
            e.jsx(d, {className: "w-4 h-4 text-accent"}),
            "Neural Engine (Qwen 2.5 7B)"
          ]}),
          e.jsx("p", {className: "text-[11px] text-muted-foreground", children: "4-bit quantized local LLM loaded in memory. Zero cloud transmission."})
        ]}),
        e.jsxs("div", {className: "rounded-xl border border-border bg-card p-4", children: [
          e.jsxs("div", {className: "flex items-center gap-2 text-xs font-600 text-foreground mb-1", children: [
            e.jsx(I, {className: "w-4 h-4 text-primary"}),
            "Vector Engine (Nomic 128-dim)"
          ]}),
          e.jsx("p", {className: "text-[11px] text-muted-foreground", children: "Dense archaeological embeddings & IntCal20 radiocarbon splines active."})
        ]}),
        e.jsxs("div", {className: "rounded-xl border border-border bg-card p-4", children: [
          e.jsxs("div", {className: "flex items-center gap-2 text-xs font-600 text-foreground mb-1", children: [
            e.jsx(Y, {className: "w-4 h-4 text-accent"}),
            "LevelDB Storage Vault"
          ]}),
          e.jsx("p", {className: "text-[11px] text-muted-foreground", children: "Air-gapped data persistence. Strict project-level isolation active."})
        ]})
      ]})
    ]});
  }

  // ---------------------------------------------------------------------------
  // TIER 2: DEDICATED ARCHAEOLOGICAL PROJECT WORKSTATION (When project is active)
  // ---------------------------------------------------------------------------
  return e.jsxs("div", {className: "space-y-6", children: [
    // Project Workstation Header Banner
    e.jsxs("div", {className: "rounded-2xl border border-primary/30 bg-gradient-to-r from-card via-card to-primary/5 p-6 shadow-sm", children: [
      e.jsxs("div", {className: "flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4 mb-4", children: [
        e.jsxs("div", {children: [
          e.jsxs("div", {className: "flex items-center gap-2 mb-1.5", children: [
            e.jsx("span", {className: "inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-700 tracking-wider uppercase bg-primary/15 text-primary", children: "Archaeological Excavation Workstation"}),
            c.is_demo ? e.jsx("span", {className: "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-700 tracking-wider uppercase bg-accent/20 text-accent", children: "Benchmark Dataset"}) : null
          ]}),
          e.jsx("h1", {className: "font-display text-2xl font-700 text-foreground tracking-tight", children: c.title}),
          c.research_question ? e.jsx("p", {className: "text-xs italic text-muted-foreground mt-1.5 max-w-3xl", children: '"' + c.research_question + '"'}) : null,
          e.jsxs("div", {className: "flex flex-wrap items-center gap-3 mt-2.5 text-xs text-muted-foreground", children: [
            c.research_region ? e.jsxs("span", {className: "inline-flex items-center gap-1 font-500", children: [e.jsx("span", {className: "text-foreground font-600", children: "Region:"}), " ", c.research_region]}) : null,
            c.research_period ? e.jsxs("span", {className: "inline-flex items-center gap-1 font-500", children: [e.jsx("span", {className: "text-foreground font-600", children: "Horizon:"}), " ", c.research_period]}) : null,
            e.jsx("span", {className: "text-muted-foreground/40", children: "•"}),
            e.jsx("span", {className: "font-mono text-[11px] text-muted-foreground", children: "Harris Matrix Sequence · IntCal20 Calibrated"})
          ]})
        ]}),
        e.jsxs("button", {
          onClick: () => { if (typeof o === "function") o("default"); },
          className: "inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-background hover:bg-muted text-xs font-500 text-foreground transition-all shrink-0 self-start md:self-center shadow-xs",
          children: ["← Return to Researcher Portal"]
        })
      ]}),

      // 6-Tool Archaeological Domain Action Grid
      e.jsxs("div", {className: "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5", children: [
        e.jsxs(r, {to: "/evidence-graph", className: "flex flex-col items-center justify-center p-3 rounded-xl border border-border bg-card hover:border-primary hover:bg-primary/5 transition-all text-center group", children: [
          e.jsx(I, {className: "w-5 h-5 text-primary mb-1 group-hover:scale-110 transition-transform"}),
          e.jsx("span", {className: "text-xs font-600 text-foreground", children: "Evidence Graph"}),
          e.jsx("span", {className: "text-[10px] text-muted-foreground", children: n.length + " links · " + contradictingEv.length + " disputes"})
        ]}),
        e.jsxs(r, {to: "/chronology", className: "flex flex-col items-center justify-center p-3 rounded-xl border border-border bg-card hover:border-chart-5 hover:bg-chart-5/5 transition-all text-center group", children: [
          e.jsx(q, {className: "w-5 h-5 text-chart-5 mb-1 group-hover:scale-110 transition-transform"}),
          e.jsx("span", {className: "text-xs font-600 text-foreground", children: "Stratigraphy & Matrix"}),
          e.jsx("span", {className: "text-[10px] text-muted-foreground", children: "Harris sequence"})
        ]}),
        e.jsxs(r, {to: "/artifacts", className: "flex flex-col items-center justify-center p-3 rounded-xl border border-border bg-card hover:border-chart-4 hover:bg-chart-4/5 transition-all text-center group", children: [
          e.jsx(K, {className: "w-5 h-5 text-chart-4 mb-1 group-hover:scale-110 transition-transform"}),
          e.jsx("span", {className: "text-xs font-600 text-foreground", children: "Finds & Typology"}),
          e.jsx("span", {className: "text-[10px] text-muted-foreground", children: D.length + " catalogued finds"})
        ]}),
        e.jsxs(r, {to: "/sites", className: "flex flex-col items-center justify-center p-3 rounded-xl border border-border bg-card hover:border-chart-2 hover:bg-chart-2/5 transition-all text-center group", children: [
          e.jsx(J, {className: "w-5 h-5 text-chart-2 mb-1 group-hover:scale-110 transition-transform"}),
          e.jsx("span", {className: "text-xs font-600 text-foreground", children: "Excavation Sites"}),
          e.jsx("span", {className: "text-[10px] text-muted-foreground", children: T.length + " surveyed ports/mounds"})
        ]}),
        e.jsxs(r, {to: "/ai-research", className: "flex flex-col items-center justify-center p-3 rounded-xl border border-border bg-card hover:border-accent hover:bg-accent/5 transition-all text-center group", children: [
          e.jsx(d, {className: "w-5 h-5 text-accent mb-1 group-hover:scale-110 transition-transform"}),
          e.jsx("span", {className: "text-xs font-600 text-foreground", children: "Dialectic AI"}),
          e.jsx("span", {className: "text-[10px] text-muted-foreground", children: "Hypothesis verification"})
        ]}),
        e.jsxs(r, {to: "/library", className: "flex flex-col items-center justify-center p-3 rounded-xl border border-border bg-card hover:border-primary hover:bg-primary/5 transition-all text-center group", children: [
          e.jsx(R, {className: "w-5 h-5 text-primary mb-1 group-hover:scale-110 transition-transform"}),
          e.jsx("span", {className: "text-xs font-600 text-foreground", children: "Field Reports & Sources"}),
          e.jsx("span", {className: "text-[10px] text-muted-foreground", children: g.length + " monographs & papers"})
        ]})
      ]})
    ]}),

    // Project Empirical Assemblage Metrics
    e.jsxs("div", {className: "grid grid-cols-2 lg:grid-cols-4 gap-3", children: [
      e.jsxs(r, {to: "/artifacts", className: "rounded-xl border border-border bg-card p-4 hover:border-primary/40 transition-all", children: [
        e.jsxs("div", {className: "flex items-center justify-between", children: [
          e.jsx(K, {className: "w-5 h-5 text-chart-4"}),
          e.jsx(S, {className: "w-4 h-4 text-muted-foreground"})
        ]}),
        e.jsx("div", {className: "mt-3 font-display text-3xl font-600 text-foreground", children: D.length}),
        e.jsx("div", {className: "text-xs text-muted-foreground mt-0.5", children: "Catalogued Artifacts (NBPW, Coins, Seals)"})
      ]}),
      e.jsxs(r, {to: "/sites", className: "rounded-xl border border-border bg-card p-4 hover:border-primary/40 transition-all", children: [
        e.jsxs("div", {className: "flex items-center justify-between", children: [
          e.jsx(J, {className: "w-5 h-5 text-chart-2"}),
          e.jsx(S, {className: "w-4 h-4 text-muted-foreground"})
        ]}),
        e.jsx("div", {className: "mt-3 font-display text-3xl font-600 text-foreground", children: T.length}),
        e.jsx("div", {className: "text-xs text-muted-foreground mt-0.5", children: "Surveyed Sites & Estuarine Ports"})
      ]}),
      e.jsxs(r, {to: "/library", className: "rounded-xl border border-border bg-card p-4 hover:border-primary/40 transition-all", children: [
        e.jsxs("div", {className: "flex items-center justify-between", children: [
          e.jsx(R, {className: "w-5 h-5 text-accent"}),
          e.jsx(S, {className: "w-4 h-4 text-muted-foreground"})
        ]}),
        e.jsx("div", {className: "mt-3 font-display text-3xl font-600 text-foreground", children: g.length}),
        e.jsx("div", {className: "text-xs text-muted-foreground mt-0.5", children: "Primary Excavation Monographs"})
      ]}),
      e.jsxs(r, {to: "/claims", className: "rounded-xl border border-border bg-card p-4 hover:border-primary/40 transition-all", children: [
        e.jsxs("div", {className: "flex items-center justify-between", children: [
          e.jsx(E, {className: "w-5 h-5 text-chart-3"}),
          e.jsx(S, {className: "w-4 h-4 text-muted-foreground"})
        ]}),
        e.jsx("div", {className: "mt-3 font-display text-3xl font-600 text-foreground", children: l.length}),
        e.jsx("div", {className: "text-xs text-muted-foreground mt-0.5", children: "Empirical Stratigraphic Claims"})
      ]})
    ]}),

    // Contradictions & Disputed Hypotheses in this Project
    e.jsxs("div", {className: "rounded-2xl border border-border bg-card p-6 shadow-xs", children: [
      e.jsxs("div", {className: "flex items-center justify-between mb-4", children: [
        e.jsxs("div", {className: "flex items-center gap-2", children: [
          e.jsx(V, {className: "w-4 h-4 text-chart-4"}),
          e.jsx("h2", {className: "font-display text-base font-600 text-foreground", children: "Active Archaeological Disputes & Contradictions"}),
          e.jsx("span", {className: "text-[11px] font-600 px-2 py-0.5 rounded-full bg-chart-4/15 text-chart-4", children: claimsWithDispute.length + " Disputed Claims"})
        ]}),
        e.jsxs(r, {to: "/evidence-graph", className: "text-xs font-500 text-primary hover:underline inline-flex items-center gap-1", children: ["Open Evidence Graph", e.jsx(S, {className: "w-3 h-3"})]})
      ]}),
      claimsWithDispute.length === 0 ? e.jsxs("div", {className: "py-6 text-center text-xs text-muted-foreground flex items-center justify-center gap-2", children: [
        e.jsx(Y, {className: "w-4 h-4 text-accent"}),
        "No conflicting claims recorded in this project."
      ]}) : e.jsx("div", {className: "space-y-2.5", children: claimsWithDispute.slice(0, 4).map(claim => {
        return e.jsxs("div", {key: claim.id, className: "rounded-xl border border-border bg-muted/20 p-4 flex flex-col md:flex-row md:items-center justify-between gap-3", children: [
          e.jsxs("div", {className: "space-y-1", children: [
            e.jsx("div", {className: "text-sm font-600 text-foreground", children: claim.claim_text}),
            e.jsxs("div", {className: "text-xs text-muted-foreground flex items-center gap-2", children: [
              e.jsx("span", {className: "text-destructive font-500", children: "Contradictory evidence present"}),
              e.jsx("span", {children: "•"}),
              e.jsx("span", {children: "Category: " + (claim.category || "Stratigraphic Dating")})
            ]})
          ]}),
          e.jsxs(r, {to: "/claims/" + claim.id, className: "inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border bg-background hover:bg-muted text-xs font-500 text-foreground transition-all shrink-0 self-start md:self-center shadow-xs", children: [
            "Audit Dispute",
            e.jsx(S, {className: "w-3 h-3"})
          ]})
        ]});
      })})
    ]}),

    // Project Fieldnotes & Recent Sources Grid
    e.jsxs("div", {className: "grid lg:grid-cols-2 gap-6", children: [
      // Primary Sources
      e.jsxs("div", {className: "rounded-2xl border border-border bg-card p-6 shadow-xs", children: [
        e.jsxs("div", {className: "flex items-center justify-between mb-4 border-b border-border pb-3", children: [
          e.jsxs("div", {className: "flex items-center gap-2", children: [
            e.jsx(R, {className: "w-4 h-4 text-accent"}),
            e.jsx("h2", {className: "font-display text-base font-600 text-foreground", children: "Excavation Monographs & Field Reports"})
          ]}),
          e.jsx(r, {to: "/library", className: "text-xs font-500 text-primary hover:underline", children: "View All (" + g.length + ")"})
        ]}),
        g.length === 0 ? e.jsx("p", {className: "text-xs text-muted-foreground py-6 text-center", children: "No sources catalogued in this project."}) : e.jsx("div", {className: "space-y-2.5", children: g.slice(0, 4).map(s => {
          return e.jsxs(r, {key: s.id, to: "/library/" + s.id, className: "block group rounded-lg p-2 hover:bg-muted/40 transition-colors", children: [
            e.jsx("div", {className: "text-xs font-600 text-foreground group-hover:text-primary truncate", children: s.title}),
            e.jsxs("div", {className: "text-[11px] text-muted-foreground truncate mt-0.5", children: [
              s.author || "ASI Survey",
              s.year ? " · " + s.year : "",
              s.source_type ? " · " + s.source_type : ""
            ]})
          ]});
        })})
      ]}),

      // Trench Notes
      e.jsxs("div", {className: "rounded-2xl border border-border bg-card p-6 shadow-xs", children: [
        e.jsxs("div", {className: "flex items-center justify-between mb-4 border-b border-border pb-3", children: [
          e.jsxs("div", {className: "flex items-center gap-2", children: [
            e.jsx(C, {className: "w-4 h-4 text-chart-5"}),
            e.jsx("h2", {className: "font-display text-base font-600 text-foreground", children: "Trench Fieldnotes & Stratigraphic Logs"})
          ]}),
          e.jsx(r, {to: "/notes", className: "text-xs font-500 text-primary hover:underline", children: "View All (" + $.length + ")"})
        ]}),
        $.length === 0 ? e.jsx("p", {className: "text-xs text-muted-foreground py-6 text-center", children: "No trench notes recorded in this project."}) : e.jsx("div", {className: "space-y-2.5", children: $.slice(0, 4).map(n => {
          return e.jsxs(r, {key: n.id, to: "/notes?focus=" + n.id, className: "block group rounded-lg p-2 hover:bg-muted/40 transition-colors", children: [
            e.jsx("div", {className: "text-xs font-600 text-foreground group-hover:text-primary truncate", children: n.title}),
            e.jsx("div", {className: "text-[11px] text-muted-foreground truncate mt-0.5", children: (n.content || "").replace(/<[^>]+>/g, "").slice(0, 90)})
          ]});
        })})
      ]})
    ]})
  ]});
}`;

const fullNewCode = imports + "\n\n" + newFunction + "\n\nexport{ge as default};\n";
fs.writeFileSync(targetFile, fullNewCode, 'utf8');
console.log("Successfully wrote decoupled two-tier dashboard!");
