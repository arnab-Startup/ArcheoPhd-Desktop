# Issue Report 06: Monolithic Graph & Typology Representation Across Heterogeneous Archaeological Paradigms

**Severity**: Medium / Strategic  
**Category**: Domain Modeling & Information Architecture  
**Status**: Open / Architectural Roadmap  
**Date**: November 2026  

---

## 1. Executive Summary

Archaeological sub-disciplines operate under fundamentally distinct theoretical frameworks and empirical recording conventions. Currently, ArchaeoPhD provides a single, uniform Evidence Graph and Archaeological Matrix view regardless of the site type, cultural horizon, or taphonomic environment of the project.

A deltaic estuarine trading emporium (e.g., Early Historic Bengal: Chandraketugarh, Tamluk) is forced into the exact same node-link schema as a multi-tier tell site with massive mudbrick rebuilds (e.g., Harappan or Near Eastern stratigraphy) or an open-air Paleolithic knapping station. This lack of domain-tailored visual vocabulary limits the depth and utility of the workstation for specialized archaeological research.

---

## 2. Archaeological Epistemological Breakdown

### 2.1 The Bengal Estuarine Paradigm (Chandraketugarh / Lower Delta)
- **Primary Physical Reality**: Deep alluvial silt deposition, tidal fluctuation, shifting river palaeochannels (Vidyadhari river system), high seasonal salinity.
- **Critical Features**:
  - Intrusive ring-well shafts cutting through earlier Mauryan/Pre-Mauryan strata.
  - Monumental cruciform polygonal brick temples (Khana-Mihirer Dhipi, Sarvatobhadra layout) with re-entrant angles.
  - Epigraphic maritime seals with bilingual Kharosthi-Brahmi script.
- **Required Visual Paradigm**:
  - **Riverine Network Flow Graph**: Connecting estuarine landings (Noongola, Hadipur) to open-sea transshipment hubs (Tamralipta) and maritime routes across the Bay of Bengal.
  - **Intrusive Feature Highlighting**: Explicit visual flags in the stratigraphy tree for ring-well intrusion pits that create taphonomic anomalies (e.g., Kushana Rouletted Ware found in Layer 6).

### 2.2 The Urban Tell / Stratigraphic Sequence Paradigm
- **Primary Physical Reality**: Superimposed architectural horizons, mudbrick decay, destruction and burnt layers.
- **Required Visual Paradigm**:
  - **Rigorous Harris Matrix DAG**: Clear temporal phases with "earlier than," "later than," and "contemporary with" topological constraints.
  - Architectural phase overlays showing wall rebuilds over earlier foundation trenches.

### 2.3 The Lithic & Prehistoric Paradigm
- **Primary Physical Reality**: Flaked stone debitage, core reduction strategies, raw material sourcing.
- **Required Visual Paradigm**:
  - **Chaîne Opératoire Decision Trees**: Modeling stages from raw nodule acquisition to finished biface/bladelet to discard.
  - Spatial catchment and raw material distance-decay graphs.

---

## 3. Current Limitations in the Codebase

1. **Uniform Graph Node Schema**:
   `EvidenceGraph-Cu3n-egu.js` renders all entities (Source, Claim, Site, Artifact, Evidence) using uniform circles and standard color codes, without domain-specific glyphs (e.g., no distinct visual indicators for coins, sealings, architectural corner bricks, or intrusive cuts).
2. **Missing Sub-discipline Profile Selector**:
   When creating or editing a project (`CreateProject-CN7WyzuW.js`), the form captures text fields for `research_region` and `research_period`, but does not configure the project's **Methodological Paradigm** (e.g., *Estuarine/Maritime Port*, *Multi-Period Tell*, *Epigraphic/Numismatic Corpus*, *Lithic Survey*).

---

## 4. Proposed Architectural Enhancement

1. **Project Typology & Paradigm Configuration**:
   Allow each project to declare its primary archaeological archetype in `ResearchProject.paradigm`:
   - `estuarine_maritime` (Delta, port network, alluvial taphonomy)
   - `urban_stratigraphic_tell` (Deep architectural sequence, Harris DAG)
   - `epigraphic_numismatic` (Inscriptions, coin hoards, paleographic seriations)
   - `prehistoric_lithic` (Reduction sequence, raw material provenance)

2. **Adaptive Visualization Modes**:
   - In `estuarine_maritime` projects, the Evidence Graph highlights palaeochannel connectivity and estuarine landing sites.
   - In `urban_stratigraphic_tell` projects, the primary view emphasizes the Harris Matrix topological sequence.

3. **Domain-Specific Metric Cards**:
   Instead of generic entity counts, display domain-relevant indicators:
   - For Bengal Early Historic: Maritime connectivity index, Preservation triage count for salinity efflorescence, Chronological consensus ratio on the NBPW transition.
