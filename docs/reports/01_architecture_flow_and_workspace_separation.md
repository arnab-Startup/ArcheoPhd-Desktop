# Issue Report 01: Conflation of Personal Researcher Dashboard and Project Research Workstation

**Severity**: High  
**Category**: Software Architecture & Archaeological User Experience  
**Status**: Open / In Review  
**Date**: November 2026  

---

## 1. Executive Summary

In the current ArchaeoPhD workstation architecture, the top-level route `/dashboard` serves simultaneously as the personal researcher portal (global researcher profile, cross-project activity, thesis progress) and the active project's operational dashboard. 

When a user clicks on a specific research project card (such as *Early Historic to Early Medieval Bengal: Chandraketugarh Excavation, Stratigraphy, and Maritime Trade Networks (c. 600 BCE – 1250 CE)*), the system simply updates the active project identifier and routes to `/dashboard`. Because `/dashboard` presents the same generic layout regardless of whether a project is opened, researchers experience cognitive dissonance, feeling as though "clicking on this does not open any page."

From an archaeological domain perspective, this conflation violates the fundamental distinction between the **Researcher's Doctoral Administrative Dossier** and an **Excavation Project Archive**.

---

## 2. Archaeological Epistemological Analysis

### 2.1 The Two Disjoint Contexts
In academic archaeology, two mental models must remain completely decoupled:

1. **The Researcher / Principal Investigator Context**:
   - Manages personal grants, supervisor feedback, PhD thesis chapter progression, publication pipelines, permits, and cross-assemblage comparative literature.
   - Requires portfolio-level visibility over multiple excavations and regional surveys.

2. **The Archaeological Assemblage Context**:
   - Represents an empirical, geographically bounded excavation archive (e.g., lower Bengal delta, Chandraketugarh mound complex, 600 BCE – 1250 CE).
   - Governed by strict laws of stratigraphic succession, trench-specific taphonomy, site coordinates, and diagnostic material culture.
   - Demands dedicated stratigraphic matrices (Harris DAG), localized contradiction detectors, and project-specific evidence graphs.

### 2.2 Impact of Current Conflation
- When an archaeologist enters an excavation project, they expect to enter a dedicated virtual trench workstation with localized stratigraphic depth controls, site sector filters, and material culture catalogs.
- Showing global researcher stats alongside localized excavation claims muddles the boundary between personal notes and empirical field data.

---

## 3. Technical Root Cause

### 3.1 Routing Topology
The routing configuration in `index-CAm4ELM4.js` does not provide an isolated project workspace container:

```javascript
// Existing Route Structure
/dashboard          -> Shared Dashboard Component
/projects           -> Project Listing
/projects/new       -> Creation Form
// MISSING: /projects/:id or /workspace/:id
```

### 3.2 Navigation Handler in Project Cards
In `Projects-DhMOSLrW.js`:

```javascript
const l = s => {
  setActive(s);
  navigate("/dashboard");
};
```

When `/projects` executes `navigate("/dashboard")`, the destination component `Dashboard-W5Q9sdSC.js` renders the identical layout as before, merely swapping the text in `subtitle: c.title`. The researcher does not perceive that a distinct project environment has been opened.

---

## 4. Proposed Architectural Resolution

### 4.1 Introduction of `/workspace/:id` Route
Split the application layout into two clearly separated tiers:

```
Tier 1: Global Researcher Portal (/dashboard)
├── Doctoral Dissertation Tracker
├── Multi-Project Portfolio Carousel
├── Global Document Ingestion Queue
└── Workstation AI Engine & Model Settings

Tier 2: Dedicated Archaeological Project Workstation (/workspace/:id)
├── Project Header: Title, Horizon (600 BCE - 1250 CE), Geographic Bounds (Deltaic Coordinates)
├── Tabbed Domain Navigation:
│   ├── Stratigraphic Harris Matrix (Layers 1 to 7)
│   ├── Material Typology (Terracottas, Coins, Rouletted Ware, Seals)
│   ├── Evidence & Contradiction Graph
│   └── Empirical Claim Verification Matrix
└── Scoped Trench Notes & Sector Logs
```

### 4.2 Breadcrumb and Environment Switching
Provide clear visual cues whenever a project workspace is active:
- Breadcrumb: `Projects > Chandraketugarh (c. 600 BCE – 1250 CE) > Evidence Graph`
- Workspace context badge indicating isolation mode and active stratigraphic filter.
