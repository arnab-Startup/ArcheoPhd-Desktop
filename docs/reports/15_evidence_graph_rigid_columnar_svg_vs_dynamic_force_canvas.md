# Issue Report 15: Evidence Graph Rigid Columnar SVG vs. Dynamic Force-Directed Canvas

**Severity**: High  
**Category**: Visualization Dashboard & Graph Epistemology  
**Status**: Architectural Analysis & Roadmap  
**Date**: November 2026  

---

## 1. Executive Summary

The Evidence Graph (`/evidence-graph` / `EvidenceGraph-Cu3n-egu.js`) is intended to be the central epistemological visualization of ArchaeoPhD, demonstrating how empirical sources, excavation contexts, and artifacts substantiate or refute research claims.

However, the graph rendering engine relies on a hardcoded, rigid three-column SVG layout with static coordinates:
- **Claims**: Pinned strictly to horizontal axis $X = 140$, spaced vertically at $Y = 80 + N \times 90$.
- **Evidence Nodes**: Pinned strictly to horizontal axis $X = 440$, spaced vertically at $Y = 60 + N \times 70$.
- **Sources, Sites, Artifacts**: Jammed together in three parallel columns at $X = 780$, $X = 900$, and $X = 1020$, spaced at $Y = 50 + g \times 42$.
- **Edges**: Static cubic bezier curves calculated via `M r o C (r+d)/2 o, (r+d)/2 p, d p`.

```javascript
// Excerpt from EvidenceGraph-Cu3n-egu.js layout engine (K):
const k = 140, j = 440, f = 780;
claims.forEach((s, N) => {
  const t = 80 + N * 90;
  nodes.push({ id: "c-" + s.id, type: "claim", x: k, y: t });
});
evidence.forEach((s, N) => {
  const t = 60 + N * 70;
  nodes.push({ id: "e-" + s.id, type: "evidence", x: j, y: t });
  // Sources at f, Sites at f + 120, Artifacts at f + 240
});
```

---

## 2. Archaeological Impact & Failure Modes

1. **Extreme Vertical Distortion at Excavation Scale**:
   In a moderate excavation project like Chandraketugarh (involving 30 claims, 120 evidence points, 85 catalogued artifacts, and 25 stratigraphic reports):
   - The total canvas height exceeds 8,400 pixels ($120 \times 70$).
   - Claims clustered at the top have bezier edges spanning thousands of pixels down to lower evidence nodes.
   - The rigid SVG canvas becomes a chaotic thicket of overlapping curve lines, making topological relationships completely illegible.

2. **Severe Text Clipping**:
   Node labels are artificially truncated to 24 characters via `J(t.label, 24)`:
   ```javascript
   function J(r, o) {
     return r ? r.length > o ? r.slice(0, o - 1) + "…" : r : "";
   }
   ```
   In archaeology, source citations (e.g. *"Chakrabarti, D.K. 2001. Archaeological Geography of the Ganga Plain"*) or stratigraphic descriptions (e.g. *"Sealed deposit beneath burnt brick floor Level 3"*) are reduced to meaningless fragments like *"Chakrabarti, D.K. 2001.…"*, destroying primary provenance.

3. **Absence of Pan, Zoom, and Physics**:
   The viewport provides only a standard browser scrollbar (`overflow-auto scrollbar-thin`, max height `70vh`). There is no multi-touch pinch-to-zoom, mousewheel zoom, canvas drag-pan, or mini-map overview.

4. **Inability to Form Cluster Paradigms**:
   Archaeological evidence naturally forms clusters around **Stratigraphic Trenches**, **Taphonomic Horizons**, or **Disputed Hypotheses**. The column-based layout destroys semantic clustering by forcing all claims into Column 1, all evidence into Column 2, and all entities into Column 3.

---

## 3. Proposed Architectural Resolution

1. **D3 / WebGL Force-Directed Graph Engine**:
   Replace static coordinate assignment with an active physics simulation (D3 force simulation or Cytoscape.js / PixiJS):
   - **Charge Force**: Prevents node overlap (`d3.forceManyBody().strength(-300)`).
   - **Link Force**: Pulls connected claims and evidence together (`d3.forceLink().distance(80)`).
   - **Cluster Force**: Groups nodes by Excavation Trench, Stratigraphic Phase, or Research Hypothesis.

2. **Semantic Level-of-Detail (LOD) Zoom**:
   - At high zoom ($< 50\%$): Nodes render as compact colored dots with density halos.
   - At medium zoom ($50\% - 150\%$): Display full claim titles, source years, and verification badges.
   - At deep zoom ($> 150\%$): Render full bibliographic citations, excerpt text, confidence weights ($w_i$), and attached artifact micrographs.

3. **Interactive Mini-Map & Viewport Controls**:
   Provide an interactive HUD with reset view, fit-to-screen, search-and-focus, and a persistent thumbnail radar.
