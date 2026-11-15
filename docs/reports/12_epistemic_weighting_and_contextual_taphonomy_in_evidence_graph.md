# Issue Report 12: Epistemic Weight Equivalence in the Evidence Graph (Taphonomic & Contextual Bias)

**Severity**: High  
**Category**: Evidence Traceability & Epistemological Modeling  
**Status**: Open / Architectural Roadmap  
**Date**: November 2026  

---

## 1. Executive Summary

In `EvidenceGraph-Cu3n-egu.js`, all nodes (Sources, Claims, Sites, Artifacts, Evidence links) are rendered with uniform geometric shape, size, and visual weight. 

In scientific archaeology, an empirical observation's credibility is strictly determined by its **stratigraphic taphonomy and contextual provenance**. Treating an in-situ sealed archaeological stratum find identically to an unstratified surface purchase distorts the dialectic contradiction engine and produces unscientific historical conclusions.

---

## 2. Archaeological Epistemological Breakdown

### 2.1 The Spectrum of Depositional Context
1. **Primary Context (In-Situ Sealed Stratum)**:
   - An artifact found sealed directly beneath an intact, unbroken rammed lime-surki floor or burnt destruction layer.
   - Example: A Kharosthi-Brahmi inscribed seal found in Trench C-4, Stratum 4 (sealed by Layer 3 floor).
   - **Epistemic Weight**: High ($w \approx 0.95$). Crucial chronological anchor.
2. **Secondary Context (Fill / Disturbed Redeposition)**:
   - An artifact excavated from redeposited mud rampart core or ditch backfill.
   - Example: A Mauryan cast coin found inside the Gupta-era brick rampart core of Khana-Mihir mound.
   - **Epistemic Weight**: Moderate ($w \approx 0.50$). Provides *terminus post quem* for the rampart, but does not date the rampart itself.
3. **Tertiary Context (Unstratified Surface Find / Antiquarian Purchase)**:
   - An artifact ploughed up by local farmers in an agricultural field or acquired through private art collectors.
   - Example: Terracotta plaques from Chandraketugarh bought in antique markets without trench or depth provenance.
   - **Epistemic Weight**: Low ($w \approx 0.20$). Provides stylistic typology, but cannot be used to date stratigraphic layers or resolve chronological disputes.

---

## 3. Current Limitations in the Codebase

1. In `EvidenceGraph-Cu3n-egu.js`, nodes are drawn with uniform circles. The contradiction detection algorithm treats evidence links equally regardless of whether the cited source observed an in-situ sealed stratum or an unprovenanced stray surface find.
2. When evaluating contradictory claims (e.g., *"Chandraketugarh flourished in 600 BCE"* vs. *"Chandraketugarh began in 300 BCE"*), a single unstratified surface radiocarbon date can cancel out a stratified excavation trench report simply because both are treated as equal evidence nodes.

---

## 4. Technical Requirements for Resolution

1. **Contextual Provenance Attribute**:
   Add `stratigraphic_context` field to the `Artifact` and `Evidence` schemas:
   - `in_situ_sealed` (High weight: 1.0)
   - `redeposited_fill` (Medium weight: 0.5)
   - `surface_unstratified` (Low weight: 0.2)
   - `antique_market` (Tainted/Unverified: 0.1)
2. **Weighted Visual Encoding in Evidence Graph**:
   - Primary in-situ nodes: Solid border, larger radius, prominent confidence aura.
   - Surface/Unstratified nodes: Dashed border, translucent fill, reduced radius.
   - Contradiction engine calculations: Weight contradictions using the Bayesian taphonomic factor $w_i$.
