# Issue Report 14: Visualization Center Static Teaser Deadlock and Workbench Fragmentation

**Severity**: High  
**Category**: Visualization Dashboard & Workflow Ergonomics  
**Status**: Architectural Analysis & Roadmap  
**Date**: November 2026  

---

## 1. Executive Summary

In the current ArchaeoPhD workstation, navigating to the **Visualization Center** (`/visualizations` / `VisualizationCenter--gEiW6Ev.js`) presents tabbed navigation headers for the primary visual instruments:
- Evidence Graph (`/evidence-graph`)
- Argument Graph (`/argument-builder`)
- Literature Graph (`/literature-graph`)
- Chronology Engine (`/chronology`)
- Sites Map (`/research-map`)
- Research Analytics (`embedded: true`)

However, selecting any tab other than "Analytics" does not render the visualization. Instead, the user is presented with a static placeholder card displaying an icon, a short paragraph, and an **"Open full view ->"** navigation button.

```javascript
// Excerpt from VisualizationCenter--gEiW6Ev.js:
s === "analytics" ? e.jsx(w, { embedded: !0 }) : e.jsx("div", {
  className: "rounded-xl border border-border bg-card p-8",
  children: e.jsxs("div", {
    className: "flex items-start gap-4",
    children: [
      /* Icon Box */
      /* Title & Description */
      e.jsxs(j, {
        to: l?.to,
        className: "inline-flex items-center gap-2 mt-4 h-10 px-4 rounded-lg bg-primary text-primary-foreground",
        children: ["Open full view ", e.jsx(k, { className: "w-4 h-4" })]
      })
    ]
  })
})
```

This architectural pattern creates a **"Teaser Deadlock"** that degrades researcher productivity by forcing repetitive, context-destroying page hops rather than providing an integrated visual workbench.

---

## 2. Archaeological Research Impact

1. **Analytical Context Severance**:
   An archaeological researcher investigating the transition between Maurya-Sunga and Kushana periods at Chandraketugarh needs to cross-examine chronological dates, stratigraphic matrix layers, and ceramic spatial distributions simultaneously. Having each tool isolated on a separate sub-route with full page reloads forces the researcher to repeatedly re-enter filter states, re-orient camera zoom, and mentally reconstruct correlations.

2. **False Dashboard Promise**:
   In software design, a "Visualization Center" implies a multi-panel workspace or configurable dashboard where instruments can be viewed side-by-side or swapped within an active canvas. Rendering static text cards with redirection buttons transforms what should be the workstation's core analytical cockpit into an unnecessary secondary index.

3. **Sub-Route Navigation Hazards**:
   As documented in Report 13, navigating across multiple virtual sub-routes in WebView2 without server-side routing increases exposure to reload anomalies and browser history lockup.

---

## 3. Forensic Code Diagnosis

In `VisualizationCenter--gEiW6Ev.js`:
- Only `ResearchAnalytics` (`w`) accepts an `embedded: true` prop:
  ```javascript
  import w from "./ResearchAnalytics-BdFd-JJM.js";
  ```
- `EvidenceGraph`, `Chronology`, `ResearchMap`, and `LiteratureGraph` are not imported or instantiated within the Visualization Center bundle.
- Instead, the component uses lightweight descriptor objects:
  ```javascript
  const a = [
    { key: "evidence", label: "Evidence Graph", icon: u, to: "/evidence-graph", desc: "..." },
    { key: "argument", label: "Argument Graph", icon: b, to: "/argument-builder", desc: "..." },
    { key: "literature", label: "Literature Graph", icon: f, to: "/literature-graph", desc: "..." },
    { key: "chronology", label: "Chronology", icon: g, to: "/chronology", desc: "..." },
    { key: "map", label: "Sites Map", icon: y, to: "/research-map", desc: "..." }
  ];
  ```
- This reveals that the Visualization Center was constructed as a static hub rather than an active multi-view canvas container.

---

## 4. Proposed Architectural Resolution

1. **Modular Embedded Canvas Container**:
   Refactor `VisualizationCenter` to dynamically lazy-load and embed each instrument directly inside a responsive canvas viewport:
   ```javascript
   function EmbeddedVisualizationViewport({ activeKey, projectId }) {
     switch (activeKey) {
       case "evidence":
         return <EvidenceGraphCanvas embedded={true} projectId={projectId} />;
       case "chronology":
         return <ChronologyTimeline embedded={true} projectId={projectId} />;
       case "map":
         return <ResearchMapCanvas embedded={true} projectId={projectId} />;
       case "analytics":
       default:
         return <ResearchAnalytics embedded={true} projectId={projectId} />;
     }
   }
   ```

2. **Split-Screen Comparative Mode**:
   Enable dual-viewport mode allowing a doctoral researcher to display the **Harris Stratigraphic Matrix** on the left and the **Bayesian Chronology Curve** on the right, synchronized by excavation context ID.
