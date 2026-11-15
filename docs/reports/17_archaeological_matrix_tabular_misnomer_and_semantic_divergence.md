# Issue Report 17: Archaeological Matrix Tabular Misnomer and Semantic Divergence

**Severity**: High  
**Category**: Domain Nomenclature & Visual Ergonomics  
**Status**: Architectural Analysis & Roadmap  
**Date**: November 2026  

---

## 1. Executive Summary

In `desktop/dist/assets/ArchaeologicalMatrix-DZPWDBeg.js`, the component titled **"Archaeological Matrix"** (`/archaeological-matrix`) is implemented as an HTML table with client-side text filtering and CSV export:

```javascript
// Excerpt from ArchaeologicalMatrix-DZPWDBeg.js:
const o = [
  { key: "site", label: "Site" },
  { key: "region", label: "Region" },
  { key: "period", label: "Period" },
  { key: "artifact", label: "Artifact" },
  { key: "material", label: "Material" },
  { key: "dating_method", label: "Dating Method" },
  { key: "date_range", label: "Date Range" },
  { key: "source", label: "Source" },
  { key: "interpretation", label: "Interpretation" },
  { key: "notes", label: "Notes" }
];
// ...
return t.jsxs("div", {
  children: [
    t.jsx(L, { title: "Archaeological Matrix", subtitle: m?.title, icon: I }),
    t.jsx("p", { children: "A customizable research matrix across sites, artifacts, dating evidence and interpretations." }),
    /* HTML table with column sorting */
  ]
});
```

To any archaeologist, field director, or doctoral candidate, the phrase **"Archaeological Matrix"** refers to the **Harris Matrix**—the definitive topological diagram invented by Edward C. Harris (1979) to represent physical superposition and the temporal stratigraphic sequence of an excavation site.

Presenting an attribute table under the title "Archaeological Matrix" causes severe semantic confusion, degrades credibility, and leaves the actual need for a topological Harris Matrix unaddressed.

---

## 2. Archaeological Epistemological Failure Modes

1. **Domain Nomenclature Violation**:
   An attribute spreadsheet of artifacts and sites is known in archaeological methodology as a **Finds Register**, **Context Sheet Inventory**, or **Site-Artifact Concordance**. Naming this table an "Archaeological Matrix" creates false expectations.

2. **Absence of Contextual Stratigraphic Linkage**:
   The table aggregates data across heterogeneous axes (Site, Region, Period, Artifact) without linking each entry to its underlying **Stratigraphic Unit (SU)** or **Context Locus**. An artifact without its context number (e.g. *Trench 2, Locus 104, sealed under Floor 3*) loses its primary scientific provenance.

3. **Inability to Trace Stratigraphic Relationships**:
   In archaeological fieldwork, stratigraphic relationships are defined by topological operators:
   - $A \text{ is above } B$
   - $A \text{ is below } B$
   - $A \text{ cuts } B$ (intrusive feature)
   - $A \text{ is equivalent to } B$
   The table contains zero topological operator columns and zero capability to compute chronological sequence from physical superposition.

---

## 3. Proposed Architectural Resolution

1. **Semantic Relabeling**:
   Rename `/archaeological-matrix` from "Archaeological Matrix" to **"Research Registry & Concordance"** (or "Stratigraphic Finds Register"), accurately describing its function as a multi-criteria attribute table.

2. **Dedicated Harris Matrix Canvas**:
   Introduce a true **Stratigraphic Harris Matrix Engine** (as architected in Report 08) accessible at `/harris-matrix`:
   - Interactive DAG with context boxes representing Stratigraphic Units (layers, cuts, structures).
   - Automatic transitive reduction of redundant physical edges.
   - Intrusive feature rendering (pits, ring wells, robber trenches).

3. **Bidirectional Registry-to-Matrix Cross-Filtering**:
   Clicking an artifact or site row in the Registry highlights its exact Stratigraphic Unit node in the Harris Matrix DAG, preserving the unbreakable link between artifactual typology and stratigraphic superposition.
