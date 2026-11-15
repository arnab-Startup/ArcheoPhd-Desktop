# Issue Report 10: Absence of Fordian Seriation & Ceramic Assemblage Frequency Graphs ("Battleship Curves")

**Severity**: Medium  
**Category**: Artifact Typology & Quantitative Seriation  
**Status**: Open / Architectural Roadmap  
**Date**: November 2026  

---

## 1. Executive Summary

Archaeological artifact assemblages are defined by relative quantitative frequency shifts across strata. Currently, ArchaeoPhD's visualization dashboard displays artifact metrics using generic business bar charts (e.g., *"18 Artifacts"*, *"30 Sources"*).

Archaeologists do not analyze diagnostic material culture through flat count cards. The foundational analytical method for material culture turnover is **Fordian Seriation (James A. Ford, 1962)**, which renders lenticular frequency graphs ("battleship curves"). By omitting seriation curves, the dashboard cannot illustrate the transition, peak adoption, or decline of pottery fabrics and diagnostic finds.

---

## 2. Archaeological Epistemological Breakdown

### 2.1 The Principle of Seriation
No ceramic fabric or diagnostic artifact type appears or disappears overnight. A diagnostic style follows a normal lenticular curve:
1. **Introduction**: Sparse presence in early layers ($< 5\%$).
2. **Horizon Peak (Floruit)**: Rapid adoption and dominance in the assemblage ($40\% - 70\%$).
3. **Decline and Obsolescence**: Gradual displacement by newer technology ($< 5\%$).

### 2.2 Lower Bengal Ceramic Horizon Sequence
At Chandraketugarh, Tamluk, and Mangalkot, regional chronology is anchored to ceramic seriation:
- **Phase I (c. 600–300 BCE)**: Black-and-Red Ware (BRW) dominates; early Northern Black Polished Ware (NBPW) appears in small quantities.
- **Phase II (c. 300–100 BCE - Mauryan / Early Sunga)**: NBPW hits peak frequency alongside fine grey ware with stamped impressions.
- **Phase III (c. 100 BCE – 200 CE - Kushana)**: NBPW declines and disappears; Rouletted Ware, Grey Ware stamped with maritime boats, and red polished sprinklers dominate.
- **Phase IV (c. 200–600 CE - Gupta)**: Dull red ware, moulded terracotta plaques, and coarse micaceous stamped bowls dominate.

---

## 3. Current Limitations in the Codebase

1. In `desktop/dist/assets/Artifacts-DiTpKEte.js` and `VisualizationCenter--gEiW6Ev.js`, artifacts are displayed in a flat card grid with categorical filters (`Ceramics`, `Terracotta`, `Coins`, `Seals`).
2. There is zero quantitative correlation between artifact counts and their excavated stratigraphic layers.
3. A researcher cannot visually determine whether Rouletted Ware co-occurred with early NBPW or whether their distributions were mutually exclusive.

---

## 4. Technical Requirements for Resolution

1. **Battleship Seriation Component**:
   Implement a symmetrical horizontal frequency area chart (Fordian seriation graph) plotting stratigraphic units / phases on the vertical axis against percentage shares of ceramic types on the horizontal axis.
2. **Contextual Co-occurrence Matrix**:
   Render a correlation matrix showing which diagnostic artifact types share primary depositional context within the same excavated stratigraphic units.
